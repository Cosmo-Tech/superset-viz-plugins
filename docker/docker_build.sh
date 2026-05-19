#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE_NAME="cosmotech/superset-dev:6.0.0"

echo "==> Building Superset image: ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" "${SCRIPT_DIR}"
echo "==> Done: ${IMAGE_NAME}"
