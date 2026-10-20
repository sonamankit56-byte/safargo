import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  Phone, 
  HelpCircle, 
  FileText, 
  Info, 
  AlertTriangle, 
  RotateCcw, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { SafarGoLogo } from '../common/SafarGoLogo';

export type PolicyTab = 'help' | 'about' | 'privacy' | 'refund' | 'fraud_policy';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'help'
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B194C] via-[#1E3A8A] to-[#0F2557] text-white p-5 sm:p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-2 flex items-center justify-center backdrop-blur-md">
              <SafarGoLogo size="sm" variant="icon-only" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">सफ़रगो सहायता एवं कानूनी नीतियां</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-blue-200">
                SafarGo Legal, Customer Support & Compliance Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('help')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'help'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>24x7 सहायता (Help)</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>सफ़रगो परिचय (About Us)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>गोपनीयता नीति (Privacy)</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'refund'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रिफंड नीति (Refund)</span>
          </button>

          <button
            onClick={() => setActiveTab('fraud_policy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
              activeTab === 'fraud_policy'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>धोखाधड़ी चेतावनी (Fraud Policy)</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-sm leading-relaxed">
          
          {/* TAB 1: HELP & SUPPORT */}
          {activeTab === 'help' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4.5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    OFFICIAL SUPPORT EMAIL
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-1 select-all">
                    support@safargo.in
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    एजेंट वेरिफिकेशन, पेमेंट, टिकट रिफंड अथवा तकनीकी समस्या हेतु हमें ईमेल भेजें। हमारी कस्टमर सक्सेस टीम 24 घंटे के भीतर समाधान सुनिश्चित करती है।
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="mailto:support@safargo.in?subject=SafarGo Support Request"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>तुरंत ईमेल करें (Send Mail)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <Phone className="w-4 h-4" />
                    <span>24x7 टोल-फ्री हेल्पलाइन</span>
                  </div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    1800-SAFAR-GO (1800-72327-46)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    यात्री टिकट सहायता एवं बस बोर्डिंग ट्रैकिंग हेतु सातों दिन 24 घंटे उपलब्ध।
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>व्हाट्सएप एजेंट हेल्पलाइन</span>
                  </div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    +91 98110 00001
                  </div>
                  <p className="text-[11px] text-slate-500">
                    एजेंट ऑनबोर्डिंग स्टेटस व तत्काल वॉलेट टॉप-अप ऑडिट सहायता।
                  </p>
                </div>
              </div>

              {/* Office Location */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  सफ़रगो कॉर्पोरेट हेडक्वार्टर (Corporate Office)
                </h5>
                <p className="text-xs text-slate-700 font-medium">
                  <strong>SafarGo Mobility Network Pvt. Ltd.</strong><br />
                  यूनिट 402, सफ़रगो हाइट्स, विजय नगर मेन रोड, इंदौर (मध्य प्रदेश) - 452010
                </p>
                <p className="text-[11px] text-slate-500">
                  कॉर्पोरेट पहचान संख्या (CIN): U63090MP2026PTC049102 • MSME & Startup India Regd.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-slate-900 to-[#1E3A8A] text-white p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                  MEESHO OF MOBILITY
                </span>
                <h4 className="text-lg font-black">
                  सफ़रगो: भारत का सबसे बड़ा डिजिटल बस व मोबिलिटी रिसेलिंग नेटवर्क
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  सफ़रगो भारत के टियर-2, टियर-3 एवं ग्रामीण कस्बों में स्थित सीएससी (CSC) केंद्रों, साइबर कैफे, मोबाइल शॉप संचालकों और स्थानीय युवाओं को डिजिटल बस टिकट एजेंट बनाकर सशक्त बना रहा है।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-xl font-black text-blue-600">₹19.34</div>
                  <div className="text-xs font-bold text-slate-800">निश्चित कमीशन</div>
                  <p className="text-[11px] text-slate-500">प्रत्येक बस बुकिंग पर तत्काल वॉलेट में जमा।</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-xl font-black text-emerald-600">10,000+</div>
                  <div className="text-xs font-bold text-slate-800">सत्यापित बसें</div>
                  <p className="text-[11px] text-slate-500">AC, नॉन-AC, वोल्वो व स्लीपर ऑपरेटर कवरेज।</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-xl font-black text-amber-600">1-Sec</div>
                  <div className="text-xs font-bold text-slate-800">इंस्टेंट रिफंड</div>
                  <p className="text-[11px] text-slate-500">कैंसिलेशन पर बिना किसी कटौती के तत्काल रिफंड।</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-900">
                <h5 className="font-bold flex items-center gap-1.5 text-amber-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  हमारा संकल्प
                </h5>
                <p className="leading-relaxed">
                  हम भारत के 10 लाख से अधिक एजेंटों को आत्मनिर्भर और सम्मानजनक आजीविका प्रदान करने के लिए प्रतिबद्ध हैं। पारदर्शी मूल्य, शून्य हिडन शुल्क और भरोसेमंद तकनीक हमारी पहचान है।
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-black text-sm">256-बिट बैंक स्तरीय एन्क्रिप्शन व डेटा सुरक्षा</h4>
                  <p className="text-xs text-emerald-700">
                    डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act 2023) के शत-प्रतिशत नियमों का पालन।
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">1. एकत्रित की जाने वाली जानकारी</h5>
                  <p>
                    एजेंट पंजीकरण के समय हम आपका नाम, मोबाइल, ईमेल, आधार संख्या, पैन कार्ड तथा बैंक खाता विवरण केवल केवाईसी सत्यापन तथा भुगतान सेटलमेंट हेतु संग्रहित करते हैं।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">2. दस्तावेज़ों की गोपनीयता</h5>
                  <p>
                    आपके द्वारा अपलोड किए गए आधार व पैन कार्ड दस्तावेज़ एन्क्रिप्टेड क्लाउड वॉल्ट में सुरक्षित रखे जाते हैं। प्रोफ़ाइल में आधार और पैन के केवल अंतिम 4 अंक ही प्रदर्शित होते हैं।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">3. नो-डेटा-सेलिंग गारंटी (Zero Data Selling)</h5>
                  <p>
                    सफ़रगो कभी भी किसी भी तीसरे पक्ष, मार्केटिंग कंपनी या विज्ञापनदाता को आपका व्यक्तिगत डेटा नहीं बेचता और न ही साझा करता है।
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">4. खाता व डेटा डिलीट करने का अधिकार</h5>
                  <p>
                    एजेंट किसी भी समय अपनी प्रोफ़ाइल सेटिंग्स से खाता हटाने (Delete Account) का अनुरोध कर सकता है। डेटा निष्कासन कानूनन 7 कार्यदिवसों में पूर्ण होता है।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-1">
                <div className="flex items-center gap-2 font-black text-sm text-blue-950">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>100% त्वरित रिफंड गारंटी (Instant Refund Guarantee)</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  सफ़रगो पर टिकट कैंसिल करना बेहद आसान और पारदर्शी है। रिफंड राशि सीधे आपके सफ़रगो वॉलेट में उसी क्षण जोड़ दी जाती है।
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="font-bold text-slate-900 mb-1">प्रस्थान से 4 घंटे पहले कैंसिलेशन:</h5>
                  <p>मूल बस किराया 100% रिफंड योग्य है। शून्य कटौती शुल्क।</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="font-bold text-slate-900 mb-1">बस ऑपरेटर द्वारा बस रद्द होने पर:</h5>
                  <p>यदि बस ऑपरेटर द्वारा यात्रा रद्द की जाती है, तो संपूर्ण राशि (100%) तत्काल बिना किसी शर्त के वापस की जाएगी।</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="font-bold text-slate-900 mb-1">रिफंड समय-सीमा (Timeline):</h5>
                  <p>• सफ़रगो वॉलेट: <strong>तत्काल (1 सेकंड)</strong><br />• मूल बैंक खाता/UPI: <strong>24 से 48 बैंक कार्य घंटे</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FRAUD POLICY & SUSPEND DISCLAIMER */}
          {activeTab === 'fraud_policy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4.5 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-black text-base">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>धोखाधड़ी रोकथाम नीति एवं सख्त खाता निलंबन अस्वीकरण</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">
                  सफ़रगो प्लेटफॉर्म पर किसी भी प्रकार की वित्तीय धोखाधड़ी, नकली यूटीआर (Fake UTR) अथवा फर्जी केवाईसी पर शून्य सहनशीलता (Zero Tolerance) की नीति लागू है।
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    1. गैर-कानूनी गतिविधियां (Prohibited Fraudulent Acts)
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>वॉलेट टॉप-अप अथवा टिकट बुकिंग में मनगढ़ंत, अमान्य अथवा फर्जी बैंक UTR नंबर डालना।</li>
                    <li>अन्य किसी व्यक्ति का आधार कार्ड या पैन कार्ड एडिट करके या बिना अनुमति अपलोड करना।</li>
                    <li>फर्जी बुकिंग्स बनाकर कैशबैक या रेफरल बोनस की हेराफेरी करना।</li>
                    <li>पेमेंट गेटवे या यूपीआई चार्जबैक का दुरुपयोग करके कंपनी को वित्तीय नुकसान पहुंचाना।</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-100/50 border border-rose-200 space-y-1.5">
                  <h5 className="font-bold text-rose-800">
                    2. तत्काल कानूनी कार्रवाई एवं दंड (Penalties & Legal Prosecution)
                  </h5>
                  <p className="text-rose-900 leading-relaxed">
                    यदि किसी भी एजेंट या यूजर द्वारा उपरोक्त में से कोई भी उल्लंघन पाया जाता है, तो:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-rose-900 font-medium">
                    <li>एजेंट का खाता तुरंत <strong>स्थायी रूप से निलंबित (Permanently Suspended / Blacklisted)</strong> कर दिया जाएगा।</li>
                    <li>वॉलेट में मौजूद समस्त शेष राशि कंपनी द्वारा जब्त कर ली जाएगी।</li>
                    <li>
                      भारतीय सूचना प्रौद्योगिकी अधिनियम 2000 की <strong>धारा 66D</strong> (कंप्यूटर संसाधन द्वारा धोखाधड़ी) तथा 
                      भारतीय न्याय संहिता (BNS) / आईपीसी की <strong>धारा 420</strong> (धोखाधड़ी व बेईमानी) के अंतर्गत संबंधित साइबर क्राइम पुलिस थाने में <strong>प्रथम सूचना रिपोर्ट (FIR)</strong> दर्ज कराई जाएगी।
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold text-[11px]">
                  ⚖️ अपील प्रक्रिया: यदि आपको लगता है कि आपका खाता भूलवश निलंबित हुआ है, तो 48 घंटे के भीतर अपने वैध बैंक स्टेटमेंट के साथ <u>support@safargo.in</u> पर अपील दर्ज कर सकते हैं।
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>सफ़रगो कानूनी अनुपालन टीम द्वारा सत्यापित • अक्टूबर 2026</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition"
          >
            समझ गया (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
