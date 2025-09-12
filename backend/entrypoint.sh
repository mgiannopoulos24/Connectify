#!/bin/sh
# backend/entrypoint.sh

set -e

# Run database migrations
echo "Running database migrations..."
bin/backend eval "Backend.Release.migrate"

# Start the Phoenix server
echo "Starting Phoenix server..."
exec bin/backend start