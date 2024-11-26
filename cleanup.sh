#!/bin/bash

# Remove default Next.js SVGs
rm -f public/next.svg public/vercel.svg

# Make sure we have a default avatar
cp public/default-avatar.png public/default-avatar.png 2>/dev/null || true

# Clean any temporary files
rm -rf temp/*
rm -rf uploads/*

# Ensure directories exist
mkdir -p temp uploads

# Remove any .DS_Store files
find . -name ".DS_Store" -delete

echo "Cleanup complete!"
