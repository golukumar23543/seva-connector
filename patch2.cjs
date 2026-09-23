const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const targetStr = `  // Non-admin lock screen
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#070e14] flex items-center justify-center p-4 selection:bg-[#0df2a4] selection:text-slate-950">
        <div className="w-full max-w-md bg-gradient-to-b from-[#0a1c26] to-[#050f15] border border-[#0df2a4]/30 rounded-3xl p-8 text-center text-white shadow-[0_0_40px_rgba(13,242,164,0.15)] space-y-5 select-none">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0c2734] to-[#06141c] border border-[#0df2a4]/40 flex items-center justify-center text-[#0df2a4] shadow-[0_0_20px_rgba(13,242,164,0.25)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display text-white">Super Admin Access Required</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              This operations and governance control center is restricted to authenticated administrators.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full py-3.5 bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(13,242,164,0.35)] cursor-pointer"
            >
              Enter Admin Password
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-sm border border-teal-500/20 transition-all cursor-pointer"
              >
                Return to Website
              </button>
            )}
          </div>
          <AdminLoginModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            onSuccess={() => {
              setLoginModalOpen(false);
              fetchAdminData();
            }}
          />
        </div>
      </div>
    );
  }`;

const replacementStr = `  // Non-admin lock screen
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

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
  console.log("Successfully replaced");
} else {
  console.log("Target string not found.");
}
