import React from 'react';
import { Clock, Lock, Check } from 'lucide-react';

export default function SlotItem({ slot, isSelected, onSelect }) {
  const isBooked = slot.is_booked;

  let stateClasses = 'bg-[#eef6f8] border-[#5c9ead]/40 text-[#326273] hover:bg-[#5c9ead]/20 hover:border-[#5c9ead]';
  if (isBooked) {
    stateClasses = 'bg-rose-50 border-rose-200 text-rose-600 cursor-not-allowed opacity-75';
  } else if (isSelected) {
    stateClasses = 'bg-[#326273] border-[#326273] text-white shadow-md ring-2 ring-[#326273]/30 font-bold';
  }

  const statusLabel = isBooked ? 'Sudah Terisi' : isSelected ? 'Slot Terpilih' : 'Tersedia';

  return (
    <button
      type="button"
      disabled={isBooked}
      aria-pressed={isSelected}
      aria-label={`Slot sesi jam ${slot.time}, status ${statusLabel}`}
      onClick={onSelect}
      className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none ${stateClasses}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 opacity-75" aria-hidden="true" />
          {slot.time}
        </span>
        {isBooked ? (
          <Lock className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
        ) : isSelected ? (
          <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-[#5c9ead]" aria-hidden="true" />
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
          <span className="text-[#326273] font-medium">Tersedia</span>
        )}
      </div>
    </button>
  );
}
