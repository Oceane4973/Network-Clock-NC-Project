#!/bin/bash

# Fonction pour vérifier le succès d'une commande
check_success() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

# Clean the project
#echo "Cleaning the project..."
#./gradlew clean
#check_success "Failed to clean the project."

# Build the project
echo "Building the project..."
./gradlew build
check_success "Failed to build the project."

# Configure sudo
echo "Configuring sudo..."
./configure-sudo.sh
check_success "Failed to configure sudo."

# Run the tests
echo "Running the tests..."
./gradlew test
check_success "Failed to run the tests."

# Run the application
echo "Running the application..."
./gradlew run
check_success "Failed to run the application."
