import React from 'react';
import { Clock, Lock, Check } from 'lucide-react';

export default function SlotItem({ slot, isSelected, onSelect }) {
  const isBooked = slot.is_booked;

  let stateClasses = 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300';
  if (isBooked) {
    stateClasses = 'bg-rose-50/80 border-rose-200 text-rose-500 cursor-not-allowed opacity-75';
  } else if (isSelected) {
    stateClasses = 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30';
  }

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={onSelect}
      className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${stateClasses}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-semibold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 opacity-75" />
          {slot.time}
        </span>
        {isBooked ? (
          <Lock className="w-3.5 h-3.5 text-rose-500" />
        ) : isSelected ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>

      <div className="text-[11px] font-medium">
        {isBooked ? (
          <span className="text-rose-600 font-semibold truncate block">
            Terisi ({slot.booking_code || 'Terkunci'})
          </span>
        ) : isSelected ? (
          <span className="font-semibold text-blue-100">Slot Terpilih</span>
        ) : (
          <span className="text-emerald-700">Tersedia</span>
        )}
      </div>
    </button>
  );
}

