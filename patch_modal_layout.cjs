const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLoginModal.tsx', 'utf8');

code = code.replace(
  'className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"',
  'className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 flex justify-center"'
);

code = code.replace(
  'className="relative w-full max-w-md bg-gradient-to-b from-[#0a1b24]',
  'className="relative my-auto w-full max-w-md bg-gradient-to-b from-[#0a1b24]'
);

fs.writeFileSync('src/components/AdminLoginModal.tsx', code);
console.log("Patched layout");
