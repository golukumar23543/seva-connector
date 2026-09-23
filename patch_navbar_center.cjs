const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Desktop Center section replacement
const centerRegex = /{\/\* CENTER: Toll-Free & Helpline Pills \(matching Frame 00:00\) \*\/}[\s\S]*?<\/div>\s*<\/div>\s*{\/\* RIGHT:/;

const centerReplacement = `{/* CENTER: Services Dropdown */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-[#0df2a4] transition-colors py-2"
              >
                Services
                <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a1721] rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-xl z-50">
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
          </div>
          {/* RIGHT:`;

code = code.replace(centerRegex, centerReplacement);

// 2. Remove Admin numbers from Mobile Dropdown
const mobileAdminRegex = /<div className="flex flex-col gap-2 p-2 bg-\[#0a1721\] rounded-xl border border-teal-500\/20 text-xs">[\s\S]*?<\/div>/;

code = code.replace(mobileAdminRegex, '');

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Patched Navbar Desktop & Mobile");
