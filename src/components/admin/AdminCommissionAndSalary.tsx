import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SalaryRecord, PayoutRequest, WalletRechargeRequest, Profile } from '../../types';
import { AdminWalletAdjustmentModal } from './AdminWalletAdjustmentModal';
import {
  DollarSign,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  FileText,
  CreditCard,
  X,
  Smartphone,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Eye,
  Check,
  Download,
  Plus,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { PayoutStatus } from '../../types';

interface AdminCommissionAndSalaryProps {
  initialTab?: 'salaries' | 'payouts' | 'wallet' | 'ledger' | string;
}

export const AdminCommissionAndSalary: React.FC<AdminCommissionAndSalaryProps> = ({ initialTab }) => {
  const {
    commissions,
    salaryRecords,
    approveSalary,
    markSalaryPaid,
    payoutRequests,
    approvePayout,
    rejectPayout,
    updatePayoutStatus,
    createAdminPayout,
    settings,
    bookings,
    walletRecharges,
    approveWalletRecharge,
    rejectWalletRecharge
  } = useData();
  const { allProfiles, currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'salaries' | 'payouts' | 'wallet' | 'ledger'>(() => {
    if (initialTab === 'wallet_requests' || initialTab === 'wallet') return 'wallet';
    if (initialTab === 'salary_review' || initialTab === 'salaries') return 'salaries';
    if (initialTab === 'payouts') return 'payouts';
    if (initialTab === 'ledger') return 'ledger';
    return 'salaries';
  });
  
  // Settlement Desk Filter States
  const [settlementStatusFilter, setSettlementStatusFilter] = useState<'all' | 'pending' | 'processing' | 'paid' | 'failed'>('all');
  const [settlementAgentFilter, setSettlementAgentFilter] = useState<string>('all');
  const [settlementMonthFilter, setSettlementMonthFilter] = useState<string>('all');

  // Create Payout Modal State (Admin only)
  const [isCreatePayoutOpen, setIsCreatePayoutOpen] = useState(false);
  const [newPayoutAgentId, setNewPayoutAgentId] = useState('');
  const [newPayoutAmount, setNewPayoutAmount] = useState('');
  const [newPayoutMethod, setNewPayoutMethod] = useState<'upi' | 'bank_transfer'>('bank_transfer');
  const [newPayoutUpi, setNewPayoutUpi] = useState('');
  const [newPayoutAccount, setNewPayoutAccount] = useState('');
  const [newPayoutIfsc, setNewPayoutIfsc] = useState('');
  const [newPayoutBank, setNewPayoutBank] = useState('');
  const [newPayoutNotes, setNewPayoutNotes] = useState('');
  const [isSubmittingCreatePayout, setIsSubmittingCreatePayout] = useState(false);
  
  // Salary Payment Modal state
  const [paymentModalRecord, setPaymentModalRecord] = useState<SalaryRecord | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Payout Approval Modal state
  const [payoutModalRecord, setPayoutModalRecord] = useState<PayoutRequest | null>(null);
  const [payoutUtrRef, setPayoutUtrRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Payout Rejection prompt state
  const [rejectingPayoutId, setRejectingPayoutId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Wallet Recharge Approval/Rejection & Screenshot states
  const [rejectingRechargeId, setRejectingRechargeId] = useState<string | null>(null);
  const [rechargeRejectionReason, setRechargeRejectionReason] = useState('');
  const [viewingScreenshotUrl, setViewingScreenshotUrl] = useState<string | null>(null);
  const [approvingRechargeId, setApprovingRechargeId] = useState<string | null>(null);
  const [rechargeApproveNotes, setRechargeApproveNotes] = useState('');
  const [isSubmittingRechargeAction, setIsSubmittingRechargeAction] = useState(false);
  const [adjustingAgent, setAdjustingAgent] = useState<Profile | null>(null);

  const handlePaySalary = async () => {
    if (!paymentModalRecord) return;
    if (!paymentRef.trim()) {
      error('Payment Reference Required', 'Please enter a valid bank UTR / transfer reference.');
      return;
    }

    setIsSubmittingPay(true);
    try {
      await markSalaryPaid(paymentModalRecord.id, paymentRef.trim());
      setPaymentModalRecord(null);
      setPaymentRef('');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleApprovePayout = async () => {
    if (!payoutModalRecord) return;
    if (!payoutUtrRef.trim()) {
      error('UTR Required', 'कृपया बैंक ट्रांसफर UTR या लेनदेन संदर्भ संख्या दर्ज करें।');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const ok = await approvePayout(payoutModalRecord.id, payoutUtrRef.trim(), payoutNotes.trim() || undefined);
      if (ok) {
        setPayoutModalRecord(null);
        setPayoutUtrRef('');
        setPayoutNotes('');
      }
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleConfirmRejectPayout = async () => {
    if (!rejectingPayoutId) return;
    if (!rejectionReason.trim()) {
      error('Reason Required', 'कृपया अस्वीकृति का स्पष्ट कारण दर्ज करें।');
      return;
    }

    const ok = await rejectPayout(rejectingPayoutId, rejectionReason.trim());
    if (ok) {
      setRejectingPayoutId(null);
      setRejectionReason('');
    }
  };

  const handleConfirmApproveRecharge = async (id: string, notes?: string) => {
    setIsSubmittingRechargeAction(true);
    try {
      const ok = await approveWalletRecharge(id, notes);
      if (ok) {
        setApprovingRechargeId(null);
        setRechargeApproveNotes('');
      }
    } finally {
      setIsSubmittingRechargeAction(false);
    }
  };

  const handleConfirmRejectRecharge = async () => {
    if (!rejectingRechargeId) return;
    if (!rechargeRejectionReason.trim()) {
      error('Reason Required', 'कृपया अस्वीकृति का कारण दर्ज करें।');
      return;
    }
    setIsSubmittingRechargeAction(true);
    try {
      const ok = await rejectWalletRecharge(rejectingRechargeId, rechargeRejectionReason.trim());
      if (ok) {
        setRejectingRechargeId(null);
        setRechargeRejectionReason('');
      }
    } finally {
      setIsSubmittingRechargeAction(false);
    }
  };

  // Helper to trigger browser download of CSV string
  const downloadCsv = (filename: string, csvContent: string) => {
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,\uFEFF' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export 1: Booking Reports
  const handleExportBookingsCsv = () => {
    const headers = [
      'Booking Code',
      'Agent Name',
      'Agent Mobile',
      'Customer Name',
      'Customer Mobile',
      'From City',
      'To City',
      'Journey Date',
      'Seats',
      'Seat Category',
      'Total Fare (₹)',
      'Commission (₹)',
      'Booking Status',
      'Ticket PNR',
      'Created At'
    ];

    const rows = bookings.map((b) => [
      b.booking_code,
      `"${(b.agent_name || '').replace(/"/g, '""')}"`,
      b.agent_mobile || '',
      `"${(b.customer_name || '').replace(/"/g, '""')}"`,
      b.customer_mobile || '',
      b.from_city,
      b.to_city,
      b.journey_date,
      b.seat_count,
      b.seat_category,
      b.total_estimated_amount.toFixed(2),
      b.status === 'confirmed' ? '20.00' : '0.00',
      b.status,
      b.ticket_pnr || '',
      new Date(b.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`GO_USER_Bookings_Report_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    success('CSV Exported', 'बुकिंग रिपोर्ट सफलतापूर्वक डाउनलोड हो गई।');
  };

  // CSV Export 2: Commission Ledger
  const handleExportCommissionCsv = () => {
    const headers = [
      'Transaction ID',
      'Booking ID / Code',
      'Agent Name',
      'Amount (₹)',
      'Status',
      'Entry Type',
      'Date & Time',
      'Notes'
    ];

    const rows = commissions.map((c) => [
      c.id,
      c.booking_code || c.booking_id || '',
      `"${(c.agent_name || '').replace(/"/g, '""')}"`,
      c.amount.toFixed(2),
      c.status,
      c.entry_type || 'booking_commission',
      new Date(c.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`GO_USER_Commission_Ledger_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    success('CSV Exported', 'कमीशन लेज़र सफलतापूर्वक डाउनलोड हो गया।');
  };

  // CSV Export 3: Salary Eligibility
  const handleExportSalaryCsv = () => {
    const headers = [
      'Record ID',
      'Agent Name',
      'Agent Mobile',
      'Month/Year',
      'Target Tickets',
      'Confirmed Tickets',
      'Target Met',
      'Base Salary (₹)',
      'Payable Salary (₹)',
      'Status',
      'Payment Reference',
      'Approved Date'
    ];

    const rows = salaryRecords.map((s) => [
      s.id,
      `"${(s.agent_name || '').replace(/"/g, '""')}"`,
      s.agent_mobile || '',
      s.month_year,
      s.target_bookings,
      s.confirmed_bookings,
      s.target_met ? 'YES' : 'NO',
      s.base_salary.toFixed(2),
      s.payable_salary.toFixed(2),
      s.status,
      s.payment_reference || '',
      s.approved_at ? new Date(s.approved_at).toLocaleDateString('en-IN') : ''
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`GO_USER_Salary_Eligibility_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    success('CSV Exported', 'मासिक वेतन पात्रता रिपोर्ट डाउनलोड हो गई।');
  };

  const totalCommissionCredited = commissions
    .filter((c) => c.status === 'credited')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalCommissionReversed = commissions
    .filter((c) => c.status === 'reversed')
    .reduce((sum, c) => sum + Math.abs(c.amount), 0);

  const netCommissionPayable = totalCommissionCredited - totalCommissionReversed;

  const pendingPayoutsCount = payoutRequests.filter((p) => p.status === 'pending').length;
  const pendingRechargesCount = walletRecharges.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          कमीशन, वॉलेट एवं मानदेय वितरण डेस्क (Commissions, Wallet & Salary Ledger)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          एजेंट्स का कमीशन लेजर (₹{settings.commission_rate.toFixed(2)}/बुकिंग), प्रीपेड वॉलेट टॉप-अप (न्यूनतम ₹{settings.min_wallet_recharge.toLocaleString('en-IN')}), UPI/बैंक निकासी अनुरोध एवं ₹{settings.monthly_salary.toLocaleString('en-IN')} मानदेय वितरण
        </p>
      </div>

      {/* Overview Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Net Commission</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            ₹{netCommissionPayable.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500">
            {commissions.filter((c) => c.status === 'credited').length} Confirmed Credits
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Wallet Top-up Requests</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {pendingRechargesCount}
          </span>
          <span className="text-[10px] text-slate-500">
            {walletRecharges.length} Total Top-ups (Min ₹{settings.min_wallet_recharge.toLocaleString('en-IN')})
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Pending Payouts</span>
          <span className="text-2xl font-black text-orange-600 mt-1 block">
            {pendingPayoutsCount}
          </span>
          <span className="text-[10px] text-slate-500">
            {payoutRequests.length} Total Requests
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Reversed Commission</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            ₹{totalCommissionReversed.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500">
            {commissions.filter((c) => c.status === 'reversed').length} Cancellations
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">Monthly Salary Base</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            ₹{settings.monthly_salary.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Target: {settings.monthly_target} Bookings</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('salaries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'salaries'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Monthly Salary Payouts ({salaryRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'wallet'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>वॉलेट टॉप-अप अनुरोध ({walletRecharges.length})</span>
          {pendingRechargesCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
              {pendingRechargesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'payouts'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Agent Payout Requests ({payoutRequests.length})</span>
          {pendingPayoutsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
              {pendingPayoutsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Full Commission Ledger ({commissions.length})
        </button>
      </div>

      {activeTab === 'salaries' ? (
        /* Salary Records Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">एजेंट मासिक वेतन रिकॉर्ड्स</h2>
            <span className="text-[11px] text-slate-400">
              मानदेय रिकॉर्ड्स कमीशन से अलग रखे जाते हैं
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Month</th>
                  <th className="p-4">Target Progress</th>
                  <th className="p-4">Base Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment Ref</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaryRecords.map((sal) => (
                  <tr key={sal.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{sal.agent_name || 'Agent'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">+91 {sal.agent_mobile || 'N/A'}</span>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-700">{sal.month_year}</td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800">
                        {sal.confirmed_bookings} / {sal.target_bookings}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {sal.target_met ? 'Goal Met (100%)' : 'In Progress'}
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      ₹{sal.payable_salary.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          sal.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sal.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sal.status}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-emerald-700">
                      {sal.payment_reference || '-'}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {sal.status === 'unpaid' && sal.target_met && (
                        <button
                          onClick={() => approveSalary(sal.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px]"
                        >
                          Approve Salary
                        </button>
                      )}

                      {sal.status === 'approved' && (
                        <button
                          onClick={() => setPaymentModalRecord(sal)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                        >
                          Mark Paid (UTR)
                        </button>
                      )}

                      {sal.status === 'paid' && (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'payouts' ? (
        /* GO USER Settlement Desk (Payout Processing & Status Management) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-900 text-amber-300 text-[10px] font-black uppercase">
                  GO USER
                </span>
                <h2 className="text-sm font-extrabold text-slate-900">
                  सेटलमेंट डेस्क (Settlement Desk / Payout Processing)
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                पेआउट स्टेटस (Pending, Processing, Paid, Failed) प्रबंधन, बैंक UTR संदर्भ, एवं ऑडिट ट्रेल
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportBookingsCsv}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-300 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>बुकिंग CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportCommissionCsv}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-300 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>कमीशन CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportSalaryCsv}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 border border-slate-300 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>वेतन CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreatePayoutOpen(true)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नया पेआउट (+)</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">फिल्टर स्थिति:</span>
            {(['all', 'pending', 'processing', 'paid', 'failed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSettlementStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                  settlementStatusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'सभी' : st}
              </button>
            ))}
          </div>

          {(() => {
            const displayedPayouts = payoutRequests.filter((p) => {
              if (settlementStatusFilter === 'all') return true;
              if (settlementStatusFilter === 'paid') return p.status === 'paid' || p.status === 'approved';
              return p.status === settlementStatusFilter;
            });

            if (displayedPayouts.length === 0) {
              return (
                <div className="p-12 text-center text-slate-400 text-xs">
                  चयनित स्थिति में कोई सेटलमेंट पेआउट दर्ज नहीं है।
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Agent Name</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payout Method</th>
                      <th className="p-4">Destination Details</th>
                      <th className="p-4">Settlement Status</th>
                      <th className="p-4">Reference / UTR</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedPayouts.map((p) => {
                      const isPaid = p.status === 'paid' || p.status === 'approved';
                      const isProcessing = p.status === 'processing';
                      const isFailed = p.status === 'failed' || p.status === 'rejected';
                      const isPending = p.status === 'pending';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{p.agent_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">+91 {p.agent_mobile}</span>
                          </td>

                          <td className="p-4 font-black text-sm text-slate-900 font-mono">
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
                                  Bank
                                </>
                              )}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-slate-800">
                            {p.payout_method === 'upi' ? (
                              <div className="font-bold text-orange-950">{p.upi_id}</div>
                            ) : (
                              <div>
                                <div className="font-bold">A/C: {p.account_number}</div>
                                <div className="text-[10px] text-slate-500 font-sans">
                                  IFSC: {p.ifsc_code} • {p.account_holder_name}
                                </div>
                                {p.bank_name && (
                                  <div className="text-[10px] text-slate-400 font-sans">{p.bank_name}</div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isProcessing
                                  ? 'bg-blue-100 text-blue-800'
                                  : isFailed
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isPaid && <CheckCircle className="w-3 h-3" />}
                              {isProcessing && <RefreshCw className="w-3 h-3 animate-spin" />}
                              {isFailed && <XCircle className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {p.status}
                            </span>
                          </td>

                          <td className="p-4 font-mono font-bold text-emerald-700">
                            {p.reference || p.admin_reference || (
                              <span className="text-slate-400 font-sans font-normal text-[11px]">
                                {p.admin_notes || '-'}
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-slate-500">
                            {new Date(p.date || p.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>

                          <td className="p-4 text-right space-x-1.5 shrink-0">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => updatePayoutStatus(p.id, 'processing')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer"
                              >
                                Process
                              </button>
                            )}

                            {(isPending || isProcessing) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayoutModalRecord(p);
                                    setPayoutUtrRef('');
                                    setPayoutNotes('');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer"
                                >
                                  Mark Paid (UTR)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updatePayoutStatus(p.id, 'failed', undefined, undefined, 'Settlement processing failed')}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Mark Failed
                                </button>
                              </>
                            )}

                            {isPaid && (
                              <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid ✓
                              </span>
                            )}
                            {isFailed && (
                              <span className="text-rose-600 font-bold text-[11px] inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      ) : activeTab === 'wallet' ? (
        /* Agent Wallet Recharge Requests Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                एजेंट वॉलेट टॉप-अप अनुरोध (Wallet Recharge Requests)
              </h2>
              <p className="text-[11px] text-slate-500">
                एजेंट्स द्वारा प्रीपेड बैलेंस (न्यूनतम ₹{settings.min_wallet_recharge.toLocaleString('en-IN')}) हेतु जमा किए गए अनुरोध • सत्यापन के बाद बैलेंस तुरंत एजेंट वॉलेट में क्रेडिट होता है
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const firstAgent = allProfiles.find((p) => p.role === 'agent');
                  if (firstAgent) setAdjustingAgent(firstAgent);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>मैन्युअल वॉलेट एडजस्ट करें (+/-)</span>
              </button>
              <span className="text-xs font-bold text-slate-400">
                {walletRecharges.length} कुल अनुरोध
              </span>
            </div>
          </div>

          {walletRecharges.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              वर्तमान में कोई वॉलेट टॉप-अप अनुरोध दर्ज नहीं है। जब कोई एजेंट न्यूनतम ₹{settings.min_wallet_recharge.toLocaleString('en-IN')} जमा करेगा, तो अनुरोध यहाँ दिखाई देगा।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Agent Name</th>
                    <th className="p-4">Recharge Amount</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Bank UTR / Reference</th>
                    <th className="p-4">Receipt Screenshot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Request Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {walletRecharges.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{r.agent_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">+91 {r.agent_mobile}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-sm text-blue-700">
                          ₹{r.amount.toLocaleString('en-IN')}
                        </span>
                        {r.amount >= settings.min_wallet_recharge && (
                          <span className="block text-[10px] text-emerald-600 font-medium">✓ Min ₹{settings.min_wallet_recharge.toLocaleString('en-IN')} Valid</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 capitalize">
                          {r.payment_method === 'upi_qr' ? (
                            <>
                              <Smartphone className="w-3.5 h-3.5 text-orange-600" />
                              SafarGo UPI QR
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              Bank Transfer
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {r.utr_number}
                        </span>
                      </td>

                      <td className="p-4">
                        {r.screenshot_url ? (
                          <button
                            onClick={() => setViewingScreenshotUrl(r.screenshot_url || null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] transition"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>देखें (Receipt)</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">रसीद नहीं है</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {r.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {r.status === 'pending' && <Clock className="w-3 h-3" />}
                          {r.status}
                        </span>
                        {r.admin_notes && (
                          <span className="block text-[10px] text-slate-500 mt-0.5 max-w-xs truncate" title={r.admin_notes}>
                            {r.admin_notes}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-500">
                        {new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </td>

                      <td className="p-4 text-right space-x-2 shrink-0">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setApprovingRechargeId(r.id);
                                setRechargeApproveNotes('');
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                            >
                              Approve (क्रेडिट करें)
                            </button>
                            <button
                              onClick={() => {
                                setRejectingRechargeId(r.id);
                                setRechargeRejectionReason('');
                              }}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> वॉलेट में जमा
                          </span>
                        )}
                        {r.status === 'rejected' && (
                          <span className="text-rose-600 font-bold text-[11px] flex items-center justify-end gap-1">
                            <XCircle className="w-3.5 h-3.5" /> अस्वीकृत
                          </span>
                        )}
                        {(() => {
                          const rowAgent = allProfiles.find((p) => p.id === r.agent_id);
                          if (rowAgent) {
                            return (
                              <button
                                type="button"
                                onClick={() => setAdjustingAgent(rowAgent)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] border border-blue-200 ml-2 cursor-pointer transition"
                                title="इस एजेंट का वॉलेट बैलेंस सीधे एडजस्ट करें"
                              >
                                वॉलेट (+/-)
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Full Commission Ledger Records Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">संपूर्ण सिस्टम कमीशन लेजर</h2>
            <span className="text-[11px] text-slate-400">
              प्रत्येक पुष्टीकृत बुकिंग से उत्पन्न ₹19.34 कमीशन रिकॉर्ड
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Booking Code</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-600">{c.id}</td>
                    <td className="p-4 font-bold text-slate-900">{c.agent_name || c.agent_id}</td>
                    <td className="p-4 font-mono font-bold text-slate-800">{c.booking_code || c.booking_id}</td>
                    <td className="p-4">
                      <span
                        className={`font-black ${
                          c.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {c.amount >= 0 ? `+₹${c.amount.toFixed(2)}` : `-₹${Math.abs(c.amount).toFixed(2)}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                      {c.notes || 'Normal transaction'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salary Payment Reference Modal */}
      {paymentModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Bank Transfer for {paymentModalRecord.agent_name}
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <p>
                Agent: <strong>{paymentModalRecord.agent_name}</strong> ({paymentModalRecord.agent_mobile})
              </p>
              <p>
                Month: <strong>{paymentModalRecord.month_year}</strong>
              </p>
              <p>
                Payable Amount: <strong className="text-emerald-600 text-sm">₹{paymentModalRecord.payable_salary.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Bank Transfer UTR / Transaction Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UTR-SBI998822019"
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPaymentModalRecord(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handlePaySalary}
                disabled={isSubmittingPay}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
              >
                {isSubmittingPay ? 'Recording...' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Approval Modal */}
      {payoutModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  निकासी स्वीकृति एवं बैंक UTR दर्ज करें
                </h3>
              </div>
              <button
                onClick={() => setPayoutModalRecord(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl text-xs space-y-2 border border-emerald-100">
              <div className="flex justify-between">
                <span className="text-slate-500">एजेंट:</span>
                <span className="font-bold text-slate-900">{payoutModalRecord.agent_name} (+91 {payoutModalRecord.agent_mobile})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">निकासी राशि:</span>
                <span className="text-lg font-black text-emerald-700">₹{payoutModalRecord.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">माध्यम:</span>
                <span className="font-bold text-slate-800 uppercase">{payoutModalRecord.payout_method}</span>
              </div>
              <div className="pt-1 border-t border-emerald-200/60 text-slate-700">
                {payoutModalRecord.payout_method === 'upi' ? (
                  <div>UPI VPA: <strong className="font-mono text-emerald-900">{payoutModalRecord.upi_id}</strong></div>
                ) : (
                  <div className="space-y-0.5">
                    <div>A/C: <strong className="font-mono text-emerald-900">{payoutModalRecord.account_number}</strong></div>
                    <div>IFSC: <strong className="font-mono text-emerald-900">{payoutModalRecord.ifsc_code}</strong> ({payoutModalRecord.account_holder_name})</div>
                    {payoutModalRecord.bank_name && <div>Bank: {payoutModalRecord.bank_name}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  बैंक ट्रांसफर UTR / IMPS संदर्भ संख्या *
                </label>
                <input
                  type="text"
                  required
                  value={payoutUtrRef}
                  onChange={(e) => setPayoutUtrRef(e.target.value)}
                  placeholder="उदा. UTR-20261010-998811"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  एडमिन रिमार्क्स (वैकल्पिक)
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="उदा. Transferred via PhonePe Business"
                  className="w-full p-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPayoutModalRecord(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                onClick={handleApprovePayout}
                disabled={isSubmittingPayout}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition disabled:opacity-50 shadow-md"
              >
                {isSubmittingPayout ? 'प्रोसेसिंग...' : 'स्वीकृत करें और UTR रिकॉर्ड करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Rejection Prompt Modal */}
      {rejectingPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900">निकासी अनुरोध अस्वीकृत करें</h3>
            </div>
            
            <p className="text-xs text-slate-500">
              कृपया एजेंट को दिखाने हेतु अस्वीकृति का वैध कारण दर्ज करें (उदा. अमान्य UPI ID, गलत खाता संख्या)।
            </p>

            <div>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="कारण दर्ज करें..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectingPayoutId(null)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmRejectPayout}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                अस्वीकृत करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Recharge Approval Modal */}
      {approvingRechargeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">वॉलेट रिचार्ज स्वीकृत करें</h3>
              </div>
              <button
                onClick={() => setApprovingRechargeId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const rec = walletRecharges.find(r => r.id === approvingRechargeId);
              if (!rec) return null;
              return (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200">
                    <p>एजेंट: <strong>{rec.agent_name}</strong> (+91 {rec.agent_mobile})</p>
                    <p>रिचार्ज राशि: <strong className="text-emerald-600 text-sm">₹{rec.amount.toLocaleString('en-IN')}</strong></p>
                    <p>बैंक UTR: <strong className="font-mono">{rec.utr_number}</strong></p>
                    <p>भुगतान माध्यम: <strong>{rec.payment_method === 'upi_qr' ? 'SafarGo UPI QR' : 'बैंक ट्रांसफर'}</strong></p>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      एडमिन टिप्पणी (वैकल्पिक / Notes)
                    </label>
                    <input
                      type="text"
                      value={rechargeApproveNotes}
                      onChange={(e) => setRechargeApproveNotes(e.target.value)}
                      placeholder="e.g. Bank statement verified"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setApprovingRechargeId(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                    >
                      रद्द करें
                    </button>
                    <button
                      onClick={() => handleConfirmApproveRecharge(rec.id, rechargeApproveNotes)}
                      disabled={isSubmittingRechargeAction}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50"
                    >
                      {isSubmittingRechargeAction ? 'जमा हो रहा है...' : `स्वीकृत करें और ₹${rec.amount.toLocaleString('en-IN')} जमा करें`}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Wallet Recharge Rejection Modal */}
      {rejectingRechargeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-900">वॉलेट रिचार्ज अस्वीकृत करें</h3>
            </div>
            
            <p className="text-xs text-slate-500">
              कृपया अस्वीकृति का कारण दर्ज करें (उदा. बैंक में UTR नहीं मिला, अमान्य रसीद)।
            </p>

            <div>
              <textarea
                required
                rows={3}
                value={rechargeRejectionReason}
                onChange={(e) => setRechargeRejectionReason(e.target.value)}
                placeholder="कारण दर्ज करें..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectingRechargeId(null)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmRejectRecharge}
                disabled={isSubmittingRechargeAction}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isSubmittingRechargeAction ? 'प्रोसेसिंग...' : 'अस्वीकृत करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {viewingScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <span className="font-bold text-sm">भुगतान रसीद स्क्रीनशॉट (Payment Receipt)</span>
              <button
                onClick={() => setViewingScreenshotUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-slate-950">
              <img
                src={viewingScreenshotUrl}
                alt="Payment Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-slate-800 shadow-md"
              />
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingScreenshotUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Manual Wallet Adjustment Modal */}
      {adjustingAgent && (
        <AdminWalletAdjustmentModal
          agent={adjustingAgent}
          onClose={() => setAdjustingAgent(null)}
        />
      )}

    </div>
  );
};
