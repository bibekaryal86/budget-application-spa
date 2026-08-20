#!/bin/sh
set -e

node /usr/src/app/backend/dist/server.js &
BACKEND_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

wait -n "$BACKEND_PID" "$NGINX_PID"
exit $?
