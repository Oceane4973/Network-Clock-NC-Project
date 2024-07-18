#!/bin/bash

# Script to synchronize the system time using ntpd or systemd-timesyncd.
#
# This script performs the following tasks:
# - Checks if the script is run as root.
# - Starts the systemd-timesyncd service if it is available.
# - Defines functions to synchronize time using ntpd or systemd-timesyncd.
# - Chooses the appropriate service based on availability and performs the synchronization.
# - Displays the current system time for verification.
#
# Prerequisites:
# - The script requires root privileges to run.
# - Either ntpd or systemd-timesyncd should be available on the system.
#
# Usage:
#   ./synchronize_time.sh
#
# Notes:
# - If ntpd is not installed, the script will attempt to install it.
# - If neither ntpd nor systemd-timesyncd is available, the script will exit with an error message.

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root"
   exit 1
fi

sudo systemctl start systemd-timesyncd

synchronize_with_ntpd() {
    echo "Synchronizing time with ntpd..."
    if ! command -v ntpd &> /dev/null; then
        echo "ntpd is not installed. Installing ntp..."
        apt-get update && apt-get install -y ntp
    fi

    systemctl restart ntp
    echo "Time synchronization with ntpd completed."
}

synchronize_with_systemd_timesyncd() {
    echo "Synchronizing time with systemd-timesyncd..."
    systemctl enable systemd-timesyncd
    systemctl start systemd-timesyncd

    timedatectl set-ntp true
    systemctl restart systemd-timesyncd
    echo "Time synchronization with systemd-timesyncd completed."
}

if command -v ntpd &> /dev/null; then
    synchronize_with_ntpd
elif command -v systemctl &> /dev/null && systemctl list-units --type=service | grep -q "systemd-timesyncd"; then
    synchronize_with_systemd_timesyncd
else
    echo "No appropriate time synchronization service found. Please install ntpd or systemd-timesyncd."
    exit 1
fi

echo "Current system time:"
date
