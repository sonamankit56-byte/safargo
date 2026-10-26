import React, { useState } from 'react';
import { 
  getGoogleMapsApiKey, 
  getGoogleMapsDirectionsUrl, 
  getGoogleMapsEmbedUrl, 
  getCityCoordinates,
  calculateLivePosition,
  LatLng 
} from '../../lib/googleMaps';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin 
} from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  ExternalLink, 
  Layers, 
  Maximize2, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface StopPoint {
  id: string;
  name: string;
  time?: string;
  address?: string;
  landmark?: string;
}

interface GoogleMapRouteViewProps {
  originCity: string;
  destinationCity: string;
  vehicleType?: 'bus' | 'cab';
  vehicleNumber?: string;
  operatorName?: string;
  currentProgressPct?: number; // 0 to 100
  currentSpeedKmH?: number;
  stops?: StopPoint[];
  height?: string;
  className?: string;
}

export const GoogleMapRouteView: React.FC<GoogleMapRouteViewProps> = ({
  originCity,
  destinationCity,
  vehicleType = 'bus',
  vehicleNumber,
  operatorName,
  currentProgressPct = 45,
  currentSpeedKmH = 72,
  stops = [],
  height = '360px',
  className = ''
}) => {
  const apiKey = getGoogleMapsApiKey();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [activeStop, setActiveStop] = useState<StopPoint | null>(null);

  const originCoords: LatLng = getCityCoordinates(originCity);
  const destCoords: LatLng = getCityCoordinates(destinationCity);
  const liveCoords: LatLng = calculateLivePosition(originCoords, destCoords, currentProgressPct);

  // Center the map mid-way between origin and destination
  const mapCenter: LatLng = {
    lat: (originCoords.lat + destCoords.lat) / 2,
    lng: (originCoords.lng + destCoords.lng) / 2
  };

  const navUrl = getGoogleMapsDirectionsUrl(originCity, destinationCity, 'driving');
  const embedUrl = getGoogleMapsEmbedUrl(originCity, destinationCity, apiKey);

  return (
    <div className={`relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/80 shadow-xl flex flex-col ${className}`}>
      {/* Top Map HUD Bar */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Navigation className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{originCity}</span>
                <span className="text-emerald-400 font-bold">→</span>
                <span>{destinationCity}</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Google Maps Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {operatorName || 'SafarGo Mobility'} {vehicleNumber ? `• ${vehicleNumber}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Speed Pill */}
          <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-xl text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{currentSpeedKmH} km/h</span>
          </div>

          {/* Open In Native Google Maps */}
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            title="Google Maps में खोलें"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        {apiKey ? (
          // Official @vis.gl/react-google-maps SDK with Mandatory Attribution
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={7}
              mapId="safargo_route_map"
              internalUsageAttributionIds={['gmp_git_agentskills_v1']}
              mapTypeId={mapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {/* Origin Marker */}
              <AdvancedMarker position={originCoords} title={`प्रस्थान: ${originCity}`}>
                <Pin background="#10b981" glyphColor="#ffffff" borderColor="#047857" />
              </AdvancedMarker>

              {/* Destination Marker */}
              <AdvancedMarker position={destCoords} title={`गंतव्य: ${destinationCity}`}>
                <Pin background="#6366f1" glyphColor="#ffffff" borderColor="#4338ca" />
              </AdvancedMarker>

              {/* Live Vehicle Marker */}
              <AdvancedMarker position={liveCoords} title={`वर्तमान स्थिति • ${currentSpeedKmH} km/h`}>
                <div className="relative cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-lg animate-bounce">
                    {vehicleType === 'bus' ? '🚌' : '🚕'}
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-emerald-400 opacity-50 animate-ping pointer-events-none" />
                </div>
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          // High-Fidelity Google Maps Directions Embed with Live Overlays
          <div className="relative w-full h-full">
            <iframe
              title={`Google Maps ${originCity} to ${destinationCity}`}
              src={embedUrl}
              className="w-full h-full border-0 filter contrast-[1.05]"
              loading="lazy"
              allowFullScreen
            />

            {/* Floating Live Vehicle HUD overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white shadow-2xl max-w-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>लाइव जीपीएस ट्रैकिंग</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">{currentProgressPct}% रूट पूरा</span>
              </div>
              <p className="text-[11px] text-slate-300">
                वर्तमान लोकेशन: <span className="font-bold text-white">{originCity} बायपास कॉरिडोर</span>
              </p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${currentProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Map Type Toggle floating pill */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-lg text-[10px] font-bold text-slate-300">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-1 rounded-lg transition ${mapType === 'roadmap' ? 'bg-emerald-600 text-white' : 'hover:text-white'}`}
          >
            नक्शा (Map)
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-1 rounded-lg transition ${mapType === 'satellite' ? 'bg-emerald-600 text-white' : 'hover:text-white'}`}
          >
            सैटेलाइट (Sat)
          </button>
        </div>
      </div>

      {/* Bottom Stops Strip (if available) */}
      {stops.length > 0 && (
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span>स्टॉप्स:</span>
          </span>
          {stops.map((stop, idx) => (
            <a
              key={stop.id || idx}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${originCity}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-700 shrink-0 flex items-center gap-1 transition"
            >
              <span>{stop.name}</span>
              {stop.time && <span className="text-[10px] text-emerald-400 font-mono">({stop.time})</span>}
              <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
