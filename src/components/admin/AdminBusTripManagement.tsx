import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { BusTrip } from '../../types';
import {
  Bus,
  PlusCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';

export const AdminBusTripManagement: React.FC = () => {
  const { busTrips, addBusTrip, updateBusTrip, deleteBusTrip } = useData();
  const { success, error } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [operatorName, setOperatorName] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDate, setJourneyDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('21:00');
  const [arrivalTime, setArrivalTime] = useState('06:00');
  const [busType, setBusType] = useState('AC Sleeper / Seater 2+1');
  const [seaterFare, setSeaterFare] = useState<number>(650);
  const [sleeperFare, setSleeperFare] = useState<number>(950);
  const [availableSeater, setAvailableSeater] = useState<number>(15);
  const [availableSleeper, setAvailableSleeper] = useState<number>(20);
  const [boardingPointsStr, setBoardingPointsStr] = useState('Main Stand, Bypass Toll Plaza');
  const [dropPointsStr, setDropPointsStr] = useState('ISBT Main Terminal, Ring Road');
  const [notes, setNotes] = useState('Manually entered — verify with operator.');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorName.trim() || !source.trim() || !destination.trim()) {
      error('Validation Error', 'Operator name, source, and destination are required.');
      return;
    }

    setIsSaving(true);
    try {
      const bPoints = boardingPointsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const dPoints = dropPointsStr.split(',').map((s) => s.trim()).filter(Boolean);

      await addBusTrip({
        operator_name: operatorName.trim(),
        source: source.trim(),
        destination: destination.trim(),
        journey_date: journeyDate,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        bus_type: busType.trim(),
        seater_fare: seaterFare,
        sleeper_fare: sleeperFare,
        available_seater: availableSeater,
        available_sleeper: availableSleeper,
        boarding_points: bPoints,
        drop_points: dPoints,
        notes: notes.trim(),
        is_active: true,
      });

      setIsAddModalOpen(false);
      // Reset
      setOperatorName('');
      setSource('');
      setDestination('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            बस एवं सीट इन्वेंटरी प्रबंधन (Seater & Sleeper Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            मैनुअल रूट व किराए सूची • एडमिन द्वारा सीधे दर्ज किया गया डेटा
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          नया बस रूट जोड़ें (Add Trip)
        </button>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            अनिवार्य नियम (Business Rule - Manual Bus Booking):
          </p>
          <p className="leading-relaxed">
            यह कोई लाइव ऑटोमेटेड एग्रीगेटर नहीं है। यहाँ दर्ज सीटें और किराए केवल संदर्भ (Reference) के लिए हैं। प्रत्येक सीट पर स्पष्ट लेबल है: <strong>"Manually entered — verify with operator."</strong> जब तक एडमिन ऑपरेटर से पुष्टि नहीं करता, सीट आरक्षित नहीं मानी जाएगी।
          </p>
        </div>
      </div>

      {/* Bus Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {busTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider">
                    {trip.bus_type}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{trip.operator_name}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Route
                </span>
              </div>

              {/* Route & Times */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{trip.source}</span>
                  <span className="text-slate-400">➔</span>
                  <span>{trip.destination}</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Dep: <strong>{trip.departure_time}</strong></span>
                  <span>Arr: <strong>{trip.arrival_time}</strong></span>
                  <span>Date: <strong>{trip.journey_date}</strong></span>
                </div>
              </div>

              {/* Seater vs Sleeper Pricing & Count */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-900 block uppercase">सीटर (Seater)</span>
                  <span className="text-base font-black text-blue-900 block">₹{trip.seater_fare}</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5">
                    {trip.available_seater} Seats Listed
                  </span>
                </div>

                <div className="bg-orange-50/70 border border-orange-200 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold text-orange-900 block uppercase">स्लीपर (Sleeper)</span>
                  <span className="text-base font-black text-orange-900 block">₹{trip.sleeper_fare}</span>
                  <span className="text-[11px] text-orange-700 block mt-0.5">
                    {trip.available_sleeper} Berths Listed
                  </span>
                </div>
              </div>

              {/* Verified Disclaimer Tag */}
              <div className="bg-amber-100/60 text-amber-900 p-2.5 rounded-xl text-[11px] font-medium border border-amber-200/80">
                ⚠️ Manually entered — verify with operator.
              </div>
            </div>

            {/* Delete button */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => deleteBusTrip(trip.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Route
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bus Trip Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-orange-500">Manual Inventory Desk</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">नया बस रूट विवरण जोड़ें</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bus / Operator Name</label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Hans Travels / Gujarat Travels"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bus Type</label>
                  <input
                    type="text"
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    placeholder="e.g. BharatBenz AC Sleeper (2+1)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source City (कहाँ से)</label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Lucknow"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination City (कहाँ तक)</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Delhi (Kashmere Gate)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Journey Date</label>
                  <input
                    type="date"
                    required
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Departure</label>
                    <input
                      type="text"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="21:30"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Arrival</label>
                    <input
                      type="text"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      placeholder="06:00"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Seats */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seater Fare (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={seaterFare}
                    onChange={(e) => setSeaterFare(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Seater</label>
                  <input
                    type="number"
                    min={0}
                    value={availableSeater}
                    onChange={(e) => setAvailableSeater(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sleeper Fare (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={sleeperFare}
                    onChange={(e) => setSleeperFare(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Sleeper</label>
                  <input
                    type="number"
                    min={0}
                    value={availableSleeper}
                    onChange={(e) => setAvailableSleeper(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Boarding Points (Comma separated)
                </label>
                <input
                  type="text"
                  value={boardingPointsStr}
                  onChange={(e) => setBoardingPointsStr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Drop Points (Comma separated)
                </label>
                <input
                  type="text"
                  value={dropPointsStr}
                  onChange={(e) => setDropPointsStr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Add Route to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
