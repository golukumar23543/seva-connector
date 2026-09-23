const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const regex = /<p className="text-xs text-slate-300 leading-relaxed">[\s\S]*?Patna, Bihar, India<\/span>\s*<\/div>\s*<\/div>/;

const replacement = `<p className="text-xs text-slate-300 leading-relaxed">
              Owner of this SevaConnect is Mr. Golu.<br/>
              CSE Department and NSIT College Student and Diploma Student.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <a
                href="mailto:ambitiongolu@gmail.com"
                className="flex items-center gap-2 hover:text-[#0df2a4] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>ambitiongolu@gmail.com</span>
              </a>
              <a
                href="tel:8709107808"
                className="flex items-center gap-2 hover:text-[#0df2a4] transition-colors font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>Admin: +91 8709107808</span>
              </a>
              <a
                href="tel:8409021577"
                className="flex items-center gap-2 hover:text-[#0df2a4] transition-colors font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Co-Admin: +91 8409021577</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>Patna, Bihar, India</span>
              </div>
            </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/Footer.tsx', code);
console.log("Footer Col1 fixed");
