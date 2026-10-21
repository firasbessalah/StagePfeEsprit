#!/bin/sh
set -eu

# Render injects RENDER_SERVICE_ID; docker-compose local runs do not.
if [ -n "${RENDER_SERVICE_ID:-}" ] && [ "${BACKEND_HOSTPORT}" = "backend:8080" ]; then
  echo "ERROR: BACKEND_HOSTPORT is still the docker-compose default (backend:8080)."
  echo "On Render, set BACKEND_HOSTPORT from the pfe-backend service internal address"
  echo "(Dashboard → pfe-backend → Connect → Internal, or render.yaml fromService hostport)."
  exit 1
fi

if [ -n "${RENDER_SERVICE_ID:-}" ]; then
  echo "API proxy upstream: http://${BACKEND_HOSTPORT}"
fi
