import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Wallet,
  Smartphone,
  Building2,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { SafarGoLogo } from '../common/SafarGoLogo';

interface WalletRechargeModalProps {
  onClose: () => void;
}

export const WalletRechargeModal: React.FC<WalletRechargeModalProps> = ({ onClose }) => {
  const { settings, requestWalletRecharge, agentWalletBalance } = useData();
  const { error, success } = useToast();

  const minAmount = settings.min_wallet_recharge || 2000;
  const [amount, setAmount] = useState<string>(minAmount.toString());
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'bank_transfer'>('upi_qr');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const upiId = settings.safargo_upi_id || 'safargo.booking@icici';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File Too Large', 'कृपया 5MB से छोटी फाइल चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedAmount < minAmount) {
      error(
        'न्यूनतम राशि अमान्य',
        `वॉलेट में न्यूनतम ₹${minAmount.toLocaleString('en-IN')} जोड़ना अनिवार्य है। आप ₹${minAmount} या अधिक कोई भी राशि जमा कर सकते हैं।`
      );
      return;
    }

    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      error('Invalid UTR', 'कृपया वैध 12-अंकों का बैंक UTR या UPI Transaction Ref No. दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await requestWalletRecharge(
        parsedAmount,
        utrNumber.trim(),
        screenshotPreview || undefined,
        paymentMethod
      );
      if (ok) {
        setIsSubmittedSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8 p-6 sm:p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-block">
              अनुरोध SafarGo एडमिन को भेजा गया ✓
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              आपका पैसा कुछ ही देर में आपके वॉलेट में होगा!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              एडमिन द्वारा आपका <strong>UTR ({utrNumber})</strong> एवं पेमेंट रसीद सत्यापित की जा रही है। सत्यापन संपन्न होते ही राशि आपके वॉलेट में तुरंत जोड़ दी जाएगी।
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>अनुरोध राशि (Amount):</span>
              <strong className="text-slate-900 text-base font-black">₹{parsedAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>बैंक UTR / UPI Ref:</span>
              <strong className="font-mono text-slate-900 font-bold">{utrNumber}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>भुगतान विधि:</span>
              <span className="font-bold text-slate-800">{paymentMethod === 'upi_qr' ? 'SafarGo UPI QR' : 'बैंक ट्रांसफर'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
              <span>स्थिति:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                ⏳ सत्यापन प्रक्रियाधीन (Under Review)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            समझ गया / डैशबोर्ड पर जाएं (Done)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">
                  एजेंट वॉलेट में पैसे जोड़ें (Add Money)
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Min ₹{minAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                वर्तमान वॉलेट बैलेंस: <strong className="text-emerald-400">₹{agentWalletBalance.toFixed(2)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Advisory Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-0.5">
            <p className="font-bold">
              💡 SafarGo प्रीपेड वॉलेट नियम (Prepaid Wallet Policy):
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              एजेंट को वॉलेट में न्यूनतम <strong>₹{minAmount.toLocaleString('en-IN')}</strong> जोड़ना आवश्यक है। आप अपनी सुविधानुसार ₹2,000 या उससे अधिक कितनी भी राशि जमा कर सकते हैं। एडमिन सत्यापन के बाद राशि तुरंत आपके वॉलेट में क्रेडिट हो जाएगी और आप सीधे टिकट बुक कर सकेंगे!
            </p>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Amount Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              जमा करने हेतु राशि (Recharge Amount in ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                min={minAmount}
                step="100"
                required
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

                {/* Bank Transfer Details */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">बैंक ट्रांसफर विवरण (Official Bank Transfer / NEFT / IMPS):</div>
                  <div>खाताधारक: <strong>{settings.safargo_bank_holder_name || 'SafarGo Travel Services'}</strong></div>
                  <div>
                    A/C: <span className="font-mono font-bold text-slate-900">{settings.safargo_bank_account_no || '50200088991122'}</span> • IFSC: <span className="font-mono font-bold text-slate-900">{settings.safargo_bank_ifsc || 'ICIC0001234'}</span>
                  </div>
                  {settings.safargo_bank_name && (
                    <div className="text-[10px] text-slate-500">बैंक: {settings.safargo_bank_name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* UTR / Transaction No */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              12-अंकों का बैंक UTR / UPI Ref Number *
            </label>
            <input
              type="text"
              required
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
              disabled={isSubmitting || parsedAmount < minAmount}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-orange-500/30 transition flex items-center gap-2 active:scale-95"
            >
              <span>{isSubmitting ? 'अनुरोध भेजा जा रहा है...' : 'रिचार्ज अनुरोध सबमिट करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
