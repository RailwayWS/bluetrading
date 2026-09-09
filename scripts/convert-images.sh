#!/bin/bash

# Navigate to the assets directory
cd "$(dirname "$0")/../src/assets"

echo "Converting images to webp..."

cwebp hero1.jpg -o hero1.webp
cwebp hero2.jpg -o hero2.webp
cwebp -q 80 -resize 1200 0 AboutImg.png -o AboutImg.webp
cwebp -q 82 hero-slide-1.png -o hero-slide-1.webp
cwebp -q 82 hero-slide-2.png -o hero-slide-2.webp

echo "Done!"
