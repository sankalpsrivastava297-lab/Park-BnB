@echo off
echo ==============================================
echo       Starting ParkBnB Servers
echo ==============================================

echo Installing/updating dependencies (downloading Windows binaries)...
call pnpm install

echo Rebuilding native dependencies...
call pnpm rebuild

echo Starting API Server on Port 8080...
start cmd /k "cd /d artifacts\api-server && pnpm run dev"

echo Starting Frontend on Port 18503...
start cmd /k "pnpm --filter @workspace/parkbnb run dev"

echo.
echo Both servers are starting in separate windows!
echo API Server: http://localhost:8080
echo Frontend:   http://localhost:18503
echo.
pause
