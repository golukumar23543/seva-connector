const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// FAQ section
code = code.replace(/Toll-Free helpline at 8409021577/g, 'Admin helpline at 8709107808');
code = code.replace(/\+91 8789037880/g, '8709107808');
code = code.replace(/tel:8409021577/g, 'tel:8709107808');
code = code.replace(/>\s*8409021577\s*</g, '>8709107808<');
code = code.replace(/wa\.me\/918789037880/g, 'wa.me/918709107808');
code = code.replace(/Call 8409021577/g, 'Call 8709107808');
// The CTA banner at the bottom has a secondary button which probably was wa.me, let's just make sure.

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log("HomePage fixed");
