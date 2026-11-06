#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
node tools/setup.mjs
npm install
npm run dev
