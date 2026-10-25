import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Utensils, 
  Heart, 
  Sparkles, 
  Award, 
  Users, 
  Clock, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  ArrowRight, 
  Star, 
  DollarSign, 
  ChefHat, 
  Soup, 
  Calendar,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GoTifinComingSoon: React.FC = () => {
  const { t, setActiveService, isAgentLoggedIn, isCustomerLoggedIn, setIsAuthModalOpen } = useTravel();
  const [activeTab, setActiveTab] = useState<'all' | 'women' | 'subscribers'>('all');
  const [preRegisterRole, setPreRegisterRole] = useState<'chef' | 'student_worker'>('chef');
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCity, setApplicantCity] = useState('Indore');
  const [submittedWaitlist, setSubmittedWaitlist] = useState(false);

  const handleSubmitWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgentLoggedIn && !isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!applicantName || !applicantPhone) return;
    setSubmittedWaitlist(true);
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8 animate-fade-in">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-900 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-yellow-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> {t('विशेष सामाजिक पहल • Launching Soon', 'Special Social Initiative • Launching Soon')}
            </span>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              {t('🍲 गो टिफिन (GoTifin)', '🍲 GoTifin by SafarGo')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t(
              'घर जैसा शुद्ध भोजन • हर महिला को फिक्स सैलरी + प्रति टिफिन कमाई',
              'Homely Nutritious Meals • Fixed Salary + Per Tiffin Earning for Women'
            )}
          </h1>

          <p className="text-sm sm:text-base text-rose-100 font-medium leading-relaxed max-w-2xl">
            {t(
              'सफ़रगो प्रस्तुत करता है "गो टिफिन" (GoTifin) - कंपनी कर्मचारियों व छात्रों के लिए 100% हाइजीनिक घरेलू भोजन और देश की गृहणियों के लिए आर्थिक आज़ादी व स्थायी आजीविका!',
              'SafarGo introduces "GoTifin" - Healthy domestic meal subscriptions for company professionals & students, empowering homemakers with guaranteed monthly salaries and per-meal incentives!'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#waitlist-form"
              className="px-6 py-3 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('प्री-रजिस्ट्रेशन करें (वेटलिस्ट जॉइन करें)', 'Pre-Register / Join Waitlist')}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setActiveService('bus')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md transition"
            >
              {t('🚌 बस बुकिंग पर जाएं', 'Go to Bus Booking')}
            </button>
          </div>
        </div>
      </div>

      {/* Two Pillar Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Women Empowerment & Fixed Salary */}
        <div className="bg-gradient-to-br from-rose-50 via-white to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/30">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                {t('महिला सशक्तिकरण', 'WOMEN EMPOWERMENT')}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {t('हर महिला को फिक्स सैलरी + प्रति टिफिन कमाई', 'Fixed Salary + Per-Tiffin Commission for Women')}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {t(
              'घर बैठी महिलाओं व माताओं के हुनर का सम्मान! सफ़रगो गो-टिफिन से जुड़कर हर महिला को न्यूनतम फिक्स मासिक वेतन मिलेगा तथा उनके द्वारा तैयार प्रत्येक टिफिन बॉक्स पर अतिरिक्त इंसेंटिव सीधे उनके बैंक खाते में ट्रांसफर होगा।',
              'Empowering home cooks & mothers! Every registered female home chef receives a guaranteed fixed base salary plus an additional bonus on every single meal box prepared, credited directly to their bank account every week.'
            )}
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('₹15,000 - ₹25,000+ संभावित मासिक आय (Fixed + Variable)', '₹15,000 - ₹25,000+ monthly earning potential')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('मुफ्त पैकेजिंग किट, स्टील टिफिन व राशन सहायता', 'Complimentary packaging kits, food-grade boxes & ingredient support')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('हर रविवार ऑटोमैटिक बैंक ट्रांसफर • 100% सम्मानजनक काम', 'Automatic weekly payouts every Sunday • 100% Dignified work from home')}</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: For Company Workers & Students */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                {t('वर्कर्स व छात्र स्पेशल', 'FOR WORKERS & STUDENTS')}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {t('कंपनी कर्मचारियों व छात्रों के लिए शुद्ध टिफिन', 'Healthy Meals for Company Staff & PG Students')}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {t(
              'घर से दूर रह रहे छात्रों और ऑफिस में कार्यरत प्रोफेशनल्स के लिए रोज़ का गर्म, शुद्ध और स्वादिष्ट भोजन। होटल या ढाबे का बासी और अनहेल्दी खाना छोड़ें - गो टिफिन ला रहा है माँ के हाथ का खाना ऑन-टाइम डिलीवरी के साथ!',
              'Daily fresh, hot and hygienic meals for students living in PGs and corporate employees working long hours. Say goodbye to oily hotel and mess food - enjoy homely balanced nutrition delivered right to your office or doorstep!'
            )}
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('शुद्ध देसी घी/सरसों का तेल, ताज़ा सब्जियां, 4 रोटियां, दाल व चावल', 'Fresh vegetables, 4 phulkas, dal, rice, salad & sweet dessert')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('किफायती मासिक सब्सक्रिप्शन: मात्र ₹60-₹80 प्रति डाइट', 'Affordable monthly subscription plans starting at just ₹60/meal')}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('दैनिक लंच (1 PM) एवं डिनर (8 PM) समय पर डिलीवरी गारंटी', 'Guaranteed on-time delivery for Lunch (1 PM) & Dinner (8 PM)')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Daily Thali Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {t('मेनू प्रीव्यू', 'MENU PREVIEW')}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {t('गो टिफिन स्पेशल डेली थाली (Sample Thali)', 'GoTifin Special Daily Thali')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('हर दिन अलग स्वादिष्ट मेनू, संतुलित पोषण व कम तेल-मसाले', 'Daily rotating menu crafted for balanced digestion & high energy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 line-through">₹120</span>
            <span className="text-lg font-black text-emerald-600">₹69</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {t('लॉन्च ऑफर', 'Launch Offer')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-2xl">🫓</span>
            <h4 className="font-bold text-xs text-slate-900">{t('4 ताज़ा फुलके', '4 Hot Phulkas')}</h4>
            <p className="text-[11px] text-slate-500">{t('देसी गेहूं के तवे वाले', 'Soft Whole Wheat')}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-2xl">🍲</span>
            <h4 className="font-bold text-xs text-slate-900">{t('शाही दाल / तड़का', 'Tadka / Makhani Dal')}</h4>
            <p className="text-[11px] text-slate-500">{t('शुद्ध हींग व जीरे का तड़का', 'Slow cooked & protein rich')}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-2xl">🥗</span>
            <h4 className="font-bold text-xs text-slate-900">{t('मौसमी सब्जी व सलाद', 'Seasonal Veg & Salad')}</h4>
            <p className="text-[11px] text-slate-500">{t('पनीर/मटर/भिंडी/मिक्स वेज', 'Freshly chopped vegetables')}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-2xl">🍚</span>
            <h4 className="font-bold text-xs text-slate-900">{t('जीरा राइस व मिठाई', 'Jeera Rice & Sweet')}</h4>
            <p className="text-[11px] text-slate-500">{t('बासमती चावल व मीठा', 'Basmati & Fresh Dessert')}</p>
          </div>
        </div>
      </div>

      {/* Waitlist Form Section */}
      <div id="waitlist-form" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="max-w-2xl">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            PRE-LAUNCH WAITLIST
          </span>
          <h3 className="text-xl sm:text-3xl font-black mt-2 text-white">
            {t('गो टिफिन लॉन्च होते ही सबसे पहले सूचना पाएं', 'Be the First to Access GoTifin at Launch')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t(
              'चाहे आप एक कुशल गृहणी हों जो घर से खाना बनाकर कमाना चाहती हैं, या फिर एक कंपनी कर्मचारी/छात्र जो टिफिन चाहते हैं - अभी अपना नाम दर्ज करें!',
              'Whether you are an aspiring woman home chef seeking steady income or a worker/student wanting daily nutritious meals, register for priority onboarding.'
            )}
          </p>
        </div>

        {!submittedWaitlist ? (
          <form onSubmit={handleSubmitWaitlist} className="space-y-4 max-w-2xl text-xs">
            <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 w-fit">
              <button
                type="button"
                onClick={() => setPreRegisterRole('chef')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  preRegisterRole === 'chef'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('👩‍🍳 महिला होम शेफ (सैलरी + कमाई)', '👩‍🍳 Woman Home Chef (Salary + Earnings)')}
              </button>
              <button
                type="button"
                onClick={() => setPreRegisterRole('student_worker')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  preRegisterRole === 'student_worker'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('🏢 वर्कर / छात्र (टिफिन ग्राहक)', '🏢 Worker / Student (Meal Subscriber)')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {t('पूरा नाम', 'Full Name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. सुनीता शर्मा / राहुल वर्मा"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {t('मोबाइल नंबर', 'Mobile Number')}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {t('शहर (City)', 'City')}
                </label>
                <select
                  value={applicantCity}
                  onChange={(e) => setApplicantCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Indore">Indore</option>
                  <option value="Bhopal">Bhopal</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Ujjain">Ujjain</option>
                  <option value="Gwalior">Gwalior</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black rounded-xl shadow-lg shadow-rose-600/30 transition active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('प्री-रजिस्ट्रेशन सुरक्षित करें (Join VIP Waitlist)', 'Submit VIP Pre-Registration')}</span>
            </button>
          </form>
        ) : (
          <div className="p-6 bg-emerald-950/60 border border-emerald-500 rounded-2xl text-emerald-200 space-y-2 max-w-2xl animate-scale-up">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{t('बधाई हो! आपका नाम GoTifin वीआईपी लिस्ट में दर्ज हो चुका है।', 'Congratulations! Your VIP spot is secured.')}</span>
            </div>
            <p className="text-xs text-slate-300">
              {t(
                `धन्यवाद ${applicantName}! जैसे ही SafarGo GoTifin ${applicantCity} में लाइव होगा, हमारी टीम आपको +91 ${applicantPhone} पर प्राथमिकता से संपर्क करेगी।`,
                `Thank you ${applicantName}! As soon as GoTifin launches in ${applicantCity}, our team will contact you on +91 ${applicantPhone}.`
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
