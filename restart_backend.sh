#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

echo "========================================"
echo "    LxwyerUp Backend Restarter"
echo "========================================"

# Run the python check script
echo "Checking API Keys..."
python3 check_backend_keys.py
if [ $? -ne 0 ]; then
    echo "❌ API Key check failed. Aborting restart."
    exit 1
fi

echo ""
echo "Stopping existing backend processes..."
# Find and kill the process
pids=$(ps aux | grep "uvicorn backend.main:app" | grep -v grep | awk '{print $2}')
if [ -z "$pids" ]; then
    echo "No running backend found."
else
    echo "Killing processes: $pids"
    echo "$pids" | xargs kill -9
fi

echo ""
echo "Starting backend server..."
# Start in background using nohup or just run it if user wants to see output?
# The user wants "restart", usually implies running it.
# I will run it in background and tail the logs, roughly resembling a restart.
# But since this is a one-shot agent, `run_command` with background might be better.
# However, for a shell script, I'll use nohup.

nohup python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 > backend/main.log 2>&1 &
NEW_PID=$!

echo "Backend started with PID $NEW_PID"
echo "Logs are being written to backend/server.log"
echo "Waiting 5 seconds to ensure startup..."
sleep 5

# Check if it's still running
if ps -p $NEW_PID > /dev/null; then
   echo "✅ Backend is RUNNING."
   echo "Tail of server.log:"
   tail -n 10 backend/server.log
else
   echo "❌ Backend FAILED to start."
   cat backend/server.log
   exit 1
fi

echo "========================================"
