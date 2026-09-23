const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function generate() {
  const upiUri = 'upi://pay?pa=ravikanhauli91@ptyes&pn=Ravi%20Kumar&cu=INR';
  
  // 1. Generate standalone high-res QR PNG
  const qrBuffer = await QRCode.toBuffer(upiUri, {
    width: 600,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'upi-qr-matrix.png'), qrBuffer);

  // 2. Generate complete SVG matching the exact Paytm card from the user screenshot
  const qrSvg = await QRCode.toString(upiUri, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // Extract the inner SVG paths
  const svgContentMatch = qrSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const qrInnerSvg = svgContentMatch ? svgContentMatch[1] : '';

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 780" width="450" height="780" style="background:#0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#00baf2" />
      <stop offset="100%" stopColor="#00baf2" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#00baf2" />
      <stop offset="50%" stopColor="#00baf2" />
      <stop offset="50.1%" stopColor="#002970" />
      <stop offset="100%" stopColor="#002970" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.4)" />
    </filter>
  </defs>

  <!-- Profile Image Area -->
  <g transform="translate(225, 60)">
    <circle cx="0" cy="0" r="38" fill="#1e293b" stroke="#334155" stroke-width="2" />
    <!-- Stylized Avatar -->
    <circle cx="0" cy="-8" r="16" fill="#f87171" opacity="0.9" />
    <path d="M-26,26 C-26,10 26,10 26,26 Z" fill="#f87171" opacity="0.8" />
    <!-- Inner ambient avatar silhouette -->
    <text x="0" y="7" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">RK</text>
  </g>

  <!-- Name + Verified Badge -->
  <g transform="translate(225, 130)">
    <text x="-12" y="0" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">Ravi Kumar</text>
    <!-- Verified Badge -->
    <g transform="translate(56, -14)">
      <circle cx="8" cy="8" r="8" fill="#00baf2" />
      <path d="M5,8 L7,10 L11,6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>

  <!-- Blue Card Container -->
  <g filter="url(#shadow)">
    <!-- Outer Rounded Card with Cyan Top & Navy Bottom -->
    <rect x="35" y="160" width="380" height="530" rx="32" fill="url(#cardGrad)" />

    <!-- Inner Pure White Card Container -->
    <rect x="65" y="210" width="320" height="440" rx="24" fill="#ffffff" />

    <!-- Paytm UPI Logo Inside White Card -->
    <g transform="translate(115, 240)">
      <!-- Paytm Wordmark -->
      <text x="0" y="18" font-size="24" font-weight="900" fill="#002970" letter-spacing="-0.5">paytm</text>
      <!-- Red Heart -->
      <path d="M85,15 C85,9 91,4 96,8 C101,4 107,9 107,15 C107,22 96,28 96,28 C96,28 85,22 85,15 Z" fill="#ff3366" />
      <!-- UPI Wordmark -->
      <text x="114" y="18" font-size="24" font-weight="900" font-style="italic" fill="#002970" letter-spacing="-0.5">UPI</text>
      <!-- Triangle Accent -->
      <polygon points="164,6 172,13 164,20" fill="#00ba40" />
      <polygon points="170,6 178,13 170,20" fill="#ff9900" />
    </g>

    <!-- QR Code Container -->
    <g transform="translate(95, 290)">
      <!-- Embed the rendered QR matrix paths scaled -->
      <svg width="260" height="260" viewBox="0 0 260 260">
        ${qrInnerSvg.replace(/viewBox="[^"]*"/, '')}
      </svg>
    </g>

    <!-- UPI ID Under QR -->
    <g transform="translate(225, 605)">
      <!-- Orange Play/Triangle Icon -->
      <polygon points="-108,-11 -98,-5 -108,1" fill="#f97316" />
      <text x="-90" y="0" font-size="16" font-weight="600" fill="#0f172a" text-anchor="start">ravikanhauli91@ptyes</text>
    </g>
  </g>

  <!-- Bottom Strip: Scan with any UPI app + Brand Badges -->
  <g transform="translate(225, 735)">
    <text x="-120" y="0" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">Scan with any UPI app</text>
    
    <!-- Paytm Logo Pill -->
    <text x="0" y="0" font-size="13" font-weight="800" fill="#00baf2">paytm</text>

    <!-- PhonePe Circle -->
    <g transform="translate(46, -11)">
      <circle cx="8" cy="8" r="8" fill="#5f259f" />
      <text x="8" y="12" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">पे</text>
    </g>

    <!-- BHIM Logo -->
    <g transform="translate(74, -9)">
      <polygon points="2,0 8,8 2,16" fill="#f97316" />
      <polygon points="8,0 14,8 8,16" fill="#16a34a" />
      <text x="18" y="11" font-size="12" font-weight="900" font-style="italic" fill="#e2e8f0">BHIM</text>
    </g>
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'upi-qr.svg'), fullSvg);
  // Also copy as upi-qr.png or matrix
  fs.writeFileSync(path.join(publicDir, 'upi-qr.png'), qrBuffer);

  console.log('Successfully generated public/upi-qr.svg and public/upi-qr.png');
}

generate().catch(console.error);
