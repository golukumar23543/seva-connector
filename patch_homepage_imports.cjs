const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// 1. Add import
if (!code.includes('UpiPaymentModal')) {
  code = code.replace(
    /import { BrandLogo } from '\.\.\/components\/BrandLogo\.tsx';/,
    "import { BrandLogo } from '../components/BrandLogo.tsx';\nimport { UpiPaymentModal } from '../components/UpiPaymentModal.tsx';"
  );
}

// 2. Add state inside HomePage
if (!code.includes('const [upiModalOpen, setUpiModalOpen] = useState(false);')) {
  code = code.replace(
    /const \[showScrollTop, setShowScrollTop\] = useState\(false\);/,
    "const [showScrollTop, setShowScrollTop] = useState(false);\n  const [upiModalOpen, setUpiModalOpen] = useState(false);"
  );
}

// 3. Mount Modal at the end of the return statement
code = code.replace(
    /    <\/div>\s*<\/div>\s*\);\s*}\s*$/,
    "      <UpiPaymentModal isOpen={upiModalOpen} onClose={() => setUpiModalOpen(false)} />\n    </div>\n  );\n}"
  );

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log("Patched HomePage.tsx for UPI Modal (fixes)");
