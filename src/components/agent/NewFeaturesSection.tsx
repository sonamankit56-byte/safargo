import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CustomFeature, FeatureIconName } from '../../types';
import {
  Zap,
  Package,
  Train,
  MapPin,
  CreditCard,
  Sparkles,
  PhoneCall,
  Printer,
  Shield,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Gift,
  Building,
  Info,
  X,
  ArrowRight
} from 'lucide-react';

interface NewFeaturesSectionProps {
  onNavigateTab?: (tab: string) => void;
}

export const NewFeaturesSection: React.FC<NewFeaturesSectionProps> = ({ onNavigateTab }) => {
  const { settings } = useData();
  const { currentUser } = useAuth();
  const [selectedNotice, setSelectedNotice] = useState<CustomFeature | null>(null);

  const getIcon = (name: FeatureIconName | string) => {
    switch (name) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Package':
        return <Package className="w-5 h-5 text-indigo-500" />;
      case 'Train':
        return <Train className="w-5 h-5 text-sky-500" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-rose-500" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5 text-teal-500" />;
      case 'Printer':
        return <Printer className="w-5 h-5 text-slate-600" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'HelpCircle':
      default:
        return <HelpCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const handleCustomFeatureClick = (feat: CustomFeature) => {
    if (feat.action_type === 'whatsapp') {
      const agentInfo = currentUser
        ? `\n\nएजेंट: ${currentUser.full_name} (${currentUser.mobile})\nशॉप: ${currentUser.shop_name || 'N/A'}`
        : '';
      const text = encodeURIComponent(`${feat.action_value}${agentInfo}`);
      const cleanPhone = settings.support_whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else if (feat.action_type === 'external_url') {
      window.open(feat.action_value, '_blank');
    } else if (feat.action_type === 'notice_modal') {
      setSelectedNotice(feat);
    }
  };

  const handleBuiltinWhatsAppService = (serviceName: string, prefixText: string) => {
    const agentInfo = currentUser
      ? `\nएजेंट नाम: ${currentUser.full_name}\nमोबाइल: ${currentUser.mobile}\nदुकान: ${currentUser.shop_name || 'N/A'}, ${currentUser.city}`
      : '';
    const message = `SAFARGO ${serviceName.toUpperCase()} ENQUIRY\n${prefixText}\n${agentInfo}\n\nकृपया सहायता करें।`;
    const cleanPhone = settings.support_whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const activeCustomFeatures = (settings.custom_features || []).filter((f) => f.is_active);

  // Check if any feature is enabled
  const hasAnyFeature =
    settings.feature_refer_earn ||
    settings.feature_tatkal_service ||
    settings.feature_parcel_service ||
    settings.feature_train_enquiry ||
    settings.feature_hotel_service ||
    settings.feature_print_service ||
    activeCustomFeatures.length > 0;

  if (!hasAnyFeature) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              नई सेवाएँ एवं अतिरिक्त सुविधाएँ
              <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                Admin Activated
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              सफ़ारगो एडमिन द्वारा अधिकृत नई डिजिटल सेवाएँ — सीधे अपने ग्राहकों को सेवा दें और कमाई बढ़ाएं
            </p>
          </div>
        </div>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        
        {/* 1. Refer & Earn Module */}
        {settings.feature_refer_earn && (
          <div className="group relative p-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                  ₹{settings.referral_bonus || 100} कैश बोनस
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                रेफर करें और कमाएं (Refer & Earn)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                दूसरे CSC एजेंटों को जोड़ें। उनके 5 बुकिंग पूरे होते ही आपको ₹100 सीधे कमीशन व Go Wallet में प्राप्त होंगे।
              </p>
            </div>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('refer-earn') : null}
              className="mt-3.5 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              रेफरल डैशबोर्ड खोलें
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Tatkal Emergency Bus Seat */}
        {settings.feature_tatkal_service && (
          <div className="group relative p-4 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/60 to-red-50/40 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  24x7 तत्काल
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                तत्काल / इमरजेंसी बस सीट
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                आज रात या तत्काल यात्रा के लिए सीधे सफ़ारगो स्पेशल हेल्पलाइन से बस ऑपरेटर कोटा सीट निकालें।
              </p>
            </div>
            <button
              onClick={() => handleBuiltinWhatsAppService('Tatkal Bus Booking', 'मुझे आज रात के लिए तत्काल बस सीट चाहिए। रूट एवं यात्री विवरण: ')}
              className="mt-3.5 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              तत्काल WhatsApp रिक्वेस्ट भेजें
            </button>
          </div>
        )}

        {/* 3. Parcel & Courier Desk */}
        {settings.feature_parcel_service && (
          <div className="group relative p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-blue-50/40 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  पार्सल सर्विस
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                बस पार्सल व डिक्की माल ढुलाई
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                दवाइयां, आवश्यक कागजात, या भारी बैग शहर से गाँव या गाँव से शहर प्राइवेट बस द्वारा सुरक्षित भेजें।
              </p>
            </div>
            <button
              onClick={() => handleBuiltinWhatsAppService('Bus Parcel & Cargo', 'मुझे बस डिक्की में पार्सल भिजवाना है। स्रोत, गंतव्य व वजन: ')}
              className="mt-3.5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              पार्सल बुकिंग पूछताछ भेजें
            </button>
          </div>
        )}

        {/* 4. Train Tatkal / PNR Enquiry */}
        {settings.feature_train_enquiry && (
          <div className="group relative p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-cyan-50/40 hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Train className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  ट्रेन सहायता
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                रेलवे पूछताछ एवं कनेक्टिंग बस
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ट्रेन वेटिंग लिस्ट या टिकट न मिलने पर रेलवे स्टेशन से आगे के सफर के लिए कनेक्टिंग बस प्रबंध।
              </p>
            </div>
            <button
              onClick={() => handleBuiltinWhatsAppService('Train Connecting Bus', 'ट्रेन टिकट वेटिंग है, स्टेशन से कनेक्टिंग बस सीट चाहिए: ')}
              className="mt-3.5 w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              ट्रेन सहायता अनुरोध
            </button>
          </div>
        )}

        {/* 5. Hotel & Stay Assistance */}
        {settings.feature_hotel_service && (
          <div className="group relative p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  स्टे डेस्क
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                होटल व धर्मशाला बुकिंग
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                तीर्थ स्थलों (काशी, अयोध्या, हरिद्वार, खाटूश्याम) पर यात्रियों के लिए बजट होटल एवं कमरा सहायता।
              </p>
            </div>
            <button
              onClick={() => handleBuiltinWhatsAppService('Hotel Stay Assistance', 'यात्रियों के लिए होटल/धर्मशाला कमरा चाहिए। शहर व तारीख: ')}
              className="mt-3.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              कमरा पूछताछ भेजें
            </button>
          </div>
        )}

        {/* 6. Dynamic Custom Features Created by Admin in System Settings */}
        {activeCustomFeatures.map((feat) => (
          <div
            key={feat.id}
            className="group relative p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getIcon(feat.icon_name)}
                </div>
                {feat.badge && (
                  <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    {feat.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {feat.description}
              </p>
            </div>

            <button
              onClick={() => handleCustomFeatureClick(feat)}
              className="mt-3.5 w-full py-2 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              {feat.action_type === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
              {feat.action_type === 'external_url' && <ExternalLink className="w-3.5 h-3.5" />}
              {feat.action_type === 'notice_modal' && <Info className="w-3.5 h-3.5" />}
              {feat.action_type === 'whatsapp' ? 'WhatsApp पर शुरू करें' : feat.action_type === 'external_url' ? 'पोर्टल खोलें' : 'विस्तार से पढ़ें'}
            </button>
          </div>
        ))}
      </div>

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  {getIcon(selectedNotice.icon_name)}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{selectedNotice.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase">विवरण एवं निर्देश</p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedNotice.action_value || selectedNotice.description}
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                समझ गया (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
