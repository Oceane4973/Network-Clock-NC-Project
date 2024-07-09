#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <time>"
    exit 1
fi

if ! date -d "$1" > /dev/null 2>&1; then
    echo "Invalid date format: $1"
    exit 1
fi

sudo date -s "$1"
