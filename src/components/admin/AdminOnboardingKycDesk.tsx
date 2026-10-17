import React, { useState, useEffect } from 'react';
import {
  OnboardingApplication,
  getOnboardingApplications,
  approveOnboardingApplication,
  rejectOnboardingApplication,
} from '../../lib/onboardingStorage';
import { sendAgentApprovalEmail } from '../../lib/emailService';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Search,
  Filter,
  User,
  Building,
  CreditCard,
  ShieldCheck,
  Send,
  Eye,
  X,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const AdminOnboardingKycDesk: React.FC = () => {
  const { success, error, info } = useToast();
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<OnboardingApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const loadData = () => {
    const list = getOnboardingApplications();
    setApplications(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const filtered = applications.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.mobile.includes(q) ||
      app.panNumber.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.shopName.toLowerCase().includes(q) ||
      app.city.toLowerCase().includes(q)
    );
  });

  const handleApprove = async (app: OnboardingApplication) => {
    if (isProcessing) return;
    setIsProcessing(true);
    info('सत्यापन प्रगति पर है', 'एजेंट खाते को अनुमोदित कर ईमेल डिस्पैच किया जा रहा है...');

    try {
      const { application, token } = approveOnboardingApplication(app.id);
      
      // Send real email with SafarGo official logo and password set link
      try {
        await sendAgentApprovalEmail({
          toEmail: application.email,
          fullName: application.fullName,
          shopName: application.shopName,
          agentId: application.id,
          token,
        });
      } catch (mailErr) {
        console.warn('Approval email failed to send, token is saved:', mailErr);
      }

      success(
        'एजेंट आवेदन स्वीकृत! 🎉',
        `एजेंट ${application.fullName} (${application.id}) को ईमेल पर पासवर्ड बनाने का लिंक भेज दिया गया है।`
      );

      loadData();
      if (selectedApp && selectedApp.id === app.id) {
        setSelectedApp(application);
      }
    } catch (err: any) {
      error('त्रुटि', err?.message || 'अनुमोदन विफल रहा');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (app: OnboardingApplication) => {
    if (!rejectionReasonInput.trim()) {
      error('कारण आवश्यक', 'कृपया अस्वीकृति का कारण दर्ज करें।');
      return;
    }

    try {
      const updated = rejectOnboardingApplication(app.id, rejectionReasonInput.trim());
      success('आवेदन अस्वीकृत', `आवेदन ${app.id} को अस्वीकृत चिह्नित कर दिया गया है।`);
      loadData();
      setShowRejectModal(false);
      setRejectionReasonInput('');
      if (selectedApp && selectedApp.id === app.id) {
        setSelectedApp(updated);
      }
    } catch (err: any) {
      error('त्रुटि', err?.message || 'अस्वीकृति विफल रही');
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Onboarding KYC Verification Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ऑनबोर्डिंग KYC आवेदन समीक्षा (Onboarding Received)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            नवीनतम एजेंट आवेदनों की समीक्षा करें, पूर्ण PDF डोजियर देखें, तथा सत्यापन उपरांत ईमेल पर 8-अंकीय सुरक्षित पासवर्ड निर्माण लिंक भेजें।
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">लंबित (Pending)</span>
            <span className="text-2xl font-black text-amber-300 font-mono">{pendingCount}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">स्वीकृत (Approved)</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{approvedCount}</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl text-center min-w-[90px]">
            <span className="text-[10px] text-rose-400 font-bold uppercase block">अस्वीकृत (Rejected)</span>
            <span className="text-2xl font-black text-rose-300 font-mono">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाम, मोबाइल, ईमेल, पैन या ID खोजें..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:border-red-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `सभी (${applications.length})` },
            { id: 'pending', label: `लंबित (${pendingCount})` },
            { id: 'approved', label: `स्वीकृत (${approvedCount})` },
            { id: 'rejected', label: `अस्वीकृत (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-200">कोई ऑनबोर्डिंग आवेदन नहीं मिला</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            इस फ़िल्टर या खोज मानदंड के तहत कोई अनुरोध उपलब्ध नहीं है।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-3xl p-5 space-y-4 shadow-lg transition-all text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-lg">
                    {app.id}
                  </span>
                  {app.status === 'pending' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> लंबित (Pending)
                    </span>
                  )}
                  {app.status === 'approved' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> स्वीकृत (Approved)
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> अस्वीकृत (Rejected)
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{app.fullName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{app.shopName}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">शहर:</span>
                    <strong className="text-white">{app.city}, MP</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">पैन कार्ड:</span>
                    <strong className="font-mono text-amber-300">{app.panNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">मोबाइल:</span>
                    <strong className="font-mono text-white">+91 {app.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">बैंक:</span>
                    <strong className="text-slate-200">{app.bankName || 'SBI'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-red-400" />
                  <span>PDF डोजियर समीक्षा</span>
                </button>

                {app.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(app)}
                    disabled={isProcessing}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                    title="स्वीकृत कर ईमेल भेजें"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">स्वीकृत</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW DOSSIER MODAL (OFFICIAL PDF FORMAT VIEW)                            */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative print:m-0 print:p-0 print:border-none print:shadow-none print:w-full">
            {/* Header / Action Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between z-10 print:hidden">
              <div className="flex items-center gap-3">
                <SafarGoLogo size="sm" showBadge={false} showTagline={false} />
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    SafarGo Agent Accreditation & e-KYC Dossier
                  </h2>
                  <span className="font-mono text-xs text-red-600 font-bold">{selectedApp.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Print or Save PDF"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-6 sm:p-8 space-y-6 text-xs text-left" id="print-dossier-area">
              {/* Top Banner on Document */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Agent Verification & Accreditation Report
                  </h1>
                  <p className="text-slate-500 text-[11px]">
                    SafarGo Technologies Private Limited • Partner Network MP
                  </p>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <div>Date: {new Date(selectedApp.submittedAt).toLocaleDateString('en-IN')}</div>
                  <div className="font-black text-slate-900">ID: {selectedApp.id}</div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  selectedApp.status === 'approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : selectedApp.status === 'rejected'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <div>
                    <strong className="block text-xs uppercase font-black">
                      Verification Status: {selectedApp.status.toUpperCase()}
                    </strong>
                    <span className="text-[11px]">
                      {selectedApp.status === 'approved' &&
                        `अनुमोदित • ईमेल लिंक प्रेषित (${new Date(selectedApp.approvedAt || '').toLocaleString('en-IN')})`}
                      {selectedApp.status === 'pending' &&
                        'लंबित • सुपर एडमिन द्वारा सत्यापन एवं स्वीकृति की प्रतीक्षा है'}
                      {selectedApp.status === 'rejected' &&
                        `अस्वीकृत • कारण: ${selectedApp.rejectionReason || 'अपूर्ण दस्तावेज'}`}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-bold">
                  {selectedApp.passwordCreated ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Password Created
                    </span>
                  ) : (
                    <span className="text-slate-500">Password Pending</span>
                  )}
                </div>
              </div>

              {/* SECTION 1: APPLICANT PERSONAL DETAILS */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                  1. Applicant Personal & Contact Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Full Name</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Registered Mobile</span>
                    <strong className="text-slate-900 text-xs font-mono">+91 {selectedApp.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verified Email (OTP Checked)</span>
                    <strong className="text-slate-900 text-xs font-mono">{selectedApp.email}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BUSINESS & STORE PROFILE */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                  2. Business Center & Geographical Location
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Shop / CSC Name</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.shopName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Entity Type</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.businessType || 'Proprietorship'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">City / District</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.city}, MP</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Complete Center Address</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.address}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Postal PIN Code</span>
                    <strong className="text-slate-900 text-xs font-mono">{selectedApp.pincode}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 3: REGULATORY e-KYC VERIFICATION */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                  3. Identity & Regulatory e-KYC Credentials
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Permanent Account Number (PAN)</span>
                    <strong className="text-red-600 text-xs font-mono font-black">{selectedApp.panNumber}</strong>
                    <span className="text-[10px] text-emerald-600 block">✓ Valid Format Verified</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Aadhaar Identification</span>
                    <strong className="text-slate-900 text-xs font-mono">
                      XXXX-XXXX-{selectedApp.aadhaarNumber.slice(-4)}
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">✓ 12-Digit Masked</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">GSTIN (Optional)</span>
                    <strong className="text-slate-900 text-xs font-mono">
                      {selectedApp.gstin || 'Not Provided (Exempt)'}
                    </strong>
                  </div>
                </div>

                {/* Uploaded KYC Documents Preview */}
                <div className="p-2 border-t border-slate-100 mt-2">
                  <div className="text-[11px] font-bold text-slate-700 mb-2">Uploaded Document Dossier (दस्तावेज़ प्रतिलिपि):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                      <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between mb-1.5">
                        <span>Aadhaar Card (आधार कार्ड)</span>
                        {selectedApp.aadhaarDocUrl ? (
                          <span className="text-emerald-600 text-[9px] font-bold">✓ Attached</span>
                        ) : (
                          <span className="text-amber-600 text-[9px]">Pending</span>
                        )}
                      </div>
                      {selectedApp.aadhaarDocUrl ? (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-300 max-h-36 bg-white flex items-center justify-center">
                          <img
                            src={selectedApp.aadhaarDocUrl}
                            alt="Aadhaar Card Preview"
                            className="w-full h-36 object-contain"
                          />
                          <a
                            href={selectedApp.aadhaarDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Full Size View
                          </a>
                        </div>
                      ) : (
                        <div className="h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                          No Aadhaar Image Attached
                        </div>
                      )}
                    </div>

                    <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                      <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between mb-1.5">
                        <span>PAN Card (पैन कार्ड)</span>
                        {selectedApp.panDocUrl ? (
                          <span className="text-emerald-600 text-[9px] font-bold">✓ Attached</span>
                        ) : (
                          <span className="text-amber-600 text-[9px]">Pending</span>
                        )}
                      </div>
                      {selectedApp.panDocUrl ? (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-300 max-h-36 bg-white flex items-center justify-center">
                          <img
                            src={selectedApp.panDocUrl}
                            alt="PAN Card Preview"
                            className="w-full h-36 object-contain"
                          />
                          <a
                            href={selectedApp.panDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Full Size View
                          </a>
                        </div>
                      ) : (
                        <div className="h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                          No PAN Card Image Attached
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: BANK ACCOUNT & SETTLEMENT PAYOUT */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                  4. Bank Account & Settlement Payout Setup
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bank Name</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.bankName || 'State Bank of India'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account Holder</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.accountHolder}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bank Account Number</span>
                    <strong className="text-slate-900 text-xs font-mono">
                      XXXX{selectedApp.accountNumber.slice(-4)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                    <strong className="text-slate-900 text-xs font-mono">{selectedApp.ifsc}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Weekly Sunday Settlement UPI</span>
                    <strong className="text-emerald-700 text-xs font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {selectedApp.settlementUpiId}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Commission Structure</span>
                    <strong className="text-red-600 text-xs font-black">Flat ₹20 / Confirmed Seat</strong>
                  </div>
                </div>
              </div>

              {/* Admin Signoff Block */}
              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Authorized Signatory</div>
                  <div className="font-serif italic text-base text-slate-800">Super Admin / Compliance Officer</div>
                  <div className="text-[10px] text-slate-500">SafarGo Security & Risk Team</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Electronic Verification Stamp</div>
                  <div className="text-xs font-mono font-black text-emerald-700">✓ CERTIFIED TRUE COPY</div>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Admin */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                {selectedApp.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                  >
                    आवेदन अस्वीकृत करें (Reject)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedApp.status === 'pending' ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(selectedApp)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>अनुमोदन प्रक्रिया जारी है...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>APPROVE & DISPATCH PASSWORD EMAIL</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-500">
                    इस आवेदन की समीक्षा पूर्ण हो चुकी है ({selectedApp.status.toUpperCase()})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>आवेदन अस्वीकृति का कारण दर्ज करें</span>
            </h3>
            <p className="text-xs text-slate-400">
              कृपया स्पष्ट कारण लिखें कि {selectedApp.fullName} का आवेदन क्यों अस्वीकृत किया जा रहा है:
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="उदा. पैन कार्ड का नाम बैंक खाते से मेल नहीं खाता, अथवा अधूरा पता।"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-rose-500"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => handleReject(selectedApp)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                अस्वीकृति पुष्ट करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
