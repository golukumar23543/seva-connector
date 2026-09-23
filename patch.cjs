const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const lockForm = `
function AdminLockForm({ onSuccess, onNavigateHome }: { onSuccess: () => void, onNavigateHome?: () => void }) {
  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Incorrect password');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await adminLogin(password);
      showToast('Super Administrator session authorized', 'success');
      onSuccess();
    } catch (err: any) {
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-left">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Admin Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4 text-[#0df2a4]/70 group-focus-within:text-[#0df2a4] transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-3.5 bg-[#061017] border border-[#0df2a4]/30 focus:border-[#0df2a4] focus:ring-2 focus:ring-[#0df2a4]/20 rounded-xl text-white placeholder-slate-600 text-sm font-mono transition-all outline-none shadow-inner"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0df2a4] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="pt-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#0df2a4] hover:bg-[#00f5c4] active:scale-[0.98] disabled:opacity-60 text-slate-950 font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(13,242,164,0.35)] hover:shadow-[0_0_35px_rgba(13,242,164,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Access Admin Dashboard</span>
              </>
            )}
          </button>
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-sm border border-teal-500/20 transition-all cursor-pointer"
            >
              Return to Website
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function AdminDashboard`;

code = code.replace('export function AdminDashboard', lockForm);
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
