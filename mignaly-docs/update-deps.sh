#!/bin/sh

# Update deprecated packages
npm uninstall inflight rimraf glob @humanwhocodes/object-schema @humanwhocodes/config-array node-uuid eslint
npm install lru-cache rimraf@latest glob@latest @eslint/object-schema @eslint/config-array uuid eslint@latest --save-dev

# Update npm itself
npm install -g npm@latest

echo "Dependencies updated successfully!"