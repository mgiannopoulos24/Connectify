#!/bin/sh
# backend/entrypoint.sh

set -e

# Run database migrations
echo "Running database migrations..."
bin/backend eval "Backend.Release.migrate"

# Run database seeds
# Uncomment the following lines if you want to run seeds on startup
# echo "Running database seeds..."
# bin/backend eval "Backend.Release.seed"

# Start the Phoenix server
echo "Starting Phoenix server..."
exec bin/backend start