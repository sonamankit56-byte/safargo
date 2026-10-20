import React, { useEffect, useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  Navigation, 
  MapPin, 
  Clock, 
  QrCode, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  MessageSquare,
  Sparkles,
  PhoneCall,
  Lock,
  AlertCircle
} from 'lucide-react';
import { SafarGoLogo } from '../common/SafarGoLogo';

export const BusBookingSuccess: React.FC = () => {
  const { latestBooking, setActiveService, setCurrentStep, isAgentMode, sendBookingWhatsApp, t } = useTravel();
  const [copiedPnr, setCopiedPnr] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppSuccessMsg, setWhatsAppSuccessMsg] = useState<string | null>(null);

  const handleSendWhatsApp = async () => {
    if (!latestBooking) return;
    setIsSendingWhatsApp(true);
    try {
      const res = await sendBookingWhatsApp(latestBooking);
      if (res.success) {
        setWhatsAppSuccessMsg('✅ WhatsApp पर ई-टिकट सफलतापूर्वक भेज दिया गया!');
      } else if (res.directWebUrl) {
        window.open(res.directWebUrl, '_blank');
        setWhatsAppSuccessMsg('📲 WhatsApp वेब विंडो खोली गई है।');
      }
    } catch {
      setWhatsAppSuccessMsg('WhatsApp भेजने में त्रुटि');
    } finally {
      setIsSendingWhatsApp(false);
      setTimeout(() => setWhatsAppSuccessMsg(null), 5000);
    }
  };

  useEffect(() => {
    // Multi-cannon celebration bursts
    const end = Date.now() + 1500;
    const colors = ['#059669', '#10b981', '#f59e0b', '#6366f1', '#e11d48'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!latestBooking || !latestBooking.busDetails) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200 mt-8">
        <p className="text-slate-600 mb-4">{t('कोई बुकिंग नहीं मिली', 'No recent booking found')}</p>
        <button
          onClick={() => {
            setActiveService('bus');
            setCurrentStep('search');
          }}
          className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
        >
          {t('नई बस खोजें', 'Search Buses')}
        </button>
      </div>
    );
  }

  const { pnr, travelDate, totalAmount, paymentMethod, passengerDetails, busDetails, status, utr } = latestBooking;
  const { bus, selectedSeats, boardingPoint, droppingPoint, passengers } = busDetails;
  const isPending = status === 'pending';

  const handleCopyPnr = () => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 3000);
  };

  const handlePrint = () => {
    if (isPending) {
      alert('🔒 यह टिकट वर्तमान में समीक्षाधीन है। एडमिन द्वारा UTR सत्यापित होते ही ई-टिकट डाउनलोड उपलब्ध होगा।');
      return;
    }
    window.print();
  };

  const handleTrackLive = () => {
    setActiveService('trips');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-28">
      {/* Keyframe animations for checkmark drawing & ripple */}
      <style>{`
        @keyframes circle-draw {
          0% {
            stroke-dashoffset: 283;
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkmark-draw {
          0% {
            stroke-dashoffset: 70;
            opacity: 0;
          }
          60% {
            stroke-dashoffset: 70;
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes ripple-pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.35);
            opacity: 0;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes fold-down {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-circle-draw {
          stroke-dasharray: 283;
          animation: circle-draw 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-checkmark-draw {
          stroke-dasharray: 70;
          animation: checkmark-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-ripple {
          animation: ripple-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .animate-fold-down {
          animation: fold-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
        }
      `}</style>

      {/* Modern Order Placed Celebration / Pending Section */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center my-3">
          {/* Pulsing Ripple rings */}
          <div className={`absolute w-28 h-28 rounded-full ${isPending ? 'bg-amber-400/25' : 'bg-emerald-400/25'} animate-ripple`} />
          <div className={`absolute w-36 h-36 rounded-full ${isPending ? 'bg-amber-400/15' : 'bg-emerald-400/15'} animate-ripple`} style={{ animationDelay: '0.4s' }} />

          {/* Animated SVG Check / Clock Circle */}
          <div className={`relative w-24 h-24 rounded-full ${
            isPending 
              ? 'bg-gradient-to-tr from-amber-600 to-amber-400 shadow-xl shadow-amber-500/30' 
              : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-500/30'
          } flex items-center justify-center`}>
            {isPending ? (
              <Clock className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  className="animate-circle-draw"
                />
                <path
                  d="M30 52 L43 65 L70 38"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-checkmark-draw"
                />
              </svg>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
          {isPending 
            ? t('⏳ बुकिंग प्राप्त - एडमिन समीक्षाधीन', '⏳ Booking Received - Pending Verification')
            : t('🎉 बुकिंग सफलतापूर्वक संपन्न हुई!', '🎉 Booking Placed Successfully!')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {isPending
            ? t(
                'आपका टिकट दर्ज हो चुका है और सुपर एडमिन डेस्क पर समीक्षाधीन है। पेमेंट UTR सत्यापन के बाद ई-टिकट डाउनलोड सक्रिय हो जाएगा।',
                'Ticket request placed and is under Super Admin review. e-Ticket download unlocks upon bank UTR approval.'
              )
            : t(
                'आपका टिकट कन्फर्म हो चुका है। बोर्डिंग पास SMS और WhatsApp पर भेज दिया गया है।',
                'Your seat is reserved. Digital boarding pass dispatched via SMS & WhatsApp.'
              )}
        </p>

        {/* Live Notification Strip */}
        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp & SMS अपडेट: <strong className="font-mono">+91 {passengerDetails.mobile}</strong></span>
        </div>

        {/* Fixed Agent Commission Callout */}
        {isAgentMode && (
          <div className="mt-2 block">
            <div className={`inline-flex items-center gap-1.5 border px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
              isPending 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {t('फिक्स एजेंट कमीशन', 'Agent Commission')}: <strong>+₹19.34</strong> {isPending ? t('(सत्यापन उपरांत वॉलेट में क्रेडिट होगा)', '(Credited upon Admin Verification)') : t('(वॉलेट में जमा • तत्काल निकासी योग्य)', '(Credited to Wallet • Ready to Withdraw)')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Boarding Pass Card (With Smooth Fold-down Animation) */}
      <div 
        className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden relative animate-fold-down" 
        id="printable-ticket"
      >
        {/* Decorative Ticket Cutout Notches */}
        <div className="hidden sm:block absolute -left-3 top-48 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200 z-20" />
        <div className="hidden sm:block absolute -right-3 top-48 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200 z-20" />

        {/* Ticket Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SafarGoLogo variant="white" size="sm" />
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                isPending 
                  ? 'bg-amber-500/30 text-amber-300 border-amber-400/40' 
                  : 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40'
              }`}>
                {isPending ? '⏳ Verification Pending' : 'Confirmed Ticket'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 block font-bold">
                {t('PNR संख्या', 'PNR NUMBER')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-lg sm:text-xl text-amber-400 tracking-widest">{pnr}</span>
                <button
                  onClick={handleCopyPnr}
                  className="p-1 hover:bg-white/10 rounded transition"
                  title="Copy PNR"
                >
                  {copiedPnr ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="p-6 space-y-6">
          {/* Operator & Bus */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">{bus.operatorName}</h3>
                {bus.isPrimo && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    PRIMO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{bus.busType}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400">{t('यात्रा तिथि', 'Travel Date')}</span>
              <p className="font-bold text-slate-900 text-sm">{travelDate}</p>
            </div>
          </div>

          {/* From -> To Schedule */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold">{t('प्रस्थान (Boarding)', 'Departure')}</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{bus.departureTime}</p>
              <p className="text-xs font-bold text-emerald-700 mt-1">{boardingPoint.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{boardingPoint.address}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold">{t('पहुंचना (Dropping)', 'Arrival')}</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{bus.arrivalTime}</p>
              <p className="text-xs font-bold text-indigo-700 mt-1">{droppingPoint.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{droppingPoint.address}</p>
            </div>
          </div>

          {/* Seat & Passenger Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-5 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">{t('सीट संख्या (Seats)', 'Seat Numbers')}</span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                {selectedSeats.join(', ')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">{t('मुख्य यात्री', 'Lead Passenger')}</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{passengerDetails.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">{t('मोबाइल', 'Mobile')}</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">+91 {passengerDetails.mobile}</span>
            </div>
          </div>

          {/* QR Code and Total Amount */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-slate-900 rounded-xl bg-white shadow-sm">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">{t('बोर्डिंग क्यूआर कोड', 'Boarding QR Code')}</p>
                <p className="text-slate-400 text-[11px]">{t('बस में चढ़ते समय कंडक्टर को दिखाएं', 'Show this code while boarding bus')}</p>
              </div>
            </div>

            <div className="text-right w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">{t('कुल भुगतान किया गया', 'Total Amount Paid')}</span>
              <div className="text-2xl font-black text-slate-900">₹{totalAmount}</div>
              <div className="flex flex-col sm:items-end gap-1 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block ${
                  isPending 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {paymentMethod.toUpperCase()} • {isPending ? t('⏳ समीक्षाधीन (VERIFYING)', 'PENDING AUDIT') : t('सफल (PAID)', 'PAID')}
                </span>
                {utr && (
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    UTR: {utr}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Footer Security Guarantee */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SafarGo Assured • 24x7 Support: 1800-SAFAR-GO</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Govt Approved Mobility Partner</span>
        </div>
      </div>

      {/* WhatsApp Message Feedback Banner */}
      {whatsAppSuccessMsg && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-900 shadow-sm animate-scale-up">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{whatsAppSuccessMsg}</span>
          </div>
          <button
            onClick={() => setWhatsAppSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-mono text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={handleTrackLive}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 transition text-xs sm:text-sm active:scale-95"
        >
          <Navigation className="w-4 h-4" />
          <span>{t('लाइव बस ट्रैक करें', 'Track Bus')}</span>
        </button>

        {/* 1-Click WhatsApp Ticket Dispatch */}
        <button
          onClick={handleSendWhatsApp}
          disabled={isSendingWhatsApp}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-black rounded-xl shadow-md shadow-green-600/30 transition text-xs sm:text-sm"
          title="WhatsApp पर तुरंत डिजिटल ई-टिकट प्राप्त करें"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isSendingWhatsApp ? 'भेज रहा है...' : t('WhatsApp ई-टिकट', 'WhatsApp Ticket')}</span>
        </button>

        {isPending ? (
          <button
            onClick={handlePrint}
            disabled
            className="flex items-center justify-center gap-2 px-3 py-3 bg-amber-50 border-2 border-dashed border-amber-300 text-amber-800 font-bold rounded-xl shadow-xs transition text-xs sm:text-sm cursor-not-allowed opacity-90"
            title="एडमिन सत्यापन के बाद ई-टिकट डाउनलोड उपलब्ध होगा"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>{t('🔒 ई-टिकट लॉक', '🔒 Ticket Locked')}</span>
          </button>
        ) : (
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-xl shadow-sm transition text-xs sm:text-sm active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>{t('प्रिंट / PDF', 'Print PDF')}</span>
          </button>
        )}

        <button
          onClick={() => {
            setActiveService('bus');
            setCurrentStep('search');
          }}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm active:scale-95"
        >
          <span>{t('नई यात्रा', 'New Trip')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pending Review Guidance Banner */}
      {isPending && (
        <div className="mt-4 p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              {t('🔒 एडमिन सत्यापन सुरक्षा गेटवे', 'Admin Verification Security Gateway')}
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              {t(
                'यह टिकट समीक्षाधीन (Pending) है। सफ़रगो सुपर एडमिन द्वारा बैंक UTR की पुष्टि होते ही ई-टिकट डाउनलोड अनलॉक हो जाएगा और ₹19.34 कमीशन वॉलेट में क्रेडिट होगा। आप "मेरी बुकिंग" टैब में भी लाइव स्टेटस देख सकते हैं।',
                'This ticket is under review. Super Admin will verify bank UTR to unlock e-ticket download and credit ₹19.34 commission. You can check real-time status in "My Bookings" tab.'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
