#!/bin/bash
set -e

# Create /tmp directories for Cloud Run in-memory filesystem
mkdir -p /tmp/metrics /tmp/samples

# Copy metrics files to /tmp if they exist in the image
# Check multiple possible locations (Cloud Run uses /app/data, Docker Compose uses /app/metrics)
if [ -d "/app/data/metrics" ]; then
    cp -r /app/data/metrics/* /tmp/metrics/ 2>/dev/null || true
elif [ -d "/app/metrics" ]; then
    cp -r /app/metrics/* /tmp/metrics/ 2>/dev/null || true
fi

# Copy samples metadata to /tmp if it exists in the image
if [ -d "/app/data/samples" ]; then
    cp -r /app/data/samples/* /tmp/samples/ 2>/dev/null || true
elif [ -d "/app/samples" ]; then
    cp -r /app/samples/* /tmp/samples/ 2>/dev/null || true
fi

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

