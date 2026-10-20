import React, { useState, useEffect } from 'react';
import { useTravel } from './context/TravelContext';
import { TravelHeader } from './components/common/TravelHeader';
import { TravelBottomNav } from './components/common/TravelBottomNav';
import { SafarGoLogo } from './components/common/SafarGoLogo';
import { BusSearchCard } from './components/bus/BusSearchCard';
import { BusList } from './components/bus/BusList';
import { SeatLayoutPicker } from './components/bus/SeatLayoutPicker';
import { BoardingDropping } from './components/bus/BoardingDropping';
import { PassengerForm } from './components/bus/PassengerForm';
import { BusBookingSuccess } from './components/bus/BusBookingSuccess';
import { HotelSearchCard } from './components/hotel/HotelSearchCard';
import { HotelList } from './components/hotel/HotelList';
import { CabBookingSection } from './components/cab/CabBookingSection';
import { MyTripsScreen } from './components/trips/MyTripsScreen';
import { AgentEarningDesk } from './components/agent/AgentEarningDesk';
import { TravelAccountScreen } from './components/account/TravelAccountScreen';
import { HotelComingSoon } from './components/services/HotelComingSoon';
import { FlightComingSoon } from './components/services/FlightComingSoon';
import { GoTifinComingSoon } from './components/services/GoTifinComingSoon';
import { RechargeScreen } from './components/services/RechargeScreen';
import { CabComingSoon } from './components/services/CabComingSoon';
import { AuthModal } from './components/auth/AuthModal';
import { IncomingSmsToast } from './components/common/IncomingSmsToast';
import { SafarGoAiCopilot } from './components/common/SafarGoAiCopilot';
import { PnrStatusModal } from './components/common/PnrStatusModal';
import { WhatsAppLinkModal } from './components/common/WhatsAppLinkModal';
import { AgencySwarmModal } from './components/common/AgencySwarmModal';
import { ShieldCheck, PhoneCall, Sparkles, Award, Gift, Zap, Key, Lock, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TravelApp: React.FC = () => {
  const { 
    activeService, 
    currentStep, 
    t, 
    setAgentPassword, 
    agentLogin, 
    setActiveService,
    isAgentLoggedIn,
    setIsAuthModalOpen 
  } = useTravel();

  // Password Setup Token from Email URL
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetAgentId, setTargetAgentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPnrModalOpen, setIsPnrModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenPnr = () => setIsPnrModalOpen(true);
    window.addEventListener('safargo_open_pnr_modal', handleOpenPnr);
    return () => window.removeEventListener('safargo_open_pnr_modal', handleOpenPnr);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const agentId = params.get('agentId');
      if (action === 'set_password' && agentId) {
        setTargetAgentId(agentId);
        setIsPasswordModalOpen(true);
      }
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem('safargo_referred_by', refCode);
        setActiveService('agent');
      }
    }
  }, []);

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError(t('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए', 'Password must be at least 6 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('दोनों पासवर्ड मेल नहीं खाते', 'Passwords do not match'));
      return;
    }

    const saved = setAgentPassword(targetAgentId, newPassword);
    if (saved) {
      setPasswordSuccess(true);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      } catch {}

      // Auto login after 1.5 seconds
      setTimeout(() => {
        agentLogin(targetAgentId, newPassword);
        setActiveService('agent');
        setIsPasswordModalOpen(false);
        // Clear URL search params
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1500);
    } else {
      setPasswordError(t('पासवर्ड सेव करने में समस्या आई। कृपया एजेंट आईडी जांचें।', 'Failed to save password.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <div>
        {/* Sticky Header with Logo, Navigation Tabs, Language & Agent Toggle */}
        <TravelHeader />

        {/* Global Mandatory Login Alert for Unauthenticated Users */}
        {!isAgentLoggedIn && (
          <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-3">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-700 rounded-2xl text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black block truncate">
                    सेवाओं का उपयोग करने के लिए लॉगिन अनिवार्य है
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/90 block truncate">
                    रिचार्ज, बस टिकट व अन्य सभी सुविधाओं का उपयोग करने के लिए कृपया पहले लॉगिन करें
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 sm:px-5 py-2 bg-white text-slate-950 hover:bg-yellow-300 text-xs font-black rounded-xl shadow-md transition active:scale-95 shrink-0 cursor-pointer"
              >
                लॉगिन / साइन-अप
              </button>
            </div>
          </div>
        )}

        {/* Main Super App Router */}
        <main className="w-full">
          {/* BUS MODULE */}
          {activeService === 'bus' && (
            <div>
              {currentStep === 'search' && (
                <div className="space-y-6">
                  <BusSearchCard />

                  {/* SafarGo Primo Value Highlights */}
                  <div className="max-w-4xl mx-auto px-4 pb-12">
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-amber-400/20 text-amber-400 rounded-2xl">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">SafarGo Primo Buses</h4>
                          <p className="text-xs text-slate-300 mt-1">
                            {t('उच्चतम रेटेड बसें, ऑन-टाइम गारंटी और आरामदायक स्लीपर बर्थ।', 'Top rated buses with 100% on-time guarantee and clean luxury berths.')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-emerald-400/20 text-emerald-400 rounded-2xl">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">Women Safety Assured</h4>
                          <p className="text-xs text-slate-300 mt-1">
                            {t('महिलाओं के लिए विशेष आरक्षित सीटें व 24x7 इमरजेंसी हेल्पलाइन।', 'Reserved seats for women travelers with dedicated 24x7 security monitoring.')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-rose-400/20 text-rose-400 rounded-2xl">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">Instant Refund</h4>
                          <p className="text-xs text-slate-300 mt-1">
                            {t('कैंसिलेशन पर तुरंत आपके बैंक खाते में 100% रिफंड ट्रांसफर।', 'Cancel anytime with instant refund credited back to your UPI or bank.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'bus_list' && <BusList />}
              {currentStep === 'seat_select' && <SeatLayoutPicker />}
              {currentStep === 'boarding_select' && <BoardingDropping />}
              {currentStep === 'passenger_form' && <PassengerForm />}
              {currentStep === 'booking_success' && <BusBookingSuccess />}
            </div>
          )}

          {/* HOTEL MODULE (Coming Soon - 50% Off) */}
          {activeService === 'hotel' && <HotelComingSoon />}

          {/* FLIGHTS MODULE (Coming Soon) */}
          {activeService === 'flights' && <FlightComingSoon />}

          {/* GOTIFIN SPECIAL SERVICE (Women Empowerment Fixed Salary + Worker/Student Meals) */}
          {activeService === 'tiffin' && <GoTifinComingSoon />}

          {/* MOBILE & UTILITY RECHARGE (Super Advance Bharat BillPay BBPS Engine) */}
          {activeService === 'recharge' && <RechargeScreen />}

          {/* CAB MODULE (Coming Soon) */}
          {activeService === 'cab' && <CabComingSoon />}

          {/* MY TRIPS & LIVE GPS MODULE */}
          {activeService === 'trips' && <MyTripsScreen />}

          {/* AGENT COMMISSION PORTAL */}
          {activeService === 'agent' && <AgentEarningDesk />}

          {/* MY ACCOUNT & OFFERS SYSTEM */}
          {(activeService === 'account' || activeService === 'offers') && <TravelAccountScreen />}
        </main>
      </div>

      {/* Global Travel Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 text-xs mt-12 pb-24 md:pb-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <SafarGoLogo variant="white" size="lg" />
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t(
                'भारत की अग्रणी ऑनलाइन बस टिकट और होटल बुकिंग सेवा। 2,500+ अधिकृत ऑपरेटर्स, रियल-टाइम जीपीएस ट्रैकिंग और 24x7 ग्राहक सहायता।',
                "India's premier bus ticketing and hotel reservation platform. Over 2,500+ licensed bus operators with live GPS tracking."
              )}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">{t('शीर्ष बस रूट्स', 'Top Bus Routes')}</h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>Delhi to Jaipur Bus</li>
              <li>Delhi to Manali Volvo Bus</li>
              <li>Mumbai to Goa Sleeper Bus</li>
              <li>Indore to Bhopal AC Bus</li>
              <li>Jaipur to Udaipur Luxury Bus</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">{t('होटल्स और रिसॉर्ट्स', 'Top Hotels')}</h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>Hotels in Jaipur Pink City</li>
              <li>Beach Resorts in Goa</li>
              <li>Himalayan Cedar Retreat Manali</li>
              <li>Business Suites in Delhi CP</li>
              <li>Lake Facing Hotels in Udaipur</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">{t('24x7 सहायता व संपर्क', '24x7 Support & Trust')}</h5>
            <p className="text-slate-400 mb-2">Toll Free: 1800-SAFAR-GO</p>
            <p className="text-slate-400 mb-3">WhatsApp: +91 98200 12345</p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>100% Safe Payments • Govt Certified License</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} SafarGo Travel Technologies Pvt. Ltd. All rights reserved. Made with pride in India.
        </div>
      </footer>

      {/* Modal: Set Agent Password from Email Link */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    {t('अपना एजेंट पासवर्ड सेट करें', 'Set Your Agent Password')}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400 font-bold block">
                    ID: {targetAgentId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!passwordSuccess ? (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('बधाई हो! आपका अकाउंट सक्रिय हो चुका है। अब अपना स्थायी पासवर्ड सेट करें।', 'Account approved! Set your permanent password now.')}</span>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('नया पासवर्ड (New Password)', 'New Password')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">कम से कम 6 अक्षर का पासवर्ड रखें</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('पासवर्ड की पुष्टि करें (Confirm Password)', 'Confirm Password')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{t('पासवर्ड सुरक्षित करें एवं लॉगिन करें', 'Save Password & Enter Agent Hub')}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 text-base">
                  {t('पासवर्ड सफलतापूर्वक सेट हुआ!', 'Password Set Successfully!')}
                </h4>
                <p className="text-xs text-slate-500">
                  {t('आपको सीधे एजेंट हब में लॉगिन किया जा रहा है...', 'Redirecting to Agent Desk...')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Mandatory Login Modal Gateway */}
      <AuthModal />

      {/* Universal WhatsApp Number Linking & Verification Portal */}
      <WhatsAppLinkModal />

      {/* Autonomous AI Agent Teamwork Swarm Dashboard */}
      <AgencySwarmModal />

      {/* Real-time Mobile SMS & WhatsApp Alert Banner */}
      <IncomingSmsToast />

      {/* Super Advance SafarGo AI Voice & Travel Assistant */}
      <SafarGoAiCopilot />

      {/* Universal Live PNR Status & Boarding Pass Modal */}
      <PnrStatusModal isOpen={isPnrModalOpen} onClose={() => setIsPnrModalOpen(false)} />

      {/* Persistent Mobile Bottom Navigation */}
      <TravelBottomNav />
    </div>
  );
};

export default TravelApp;
