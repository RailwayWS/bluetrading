#!/bin/bash

# Navigate to the assets directory
cd "$(dirname "$0")/../src/assets"

echo "Converting images to webp..."

cwebp hero1.jpg -o hero1.webp
cwebp hero2.jpg -o hero2.webp

echo "Done!"
