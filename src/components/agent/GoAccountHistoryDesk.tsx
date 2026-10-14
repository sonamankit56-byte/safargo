import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  History,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Wallet,
  Sparkles,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const GoAccountHistoryDesk: React.FC = () => {
  const {
    agentWalletRecharges,
    agentWalletTransactions,
    agentCommissions,
    agentWalletBalance
  } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'recharges' | 'commissions' | 'transactions'>('recharges');
  const [searchTerm, setSearchTerm] = useState('');
  const [nowTime, setNowTime] = useState(Date.now());

  // Keep live second-by-second countdown for the 3-minute timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingRecharges = agentWalletRecharges.filter((r) => r.status === 'pending');
  const approvedRecharges = agentWalletRecharges.filter((r) => r.status === 'approved');
  const rejectedRecharges = agentWalletRecharges.filter((r) => r.status === 'rejected');

  // Filter commissions
  const bookingCommissions = agentCommissions.filter(
    (c) => c.status === 'credited' && c.entry_type === 'booking_commission'
  );

  return (
    <div className="space-y-6">
      {/* Top Balance & History Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-100 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              वर्तमान Go Wallet बैलेंस
            </span>
          </div>
          <div className="text-2xl font-black">
            ₹{agentWalletBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-orange-100">
            कन्फर्म टिकट पर फ्लैट ₹20 इंस्टेंट कमीशन प्राप्त
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            3-मिनट ऐड मनी अनुरोध
          </span>
          <div className="text-2xl font-black text-slate-900">
            {pendingRecharges.length} <span className="text-xs font-normal text-slate-500">लंबित सत्यापन</span>
          </div>
          <p className="text-[11px] text-slate-400">
            3 मिनट में स्वचालित AI व बैंकिंग सत्यापन
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            कुल अर्जित कमीशन (₹20/टिकट)
          </span>
          <div className="text-2xl font-black text-emerald-600">
            ₹{bookingCommissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            {bookingCommissions.length} सफल टिकट बुकिंग से
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('recharges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'recharges'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ऐड मनी अनुरोध व 3-मिनट टाइमर ({agentWalletRecharges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'commissions'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>कमीशन लेज़र (+₹20 इंस्टेंट) ({bookingCommissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>सम्पूर्ण खाता-बही ({agentWalletTransactions.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="खोजें (UTR, Booking ID)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      {/* TAB 1: ADD MONEY REQUESTS WITH LIVE 3-MINUTE TIMERS */}
      {activeTab === 'recharges' && (
        <div className="space-y-4">
          {/* Active Pending with 3-minute timers first */}
          {pendingRecharges.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-spin text-amber-600" />
                प्रगति पर 3-मिनट लाइव सत्यापन अनुरोध ({pendingRecharges.length})
              </h4>

              {pendingRecharges.map((r) => {
                let remainingSec = 0;
                let percentRemaining = 0;
                if (r.timer_ends_at) {
                  const targetTime = new Date(r.timer_ends_at).getTime();
                  remainingSec = Math.max(0, Math.floor((targetTime - nowTime) / 1000));
                  percentRemaining = Math.min(100, Math.max(0, (remainingSec / 180) * 100));
                }
                const mins = Math.floor(remainingSec / 60);
                const secs = remainingSec % 60;
                const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-3xl bg-amber-50/60 border-2 border-amber-300 shadow-sm space-y-3 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {formattedTime}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900">
                              +₹{Number(r.amount).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full animate-pulse">
                              ⏳ 3-मिनट AI सत्यापन प्रगति पर
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-mono">
                            UTR / Ref: <span className="font-bold text-slate-900">{r.utr_number}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-amber-900">
                          {remainingSec > 0 ? `${formattedTime} मिनट शेष` : 'सत्यापन संपन्न — स्वतः क्रेडिट हो रहा है...'}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          3 मिनट पूर्ण होते ही या एडमिन स्वीकृति पर स्वतः जुड़ेगा
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${100 - percentRemaining}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past Approved & Rejected Recharges */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              सत्यापित एवं पूर्व ऐड मनी इतिहास
            </h4>

            {agentWalletRecharges.filter((r) => r.status !== 'pending').length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                कोई पूर्व ऐड मनी रिकॉर्ड नहीं है।
              </div>
            ) : (
              agentWalletRecharges
                .filter((r) => r.status !== 'pending')
                .filter((r) => !searchTerm || r.utr_number?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          r.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {r.status === 'approved' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">
                            ₹{Number(r.amount).toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status === 'approved' ? 'सत्यापित व क्रेडिट' : 'अस्वीकृत'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          UTR: {r.utr_number || 'N/A'} • {r.payment_method?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <div>{new Date(r.created_at).toLocaleDateString('hi-IN')}</div>
                      <span className="text-slate-500">
                        {r.status === 'approved'
                          ? r.approved_by === 'SYSTEM_3M_AUTO_VERIFY'
                            ? '⚡ 3-मिनट स्वतः AI क्रेडिट'
                            : 'एडमिन द्वारा वेरीफाइड'
                          : r.admin_notes || 'अस्वीकृत'}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSION LEDGER (+₹20 INSTANT PER BOOKING) */}
      {activeTab === 'commissions' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
            <span className="text-xs font-black text-orange-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              GO Agent गारंटी: प्रत्येक कन्फर्म बस टिकट पर फ्लैट ₹20 इंस्टेंट क्रेडिट
            </span>
            <span className="text-xs font-bold text-orange-700 font-mono">
              ₹20.00 / टिकट
            </span>
          </div>

          {bookingCommissions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-400">
              अभी कोई टिकट कमीशन दर्ज नहीं है। बस टिकट बुक करें व पुष्टि होते ही ₹20 कमीशन प्राप्त करें।
            </div>
          ) : (
            bookingCommissions
              .filter((c) => !searchTerm || c.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-600 font-mono">
                          +₹{c.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          इंस्टेंट कमीशन
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        बुकिंग ID: <span className="font-bold text-slate-800">{c.booking_code}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <div>{new Date(c.created_at).toLocaleDateString('hi-IN')}</div>
                    <span className="text-emerald-700 font-bold">कन्फर्मेशन पर क्रेडिट</span>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETE WALLET TRANSACTIONS LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {agentWalletTransactions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-400">
              कोई लेनदेन नहीं मिला।
            </div>
          ) : (
            agentWalletTransactions
              .filter(
                (t) =>
                  !searchTerm ||
                  t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.booking_code?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((t) => {
                const isPositive = Number(t.amount) > 0;
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black font-mono ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            {t.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <div>{new Date(t.created_at).toLocaleDateString('hi-IN')}</div>
                      {t.balance_after !== undefined && (
                        <div className="text-[10px] font-mono text-slate-500">
                          शेष: ₹{t.balance_after.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
};
