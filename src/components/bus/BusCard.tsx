import React, { useState } from 'react';
import { BusItem } from '../../types/travel';
import { useTravel } from '../../context/TravelContext';
import {
  Star,
  Wifi,
  BatteryCharging,
  Shield,
  Navigation,
  Clock,
  CheckCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Radio,
  ArrowRight
} from 'lucide-react';
import { LiveRouteModal } from './LiveRouteModal';

interface BusCardProps {
  bus: BusItem;
}

export const BusCard: React.FC<BusCardProps> = ({ bus }) => {
  const { setSelectedBus, setCurrentStep, isAgentMode, t } = useTravel();
  const [isLiveRouteOpen, setIsLiveRouteOpen] = useState(false);
  const [isBoardingExpanded, setIsBoardingExpanded] = useState(false);

  const handleSelectBus = () => {
    setSelectedBus(bus);
    setCurrentStep('seat_select');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Top Banner if Primo or Special */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {bus.isPrimo && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                <Shield className="w-3 h-3 fill-slate-950" /> PRIMO
              </span>
            )}

            {/* Clickable Live GPS Radar Badge */}
            <button
              type="button"
              onClick={() => setIsLiveRouteOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Navigation className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>{t('लाइव जीपीएस ट्रैकिंग (Live GPS)', 'Live GPS Tracking')}</span>
            </button>

            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {bus.sourceCity} → {bus.destinationCity}
            </span>
          </div>

          {/* Agent Earnings Chip */}
          {isAgentMode && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
              💰 {t('फिक्स एजेंट कमीशन', 'Fixed Agent Comm')}: ₹19.34 / booking
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left Side: Operator Info */}
          <div className="md:col-span-4">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
              {bus.operatorName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {bus.busType}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{bus.rating}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({bus.reviewCount.toLocaleString('en-IN')} {t('समीक्षाएं', 'ratings')})
              </span>
            </div>
          </div>

          {/* Middle: Timings, Duration, Points */}
          <div className="md:col-span-5 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900">{bus.departureTime}</span>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 max-w-[120px] truncate" title={bus.boardingPoints[0]?.name || bus.sourceCity}>
                {bus.boardingPoints[0]?.name || bus.sourceCity}
              </p>
            </div>

            <div className="flex flex-col items-center px-2">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {bus.duration}
              </span>
              <div className="w-20 sm:w-24 h-0.5 bg-slate-300 my-1 relative">
                <div className="w-2 h-2 rounded-full bg-emerald-600 absolute -top-[3px] right-0" />
                <div className="w-2 h-2 rounded-full bg-slate-400 absolute -top-[3px] left-0" />
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">{t('डायरेक्ट रूट', 'Direct Route')}</span>
            </div>

            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-slate-900">{bus.arrivalTime}</span>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 max-w-[120px] truncate" title={bus.droppingPoints[0]?.name || bus.destinationCity}>
                {bus.droppingPoints[0]?.name || bus.destinationCity}
              </p>
            </div>
          </div>

          {/* Right Side: Price & CTA */}
          <div className="md:col-span-3 flex flex-row md:flex-col justify-between md:items-end items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="flex items-center gap-2 md:justify-end">
                <span className="text-xs text-slate-400 line-through">₹{bus.originalFare}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {bus.discountPercent}% OFF
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{bus.fare}
              </div>
              <p className="text-[11px] text-slate-500">
                {bus.availableSeats} {t('सीटें शेष', 'seats left')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSelectBus}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 whitespace-nowrap cursor-pointer"
            >
              {t('सीट चुनें', 'Select Seats')}
            </button>
          </div>
        </div>

        {/* Amenities, Live Route and Boarding Points Action Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Amenities */}
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-slate-400" /> WiFi
            </span>
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-slate-400" /> {t('चार्जिंग', 'Charging')}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t('वॉटर', 'Water')}
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            {/* View Live Route Button */}
            <button
              type="button"
              onClick={() => setIsLiveRouteOpen(true)}
              className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('📍 लाइव रूट मैप (Live Route)', '📍 Live Route Map')}</span>
            </button>

            {/* Inline Boarding Points Accordion Toggle */}
            <button
              type="button"
              onClick={() => setIsBoardingExpanded(prev => !prev)}
              className="font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0A2885]" />
              <span>
                {t(`बोर्डिंग स्टॉप्स (${bus.boardingPoints.length})`, `Boarding Stops (${bus.boardingPoints.length})`)}
              </span>
              {isBoardingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Inline Boarding & Dropping Points Section */}
        {isBoardingExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50/70 rounded-xl p-3.5 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1 text-emerald-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {t('सभी उपलब्ध बोर्डिंग व ड्रॉपिंग स्थान:', 'Available Boarding & Dropping Points:')}
              </span>
              <button
                type="button"
                onClick={() => setIsLiveRouteOpen(true)}
                className="text-emerald-700 hover:underline font-bold text-[11px]"
              >
                {t('रूट मैप पर देखें →', 'View on Route Map →')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Boarding Points */}
              <div className="space-y-1.5">
                <span className="font-extrabold text-[11px] text-slate-500 uppercase tracking-wider block">
                  🟢 {t('बोर्डिंग पॉइंट्स (चढ़ने का स्थान)', 'Boarding Points')}
                </span>
                {bus.boardingPoints.map((bp) => (
                  <div key={bp.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{bp.name}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {bp.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{bp.address}</p>
                    <p className="text-[10px] text-slate-400">Landmark: {bp.landmark}</p>
                  </div>
                ))}
              </div>

              {/* Dropping Points */}
              <div className="space-y-1.5">
                <span className="font-extrabold text-[11px] text-slate-500 uppercase tracking-wider block">
                  🔴 {t('ड्रॉपिंग पॉइंट्स (उतरने का स्थान)', 'Dropping Points')}
                </span>
                {bus.droppingPoints.map((dp) => (
                  <div key={dp.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{dp.name}</span>
                      <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                        {dp.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{dp.address}</p>
                    <p className="text-[10px] text-slate-400">Landmark: {dp.landmark}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Route & Radar Modal */}
      {isLiveRouteOpen && (
        <LiveRouteModal
          bus={bus}
          onClose={() => setIsLiveRouteOpen(false)}
          onSelectSeats={handleSelectBus}
        />
      )}
    </>
  );
};
