import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Layers, Users, DollarSign, Award, CheckCircle } from 'lucide-react';

export const PartnerPortal: React.FC = () => {
  const { state } = useStore();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'referrals' | 'payouts'>('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">partner.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              B2B Business Partner Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Partner: <strong>{currentUser.fullName}</strong> • Status: <span className="text-emerald-600 font-semibold uppercase">Active Partner</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Partner Hub
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'referrals' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Campaign Performance
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'payouts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Settlement Ledgers
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">Network Booking Volume</span>
          <div className="text-2xl font-black text-slate-900">342 Tickets</div>
          <div className="text-[11px] text-emerald-600 font-medium">B2B Verified volume</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">Commission & Rewards</span>
          <div className="text-2xl font-black text-emerald-700">₹6,840.00</div>
          <div className="text-[11px] text-slate-400">Settled monthly via RTGS / NEFT</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">Partner Tier</span>
          <div className="text-2xl font-black text-safargo-navy">Gold Tier</div>
          <div className="text-[11px] text-slate-500">Dedicated operational account manager</div>
        </div>
      </div>

      {/* Program Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="text-base font-bold text-slate-900">Partner Program Guidelines</h3>
        <p className="text-slate-600 leading-relaxed">
          SafarGo partners with hotels, rural tour planners, cooperative societies, and regional distributors. All bookings submitted through corporate partner channels are processed with top operational priority on our 15-minute manual verification queue.
        </p>
      </div>

    </div>
  );
};
