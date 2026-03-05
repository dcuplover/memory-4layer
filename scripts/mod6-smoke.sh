#!/usr/bin/env bash
set -euo pipefail

echo "[mod6-smoke] Node version: $(node -v)"
echo "[mod6-smoke] npm version: $(npm -v)"

echo "[mod6-smoke] Installing dependencies..."
npm ci

echo "[mod6-smoke] Building project..."
npm run build

echo "[mod6-smoke] Running MOD6 registration smoke test..."
npm run test:mod6

echo "[mod6-smoke] Done."
