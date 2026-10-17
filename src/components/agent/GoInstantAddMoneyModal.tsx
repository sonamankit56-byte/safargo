import React, { useState } from 'react';
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
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { compressImage } from '../../lib/storageUtils';

interface GoInstantAddMoneyModalProps {
  onClose: () => void;
}

export const GoInstantAddMoneyModal: React.FC<GoInstantAddMoneyModalProps> = ({ onClose }) => {
  const { settings, goInstantAddMoney, agentWalletBalance } = useData();
  const { error, success } = useToast();

  const [amount, setAmount] = useState<string>('500');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [creditedAmount, setCreditedAmount] = useState(0);

  const upiId = settings?.safargo_upi_id || 'safargo.booking@icici';
  const parsedAmount = parseFloat(amount) || 0;

  // Real UPI deep link for QR code
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=SafarGo%20Admin&am=${parsedAmount > 0 ? parsedAmount : 500}&cu=INR&tn=GO%20Instant%20Add%20Money`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    success('UPI ID कॉपी हुआ!', 'अपने UPI ऐप (PhonePe / GPay / Paytm) में पेस्ट करके भुगतान करें।');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        error('फाइल बहुत बड़ी है', 'कृपया 15MB से छोटी फाइल चुनें।');
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

  const handleInstantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanAmount = parseFloat(amount);
    if (!cleanAmount || cleanAmount < 100) {
      error('अमान्य राशि', 'कृपया कम से कम ₹100 की राशि दर्ज करें।');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      error('अमान्य UTR', 'कृपया बैंक/UPI ऐप का सही 8-12 अंकों का UTR / UPI Ref No दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await goInstantAddMoney({
        amount: cleanAmount,
        utr: cleanUtr,
        screenshotUrl: screenshotPreview || undefined,
        paymentMethod: 'upi_qr',
      });

      if (res.success) {
        setCreditedAmount(cleanAmount);
        setIsSuccess(true);
      }
    } catch (err: any) {
      error('रीचार्ज त्रुटि', err?.message || 'सिस्टम में त्रुटि हुई। पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [timerSeconds, setTimerSeconds] = useState(180);

  // Active countdown timer when request is submitted
  React.useEffect(() => {
    let interval: any = null;
    if (isSuccess && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSuccess, timerSeconds]);

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const formattedCountdown = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#05184B]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full text-slate-900 shadow-2xl overflow-hidden my-4">
        
        {/* Header - Jio Royal Blue */}
        <div className="p-4 sm:p-5 bg-[#0A2885] border-b border-[#05184B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 text-amber-300 border border-white/20 flex items-center justify-center font-black shadow-xs">
              <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  GO 3-Minute Auto Add Money
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FF6500] text-white">
                  3-Min Timer
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                स्वचालित AI व बैंकिंग सत्यापन — 3 मिनट में स्वतः वॉलेट में जमा!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#0A2885]/20 animate-ping" />
              <div className="w-24 h-24 rounded-full bg-[#0A2885]/5 border-4 border-[#0A2885] flex flex-col items-center justify-center shadow-inner">
                <span className="font-mono text-2xl font-black text-[#0A2885] tracking-wider">
                  {formattedCountdown}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  सत्यापन टाइमर
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-widest text-[#FF6500] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                ⏳ 3-मिनट बैंकिंग सत्यापन टाइमर चालू!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                +₹{creditedAmount.toLocaleString('en-IN')}
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                आपका अनुरोध दर्ज हो चुका है (UTR: <span className="font-mono font-bold text-[#0A2885]">{utrNumber}</span>)।
                जैसे ही 3 मिनट पूरे होंगे या एडमिन स्वीकृति देंगे, यह राशि स्वतः आपके Go Wallet में क्रेडिट हो जाएगी!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F7FB] border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-500">वर्तमान वॉलेट बैलेंस:</span>
                <strong className="text-[#0A2885] text-sm font-black">
                  ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}.00
                </strong>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>आप इस लाइव टाइमर को अपने <strong>Go अकाउंट ➔ 'हिस्ट्री'</strong> टैब में भी कभी भी देख सकते हैं।</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#0A2885] hover:bg-[#071E66] text-white font-bold rounded-full text-sm transition shadow-md cursor-pointer"
            >
              समझ गया / विंडो बंद करें ➔
            </button>
          </div>
        ) : (
          <form onSubmit={handleInstantSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            
            {/* Quick Amount Pills */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 text-[11px]">
                रिचार्ज राशि चुनें (Select Amount) *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['200', '500', '1000', '2000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-full font-bold text-xs transition border cursor-pointer ${
                      amount === val
                        ? 'bg-[#0A2885] text-white border-[#0A2885] shadow-xs'
                        : 'bg-[#F5F7FB] text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={100}
                  step={50}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="कस्टम राशि (उदा. 1500)"
                  className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-[#F5F7FB] border border-slate-200 text-slate-900 font-mono font-bold text-sm outline-none focus:border-[#0A2885] focus:bg-white"
                />
              </div>
            </div>

            {/* QR Code & UPI Deep Link */}
            <div className="p-4 rounded-3xl bg-[#F5F7FB] border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 bg-white p-2 rounded-2xl shrink-0 border border-slate-200 flex items-center justify-center shadow-xs">
                <img
                  src={qrCodeApiUrl}
                  alt="SafarGo QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-[#0A2885]">
                    SafarGo अधिकृत QR कोड
                  </span>
                  <p className="text-[11px] text-slate-600">
                    PhonePe / GPay / Paytm से स्कैन करें और <strong>₹{parsedAmount || 500}</strong> का भुगतान करें।
                  </p>
                </div>

                <div className="p-2 rounded-full bg-white border border-slate-200 flex items-center justify-between gap-2 px-3">
                  <span className="font-mono text-[11px] text-slate-700 truncate">
                    {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0A2885] shrink-0"
                    title="कॉपी करें"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* UTR Input with Advance Validation */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 text-[11px]">
                12-अंकों का UPI Ref / UTR नंबर दर्ज करें *
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                placeholder="उदा. 428901234567"
                className="w-full p-3 rounded-2xl bg-[#F5F7FB] border border-slate-200 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider outline-none focus:border-[#0A2885] focus:bg-white"
              />
              <p className="text-[10px] text-slate-500">
                पेमेंट ऐप की रसीद में <strong>UPI Ref No. / UTR No.</strong> लिखा होता है।
              </p>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 text-[11px]">
                पेमेंट स्क्रीनशॉट (वैकल्पिक परंतु सुरक्षित)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 p-2.5 rounded-2xl bg-[#F5F7FB] border border-dashed border-slate-300 hover:border-[#0A2885] text-slate-600 cursor-pointer flex items-center justify-center gap-2 transition">
                  <Upload className="w-4 h-4 text-[#0A2885]" />
                  <span className="text-[11px] font-medium">
                    {screenshotPreview ? 'स्क्रीनशॉट बदलें' : 'स्क्रीनशॉट अपलोड करें'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {screenshotPreview && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#0A2885] shrink-0">
                    <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Anti-Fraud Security Shield Note */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[10px] text-amber-900 leading-snug">
              <ShieldAlert className="w-4 h-4 text-[#FF6500] shrink-0 mt-0.5" />
              <span>
                <strong>सुरक्षा प्रणाली:</strong> सिस्टम में डुप्लीकेट UTR व फर्जी स्क्रीनशॉट स्वतः ब्लॉक होते हैं। गलत UTR पाए जाने पर एडमिन द्वारा राशि वापस काटी जा सकती है।
              </span>
            </div>

            {/* Submit Button - Electric Amber Pill */}
            <button
              type="submit"
              disabled={isSubmitting || !utrNumber.trim()}
              className="w-full py-3.5 bg-[#FF6500] hover:bg-[#E05900] text-white font-bold text-sm rounded-full shadow-md transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI सुरक्षा सत्यापन जारी...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>तुरंत वॉलेट में पैसे जोड़ें (₹{parsedAmount || 500})</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

