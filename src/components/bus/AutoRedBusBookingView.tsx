import React, { useState } from 'react';
import { BusTrip, Booking, SeatCategory } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RedBusSeatMapModal, SelectedSeatItem } from './RedBusSeatMapModal';
import { AutoBusBookingCheckoutModal } from './AutoBusBookingCheckoutModal';
import {
  Bus,
  Search,
  MapPin,
  Calendar,
  Repeat,
  Zap,
  Coffee,
  Wifi,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface AutoRedBusBookingViewProps {
  onBookingSuccess: (booking: Booking) => void;
  onSwitchToManual?: () => void;
}

export const AutoRedBusBookingView: React.FC<AutoRedBusBookingViewProps> = ({
  onBookingSuccess,
  onSwitchToManual,
}) => {
  const { busTrips, agentWalletBalance } = useData();
  const { role } = useAuth();

  const [searchSource, setSearchSource] = useState('Bhopal');
  const [searchDestination, setSearchDestination] = useState('Indore');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'ac' | 'seater' | 'sleeper'>('all');

  const [selectedTripForSeatMap, setSelectedTripForSeatMap] = useState<BusTrip | null>(null);
  const [autoCheckoutData, setAutoCheckoutData] = useState<{
    trip: BusTrip;
    selectedSeats: SelectedSeatItem[];
    totalFare: number;
    seatCategory: SeatCategory;
    boardingPoint: string;
    dropPoint: string;
  } | null>(null);

  const handleSwap = () => {
    const temp = searchSource;
    setSearchSource(searchDestination);
    setSearchDestination(temp);
  };

  const filteredBuses = (busTrips || []).filter((trip) => {
    const matchSrc = trip.source.toLowerCase().includes(searchSource.toLowerCase().trim());
    const matchDst = trip.destination.toLowerCase().includes(searchDestination.toLowerCase().trim());
    if (!matchSrc || !matchDst) return false;

    if (filterType === 'ac') {
      return trip.bus_type.toLowerCase().includes('ac') || trip.bus_type.toLowerCase().includes('a/c');
    }
    if (filterType === 'seater') {
      return trip.available_seater > 0;
    }
    if (filterType === 'sleeper') {
      return trip.available_sleeper > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-red-600 shadow-sm">
                RedBus Inspired Architecture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                ⚡ 100% ऑटोमैटिक बस टिकटिंग
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              लाइव सीट चयन (Seater व Sleeper) और ऑटोमैटिक टिकट कन्फर्मेशन
            </h1>
            <p className="text-xs text-red-100 max-w-xl">
              बैठने वाली (Seater) कुर्सी और सोने वाली (Sleeper) बर्थ का लाइव सीट मैप देखकर टिकट बुक करें। एजेंट वॉलेट से 1-क्लिक में सुरक्षित तुरंत पेमेंट और PNR जारी!
            </p>
          </div>

          {role === 'agent' && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-right shrink-0">
              <span className="text-[10px] text-red-100 uppercase font-bold block">एजेंट वॉलेट बैलेंस</span>
              <strong className="text-xl font-black text-amber-300 font-mono">
                ₹{agentWalletBalance.toFixed(2)}
              </strong>
              <span className="text-[10px] text-emerald-200 block font-bold mt-0.5">
                +₹19.34 प्रति टिकट कमीशन
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RedBus-Inspired Search Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
          {/* From */}
          <div className="sm:col-span-4">
            <label className="block font-bold text-slate-700 mb-1">कहाँ से (From City) *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                placeholder="उदा. Bhopal / Sironj"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Swap */}
          <div className="sm:col-span-1 flex items-center justify-center my-0.5 sm:my-0 sm:pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 transition cursor-pointer shadow-xs active:rotate-180"
              title="रूट बदलें (Swap)"
            >
              <Repeat className="w-4 h-4 text-red-600 shrink-0" />
            </button>
          </div>

          {/* To */}
          <div className="sm:col-span-4">
            <label className="block font-bold text-slate-700 mb-1">कहाँ तक (To Destination) *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                placeholder="उदा. Indore / Pune"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Date */}
          <div className="sm:col-span-3">
            <label className="block font-bold text-slate-700 mb-1">यात्रा तारीख (Journey Date) *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-slate-500 text-[11px] font-bold shrink-0 mr-1">फिल्टर:</span>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              सभी बसें
            </button>
            <button
              type="button"
              onClick={() => setFilterType('ac')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'ac'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>❄️ A/C बसें</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('seater')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'seater'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>💺 सीटर (बैठने वाले)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('sleeper')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterType === 'sleeper'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🛏️ स्लीपर (सोने वाले)</span>
            </button>
          </div>

          {onSwitchToManual && (
            <button
              type="button"
              onClick={onSwitchToManual}
              className="text-orange-600 font-bold hover:underline shrink-0 text-xs hidden sm:inline"
            >
              📝 या पुराना मैनुअल फॉर्म भरें ➔
            </button>
          )}
        </div>
      </div>

      {/* Bus Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600">
            उपलब्ध बसें ({filteredBuses.length}) • RedBus Live Inventory
          </span>
          <span className="text-slate-400">
            सीट चुनने के लिए बस कार्ड पर "सीटें चुनें" पर क्लिक करें
          </span>
        </div>

        {filteredBuses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <Bus className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">इस रूट पर कोई सीधी बस नहीं मिली</h3>
            <p className="text-xs text-slate-500">
              कृपया भोपाल ➔ इंदौर, इंदौर ➔ पुणे आदि लोकप्रिय मार्ग खोजें।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuses.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-xl transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900 text-base flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-red-600" />
                        {trip.operator_name}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {trip.bus_type}
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                      ⭐ 4.6
                    </span>
                  </div>

                  {/* Route & Times */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">प्रस्थान</span>
                      <span className="font-black text-slate-900 text-sm">{trip.departure_time}</span>
                      <span className="text-[11px] text-slate-600 block truncate max-w-[100px]">{trip.source}</span>
                    </div>

                    <div className="text-center px-2">
                      <span className="text-[9px] text-slate-400 font-mono block">➔</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                        एक्सप्रेस
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">पहुंच</span>
                      <span className="font-black text-slate-900 text-sm">{trip.arrival_time}</span>
                      <span className="text-[11px] text-slate-600 block truncate max-w-[100px]">{trip.destination}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Zap className="w-3 h-3 text-amber-500" /> Live GPS
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Coffee className="w-3 h-3 text-emerald-600" /> पानी बोतल
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Wifi className="w-3 h-3 text-indigo-500" /> वाई-फाई
                    </span>
                  </div>

                  {/* Seater & Sleeper Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200">
                      <span className="text-[10px] font-bold text-orange-800 flex items-center gap-1">
                        💺 बैठने वाली (Seater)
                      </span>
                      <div className="font-black text-slate-900 text-sm mt-0.5">
                        ₹{trip.seater_fare}
                      </div>
                      <span className="text-[9px] text-emerald-700 font-semibold">
                        {trip.available_seater} सीटें उपलब्ध
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1">
                        🛏️ सोने वाली (Sleeper)
                      </span>
                      <div className="font-black text-slate-900 text-sm mt-0.5">
                        ₹{trip.sleeper_fare}
                      </div>
                      <span className="text-[9px] text-emerald-700 font-semibold">
                        {trip.available_sleeper} स्लीपर उपलब्ध
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seat Map CTA */}
                <button
                  type="button"
                  onClick={() => setSelectedTripForSeatMap(trip)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Bus className="w-4 h-4" />
                  <span>सीटें चुनें व ऑटोमैटिक बुक करें (Select Seats ▾)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RedBus Interactive Seat Selection Modal */}
      {selectedTripForSeatMap && (
        <RedBusSeatMapModal
          trip={selectedTripForSeatMap}
          onClose={() => setSelectedTripForSeatMap(null)}
          onConfirmSelection={({ selectedSeats, totalFare, seatCategory, boardingPoint, dropPoint }) => {
            setAutoCheckoutData({
              trip: selectedTripForSeatMap,
              selectedSeats,
              totalFare,
              seatCategory,
              boardingPoint,
              dropPoint,
            });
            setSelectedTripForSeatMap(null);
          }}
        />
      )}

      {/* RedBus Inspired Automatic Instant Booking Checkout Modal */}
      {autoCheckoutData && (
        <AutoBusBookingCheckoutModal
          isOpen={true}
          onClose={() => setAutoCheckoutData(null)}
          trip={autoCheckoutData.trip}
          selectedSeats={autoCheckoutData.selectedSeats}
          totalFare={autoCheckoutData.totalFare}
          seatCategory={autoCheckoutData.seatCategory}
          boardingPoint={autoCheckoutData.boardingPoint}
          dropPoint={autoCheckoutData.dropPoint}
          onBookingSuccess={(confirmed) => {
            setAutoCheckoutData(null);
            onBookingSuccess(confirmed);
          }}
        />
      )}
    </div>
  );
};
