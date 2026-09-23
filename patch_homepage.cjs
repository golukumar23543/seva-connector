const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// 1. Add import
if (!code.includes('UpiPaymentModal')) {
  code = code.replace(
    /import { BookingForm } from '\.\.\/components\/BookingForm\.tsx';/,
    "import { BookingForm } from '../components/BookingForm.tsx';\nimport { UpiPaymentModal } from '../components/UpiPaymentModal.tsx';"
  );
}

// 2. Add state inside HomePage
if (!code.includes('const [upiModalOpen, setUpiModalOpen] = useState(false);')) {
  code = code.replace(
    /const \[heroBookingOpen, setHeroBookingOpen\] = useState\(false\);/,
    "const [heroBookingOpen, setHeroBookingOpen] = useState(false);\n  const [upiModalOpen, setUpiModalOpen] = useState(false);"
  );
}

// 3. Make Card 3 clickable
const card3Target = `{/* Card 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#08151f] border border-teal-500/30 hover:border-[#0df2a4]/60 transition-all flex items-center gap-4 shadow-lg group">`;
const card3Replacement = `{/* Card 3 */}
            <div onClick={() => setUpiModalOpen(true)} className="cursor-pointer p-4 sm:p-5 rounded-2xl bg-[#08151f] border border-teal-500/30 hover:border-[#0df2a4]/60 transition-all flex items-center gap-4 shadow-lg group">`;

code = code.replace(card3Target, card3Replacement);

// 4. Mount Modal at the end of the return statement
code = code.replace(
    /<\/main>/,
    "  <UpiPaymentModal isOpen={upiModalOpen} onClose={() => setUpiModalOpen(false)} />\n    </main>"
  );

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log("Patched HomePage.tsx for UPI Modal");
