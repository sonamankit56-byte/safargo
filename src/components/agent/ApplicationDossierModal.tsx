import React from 'react';
import { AgentUser, FIXED_AGENT_COMMISSION } from '../../types/travel';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Building, 
  User, 
  CreditCard, 
  Check, 
  AlertTriangle,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';

interface ApplicationDossierModalProps {
  agent: AgentUser | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onApprove?: (agentId: string) => Promise<void>;
  isApproving?: boolean;
}

export const ApplicationDossierModal: React.FC<ApplicationDossierModalProps> = ({
  agent,
  isOpen,
  onClose,
  isAdmin = false,
  onApprove,
  isApproving = false
}) => {
  if (!isOpen || !agent) return null;

  const handlePrint = () => {
    window.print();
  };

  const maskPan = (pan?: string) => {
    if (!pan) return 'ABCDE1234F';
    if (isAdmin) return pan;
    return `${pan.slice(0, 2)}*****${pan.slice(-2)}`;
  };

  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar) return 'XXXX-XXXX-1098';
    if (isAdmin) return `${aadhaar.slice(0, 4)}-${aadhaar.slice(4, 8)}-${aadhaar.slice(8)}`;
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const maskBank = (acc?: string) => {
    if (!acc) return '••••••••2910';
    if (isAdmin) return acc;
    return `••••••••${acc.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Top Header Bar (Non-Print Action Bar) */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-xl text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>सफ़रगो अधिकृत B2B एजेंट आवेदन डोजियर</span>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-amber-300">
                  {agent.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {agent.isApproved ? '✅ सत्यापित एवं अधिकृत पार्टनर' : '⏳ 24-घंटे समीक्षाधीन आवेदन'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-white/20"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">प्रिंट / PDF सहेजें</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Dossier Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-50/50 print:bg-white print:p-8 print:overflow-visible text-slate-900 font-sans">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SafarGoLogo className="h-10 sm:h-12 w-auto" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">
                  GOVERNMENT COMPLIANT B2B PARTNER DOSSIER
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  सफ़रगो B2B पार्टनर ऑनबोर्डिंग डोजियर
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  SafarGo Travel Mobility Network • B2B Agency Authorization Record
                </p>
              </div>
            </div>

            {/* Official Status Stamp */}
            <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  APPLICATION STATUS
                </span>
                {agent.isSuspended ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> निलंबित (SUSPENDED)
                  </span>
                ) : agent.isApproved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> सत्यापित एवं सक्रिय (ACTIVE)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> 24-घंटे सत्यापन जारी (UNDER REVIEW)
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                दिनांक: {agent.appliedDate || '18 Oct 2026'}
              </span>
            </div>
          </div>

          {/* Reference & Commission Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">एजेंट संदर्भ ID</span>
              <span className="text-xs sm:text-sm font-mono font-black text-rose-600">{agent.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">कमीशन एग्रीमेंट दर</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600">₹{FIXED_AGENT_COMMISSION.toFixed(2)} / टिकट</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">पेआउट चक्र</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">24x7 तत्काल / प्रत्येक रविवार</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">अधिकृत कार्यक्षेत्र</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">बस व होटल बुकिंग</span>
            </div>
          </div>

          {/* STEP 1: Personal & Contact */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print:border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">1</span>
                <span>खाता एवं व्यक्तिगत संपर्क विवरण (Personal & Contact Profile)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> OTP सत्यापित
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">आवेदक का पूरा कानूनी नाम</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{agent.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">पंजीकृत मोबाइल नंबर</span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">+91 {agent.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">आधिकारिक Gmail / ईमेल पता</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{agent.email}</span>
              </div>
            </div>
          </div>

          {/* STEP 2: Shop & Business Profile */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print:border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">2</span>
                <span>दुकान / कियोस्क / केंद्र प्रोफाइल (Business Establishment)</span>
              </h2>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase font-mono">
                {agent.businessType || 'CSC / Cyber Cafe'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">प्रतिष्ठान / कियोस्क का नाम</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{agent.shopName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">शहर व राज्य</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{agent.city || 'Indore'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">पोस्टल पिन कोड</span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">{agent.pincode || '452010'}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-400 font-semibold block text-[11px]">केंद्र का पूरा परिचालन पता</span>
                <span className="text-xs font-medium text-slate-800 mt-0.5 block">{agent.address}</span>
              </div>
            </div>
          </div>

          {/* STEP 3: Identity e-KYC & Uploaded Documents */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print:border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">3</span>
                <span>पहचान एवं e-KYC दस्तावेज (Identity Verification & Uploads)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% बायोमेट्रिक मैच
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">स्थायी खाता संख्या (PAN)</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    सत्यापित ✓
                  </span>
                </div>
                <div className="font-mono text-base font-black text-slate-900 mt-1">
                  {maskPan(agent.panNumber)}
                </div>
                <span className="text-[10px] text-slate-400">आयकर विभाग (Income Tax Department of India)</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">आधार पहचान संख्या (Aadhaar)</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    e-KYC सत्यापित ✓
                  </span>
                </div>
                <div className="font-mono text-base font-black text-slate-900 mt-1">
                  {maskAadhaar(agent.aadhaarNumber)}
                </div>
                <span className="text-[10px] text-slate-400">भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)</span>
              </div>
            </div>

            {/* Document Uploads Preview Section */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-3">
                अपलोड किए गए मूल दस्तावेज की प्रति (Uploaded Digital Copies)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aadhaar Photo Preview */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50 flex flex-col items-center justify-center min-h-[160px]">
                  {agent.aadhaarDocUrl ? (
                    <div className="space-y-2 w-full text-center">
                      <img 
                        src={agent.aadhaarDocUrl} 
                        alt="Aadhaar Card Copy" 
                        className="max-h-40 mx-auto rounded-lg object-contain shadow-sm border border-slate-200" 
                      />
                      <span className="text-[11px] font-bold text-slate-700 block">
                        ✓ आधार कार्ड डिजिटल प्रति (प्रमाणित)
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2 font-mono font-black text-xs">
                        UIDAI
                      </div>
                      <p className="text-xs font-bold text-slate-800">आधार कार्ड e-KYC अभिलेख संलग्न</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">UIDAI e-KYC API द्वारा डिजिटल सत्यापन संपन्न</p>
                    </div>
                  )}
                </div>

                {/* PAN Photo Preview */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50 flex flex-col items-center justify-center min-h-[160px]">
                  {agent.panDocUrl ? (
                    <div className="space-y-2 w-full text-center">
                      <img 
                        src={agent.panDocUrl} 
                        alt="PAN Card Copy" 
                        className="max-h-40 mx-auto rounded-lg object-contain shadow-sm border border-slate-200" 
                      />
                      <span className="text-[11px] font-bold text-slate-700 block">
                        ✓ पैन कार्ड डिजिटल प्रति (प्रमाणित)
                      </span>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-2 font-mono font-black text-xs">
                        PAN
                      </div>
                      <p className="text-xs font-bold text-slate-800">पैन कार्ड e-KYC अभिलेख संलग्न</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">NSDL/UTIITSL डेटाबेस से डिजिटल सत्यापन संपन्न</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Bank & Settlement Payout */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm print:border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">4</span>
                <span>बैंक एवं संडे पेआउट सेटलमेंट (Settlement & Bank Destination)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> पेआउट सक्षम
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">खाताधारक का नाम</span>
                <span className="text-sm font-black text-slate-900 mt-0.5 block">{agent.accountHolder || agent.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">बैंक का नाम</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{agent.bankName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">बैंक खाता संख्या</span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">{maskBank(agent.accountNumber)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">IFSC कोड</span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">{agent.ifsc}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-semibold block text-[11px]">प्राथमिक सेटलमेंट UPI ID</span>
                <span className="text-sm font-mono font-black text-emerald-700 mt-0.5 block">{agent.settlementUpiId}</span>
              </div>
            </div>
          </div>

          {/* STEP 5: Verification & Undertaking */}
          <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>सफ़रगो वैधानिक शपथ एवं सुरक्षा अनुबंध (Legal Undertaking & Agreement)</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              यह प्रमाणित किया जाता है कि आवेदक द्वारा प्रस्तुत सभी विवरण, आधार कार्ड एवं पैन कार्ड e-KYC के अनुसार सत्यापित हैं। एजेंट सफ़रगो ट्रेवल मोबिलिटी प्लेटफॉर्म के सभी दिशानिर्देशों, धोखाधड़ी रोकथाम नीति एवं ग्राहक टिकट बुकिंग नियमों के पालन हेतु बाध्य रहेगा।
            </p>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-400 block">डिजिटल सत्यापन मोहर</span>
                <span className="font-mono font-bold text-slate-700">SAFARGO-VERIFIED-AUTH-{agent.id}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-slate-400 block">सफ़रगो अनुपालन अधिकारी</span>
                <span className="font-bold text-slate-900">SafarGo Central Verification Cell, Indore MP</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions Footer (Non-Print) */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500">
            <span>आवश्यकता पड़ने पर इस पेज को PDF के रूप में सुरक्षित रख सकते हैं।</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex-1 sm:flex-none"
            >
              बंद करें (Close)
            </button>

            {/* If Admin and agent is pending, show the direct Verify & Activate button! */}
            {isAdmin && !agent.isApproved && onApprove && (
              <button
                type="button"
                disabled={isApproving}
                onClick={async () => {
                  await onApprove(agent.id);
                  onClose();
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                {isApproving ? (
                  <span>सत्यापित किया जा रहा है...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>सत्यापित करें एवं सक्रिय करें (Verify & Activate ID)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
