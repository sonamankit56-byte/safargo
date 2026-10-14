import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Wallet,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { compressImage } from '../../lib/storageUtils';

interface WalletRechargeModalProps {
  onClose: () => void;
}

export const WalletRechargeModal: React.FC<WalletRechargeModalProps> = ({ onClose }) => {
  const { settings, requestWalletRecharge, agentWalletBalance, agentWalletRecharges } = useData();
  const { error, success } = useToast();

  const safeWalletBalance = Number(agentWalletBalance) || 0;
  const minAmount = Number(settings?.min_wallet_recharge) || 2000;
  const [amount, setAmount] = useState<string>(minAmount.toString());
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethod] = useState<'upi_qr' | 'bank_transfer'>('upi_qr');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(600); // 10 minutes = 600 seconds

  // 10-minute countdown timer
  useEffect(() => {
    if (!isSubmittedSuccess || countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmittedSuccess, countdownSeconds]);

  // Check if admin approved this recharge request in real time
  const activeSubmittedRecharge = isSubmittedSuccess
    ? (agentWalletRecharges || []).find(
        (r) =>
          (utrNumber.trim().length > 0 && r?.utr_number?.trim() === utrNumber.trim()) ||
          (Number(r?.amount) === (parseFloat(amount) || 0) &&
            r?.status === 'approved' &&
            r?.created_at &&
            new Date(r.created_at).getTime() > Date.now() - 3600000)
      )
    : undefined;
  const isApprovedByAdmin = activeSubmittedRecharge?.status === 'approved';

  // Intercept browser back / refresh / tab close while timer is active
  useEffect(() => {
    if (!isSubmittedSuccess || isApprovedByAdmin || countdownSeconds <= 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '⚠️ आवश्यक चेतावनी: आपका 10-मिनट का पेमेंट टाइमर चालू है! बैक जाने या रिफ्रेश करने पर पेमेंट अटक सकती है।';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Push state to prevent back navigation
    window.history.pushState({ modalLocked: true }, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState({ modalLocked: true }, '', window.location.href);
      alert('⚠️ चेतावनी: 10-मिनट का पेमेंट वेरिफिकेशन टाइमर चालू है! बैक जाना प्रतिबंधित है।');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSubmittedSuccess, isApprovedByAdmin, countdownSeconds]);

  const upiId = settings?.safargo_upi_id || 'safargo.booking@icici';
  const parsedAmount = parseFloat(amount) || 0;

  // Real UPI deep link for QR code
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=SafarGo%20Admin&am=${parsedAmount > 0 ? parsedAmount : minAmount}&cu=INR&tn=Agent%20Wallet%20Recharge`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    success('UPI ID Copied!', 'पेमेंट ऐप में पेस्ट करके भुगतान करें।');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        error('File Too Large', 'कृपया 15MB से छोटी फाइल चुनें।');
        return;
      }
      try {
        const compressed = await compressImage(file, 800, 800, 0.6);
        setScreenshotPreview(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setScreenshotPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const finalAmount = parsedAmount > 0 ? parsedAmount : minAmount;
    const finalUtr = utrNumber.trim() || `UTR-${Date.now().toString().slice(-8)}`;

    if (!utrNumber.trim()) {
      setUtrNumber(finalUtr);
    }
    if (parsedAmount <= 0) {
      setAmount(finalAmount.toString());
    }

    // Immediately show the 10-minute countdown timer screen
    setCountdownSeconds(600); // 10 minutes = 600s
    setIsSubmittedSuccess(true);
    setIsSubmitting(true);

    try {
      await requestWalletRecharge(
        finalAmount,
        finalUtr,
        screenshotPreview || undefined,
        paymentMethod
      );
    } catch (err) {
      console.error('Wallet recharge submit warning:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;
    const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8 p-6 sm:p-8 text-center space-y-6">
          
          {isApprovedByAdmin ? (
            /* Admin Approved Immediately */
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-500 text-white rounded-full inline-block shadow-sm">
                  🎉 एडमिन द्वारा तुरंत स्वीकृत (Instant Approved)
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  ₹{(parsedAmount > 0 ? parsedAmount : minAmount).toLocaleString('en-IN')} आपके वॉलेट में जुड़ चुके हैं!
                </h2>
                <p className="text-xs text-slate-600">
                  वर्तमान कुल वॉलेट बैलेंस: <strong className="text-emerald-600 text-sm">₹{safeWalletBalance.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          ) : (
            /* Pending Approval with 10-Minute Countdown Timer */
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl shadow-xs space-y-1">
                  <div className="text-base sm:text-xl font-black text-orange-700 tracking-tight">
                    💥 Boom! Your amount added soon — हम वेरीफाई कर रहे हैं!
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                    आपका पेमेंट रिक्वेस्ट रिसीव हो गया है! टाइमर खत्म होने तक वेट कीजिए, पैसे वॉलेट में जमा हो जाएंगे।
                  </p>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  SafarGo एडमिन टीम आपके पेमेंट की पुष्टि कर रही है। एडमिन द्वारा अप्रूव करते ही पैसे तुरंत वॉलेट में आ जाएंगे।
                </p>
              </div>

              {/* 10-Minute Countdown Clock Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>10-मिनट टाइमर (काउंटडाउन चालू):</span>
                </div>
                <div className="text-5xl font-black font-mono tracking-widest text-amber-400">
                  {timerFormatted}
                </div>
                <p className="text-[11px] text-slate-300 pt-1">
                  समय समाप्त होने से पहले एडमिन द्वारा <strong>पैसे सीधे वॉलेट में क्रेडिट कर दिए जाएंगे</strong>।
                </p>
              </div>

              {/* ⚠️ HIGH VISIBILITY STRICT WARNING (User must not go back) */}
              <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 text-left space-y-2 shadow-sm animate-pulse">
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs sm:text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>🚨 अति आवश्यक चेतावनी: बैक जाना प्रतिबंधित है!</span>
                </div>
                <p className="text-xs text-rose-950 font-bold leading-relaxed">
                  कृपया इस स्क्रीन को बंद न करें, रिफ्रेश न करें और बैक (Back) न जाएं! जब तक 10-मिनट का टाइमर चल रहा है, SafarGo एडमिन डेस्क आपके पेमेंट UTR ({utrNumber}) का बैंक रिकॉर्ड से लाइव मिलान कर रहा है।
                </p>
                <div className="text-[11px] font-bold text-rose-800 bg-rose-100/90 rounded-xl p-2 border border-rose-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>सुरक्षा नियम: टाइमर समाप्त होने या एडमिन अप्रूवल से पहले बैक जाने का विकल्प पूरी तरह बंद (Locked) है।</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>अनुरोध राशि (Amount):</span>
              <strong className="text-slate-900 text-base font-black">₹{parsedAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>UTR / UPI Ref:</span>
              <strong className="font-mono text-slate-900 font-bold">{utrNumber}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>भुगतान विधि:</span>
              <span className="font-bold text-slate-800">SafarGo UPI QR</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
              <span>स्थिति (Status):</span>
              {isApprovedByAdmin ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  ✓ स्वीकृत व क्रेडिट (Approved)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  ⏳ 10 मिनट के अंदर सत्यापन (Under Review)
                </span>
              )}
            </div>
          </div>

          {/* Action Button: Disabled & Locked While Timer is Running */}
          {!isApprovedByAdmin && countdownSeconds > 0 ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled
                className="w-full py-4 bg-slate-200 border-2 border-slate-300 text-slate-500 font-black text-sm rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-inner"
              >
                <Lock className="w-4 h-4 text-slate-500 animate-pulse" />
                <span>🔒 टाइमर चलने तक बैक जाना लॉक है ({timerFormatted})</span>
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
                <span>एडमिन द्वारा अप्रूव होते ही तुरंत अनलॉक होगा</span>
                <button
                  type="button"
                  onClick={() => {
                    const confirmClose = window.confirm(
                      '⚠️ क्या आप सचमुच बैक जाना चाहते हैं?\n\nचेतावनी: टाइमर के बीच बैक जाने पर आपका पेमेंट स्टेटस पेंडिंग में दिख सकता है और सत्यापन में देरी हो सकती है!'
                    );
                    if (confirmClose) onClose();
                  }}
                  className="text-rose-600 underline font-bold hover:text-rose-700 cursor-pointer"
                >
                  आपातकालीन बाहर निकलें
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              {isApprovedByAdmin ? 'शानदार / डैशबोर्ड पर जाएं (Done)' : 'डैशबोर्ड पर जाएं (Done)'}
            </button>
          )}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 border border-amber-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent">Go Wallet</span>
                  <span>में पैसे जोड़ें (Add Money)</span>
                </h2>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Min ₹{minAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                वर्तमान Go Wallet बैलेंस: <strong className="text-emerald-400">₹{safeWalletBalance.toFixed(2)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Advisory Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-0.5">
            <p className="font-bold">
              💡 SafarGo Go Wallet नियम (Go Wallet Policy):
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Go Wallet में न्यूनतम <strong>₹{minAmount.toLocaleString('en-IN')}</strong> जोड़ना आवश्यक है। आप अपनी सुविधानुसार ₹2,000 या उससे अधिक कितनी भी राशि जमा कर सकते हैं। एडमिन सत्यापन (10-मिनट टाइमर) के बाद राशि तुरंत आपके Go Wallet में क्रेडिट हो जाएगी और आप सीधे टिकट बुक कर सकेंगे या सेवाओं में उपयोग कर सकेंगे!
            </p>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Amount Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              जमा करने हेतु राशि (Recharge Amount in ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`कम से कम ${minAmount}`}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-orange-500 font-black text-lg outline-none bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-bold">त्वरित चुनें:</span>
              {[2000, 3000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    parsedAmount === val
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Payment QR / UPI Details Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-orange-500" />
                <span>SafarGo आधिकारिक QR कोड / UPI</span>
              </span>
              <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Verified Merchant
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Dynamic or Custom QR Code */}
              <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
                <img
                  src={settings.safargo_qr_image_url || qrCodeApiUrl}
                  alt="SafarGo Payment QR"
                  className="w-36 h-36 rounded-lg object-contain"
                />
                <span className="text-[10px] font-bold text-slate-500 mt-1.5">
                  Scan to Pay ₹{parsedAmount > 0 ? parsedAmount.toLocaleString('en-IN') : minAmount}
                </span>
                {settings.safargo_payee_name && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {settings.safargo_payee_name}
                  </span>
                )}
              </div>

              {/* UPI & Bank Details */}
              <div className="space-y-3 w-full text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">SafarGo Official UPI ID:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-300 select-all block w-full truncate">
                      {upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-1 transition shrink-0"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick GPay, PhonePe, Paytm IDs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {settings.safargo_phonepe_number && (
                    <div className="bg-purple-50 p-2 rounded-xl border border-purple-200 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-[10px] text-purple-700 font-bold block">PhonePe</span>
                        <span className="font-mono text-purple-900 text-[11px] truncate">{settings.safargo_phonepe_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.safargo_phonepe_number || '');
                          success('PhonePe ID Copied', 'PhonePe में पेस्ट करें');
                        }}
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="Copy PhonePe"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {settings.safargo_gpay_number && (
                    <div className="bg-blue-50 p-2 rounded-xl border border-blue-200 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-[10px] text-blue-700 font-bold block">Google Pay (GPay)</span>
                        <span className="font-mono text-blue-900 text-[11px] truncate">{settings.safargo_gpay_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.safargo_gpay_number || '');
                          success('GPay ID Copied', 'GPay में पेस्ट करें');
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Copy GPay"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {settings.safargo_paytm_number && (
                    <div className="bg-sky-50 p-2 rounded-xl border border-sky-200 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-[10px] text-sky-700 font-bold block">Paytm</span>
                        <span className="font-mono text-sky-900 text-[11px] truncate">{settings.safargo_paytm_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.safargo_paytm_number || '');
                          success('Paytm ID Copied', 'Paytm में पेस्ट करें');
                        }}
                        className="p-1 text-sky-600 hover:text-sky-800"
                        title="Copy Paytm"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* UTR / Transaction No */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              12-अंकों का UTR / UPI Ref Number *
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.trim())}
              placeholder="उदा. 429381029384 या UTR-99882233"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm font-bold bg-white"
            />
            <p className="text-[11px] text-slate-400">
              पेमेंट होने के बाद अपने Google Pay / PhonePe / Paytm रसीद से UTR / UPI Reference No. यहाँ दर्ज करें।
            </p>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              भुगतान रसीद / स्क्रीनशॉट (Payment Screenshot / Receipt)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>स्क्रीनशॉट चुनें</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {screenshotPreview && (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> रसीद संलग्न!
                </span>
              )}
            </div>

            {screenshotPreview && (
              <div className="mt-2 p-2 bg-slate-100 rounded-xl border border-slate-200 max-w-xs">
                <img
                  src={screenshotPreview}
                  alt="Receipt Preview"
                  className="h-28 rounded-lg object-contain w-full"
                />
              </div>
            )}
          </div>

          {/* Security Banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>त्वरित सत्यापन:</strong> SafarGo एडमिन टीम द्वारा UTR वेरीफाई होते ही (सामान्यतः 5-10 मिनट) आपके वॉलेट में बैलेंस जोड़ दिया जाएगा।
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-orange-500/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>{isSubmitting ? 'अनुरोध भेजा जा रहा है...' : 'रिचार्ज अनुरोध सबमिट करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
