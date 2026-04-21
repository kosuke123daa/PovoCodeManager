import sharp from 'sharp';

const SIZE = 180;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B0764"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>

  <!-- Subtle dot grid -->
  <g opacity="0.08">
    ${Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) =>
        `<circle cx="${col * 26 + 9}" cy="${row * 26 + 9}" r="1.5" fill="white"/>`
      ).join('')
    ).join('')}
  </g>

  <!-- Ticket group (slightly tilted) -->
  <g transform="translate(90,88) rotate(-7) translate(-90,-88)">

    <!-- Drop shadow -->
    <rect x="29" y="59" width="124" height="66" rx="13" fill="black" opacity="0.25"/>

    <!-- Ticket body -->
    <rect x="26" y="56" width="128" height="66" rx="13" fill="white"/>

    <!-- Left notch -->
    <circle cx="26" cy="89" r="11" fill="#4C1D95"/>
    <!-- Right notch -->
    <circle cx="154" cy="89" r="11" fill="#4C1D95"/>

    <!-- Dashed divider -->
    <line x1="48" y1="89" x2="132" y2="89"
      stroke="#DDD6FE" stroke-width="1.5" stroke-dasharray="5,4"/>

    <!-- Top: VOUCHER label -->
    <text x="90" y="79"
      text-anchor="middle"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="9.5" font-weight="700" letter-spacing="2.5"
      fill="#7C3AED" opacity="0.75">VOUCHER</text>

    <!-- Bottom: povo -->
    <text x="90" y="111"
      text-anchor="middle"
      font-family="Helvetica Neue, Arial, sans-serif"
      font-size="23" font-weight="900"
      fill="#3B0764">povo</text>

  </g>
</svg>
`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/apple-touch-icon.png');

// Also generate 512x512 for manifest
const svgLarge = svg.replace(/width="${SIZE}" height="${SIZE}"/, 'width="512" height="512"')
  .replace(/viewBox="0 0 ${SIZE} ${SIZE}"/, 'viewBox="0 0 180 180"');

await sharp(Buffer.from(svgLarge))
  .resize(512, 512)
  .png()
  .toFile('public/icon-512.png');

console.log('Icons generated.');
