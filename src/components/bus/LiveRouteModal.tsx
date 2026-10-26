import React, { useState, useEffect } from 'react';
import { BusItem } from '../../types/travel';
import { useTravel } from '../../context/TravelContext';
import {
  Navigation,
  Clock,
  MapPin,
  X,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Shield,
  Coffee,
  ChevronRight,
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { GoogleMapRouteView } from '../common/GoogleMapRouteView';
import { getGoogleMapsDirectionsUrl } from '../../lib/googleMaps';

interface LiveRouteModalProps {
  bus: BusItem;
  onClose: () => void;
  onSelectSeats?: () => void;
}

export const LiveRouteModal: React.FC<LiveRouteModalProps> = ({ bus, onClose, onSelectSeats }) => {
  const { t } = useTravel();
  const [activeTab, setActiveTab] = useState<'gmaps' | 'highway' | 'timeline'>('gmaps');
  const [liveSpeed, setLiveSpeed] = useState<number>(bus.liveTelemetry?.currentSpeedKmH || 72);

  // Realistic speed variation simulation (fluctuates between 68 and 76 km/h)
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 7) - 3;
      setLiveSpeed(prev => Math.min(82, Math.max(62, prev + variation)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const telemetry = bus.liveTelemetry || {
    currentSpeedKmH: 72,
    currentLocationName: `${bus.sourceCity} फोरलेन बायपास (किमी 45)`,
    nextStopName: bus.droppingPoints[0]?.name || `${bus.destinationCity} मेन स्टॉप`,
    nextStopEtaMinutes: 28,
    trafficStatus: 'smooth',
    totalDistanceKm: 195,
    coveredDistanceKm: 85
  };

  const waypoints = bus.liveRouteWaypoints && bus.liveRouteWaypoints.length > 0
    ? bus.liveRouteWaypoints
    : [
        { id: 'w1', stopName: bus.boardingPoints[0]?.name || `${bus.sourceCity} मुख्य स्टैंड`, time: bus.departureTime, status: 'passed' as const, landmark: 'प्रस्थान स्टेशन', distanceKm: 0 },
        { id: 'w2', stopName: 'हाईवे टोल प्लाजा एवं बायपास', time: '1 घंटे बाद', status: 'current' as const, landmark: 'वर्तमान लोकेशन • स्पीड 72 km/h', distanceKm: Math.round(telemetry.totalDistanceKm * 0.45) },
        { id: 'w3', stopName: 'मिडवे रेस्ट स्टॉप एवं ढाबा', time: '2 घंटे बाद', status: 'upcoming' as const, landmark: '10 मिनट चाय नाश्ता ब्रेक', distanceKm: Math.round(telemetry.totalDistanceKm * 0.65), haltDurationMinutes: 10 },
        { id: 'w4', stopName: bus.droppingPoints[0]?.name || `${bus.destinationCity} टर्मिनल`, time: bus.arrivalTime, status: 'upcoming' as const, landmark: 'गंतव्य स्टॉप', distanceKm: telemetry.totalDistanceKm }
      ];

  const progressPercent = Math.min(100, Math.round((telemetry.coveredDistanceKm / (telemetry.totalDistanceKm || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>{bus.sourceCity}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>{bus.destinationCity}</span>
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {t('लाइव जीपीएस', 'Live GPS')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {bus.operatorName} • {bus.busType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Telemetry Radar Dashboard */}
        <div className="bg-slate-900 p-3 sm:p-4 text-white grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 border-b border-slate-800">
          {/* Live Speed */}
          <div className="bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('लाइव स्पीड', 'Current Speed')}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-400">
                {liveSpeed} <span className="text-xs font-normal text-slate-300">km/h</span>
              </span>
            </div>
          </div>

          {/* Current Location */}
          <div className="bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('वर्तमान स्थिति', 'Live Location')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">
                {telemetry.currentLocationName}
              </span>
            </div>
          </div>

          {/* Next Stop & ETA */}
          <div className="bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('अगला स्टॉप ETA', 'Next Stop ETA')}
              </span>
              <span className="text-xs sm:text-sm font-black text-blue-400 truncate block">
                {telemetry.nextStopEtaMinutes} {t('मिनट में', 'mins')}
              </span>
            </div>
          </div>

          {/* Traffic & On-Time */}
          <div className="bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('शेड्यूल स्थिति', 'Schedule')}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400 block">
                🟢 {t('समय पर (On-Time)', 'On-Time')}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher (Google Maps vs Highway HUD vs Timeline) */}
        <div className="flex bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('gmaps')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'gmaps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{t('🗺️ Google Maps लाइव (Real Map)', '🗺️ Google Maps Live')}</span>
          </button>

          <button
            onClick={() => setActiveTab('highway')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'highway'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gauge className="w-4 h-4 text-emerald-600" />
            <span>{t('🛣️ हाईवे रडार HUD', 'Highway HUD')}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{t('⏱️ सभी स्टॉप्स व ठहराव', 'Stops Timeline')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {activeTab === 'gmaps' && (
            <div className="space-y-4">
              <GoogleMapRouteView
                originCity={bus.sourceCity}
                destinationCity={bus.destinationCity}
                operatorName={bus.operatorName}
                vehicleNumber={bus.busNumber}
                currentProgressPct={progressPercent}
                currentSpeedKmH={liveSpeed}
                stops={bus.boardingPoints}
                height="420px"
              />
            </div>
          )}

          {activeTab === 'highway' && (
            <div className="space-y-4">
              {/* Distance Progress Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{bus.sourceCity} (0 km)</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {telemetry.coveredDistanceKm} km {t('पूरा हुआ', 'covered')} • {telemetry.totalDistanceKm - telemetry.coveredDistanceKm} km {t('शेष', 'left')}
                  </span>
                  <span>{bus.destinationCity} ({telemetry.totalDistanceKm} km)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Graphical Highway Route Canvas */}
              <div className="bg-slate-950 rounded-3xl p-5 sm:p-7 border border-slate-800 text-white shadow-xl relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top Highway Label */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-extrabold text-white">राष्ट्रीय राजमार्ग कॉरिडोर (National Highway Corridor)</span>
                  </div>
                  <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono text-[11px]">
                    GPS Live Ping: 3s ago
                  </span>
                </div>

                {/* Animated Highway S-Curve / Waypoint Track */}
                <div className="relative z-10 my-8 py-4">
                  {/* Highway Line */}
                  <div className="relative w-full h-4 bg-slate-800 rounded-full flex items-center px-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg shadow-emerald-500/40 transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />

                    {/* Animated Pulsing Bus on Road */}
                    <div 
                      className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-700"
                      style={{ left: `${Math.max(8, Math.min(92, progressPercent))}%` }}
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/60 border-2 border-white animate-bounce">
                          🚌
                        </div>
                        <div className="absolute -inset-1 rounded-2xl bg-emerald-400 opacity-40 animate-ping pointer-events-none" />
                      </div>
                      <span className="mt-1 bg-slate-900/90 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-500/40 whitespace-nowrap shadow-md">
                        {liveSpeed} km/h • On Road
                      </span>
                    </div>
                  </div>

                  {/* Waypoint Markers Under Road */}
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {waypoints.slice(0, 4).map((wp, i) => (
                      <div key={wp.id} className="flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 mb-1.5 ${
                          wp.status === 'passed' 
                            ? 'bg-emerald-500 border-emerald-400' 
                            : wp.status === 'current' 
                            ? 'bg-amber-400 border-white ring-4 ring-amber-400/30' 
                            : 'bg-slate-700 border-slate-500'
                        }`} />
                        <span className="text-[11px] font-extrabold text-white truncate max-w-[150px]">
                          {wp.stopName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {wp.time}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                          wp.status === 'passed'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : wp.status === 'current'
                            ? 'text-amber-300 bg-amber-950/60'
                            : 'text-slate-400 bg-slate-800'
                        }`}>
                          {wp.status === 'passed' ? '✓ पार किया' : wp.status === 'current' ? '📍 वर्तमान' : '⏱️ अगला'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Highway Status Strip */}
                <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>ग्रीन हाईवे कॉरिडोर • नो रूट डायवर्जन</span>
                  </div>
                  <span>आगामी ढाबा स्टॉप: 25 मिनट (10 मिनट विश्राम)</span>
                </div>
              </div>
            </div>
                    )}

          {activeTab === 'timeline' && (
            /* Timeline View of All Stops */
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t('रूट के सभी स्टॉप्स और समय सारिणी', 'Route Stops & Scheduled Halts')}</span>
              </h3>

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 py-2">
                {waypoints.map((wp, index) => {
                  const isCurrent = wp.status === 'current';
                  const isPassed = wp.status === 'passed';

                  return (
                    <div key={wp.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isCurrent
                          ? 'bg-amber-500 border-white ring-4 ring-amber-100 text-white'
                          : isPassed
                          ? 'bg-emerald-600 border-white text-white'
                          : 'bg-white border-slate-400'
                      }`}>
                        {isPassed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                      </div>

                      {/* Content Card */}
                      <div className={`p-4 rounded-2xl border transition ${
                        isCurrent
                          ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                          : isPassed
                          ? 'bg-slate-50/60 border-slate-200'
                          : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                              {wp.stopName}
                            </span>
                            {wp.haltDurationMinutes && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                <Coffee className="w-3 h-3" /> {wp.haltDurationMinutes} {t('मिनट ठहराव', 'min halt')}
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {wp.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {wp.landmark} • {wp.distanceKm} km
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${wp.stopName}, ${bus.sourceCity}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition"
                          >
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            <span>{t('Google Maps पर स्टॉप देखें', 'View Stop on Google Maps')}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>

                        {isCurrent && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                            <span>{t('बस अभी यहाँ के निकट है (Live Location)', 'Bus is currently near this location')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-white p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t('किराया', 'Fare')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{bus.fare}
                <span className="text-xs text-slate-400 line-through ml-2">₹{bus.originalFare}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {bus.availableSeats} {t('सीटें शेष', 'seats left')}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={getGoogleMapsDirectionsUrl(bus.sourceCity, bus.destinationCity, 'driving')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>{t('Google Maps नेविगेशन', 'Google Navigation')}</span>
            </a>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition"
            >
              {t('बंद करें', 'Close')}
            </button>

            {onSelectSeats && (
              <button
                onClick={() => {
                  onClose();
                  onSelectSeats();
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>{t('सीट चुनें (Select Seats)', 'Select Seats')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
