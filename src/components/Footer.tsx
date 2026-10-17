import React from 'react';
import { Bus, Shield, Award, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { POPULAR_ROUTES } from '../data/mockData';

export const Footer: React.FC = () => {
  const { setFromCity, setToCity, setCurrentView } = useBooking();

  const handleRouteClick = (from: string, to: string) => {
    setFromCity(from);
    setToCity(to);
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Safety First Guaranteed</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emergency exit indicators, verified drivers, sanitized cabins, and real-time live GPS tracking on all Primo routes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Lowest Fare Promise</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct operator inventory rates with zero hidden charges. Use code SAFAR100 for instant ₹100 flat savings on first booking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">24x7 Customer Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated travel helpline, instant automated cancellation refund processing, and WhatsApp trip updates.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
                <Bus className="w-5 h-5 -scale-x-100" />
              </div>
              <span className="text-lg font-black text-white">SAFAR<span className="text-red-500">GO</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's fastest and most reliable online bus ticketing reservation engine. Rebuilding travel with comfort, reliability, and precision.
            </p>
            <div className="space-y-1.5 pt-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500" /> 1800-SAFAR-GO (Toll Free)
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500" /> support@safargo.in
              </div>
            </div>
          </div>

          {/* Popular Routes */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popular Routes</h5>
            <ul className="space-y-2">
              {POPULAR_ROUTES.map(r => (
                <li key={`${r.from}-${r.to}`}>
                  <button
                    onClick={() => handleRouteClick(r.from, r.to)}
                    className="hover:text-red-400 text-left transition-colors"
                  >
                    {r.from} to {r.to}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Bus Operators */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Top Operators</h5>
            <ul className="space-y-2">
              <li><span className="hover:text-white cursor-pointer">IntrCity SmartBus</span></li>
              <li><span className="hover:text-white cursor-pointer">Zingbus Plus</span></li>
              <li><span className="hover:text-white cursor-pointer">NueGo Electric AC</span></li>
              <li><span className="hover:text-white cursor-pointer">VRL Travels</span></li>
              <li><span className="hover:text-white cursor-pointer">Orange Tours & Travels</span></li>
              <li><span className="hover:text-white cursor-pointer">Hans Travels</span></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">About & Legal</h5>
            <ul className="space-y-2">
              <li><span className="hover:text-white cursor-pointer">About Safar Go</span></li>
              <li><span className="hover:text-white cursor-pointer">Offers & Promo Codes</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white cursor-pointer">Bus Operator Partner</span></li>
              <li><span className="hover:text-white cursor-pointer">Frequently Asked Questions</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Safar Go Technologies Private Limited. All rights reserved.</p>
          <p className="text-slate-400">
            Engineered with high fidelity & clean-room parity • Safar Go Travel Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
