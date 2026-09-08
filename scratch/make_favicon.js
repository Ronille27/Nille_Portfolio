const fs = require('fs');

// Read new logo crop.png
const logoB64 = fs.readFileSync('./images/logo crop.png').toString('base64');

// Create favicon SVG with dark artist stamp and the white signature
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <filter id="whiteInk" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 1 0"/>
    </filter>
  </defs>
  <rect width="64" height="64" rx="14" fill="#12141a" stroke="#ff4d5a" stroke-width="2.5"/>
  <image href="data:image/png;base64,${logoB64}" x="12" y="8" width="40" height="48" filter="url(#whiteInk)" />
</svg>`;

fs.writeFileSync('./images/favicon.svg', svg);
console.log('Regenerated images/favicon.svg successfully! Size:', svg.length);
