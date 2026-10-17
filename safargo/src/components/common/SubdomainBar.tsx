import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { Globe, UserCheck, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { SubdomainId } from '../../lib/types';

export const SubdomainBar: React.FC = () => {
  const { activePortal, activeMeta, setActivePortal, allPortals } = usePortal();
  const { currentUser, availableProfiles, switchUser } = useAuth();
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="bg-safargo-navy-dark text-slate-200 text-xs py-1.5 px-4 border-b border-slate-700 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Active Subdomain Info & Switcher */}
        <div className="flex items-center space-x-2">
          <Globe className="w-3.5 h-3.5 text-safargo-orange" />
          <span className="text-slate-400">Current Portal:</span>
          <div className="relative">
            <button
              onClick={() => {
                setShowPortalMenu(!showPortalMenu);
                setShowUserMenu(false);
              }}
              className="inline-flex items-center space-x-1.5 font-medium text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-600 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${activeMeta.color}`} />
              <span className="font-mono text-safargo-orange">{activeMeta.hostname}</span>
              <span className="hidden sm:inline text-slate-300">({activeMeta.name})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPortalMenu && (
              <div 
                className="absolute left-0 top-full mt-1.5 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 max-h-96 overflow-y-auto"
                onClick={() => setShowPortalMenu(false)}
              >
                <div className="px-3 py-1 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  Select SafarGo Subdomain (12 Portals)
                </div>
                {allPortals.map((portal) => (
                  <button
                    key={portal.id}
                    onClick={() => setActivePortal(portal.id as SubdomainId)}
                    className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 hover:bg-slate-800 transition-colors ${
                      activePortal === portal.id ? 'bg-slate-800/80' : ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${portal.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-slate-100 truncate">{portal.hostname}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {portal.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{portal.name} • {portal.hindiName}</div>
                    </div>
                    {activePortal === portal.id && (
                      <Check className="w-4 h-4 text-safargo-orange flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Supabase Database Connection Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-[11px] text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">Live DB Connected:</span>
          <span className="font-mono text-emerald-200">fvajmpzfompwhghqcgwp.supabase.co</span>
        </div>

        {/* User Persona Switcher & Current Role */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowPortalMenu(false);
              }}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-slate-600 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 hidden sm:inline">Role:</span>
              <span className="font-medium text-emerald-300 capitalize">{currentUser.role.replace('_', ' ')}</span>
              <span className="text-slate-400 hidden md:inline truncate max-w-[130px]">({currentUser.fullName.split(' ')[0]})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 max-h-96 overflow-y-auto"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-1 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  Simulate Role / Switch User
                </div>
                {availableProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => switchUser(p.id)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.id === p.id ? 'bg-slate-800/80' : ''
                    }`}
                  >
                    <div>
                      <div className="text-slate-200 font-medium truncate">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{p.role.replace('_', ' ')} • {p.phone}</div>
                    </div>
                    {currentUser.id === p.id && (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
