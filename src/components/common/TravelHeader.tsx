import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Hotel, 
  Car, 
  Ticket, 
  Briefcase, 
  Globe, 
  PhoneCall, 
  Sparkles,
  ShieldCheck,
  User,
  Plane,
  Utensils,
  Zap,
  Lock,
  LogOut,
  Wallet,
  Download,
  MessageCircle,
  Bot
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import { TravelService } from '../../types/travel';
import { SafarGoLogo } from './SafarGoLogo';
import { isWhatsAppLinked } from '../../lib/whatsappService';

export const TravelHeader: React.FC = () => {
  const { 
    activeService, 
    setActiveService, 
    bookings, 
    isAgentMode, 
    setIsAgentMode,
    isAgentLoggedIn,
    isCustomerLoggedIn,
    customerLogout,
    currentAgent,
    agentLogout,
    setIsAuthModalOpen,
    language, 
    toggleLanguage,
    userProfile,
    agentWalletBalance,
    t 
  } = useTravel();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isWaLinked, setIsWaLinked] = useState(false);

  useEffect(() => {
    setIsWaLinked(isWhatsAppLinked());
    const onLinked = () => setIsWaLinked(true);
    const onUnlinked = () => setIsWaLinked(false);
    window.addEventListener('safargo_whatsapp_linked', onLinked);
    window.addEventListener('safargo_whatsapp_unlinked', onUnlinked);
    return () => {
      window.removeEventListener('safargo_whatsapp_linked', onLinked);
      window.removeEventListener('safargo_whatsapp_unlinked', onUnlinked);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('सफ़रगो ऐप इंस्टॉल करने के लिए अपने मोबाइल ब्राउज़र मेन्यू में जाकर "Add to Home screen" (होम स्क्रीन पर जोड़ें) चुनें।');
    }
  };

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'boarding_soon').length;

  const isAnyUserLoggedIn = isAgentLoggedIn || isCustomerLoggedIn;

  const handleServiceClick = (srvId: TravelService) => {
    setActiveService(srvId);
  };

  const services: { 
    id: TravelService; 
    label: string; 
    hindiLabel: string; 
    icon: React.ReactNode; 
    badge?: string;
    badgeStyle?: string;
  }[] = [
    { 
      id: 'bus', 
      label: 'Buses', 
      hindiLabel: 'बसें', 
      icon: <Bus className="w-4 h-4" />,
      badge: '✨ 3D',
      badgeStyle: 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-black shadow-xs animate-pulse'
    },
    { 
      id: 'hotel', 
      label: 'Hotels', 
      hindiLabel: 'होटल्स', 
      icon: <Hotel className="w-4 h-4" />, 
      badge: '⏳ जल्द',
      badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
    },
    { 
      id: 'flights', 
      label: 'Flights', 
      hindiLabel: 'फ्लाइट्स', 
      icon: <Plane className="w-4 h-4" />, 
      badge: '⏳ जल्द',
      badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
    },
    { 
      id: 'cab', 
      label: 'Cabs', 
      hindiLabel: 'कैब्स', 
      icon: <Car className="w-4 h-4" />, 
      badge: '⏳ जल्द',
      badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
    },
    { 
      id: 'tiffin', 
      label: 'GoTifin', 
      hindiLabel: 'गो टिफिन', 
      icon: <Utensils className="w-4 h-4" />, 
      badge: '⏳ जल्द',
      badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
    },
    { 
      id: 'recharge', 
      label: 'Mobile Recharge', 
      hindiLabel: 'रिचार्ज', 
      icon: <Zap className="w-4 h-4" />, 
      badge: '⚡ लाइव',
      badgeStyle: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black'
    },
    { 
      id: 'trips', 
      label: 'My Bookings', 
      hindiLabel: 'मेरी बुकिंग', 
      icon: <Ticket className="w-4 h-4" />, 
      badge: activeBookingsCount > 0 ? String(activeBookingsCount) : undefined,
      badgeStyle: 'bg-rose-600 text-white'
    },
    { 
      id: 'agent', 
      label: 'Agent Hub', 
      hindiLabel: 'एजेंट हब', 
      icon: <Briefcase className="w-4 h-4" />, 
      badge: 'पोर्टल',
      badgeStyle: 'bg-indigo-100 text-indigo-900 font-black'
    },
    { 
      id: 'account', 
      label: 'My Account', 
      hindiLabel: 'अकाउंट', 
      icon: <User className="w-4 h-4" /> 
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-[#0B194C] via-[#1E3A8A] to-[#E11D48] text-white py-1 px-3 text-[11px] font-semibold text-center flex items-center justify-center gap-2 overflow-hidden shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
        <span>
          {t(
            '🚌 सफ़रगो ट्रेवल्स • बस व होटल बुकिंग पर ₹250 तक की छूट • कोड: SAFARGO250',
            '🚌 SafarGo Travels • Up to ₹250 Off on Bus & Hotel Bookings • Use Code: SAFARGO250'
          )}
        </span>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo Component */}
        <div 
          onClick={() => setActiveService('bus')}
          className="cursor-pointer select-none"
        >
          <SafarGoLogo size="md" variant="full" />
        </div>

        {/* Desktop Services Switcher Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {services.map((srv) => {
            const isActive = activeService === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => handleServiceClick(srv.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-[#0B194C] shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span className={isActive ? 'text-[#E11D48]' : ''}>{srv.icon}</span>
                <span>{t(srv.hindiLabel, srv.label)}</span>
                {srv.badge && (
                  <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-black ${srv.badgeStyle || 'bg-amber-100 text-amber-800'}`}>
                    {srv.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Agent Mode Toggle, Helpline, Language, Auth / Account */}
        <div className="flex items-center gap-2">
          {/* AI Autonomous Swarm Desk (Agency Agents Protocol) */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('safargo_open_swarm_modal'));
            }}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-full text-xs font-black shadow-sm transition active:scale-98 cursor-pointer"
            title="SafarGo AI Autonomous Swarm - एजेंसी एजेंट्स टीमवर्क हब"
          >
            <Bot className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span className="hidden md:inline">AI Swarm</span>
            <span className="md:hidden">AI</span>
          </button>

          {/* WhatsApp Linking Pill */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('safargo_open_whatsapp_link_modal'));
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black transition active:scale-98 shadow-sm ${
              isWaLinked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title="WhatsApp नंबर लिंक करें एवं 100% फ्री OTP चालू करें"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 bg-white rounded-full p-0.5" />
            <span className="hidden sm:inline">{isWaLinked ? 'WhatsApp लिंक्ड' : 'WhatsApp लिंक'}</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>

          {/* Universal PNR Status Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('safargo_open_pnr_modal'));
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-xs font-black transition active:scale-95 shadow-sm"
            title="लाइव PNR स्टेटस व ई-बोर्डिंग पास"
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-600" />
            <span>PNR स्टेटस</span>
          </button>

          {/* Agent Live Wallet Balance Pill */}
          {isAgentLoggedIn && (
            <button
              onClick={() => setActiveService('agent')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-black shadow-xs transition active:scale-95"
              title="एजेंट वॉलेट बैलेंस (क्लिक करके वॉलेट देखें)"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{agentWalletBalance.toFixed(2)}</span>
            </button>
          )}

          {/* PWA App Install Button */}
          <button
            onClick={handleInstallClick}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-full transition shadow-xs active:scale-95"
            title="सफ़रगो ऐप इंस्टॉल करें"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('ऐप इंस्टॉल', 'App')}</span>
          </button>

          {/* Agent Commission Toggle Pill (Visible when logged in) */}
          {isAgentLoggedIn && (
            <button
              onClick={() => setIsAgentMode(!isAgentMode)}
              className={`hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                isAgentMode 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAgentMode ? t('एजेंट मोड चालू', 'Agent Mode ON') : t('एजेंट मोड', 'Agent Mode')}</span>
            </button>
          )}

          {/* 24x7 Customer Helpline */}
          <a
            href="tel:1800-SAFARGO"
            className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#0B194C] px-2 py-1"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
            <span className="text-[11px]">24x7 Help</span>
          </a>

          {/* Multi-Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Switch Language (हिंदी / English)"
          >
            <Globe className="w-3.5 h-3.5 text-[#0B194C]" />
            <span>{language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* If NOT logged in: Prominent Login Button */}
          {!isAnyUserLoggedIn ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-700 hover:from-rose-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t('लॉगिन / साइन-अप', 'Login / Sign Up')}</span>
            </button>
          ) : (
            /* Logged in User/Agent Quick Desk */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveService('account')}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                  activeService === 'account'
                    ? 'bg-[#0B194C] text-white border-[#0B194C] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  {(isAgentLoggedIn ? (currentAgent?.fullName || 'A') : (userProfile.name || 'G')).charAt(0)}
                </div>
                <span className="hidden sm:inline">
                  {isAgentLoggedIn 
                    ? (currentAgent?.fullName || 'एजेंट').split(' ')[0] 
                    : (userProfile.name || 'ग्राहक').split(' ')[0]}
                </span>
                {!isAgentLoggedIn && (
                  <span className="hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 font-bold">
                    ग्राहक
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm(t('क्या आप वाकई लॉगआउट करना चाहते हैं?', 'Do you want to log out?'))) {
                    if (isAgentLoggedIn) {
                      agentLogout();
                    } else {
                      customerLogout();
                    }
                  }
                }}
                title={t('लॉगआउट करें', 'Logout')}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Services Tabs Strip */}
      <div className="xl:hidden border-t border-slate-100 px-2 py-1.5 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50 text-xs">
        {services.map((srv) => {
          const isActive = activeService === srv.id;
          return (
            <button
              key={srv.id}
              onClick={() => handleServiceClick(srv.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all relative shrink-0 ${
                isActive 
                  ? 'bg-[#0B194C] text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <span>{srv.icon}</span>
              <span className="text-[11px]">{t(srv.hindiLabel, srv.label)}</span>
              {srv.badge && (
                <span className={`text-[7px] px-1 rounded-full font-black ${
                  srv.id === 'trips' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  {srv.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
