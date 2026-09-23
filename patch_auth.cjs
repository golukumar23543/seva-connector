const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

const regex = /{\/\* Demo Accounts Quick-Fill Helper \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/form>/;

code = code.replace(regex, `</form>`);

fs.writeFileSync('src/components/AuthModal.tsx', code);
console.log("Patched AuthModal.tsx");
