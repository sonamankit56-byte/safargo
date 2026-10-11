import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PromoterApplication, PromoterAppStatus } from '../../types';
import {
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  DollarSign,
  TrendingUp,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  XCircle,
  Sparkles,
  RefreshCw,
  Gift
} from 'lucide-react';

export const AdminPromoterManagement: React.FC = () => {
  const {
    promoterApplications,
    schedulePromoterInterview,
    passPromoterInterview,
    onboardPromoterPartner,
    refundPromoterFee,
    bookings,
    partnerShops,
  } = useData();
  const { allProfiles } = useAuth();
  const { success, error, info } = useToast();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interview Schedule Modal State
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<PromoterApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Onboarding Modal State
  const [selectedAppForOnboard, setSelectedAppForOnboard] = useState<PromoterApplication | null>(null);
  const [onboardingUtr, setOnboardingUtr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number>(2);

  // Compute 5 slots status
  const slots = [1, 2, 3, 4, 5].map((slotNo) => {
    const assigned = promoterApplications.find(
      (a) => a.assigned_slot === slotNo && a.status === 'onboarded_499_paid'
    );
    return {
      slotNo,
      isFilled: !!assigned,
      promoter: assigned,
    };
  });

  const filledCount = slots.filter((s) => s.isFilled).length;

  // Helper to calculate verified agents for a promoter (Compulsory >= 3 confirmed bookings rule OR 20 shops with Gold package!)
  const getPromoterVerifiedStats = (promoterCode?: string, promoterId?: string) => {
    if (!promoterCode && !promoterId) {
      return { verifiedCount: 0, totalCount: 0, shopsCount: 0, goldSubsCount: 0, isMixedAchieved: false };
    }
    const networkAgents = allProfiles.filter(
      (p) =>
        (p.promoter_code && p.promoter_code === promoterCode) ||
        (p.promoter_assigned_id && p.promoter_assigned_id === promoterId) ||
        (p.referred_by_code && p.referred_by_code === promoterCode)
    );

    const verifiedAgents = networkAgents.filter((agent) => {
      const confirmedCount = bookings.filter(
        (b) => b.agent_id === agent.id && b.status === 'confirmed'
      ).length;
      return confirmedCount >= 3;
    });

    const promoterShops = partnerShops.filter(
      (s) => s.promoter_id === promoterId || (promoterCode && s.promoter_name.includes(promoterCode))
    );

    const goldSubs = promoterShops.filter(
      (s) => s.subscription_plan_name.includes('गोल्ड') || s.monthly_fee >= 699
    );

    const isMixedAchieved = verifiedAgents.length >= 500 || (promoterShops.length >= 20 && goldSubs.length >= 20);

    return {
      verifiedCount: verifiedAgents.length,
      totalCount: networkAgents.length,
      shopsCount: promoterShops.length,
      goldSubsCount: goldSubs.length,
      isMixedAchieved,
    };
  };

  const filteredApps = promoterApplications.filter((app) => {
    if (activeFilter !== 'all' && app.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = app.applicant_name.toLowerCase().includes(q);
      const matchMobile = app.mobile.includes(q);
      const matchCity = app.city.toLowerCase().includes(q);
      const matchUtr = app.application_fee_utr.toLowerCase().includes(q);
      return matchName || matchMobile || matchCity || matchUtr;
    }
    return true;
  });

  const handleOpenScheduleModal = (app: PromoterApplication) => {
    setSelectedAppForInterview(app);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().slice(0, 10));
    setInterviewNotes('Google Meet / टेलीफोनिक सुपर एडमिन इंटरव्यू निर्धारित।');
  };

  const handleSaveInterviewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForInterview) return;
    await schedulePromoterInterview(selectedAppForInterview.id, interviewDate, interviewNotes);
    setSelectedAppForInterview(null);
  };

  const handlePassInterview = async (appId: string) => {
    await passPromoterInterview(appId);
  };

  const handleOpenOnboardModal = (app: PromoterApplication) => {
    setSelectedAppForOnboard(app);
    setOnboardingUtr('');
    // Pick first free slot
    const firstFree = slots.find((s) => !s.isFilled);
    setSelectedSlot(firstFree ? firstFree.slotNo : 1);
  };

  const handleSaveOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForOnboard) return;
    if (!onboardingUtr.trim()) {
      error('Missing UTR', 'कृपया ₹499 का UPI/UTR रेफरेंस नंबर दर्ज करें।');
      return;
    }
    await onboardPromoterPartner(selectedAppForOnboard.id, onboardingUtr, selectedSlot);
    setSelectedAppForOnboard(null);
  };

  const handleProcessRefund = async (appId: string) => {
    if (window.confirm('क्या आप इस प्रमोटर को 100% फीस (₹149 + ₹499 = ₹648) रिफंड जारी करना चाहते हैं?')) {
      await refundPromoterFee(appId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Award className="w-4 h-4" />
                सुपर एडमिन कंट्रोल डेस्क
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
                500 एजेंट टारगेट + ₹15,000 फिक्स्ड वेतन
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              सफ़ारगो प्रमोटर पार्टनर प्रबंधन
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              पूरे नेटवर्क में अधिकतम 5 पद अधिकृत हैं। प्रमोटर का काम 500 एजेंट जोड़ना (प्रति एजेंट न्यूनतम 3 कन्फर्म बस बुकिंग अनिवार्य), लोकल दुकानों का सब्सक्रिप्शन बेचना, दैनिक कॉलिंग ऑडिट करना और एजेंट अप्रूवल/KYC संभालना है।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shrink-0 text-center md:text-right min-w-[200px]">
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
              स्लॉट स्थिति (Slot Status)
            </div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {filledCount} / 5 स्लॉट फुल
            </div>
            <div className="text-xs text-emerald-300 mt-1 font-medium">
              {5 - filledCount > 0 ? `✨ ${5 - filledCount} स्लॉट अभी उपलब्ध हैं` : '🔒 सभी 5 स्लॉट भर चुके हैं'}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Slots Architecture Visual Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            5 प्रमोटर स्लॉट स्थिति (Strict 5 Slots)
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            वेतन: ₹15,000/माह | 100% रिफंड: ₹648 (3 माह लक्ष्य पर)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {slots.map(({ slotNo, isFilled, promoter }) => {
            const stats = promoter
              ? getPromoterVerifiedStats(promoter.promoter_code, promoter.id)
              : { verifiedCount: 0, totalCount: 0 };
            const progressPct = Math.min(100, Math.round((stats.verifiedCount / 500) * 100));

            return (
              <div
                key={slotNo}
                className={`rounded-2xl p-4 border transition ${
                  isFilled
                    ? 'bg-white border-indigo-200 shadow-sm'
                    : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isFilled ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    SLOT #{slotNo}
                  </span>
                  {isFilled ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      सक्रिय
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      रिक्त (Open)
                    </span>
                  )}
                </div>

                {isFilled && promoter ? (
                  <div className="space-y-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {promoter.applicant_name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{promoter.city}, {promoter.district}</span>
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600 font-bold mt-0.5">
                        {promoter.promoter_code || `PRM-MP-0${slotNo}`}
                      </div>
                    </div>

                    {/* Quality Gate Progress Meter */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>सत्यापित एजेंट (≥3 बुकिंग)</span>
                        <span className="text-indigo-600">{stats.verifiedCount} / 500</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, progressPct)}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-slate-400 text-right mt-1">
                        कुल जोड़े: {stats.totalCount} एजेंट
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-slate-500">वेतन:</span>
                      <span className="font-bold text-emerald-600">₹15,000 /माह</span>
                    </div>

                    {promoter.fee_refund_eligible ? (
                      <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        100% फीस रिफंड (₹648) पेड
                      </div>
                    ) : stats.verifiedCount >= 500 ? (
                      <button
                        onClick={() => handleProcessRefund(promoter.id)}
                        className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition"
                      >
                        <Gift className="w-3 h-3" />
                        ₹648 रिफंड जारी करें
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-400">यह स्लॉट खाली है</p>
                    <p className="text-[10px] text-slate-400 mt-1">इंटरव्यू पास उम्मीदवार को यह स्लॉट अलॉट करें</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'सभी आवेदन' },
            { id: 'applied_149_paid', label: 'आवेदन जमा (₹149)' },
            { id: 'interview_scheduled', label: 'इंटरव्यू शेड्यूल' },
            { id: 'interview_passed', label: 'इंटरव्यू पास' },
            { id: 'onboarded_499_paid', label: 'सक्रिय प्रमोटर (5 स्लॉट)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम, मोबाइल, शहर या UTR से खोजें..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            प्रमोटर उम्मीदवार सूची ({filteredApps.length})
          </h3>
          <span className="text-xs text-slate-500">
            प्रत्येक उम्मीदवार की 100% फीस रिफंड सुरक्षा समर्थित
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">कोई आवेदन नहीं मिला</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApps.map((app) => {
              const stats = getPromoterVerifiedStats(app.promoter_code, app.id);
              return (
                <div key={app.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {app.applicant_name}
                      </h4>
                      {app.assigned_slot && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                          स्लॉट #{app.assigned_slot} ({app.promoter_code})
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        app.status === 'onboarded_499_paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'interview_passed'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'interview_scheduled'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status === 'onboarded_499_paid' && 'सक्रिय प्रमोटर (₹15,000/माह)'}
                        {app.status === 'interview_passed' && 'इंटरव्यू पास (₹499 ऑनबोर्डिंग शेष)'}
                        {app.status === 'interview_scheduled' && 'इंटरव्यू शेड्यूल'}
                        {app.status === 'applied_149_paid' && 'आवेदन शुल्क ₹149 पेड'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {app.mobile}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.city}, {app.district} (MP)
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        UTR ₹149: <strong>{app.application_fee_utr}</strong>
                      </span>
                      {app.onboarding_fee_utr && (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700">
                          UTR ₹499: <strong>{app.onboarding_fee_utr}</strong>
                        </span>
                      )}
                    </div>

                    {app.experience_note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl">
                        <strong>अनुभव नोट:</strong> {app.experience_note}
                      </p>
                    )}

                    {app.interview_date && (
                      <div className="text-xs text-amber-700 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>इंटरव्यू दिनांक: {app.interview_date} ({app.interview_notes})</span>
                      </div>
                    )}
                  </div>

                  {/* Right Action Desk */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {app.status === 'applied_149_paid' && (
                      <button
                        onClick={() => handleOpenScheduleModal(app)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>इंटरव्यू शेड्यूल करें</span>
                      </button>
                    )}

                    {app.status === 'interview_scheduled' && (
                      <>
                        <button
                          onClick={() => handlePassInterview(app.id)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>इंटरव्यू पास करें</span>
                        </button>
                        <button
                          onClick={() => handleOpenScheduleModal(app)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                        >
                          री-शेड्यूल
                        </button>
                      </>
                    )}

                    {app.status === 'interview_passed' && (
                      <button
                        onClick={() => handleOpenOnboardModal(app)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>₹499 सत्यापन व स्लॉट ऑनबोर्ड करें</span>
                      </button>
                    )}

                    {app.status === 'onboarded_499_paid' && (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        <div className="text-right text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="font-bold text-indigo-700">
                            ट्रैक 1: {stats.verifiedCount}/500 एजेंट
                          </div>
                          <div className="text-[10px] text-amber-700 font-bold">
                            ट्रैक 2: {stats.goldSubsCount}/20 गोल्ड दुकान
                          </div>
                          {stats.isMixedAchieved && (
                            <div className="text-[9px] font-black text-emerald-600">
                              ✓ हाइब्रिड लक्ष्य पूर्ण
                            </div>
                          )}
                        </div>

                        {!app.fee_refund_eligible ? (
                          <button
                            onClick={() => handleProcessRefund(app.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center gap-1"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>₹648 रिफंड दें</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            100% फीस रिफंडेड
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Schedule Interview */}
      {selectedAppForInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              इंटरव्यू शेड्यूल करें - {selectedAppForInterview.applicant_name}
            </h3>
            <p className="text-xs text-slate-500">
              उम्मीदवार से 15-मिनट डिलीवरी, लोकल दुकान संपर्क एवं 500 एजेंट लक्ष्य के बारे में इंटरव्यू लें।
            </p>
            <form onSubmit={handleSaveInterviewSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  इंटरव्यू दिनांक *
                </label>
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  इंटरव्यू मोड / नोट्स
                </label>
                <input
                  type="text"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForInterview(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  शेड्यूल सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Onboard Promoter with ₹499 & Slot Number */}
      {selectedAppForOnboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              प्रमोटर ऑनबोर्ड करें - {selectedAppForOnboard.applicant_name}
            </h3>
            <p className="text-xs text-slate-500">
              उम्मीदवार का ₹499 ऑनबोर्डिंग UTR दर्ज करें और 1 से 5 में से एक स्लॉट अलॉट करें। ऑनबोर्ड होते ही इनका ₹15,000 मासिक वेतन और एजेंट अप्रूवल अधिकार शुरू हो जाएंगे।
            </p>
            <form onSubmit={handleSaveOnboard} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  स्लॉट नंबर चुनें (1 से 5) *
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-bold"
                >
                  {[1, 2, 3, 4, 5].map((num) => {
                    const occupied = slots.find((s) => s.slotNo === num && s.isFilled);
                    return (
                      <option key={num} value={num}>
                        स्लॉट #{num} {occupied ? `(वर्तमान: ${occupied.promoter?.applicant_name})` : '(रिक्त उपलब्ध)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ₹499 ऑनबोर्डिंग शुल्क UPI / UTR नंबर *
                </label>
                <input
                  type="text"
                  required
                  value={onboardingUtr}
                  onChange={(e) => setOnboardingUtr(e.target.value.trim())}
                  placeholder="उदा. 428999887766"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono tracking-wider"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <div>✓ कोड: PRM-MP-0{selectedSlot}</div>
                <div>✓ वेतन: ₹15,000 / माह</div>
                <div>✓ टारगेट: 500 एजेंट (3 बुकिंग अनिवार्य)</div>
                <div>✓ 100% रिफंड गारंटी: ₹648 (₹149 + ₹499)</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForOnboard(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  स्लॉट अलॉट व एक्टिवेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
