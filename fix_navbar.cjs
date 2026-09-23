const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace standard links
code = code.replace(/tel:8409021577/g, 'tel:8709107808');
code = code.replace(/#8409021577/g, '#8709107808');
code = code.replace(/>\s*8409021577\s*</g, '>8709107808<');
code = code.replace(/Toll-Free: 8409021577/g, 'Admin: 8709107808');

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Navbar fixed");
