import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Profile } from '../../types';
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
  Award,
  CreditCard,
  CheckCircle,
  FileText,
  MessageSquare,
  ExternalLink,
  Eye,
  X,
  ShieldCheck,
  Building2,
  Smartphone
} from 'lucide-react';
import { AdminSecurityDesk } from './AdminSecurityDesk';

export interface AdminAgentManagementProps {
  initialTab?: 'agents' | 'kyc_desk' | 'security_otp_desk';
}

export const AdminAgentManagement: React.FC<AdminAgentManagementProps> = ({ initialTab = 'agents' }) => {
  const {
    allProfiles,
    approveAgent,
    rejectAgent,
    suspendAgent,
    approveAgentKyc,
    rejectAgentKyc,
    pendingLoginOtps
  } = useAuth();
  const { bookings, commissions, settings } = useData();

  const [activeTab, setActiveTab] = useState<'agents' | 'kyc_desk' | 'security_otp_desk'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  
  // Document viewer modal
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; url: string } | null>(null);

  // Rejection modal
  const [rejectingAgentId, setRejectingAgentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const agents = allProfiles.filter((p) => p.role === 'agent' || (!p.role && p.agent_status));

  const pendingKycCount = agents.filter(
    (a) => a.kyc_status && a.kyc_status.toLowerCase().trim() === 'pending'
  ).length;

  const nowIsoStr = new Date().toISOString();
  const activeOtpCount = pendingLoginOtps
    ? pendingLoginOtps.filter((o) => o.status === 'pending' && o.expires_at > nowIsoStr).length
    : 0;

  const filteredAgents = agents.filter((a) => {
    return (
      a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.mobile.includes(searchTerm) ||
      a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.shop_name && a.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const kycAgents = agents
    .filter((a) => {
      const status = a.kyc_status ? a.kyc_status.toLowerCase().trim() : 'not_submitted';
      if (kycFilter === 'all') return status !== 'not_submitted';
      return status === kycFilter;
    })
    .sort((a, b) => {
      const aPending = a.kyc_status?.toLowerCase().trim() === 'pending';
      const bPending = b.kyc_status?.toLowerCase().trim() === 'pending';
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;
      return 0;
    });

  const handleApproveKyc = async (agentId: string) => {
    await approveAgentKyc(agentId);
  };

  const handleConfirmRejectKyc = async () => {
    if (!rejectingAgentId) return;
    await rejectAgentKyc(rejectingAgentId, rejectionReason.trim() || 'दस्तावेज अस्पष्ट या नाम मेल नहीं खा रहा है।');
    setRejectingAgentId(null);
    setRejectionReason('');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ग्रामीण एजेंट प्रबंधन एवं KYC सत्यापन
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Agent Management, Aadhaar & PAN KYC Review Desk, and Verified Tick (✓) Allocation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200">
            Total Agents: {agents.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            KYC Pending: {pendingKycCount}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
            activeTab === 'agents'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>सभी एजेंट सूची ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc_desk')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 relative ${
            activeTab === 'kyc_desk'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>KYC सत्यापन डेस्क (KYC Desk)</span>
          {pendingKycCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 animate-pulse">
              {pendingKycCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security_otp_desk')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 relative ${
            activeTab === 'security_otp_desk'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>सुरक्षा एवं OTP डेस्क (Security)</span>
          {activeOtpCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-900 animate-pulse">
              {activeOtpCount} Active
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ALL AGENTS */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
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
                    {/* Header with avatar & status badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar with Verified Tick */}
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center font-black text-slate-700">
                            {ag.avatar_url ? (
                              <img src={ag.avatar_url} alt={ag.full_name} className="w-full h-full object-cover" />
                            ) : (
                              ag.full_name.charAt(0)
                            )}
                          </div>
                          {ag.photo_verified && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
                              title="Verified Agent"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="text-base font-black text-slate-900">{ag.full_name}</h2>
                            {ag.photo_verified && (
                              <span title="Verified Photo ✓">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-orange-600 font-semibold mt-0.5">
                            {ag.shop_name || 'SafarGo Partner Point'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                            ag.agent_status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ag.agent_status === 'pending_approval'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {ag.agent_status.replace(/_/g, ' ')}
                        </span>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            ag.kyc_status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ag.kyc_status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : ag.kyc_status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          KYC: {ag.kyc_status || 'not_submitted'}
                        </span>
                      </div>
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
                    {ag.kyc_status === 'pending' && (
                      <button
                        onClick={() => {
                          setActiveTab('kyc_desk');
                          setKycFilter('pending');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold transition flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Review KYC
                      </button>
                    )}

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
      )}

      {/* TAB 2: KYC VERIFICATION DESK */}
      {activeTab === 'kyc_desk' && (
        <div className="space-y-6">
          {/* KYC Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">फ़िल्टर:</span>
              <button
                onClick={() => setKycFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  kycFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                सभी जमा KYC
              </button>
              <button
                onClick={() => setKycFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  kycFilter === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>जांच हेतु लंबित (Pending)</span>
                {pendingKycCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-amber-800 rounded-full text-[10px]">
                    {pendingKycCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setKycFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  kycFilter === 'verified'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                सत्यापित (Verified ✓)
              </button>
              <button
                onClick={() => setKycFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  kycFilter === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                अस्वीकृत (Rejected)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              कुल प्रदर्शित: {kycAgents.length}
            </div>
          </div>

          {/* KYC Agents List */}
          {kycAgents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
              <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">कोई KYC आवेदन नहीं मिला</h3>
              <p className="text-xs">चुने गए फ़िल्टर के अंतर्गत वर्तमान में कोई रिकॉर्ड नहीं है।</p>
            </div>
          ) : (
            <div className="space-y-6">
              {kycAgents.map((ag) => {
                const waText = encodeURIComponent(
                  `नमस्ते ${ag.full_name},\nSafarGo एडमिन टीम से आपकी आधार व पैन KYC के संबंध में...`
                );

                return (
                  <div
                    key={ag.id}
                    className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-6 sm:p-7 space-y-6 hover:border-slate-300 transition"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-4">
                        {/* Profile Photo with Verified Tick */}
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-100 flex items-center justify-center font-black text-2xl text-slate-700">
                            {ag.avatar_url ? (
                              <img
                                src={ag.avatar_url}
                                alt={ag.full_name}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                                onClick={() =>
                                  setSelectedDoc({
                                    title: `${ag.full_name} - प्रोफ़ाइल फ़ोटो / सेल्फी`,
                                    url: ag.avatar_url!
                                  })
                                }
                              />
                            ) : (
                              ag.full_name.charAt(0)
                            )}
                          </div>

                          {ag.photo_verified ? (
                            <div
                              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-md"
                              title="Verified Photo ✓"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div
                              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center border-2 border-white shadow-md font-bold text-[10px]"
                              title="Unverified Photo"
                            >
                              !
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900">{ag.full_name}</h2>
                            {ag.photo_verified && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified Partner ✓</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-orange-600 font-bold mt-0.5">
                            {ag.shop_name || 'जन सेवा केंद्र'} • कोड: {ag.referral_code || ag.id}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            📍 {ag.city}, {ag.district} ({ag.address})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <a
                          href={`https://wa.me/91${ag.mobile.replace(/\D/g, '')}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp संपर्क</span>
                        </a>

                        <span
                          className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase border ${
                            ag.kyc_status === 'verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ag.kyc_status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {ag.kyc_status === 'verified'
                            ? 'Verified ✓'
                            : ag.kyc_status === 'pending'
                            ? 'Pending Review'
                            : 'Rejected'}
                        </span>
                      </div>
                    </div>

                    {/* Documents & Bank Details 3-Col Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* 1. Aadhaar Card Card */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-orange-500" />
                            <span>आधार कार्ड (12 अंक)</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">UIDAI</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">आधार संख्या:</span>
                          <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                            {ag.aadhaar_number
                              ? ag.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
                              : 'उपलब्ध नहीं'}
                          </span>
                        </div>

                        {/* Aadhaar Images */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {ag.aadhaar_front_url ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDoc({
                                  title: `${ag.full_name} - आधार कार्ड (Front)`,
                                  url: ag.aadhaar_front_url!
                                })
                              }
                              className="group relative rounded-xl overflow-hidden border border-slate-300 bg-white aspect-4/3 flex items-center justify-center hover:border-orange-500 transition"
                            >
                              <img
                                src={ag.aadhaar_front_url}
                                alt="Aadhaar Front"
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-[10px] font-bold gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Front ज़ूम</span>
                              </div>
                            </button>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 p-2 text-center text-[10px] text-slate-400 flex items-center justify-center">
                              Front फोटो नहीं
                            </div>
                          )}

                          {ag.aadhaar_back_url ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDoc({
                                  title: `${ag.full_name} - आधार कार्ड (Back)`,
                                  url: ag.aadhaar_back_url!
                                })
                              }
                              className="group relative rounded-xl overflow-hidden border border-slate-300 bg-white aspect-4/3 flex items-center justify-center hover:border-orange-500 transition"
                            >
                              <img
                                src={ag.aadhaar_back_url}
                                alt="Aadhaar Back"
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-[10px] font-bold gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Back ज़ूम</span>
                              </div>
                            </button>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 p-2 text-center text-[10px] text-slate-400 flex items-center justify-center">
                              Back फोटो नहीं
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. PAN Card Card */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-blue-500" />
                            <span>PAN कार्ड (10 अक्षर)</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">Income Tax Dept</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">PAN संख्या:</span>
                          <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                            {ag.pan_number || 'उपलब्ध नहीं'}
                          </span>
                        </div>

                        {/* PAN Image */}
                        <div className="pt-1">
                          {ag.pan_card_url ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDoc({
                                  title: `${ag.full_name} - PAN कार्ड`,
                                  url: ag.pan_card_url!
                                })
                              }
                              className="group relative rounded-xl overflow-hidden border border-slate-300 bg-white w-full aspect-16/9 flex items-center justify-center hover:border-blue-500 transition"
                            >
                              <img
                                src={ag.pan_card_url}
                                alt="PAN Card"
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-[10px] font-bold gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>PAN कार्ड ज़ूम करें</span>
                              </div>
                            </button>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-[10px] text-slate-400">
                              PAN फोटो अपलोड नहीं है
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Bank & Payout Details */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-500" />
                            <span>पेआउट बैंक खाता व UPI</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">Withdrawals</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">खाताधारक:</span>
                            <span className="font-bold text-slate-900">{ag.bank_account_holder || ag.full_name}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 block">बैंक का नाम:</span>
                            <span className="font-bold text-slate-900">{ag.bank_name || 'N/A'}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-400 block">खाता संख्या:</span>
                              <span className="font-mono font-bold text-slate-900">{ag.bank_account_number || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">IFSC कोड:</span>
                              <span className="font-mono font-bold text-slate-900">{ag.bank_ifsc || 'N/A'}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 block">UPI ID:</span>
                            <span className="font-mono font-bold text-slate-900">{ag.bank_upi_id || 'उपलब्ध नहीं'}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        {ag.kyc_submitted_at && (
                          <span>
                            जमा तिथि: {new Date(ag.kyc_submitted_at).toLocaleString('en-IN')}
                          </span>
                        )}
                        {ag.kyc_verified_at && (
                          <span className="ml-3 text-emerald-700 font-semibold">
                            सत्यापन तिथि: {new Date(ag.kyc_verified_at).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {ag.kyc_status !== 'verified' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingAgentId(ag.id);
                                setRejectionReason('');
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition"
                            >
                              अस्वीकृत करें (Reject)
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApproveKyc(ag.id)}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>KYC स्वीकृत करें व Verified Tick दें ✅</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Verified Tick सक्रिय है</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectingAgentId(ag.id);
                                setRejectionReason('दस्तावेज़ में संशोधन आवश्यक है।');
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition"
                            >
                              पुनः जांच / Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & LIVE OTP DESK */}
      {activeTab === 'security_otp_desk' && <AdminSecurityDesk />}

      {/* Document Zoom Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{selectedDoc.title}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex justify-center bg-slate-100 max-h-[75vh] overflow-auto">
              <img
                src={selectedDoc.url}
                alt={selectedDoc.title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-md border"
              />
            </div>
          </div>
        </div>
      )}

      {/* KYC Rejection Modal */}
      {rejectingAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">KYC अस्वीकृत करने का कारण</h3>
                <p className="text-xs text-slate-500">यह कारण एजेंट के डैशबोर्ड पर दिखाई देगा</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="उदा. आधार कार्ड की फोटो स्पष्ट नहीं है, कृपया साफ फोटो अपलोड करें।"
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingAgentId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmRejectKyc}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                अस्वीकृत करें (Confirm Reject)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
