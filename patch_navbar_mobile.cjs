const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const searchTarget = `<div className="flex gap-2 pt-1">`;
const replacement = `<div className="py-2 border-t border-teal-900/30">
              <h4 className="font-bold text-white text-xs mb-2 px-2 uppercase tracking-wider text-slate-400">Services</h4>
              <ul className="space-y-1">
                {[
                  { name: 'Electrician & Wiring', cat: 'Electrician' },
                  { name: 'Plumbing & Pipe Fitting', cat: 'Plumber' },
                  { name: 'AC & Appliance Repair', cat: 'AC Specialist' },
                  { name: 'Home Painting & Whitewash', cat: 'Painting & Waterproofing' },
                  { name: 'Deep House Cleaning', cat: 'House Deep Cleaning' },
                  { name: 'Carpenter & Woodwork', cat: 'Carpenter & Woodwork' },
                  { name: 'RO Water Purifier & Geyser', cat: 'RO Water Purifier' }
                ].map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        onNavigate('search', { category: s.cat });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-[#0df2a4] rounded-lg transition-colors"
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-teal-900/30">`;

code = code.replace(searchTarget, replacement);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Patched Navbar mobile menu");
