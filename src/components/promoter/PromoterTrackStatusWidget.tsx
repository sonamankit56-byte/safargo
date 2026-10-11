import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PromoterApplication } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  Phone,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Lock,
  Copy,
  DollarSign,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface PromoterTrackStatusWidgetProps {
  onOpenApplyModal?: () => void;
  onOpenPromoterLogin?: (prefillId?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const PromoterTrackStatusWidget: React.FC<PromoterTrackStatusWidgetProps> = ({
  onOpenApplyModal,
  onOpenPromoterLogin,
  onNavigateTab
}) => {
  const { promoterApplications } = useData();
  const { login } = useAuth();
  const { success, error, info } = useToast();

  const [searchMobile, setSearchMobile] = useState('');
  const [trackedApp, setTrackedApp] = useState<PromoterApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleTrackSubmit = (e?: React.FormEvent, overrideMobile?: string) => {
    if (e) e.preventDefault();
    const query = (overrideMobile || searchMobile).replace(/\D/g, '');
    if (!query || query.length < 10) {
      error('Mobile Required', 'कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }

    setHasSearched(true);
    const found = promoterApplications.find((a) => a.mobile.replace(/\D/g, '') === query);
    if (found) {
      setTrackedApp(found);
      info('आवेदन मिला!', `${found.applicant_name} का प्रमोटर आवेदन विवरण नीचे प्रदर्शित है।`);
    } else {
      setTrackedApp(null);
    }
  };

  const handleQuickDemoClick = (mobileNo: string) => {
    setSearchMobile(mobileNo);
    handleTrackSubmit(undefined, mobileNo);
  };

  const handleDirectPromoterLogin = async () => {
    if (!trackedApp) return;
    setIsLoggingIn(true);
    try {
      const loginId = trackedApp.promoter_user_id || trackedApp.mobile;
      const loginPass = trackedApp.promoter_password || 'Promoter@123';
      const ok = await login(loginId, loginPass);
      if (ok) {
        if (onNavigateTab) {
          onNavigateTab('promoter-dashboard');
        }
      } else {
        if (onOpenPromoterLogin) {
          onOpenPromoterLogin(loginId);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-600" /> केवल 5 पद (Exclusive 5 Slots)
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
              वेतन: ₹15,000 / माह
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            🤝 प्रमोटिंग पार्टनर आवेदन एवं लाइव स्टेटस ट्रैकिंग
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            अपना पंजीकृत मोबाइल नंबर दर्ज करें और अपने आवेदन की स्टेप-बाय-स्टेप स्थिति तुरंत चेक करें।
          </p>
        </div>

        {onOpenApplyModal && (
          <button
            onClick={onOpenApplyModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-sm transition flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>नया प्रमोटर आवेदन करें (₹149 UTR)</span>
          </button>
        )}
      </div>

      {/* Mobile Input Search Form */}
      <form onSubmit={(e) => handleTrackSubmit(e)} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              maxLength={10}
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें (उदा. 9826012345)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>आवेदन स्टेटस चेक करें</span>
          </button>
        </div>

        {/* Official User Guidance Hint */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px]">
            सफ़ारगो प्रमोटर आवेदन के समय प्रयुक्त अपना 10-अंकों का आधिकारिक मोबाइल नंबर दर्ज करें।
          </span>
        </div>
      </form>

      {/* Result Display */}
      {hasSearched && !trackedApp && (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-base">
            कोई प्रमोटर आवेदन नहीं मिला
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            मोबाइल नंबर <strong>{searchMobile}</strong> पर कोई प्रमोटिंग पार्टनर आवेदन प्राप्त नहीं हुआ है। कृपया नंबर दोबारा जांचें या नया आवेदन जमा करें।
          </p>
          {onOpenApplyModal && (
            <button
              onClick={onOpenApplyModal}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
            >
              प्रमोटर पद हेतु नया आवेदन करें
            </button>
          )}
        </div>
      )}

      {trackedApp && (
        <div className="space-y-6 pt-2 animate-fadeIn">
          
          {/* ========================================================== */}
          {/* A. CONGRATULATIONS CELEBRATION BOX (IF ONBOARDED!)          */}
          {/* ========================================================== */}
          {trackedApp.status === 'onboarded_499_paid' ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-6 sm:p-8 text-slate-950 shadow-2xl border-2 border-amber-300">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-950 text-amber-300 shadow-sm">
                    आधिकारिक प्रमोटर पार्टनर सक्रिय (Slot #{trackedApp.assigned_slot})
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/40 text-slate-950">
                    ₹15,000 / माह वेतन
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
                    🎉 Congratulations! अब आप SafarGo के Exclusive Promoting Partner बन गए हैं!
                  </h3>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900">
                    काम शुरू करें — यह मौका सबको नहीं मिलता है!
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-2xl">
                    पूरे SafarGo नेटवर्क में सीमित 5 पदों में से आपका चयन हुआ है। आपके पास अपने क्षेत्र में एजेंट ऑनबोर्डिंग, KYC सत्यापन एवं लोकल दुकान पैकेज सेल करने के पूर्ण अधिकार हैं।
                  </p>
                </div>

                {/* Assigned Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-600 block font-bold">प्रमोटर कोड</span>
                    <strong className="text-sm font-black text-slate-950 font-mono">
                      {trackedApp.promoter_code || `PRM-MP-0${trackedApp.assigned_slot}`}
                    </strong>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-600 block font-bold">मासिक फिक्स मानदेय</span>
                    <strong className="text-sm font-black text-emerald-800 font-mono">
                      ₹15,000 / माह
                    </strong>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-600 block font-bold">लॉगिन यूजर आईडी</span>
                    <strong className="text-sm font-black text-slate-950 font-mono">
                      {trackedApp.promoter_user_id || trackedApp.mobile}
                    </strong>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-slate-600 block font-bold">पासवर्ड स्थिति</span>
                    <strong className="text-xs font-black text-slate-950">
                      {trackedApp.promoter_password ? 'सेट व सक्रिय ✓' : 'एडमिन द्वारा जारी'}
                    </strong>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleDirectPromoterLogin}
                    disabled={isLoggingIn}
                    className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 font-black text-sm shadow-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>{isLoggingIn ? 'लॉगिन हो रहा है...' : '🚀 प्रमोटर पोर्टल लॉगिन करें (Open Dashboard)'}</span>
                  </button>

                  <a
                    href={`https://wa.me/919876543210?text=${encodeURIComponent(
                      `नमस्ते SafarGo Admin, मैं अधिकृत प्रमोटर पार्टनर ${trackedApp.applicant_name} (कोड: ${trackedApp.promoter_code || `PRM-MP-0${trackedApp.assigned_slot}`}) हूँ।\nमेरा मोबाइल: ${trackedApp.mobile} है। कृपया कार्य विवरण व सामग्री साझा करें।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3.5 rounded-2xl bg-white/70 hover:bg-white text-slate-900 font-bold text-xs border border-amber-300 transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>सुपर एडमिन WhatsApp सपोर्ट</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* B. THANK YOU ACKNOWLEDGMENT BOX (IF SUBMITTED / IN PROGRESS)*/
            /* ========================================================== */
            <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5 text-indigo-950 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>अनुरोध जमा हुआ — रुचि दिखाने के लिए धन्यवाद!</span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-900/90 leading-relaxed">
                नमस्ते <strong>{trackedApp.applicant_name}</strong>, <strong>SafarGo प्रमोटिंग पार्टनर प्रोग्राम</strong> में रुचि दिखाने के लिए आपका बहुत-बहुत धन्यवाद! आपका आवेदन और ₹149 टोकन शुल्क UTR (<code>{trackedApp.application_fee_utr}</code>) सफलतापूर्वक दर्ज हो चुका है।
              </p>
              <p className="text-[11px] text-indigo-700">
                हमारी सीनियर टीम आपके कार्य अनुभव और क्षेत्र (<strong>{trackedApp.city}, {trackedApp.district}</strong>) की समीक्षा कर रही है। नीचे आपके आवेदन का लाइव स्टेटस प्रदर्शित है:
              </p>
            </div>
          )}

          {/* ========================================================== */}
          {/* C. 4-STEP VISUAL PROGRESSION TIMELINE                       */}
          {/* ========================================================== */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              आवेदन लाइव टाइमलाइन (4-Step Status Timeline)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              
              {/* STEP 1: Application Submitted */}
              <div className="p-4 rounded-xl border bg-white border-emerald-300 shadow-2xs relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    स्टेप 1: पूर्ण ✓
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h5 className="font-extrabold text-xs text-slate-900">
                  आवेदन व ₹149 शुल्क
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  आवेदन जमा हुआ। ₹149 टोकन शुल्क UTR: <span className="font-mono text-slate-800 font-bold">{trackedApp.application_fee_utr}</span>
                </p>
              </div>

              {/* STEP 2: Shortlist & Interview */}
              {(() => {
                const isPassed = trackedApp.status === 'interview_passed' || trackedApp.status === 'onboarded_499_paid';
                const isScheduled = trackedApp.status === 'interview_scheduled';
                return (
                  <div
                    className={`p-4 rounded-xl border relative shadow-2xs ${
                      isPassed
                        ? 'bg-white border-emerald-300'
                        : isScheduled
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isScheduled
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isPassed ? 'स्टेप 2: उत्तीर्ण ✓' : isScheduled ? 'स्टेप 2: शेड्यूल 📅' : 'स्टेप 2: समीक्षा'}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isScheduled ? (
                        <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <h5 className="font-extrabold text-xs text-slate-900">
                      शॉर्टलिस्टिंग व इंटरव्यू
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {isPassed
                        ? `इंटरव्यू पास! ${trackedApp.interview_notes || 'सफलतापूर्वक चयनित'}`
                        : isScheduled
                        ? `इंटरव्यू दिनांक: ${trackedApp.interview_date || 'शीघ्र'} | कृपया कॉल के लिए तैयार रहें।`
                        : 'प्रोफाइल समीक्षाधीन है। 24 घंटे में इंटरव्यू कॉल आएगा।'}
                    </p>
                  </div>
                );
              })()}

              {/* STEP 3: Slot Allocation & ₹499 Onboarding Fee */}
              {(() => {
                const isOnboarded = trackedApp.status === 'onboarded_499_paid';
                const isPassed = trackedApp.status === 'interview_passed';
                return (
                  <div
                    className={`p-4 rounded-xl border relative shadow-2xs ${
                      isOnboarded
                        ? 'bg-white border-emerald-300'
                        : isPassed
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isOnboarded
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPassed
                            ? 'bg-indigo-200 text-indigo-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOnboarded ? 'स्टेप 3: पूर्ण ✓' : isPassed ? 'स्टेप 3: प्रतीक्षारत ⏳' : 'स्टेप 3'}
                      </span>
                      {isOnboarded ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <h5 className="font-extrabold text-xs text-slate-900">
                      ₹499 ऑनबोर्डिंग व स्लॉट
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {isOnboarded
                        ? `स्लॉट #${trackedApp.assigned_slot} कन्फर्म! UTR: ${trackedApp.onboarding_fee_utr || 'सत्यापित'}`
                        : isPassed
                        ? 'सुपर एडमिन द्वारा स्लॉट नंबर (1-5) अलॉट किया जा रहा है।'
                        : 'इंटरव्यू पास होने के बाद स्लॉट अलॉट होगा।'}
                    </p>
                  </div>
                );
              })()}

              {/* STEP 4: Official Promoter Partner Activation */}
              {(() => {
                const isOnboarded = trackedApp.status === 'onboarded_499_paid';
                return (
                  <div
                    className={`p-4 rounded-xl border relative shadow-2xs ${
                      isOnboarded
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isOnboarded
                            ? 'bg-amber-300 text-slate-950'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isOnboarded ? 'स्टेप 4: एक्टिव 🎉' : 'स्टेप 4'}
                      </span>
                      {isOnboarded ? (
                        <Award className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <h5 className="font-extrabold text-xs text-slate-900">
                      प्रमोटर पार्टनर एक्टिवेशन
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {isOnboarded
                        ? 'आधिकारिक प्रमोटर सक्रिय! ₹15,000 मानदेय शुरू, एजेंट अप्रूवल व KYC डेस्क एक्टिव।'
                        : 'अंतिम एक्टिवेशन व यूजर आईडी जारी होना शेष।'}
                    </p>
                  </div>
                );
              })()}

            </div>
          </div>

          {/* Quick Promoter Login Direct Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="block font-bold text-white text-sm">
                  प्रमोटिंग पार्टनर स्पेशल लॉगिन पोर्टल
                </strong>
                <span className="text-slate-400">
                  अधिकृत प्रमोटर्स अपने यूजर आईडी या मोबाइल और पासवर्ड से सीधे लॉगिन करें।
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenPromoterLogin) {
                  onOpenPromoterLogin(trackedApp.promoter_user_id || trackedApp.mobile);
                }
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs shrink-0 transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>प्रमोटर लॉगिन टैब खोलें</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
