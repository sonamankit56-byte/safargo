import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { Bus, ShieldAlert, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { SubdomainId } from '../../lib/types';

export const Footer: React.FC = () => {
  const { allPortals, setActivePortal } = usePortal();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-safargo-orange flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white">SAFAR<span className="text-safargo-orange">GO</span></span>
                <div className="text-[11px] text-orange-400 font-medium">अब हर सफर होगा आसान</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's transparent travel booking and agricultural distribution platform. Dedicated to accessible rural-urban mobility, agent empowerment, and farmer logistics.
            </p>
            <div className="flex items-center space-x-3 text-slate-400 text-xs pt-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-safargo-orange" />
                <span>support@safargo.in</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-safargo-orange" />
                <span>+91 98765 43210</span>
              </span>
            </div>
          </div>

          {/* 12 Subdomains Grid (Part 1) */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Travel & Operations Portals</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActivePortal('www')} className="hover:text-safargo-orange transition-colors">
                  www.safargo.in (Main Website)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('book')} className="hover:text-safargo-orange transition-colors">
                  book.safargo.in (Customer Bus Search)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('agent')} className="hover:text-safargo-orange transition-colors">
                  agent.safargo.in (Regular Agent Hub)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('go')} className="hover:text-safargo-orange transition-colors">
                  go.safargo.in (Special Go Agent HQ)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('admin')} className="hover:text-safargo-orange transition-colors">
                  admin.safargo.in (Admin Control Center)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('operator')} className="hover:text-safargo-orange transition-colors">
                  operator.safargo.in (Bus Operator Desk)
                </button>
              </li>
            </ul>
          </div>

          {/* 12 Subdomains Grid (Part 2) */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Agri & Support Portals</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActivePortal('kisan')} className="hover:text-safargo-orange transition-colors">
                  kisan.safargo.in (Farmer Mandi Listings)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('buyer')} className="hover:text-safargo-orange transition-colors">
                  buyer.safargo.in (Agri Buyer Desk)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('transport')} className="hover:text-safargo-orange transition-colors">
                  transport.safargo.in (Kisan Logistics)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('pay')} className="hover:text-safargo-orange transition-colors">
                  pay.safargo.in (Payment Status & Receipts)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('help')} className="hover:text-safargo-orange transition-colors">
                  help.safargo.in (Help & Support Desk)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePortal('partner')} className="hover:text-safargo-orange transition-colors">
                  partner.safargo.in (B2B Partner Network)
                </button>
              </li>
            </ul>
          </div>

          {/* Operational Transparency Notice */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Operational Transparency</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              SafarGo operates an authentic <strong>assisted manual booking workflow</strong>. All bus inventory and seat availability are verified manually with authorized operators. We do not invent fake PNRs or pretend live automatic inventory exists until authorized integrations are formally active.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-3">
          <div>
            © {new Date().getFullYear()} SafarGo Mobility & Agri Services Ltd. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Cancellation & Refunds</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
