#!/bin/bash

PROJECT_ROOT=$(pwd)
KEYSTORE_FILE="keystore.jks"
APP_CONFIG_FILE="src/main/resources/config/app.properties"
SERVER_CONFIG_FILE="src/main/resources/config/server.properties"
TEMP_PROJECT_ROOT="/tmp/network-clock-project"

if [ ! -f "$APP_CONFIG_FILE" ]; then
    echo "Configuration file $APP_CONFIG_FILE not found!"
    exit 1
fi

# Générer des valeurs sécurisées et aléatoires
KEY_ALIAS=$(openssl rand -base64 12 | tr -d '=+/' | cut -c1-12)
KEYSTORE_PASSWORD=$(openssl rand -base64 32)

# Fonction pour récupérer des propriétés du fichier de configuration
get_property() {
    grep "^$1=" "$APP_CONFIG_FILE" | cut -d'=' -f2
}

SCRIPT_PATH=$(get_property "script.path")
USER_NAME=$(get_property "user.name")
USER_PASSWORD="hello" #$(openssl rand -base64 12)

check_success() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

# Fonction pour exécuter une commande en tant que le nouvel utilisateur
run_as_new_user() {
    sudo -u "$USER_NAME" -H sh -c "cd \"$TEMP_PROJECT_ROOT\" && $1"
    check_success "Failed to execute: $1"
}

if id "$USER_NAME" &>/dev/null; then
    echo "User $USER_NAME already exists. Skipping user creation."
else
    echo "Creating user $USER_NAME..."
    sudo useradd -r -m -p "$(openssl passwd -1 "$USER_PASSWORD")" "$USER_NAME"
    check_success "Failed to create user $USER_NAME."
    echo "User $USER_NAME created."
fi

# Générer la clé SSL si le fichier keystore n'existe pas
if [ -f "$KEYSTORE_FILE" ]; then
  rm "$KEYSTORE_FILE"
fi
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "Generating SSL keystore..."
    keytool -genkeypair -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 365 \
        -keystore "$KEYSTORE_FILE" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEYSTORE_PASSWORD" \
        -dname "CN=example.com, OU=IT, O=Example, L=City, ST=State, C=Country"
    check_success "Failed to generate SSL keystore."

    # Fonction pour supprimer une ligne du fichier de configuration si elle existe
    remove_line_if_exists() {
        local file="$1"
        local line="$2"
        grep -v "^$line" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    }

    # Supprimer les informations existantes du keystore dans le fichier de configuration
    echo "Updating configuration file with keystore information..."
    remove_line_if_exists "$SERVER_CONFIG_FILE" "ssl.keystore.password="
    remove_line_if_exists "$SERVER_CONFIG_FILE" "ssl.privatekey.password="
    remove_line_if_exists "$SERVER_CONFIG_FILE" "ssl.key.alias="

    # Ajouter les nouvelles informations du keystore au fichier de configuration
    echo "ssl.keystore.password=$KEYSTORE_PASSWORD" >> "$SERVER_CONFIG_FILE"
    echo "ssl.privatekey.password=$KEYSTORE_PASSWORD" >> "$SERVER_CONFIG_FILE"
    echo "ssl.key.alias=$KEY_ALIAS" >> "$SERVER_CONFIG_FILE"
fi

# Copier le répertoire du projet dans un répertoire temporaire
echo "Copying project directory to $TEMP_PROJECT_ROOT..."
sudo rm -rf "$TEMP_PROJECT_ROOT"
sudo cp -r "$PROJECT_ROOT" "$TEMP_PROJECT_ROOT"
check_success "Failed to copy the project directory."

# Modifier les permissions du répertoire temporaire du projet
echo "Changing ownership and permissions of the temporary project directory..."
sudo chown -R "$USER_NAME":"$USER_NAME" "$TEMP_PROJECT_ROOT"
check_success "Failed to change ownership of the temporary project directory."

sudo chmod -R 770 "$TEMP_PROJECT_ROOT"
check_success "Failed to change permissions of the temporary project directory."

# Assurez-vous que le script est exécutable
echo "Making the script executable..."
sudo chmod +x "$TEMP_PROJECT_ROOT$SCRIPT_PATH"
check_success "Failed to make the script executable."

# Ajouter une entrée sudoers pour permettre à l'utilisateur d'exécuter le script sans mot de passe
SUDOERS_FILE="/etc/sudoers.d/$USER_NAME"
echo "Configuring sudoers..."
if [ -f "$SUDOERS_FILE" ]; then
    echo "Sudoers file already exists. Skipping."
else
    NEW_ABSOLUTE_SCRIPT_PATH="$TEMP_PROJECT_ROOT$SCRIPT_PATH"
    # shellcheck disable=SC2028
    echo -e "$USER_NAME ALL=(ALL) NOPASSWD: /usr/bin/sh $NEW_ABSOLUTE_SCRIPT_PATH * \n$USER_NAME ALL=(ALL) NOPASSWD: /bin/date" | sudo tee "$SUDOERS_FILE" > /dev/null
    check_success "Failed to configure sudoers."
    echo "Sudoers configuration added."
fi

# Stop time synchronization services
sudo systemctl stop systemd-timesyncd

# Clean the project
echo "Cleaning the project..."
run_as_new_user "./gradlew clean"

echo "Setup npm..."
run_as_new_user "./gradlew npmInstall"

# Build the project
echo "Building the project..."
run_as_new_user "./gradlew build"

# Run the tests
#echo "Running the tests..."
#run_as_new_user "./gradlew test"

# Run the application
echo "Running the application..."
run_as_new_user "./gradlew run"

echo "Build and run completed successfully."
