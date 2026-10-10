import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CustomFeature, FeatureIconName, AdminAnnouncement } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Settings,
  Save,
  RefreshCw,
  MessageSquare,
  Target,
  DollarSign,
  Gift,
  Megaphone,
  Sparkles,
  Zap,
  Package,
  Train,
  Building,
  Printer,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Eye,
  Sliders,
  Check,
  X,
  Database,
  Server,
  Copy,
  QrCode,
  Building2,
  Smartphone,
  Upload,
  CreditCard,
  Image as ImageIcon,
  Instagram,
  Youtube,
  Clock
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateAnnouncement,
    addCustomFeature,
    updateCustomFeature,
    deleteCustomFeature,
    toggleCustomFeature,
  } = useData();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'payment' | 'viral_promo' | 'core' | 'announcement' | 'features' | 'database'>('payment');

  // VIRAL CREATOR PROMOTION SETTINGS STATE
  const [promoInstaActive, setPromoInstaActive] = useState<boolean>(settings.promo_instagram_active ?? true);
  const [promoInstaViews, setPromoInstaViews] = useState<number>(settings.promo_instagram_target_views || 1000000);
  const [promoInstaReward, setPromoInstaReward] = useState<number>(settings.promo_instagram_reward || 500);
  const [promoYtActive, setPromoYtActive] = useState<boolean>(settings.promo_youtube_active ?? true);
  const [promoYtViews, setPromoYtViews] = useState<number>(settings.promo_youtube_target_views || 10000);
  const [promoYtReward, setPromoYtReward] = useState<number>(settings.promo_youtube_reward || 100);
  const [promoSlaHours, setPromoSlaHours] = useState<number>(settings.promo_sla_hours || 24);
  const [isSavingPromo, setIsSavingPromo] = useState<boolean>(false);

  // PAYMENT & QR CODE GATEWAY STATES
  const [payUpiId, setPayUpiId] = useState<string>(settings.safargo_upi_id || 'safargo.booking@icici');
  const [payPayeeName, setPayPayeeName] = useState<string>(settings.safargo_payee_name || 'SafarGo Official');
  const [payPhonePe, setPayPhonePe] = useState<string>(settings.safargo_phonepe_number || '9876543210@ybl');
  const [payGPay, setPayGPay] = useState<string>(settings.safargo_gpay_number || '9876543210@okaxis');
  const [payPaytm, setPayPaytm] = useState<string>(settings.safargo_paytm_number || '9876543210@paytm');
  const [payQrImageUrl, setPayQrImageUrl] = useState<string>(settings.safargo_qr_image_url || '');
  const [payBankHolder, setPayBankHolder] = useState<string>(settings.safargo_bank_holder_name || 'SafarGo Travel Services');
  const [payBankAcc, setPayBankAcc] = useState<string>(settings.safargo_bank_account_no || '50200088991122');
  const [payBankIfsc, setPayBankIfsc] = useState<string>(settings.safargo_bank_ifsc || 'ICIC0001234');
  const [payBankName, setPayBankName] = useState<string>(settings.safargo_bank_name || 'ICICI Bank');
  const [payMinRecharge, setPayMinRecharge] = useState<number>(settings.min_wallet_recharge || 2000);
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPromo(true);
    try {
      await updateSettings({
        promo_instagram_active: promoInstaActive,
        promo_instagram_target_views: promoInstaViews,
        promo_instagram_reward: promoInstaReward,
        promo_youtube_active: promoYtActive,
        promo_youtube_target_views: promoYtViews,
        promo_youtube_reward: promoYtReward,
        promo_sla_hours: promoSlaHours,
      });
      success('प्रमोशन सेटिंग्स सुरक्षित!', 'Instagram व YouTube क्रिएटर रिवॉर्ड्स और 24-Hour SLA सेटिंग्स अपडेट हो गईं।');
    } finally {
      setIsSavingPromo(false);
    }
  };

  // CORE SETTINGS STATE
  const [commRate, setCommRate] = useState<number>(settings.commission_rate);
  const [target, setTarget] = useState<number>(settings.monthly_target);
  const [salary, setSalary] = useState<number>(settings.monthly_salary);
  const [referralBonus, setReferralBonus] = useState<number>(settings.referral_bonus || 50);
  const [referralReqBookings, setReferralReqBookings] = useState<number>(
    settings.referral_required_bookings || 5
  );
  const [whatsapp, setWhatsapp] = useState<string>(settings.support_whatsapp);
  const [policy, setPolicy] = useState<'reverse_commission' | 'keep_commission'>(
    settings.cancellation_reversal_policy
  );
  const [isSavingCore, setIsSavingCore] = useState(false);

  // ANNOUNCEMENT STATE
  const [annActive, setAnnActive] = useState<boolean>(settings.announcement?.is_active ?? true);
  const [annTitle, setAnnTitle] = useState<string>(settings.announcement?.title ?? '');
  const [annMessage, setAnnMessage] = useState<string>(settings.announcement?.message ?? '');
  const [annType, setAnnType] = useState<AdminAnnouncement['type']>(
    settings.announcement?.type ?? 'urgent'
  );
  const [annTarget, setAnnTarget] = useState<AdminAnnouncement['target']>(
    settings.announcement?.target ?? 'all'
  );
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  // FEATURE TOGGLES STATE
  const [featRefer, setFeatRefer] = useState<boolean>(settings.feature_refer_earn ?? true);
  const [featTatkal, setFeatTatkal] = useState<boolean>(settings.feature_tatkal_service ?? true);
  const [featParcel, setFeatParcel] = useState<boolean>(settings.feature_parcel_service ?? true);
  const [featTrain, setFeatTrain] = useState<boolean>(settings.feature_train_enquiry ?? false);
  const [featHotel, setFeatHotel] = useState<boolean>(settings.feature_hotel_service ?? false);
  const [featPrint, setFeatPrint] = useState<boolean>(settings.feature_print_service ?? false);
  const [isSavingToggles, setIsSavingToggles] = useState(false);

  // CUSTOM FEATURE BUILDER MODAL STATE
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [featFormTitle, setFeatFormTitle] = useState('');
  const [featFormDesc, setFeatFormDesc] = useState('');
  const [featFormBadge, setFeatFormBadge] = useState('नई सेवा');
  const [featFormIcon, setFeatFormIcon] = useState<FeatureIconName>('Zap');
  const [featFormActionType, setFeatFormActionType] = useState<'whatsapp' | 'external_url' | 'notice_modal'>('whatsapp');
  const [featFormActionValue, setFeatFormActionValue] = useState('');
  const [featFormActive, setFeatFormActive] = useState(true);

  // HANDLE CORE SETTINGS SAVE
  const handleSaveCore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commRate <= 0 || target <= 0 || salary <= 0 || referralBonus <= 0 || referralReqBookings <= 0) {
      error('Validation Error', 'Rates, target, salary, and referral amounts must be greater than zero.');
      return;
    }

    setIsSavingCore(true);
    try {
      await updateSettings({
        commission_rate: commRate,
        monthly_target: target,
        monthly_salary: salary,
        referral_bonus: referralBonus,
        referral_required_bookings: referralReqBookings,
        support_whatsapp: whatsapp.trim(),
        cancellation_reversal_policy: policy,
      });
    } finally {
      setIsSavingCore(false);
    }
  };

  // HANDLE QR IMAGE UPLOAD
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File Too Large', 'कृपया 5MB से छोटी QR इमेज चुनें।');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPayQrImageUrl(reader.result as string);
        success('QR Image Loaded', 'नया QR कोड लोड हो गया है। नीचे सेव बटन दबाएं।');
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLE PAYMENT SETTINGS SAVE
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payUpiId.trim()) {
      error('UPI ID Required', 'कृपया मान्य SafarGo UPI ID दर्ज करें।');
      return;
    }
    setIsSavingPayment(true);
    try {
      await updateSettings({
        safargo_upi_id: payUpiId.trim(),
        safargo_payee_name: payPayeeName.trim(),
        safargo_phonepe_number: payPhonePe.trim(),
        safargo_gpay_number: payGPay.trim(),
        safargo_paytm_number: payPaytm.trim(),
        safargo_qr_image_url: payQrImageUrl,
        safargo_bank_holder_name: payBankHolder.trim(),
        safargo_bank_account_no: payBankAcc.trim(),
        safargo_bank_ifsc: payBankIfsc.trim().toUpperCase(),
        safargo_bank_name: payBankName.trim(),
        min_wallet_recharge: Math.max(2000, Number(payMinRecharge) || 2000),
      });
      success('पेमेंट सेटिंग्स सुरक्षित!', 'QR कोड, GPay, PhonePe एवं बैंक विवरण सभी एजेंटों के लिए लाइव अपडेट हो गए हैं।');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // HANDLE ANNOUNCEMENT SAVE
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      error('रिक्त फ़ील्ड (Empty Fields)', 'कृपया घोषणा का शीर्षक और संदेश दोनों दर्ज करें।');
      return;
    }

    setIsSavingAnn(true);
    try {
      await updateAnnouncement({
        is_active: annActive,
        title: annTitle.trim(),
        message: annMessage.trim(),
        type: annType,
        target: annTarget,
      });
    } finally {
      setIsSavingAnn(false);
    }
  };

  // QUICK PRESET TEMPLATES FOR ANNOUNCEMENT
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'whatsapp_reminder':
        setAnnActive(true);
        setAnnType('urgent');
        setAnnTitle('⚠️ अति महत्वपूर्ण सूचना: 15 मिनट एक्टिविटी नियम');
        setAnnMessage(
          'बुकिंग सबमिट करने के बाद 15 मिनट तक WhatsApp अवश्य खुला रखें! सफ़ारगो हेल्पडेस्क WhatsApp पर ही सीट व बस विवरण वेरीफाई करेगी।'
        );
        break;
      case 'festival_offer':
        setAnnActive(true);
        setAnnType('success');
        setAnnTitle('🎉 त्यौहार स्पेशल बस सेवा 24x7 एक्टिव!');
        setAnnMessage(
          'दीपावली एवं छठ पूजा के सभी रूटों पर अतिरिक्त सीटें उपलब्ध हैं। अपने गाँव के यात्रियों की बुकिंग तुरंत दर्ज करें।'
        );
        break;
      case 'referral_boost':
        setAnnActive(true);
        setAnnType('info');
        setAnnTitle(`💰 रेफर करें और कमाएं ₹${settings.referral_bonus || 50} कैश बोनस!`);
        setAnnMessage(
          `नए CSC एजेंटों को अपने रेफरल कोड से जोड़ें। 5 बुकिंग होते ही ₹${settings.referral_bonus || 50} आपके कमीशन खाते में सीधे क्रेडिट होंगे।`
        );
        break;
      case 'maintenance':
        setAnnActive(true);
        setAnnType('warning');
        setAnnTitle('🔧 सिस्टम शेड्यूल्ड मेंटेनेंस सूचना');
        setAnnMessage(
          'आज रात 02:00 AM से 03:00 AM तक सर्वर अपग्रेड होगा। बाकी समय बस बुकिंग सामान्य रूप से चालू रहेगी।'
        );
        break;
    }
    info('टेम्पलेट लागू', 'प्री-सेट घोषणा लोड हो गई है। सेव बटन दबाकर लाइव करें।');
  };

  // HANDLE FEATURE TOGGLES SAVE
  const handleSaveFeatureToggles = async () => {
    setIsSavingToggles(true);
    try {
      await updateSettings({
        feature_refer_earn: featRefer,
        feature_tatkal_service: featTatkal,
        feature_parcel_service: featParcel,
        feature_train_enquiry: featTrain,
        feature_hotel_service: featHotel,
        feature_print_service: featPrint,
      });
      success('मॉड्यूल्स अपडेटेड', 'प्लेटफ़ॉर्म सुविधाओं के टॉगल सुरक्षित कर दिए गए हैं।');
    } finally {
      setIsSavingToggles(false);
    }
  };

  // OPEN MODAL FOR NEW FEATURE
  const handleOpenAddFeature = () => {
    setEditingFeatureId(null);
    setFeatFormTitle('');
    setFeatFormDesc('');
    setFeatFormBadge('नई सेवा');
    setFeatFormIcon('Zap');
    setFeatFormActionType('whatsapp');
    setFeatFormActionValue('नमस्ते सफ़ारगो हेल्पडेस्क, मुझे इस नई सेवा के लिए सहायता चाहिए: ');
    setFeatFormActive(true);
    setIsFeatureModalOpen(true);
  };

  // OPEN MODAL FOR EDIT FEATURE
  const handleOpenEditFeature = (f: CustomFeature) => {
    setEditingFeatureId(f.id);
    setFeatFormTitle(f.title);
    setFeatFormDesc(f.description);
    setFeatFormBadge(f.badge || '');
    setFeatFormIcon(f.icon_name);
    setFeatFormActionType(f.action_type);
    setFeatFormActionValue(f.action_value);
    setFeatFormActive(f.is_active);
    setIsFeatureModalOpen(true);
  };

  // SAVE CUSTOM FEATURE
  const handleSaveCustomFeatureForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featFormTitle.trim() || !featFormDesc.trim()) {
      error('Validation Error', 'कृपया सेवा का नाम और विवरण दर्ज करें।');
      return;
    }

    if (editingFeatureId) {
      await updateCustomFeature(editingFeatureId, {
        title: featFormTitle.trim(),
        description: featFormDesc.trim(),
        badge: featFormBadge.trim() || undefined,
        icon_name: featFormIcon,
        action_type: featFormActionType,
        action_value: featFormActionValue.trim(),
        is_active: featFormActive,
      });
    } else {
      await addCustomFeature({
        title: featFormTitle.trim(),
        description: featFormDesc.trim(),
        badge: featFormBadge.trim() || undefined,
        icon_name: featFormIcon,
        action_type: featFormActionType,
        action_value: featFormActionValue.trim(),
        is_active: featFormActive,
      });
    }
    setIsFeatureModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-orange-500" />
            प्लेटफ़ॉर्म सेटिंग्स एवं कंट्रोल सेंटर
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            घोषणा (Announcements), नई फंक्शनैलिटी व सेवाएँ, कमीशन दर एवं हेल्पलाइन नंबर प्रबंधित करें
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'announcement'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            घोषणा (Announcements)
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            नई फंक्शनैलिटी (Features)
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'payment'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-orange-600" />
            QR व पेमेंट गेटवे (QR / UPI Setup)
          </button>

          <button
            onClick={() => setActiveTab('viral_promo')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'viral_promo'
                ? 'bg-white text-purple-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            वायरल क्रिएटर प्रमोशन (Viral Promo)
          </button>

          <button
            onClick={() => setActiveTab('core')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'core'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            कमीशन व दर नीतियां
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured ? '🟢 लाइव DB' : 'डेटाबेस (Database)'}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB: PAYMENT GATEWAY & QR CODE (QR, GPay, PhonePe, Bank) */}
      {/* ======================================================== */}
      {activeTab === 'payment' && (
        <form onSubmit={handleSavePayment} className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    SafarGo आधिकारिक QR कोड एवं ऑनलाइन पेमेंट गेटवे
                  </h2>
                  <p className="text-xs text-slate-500">
                    यहाँ आप अपना असली QR कोड, PhonePe, Google Pay, Paytm UPI ID और बैंक खाता सेट कर सकते हैं। यह विवरण बुकिंग फॉर्म और वॉलेट रिचार्ज पर एजेंटों को लाइव दिखेगा।
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPayment}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-600/20 transition active:scale-95 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPayment ? 'सेव हो रहा है...' : 'सेटिंग्स सुरक्षित करें'}</span>
              </button>
            </div>

            {/* Grid 1: QR Code Image Upload & Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                    1. SafarGo आधिकारिक QR कोड (Custom QR Upload)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  यदि आपके पास PhonePe, Google Pay, Paytm या बैंक का आधिकारिक QR कोड फोटो है, तो उसे यहाँ अपलोड करें। एजेंट और ग्राहक को सीधे आपकी दुकान/कंपनी का असली QR कोड दिखाई देगा।
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition">
                    <Upload className="w-4 h-4" />
                    <span>नया QR कोड अपलोड करें</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                  </label>

                  {payQrImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPayQrImageUrl('');
                        info('QR हटाया गया', 'अब UPI ID से ऑटोमैटिक डायनामिक QR कोड बनेगा।');
                      }}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition"
                    >
                      हटाएं (Remove)
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  {payQrImageUrl
                    ? '✓ कस्टम QR कोड सक्रिय है।'
                    : 'ℹ️ यदि इमेज अपलोड नहीं करेंगे, तो नीचे दिए गए UPI ID से ऑटोमैटिक डायनामिक QR कोड बन जाएगा।'}
                </p>
              </div>

              {/* QR Code Preview Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-xs">
                {payQrImageUrl ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={payQrImageUrl}
                      alt="Uploaded QR Code"
                      className="w-40 h-40 object-contain rounded-xl border border-slate-200 shadow-sm"
                    />
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ लाइव कस्टम QR कोड
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${encodeURIComponent(payUpiId || 'safargo.booking@icici')}&pn=${encodeURIComponent(payPayeeName || 'SafarGo')}&cu=INR`
                      )}`}
                      alt="Dynamic UPI QR"
                      className="w-36 h-36 object-contain rounded-xl border border-slate-200 shadow-sm"
                    />
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      ⚡ ऑटोमैटिक डायनामिक QR (UPI आधारित)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2: UPI Apps Configuration (GPay, PhonePe, Paytm, Official UPI ID) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-600" />
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                  2. UPI ID एवं ऐप्स विवरण (GPay, PhonePe, Paytm, Official VPA)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SafarGo मुख्य UPI ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payUpiId}
                    onChange={(e) => setPayUpiId(e.target.value)}
                    placeholder="safargo.booking@icici"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">मुख्य VPA जिस पर QR आधारित है</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    व्यापारिक नाम (Merchant / Payee Name)
                  </label>
                  <input
                    type="text"
                    value={payPayeeName}
                    onChange={(e) => setPayPayeeName(e.target.value)}
                    placeholder="SafarGo Travel Services"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">बैंक या UPI ऐप पर दिखने वाला नाम</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PhonePe UPI ID / नंबर
                  </label>
                  <input
                    type="text"
                    value={payPhonePe}
                    onChange={(e) => setPayPhonePe(e.target.value)}
                    placeholder="9876543210@ybl या 9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">एजेंट को PhonePe से पेमेंट के लिए दिखेगा</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Pay (GPay) UPI ID / नंबर
                  </label>
                  <input
                    type="text"
                    value={payGPay}
                    onChange={(e) => setPayGPay(e.target.value)}
                    placeholder="9876543210@okaxis या 9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">एजेंट को GPay से पेमेंट के लिए दिखेगा</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Paytm UPI ID / नंबर
                  </label>
                  <input
                    type="text"
                    value={payPaytm}
                    onChange={(e) => setPayPaytm(e.target.value)}
                    placeholder="9876543210@paytm या 9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">एजेंट को Paytm से पेमेंट के लिए दिखेगा</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    न्यूनतम वॉलेट रिचार्ज (Min Wallet Recharge ₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={2000}
                    step={100}
                    required
                    value={payMinRecharge}
                    onChange={(e) => setPayMinRecharge(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-xs focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">नियम: न्यूनतम ₹2,000 होना अनिवार्य है</span>
                </div>
              </div>
            </div>

            {/* Grid 3: Bank Transfer Details (NEFT/RTGS/IMPS) */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                  3. आधिकारिक बैंक खाता विवरण (Official Bank Transfer / NEFT / IMPS)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">खाताधारक का नाम (A/C Holder Name)</label>
                  <input
                    type="text"
                    value={payBankHolder}
                    onChange={(e) => setPayBankHolder(e.target.value)}
                    placeholder="SafarGo Travel Services"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">बैंक खाता संख्या (Account Number)</label>
                  <input
                    type="text"
                    value={payBankAcc}
                    onChange={(e) => setPayBankAcc(e.target.value)}
                    placeholder="50200088991122"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">बैंक IFSC कोड</label>
                  <input
                    type="text"
                    value={payBankIfsc}
                    onChange={(e) => setPayBankIfsc(e.target.value)}
                    placeholder="ICIC0001234"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">बैंक का नाम (Bank Name)</label>
                  <input
                    type="text"
                    value={payBankName}
                    onChange={(e) => setPayBankName(e.target.value)}
                    placeholder="ICICI Bank"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                💾 सेव करने पर यह जानकारी तुरंत सभी एजेंटों के बुकिंग फॉर्म व वॉलेट रिचार्ज मॉडल पर लाइव दिखेगी।
              </span>
              <button
                type="submit"
                disabled={isSavingPayment}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-600/20 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPayment ? 'सेव हो रहा है...' : 'सेटिंग्स सुरक्षित करें'}</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB: VIRAL PROMOTION REWARDS CONFIGURATION (INSTA & YT)  */}
      {/* ======================================================== */}
      {activeTab === 'viral_promo' && (
        <form onSubmit={handleSavePromo} className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    वायरल क्रिएटर प्रमोशन एवं बोनस नीतियां (Social Media Rewards Setup)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Instagram Reels और YouTube Videos पर निर्धारित व्यूज लाने वाले एजेंटों व क्रिएटर्स के लिए बोनस राशि और 24-घंटे SLA सेटिंग्स।
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPromo}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition active:scale-95 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPromo ? 'सेव हो रहा है...' : 'प्रमोशन सेटिंग्स सुरक्षित करें'}</span>
              </button>
            </div>

            {/* Grid 1: Instagram Reel Promo Configuration */}
            <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 p-6 rounded-2xl border border-pink-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      1. Instagram Reels प्रमोशन ऑफर
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instagram पर रील पोस्ट करने और 1M व्यूज लाने पर नकद बोनस
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoInstaActive}
                    onChange={(e) => setPromoInstaActive(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">ऑफर सक्रिय (Active)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    न्यूनतम लक्ष्य व्यूज (Target Views Required)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={10000}
                    value={promoInstaViews}
                    onChange={(e) => setPromoInstaViews(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">डिफ़ॉल्ट: 10,00,000 (1 Million) व्यूज</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    बोनस इनाम राशि (Reward Bonus in ₹)
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={promoInstaReward}
                    onChange={(e) => setPromoInstaReward(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-pink-500 outline-none bg-white text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">डिफ़ॉल्ट: ₹500 नकद बोनस</span>
                </div>
              </div>
            </div>

            {/* Grid 2: YouTube Video Promo Configuration */}
            <div className="bg-gradient-to-br from-red-50/50 to-rose-50/50 p-6 rounded-2xl border border-red-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 text-white flex items-center justify-center">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      2. YouTube Video / Shorts प्रमोशन ऑफर
                    </h3>
                    <p className="text-xs text-slate-500">
                      YouTube पर वीडियो/शॉर्ट्स पोस्ट करने और 10K व्यूज लाने पर नकद बोनस
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoYtActive}
                    onChange={(e) => setPromoYtActive(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">ऑफर सक्रिय (Active)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    न्यूनतम लक्ष्य व्यूज (Target Views Required)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={1000}
                    value={promoYtViews}
                    onChange={(e) => setPromoYtViews(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">डिफ़ॉल्ट: 10,000 (10K) व्यूज</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    बोनस इनाम राशि (Reward Bonus in ₹)
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={promoYtReward}
                    onChange={(e) => setPromoYtReward(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none bg-white text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">डिफ़ॉल्ट: ₹100 नकद बोनस</span>
                </div>
              </div>
            </div>

            {/* Grid 3: SLA Window Settings */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                  3. सत्यापन व भुगतान गारंटी विंडो (Verification SLA Guarantee)
                </h3>
              </div>

              <div className="max-w-xs text-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  अधिकतम सत्यापन समय (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={promoSlaHours}
                  onChange={(e) => setPromoSlaHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  डिफ़ॉल्ट: 24 घंटे (क्रिएटर को 24-hour SLA काउंटडाउन दिखेगा)
                </span>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                💾 सेव करने पर यह नियम वेबसाइट और एजेंट डैशबोर्ड पर तुरंत प्रभावी हो जाएंगे।
              </span>
              <button
                type="submit"
                disabled={isSavingPromo}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPromo ? 'सेव हो रहा है...' : 'प्रमोशन सेटिंग्स सुरक्षित करें'}</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 1: ANNOUNCEMENTS (घोषणा / ब्रॉडकास्ट सिस्टम)          */}
      {/* ======================================================== */}
      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveAnnouncement}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    सिस्टम ब्रॉडकास्ट घोषणा (System Broadcast Announcement)
                  </h2>
                  <p className="text-xs text-slate-500">
                    वेबसाइट के शीर्ष पर सभी एजेंटों और आगंतुकों के लिए लाइव नोटिस या संदेश प्रसारित करें
                  </p>
                </div>
              </div>

              {/* Active Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-700">
                  {annActive ? 'घोषणा चालू (Active)' : 'घोषणा बंद (Off)'}
                </span>
                <input
                  type="checkbox"
                  checked={annActive}
                  onChange={(e) => setAnnActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 relative"></div>
              </label>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                त्वरित रेडीमेड टेम्पलेट्स (Quick Presets):
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('whatsapp_reminder')}
                  className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition flex items-center gap-1"
                >
                  ⚡ 15-Min WhatsApp एक्टिव अलर्ट
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('festival_offer')}
                  className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition flex items-center gap-1"
                >
                  🎉 त्यौहार स्पेशल बस सेवा
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('referral_boost')}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition flex items-center gap-1"
                >
                  💰 रेफर करें ₹50 कमाएं
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('maintenance')}
                  className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 transition flex items-center gap-1"
                >
                  🔧 मेंटेनेंस सूचना
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  घोषणा का प्रकार (Priority / Type)
                </label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="urgent">🔴 अति आवश्यक (Urgent Red)</option>
                  <option value="info">🔵 सामान्य सूचना (Info Indigo)</option>
                  <option value="warning">🟡 चेतावनी (Warning Amber)</option>
                  <option value="success">🟢 विशेष ऑफर / बधाई (Success Emerald)</option>
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  किसे दिखाई दे (Target Audience)
                </label>
                <select
                  value={annTarget}
                  onChange={(e) => setAnnTarget(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="all">🌐 सभी के लिए (All Visitors & Agents)</option>
                  <option value="agents">💼 केवल अधिकृत एजेंट (Agents Only)</option>
                  <option value="customers">👥 केवल पब्लिक विज़िटर (Customers Only)</option>
                </select>
              </div>

              {/* Title */}
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  घोषणा का मुख्य शीर्षक (Announcement Title)
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="उदा. ⚠️ 15 मिनट एक्टिविटी नियम: WhatsApp अवश्य चेक करें"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              {/* Message */}
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  विस्तृत संदेश विवरण (Detailed Message Body)
                </label>
                <textarea
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="सभी एजेंटों को सूचित किया जाता है कि बुकिंग अनुरोध दर्ज करने के बाद SafarGo टीम WhatsApp पर ही सीट व बस विवरण वेरीफाई करेगी..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                लाइव प्रीव्यू (How it looks on top of the website):
              </label>
              <div
                className={`p-3 rounded-2xl text-white flex items-center justify-between gap-3 shadow-sm ${
                  annType === 'urgent'
                    ? 'bg-red-600'
                    : annType === 'warning'
                    ? 'bg-amber-600'
                    : annType === 'success'
                    ? 'bg-emerald-600'
                    : 'bg-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    {annType === 'urgent' && <AlertTriangle className="w-4 h-4" />}
                    {annType === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {annType === 'success' && <CheckCircle className="w-4 h-4" />}
                    {annType === 'info' && <Megaphone className="w-4 h-4" />}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold underline decoration-white/40 mr-1.5">
                      {annTitle || 'शीर्षक यहाँ दिखाई देगा'}
                    </span>
                    <span className="text-white/90">
                      {annMessage || 'संदेश का विवरण यहाँ दिखाई देगा...'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded font-black whitespace-nowrap">
                  {annActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>

            {/* Save Announcement Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingAnn}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSavingAnn ? 'प्रसारित हो रहा है...' : 'घोषणा तुरंत लाइव करें (Save & Broadcast)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: NEW FUNCTIONALITY & FEATURE BUILDER               */}
      {/* ======================================================== */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          
          {/* 1. Built-in Feature Toggles */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    1. प्लेटफॉर्म मॉड्यूल्स ऑन/ऑफ (Built-in Platform Modules)
                  </h2>
                  <p className="text-xs text-slate-500">
                    एजेंट डैशबोर्ड पर दिखाने या छुपाने के लिए इन सुविधाओं को टॉगल करें
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveFeatureToggles}
                disabled={isSavingToggles}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingToggles ? 'Saving...' : 'टॉगल सेव करें'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Refer & Earn Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-500" />
                    रेफर और कमाएं (₹50 बोनस)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    एजेंटों को अन्य दोस्तों को आमंत्रित कर ₹50 नकद कमाने का अवसर दें
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={featRefer}
                  onChange={(e) => setFeatRefer(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
              </div>

              {/* Tatkal Bus Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-rose-500" />
                    तत्काल / इमरजेंसी बस सहायता
                  </div>
                  <p className="text-[11px] text-slate-500">
                    अति आवश्यक व तुरंत यात्रा के लिए स्पेशल हेल्पडेस्क WhatsApp बटन
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={featTatkal}
                  onChange={(e) => setFeatTatkal(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
              </div>

              {/* Parcel Service Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-indigo-500" />
                    बस पार्सल व माल ढुलाई बुकिंग
                  </div>
                  <p className="text-[11px] text-slate-500">
                    दुकानदारों व ग्रामीणों के लिए बस डिक्की पार्सल बुकिंग सहायता
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={featParcel}
                  onChange={(e) => setFeatParcel(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
              </div>

              {/* Train Enquiry Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-sky-500" />
                    रेलवे वेटिंग कनेक्टिंग बस
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ट्रेन कन्फर्म न होने पर रेलवे स्टेशन से आगे के लिए बस विकल्प
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={featTrain}
                  onChange={(e) => setFeatTrain(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
              </div>

              {/* Hotel / Stay Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-500" />
                    होटल व धर्मशाला बुकिंग
                  </div>
                  <p className="text-[11px] text-slate-500">
                    तीर्थ स्थलों व प्रमुख शहरों में यात्रियों के लिए कमरा बुकिंग डेस्क
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={featHotel}
                  onChange={(e) => setFeatHotel(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
              </div>

              {/* CSC Print Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-slate-600" />
                    CSC डिजिटल प्रिंट व लैमिनेशन
                  </div>
                  <p className="text-[11px] text-slate-500">
                    टिकट व पहचान पत्र कलर प्रिंटिंग सहायता डेस्क
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={featPrint}
                  onChange={(e) => setFeatPrint(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Dynamic Custom Functionality Builder */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    2. नई कस्टम फंक्शनैलिटी व सेवा जोड़ें (Add Custom Feature)
                  </h2>
                  <p className="text-xs text-slate-500">
                    एडमिन सीधे यहाँ से कोई भी नई डिजिटल सेवा या टूल बटन एजेंट डैशबोर्ड पर जोड़ सकते हैं
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddFeature}
                className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                + नई सेवा / फंक्शनैलिटी जोड़ें
              </button>
            </div>

            {/* List of Custom Features */}
            {(!settings.custom_features || settings.custom_features.length === 0) ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                अभी कोई कस्टम फंक्शनैलिटी नहीं जोड़ी गई है। ऊपर दिए गए बटन से अपनी पहली नई सेवा जोड़ें।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {settings.custom_features.map((feat) => (
                  <div
                    key={feat.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      feat.is_active
                        ? 'border-slate-200 bg-white hover:border-orange-300'
                        : 'border-slate-100 bg-slate-50/70 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {feat.badge || 'सेवा'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleCustomFeature(feat.id)}
                            title={feat.is_active ? 'निष्क्रिय करें' : 'सक्रिय करें'}
                            className={`p-1 rounded-lg text-xs font-bold ${
                              feat.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {feat.is_active ? 'ON' : 'OFF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFeature(feat)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                            title="एडिट करें"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomFeature(feat.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                      <p className="text-xs text-slate-600">{feat.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>प्रकार: <strong className="text-slate-700">{feat.action_type}</strong></span>
                      <span className="truncate max-w-[180px] font-mono">{feat.action_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CORE RATES & TARGET SETTINGS                      */}
      {/* ======================================================== */}
      {activeTab === 'core' && (
        <form onSubmit={handleSaveCore} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Commission Engine Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">1. Commission Engine Configuration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Agent Commission Per Confirmed Booking (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={1}
                    value={commRate}
                    onChange={(e) => setCommRate(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: ₹19.34 (Automatically awarded upon admin ticket confirmation)
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cancellation Reversal Policy
                </label>
                <select
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white"
                >
                  <option value="reverse_commission">Reverse Commission on Cancellation (Recommended)</option>
                  <option value="keep_commission">Retain Commission on Cancellation</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Controls whether agent commission is deducted when a confirmed booking is cancelled
                </p>
              </div>
            </div>
          </div>

          {/* Target and Salary Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-slate-900">2. Agent Target & Fixed Salary Model</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monthly Confirmed Bookings Target
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: 150 eligible confirmed bookings in current calendar month
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proposed Monthly Fixed Salary (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    min={0}
                    required
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: ₹5,000 / month (Paid independently from booking commissions)
                </p>
              </div>
            </div>
          </div>

          {/* Refer & Earn Program Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-bold text-slate-900">3. Refer & Earn Program (Agent Acquisition)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Referral Cash Bonus Per Qualified Agent (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={referralBonus}
                    onChange={(e) => setReferralBonus(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: ₹50.00 (Awarded to referrer once threshold is reached)
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Compulsory Confirmed Bookings Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={referralReqBookings}
                  onChange={(e) => setReferralReqBookings(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: 5 confirmed bookings (Referred agent must complete 5 bookings before ₹50 bonus is released)
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Support Helpline Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">4. SafarGo Central WhatsApp Support Desk</h2>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Support Desk WhatsApp Number (with country code, e.g. 919876543210)
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                placeholder="919876543210"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Every booking form will format click-to-chat requests directed to this WhatsApp number.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSavingCore}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingCore ? 'Saving...' : 'कमीशन व नीतियां सेव करें'}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DATABASE & CLOUD SYNC (डेटाबेस स्थिति व सेटअप)   */}
      {/* ======================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              isSupabaseConfigured
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border-emerald-200'
                : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-amber-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  }`}
                >
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <h2 className="text-lg font-black text-slate-900">
                      {isSupabaseConfigured
                        ? 'लाइव डेटाबेस सक्रिय (Supabase PostgreSQL Connected)'
                        : 'लोकल स्टोरेज मोड (Ready to Connect Live Database)'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {isSupabaseConfigured
                      ? 'SafarGo सीधे क्लाउड PostgreSQL डेटाबेस से जुड़ा हुआ है। सभी बुकिंग्स, एजेंट प्रोफाइल्स और पेआउट्स सुरक्षित क्लाउड पर सिंक हो रहे हैं।'
                      : 'वर्तमान में SafarGo ब्राउज़र मेमोरी (लोकल स्टोरेज) में काम कर रहा है। लाइव क्लाउड डेटाबेस से जोड़ने के लिए नीचे दिए गए स्टेप्स देखें।'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <span
                  className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl ${
                    isSupabaseConfigured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isSupabaseConfigured ? 'Live Cloud DB' : 'Local Fallback'}
                </span>
              </div>
            </div>
          </div>

          {/* Setup Guide Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  SafarGo को रीयल Supabase PostgreSQL डेटाबेस से कैसे जोड़ें (Setup Guide)
                </h3>
                <p className="text-xs text-slate-500">
                  सिर्फ 3 आसान स्टेप्स में अपना फ्री PostgreSQL डेटाबेस लाइव करें:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-900">Supabase प्रोजेक्ट बनाएं</h4>
                <p className="text-[11px] text-slate-500">
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5"
                  >
                    supabase.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>{' '}
                  पर फ्री खाता खोलें और <strong>New Project</strong> बनाएं (जैसे SafarGo-DB)।
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-900">SQL माइग्रेशन रन करें</h4>
                <p className="text-[11px] text-slate-500">
                  Supabase के <strong>SQL Editor</strong> में जाएं और नीचे दी गई तैयार माइग्रेशन फ़ाइल का कोड पेस्ट करके <strong>Run</strong> दबाएं।
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-900">.env फ़ाइल में की (Keys) दर्ज करें</h4>
                <p className="text-[11px] text-slate-500">
                  प्रोजेक्ट सेटिंग्स से <strong>Project URL</strong> और <strong>anon public key</strong> कॉपी करके SafarGo के <code>.env</code> में पेस्ट करें।
                </p>
              </div>
            </div>

            {/* SQL Migration Script Box */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  तैयार SQL माइग्रेशन स्क्रिप्ट फ़ाइल पाथ:
                </span>
                <span className="text-[11px] text-slate-400">PostgreSQL Schema Ready</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 break-all select-all">
                supabase/migrations/20261010000000_safargo_schema.sql
              </div>
              <p className="text-[11px] text-slate-400">
                इस स्क्रिप्ट में सभी 7 टेबल्स (profiles, bookings, bus_trips, commission_ledger, salary_records, payout_requests, audit_logs), RLS सिक्योरिटी नीतियां, और सुपर एडमिन (jia647155@gmail.com) का डेटा स्वचालित रूप से शामिल है।
              </p>
            </div>

            {/* Env Example Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">.env फ़ाइल में जोड़ने हेतु फॉर्मेट:</h4>
              <pre className="bg-slate-100 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200 overflow-x-auto">
{`# SafarGo Live Database Connection
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT CUSTOM FEATURE                         */}
      {/* ======================================================== */}
      {isFeatureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingFeatureId ? 'फंक्शनैलिटी एडिट करें' : 'नई कस्टम फंक्शनैलिटी / सेवा जोड़ें'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatureModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomFeatureForm} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">सेवा का नाम (Service / Feature Title)*</label>
                <input
                  type="text"
                  required
                  value={featFormTitle}
                  onChange={(e) => setFeatFormTitle(e.target.value)}
                  placeholder="उदा. चार धाम यात्रा स्पेशल बस बुकिंग"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">संक्षिप्त विवरण (Short Description)*</label>
                <textarea
                  rows={2}
                  required
                  value={featFormDesc}
                  onChange={(e) => setFeatFormDesc(e.target.value)}
                  placeholder="उदा. उत्तराखंड एवं चार धाम यात्रा के लिए सुरक्षित व सुलभ बस बुकिंग सहायता"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">बैज / टैग (Badge)</label>
                  <input
                    type="text"
                    value={featFormBadge}
                    onChange={(e) => setFeatFormBadge(e.target.value)}
                    placeholder="उदा. 24x7, नई सेवा, हॉट"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">आइकॉन (Icon)</label>
                  <select
                    value={featFormIcon}
                    onChange={(e) => setFeatFormIcon(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 bg-white text-xs"
                  >
                    <option value="Zap">⚡ Zap (बिजली / तत्काल)</option>
                    <option value="Package">📦 Package (पार्सल / कूरियर)</option>
                    <option value="Train">🚆 Train (ट्रेन / रेलवे)</option>
                    <option value="MapPin">📍 MapPin (टूर / यात्रा)</option>
                    <option value="CreditCard">💳 CreditCard (भुगतान / रिचार्ज)</option>
                    <option value="Sparkles">✨ Sparkles (स्पेशल)</option>
                    <option value="PhoneCall">📞 PhoneCall (कॉल हेल्पलाइन)</option>
                    <option value="Printer">🖨️ Printer (प्रिंटिंग)</option>
                    <option value="Shield">🛡️ Shield (बीमा / सुरक्षा)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">क्लिक करने पर क्या हो (Action Type)</label>
                  <select
                    value={featFormActionType}
                    onChange={(e) => setFeatFormActionType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 bg-white text-xs"
                  >
                    <option value="whatsapp">💬 WhatsApp चैट खुले (Pre-filled message)</option>
                    <option value="external_url">🔗 बाहरी लिंक / पोर्टल खुले</option>
                    <option value="notice_modal">ℹ️ निर्देश पॉप-अप (Notice Modal)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featActiveCheck"
                    checked={featFormActive}
                    onChange={(e) => setFeatFormActive(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <label htmlFor="featActiveCheck" className="font-bold text-slate-800 cursor-pointer">
                    सक्रिय रखें (Active)
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {featFormActionType === 'whatsapp'
                    ? 'WhatsApp प्री-फिल्ड संदेश (Template Message)'
                    : featFormActionType === 'external_url'
                    ? 'वेबसाइट URL (Link)'
                    : 'पॉप-अप में दिखाने वाले निर्देश'}
                </label>
                <textarea
                  rows={2}
                  value={featFormActionValue}
                  onChange={(e) => setFeatFormActionValue(e.target.value)}
                  placeholder={
                    featFormActionType === 'whatsapp'
                      ? 'नमस्ते सफ़ारगो टीम, मुझे इस नई सेवा के लिए विवरण भेजें...'
                      : featFormActionType === 'external_url'
                      ? 'https://example.com'
                      : 'इस सेवा के नियम एवं विवरण यहाँ लिखें...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeatureModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition"
                >
                  {editingFeatureId ? 'अपडेट सुरक्षित करें' : 'सेवा लाइव जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
