import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Home, 
  Briefcase, 
  ArrowRight,
  User,
  Phone,
  Building,
  Navigation,
  X
} from 'lucide-react';
import { DeliveryAddress } from '../../types';

export const AddressScreen: React.FC = () => {
  const { 
    addresses, 
    selectedAddressId, 
    setSelectedAddressId, 
    addAddress,
    setCurrentView,
    cartTotalMargin,
    t 
  } = useShopping();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [roadNameArea, setRoadNameArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [formError, setFormError] = useState('');

  // Handle pincode lookup
  const handlePincodeChange = (pin: string) => {
    setPincode(pin);
    if (pin.length === 6) {
      // Mock Indian postal pincode mapping
      if (pin.startsWith('11')) { setCity('New Delhi'); setState('Delhi'); }
      else if (pin.startsWith('40')) { setCity('Mumbai'); setState('Maharashtra'); }
      else if (pin.startsWith('45')) { setCity('Indore'); setState('Madhya Pradesh'); }
      else if (pin.startsWith('30')) { setCity('Jaipur'); setState('Rajasthan'); }
      else if (pin.startsWith('39')) { setCity('Surat'); setState('Gujarat'); }
      else if (pin.startsWith('22')) { setCity('Lucknow'); setState('Uttar Pradesh'); }
      else if (pin.startsWith('80')) { setCity('Patna'); setState('Bihar'); }
      else if (pin.startsWith('56')) { setCity('Bengaluru'); setState('Karnataka'); }
      else { setCity('Indore'); setState('Madhya Pradesh'); }
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !houseNo || !roadNameArea || !pincode) {
      setFormError(t('कृपया सभी आवश्यक फ़ील्ड भरें', 'Please fill all mandatory fields'));
      return;
    }
    if (phoneNumber.length < 10) {
      setFormError(t('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें', 'Please enter a valid 10-digit mobile number'));
      return;
    }

    addAddress({
      fullName,
      phoneNumber,
      houseNo,
      roadNameArea,
      pincode,
      city: city || 'City',
      state: state || 'State',
      landmark,
      addressType,
      isDefault: addresses.length === 0
    });

    setIsAddModalOpen(false);
    // Reset
    setFullName('');
    setPhoneNumber('');
    setHouseNo('');
    setRoadNameArea('');
    setPincode('');
    setCity('');
    setState('');
    setLandmark('');
    setFormError('');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-28 pt-2">
      <div className="max-w-3xl mx-auto px-3 space-y-3">
        {/* Progress Step Header */}
        <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-500">
          <span className="text-gray-400">1. {t('कार्ट', 'Cart')}</span>
          <span className="text-gray-300">➔</span>
          <span className="text-[#9F2089] flex items-center gap-1 font-extrabold">
            <MapPin className="w-4 h-4 text-[#9F2089]" />
            <span>2. {t('पता (Address)', 'Address')}</span>
          </span>
          <span className="text-gray-300">➔</span>
          <span className="text-gray-400">3. {t('भुगतान', 'Payment')}</span>
        </div>

        {/* Reseller Dispatch Hint */}
        {cartTotalMargin > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            <span className="font-bold block">
              {t('रीसेलिंग ऑर्डर: अपने ग्राहक का पता चुनें या जोड़ें', 'Resale Order: Enter customer\'s delivery address')}
            </span>
            <span className="text-[11px] text-amber-700">
              {t('पार्सल ग्राहक के पते पर बिना किसी सफ़रगो बिल के गोपनीय रूप से डिलीवर होगा।', 'Parcel will be anonymously dispatched to customer without SafarGo bill.')}
            </span>
          </div>
        )}

        {/* Add New Address Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-white border-2 border-dashed border-[#9F2089] text-[#9F2089] hover:bg-pink-50 p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Plus className="w-5 h-5" />
          <span>{t('+ नया डिलीवरी पता जोड़ें', '+ Add New Delivery Address')}</span>
        </button>

        {/* Saved Addresses List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            {t('सहेजे गए पते (Saved Addresses)', 'Saved Addresses')} ({addresses.length})
          </h3>

          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer relative shadow-soft ${
                  isSelected 
                    ? 'border-[#9F2089] ring-2 ring-pink-100' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold uppercase">
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-pink-100 text-[#9F2089] px-2 py-0.5 rounded font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  {/* Radio circle */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {addr.houseNo}, {addr.roadNameArea}
                  {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                </p>

                <p className="text-xs font-semibold text-gray-800 mt-1">
                  {addr.city}, {addr.state} - <span className="font-bold text-[#9F2089]">{addr.pincode}</span>
                </p>

                <p className="text-xs text-gray-700 mt-2 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>+91 {addr.phoneNumber}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#9F2089] to-pink-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {t('नया डिलीवरी पता जोड़ें', 'Add Delivery Address')}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('पूरा नाम (Full Name) *', 'Full Name *')}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('मोबाइल नंबर (Mobile) *', 'Mobile Number *')}</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 digit number"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('मकान / फ्लैट नंबर, बिल्डिंग *', 'House / Flat / Building No *')}</label>
                <input
                  type="text"
                  required
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 302, Sai Residency"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('सड़क, क्षेत्र, कॉलोनी *', 'Road Name, Area, Colony *')}</label>
                <input
                  type="text"
                  required
                  value={roadNameArea}
                  onChange={(e) => setRoadNameArea(e.target.value)}
                  placeholder="e.g. Civil Lines, Main Market"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('पिनकोड *', 'Pincode *')}</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 digits"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('शहर', 'City')}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t('राज्य', 'State')}</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('नजदीकी लैंडमार्क (वैकल्पिक)', 'Landmark (Optional)')}</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Temple, School, Bank ATM"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9F2089] focus:outline-none"
                />
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{t('पते का प्रकार', 'Address Type')}</label>
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        addressType === type 
                          ? 'border-[#9F2089] bg-pink-50 text-[#9F2089]' 
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  {t('रद्द करें', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#9F2089] text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {t('पता सहेजें (Save Address)', 'Save Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-sticky">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentView('cart')}
            className="py-3 px-4 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100"
          >
            {t('पीछे', 'Back')}
          </button>

          <button
            onClick={() => setCurrentView('payment')}
            className="flex-1 max-w-sm py-3 px-5 bg-[#9F2089] hover:bg-pink-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>{t('इस पते पर भेजें (Continue to Payment)', 'Deliver to this Address')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
