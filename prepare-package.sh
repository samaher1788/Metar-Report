#!/bin/bash

# Script to prepare production-ready package
# تجهيز حزمة الإنتاج النهائية

echo "🚀 Preparing production package..."

# Create clean directory
mkdir -p /tmp/dust-reporter-production
cd /tmp/dust-reporter-production

# Copy necessary files only
cp -r /home/user/webapp/src .
cp -r /home/user/webapp/public .
cp /home/user/webapp/package.json .
cp /home/user/webapp/package-lock.json .
cp /home/user/webapp/tsconfig.json .
cp /home/user/webapp/vite.config.ts .
cp /home/user/webapp/wrangler.jsonc .
cp /home/user/webapp/ecosystem.config.cjs .
cp /home/user/webapp/.gitignore .
cp /home/user/webapp/README.md .
cp /home/user/webapp/DEPLOYMENT_GUIDE.md .
cp /home/user/webapp/HANDOVER_GUIDE.md .

# Remove development files
rm -rf node_modules
rm -rf dist
rm -rf .git

# Create archive
cd /tmp
tar -czf dust-reporter-production-final.tar.gz dust-reporter-production/

echo "✅ Package ready: /tmp/dust-reporter-production-final.tar.gz"
ls -lh /tmp/dust-reporter-production-final.tar.gz
