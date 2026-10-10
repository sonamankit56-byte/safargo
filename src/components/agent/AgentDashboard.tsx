import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CountdownTimer } from '../common/CountdownTimer';
import { StatusBadge } from '../common/StatusBadge';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Target,
  Award,
  Wallet,
  XCircle,
  Building2,
  ChevronRight,
  Gift,
  Phone,
  Megaphone
} from 'lucide-react';
import { NewFeaturesSection } from './NewFeaturesSection';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { WalletRechargeModal } from './WalletRechargeModal';

interface AgentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, isApprovedAgent } = useAuth();
  const { agentBookings, agentCommissions, agentSalaryRecord, settings, agentWalletBalance } = useData();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Current calendar month in Asia/Kolkata
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Metrics calculations
  const stats = useMemo(() => {
    let todayRequests = 0;
    let todayConfirmed = 0;
    let monthRequests = 0;
    let monthConfirmed = 0;
    let pending = 0;
    let rejected = 0;
    let expired = 0;

    agentBookings.forEach((b) => {
      const bDate = b.created_at.split('T')[0];
      const bMonth = b.created_at.substring(0, 7);

      if (bDate === todayStr) {
        todayRequests++;
        if (b.status === 'confirmed') todayConfirmed++;
      }

      if (bMonth === currentMonth) {
        monthRequests++;
        if (b.status === 'confirmed') monthConfirmed++;
      }

      if (b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') {
        pending++;
      } else if (b.status === 'rejected') {
        rejected++;
      } else if (b.status === 'expired') {
        expired++;
      }
    });

    // Commission metrics from ledger source of truth
    let totalEarned = 0;
    let paidCommission = 0;

    agentCommissions.forEach((c) => {
      if (c.status === 'credited') {
        totalEarned += c.amount;
      } else if (c.status === 'reversed') {
        totalEarned += c.amount; // Negative amount
      } else if (c.status === 'paid') {
        paidCommission += c.amount;
      }
    });

    const pendingCommission = Math.max(0, totalEarned - paidCommission);

    // Target calculation
    const monthlyTarget = settings.monthly_target;
    const remainingToTarget = Math.max(0, monthlyTarget - monthConfirmed);
    const progressPercent = Math.min(100, Math.round((monthConfirmed / monthlyTarget) * 100));

    return {
      todayRequests,
      todayConfirmed,
      monthRequests,
      monthConfirmed,
      pending,
      rejected,
      expired,
      totalEarned,
      pendingCommission,
      paidCommission,
      monthlyTarget,
      remainingToTarget,
      progressPercent,
    };
  }, [agentBookings, agentCommissions, todayStr, currentMonth, settings.monthly_target]);

  const recentBookings = useMemo(() => {
    return [...agentBookings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [agentBookings]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Account Verification Status Banner (If Pending) */}
      {!isApprovedAgent && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-amber-900">
              खाता सत्यापन प्रगति पर है (Account Pending Approval)
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              नमस्ते {currentUser?.full_name}, आपका एजेंट रजिस्ट्रेशन प्राप्त हो गया है। सफ़ारगो एडमिन टीम आपके जन सेवा केंद्र / दुकान का सत्यापन कर रही है।
              सत्यापन पूरा होते ही आप बुकिंग और ₹{settings.commission_rate.toFixed(2)} कमीशन कमाना शुरू कर सकेंगे।
            </p>
          </div>
        </div>
      )}

      {/* Mandatory WhatsApp Active Notice for 15-Minute Timer */}
      <div className="bg-emerald-950 text-white border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-900">
              जरूरी सूचना (Mandatory Rule)
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-emerald-200">
            15 मिनट के टाइमर में एजेंट को WhatsApp पर एक्टिव रहना अनिवार्य है!
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            टिकट सबमिट करने के बाद <strong>SafarGo की टीम आपसे WhatsApp पर ही ऑपरेटर सीट, बोर्डिंग पॉइंट और टिकट की डिटेल मांगेगी</strong>। कृपया 15 मिनट की विंडो में अपना WhatsApp चेक करते रहें ताकि आपकी बुकिंग समय पर कन्फर्म हो सके।
          </p>
        </div>
      </div>

      {/* Refer & Earn ₹50 Incentive Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center shrink-0 font-bold shadow">
            <Gift className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
              <span>रेफर करें और पाएं ₹50 नकद बोनस!</span>
              <span className="text-[10px] bg-slate-900 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                5 बुकिंग अनिवार्य
              </span>
            </h3>
            <p className="text-xs text-orange-100">
              अपने मित्र सीएससी ऑपरेटर को जोड़ें। उनके 5 कन्फर्म बुकिंग्स पूरे होते ही आपके खाते में ₹50 क्रेडिट होंगे!
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('refer-earn')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow"
        >
          <span>रेफरल डैशबोर्ड देखें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Weekly Sunday Payout Schedule & Salary Base Notice */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-500 text-white tracking-wider">
                  साप्ताहिक पेआउट दिवस: हर रविवार (Weekly Payout: Every Sunday)
                </span>
                <span className="text-xs font-bold text-amber-300">
                  ⚡ स्वतः बैंक / UPI ट्रांसफर
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                हर रविवार को कमीशन व वेतन भुगतान • 150 बुकिंग पर पूरा ₹5,000 फिक्स्ड वेतन!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                <strong>सैलरी बेस मॉडल (Salary Base Model):</strong> यदि आप महीने के दौरान कमीशन विथड्रॉ नहीं करते हैं, तो 150 कन्फर्म बुकिंग का लक्ष्य पूरा होने पर आपको आगामी रविवार को पूरा <strong>₹5,000 एकमुश्त वेतन</strong> मिलेगा! यदि आप बीच में आंशिक विथड्रॉल करते हैं, तो 150 पूरा होने पर शेष राशि रविवार को मिलेगी।
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('commission')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shrink-0 self-start md:self-center shadow-md active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>कमीशन व पेआउट खाता</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Welcome & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <SafarGoLogo size="lg" variant="light" showTagline={false} />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-orange-400">
                  SafarGo Agent Portal
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  {currentUser?.shop_name || 'Partner Outlet'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                नमस्ते, {currentUser?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                "अब हर सफर होगा आसान" • प्रत्येक कन्फर्म बस टिकट पर ₹{settings.commission_rate.toFixed(2)} सुरक्षित कमीशन • साप्ताहिक रविवार पेआउट।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>+ वॉलेट रिचार्ज (Min ₹{settings.min_wallet_recharge.toLocaleString('en-IN')})</span>
            </button>
            <button
              onClick={() => onNavigate('new-booking')}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              नया टिकट बुक करें
            </button>
            <button
              onClick={() => onNavigate('my-bookings')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              मेरी बुकिंग्स ({agentBookings.length})
            </button>
          </div>
        </div>
      </div>

      {/* Target & Fixed Salary Progress Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  मासिक लक्ष्य एवं निश्चित मानदेय (Monthly Target & Salary)
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  {currentMonth}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                150 पात्र कन्फर्म बुकिंग पूरा करने पर <strong>₹{settings.monthly_salary.toLocaleString('en-IN')} का निश्चित मानदेय</strong> अनलॉक होता है।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Guaranteed Salary Base</span>
              <span className="text-xl font-black text-slate-900">
                ₹{settings.monthly_salary.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Commission Rate</span>
              <span className="text-xl font-black text-emerald-600">
                ₹{settings.commission_rate.toFixed(2)} <span className="text-xs font-normal text-slate-500">/booking</span>
              </span>
            </div>
          </div>
        </div>

        {/* Salary Base Model Explanation Banner inside card */}
        <div className="mb-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">
              💡 सैलरी बेस मॉडल नियम (Salary Base Benefit):
            </p>
            <p className="text-amber-800 leading-relaxed">
              150 टिकट का सामान्य कमीशन ₹{((stats.monthlyTarget) * settings.commission_rate).toFixed(2)} बनता है, परन्तु SafarGo सैलरी बेस मॉडल के तहत 150 बुकिंग पूरी करने पर आपको <strong>पूरा ₹{settings.monthly_salary.toLocaleString('en-IN')}</strong> मिलता है! यदि आप बीच में विथड्रॉल नहीं करते हैं, तो 150 पूरा होने पर आगामी रविवार को पूरे ₹5,000 एकमुश्त आपके बैंक खाते में ट्रांसफर किए जाएंगे।
            </p>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">
              प्रगति (Target Progress): {stats.monthConfirmed} / {stats.monthlyTarget} Confirmed Bookings
            </span>
            <span className="text-orange-600 font-mono">
              {stats.progressPercent}% ({stats.remainingToTarget > 0 ? `${stats.remainingToTarget} शेष` : 'Target Achieved! 🎉 Sunday Payout Eligible!'})
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>0 Bookings</span>
            <span>75 (Halfway)</span>
            <span className="font-bold text-orange-700">150 Goal (₹5,000 Full Salary Base)</span>
          </div>
        </div>
      </div>


      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        
        {/* Agent Prepaid Wallet Balance */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl border border-blue-800 shadow-md flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">प्रीपेड वॉलेट</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ₹{agentWalletBalance.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-800/80">
              <span className="text-[10px] text-blue-300">
                Min ₹{settings.min_wallet_recharge.toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="text-[11px] font-black text-yellow-300 hover:text-yellow-200 underline"
              >
                + जोड़ें
              </button>
            </div>
          </div>
        </div>

        {/* Total Commission Earned */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">कुल कमीशन</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              ₹{stats.totalEarned.toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹{stats.pendingCommission.toFixed(2)} देय (Payable)
            </p>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">आज की बुकिंग</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.todayConfirmed}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.todayRequests} कुल रिक्वेस्ट आज
            </p>
          </div>
        </div>

        {/* Pending Confirmations */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">लंबित रिक्वेस्ट</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {stats.pending}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              15 मिनट विंडो में ऑपरेटर चेकिंग
            </p>
          </div>
        </div>

        {/* Monthly Confirmed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">महीने के कन्फर्म टिकट</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-orange-600">
              {stats.monthConfirmed}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.monthRequests} कुल मासिक रिक्वेस्ट
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Status Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Expired Requests:</span>
          <span className="font-bold text-slate-800">{stats.expired}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Rejected Requests:</span>
          <span className="font-bold text-rose-700">{stats.rejected}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Commission Paid:</span>
          <span className="font-bold text-emerald-700">₹{stats.paidCommission.toFixed(2)}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Salary Status:</span>
          <span className="font-bold uppercase text-orange-700">
            {agentSalaryRecord?.status || 'In Progress'}
          </span>
        </div>
      </div>

      {/* New Admin Features & Dynamic Services Section */}
      <NewFeaturesSection onNavigateTab={onNavigate} />

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">हालिया बुकिंग रिक्वेस्ट (Recent Requests)</h2>
            <p className="text-xs text-slate-500">लाइव 15 मिनट रिस्पॉन्स टाइमर और स्टेटस</p>
          </div>
          <button
            onClick={() => onNavigate('my-bookings')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
          >
            सभी देखें <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="text-sm">अभी तक कोई बुकिंग रिक्वेस्ट नहीं बनाई गई है।</p>
            <button
              onClick={() => onNavigate('new-booking')}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
            >
              पहली टिकट बुक करें
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {b.booking_code}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {b.customer_name} • <span className="font-medium text-slate-600">{b.from_city} → {b.to_city}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    यात्रा: {b.journey_date} • {b.passenger_count} यात्री • सीट: {b.seat_category.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">कुल किराया</span>
                    <span className="text-sm font-black text-slate-900">₹{b.total_estimated_amount}</span>
                  </div>

                  <CountdownTimer
                    deadlineAt={b.deadline_at}
                    status={b.status}
                    compact
                  />

                  <button
                    onClick={() => onNavigate('my-bookings')}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition"
                    aria-label="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Recharge Modal */}
      {showRechargeModal && (
        <WalletRechargeModal onClose={() => setShowRechargeModal(false)} />
      )}

    </div>
  );
};
