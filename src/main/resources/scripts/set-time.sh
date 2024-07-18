#!/bin/bash

# Script to set the system time.
#
# This script performs the following tasks:
# - Checks if exactly one argument (the time) is provided.
# - Validates the provided date format.
# - Sets the system time using the provided date if it is valid.
#
# Usage:
#   ./script_name.sh <time>
# Example:
#   ./script_name.sh "2024-07-15 12:30:45"
#
# If the provided date format is invalid, the script exits with an error message.
# If the date format is valid, the script uses `sudo` to set the system time.
#
# Note: This script requires appropriate permissions to set the system time.

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <time>"
    exit 1
fi

if ! date -d "$1" > /dev/null 2>&1; then
    echo "Invalid date format: $1"
    exit 1
fi

sudo date -s "$1"