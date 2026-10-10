import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award
} from 'lucide-react';

export const AdminAgentManagement: React.FC = () => {
  const { allProfiles, approveAgent, rejectAgent, suspendAgent } = useAuth();
  const { bookings, commissions, settings } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const agents = allProfiles.filter((p) => p.role === 'agent');

  const filteredAgents = agents.filter((a) => {
    return (
      a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.mobile.includes(searchTerm) ||
      a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.shop_name && a.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            ग्रामीण एजेंट प्रबंधन (Agent Management & Approvals)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            जन सेवा केंद्र / सीएससी संचालकों का सत्यापन, अनुमोदन एवं परफॉरमेंस ट्रैकिंग
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200">
            Total Agents: {agents.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Pending: {agents.filter((a) => a.agent_status === 'pending_approval').length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agent name, mobile, shop, city, district..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Agents Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((ag) => {
          const agentBookingsCount = bookings.filter((b) => b.agent_id === ag.id).length;
          const agentConfirmedCount = bookings.filter((b) => b.agent_id === ag.id && b.status === 'confirmed').length;
          const agentCommissionTotal = commissions
            .filter((c) => c.agent_id === ag.id && c.status === 'credited')
            .reduce((sum, c) => sum + c.amount, 0);

          return (
            <div
              key={ag.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="space-y-4">
                {/* Header with status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-slate-900">{ag.full_name}</h2>
                    <p className="text-xs text-orange-600 font-semibold mt-0.5">
                      {ag.shop_name || 'SafarGo Partner Point'}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                      ag.agent_status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : ag.agent_status === 'pending_approval'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {ag.agent_status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Contact & Location Info */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium">+91 {ag.mobile}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{ag.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ag.city}, {ag.district}</span>
                  </div>

                  {ag.address && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      Address: {ag.address}
                    </div>
                  )}
                </div>

                {/* Performance Box */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Req</span>
                    <span className="font-bold text-slate-900">{agentBookingsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Confirmed</span>
                    <span className="font-bold text-emerald-600">{agentConfirmedCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Commission</span>
                    <span className="font-bold text-slate-900">₹{agentCommissionTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                {ag.agent_status === 'pending_approval' ? (
                  <>
                    <button
                      onClick={() => rejectAgent(ag.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveAgent(ag.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Agent
                    </button>
                  </>
                ) : ag.agent_status === 'approved' ? (
                  <button
                    onClick={() => suspendAgent(ag.id)}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition"
                  >
                    Suspend Access
                  </button>
                ) : (
                  <button
                    onClick={() => approveAgent(ag.id)}
                    className="w-full py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
                  >
                    Re-Approve Agent
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
