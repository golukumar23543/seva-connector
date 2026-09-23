const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// The original secondary number in Navbar was 8789037880. Let's make it the Co-admin number 8409021577
code = code.replace(/tel:\+918789037880/g, 'tel:8409021577');
code = code.replace(/\+91 8789037880/g, '8409021577');
code = code.replace(/wa\.me\/918789037880/g, 'wa.me/918709107808'); // Make Whatsapp the Admin number
code = code.replace(/Helpline:/g, 'Co-Admin:');

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Navbar fixed 2");
