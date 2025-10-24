#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PORT=3001
export NODE_ENV=development
npm run dev
