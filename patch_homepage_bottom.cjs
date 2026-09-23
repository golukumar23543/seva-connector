const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const regex = /      \)}\s*<\/div>\s*\);\s*}\s*$/;
code = code.replace(
  regex,
  `      )}\n      <UpiPaymentModal isOpen={upiModalOpen} onClose={() => setUpiModalOpen(false)} />\n    </div>\n  );\n}`
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log("Patched HomePage.tsx bottom");
