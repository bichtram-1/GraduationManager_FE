#!/bin/bash

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: ./scripts/set-env.sh <environment>"
  echo "Available environments: development, staging, production"
  exit 1
fi

ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

cp "$ENV_FILE" .env
echo "Environment set to $ENV (copied $ENV_FILE to .env)"
