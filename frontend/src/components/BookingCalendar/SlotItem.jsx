import React from 'react';
import { Clock, Lock, Check } from 'lucide-react';

export default function SlotItem({ slot, isSelected, onSelect }) {
  const isBooked = slot.is_booked;

  let stateClasses = 'bg-brand-tealLight/70 border-brand-teal/40 text-brand-dark hover:bg-brand-teal/20 hover:border-brand-teal';
  if (isBooked) {
    stateClasses = 'bg-rose-50 border-rose-200 text-rose-500 cursor-not-allowed opacity-75';
  } else if (isSelected) {
    stateClasses = 'bg-brand-dark border-brand-dark text-white shadow-md ring-2 ring-brand-dark/20';
  }

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={onSelect}
      className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${stateClasses}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 opacity-75" />
          {slot.time}
        </span>
        {isBooked ? (
          <Lock className="w-3.5 h-3.5 text-rose-500" />
        ) : isSelected ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-brand-teal" />
        )}
      </div>

      <div className="text-[11px] font-medium">
        {isBooked ? (
          <span className="text-rose-600 font-semibold truncate block">
            Terisi ({slot.booking_code || 'Terkunci'})
          </span>
        ) : isSelected ? (
          <span className="font-bold text-white">Slot Terpilih</span>
        ) : (
          <span className="text-brand-dark font-medium">Tersedia</span>
        )}
      </div>
    </button>
  );
}
