import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { HotelItem, HotelRoom } from '../../types/travel';
import { 
  Star, 
  MapPin, 
  Wifi, 
  Coffee, 
  Waves, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles, 
  ChevronRight,
  CreditCard,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HotelList: React.FC = () => {
  const { 
    hotels, 
    hotelCity, 
    checkInDate, 
    checkOutDate, 
    guestsCount, 
    confirmHotelBooking, 
    isAgentMode, 
    latestBooking,
    t 
  } = useTravel();

  const [filterType, setFilterType] = useState<'all' | '5star' | 'breakfast' | 'pool'>('all');
  const [bookingModalHotel, setBookingModalHotel] = useState<HotelItem | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [guestName, setGuestName] = useState('Ankit Sharma');
  const [guestMobile, setGuestMobile] = useState('9812345678');
  const [guestEmail, setGuestEmail] = useState('ankit.sharma@example.com');
  const [bookingDone, setBookingDone] = useState(false);

  const matchedHotels = hotels.filter((h) => {
    const matchesCity = h.city.toLowerCase() === hotelCity.toLowerCase();
    if (filterType === '5star') return matchesCity && h.starCategory === 5;
    if (filterType === 'breakfast') return matchesCity && h.freeBreakfast;
    if (filterType === 'pool') return matchesCity && h.amenities.includes('Swimming Pool');
    return matchesCity;
  });

  const displayHotels = matchedHotels.length > 0 ? matchedHotels : hotels;

  const handleOpenBookingModal = (hotel: HotelItem) => {
    setBookingModalHotel(hotel);
    setSelectedRoom(hotel.rooms[0] || null);
    setBookingDone(false);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalHotel) return;

    confirmHotelBooking('upi', {
      fullName: guestName,
      mobile: guestMobile,
      email: guestEmail
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setBookingDone(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{hotelCity} {t('में शीर्ष होटल्स', 'Hotels')}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {displayHotels.length} {t('सत्यापित विकल्प', 'properties')}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {checkInDate} - {checkOutDate} • {guestsCount} {t('अतिथि', 'guests')}
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('सभी होटल्स', 'All')}
          </button>
          <button
            onClick={() => setFilterType('5star')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === '5star' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            5-Star Luxury
          </button>
          <button
            onClick={() => setFilterType('breakfast')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'breakfast' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('मुफ्त नाश्ता (Free Breakfast)', 'Free Breakfast')}
          </button>
          <button
            onClick={() => setFilterType('pool')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'pool' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Swimming Pool
          </button>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="space-y-5">
        {displayHotels.map((hotel) => {
          const agentCommission = Math.round(hotel.pricePerNight * 0.10);
          return (
            <div
              key={hotel.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 grid grid-cols-1 md:grid-cols-12"
            >
              {/* Hotel Image & Star badge */}
              <div className="md:col-span-5 relative h-56 md:h-auto min-h-[200px]">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{hotel.starCategory} Star</span>
                  </span>
                  {hotel.freeBreakfast && (
                    <span className="bg-emerald-700/90 backdrop-blur-md text-white font-bold text-[10px] px-2 py-1 rounded-full">
                      Free Breakfast
                    </span>
                  )}
                </div>

                {/* Agent Commission Tag */}
                {isAgentMode && (
                  <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                    💰 {t('फिक्स एजेंट कमीशन', 'Fixed Agent Comm')}: ₹19.34 / booking
                  </div>
                )}
              </div>

              {/* Hotel Details Content */}
              <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {hotel.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{hotel.area}, {hotel.city}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{hotel.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {hotel.reviewCount} {t('समीक्षाएं', 'reviews')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="text-[11px] text-slate-400 px-1 py-0.5">
                        +{hotel.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through">₹{hotel.originalPrice}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        50% OFF
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ₹{hotel.pricePerNight}
                      <span className="text-xs font-normal text-slate-500"> / {t('प्रति रात', 'night')}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      + ₹{Math.round(hotel.pricePerNight * 0.12)} {t('टैक्स व शुल्क', 'taxes & fees')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBookingModal(hotel)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <span>{t('रूम बुक करें', 'Book Room')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instant Hotel Booking Modal */}
      {bookingModalHotel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBookingModalHotel(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingDone ? (
              <div>
                <h3 className="text-lg font-black text-slate-900">{t('होटल रूम बुकिंग', 'Hotel Room Reservation')}</h3>
                <p className="text-xs text-slate-500">{bookingModalHotel.name} • {bookingModalHotel.city}</p>

                <form onSubmit={handleConfirmReservation} className="mt-4 space-y-4">
                  {/* Room Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('रूम का प्रकार चुनें', 'Choose Room Type')}</label>
                    <div className="space-y-2">
                      {bookingModalHotel.rooms.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            selectedRoom?.id === room.id ? 'border-emerald-600 bg-emerald-50/60' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-xs text-slate-900">{room.name}</p>
                              <p className="text-[11px] text-slate-500">{room.bedType} • Max {room.maxGuests} Guests</p>
                            </div>
                            <span className="font-black text-sm text-emerald-700">₹{room.pricePerNight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates & Guests */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block">{t('चेक-इन', 'Check-In')}</span>
                      <span className="font-bold text-slate-900">{checkInDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('चेक-आउट', 'Check-Out')}</span>
                      <span className="font-bold text-slate-900">{checkOutDate}</span>
                    </div>
                  </div>

                  {/* Guest Contact Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('मुख्य अतिथि का नाम', 'Guest Full Name')}</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('मोबाइल नंबर', 'Mobile Number')}</label>
                        <input
                          type="tel"
                          required
                          value={guestMobile}
                          onChange={(e) => setGuestMobile(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('ईमेल पता', 'Email Address')}</label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">{t('कुल देय (2 रातें)', 'Total (2 Nights)')}:</span>
                      <p className="text-lg font-black text-slate-900">
                        ₹{(selectedRoom ? selectedRoom.pricePerNight : bookingModalHotel.pricePerNight) * 2}
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/30"
                    >
                      {t('तुरंत कन्फर्म करें', 'Instant Confirm & Book')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Booking Successful Voucher */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{t('होटल वाउचर कन्फर्म हो गया!', 'Hotel Voucher Confirmed!')}</h3>
                <p className="text-xs text-slate-500">
                  {t('पुष्टि SMS और होटल चेक-इन वाउचर WhatsApp पर भेज दिया गया है।', 'Confirmation SMS & Hotel voucher sent on WhatsApp.')}
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">होटल:</span>
                    <span className="font-bold text-slate-900">{bookingModalHotel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">अतिथि:</span>
                    <span className="font-bold text-slate-900">{guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">तिथियां:</span>
                    <span className="font-bold text-slate-900">{checkInDate} - {checkOutDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">स्थिति:</span>
                    <span className="font-bold text-emerald-700">100% Guaranteed Check-in</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingModalHotel(null)}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-black transition"
                >
                  {t('बंद करें', 'Close')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
