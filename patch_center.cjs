const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const target = `          {/* CENTER: Toll-Free & Helpline Pills (matching Frame 00:00) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Toll-Free Pill */}
            <a
              href="tel:8709107808"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#071c18] border border-emerald-500/40 text-xs font-semibold text-emerald-400 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all font-mono"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Toll-Free:</span>
              <span className="font-bold text-emerald-300">#8709107808</span>
            </a>
            {/* Helpline Pill */}
            <a
              href="tel:8409021577"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081b24] border border-[#0df2a4]/40 text-xs font-semibold text-[#0df2a4] hover:border-[#0df2a4] hover:shadow-[0_0_12px_rgba(13,242,164,0.3)] transition-all font-mono"
            >
              <span className="w-2 h-2 rounded-full bg-[#0df2a4] animate-pulse"></span>
              <span className="text-slate-300">Co-Admin:</span>
              <span className="font-bold text-teal-300">8409021577</span>
            </a>
          </div>`;

const replacement = `          {/* CENTER: Services Dropdown */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative group z-50">
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-[#0df2a4] transition-colors py-2"
              >
                Services
                <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a1721] rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-xl">
                <div className="py-2">
                  {[
                    { name: 'Electrician & Wiring', cat: 'Electrician' },
                    { name: 'Plumbing & Pipe Fitting', cat: 'Plumber' },
                    { name: 'AC & Appliance Repair', cat: 'AC Specialist' },
                    { name: 'Home Painting & Whitewash', cat: 'Painting & Waterproofing' },
                    { name: 'Deep House Cleaning', cat: 'House Deep Cleaning' },
                    { name: 'Carpenter & Woodwork', cat: 'Carpenter & Woodwork' },
                    { name: 'RO Water Purifier & Geyser', cat: 'RO Water Purifier' }
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigate('search', { category: s.cat })}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[#102433] hover:text-[#0df2a4] transition-colors flex items-center justify-between group/item"
                    >
                      <span>{s.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-0 group-hover/item:opacity-100 text-[#0df2a4] transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Patched Center!");
