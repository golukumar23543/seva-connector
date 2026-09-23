const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf8');

code = code.replace(
  'className="min-h-screen bg-[#03090F] text-slate-200 flex font-sans selection:bg-[#0df2a4] selection:text-slate-950"',
  'className="flex-1 flex w-full bg-[#03090F] text-slate-200 font-sans selection:bg-[#0df2a4] selection:text-slate-950"'
);

code = code.replace(
  'className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden"',
  'className="flex-1 flex flex-col min-w-0 overflow-hidden"'
);

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', code);
console.log("Patched AdminLayout.tsx");
