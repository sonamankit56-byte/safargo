import React from 'react';
import { BoardingPoint, DroppingPoint } from '../types';
import { Clock, MapPin } from 'lucide-react';

interface Props {
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  selectedBoarding: BoardingPoint | null;
  selectedDropping: DroppingPoint | null;
  onSelectBoarding: (bp: BoardingPoint) => void;
  onSelectDropping: (dp: DroppingPoint) => void;
}

export const BoardingDroppingPicker: React.FC<Props> = ({
  boardingPoints,
  droppingPoints,
  selectedBoarding,
  selectedDropping,
  onSelectBoarding,
  onSelectDropping,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
      {/* BOARDING POINTS */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          Select Boarding Point
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {boardingPoints.map((bp) => {
            const isSelected = selectedBoarding?.id === bp.id;
            return (
              <label
                key={bp.id}
                onClick={() => onSelectBoarding(bp)}
                className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-50/60 ring-1 ring-red-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="boardingPoint"
                  checked={isSelected}
                  onChange={() => onSelectBoarding(bp)}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{bp.time}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pickup
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 truncate">{bp.location}</p>
                  <p className="text-[10px] text-slate-500">{bp.landmark}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* DROPPING POINTS */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Select Dropping Point
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {droppingPoints.map((dp) => {
            const isSelected = selectedDropping?.id === dp.id;
            return (
              <label
                key={dp.id}
                onClick={() => onSelectDropping(dp)}
                className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="droppingPoint"
                  checked={isSelected}
                  onChange={() => onSelectDropping(dp)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dp.time}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Drop
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 truncate">{dp.location}</p>
                  <p className="text-[10px] text-slate-500">{dp.landmark}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
