import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { ArrowLeft, MapPin, Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export const BoardingDropping: React.FC = () => {
  const { 
    selectedBus, 
    selectedSeats, 
    selectedBoardingPoint, 
    setSelectedBoardingPoint, 
    selectedDroppingPoint, 
    setSelectedDroppingPoint, 
    setCurrentStep, 
    t 
  } = useTravel();

  const [activeTab, setActiveTab] = useState<'boarding' | 'dropping'>('boarding');

  if (!selectedBus) {
    return null;
  }

  // Auto-select first boarding and dropping points if none selected
  const boardingPoints = selectedBus.boardingPoints;
  const droppingPoints = selectedBus.droppingPoints;

  const currentBoarding = selectedBoardingPoint || boardingPoints[0];
  const currentDropping = selectedDroppingPoint || droppingPoints[0];

  const handleProceed = () => {
    if (!selectedBoardingPoint) setSelectedBoardingPoint(boardingPoints[0]);
    if (!selectedDroppingPoint) setSelectedDroppingPoint(droppingPoints[0]);
    setCurrentStep('passenger_form');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-24">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep('seat_select')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('बोर्डिंग और ड्रॉपिंग पॉइंट', 'Boarding & Dropping Points')}</h2>
            <p className="text-xs text-slate-500">
              {selectedBus.operatorName} • {selectedSeats.length} {t('सीटें चयनित', 'seats selected')} ({selectedSeats.map(s => s.seatNumber).join(', ')})
            </p>
          </div>
        </div>

        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl">
          {t('चरण 2/3', 'Step 2/3')}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 border border-slate-200">
        <button
          onClick={() => setActiveTab('boarding')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'boarding'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{t('बोर्डिंग पॉइंट (चढ़ने का स्थान)', 'Boarding Point')}</span>
          {currentBoarding && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('dropping')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'dropping'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>{t('ड्रॉपिंग पॉइंट (उतरने का स्थान)', 'Dropping Point')}</span>
          {currentDropping && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Point Selection Cards */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
        {activeTab === 'boarding' ? (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="font-bold text-slate-800">{t('बोर्डिंग स्टॉप चुनें:', 'Select Your Boarding Stop:')}</span>
              <span>{boardingPoints.length} {t('स्थान उपलब्ध', 'locations')}</span>
            </div>

            <div className="space-y-3">
              {boardingPoints.map((point) => {
                const isSelected = currentBoarding?.id === point.id;
                return (
                  <div
                    key={point.id}
                    onClick={() => setSelectedBoardingPoint(point)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{point.name}</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {point.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{point.address}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {point.landmark}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="font-bold text-slate-800">{t('ड्रॉपिंग स्टॉप चुनें:', 'Select Your Dropping Stop:')}</span>
              <span>{droppingPoints.length} {t('स्थान उपलब्ध', 'locations')}</span>
            </div>

            <div className="space-y-3">
              {droppingPoints.map((point) => {
                const isSelected = currentDropping?.id === point.id;
                return (
                  <div
                    key={point.id}
                    onClick={() => setSelectedDroppingPoint(point)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{point.name}</span>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {point.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{point.address}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {point.landmark}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Points Preview & CTA */}
      <div className="mt-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600 space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-700">{t('बोर्डिंग:', 'Boarding:')}</span>
            <span className="font-semibold text-slate-900">{currentBoarding?.name} ({currentBoarding?.time})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-700">{t('ड्रॉपिंग:', 'Dropping:')}</span>
            <span className="font-semibold text-slate-900">{currentDropping?.name} ({currentDropping?.time})</span>
          </div>
        </div>

        <button
          onClick={handleProceed}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
        >
          <span>{t('यात्री विवरण भरें', 'Enter Passenger Details')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
