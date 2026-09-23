const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(/wa\.me\/918789037880/g, 'wa.me/918709107808');

fs.writeFileSync('src/components/Footer.tsx', code);
console.log("Footer fixed");
