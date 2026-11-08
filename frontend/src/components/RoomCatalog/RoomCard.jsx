import React from 'react';
import { Users, ChevronRight } from 'lucide-react';

const categoryColorMap = {
  'Open Desk': {
    stripe: 'bg-[#5c9ead]',
    badge: 'bg-[#eef6f8] text-[#326273] border-[#5c9ead]/30',
  },
  'Meeting Pod': {
    stripe: 'bg-[#326273]',
    badge: 'bg-slate-100 text-[#326273] border-slate-200',
  },
  'Event Space': {
    stripe: 'bg-[#e39774]',
    badge: 'bg-[#fdf4f0] text-[#d58560] border-[#e39774]/30',
  },
};

export default function RoomCard({ room, isSelected, onSelect }) {
  const categoryStyle = categoryColorMap[room.category] || {
    stripe: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(room.price_per_hour);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-[#326273] ring-2 ring-[#326273]/20 shadow-md -translate-y-0.5'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner Stripe */}
      <div className={`h-2 w-full ${categoryStyle.stripe}`} />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${categoryStyle.badge}`}
            >
              {room.category}
            </span>
            <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Maks {room.capacity} Orang</span>
            </div>
          </div>

          {/* Room Name */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#326273] transition-colors">
            {room.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {room.category === 'Event Space'
              ? 'Aula serbaguna untuk seminar, workshop, dan gathering komunitas skala besar.'
              : room.category === 'Meeting Pod'
              ? 'Ruangan kedap suara ber-AC dilengkapi display screen dan whiteboard.'
              : 'Meja kerja personal ergonomis dengan stopkontak dan Wi-Fi cepat.'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Tarif Sewa</div>
            <div className="text-base font-extrabold text-slate-900">
              {formattedPrice}
              <span className="text-xs font-normal text-slate-500"> /jam</span>
            </div>
          </div>

          <button
            className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isSelected
                ? 'bg-[#326273] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 group-hover:bg-[#326273] group-hover:text-white'
            }`}
          >
            <span>{isSelected ? 'Terpilih' : 'Cek Jadwal'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
