import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Download,
  Smartphone,
  Building2,
  PlusCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { PayoutRequestModal } from './PayoutRequestModal';
import { AgentKycModal } from './AgentKycModal';

export const AgentCommissionLedger: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    agentCommissions,
    salaryRecords,
    settings,
    agentBookings,
    agentPayoutRequests
  } = useData();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // Current month confirmed count
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthConfirmed = agentBookings.filter(
    (b) => b.status === 'confirmed' && b.created_at.startsWith(currentMonth)
  ).length;

  const targetCount = settings.monthly_target;
  const remaining = Math.max(0, targetCount - currentMonthConfirmed);
  const progressPercent = Math.min(100, Math.round((currentMonthConfirmed / targetCount) * 100));

  // Current agent's salary records
  const mySalaries = salaryRecords.filter((s) => s.agent_id === currentUser?.id);

  const totalCredited = agentCommissions
    .filter((c) => c.status === 'credited')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalReversed = agentCommissions
    .filter((c) => c.status === 'reversed')
    .reduce((sum, c) => sum + Math.abs(c.amount), 0);

  const netCommission = totalCredited - totalReversed;

  // Payout amounts
  const approvedPayouts = agentPayoutRequests
    .filter((p) => p.agent_id === currentUser?.id && p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = agentPayoutRequests
    .filter((p) => p.agent_id === currentUser?.id && p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Check if 150 target is met
  const isTargetMet = currentMonthConfirmed >= targetCount;
  // Salary Base Model: 150 bookings guarantees ₹5,000 base salary!
  // If agent did not withdraw along the way, they receive the full ₹5,000 on Sunday.
  const effectiveTotalEarnings = isTargetMet
    ? Math.max(netCommission, settings.monthly_salary)
    : netCommission;

  const availableBalance = Math.max(0, effectiveTotalEarnings - approvedPayouts - pendingPayouts);

  // CSV Statement Export
  const handleExportCsv = () => {
    if (agentCommissions.length === 0) return;
    const headers = ['Transaction ID', 'Booking ID / Code', 'Amount (₹)', 'Status', 'Date & Time', 'Details'];
    const rows = agentCommissions.map((c) => [
      c.id,
      c.booking_code || c.booking_id || '',
      c.amount.toFixed(2),
      c.status,
      new Date(c.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafarGo_Commission_Statement_${currentUser?.mobile || 'Agent'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            कमीशन खाता एवं मासिक वेतन (Commission & Salary Ledger)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            लेजर रिकॉर्ड्स ही वित्तीय प्रामाणिकता का मुख्य स्रोत हैं (Ledger as Source of Truth)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {agentCommissions.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV स्टेटमेंट डाउनलोड</span>
            </button>
          )}

          {currentUser?.kyc_status === 'verified' ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>KYC Verified ✓</span>
            </span>
          ) : (
            <button
              onClick={() => setIsKycModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>KYC पूरा करें</span>
            </button>
          )}

          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>पैसे निकालें (Request Payout)</span>
          </button>
        </div>
      </div>

      {/* Sunday Payout Cycle & Salary Base Model Guidance */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-indigo-500 text-white">
                साप्ताहिक पेआउट दिवस: हर रविवार (Every Sunday)
              </span>
              {isTargetMet ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🎯 150 लक्ष्य पूर्ण! ₹5,000 सैलरी बेस अनलॉक
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {remaining} बुकिंग शेष ₹5,000 सैलरी बेस हेतु
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>सैलरी बेस नियम:</strong> 150 बुकिंग पूरी करने पर यदि आप बीच में विथड्रॉल नहीं करते हैं, तो आगामी रविवार को पूरा ₹5,000 एकमुश्त मिलेगा। यदि आप महीने के दौरान आंशिक निकासी कर चुके हैं (अब तक ₹{(approvedPayouts + pendingPayouts).toFixed(2)}), तो 150 टारगेट होने पर शेष राशि आगामी रविवार को ट्रांसफर होगी।
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-indigo-200 block">आगामी रविवार देय राशि</span>
          <span className="text-xl font-black text-amber-300">
            ₹{availableBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Target Progress Card */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <Award className="w-4 h-4" />
              मासिक लक्ष्य एवं सैलरी बेस (Monthly Salary Base) • {currentMonth}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              150 बुकिंग्स = ₹{settings.monthly_salary.toLocaleString('en-IN')} की गारंटीड सैलरी
            </h2>
            <p className="text-orange-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              सफ़ारगो सैलरी बेस मॉडल: बिना विथड्रॉल के 150 बुकिंग पूरी करने पर पूरा ₹{settings.monthly_salary.toLocaleString('en-IN')} का फिक्स्ड वेतन हर रविवार चक्र में सीधे आपके बैंक/UPI में! सामान्य कमीशन ₹{settings.commission_rate.toFixed(2)} प्रति टिकट।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-48">
            <span className="text-xs text-orange-200 uppercase font-bold tracking-wider block">Target Status</span>
            <span className="text-3xl font-black mt-1 block">
              {currentMonthConfirmed} / {targetCount}
            </span>
            <span className="text-xs text-orange-100 mt-1 block font-medium">
              {remaining > 0 ? `${remaining} बुकिंग्स शेष` : 'बधाई! ₹5,000 सैलरी बेस अनलॉक 🎉'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-orange-100">
            <span>प्रगति: {progressPercent}%</span>
            <span>लक्ष्य: {targetCount} Bookings (₹5,000 Guaranteed Base)</span>
          </div>
          <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Financial Summary Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">कुल अर्जित कमीशन</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">₹{totalCredited.toFixed(2)}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ₹{settings.commission_rate.toFixed(2)} प्रति कन्फर्म टिकट
            </p>
          </div>
        </div>

        {/* Reversals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">रिवर्सल (कैंसिलेशन)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600">-₹{totalReversed.toFixed(2)}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              रद्द टिकटों पर कमीशन कटौती
            </p>
          </div>
        </div>

        {/* Paid / Pending Out */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">निकासी हो चुकी राशि</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-600">₹{approvedPayouts.toFixed(2)}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {pendingPayouts > 0 ? `(₹${pendingPayouts.toFixed(2)} प्रक्रियाधीन)` : 'खाते में ट्रांसफर पूर्ण'}
            </p>
          </div>
        </div>

        {/* Available for Withdrawal */}
        <div className="bg-white p-5 rounded-2xl border-2 border-orange-500 shadow-sm relative overflow-hidden bg-orange-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-orange-700 uppercase">निकासी योग्य शेष</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-orange-600">₹{availableBalance.toFixed(2)}</span>
            <p className="text-[11px] text-orange-800 font-semibold mt-0.5">
              तत्काल UPI / बैंक ट्रांसफर हेतु उपलब्ध
            </p>
          </div>
        </div>

      </div>

      {/* Payout History Section (if any requests exist) */}
      {agentPayoutRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                निकासी अनुरोध इतिहास (Payout Requests History)
              </h2>
              <p className="text-xs text-slate-500">
                आपके द्वारा बैंक खाते या UPI में ट्रांसफर हेतु किए गए सभी अनुरोध
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              कुल {agentPayoutRequests.length} अनुरोध
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payout Method</th>
                  <th className="p-4">Account / UPI Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Bank UTR / Ref</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentPayoutRequests.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-600">{p.id}</td>
                    <td className="p-4 font-black text-sm text-slate-900">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 capitalize">
                        {p.payout_method === 'upi' ? (
                          <>
                            <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                            UPI
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            Bank Account
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-800">
                      {p.payout_method === 'upi' ? (
                        p.upi_id
                      ) : (
                        <div>
                          <div>A/C: {p.account_number}</div>
                          <div className="text-[10px] text-slate-400 font-sans">IFSC: {p.ifsc_code} ({p.account_holder_name})</div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {p.status === 'pending' && <Clock className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700">
                      {p.admin_reference || (
                        <span className="text-slate-400 font-sans font-normal text-[11px]">
                          {p.admin_notes || 'प्रतीक्षारत'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(p.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salary Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">मासिक वेतन रिकॉर्ड्स (Monthly Salary Records)</h2>
            <p className="text-xs text-slate-500">
              वेतन रिकॉर्ड्स कमीशन से अलग रखे जाते हैं और एडमिन द्वारा सत्यापित किए जाते हैं
            </p>
          </div>
        </div>

        {mySalaries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            वर्तमान में कोई वेतन चक्र सक्रिय नहीं है।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mySalaries.map((sal) => (
              <div key={sal.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{sal.month_year}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sal.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sal.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sal.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    बुकिंग प्रगति: <strong>{sal.confirmed_bookings}</strong> / {sal.target_bookings} • लक्ष्य: {sal.target_met ? 'प्राप्त (Met)' : 'प्रगति पर (In Progress)'}
                  </p>
                  {sal.payment_reference && (
                    <p className="text-xs text-emerald-700 font-mono">
                      भुगतान संदर्भ (UTR/Ref): {sal.payment_reference}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">मानदेय राशि</span>
                  <span className="text-xl font-black text-slate-900">
                    ₹{sal.payable_salary.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Commission Ledger Source of Truth Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">कमीशन लेजर एंट्रीज (Commission Ledger Records)</h2>
            <p className="text-xs text-slate-500">
              प्रत्येक कन्फर्म टिकट पर केवल एक बार डेटाबेस ट्रांजेक्शन से कमीशन क्रेडिट होता है।
            </p>
          </div>
          {agentCommissions.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV एक्सपोर्ट</span>
            </button>
          )}
        </div>

        {agentCommissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            अभी तक कोई कमीशन एंट्री दर्ज नहीं है। टिकट कन्फर्म होने पर यहाँ लेजर रिकॉर्ड दिखाई देगा।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-600">{c.id}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {c.booking_code || c.booking_id}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-black text-sm ${
                          c.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {c.amount >= 0 ? `+₹${c.amount.toFixed(2)}` : `-₹${Math.abs(c.amount).toFixed(2)}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'credited'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'reversed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(c.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={c.notes}>
                      {c.notes || 'Commission transaction'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <PayoutRequestModal
          availableBalance={availableBalance}
          onClose={() => setIsPayoutModalOpen(false)}
          onOpenKyc={() => setIsKycModalOpen(true)}
        />
      )}

      {/* KYC Modal */}
      <AgentKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

    </div>
  );
};
