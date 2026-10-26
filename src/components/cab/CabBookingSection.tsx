import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { MOCK_CABS } from '../../data/cabData';
import { CabItem } from '../../types/travel';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  Sparkles,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleMapRouteView } from '../common/GoogleMapRouteView';

export const CabBookingSection: React.FC = () => {
  const { isAgentMode, t } = useTravel();

  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [pickupCity, setPickupCity] = useState('Delhi Airport (IGI T3)');
  const [dropCity, setDropCity] = useState('Jaipur City Center');
  const [pickupDate, setPickupDate] = useState('Today, 18 Oct');
  const [pickupTime, setPickupTime] = useState('10:30 AM');
  const [selectedCab, setSelectedCab] = useState<CabItem | null>(null);
  const [passengerName, setPassengerName] = useState('Vikram Malhotra');
  const [passengerMobile, setPassengerMobile] = useState('9871122334');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleBookCab = (cab: CabItem) => {
    setSelectedCab(cab);
    setBookingConfirmed(false);
  };

  const handleConfirmCab = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    setBookingConfirmed(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 pb-24 space-y-6">
      {/* Cab Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {t('आउटस्टेशन व एयरपोर्ट कैब्स', 'Outstation & Airport Cabs')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {t('सफ़रगो सत्यापित टैक्सी सेवा', 'Reliable Highway Cabs & Chauffeurs')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('डोरस्टेप पिकअप • टोल व टैक्स शामिल • कोई हिडन चार्ज नहीं', 'Doorstep pickup • Toll & State tax included • No hidden surge')}
            </p>
          </div>

          {/* Trip Type Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setTripType('oneway')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                tripType === 'oneway' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('एक तरफ (One-Way)', 'One-Way')}
            </button>
            <button
              onClick={() => setTripType('roundtrip')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                tripType === 'roundtrip' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('राउंड ट्रिप (Round-Trip)', 'Round-Trip')}
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t('पिकअप स्थान', 'Pickup Location')}
            </label>
            <input
              type="text"
              value={pickupCity}
              onChange={(e) => setPickupCity(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 mt-1 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              {t('ड्रॉप स्थान', 'Drop Location')}
            </label>
            <input
              type="text"
              value={dropCity}
              onChange={(e) => setDropCity(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 mt-1 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {t('तिथि', 'Pickup Date')}
            </label>
            <input
              type="text"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 mt-1 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {t('समय', 'Pickup Time')}
            </label>
            <input
              type="text"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 mt-1 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Google Maps Live Route Preview for Cabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            {t('📍 गूगल मैप्स लाइव रूट एवं दूरी (Route Corridor)', '📍 Google Maps Live Route Corridor')}
          </span>
          <span className="text-xs text-emerald-600 font-bold">
            {pickupCity} → {dropCity}
          </span>
        </div>
        <GoogleMapRouteView
          originCity={pickupCity}
          destinationCity={dropCity}
          vehicleType="cab"
          currentProgressPct={30}
          currentSpeedKmH={80}
          height="280px"
        />
      </div>

      {/* Available Cabs Listing */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg px-1 flex items-center gap-2">
          <Car className="w-5 h-5 text-emerald-600" />
          <span>{t('उपलब्ध गाड़ियां (Available Cabs)', 'Available Cabs for your Route')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_CABS.map((cab) => {
            const agentCommission = Math.round(cab.estimatedFare * 0.10);
            return (
              <div
                key={cab.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {cab.category}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1.5">{cab.carModel}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">₹{cab.estimatedFare}</span>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        (₹{cab.perKmRate}/km)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" /> {cab.passengerCapacity} {t('सवारियां', 'Seats')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-slate-400" /> {cab.luggageCapacity} {t('बैग', 'Bags')}
                    </span>
                    <span className="text-emerald-600 font-semibold">AC Included</span>
                  </div>

                  <ul className="mt-3 space-y-1 text-xs text-slate-600">
                    {cab.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isAgentMode ? (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      💰 {t('फिक्स एजेंट कमीशन', 'Comm')}: ₹19.34
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {t('यात्रा से 1 घंटा पहले तक मुफ्त कैंसिलेशन', 'Free cancellation up to 1 hr before')}
                    </span>
                  )}

                  <button
                    onClick={() => handleBookCab(cab)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20"
                  >
                    {t('कैब बुक करें', 'Book Cab')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cab Booking Modal */}
      {selectedCab && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            {!bookingConfirmed ? (
              <form onSubmit={handleConfirmCab} className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">{t('कैब बुकिंग विवरण', 'Confirm Cab Booking')}</h3>
                <p className="text-xs text-slate-500">{selectedCab.carModel} • {pickupCity} → {dropCity}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">पिकअप तिथि व समय:</span>
                    <span className="font-bold text-slate-900">{pickupDate} at {pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">कुल अनुमानित किराया:</span>
                    <span className="font-black text-emerald-700 text-sm">₹{selectedCab.estimatedFare}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('सवारी का नाम', 'Passenger Name')}</label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('मोबाइल नंबर', 'Mobile Number')}</label>
                  <input
                    type="tel"
                    required
                    value={passengerMobile}
                    onChange={(e) => setPassengerMobile(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCab(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30"
                  >
                    {t('कन्फर्म करें', 'Confirm & Book')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{t('कैब सफलतापूर्वक बुक हुई!', 'Cab Confirmed!')}</h3>
                <p className="text-xs text-slate-500">
                  {t('ड्राइवर विवरण और लाइव कार ट्रैकिंग लिंक SMS पर भेज दी गई है।', 'Driver details and live GPS tracking sent via SMS.')}
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
                  <p><span className="text-slate-400">गाड़ी:</span> <span className="font-bold text-slate-900">{selectedCab.carModel}</span></p>
                  <p><span className="text-slate-400">चालक:</span> <span className="font-bold text-slate-900">सुरेश कुमार (Rating 4.9 ★)</span></p>
                  <p><span className="text-slate-400">पिकअप:</span> <span className="font-bold text-slate-900">{pickupCity}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCab(null)}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-black transition"
                >
                  {t('ठीक है (Done)', 'Done')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
