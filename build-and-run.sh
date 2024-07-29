#!/bin/bash

# Script to set up and run the Network Clock project.
#
# This script performs the following tasks:
# - Checks for the existence of required configuration files.
# - Generates a random key alias and keystore password.
# - Reads properties from the app configuration file.
# - Creates a user if it does not exist.
# - Generates an SSL keystore if it does not exist.
# - Copies the project directory to a temporary location and adjusts permissions.
# - Updates configuration files with keystore information.
# - Makes necessary scripts executable and configures sudoers for the new user.
# - Stops the systemd-timesyncd service.
# - Cleans, sets up npm, builds, and runs the project using Gradle.
#
# Prerequisites:
# - Java Development Kit (JDK) 11 or higher
# - Node.js and npm
# - Gradle
# - OpenSSL
# - sudo privileges for user creation and file permissions
#
# Usage:
#   ./setup_and_run.sh
#
# Notes:
# - The script expects the presence of "config/app.properties" and "config/server.properties" in the src/main/resources directory.
# - User and script paths are derived from these configuration files.
# - Ensure that the script has appropriate permissions to create users, modify files, and execute commands with sudo.

PROJECT_ROOT=$(pwd)
KEYSTORE_FILE="keystore.jks"
#APP_CONFIG_FILE="src/main/resources/config/app.properties"
SERVER_CONFIG_FILE="src/main/resources/config/server.properties"
TEMP_PROJECT_ROOT="/tmp/network-clock-project"

#if [ ! -f "$APP_CONFIG_FILE" ]; then
#    echo "Configuration file $APP_CONFIG_FILE not found!"
#    exit 1
#fi

KEY_ALIAS=$(openssl rand -base64 12 | tr -d '=+/' | cut -c1-12)
KEYSTORE_PASSWORD=$(openssl rand -base64 32)

#get_property() {
#    grep "^$1=" "$APP_CONFIG_FILE" | cut -d'=' -f2
#}

#USER_NAME=$(get_property "user.name")
#USER_PASSWORD=$(openssl rand -base64 12)

check_success() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

#run_as_new_user() {
#    sudo -u "$USER_NAME" -H sh -c "cd \"$TEMP_PROJECT_ROOT\" && $1"
#    check_success "Failed to execute: $1"
#}

#if id "$USER_NAME" &>/dev/null; then
#    echo "User $USER_NAME already exists. Skipping user creation."
#else
#    echo "Creating user $USER_NAME..."
#    sudo useradd -r -m -p "$(openssl passwd -1 "$USER_PASSWORD")" "$USER_NAME"
#    check_success "Failed to create user $USER_NAME."
#    echo "User $USER_NAME created."
#fi

if [ -f "$KEYSTORE_FILE" ]; then
  rm "$KEYSTORE_FILE"
fi
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "Generating SSL keystore..."
    keytool -genkeypair -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 365 \
        -keystore "$KEYSTORE_FILE" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEYSTORE_PASSWORD" \
        -dname "CN=example.com, OU=IT, O=Example, L=City, ST=State, C=Country"
    check_success "Failed to generate SSL keystore."

    remove_line_if_exists() {
        local file="$1"
        local line="$2"
        grep -v "^$line" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    }

    echo "Updating configuration file with keystore information..."
    remove_line_if_exists "$SERVER_CONFIG_FILE" "ssl.keystore.password="
    remove_line_if_exists "$SERVER_CONFIG_FILE" "ssl.privatekey.password="
    remove_line_if_exists "$SERVER_CONFIG_FILE" "ssl.key.alias="

    echo "ssl.keystore.password=$KEYSTORE_PASSWORD" >> "$SERVER_CONFIG_FILE"
    echo "ssl.privatekey.password=$KEYSTORE_PASSWORD" >> "$SERVER_CONFIG_FILE"
    echo "ssl.key.alias=$KEY_ALIAS" >> "$SERVER_CONFIG_FILE"
fi

echo "Copying project directory to $TEMP_PROJECT_ROOT..."
sudo rm -rf "$TEMP_PROJECT_ROOT"
sudo cp -r "$PROJECT_ROOT" "$TEMP_PROJECT_ROOT"
check_success "Failed to copy the project directory."

#echo "Changing ownership and permissions of the temporary project directory..."
#sudo chown -R "$USER_NAME":"$USER_NAME" "$TEMP_PROJECT_ROOT"
#check_success "Failed to change ownership of the temporary project directory."

#sudo chmod -R 770 "$TEMP_PROJECT_ROOT"
#check_success "Failed to change permissions of the temporary project directory."

ø# Stop time synchronization services
sudo systemctl stop systemd-timesyncd

# Clean the project
echo "Cleaning the project..."
#run_as_new_user "./gradlew clean"
./gradlew clean

echo "Setup npm..."
#run_as_new_user "./gradlew npmInstall"
./gradlew npmInstall

# Build the project
echo "Building the project..."
#run_as_new_user "./gradlew build"
./gradlew build

# Function to set capabilities
set_capabilities() {
    echo "Setting capabilities for the executable..."
    sudo setcap cap_sys_time+ep "$TEMP_PROJECT_ROOT/build/libs/libtime_manager.so"
    check_success "Failed to set capabilities."
}

# Run the application
read -p "Do you want to run the application as sudo? (Y/n): " response
response=${response,,}
if [[ "$response" == "y" || "$response" == "" ]]; then
    set_capabilities
    echo "Running the application with sudo..."
    sudo ./gradlew run
else
    echo "Running the application without sudo..."
    ./gradlew run
fi