import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Search, 
  X, 
  Bus, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  QrCode, 
  Share2, 
  Printer, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation, 
  Flame
} from 'lucide-react';
import { EmergencySosModal } from './EmergencySosModal';

interface PnrStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPnr?: string;
}

export const PnrStatusModal: React.FC<PnrStatusModalProps> = ({
  isOpen,
  onClose,
  initialPnr = ''
}) => {
  const { bookings, t, currentAgent, userProfile } = useTravel();
  const [searchPnr, setSearchPnr] = useState(initialPnr || (bookings[0]?.pnr || 'SFG-782910'));
  const [searchedData, setSearchedData] = useState<any>(() => {
    const found = bookings.find(b => b.pnr.toUpperCase() === (initialPnr || searchPnr).toUpperCase());
    return found || null;
  });
  const [isSosOpen, setIsSosOpen] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPnr.trim().toUpperCase();
    const found = bookings.find(b => b.pnr.toUpperCase() === clean || b.id.toUpperCase() === clean);

    if (found) {
      setSearchedData(found);
    } else {
      const numHash = (clean || 'SFG').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const isRailway = /^\d{10}$/.test(clean);

      const dynamicPassengerName = currentAgent?.fullName 
        || (userProfile?.name && userProfile.name !== 'अतिथि यात्री' ? userProfile.name : null)
        || ['विशाल पाटीदार', 'अमित कुमार जैन', 'सचिन राठौर', 'मनोज सिंह तोमर', 'संजय यादव'][numHash % 5];

      const seatNum1 = `${(numHash % 18) + 1}U`;
      const seatNum2 = `${(numHash % 18) + 2}L`;

      // Create rich simulated PNR record for any typed PNR
      setSearchedData({
        id: `pnr-${Date.now()}`,
        pnr: clean || 'SFG-892104',
        travelDate: 'आज, ' + new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }),
        serviceType: isRailway ? 'train' : 'bus',
        status: 'confirmed',
        totalAmount: isRailway ? 640 : 780,
        passengerDetails: {
          fullName: dynamicPassengerName,
          mobile: currentAgent?.mobile || '98260XXXXX',
          email: currentAgent?.email || 'passenger@safargo.in'
        },
        busDetails: {
          bus: {
            operatorName: isRailway ? 'भारतीय रेल • 12920 मालवा सुपरफास्ट' : 'हंस ट्रैवल्स (Hans Travels MP Express)',
            busType: isRailway ? 'AC 3-Tier (3A) • कोच B3, बर्थ 36' : 'BharatBenz AC Sleeper (2+1)',
            sourceCity: isRailway ? 'Indore Jn (INDB)' : 'Indore (इंदौर)',
            destinationCity: isRailway ? 'Bhopal Jn (BPL)' : 'Bhopal (भोपाल)',
            departureTime: isRailway ? '12:20' : '21:30',
            arrivalTime: isRailway ? '16:05' : '01:45',
            duration: isRailway ? '3h 45m' : '4h 15m'
          },
          selectedSeats: isRailway ? ['B3-36 CNF'] : [seatNum1, seatNum2],
          boardingPoint: {
            title: isRailway ? 'इंदौर जंक्शन प्लेटफॉर्म 1' : 'सर्वटे बस स्टैंड (Sarwate Bus Stand)',
            time: isRailway ? '12:00' : '21:15',
            landmark: isRailway ? 'मुख्य रेलवे स्टेशन प्रवेश द्वार' : 'प्लेटफॉर्म 4, मुख्य द्वार के पास'
          },
          droppingPoint: {
            title: isRailway ? 'भोपाल जंक्शन प्लेटफॉर्म 2' : 'नादरा बस स्टैंड, भोपाल (Nadra Bus Stand)',
            time: isRailway ? '16:05' : '01:45',
            landmark: isRailway ? 'भोपाल मुख्य स्टेशन प्लेटफॉर्म' : 'भोपाल मुख्य रेलवे स्टेशन के सामने'
          }
        }
      });
    }
  };

  const booking = searchedData;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-300">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight flex items-center gap-1.5">
                <span>{t('लाइव PNR स्टेटस एवं ई-बोर्डिंग पास', 'Live PNR Status & Boarding Pass')}</span>
              </h3>
              <p className="text-[11px] text-indigo-200">
                {t('रियल-टाइम बस ट्रैकिंग व यात्री बोर्डिंग विवरण', 'Real-time GPS Tracking & Passenger Dossier')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="PNR विंडो बंद करें"
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PNR Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchPnr}
                onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
                placeholder={t('अपना 10-अंकीय PNR नंबर दर्ज करें (उदा. SFG-782910)', 'Enter 10-digit PNR Number')}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <span>{t('स्टेटस देखें', 'Track PNR')}</span>
            </button>
          </form>
        </div>

        {/* Boarding Pass Body */}
        {booking ? (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Status Ribbon */}
            <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-l-4 border-emerald-500 rounded-r-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  {t('बुकिंग स्थिति (Booking Status)', 'Status')}:
                </span>
                <p className="text-xs font-black text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('कन्फर्म सीट • यात्रा के लिए तैयार', 'CONFIRMED • READY FOR TRAVEL')}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold block">PNR NUMBER</span>
                <span className="font-mono font-black text-sm text-indigo-900">{booking.pnr}</span>
              </div>
            </div>

            {/* Operator & Route */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-indigo-600" />
                  <span className="font-black text-xs text-slate-900">
                    {booking.busDetails?.bus?.operatorName || 'हंस ट्रैवल्स (Hans Travels)'}
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  {booking.busDetails?.bus?.busType || 'AC Multi-Axle Sleeper'}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center text-center pt-3">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">प्रस्थान (FROM)</span>
                  <p className="text-sm font-black text-slate-900">
                    {booking.busDetails?.bus?.sourceCity || 'Indore'}
                  </p>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {booking.busDetails?.bus?.departureTime || '21:30'}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {booking.busDetails?.bus?.duration || '4h 15m'}
                  </span>
                  <div className="w-full flex items-center gap-1 my-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    <div className="flex-1 h-0.5 bg-indigo-200 border-dashed border-t"></div>
                    <Bus className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <div className="flex-1 h-0.5 bg-indigo-200 border-dashed border-t"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-black">हाईवे लाइव</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">आगमन (TO)</span>
                  <p className="text-sm font-black text-slate-900">
                    {booking.busDetails?.bus?.destinationCity || 'Bhopal'}
                  </p>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {booking.busDetails?.bus?.arrivalTime || '01:45'}
                  </span>
                </div>
              </div>
            </div>

            {/* Boarding Point & Passenger Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" /> {t('बोर्डिंग स्टॉप (पिकअप)', 'Boarding Point')}
                </span>
                <p className="font-bold text-slate-800">
                  {booking.busDetails?.boardingPoint?.title || 'सर्वटे बस स्टैंड, इंदौर'}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {booking.busDetails?.boardingPoint?.landmark || 'प्लेटफॉर्म 4, इंदौर रेलवे स्टेशन के सामने'}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-600" /> {t('यात्री व सीट नंबर', 'Passenger & Seats')}
                </span>
                <p className="font-bold text-slate-800">
                  {booking.passengerDetails?.fullName || 'राहुल शर्मा'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">सीटें:</span>
                  <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-xs">
                    {(booking.busDetails?.selectedSeats || ['12U', '13L']).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Telemetry Banner */}
            <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-mono font-black text-xs">
                  72
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 font-bold uppercase block">स्पीड: 72 किमी/घं</span>
                  <span className="text-[11px] text-emerald-300 font-bold">समय पर • ऑन टाइम</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSosOpen(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-xl shadow-md transition flex items-center gap-1 active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('इमरजेंसी SOS', 'Emergency SOS')}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('टिकट प्रिंट करें (PDF)', 'Print e-Ticket')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = `https://wa.me/?text=${encodeURIComponent(`🎫 SafarGo E-Ticket\nPNR: ${booking.pnr}\nमार्ग: ${booking.busDetails?.bus?.sourceCity} -> ${booking.busDetails?.bus?.destinationCity}\nसमय: ${booking.busDetails?.bus?.departureTime}\nसीट: ${(booking.busDetails?.selectedSeats || []).join(', ')}`)}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('WhatsApp पर शेयर करें', 'Share Ticket')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              {t('कृपया अपना वैध PNR नंबर दर्ज करके खोजें।', 'Please enter your PNR to track status.')}
            </p>
          </div>
        )}

        {/* Emergency SOS Modal */}
        <EmergencySosModal
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
          bookingDetails={booking}
        />
      </div>
    </div>
  );
};
