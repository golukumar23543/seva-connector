import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Heart,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenAuth?: (tab?: 'login' | 'register-customer' | 'register-provider') => void;
  onOpenBooking?: () => void;
}

export function Footer({ onNavigate, onOpenAuth, onOpenBooking }: FooterProps) {
  return (
    <footer className="bg-[#080c14] text-slate-400 text-xs border-t border-slate-800">
      {/* 4-Column Main Grid matching Video Frames 00:12 - 00:16 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Founder & Lead Developer Profile (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-800 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <div className="w-full h-full bg-[#0f172a] rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-xl text-emerald-400">
                  G
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-display tracking-wide">
                  Mr. Golu Prajapati
                </h3>
                <p className="text-[11px] font-semibold text-emerald-400">
                  Founder &amp; Super Admin • SevaConnect
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-emerald-300/80 italic">
              "Building Technology with Discipline &amp; Purpose"
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              Owner &amp; Admin: Mr. Golu Prajapati.<br/>
              Co-Admin: Alok Prajapati.<br/>
              CSE Department, NSIT College Student &amp; Diploma Engineer.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <a
                href="mailto:ambitiongolu@gmail.com"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ambitiongolu@gmail.com</span>
              </a>
              <a
                href="tel:8709107808"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Admin: +91 8709107808</span>
              </a>
              <a
                href="tel:8409021577"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Co-Admin: +91 8409021577</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Patna, Bihar, India</span>
              </div>
            </div>

            {/* Social / Dev Links */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://wa.me/918709107808"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-700 hover:border-emerald-400/60 text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:8709107808"
                className="px-3 py-1.5 rounded-lg bg-[#111827] border border-slate-700 hover:border-emerald-400/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Call Admin</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-white text-sm font-display tracking-wider border-b border-slate-800 pb-2 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('45-min-arrival')}
                  className="hover:text-emerald-400 text-emerald-400 font-semibold transition-colors text-left flex items-center gap-1.5"
                >
                  <span>45-Min Arrival Guarantee</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-mono">SLA</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cash-satisfaction-policy')}
                  className="hover:text-amber-400 text-amber-300 font-semibold transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Cash After Satisfaction</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase font-mono">Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Contact Admin
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Find Technicians
                </button>
              </li>
              <li>
                {onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('register-provider')}
                    className="hover:text-emerald-400 transition-colors text-emerald-400 font-semibold text-left"
                  >
                    Join as Provider
                  </button>
                )}
              </li>
              <li>
                <a
                  href="tel:8709107808"
                  className="hover:text-emerald-400 transition-colors font-mono text-emerald-300 block pt-1"
                >
                  Admin Desk: 8709107808
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Services (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-bold text-white text-sm font-display tracking-wider border-b border-slate-800 pb-2 inline-block">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'Electrician' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Electrician &amp; Wiring
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'Plumber' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Plumbing &amp; Pipe Fitting
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'AC Specialist' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  AC &amp; Appliance Repair
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'Painting & Waterproofing' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Home Painting &amp; Whitewash
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'House Deep Cleaning' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Deep House Cleaning
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'Carpenter & Woodwork' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Carpenter &amp; Woodwork
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'RO Water Purifier' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  RO Water Purifier &amp; Geyser
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect with Admin (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-bold text-white text-sm font-display tracking-wider border-b border-slate-800 pb-2 inline-block">
              Connect with Admin
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              I'm always open to discussing new projects, service requests, creative ideas, or opportunities to be part of your visions.
            </p>

            {/* Toll Free Card matching Frame 00:15 */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#111827] to-[#0d1322] border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Phone className="w-4 h-4 animate-bounce" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  TOLL FREE NUMBER
                </span>
              </div>
              <a
                href="tel:8409021577"
                className="block text-2xl font-mono font-extrabold text-white hover:text-emerald-400 transition-colors tracking-wide"
              >
                8409021577
              </a>
              <p className="text-[11px] text-slate-400">
                24/7 Available for Bookings &amp; Support
              </p>
            </div>

            {/* WhatsApp Message Button */}
            <a
              href="https://wa.me/918709107808"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_2px_14px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message on WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar matching Video Frame 00:16 */}
      <div className="border-t border-slate-800/80 bg-[#05080f] py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-slate-400">
            &copy; 2026 <span className="text-white font-semibold">SevaConnect</span>. All Rights Reserved.
          </p>
          <p className="text-slate-400">
            1,200+ verified bookings &amp; visits across Bihar
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> in Patna, Bihar, India</span>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-emerald-400 transition-colors"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
