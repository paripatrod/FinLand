# PWA Icons Generation Guide

## Required Icon Sizes
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Generate

### Option 1: Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload Pedro.png (512x512)
3. Download generated icons
4. Place them in this folder

### Option 2: Using ImageMagick (CLI)
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

cd frontend/public
convert Pedro.png -resize 72x72 icons/icon-72x72.png
convert Pedro.png -resize 96x96 icons/icon-96x96.png
convert Pedro.png -resize 128x128 icons/icon-128x128.png
convert Pedro.png -resize 144x144 icons/icon-144x144.png
convert Pedro.png -resize 152x152 icons/icon-152x152.png
convert Pedro.png -resize 192x192 icons/icon-192x192.png
convert Pedro.png -resize 384x384 icons/icon-384x384.png
convert Pedro.png -resize 512x512 icons/icon-512x512.png
```

### Option 3: Using Sharp (Node.js)
```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('Pedro.png')
    .resize(size, size)
    .toFile(`icons/icon-${size}x${size}.png`);
});
```

## Temporary Fallback
Until icons are generated, the manifest will fallback to Pedro.png for all sizes.
