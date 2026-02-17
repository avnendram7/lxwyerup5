#!/bin/bash
# Deployment Helper Script
# This script pushes the latest code to GitHub.
# You will be asked for your GitHub Username and Password/Token.

echo "========================================"
echo "    LxwyerUp Deployment Helper"
echo "========================================"
echo "Pushing code to: https://github.com/shivkuriyal/lxwyerup"
echo ""

git -C /Users/shivkuriyal/Desktop/csshehe/lxwyerup01 push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Files uploaded."
else
    echo ""
    echo "❌ Upload failed. Please check your password/token."
fi
echo "========================================"
