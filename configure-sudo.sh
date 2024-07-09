#!/bin/bash

# Variables
PROJECT_ROOT=$(dirname "$0")
SCRIPT_PATH="$PROJECT_ROOT/scripts/set-time.sh"
SUDOERS_FILE="/etc/sudoers.d/network-clock"

# Fonction pour vérifier le succès d'une commande
check_success() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

# Ensure the set-time.sh script is executable
echo "Making set-time.sh executable..."
chmod +x "$SCRIPT_PATH"
check_success "Failed to make set-time.sh executable."

# Add sudoers entry for the set-time.sh script with an absolute path
echo "Configuring sudoers..."
if [ -f "$SUDOERS_FILE" ]; then
    echo "Sudoers file already exists. Skipping."
else
    ABSOLUTE_SCRIPT_PATH=$(realpath "$SCRIPT_PATH")
    echo "Please enter your sudo password to configure sudoers:"
    echo "$USER ALL=(ALL) NOPASSWD: $ABSOLUTE_SCRIPT_PATH" | sudo tee "$SUDOERS_FILE" > /dev/null
    check_success "Failed to configure sudoers."
    echo "Sudoers configuration added."
fi


ABSOLUTE_SCRIPT_PATH=$(realpath "$SCRIPT_PATH")
echo "Please enter your sudo password to configure sudoers:"
echo "$USER ALL=(ALL) NOPASSWD: $ABSOLUTE_SCRIPT_PATH" | sudo tee "$SUDOERS_FILE" > /dev/null
check_success "Failed to configure sudoers."
echo "Sudoers configuration added."