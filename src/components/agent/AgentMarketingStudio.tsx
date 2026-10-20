import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Sparkles, 
  Share2, 
  Download, 
  Check, 
  Bus, 
  Plane, 
  Award, 
  MapPin, 
  Phone, 
  Palette, 
  Zap, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BannerTemplate {
  id: string;
  title: string;
  tagline: string;
  themeGradient: string;
  serviceType: string;
  highlights: string[];
}

const TEMPLATES: BannerTemplate[] = [
  {
    id: 'mahakal',
    title: 'श्री महाकाल दर्शन स्पेशल बस सेवा',
    tagline: 'उज्जैन व ओंकारेश्वर ज्योतिर्लिंग यात्रा • AC स्लीपर बसें',
    themeGradient: 'from-amber-600 via-orange-600 to-red-700',
    serviceType: 'धार्मिक यात्रा सर्किट',
    highlights: ['भस्म आरती दर्शन स्पेशल', 'पुशबैक आरामदायक सीटें', 'लाइव जीपीएस ट्रैकिंग']
  },
  {
    id: 'indore_bhopal',
    title: 'इंदौर ⇄ भोपाल सुपरफास्ट एक्सप्रेस बस',
    tagline: 'हर 15 मिनट में सीधी बसें • सबसे कम किराए की गारंटी',
    themeGradient: 'from-blue-700 via-indigo-800 to-slate-900',
    serviceType: 'दैनिक एक्सप्रेस सर्विस',
    highlights: ['फ्री 4G वाई-फाई व चार्जिंग', 'सीधा बस स्टैंड पिकअप', 'कन्फर्म टिकट तुरंत पाएं']
  },
  {
    id: 'festival_home',
    title: 'त्यौहार स्पेशल घर वापसी टिकट बुकिंग',
    tagline: 'होली, दीवाली व शादी विवाह हेतु अग्रिम सीट बुकिंग शुरू!',
    themeGradient: 'from-rose-600 via-pink-700 to-purple-900',
    serviceType: 'अग्रिम आरक्षण केंद्र',
    highlights: ['कोई छुपे चार्ज नहीं', '24 घंटे हेल्पलाइन सहायता', 'मोबाइल पर ई-टिकट तुरंत']
  },
  {
    id: 'flights_all_india',
    title: 'सफ़रगो ऑल इंडिया फ्लाइट व बस केंद्र',
    tagline: 'इंदौर, भोपाल, दिल्ली, मुंबई फ्लाइट्स • सबसे सस्ता किराया',
    themeGradient: 'from-sky-700 via-cyan-800 to-slate-950',
    serviceType: 'हवाई यात्रा व बस बुकिंग',
    highlights: ['सरकारी मान्यता प्राप्त केंद्र', 'फ्री सीट व बैगेज सहायता', 'तुरंत बोर्डिंग पास']
  }
];

export const AgentMarketingStudio: React.FC = () => {
  const { currentAgent, t } = useTravel();
  const [selectedTemplate, setSelectedTemplate] = useState<BannerTemplate>(TEMPLATES[0]);
  const [shopName, setShopName] = useState(() => currentAgent?.shopName || 'सफ़रगो अधिकृत टूर एंड ट्रैवल्स');
  const [phone, setPhone] = useState(() => currentAgent?.mobile || '9826012345');
  const [city, setCity] = useState(() => currentAgent?.city || 'Indore');
  const [copied, setCopied] = useState(false);

  const handleShareWhatsApp = () => {
    const text = 
      `🎉 *${selectedTemplate.title}* 🎉\n` +
      `📢 ${selectedTemplate.tagline}\n\n` +
      `✨ *विशेषताएं*:\n` +
      selectedTemplate.highlights.map(h => `✓ ${h}`).join('\n') + '\n\n' +
      `🏢 *बुकिंग केंद्र*: ${shopName}\n` +
      `📍 *स्थान*: ${city} (मध्य प्रदेश)\n` +
      `📞 *संपर्क/WhatsApp*: +91 ${phone}\n\n` +
      `_सफ़रगो अधिकृत एजेंट द्वारा संचालित | सुरक्षित व आसान बुकिंग_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>एजेंट मार्केटिंग एवं प्रमोशन स्टूडियो</span>
          </div>
          <h3 className="font-black text-slate-900 text-lg">
            WhatsApp स्टेटस एवं पोस्टर जनरेटर
          </h3>
          <p className="text-xs text-slate-500">
            अपने नाम व नंबर का ब्रांडेड पोस्टर बनाकर WhatsApp ग्रुप्स में शेयर करें और अधिक ग्राहक पाएं!
          </p>
        </div>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>WhatsApp पर शेयर करें</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selector & Customization Controls */}
        <div className="space-y-4">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            1. पोस्टर थीम चुनें:
          </span>

          <div className="space-y-2">
            {TEMPLATES.map((tmpl) => {
              const isSel = selectedTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`w-full p-3 rounded-2xl border transition text-left flex items-center justify-between ${
                    isSel
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h5 className="font-black text-xs text-slate-900">{tmpl.title}</h5>
                    <span className="text-[10px] text-slate-500">{tmpl.serviceType}</span>
                  </div>
                  {isSel && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-black text-slate-700 uppercase tracking-wider block pt-2">
            2. दुकान व संपर्क विवरण:
          </span>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">दुकान / कियोस्क का नाम</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">WhatsApp / कॉलिंग नंबर</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-bold mb-1">शहर / गांव (MP)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Live Visual Poster Preview */}
        <div className="lg:col-span-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
            3. लाइव पोस्टर प्रीव्यू (WhatsApp Status Ready):
          </span>

          <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${selectedTemplate.themeGradient} text-white shadow-2xl relative overflow-hidden space-y-6 border border-white/20`}>
            {/* Top Brand Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-xs font-black">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>सफ़रगो (SafarGo) अधिकृत केंद्र</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                MP शासन अधिकृत
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2 py-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {selectedTemplate.title}
              </h2>
              <p className="text-sm font-semibold text-white/90">
                {selectedTemplate.tagline}
              </p>
            </div>

            {/* Highlights Chips */}
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.highlights.map((h, i) => (
                <span
                  key={i}
                  className="bg-black/30 backdrop-blur-md text-[11px] font-bold px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>{h}</span>
                </span>
              ))}
            </div>

            {/* Agent Contact Footer Banner */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase block">अधिकृत बुकिंग केंद्र:</span>
                <h4 className="font-black text-base text-white">{shopName}</h4>
                <p className="text-xs text-white/80">{city}, मध्य प्रदेश</p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[10px] text-white/80 font-bold uppercase block">तुरंत टिकट बुक कराएं:</span>
                <span className="text-base font-black text-amber-300 font-mono flex items-center gap-1">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  +91 {phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp स्टेटस पर शेयर करें</span>
            </button>
            <button
              type="button"
              onClick={() => {
                alert('पोस्टर इमेज डाउनलोड हो गई है! इसे अपने WhatsApp स्टेटस और Facebook पर लगाएं।');
              }}
              className="px-5 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>डाउनलोड HD बैनर</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
