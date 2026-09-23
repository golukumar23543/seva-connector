const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const regex = /{\/\* Center Core Hub Card \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;

const replacement = `{/* Center Core Hub Card */}
                <div className="w-40 h-40 rounded-full bg-[#07141d] border-2 border-[#0df2a4] shadow-[0_0_35px_rgba(13,242,164,0.45)] flex flex-col items-center justify-center text-center p-3 z-10 relative group hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-[#0df2a4]/20 border border-[#0df2a4]/40 flex items-center justify-center mb-1 text-[#0df2a4]">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-black text-white tracking-wide font-display">
                    Seva<span className="text-[#0df2a4]">Connect</span>
                  </h4>
                  <p className="text-[10px] text-teal-300 font-medium mt-0.5 leading-tight">
                    Trusted Doorstep Network
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Orbiting Container */}
                <div className="absolute inset-0 animate-rotate-slow pointer-events-none z-20">
                  {/* Node 1: Top - AC Care */}
                  <div className="absolute top-[8%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => onNavigate('search', { category: 'AC Specialist' })}
                      className="animate-rotate-slow-reverse flex flex-col items-center gap-1 p-2 rounded-2xl bg-[#08151f]/95 border border-cyan-500/40 hover:border-[#0df2a4] shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">AC Care</span>
                    </button>
                  </div>

                  {/* Node 2: Top-Right - Appliance */}
                  <div className="absolute top-[29%] left-[86.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => onNavigate('search', { category: 'Appliance Repair' })}
                      className="animate-rotate-slow-reverse flex flex-col items-center gap-1 p-2 rounded-2xl bg-[#08151f]/95 border border-purple-500/40 hover:border-[#0df2a4] shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                        <Tv className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Appliance</span>
                    </button>
                  </div>

                  {/* Node 3: Bottom-Right - Carpenter */}
                  <div className="absolute top-[71%] left-[86.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => onNavigate('search', { category: 'Carpenter & Woodwork' })}
                      className="animate-rotate-slow-reverse flex flex-col items-center gap-1 p-2 rounded-2xl bg-[#08151f]/95 border border-amber-500/40 hover:border-[#0df2a4] shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                        <Hammer className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Carpenter</span>
                    </button>
                  </div>

                  {/* Node 4: Bottom - Cleaning */}
                  <div className="absolute top-[92%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => onNavigate('search', { category: 'House Deep Cleaning' })}
                      className="animate-rotate-slow-reverse flex flex-col items-center gap-1 p-2 rounded-2xl bg-[#08151f]/95 border border-emerald-500/40 hover:border-[#0df2a4] shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Cleaning</span>
                    </button>
                  </div>

                  {/* Node 5: Bottom-Left - Electrician */}
                  <div className="absolute top-[71%] left-[13.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => onNavigate('search', { category: 'Electrician' })}
                      className="animate-rotate-slow-reverse flex flex-col items-center gap-1 p-2 rounded-2xl bg-[#08151f]/95 border border-yellow-500/40 hover:border-[#0df2a4] shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-300">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Electrician</span>
                    </button>
                  </div>

                  {/* Node 6: Top-Left - Plumber */}
                  <div className="absolute top-[29%] left-[13.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <button
                      onClick={() => onNavigate('search', { category: 'Plumber' })}
                      className="animate-rotate-slow-reverse flex flex-col items-center gap-1 p-2 rounded-2xl bg-[#08151f]/95 border border-sky-500/40 hover:border-[#0df2a4] shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200">Plumber</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/HomePage.tsx', code);
console.log("Patched HomePage.tsx with rotating orbit");
