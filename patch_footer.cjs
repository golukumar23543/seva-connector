const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

// 1. Column 1 Changes
const col1Target = `            <p className="text-xs text-slate-300 leading-relaxed">
              Software Developer | Diploma in CSE from REC (Netaji Subhas Institute of Technology). Powering Bihar's most trusted on-demand local services network.
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
                href="tel:8409021577"
                className="flex items-center gap-2 hover:text-[#0df2a4] transition-colors font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>+91 8409021577</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>Patna, Bihar, India</span>
              </div>
            </div>`;

const col1Replacement = `            <p className="text-xs text-slate-300 leading-relaxed">
              Owner of this SevaConnect is Mr.Golu.<br/>
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
                <span>Co-admin: +91 8409021577</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#0df2a4] shrink-0" />
                <span>Patna, Bihar, India</span>
              </div>
            </div>`;

code = code.replace(col1Target, col1Replacement);

// 2. Col 1 Buttons
const col1BtnsTarget = `              <a
                href="https://wa.me/918789037880"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#0a1721] border border-teal-500/30 text-emerald-400 hover:border-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:8409021577"
                className="px-3 py-1.5 rounded-lg bg-[#0a1721] border border-teal-500/30 text-[#0df2a4] hover:border-[#0df2a4] text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Call Desk</span>
              </a>`;

const col1BtnsReplacement = `              <a
                href="https://wa.me/918709107808"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#0a1721] border border-teal-500/30 text-emerald-400 hover:border-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:8709107808"
                className="px-3 py-1.5 rounded-lg bg-[#0a1721] border border-teal-500/30 text-[#0df2a4] hover:border-[#0df2a4] text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Call Admin</span>
              </a>`;

code = code.replace(col1BtnsTarget, col1BtnsReplacement);

// 3. Col 2 Toll free
const col2Target = `              <li>
                <a
                  href="tel:8409021577"
                  className="hover:text-[#0df2a4] transition-colors font-mono text-teal-300 block pt-1"
                >
                  Toll-Free: 8409021577
                </a>
              </li>`;

const col2Replacement = `              <li>
                <a
                  href="tel:8709107808"
                  className="hover:text-[#0df2a4] transition-colors font-mono text-teal-300 block pt-1"
                >
                  Admin Desk: 8709107808
                </a>
              </li>`;

code = code.replace(col2Target, col2Replacement);

// 4. Col 4 Connect with admin
const col4Target = `            {/* Toll Free Card matching Frame 00:15 */}
            <div className="p-4 rounded-2xl bg-[#08151f] border border-teal-500/40 shadow-[0_0_20px_rgba(13,242,164,0.15)] space-y-2">
              <div className="flex items-center gap-2 text-[#0df2a4]">
                <Phone className="w-4 h-4 animate-bounce" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                  TOLL FREE NUMBER
                </span>
              </div>
              <a
                href="tel:8409021577"
                className="block text-2xl font-mono font-extrabold text-white hover:text-[#0df2a4] transition-colors tracking-wide"
              >
                8409021577
              </a>
              <p className="text-[11px] text-slate-400">
                24/7 Available for Bookings & Support
              </p>
            </div>
            {/* WhatsApp Message Button */}
            <a
              href="https://wa.me/918789037880"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#0b221d] hover:bg-[#0e2f27] border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Message on WhatsApp Desk</span>
            </a>`;

const col4Replacement = `            {/* Admin Desk Card */}
            <div className="p-4 rounded-2xl bg-[#08151f] border border-teal-500/40 shadow-[0_0_20px_rgba(13,242,164,0.15)] space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#0df2a4]">
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
                    ADMIN DESK
                  </span>
                </div>
                <a
                  href="tel:8709107808"
                  className="block text-xl font-mono font-extrabold text-white hover:text-[#0df2a4] transition-colors tracking-wide"
                >
                  +91 8709107808
                </a>
              </div>
              <div className="space-y-1 pt-1 border-t border-teal-500/20">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    CO-ADMIN
                  </span>
                </div>
                <a
                  href="tel:8409021577"
                  className="block text-sm font-mono font-bold text-slate-300 hover:text-[#0df2a4] transition-colors tracking-wide"
                >
                  +91 8409021577
                </a>
              </div>
            </div>
            {/* WhatsApp Message Button */}
            <a
              href="https://wa.me/918709107808"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#0b221d] hover:bg-[#0e2f27] border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Message Admin on WhatsApp</span>
            </a>`;

code = code.replace(col4Target, col4Replacement);

fs.writeFileSync('src/components/Footer.tsx', code);
console.log("Patched Footer.tsx successfully.");
