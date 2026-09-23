const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  'className="min-h-screen bg-[#03090F] flex flex-col items-center justify-center text-teal-300/80"',
  'className="flex-grow w-full bg-[#03090F] flex flex-col items-center justify-center text-teal-300/80"'
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx loading state");
