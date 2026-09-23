const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const regex = /\/\/ Non-admin lock screen([\s\S]*?)<AdminLoginModal[\s\S]*?\/>\s*<\/div>\s*<\/div>\s*\);\s*}/;

const replacementStr = `// Non-admin lock screen
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-[#070e14] flex flex-col items-center justify-center p-4 sm:p-8 pt-12 pb-24 selection:bg-[#0df2a4] selection:text-slate-950">
        <div className="w-full max-w-md bg-gradient-to-b from-[#0a1c26] to-[#050f15] border border-[#0df2a4]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(13,242,164,0.15)] relative overflow-hidden select-none">
          {/* Ambient Background Glow Effect */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#0df2a4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c2734] to-[#06141c] border border-[#0df2a4]/40 flex items-center justify-center text-[#0df2a4] shadow-[0_0_20px_rgba(13,242,164,0.25)] mb-5">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mb-2">
              Super Admin Access
            </h2>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Enter your administrative key to access the operations and governance control center.
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <AdminLockForm 
              onSuccess={() => fetchAdminData()} 
              onNavigateHome={onNavigate ? () => onNavigate('home') : undefined} 
            />
          </div>
        </div>
      </div>
    );
  }`;

if (regex.test(code)) {
  code = code.replace(regex, replacementStr);
  fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
  console.log("Successfully replaced");
} else {
  console.log("Target string not found with regex.");
}
