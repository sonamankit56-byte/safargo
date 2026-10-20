import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Plane, 
  Search, 
  Calendar, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Luggage, 
  Clock, 
  Sparkles, 
  Award, 
  X, 
  ChevronRight, 
  QrCode, 
  Printer, 
  Share2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlightItem {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  logo: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  fare: number;
  agentCommission: number;
  seatsLeft: number;
  cabinBag: string;
  checkInBag: string;
}

const AIRPORTS = [
  { code: 'IDR', city: 'Indore (देवी अहिल्याबाई होल्कर एयरपोर्ट)', state: 'MP' },
  { code: 'BHO', city: 'Bhopal (राजा भोज इंटरनेशनल एयरपोर्ट)', state: 'MP' },
  { code: 'GWL', city: 'Gwalior (राजमाता विजयाराजे सिंधिया एयरपोर्ट)', state: 'MP' },
  { code: 'JLR', city: 'Jabalpur (डुमना एयरपोर्ट)', state: 'MP' },
  { code: 'DEL', city: 'New Delhi (इन्दिरा गांधी इंटरनेशनल एयरपोर्ट - T3)', state: 'Delhi' },
  { code: 'BOM', city: 'Mumbai (छत्रपति शिवाजी महाराज T2)', state: 'Maharashtra' },
  { code: 'BLR', city: 'Bengaluru (केम्पेगौड़ा इंटरनेशनल T1)', state: 'Karnataka' },
  { code: 'GOI', city: 'Goa (दाबोलिम / मोपा इंटरनेशनल)', state: 'Goa' },
  { code: 'AMD', city: 'Ahmedabad (सरदार वल्लभभाई पटेल T1)', state: 'Gujarat' },
  { code: 'HYD', city: 'Hyderabad (राजीव गांधी इंटरनेशनल)', state: 'Telangana' }
];

export const FlightBookingScreen: React.FC = () => {
  const { t, agentWalletBalance } = useTravel();
  const [fromAirport, setFromAirport] = useState('IDR');
  const [toAirport, setToAirport] = useState('DEL');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tripType, setTripType] = useState<'oneway' | 'round'>('oneway');
  const [travelClass, setTravelClass] = useState('economy');
  const [passengers, setPassengers] = useState(1);

  // Booking states
  const [selectedFlight, setSelectedFlight] = useState<FlightItem | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>('12A');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [bookingPnr, setBookingPnr] = useState('');

  const generateFlights = (): FlightItem[] => {
    const fromCity = AIRPORTS.find(a => a.code === fromAirport)?.city.split(' ')[0] || 'Indore';
    const toCity = AIRPORTS.find(a => a.code === toAirport)?.city.split(' ')[0] || 'Delhi';

    return [
      {
        id: 'fl-6e-2104',
        airline: 'IndiGo Airlines',
        airlineCode: '6E',
        flightNumber: '6E 2104',
        logo: '✈️ 6E',
        fromCode: fromAirport,
        fromCity,
        toCode: toAirport,
        toCity,
        departureTime: '07:15',
        arrivalTime: '08:35',
        duration: '1h 20m',
        stops: 'Non-stop (सीधी उड़ान)',
        fare: 3199,
        agentCommission: 150,
        seatsLeft: 6,
        cabinBag: '7 kg',
        checkInBag: '15 kg'
      },
      {
        id: 'fl-ai-634',
        airline: 'Air India',
        airlineCode: 'AI',
        flightNumber: 'AI 634',
        logo: '🇮🇳 AI',
        fromCode: fromAirport,
        fromCity,
        toCode: toAirport,
        toCity,
        departureTime: '11:45',
        arrivalTime: '13:10',
        duration: '1h 25m',
        stops: 'Non-stop (सीधी उड़ान)',
        fare: 3840,
        agentCommission: 150,
        seatsLeft: 9,
        cabinBag: '7 kg',
        checkInBag: '15 kg + फ्री मील'
      },
      {
        id: 'fl-qp-1342',
        airline: 'Akasa Air',
        airlineCode: 'QP',
        flightNumber: 'QP 1342',
        logo: '🟠 QP',
        fromCode: fromAirport,
        fromCity,
        toCode: toAirport,
        toCity,
        departureTime: '16:20',
        arrivalTime: '17:40',
        duration: '1h 20m',
        stops: 'Non-stop (सीधी उड़ान)',
        fare: 2799,
        agentCommission: 150,
        seatsLeft: 3,
        cabinBag: '7 kg',
        checkInBag: '15 kg'
      },
      {
        id: 'fl-sg-8192',
        airline: 'SpiceJet Express',
        airlineCode: 'SG',
        flightNumber: 'SG 8192',
        logo: '🌶️ SG',
        fromCode: fromAirport,
        fromCity,
        toCode: toAirport,
        toCity,
        departureTime: '20:50',
        arrivalTime: '22:15',
        duration: '1h 25m',
        stops: 'Non-stop (सीधी उड़ान)',
        fare: 2950,
        agentCommission: 150,
        seatsLeft: 4,
        cabinBag: '7 kg',
        checkInBag: '15 kg'
      }
    ];
  };

  const flights = generateFlights();

  const handleConfirmFlightBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !passengerPhone) {
      alert('कृपया यात्री का नाम और मोबाइल नंबर भरें');
      return;
    }

    const pnr = `SFG-AIR-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingPnr(pnr);
    setIsBooked(true);

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* Flight Search Card */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-300">
                <Plane className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {t('सफ़रगो एयरलाइंस • घरेलू उड़ानें', 'SafarGo Flights • Domestic Airfare')}
                </h1>
                <p className="text-xs text-sky-200">
                  {t('मध्य प्रदेश के सभी हवाई अड्डों से सबसे कम किराए की गारंटी', 'Lowest Airfare from all MP Airports')}
                </p>
              </div>
            </div>

            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
              ⚡ एजेंट फ्लैट ₹150 कमीशन / टिकट
            </span>
          </div>

          {/* Search Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1">
                {t('कहाँ से (From Airport)', 'From Airport')}
              </label>
              <select
                value={fromAirport}
                onChange={(e) => setFromAirport(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-sky-300/30 rounded-xl text-xs font-bold text-white focus:outline-none focus:bg-slate-900"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code} className="text-slate-900">
                    {a.code} - {a.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1">
                {t('कहाँ तक (To Airport)', 'To Airport')}
              </label>
              <select
                value={toAirport}
                onChange={(e) => setToAirport(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-sky-300/30 rounded-xl text-xs font-bold text-white focus:outline-none focus:bg-slate-900"
              >
                {AIRPORTS.filter(a => a.code !== fromAirport).map((a) => (
                  <option key={a.code} value={a.code} className="text-slate-900">
                    {a.code} - {a.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1">
                {t('यात्रा तिथि (Travel Date)', 'Travel Date')}
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 border border-sky-300/30 rounded-xl text-xs font-bold text-white focus:outline-none focus:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-sky-200 mb-1">
                {t('यात्री व क्लास (Travelers)', 'Travelers & Class')}
              </label>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 border border-sky-300/30 rounded-xl text-xs font-bold text-white focus:outline-none focus:bg-slate-900"
              >
                <option value="economy" className="text-slate-900">1 Adult, Economy</option>
                <option value="premium" className="text-slate-900">1 Adult, Premium Economy</option>
                <option value="business" className="text-slate-900">1 Adult, Business Class</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Available Flights List */}
      {!selectedFlight && !isBooked && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span>उपलब्ध उड़ानें: {fromAirport} ➔ {toAirport}</span>
              <span className="text-xs text-slate-500 font-semibold">({flights.length} उड़ानें मिलीं)</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              100% On-Time Price Guarantee
            </span>
          </div>

          <div className="space-y-3">
            {flights.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200 transition group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Airline & Flight Number */}
                <div className="flex items-center gap-3 md:w-1/4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-black text-sm text-indigo-700 shrink-0">
                    {f.logo}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition">
                      {f.airline}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">{f.flightNumber}</span>
                  </div>
                </div>

                {/* Timings & Duration */}
                <div className="flex items-center justify-between md:justify-center gap-6 md:w-1/3 text-center">
                  <div className="text-left md:text-center">
                    <span className="text-base font-black text-slate-900">{f.departureTime}</span>
                    <span className="text-[11px] text-slate-500 font-bold block">{f.fromCode}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold">{f.duration}</span>
                    <div className="w-20 sm:w-28 flex items-center gap-1 my-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                      <div className="flex-1 h-0.5 bg-indigo-200 border-t border-dashed"></div>
                      <Plane className="w-3.5 h-3.5 text-indigo-600" />
                      <div className="flex-1 h-0.5 bg-indigo-200 border-t border-dashed"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">{f.stops}</span>
                  </div>

                  <div className="text-right md:text-center">
                    <span className="text-base font-black text-slate-900">{f.arrivalTime}</span>
                    <span className="text-[11px] text-slate-500 font-bold block">{f.toCode}</span>
                  </div>
                </div>

                {/* Baggage Inclusions */}
                <div className="hidden lg:flex flex-col text-[11px] text-slate-500 gap-1 md:w-1/5">
                  <span className="flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5 text-slate-400" /> केबिन: {f.cabinBag}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> चेक-इन: {f.checkInBag}
                  </span>
                </div>

                {/* Fare & Book Button */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:w-1/5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div>
                    <span className="text-lg font-black text-slate-900">₹{f.fare.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      कमीशन: +₹{f.agentCommission}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFlight(f)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1"
                  >
                    <span>सीट चुनें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flight Seat Layout & Passenger Form Modal */}
      {selectedFlight && !isBooked && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <span>{selectedFlight.airline} • {selectedFlight.flightNumber}</span>
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                  {selectedFlight.fromCode} ➔ {selectedFlight.toCode}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                प्रस्थान: {selectedFlight.departureTime} | कुल किराया: ₹{selectedFlight.fare} (कमीशन ₹{selectedFlight.agentCommission})
              </p>
            </div>

            <button
              onClick={() => setSelectedFlight(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Airplane Seat Picker */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                💺 एयरक्राफ्ट सीट चुनें (Select Aircraft Seat)
              </span>

              <div className="space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 px-2">
                  <span>A (खिड़की)</span>
                  <span>B (बीच)</span>
                  <span>C (रास्ता)</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span>D (रास्ता)</span>
                  <span>E (बीच)</span>
                  <span>F (खिड़की)</span>
                </div>

                {['10', '11', '12', '13', '14'].map((row) => (
                  <div key={row} className="flex justify-between items-center gap-1">
                    {['A', 'B', 'C'].map((col) => {
                      const seat = `${row}${col}`;
                      const isSel = selectedSeat === seat;
                      return (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => setSelectedSeat(seat)}
                          className={`w-8 h-8 rounded-lg font-mono font-bold text-[10px] transition ${
                            isSel
                              ? 'bg-indigo-600 text-white shadow-md scale-105'
                              : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                    <span className="w-4 text-center font-mono text-[10px] text-slate-400">{row}</span>
                    {['D', 'E', 'F'].map((col) => {
                      const seat = `${row}${col}`;
                      const isSel = selectedSeat === seat;
                      return (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => setSelectedSeat(seat)}
                          className={`w-8 h-8 rounded-lg font-mono font-bold text-[10px] transition ${
                            isSel
                              ? 'bg-indigo-600 text-white shadow-md scale-105'
                              : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
                <span className="text-xs text-indigo-900 font-bold">
                  चुनी गई सीट: <strong className="font-mono text-indigo-700">{selectedSeat} (Window / Aisle)</strong>
                </span>
              </div>
            </div>

            {/* Passenger Form */}
            <form onSubmit={handleConfirmFlightBooking} className="space-y-4 text-xs">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                👤 यात्री विवरण (Passenger Details)
              </span>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  पूरा नाम (सरकारी आईडी के अनुसार) *
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  10-अंकीय मोबाइल नंबर (SMS ई-टिकट हेतु) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>टिकट किराया:</span>
                  <span>₹{selectedFlight.fare}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-700">
                  <span>एजेंट कमीशन (क्रेडिट होगा):</span>
                  <span>+₹{selectedFlight.agentCommission}.00</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plane className="w-4 h-4" />
                <span>उड़ान टिकट कन्फर्म करें (₹{selectedFlight.fare})</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Flight Booking Success & Boarding Pass */}
      {isBooked && selectedFlight && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-emerald-400 max-w-xl mx-auto space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
              BOARDING PASS ISSUED • CONFIRMED
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-3">
              फ्लाइट टिकट सफलतापूर्वक बुक हुआ!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              PNR: <strong className="font-mono text-indigo-700 text-sm">{bookingPnr}</strong>
            </p>
          </div>

          {/* Boarding Card Ticket */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl text-left space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-800">
              <span className="font-black text-sm">{selectedFlight.airline}</span>
              <span className="font-mono text-xs text-amber-300 font-bold">{selectedFlight.flightNumber}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <span className="text-[10px] text-slate-400">यात्री (PASSENGER)</span>
                <p className="font-black text-sm text-white">{passengerName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">सीट (SEAT)</span>
                <p className="font-mono font-black text-base text-amber-300">{selectedSeat}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-indigo-800 text-xs">
              <span>{selectedFlight.fromCode} ({selectedFlight.departureTime})</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span>{selectedFlight.toCode} ({selectedFlight.arrivalTime})</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>बोर्डिंग पास प्रिंट करें</span>
            </button>
            <button
              onClick={() => {
                setIsBooked(false);
                setSelectedFlight(null);
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              नई उड़ान खोजें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
