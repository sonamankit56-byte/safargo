import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PromotionPlatform, PromotionContentType } from '../../types';
import {
  X,
  Instagram,
  Youtube,
  Sparkles,
  Upload,
  Clock,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Gift,
  Wallet,
  CreditCard,
  MessageSquare
} from 'lucide-react';

interface PromotionClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: PromotionPlatform;
}

export const PromotionClaimModal: React.FC<PromotionClaimModalProps> = ({
  isOpen,
  onClose,
  defaultPlatform = 'instagram',
}) => {
  const { currentUser } = useAuth();
  const { settings, submitPromotionClaim } = useData();
  const { error } = useToast();

  const [platform, setPlatform] = useState<PromotionPlatform>(defaultPlatform);
  const [contentType, setContentType] = useState<PromotionContentType>(
    defaultPlatform === 'instagram' ? 'reel' : 'video'
  );
  const [userName, setUserName] = useState(currentUser?.full_name || '');
  const [userMobile, setUserMobile] = useState(currentUser?.mobile || '');
  const [handle, setHandle] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [viewsCount, setViewsCount] = useState<number | ''>('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'wallet' | 'upi' | 'bank'>(
    currentUser?.role === 'agent' ? 'wallet' : 'upi'
  );
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isInsta = platform === 'instagram';
  const targetViews = isInsta
    ? (settings.promo_instagram_target_views || 1000000)
    : (settings.promo_youtube_target_views || 10000);
  const rewardAmount = isInsta
    ? (settings.promo_instagram_reward || 500)
    : (settings.promo_youtube_reward || 100);

  const handlePlatformChange = (p: PromotionPlatform) => {
    setPlatform(p);
    setContentType(p === 'instagram' ? 'reel' : 'video');
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'स्क्रीनशॉट 5MB से कम होना चाहिए।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      error('नाम आवश्यक है', 'कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (!userMobile.trim() || userMobile.trim().length < 10) {
      error('मोबाइल नंबर अमान्य', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!postUrl.trim()) {
      error('URL आवश्यक है', 'कृपया Reel या Video का लिंक दर्ज करें।');
      return;
    }
    if (!viewsCount || Number(viewsCount) <= 0) {
      error('व्यूज आवश्यक हैं', 'कृपया प्राप्त किए गए व्यूज की संख्या दर्ज करें।');
      return;
    }

    if (payoutMethod === 'upi' && !upiId.trim()) {
      error('UPI ID आवश्यक है', 'कृपया अपनी UPI ID (PhonePe/GPay/Paytm) दर्ज करें।');
      return;
    }

    if (payoutMethod === 'bank' && !bankDetails.trim()) {
      error('बैंक विवरण आवश्यक है', 'कृपया अपना बैंक अकाउंट नंबर और IFSC कोड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await submitPromotionClaim({
        user_name: userName.trim(),
        user_mobile: userMobile.trim(),
        platform,
        content_type: contentType,
        post_url: postUrl.trim(),
        channel_or_handle: handle.trim() || (isInsta ? '@creator' : 'My Channel'),
        views_count: Number(viewsCount),
        screenshot_url: screenshotUrl,
        payout_method: payoutMethod,
        upi_id: upiId.trim(),
        bank_details: bankDetails.trim(),
      });

      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `नमस्ते SafarGo Admin टीम,\n\nमैंने SafarGo के प्रमोशन के लिए ${isInsta ? 'Instagram Reel' : 'YouTube Video'} पोस्ट किया है और टारगेट व्यूज पूरे कर लिए हैं!\n\n` +
    `• नाम: ${userName || 'क्रिएटर'}\n` +
    `• मोबाइल: ${userMobile || 'नंबर'}\n` +
    `• प्लेटफॉर्म: ${isInsta ? 'Instagram Reel (1M Views Target)' : 'YouTube Video (10K Views Target)'}\n` +
    `• चैनल / हैंडल: ${handle || 'N/A'}\n` +
    `• वीडियो लिंक: ${postUrl || 'N/A'}\n` +
    `• व्यूज: ${viewsCount ? Number(viewsCount).toLocaleString('en-IN') : '0'}\n` +
    `• क्लेम बोनस: ₹${rewardAmount}\n\n` +
    `कृपया 24 घंटे में इसे वेरीफाई करके बोनस क्रेडिट करें। धन्यवाद!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className={`p-6 text-white relative ${
          isInsta
            ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              SafarGo वायरल क्रिएटर ऑफर
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-900 text-xs font-black flex items-center gap-1">
              <Clock className="w-3 h-3" />
              24-घंटे में पेमेंट गारंटी
            </span>
          </div>

          <h2 className="text-2xl font-black">
            {isInsta ? '📸 Instagram Reels वायरल रिवॉर्ड' : '▶️ YouTube वीडियो वायरल रिवॉर्ड'}
          </h2>
          <p className="text-sm text-white/90 mt-1">
            {isInsta
              ? `Reels पर ${targetViews.toLocaleString('en-IN')} व्यूज लाएं और पाएं ₹${rewardAmount} सीधा नकद बोनस!`
              : `YouTube पर ${targetViews.toLocaleString('en-IN')} व्यूज लाएं और पाएं ₹${rewardAmount} सीधा नकद बोनस!`}
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Platform Selector Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              प्रमोशन प्लेटफॉर्म चुनें (Select Platform)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePlatformChange('instagram')}
                className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2.5 transition ${
                  isInsta
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Instagram className={`w-5 h-5 ${isInsta ? 'text-pink-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <span className="block text-xs leading-none text-slate-500 font-medium">Instagram Reel</span>
                  <span className="text-sm font-black text-pink-700">1M Views = ₹500</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('youtube')}
                className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2.5 transition ${
                  !isInsta
                    ? 'border-red-600 bg-red-50 text-red-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Youtube className={`w-5 h-5 ${!isInsta ? 'text-red-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <span className="block text-xs leading-none text-slate-500 font-medium">YouTube Video</span>
                  <span className="text-sm font-black text-red-700">10K Views = ₹100</span>
                </div>
              </button>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              ऑफर के मुख्य नियम व शर्तें (Offer Terms & SLA)
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                <strong>100% Genuine & Unique Views:</strong> व्यूज वास्तविक होने चाहिए। फेक या बॉट व्यूज को सिस्टम रिजेक्ट कर देगा।
              </li>
              <li>
                <strong>SafarGo ब्रांडिंग:</strong> वीडियो/रील में सफ़ारगो बस बुकिंग ऐप या सेवा का ज़िक्र/लोगो होना आवश्यक है।
              </li>
              <li>
                <strong>24-घंटे में भुगतान (24h SLA):</strong> सबमिट करने के 24 घंटे में हमारी टीम लिंक वेरीफाई करके सीधे वॉलेट या UPI पर ₹{rewardAmount} ट्रांसफर करेगी।
              </li>
            </ul>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आपका नाम (Creator / Agent Name) *
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="उदा. राहुल कुमार"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मोबाइल नंबर (Mobile Number) *
              </label>
              <input
                type="tel"
                value={userMobile}
                onChange={(e) => setUserMobile(e.target.value)}
                placeholder="10 अंकों का मोबाइल नंबर"
                required
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isInsta ? 'Instagram हैंडल / यूज़रनेम' : 'YouTube चैनल का नाम'} *
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={isInsta ? '@your_instagram_handle' : 'Channel Name'}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                प्राप्त किए गए व्यूज (Total Views Achieved) *
              </label>
              <input
                type="number"
                value={viewsCount}
                onChange={(e) => setViewsCount(e.target.value ? Number(e.target.value) : '')}
                placeholder={`कम से कम ${targetViews.toLocaleString('en-IN')}`}
                required
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
              {viewsCount && Number(viewsCount) < targetViews && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  टारगेट {targetViews.toLocaleString('en-IN')} है (अभी कम है)
                </p>
              )}
            </div>
          </div>

          {/* Post URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isInsta ? 'Instagram Reel का लिंक (URL)' : 'YouTube Video / Shorts का लिंक (URL)'} *
            </label>
            <input
              type="url"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder={
                isInsta
                  ? 'https://www.instagram.com/reel/C...'
                  : 'https://youtube.com/watch?v=... या /shorts/...'
              }
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium"
            />
          </div>

          {/* Screenshot Upload Proof */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              एनालिटिक्स / व्यूज का स्क्रीनशॉट (Screenshot Proof) - अनुशंसित
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>स्क्रीनशॉट फ़ाइल चुनें</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>

              {screenshotUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={screenshotUrl}
                    alt="Proof Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-300 shadow-xs"
                  />
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    अपलोड हो गया
                  </span>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl('')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    हटाएं
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payout Receiving Method */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              बोनस राशि (₹{rewardAmount}) प्राप्त करने का माध्यम चुनें
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentUser?.role === 'agent' && (
                <button
                  type="button"
                  onClick={() => setPayoutMethod('wallet')}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition ${
                    payoutMethod === 'wallet'
                      ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-orange-500" />
                  <span>SafarGo वॉलेट (तुरंत)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition ${
                  payoutMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>UPI ID (GPay/PhonePe)</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition ${
                  payoutMethod === 'bank'
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>बैंक ट्रांसफर (A/C)</span>
              </button>
            </div>

            {payoutMethod === 'upi' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  आपकी UPI ID दर्ज करें *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="उदा. 9876543210@paytm या name@okhdfcbank"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                />
              </div>
            )}

            {payoutMethod === 'bank' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  बैंक अकाउंट नंबर + IFSC कोड *
                </label>
                <input
                  type="text"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  placeholder="A/C No: 50200..., IFSC: HDFC0001234, Name: ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                />
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={`https://wa.me/${settings.support_whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp पर भी भेजें</span>
            </a>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs transition"
              >
                रद्द करें (Cancel)
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-1/2 sm:w-auto px-6 py-3 rounded-xl text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                  isInsta
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                }`}
              >
                {isSubmitting ? (
                  <span>सबमिट हो रहा है...</span>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>₹{rewardAmount} क्लेम सबमिट करें (24h SLA)</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
