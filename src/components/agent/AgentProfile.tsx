import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, Mail, Building, MapPin, ShieldCheck, Clock, Save } from 'lucide-react';

export const AgentProfile: React.FC = () => {
  const { currentUser, updateProfile, isApprovedAgent } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [shopName, setShopName] = useState(currentUser?.shop_name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) {
      error('Validation Error', 'Full Name and Mobile are mandatory.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        shop_name: shopName.trim(),
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">एजेंट प्रोफ़ाइल (Agent Profile)</h1>
        <p className="text-xs text-slate-500 mt-1">
          अपनी दुकान और संपर्क जानकारी को अद्यतन रखें (Keep contact details updated)
        </p>
      </div>

      {/* Status Card */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-4 ${
          isApprovedAgent
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isApprovedAgent ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}
        >
          {isApprovedAgent ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">
              खाता स्थिति (Account Status):{' '}
              <span className="uppercase font-black">
                {currentUser?.agent_status.replace(/_/g, ' ')}
              </span>
            </h3>
          </div>
          <p className="text-xs mt-1 opacity-90 leading-relaxed">
            {isApprovedAgent
              ? 'आपका खाता सफ़ारगो द्वारा सत्यापित है। आप वैध टिकट बुकिंग्स कर सकते हैं।'
              : 'आपका खाता अनुमोदन की प्रतीक्षा में है (Pending Approval)। एडमिन सत्यापन के बाद टिकट बुकिंग चालू होगी।'}
          </p>
          {currentUser?.approved_at && (
            <p className="text-[11px] mt-2 font-mono text-emerald-700">
              Approved At: {new Date(currentUser.approved_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पूरा नाम (Full Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              मोबाइल नंबर (Mobile Number) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ईमेल पता (Email Address)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              दुकान / केंद्र का नाम (Shop / CSC Kendra Name)
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Kisan Jan Seva Kendra"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              शहर (City)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              जिला (District)
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            दुकान का पूरा पता (Full Address)
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'प्रोफ़ाइल सहेजें (Save Profile)'}
          </button>
        </div>
      </form>
    </div>
  );
};
