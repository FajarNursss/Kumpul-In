import React from 'react';
import { Users, Clock, CheckCircle2, ChevronRight, Sparkles, Building } from 'lucide-react';

const categoryColorMap = {
  'Open Desk': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'from-emerald-500 to-teal-600',
  },
  'Meeting Pod': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'from-blue-500 to-indigo-600',
  },
  'Event Space': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'from-purple-500 to-pink-600',
  },
};

export default function RoomCard({ room, isSelected, onSelect }) {
  const categoryStyle = categoryColorMap[room.category] || {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'from-slate-500 to-slate-700',
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
          ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-lg shadow-blue-500/10 -translate-y-1'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner Stripe */}
      <div className={`h-2 w-full bg-gradient-to-r ${categoryStyle.accent}`} />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryStyle.badge}`}
            >
              {room.category}
            </span>
            <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Maks {room.capacity} Orang</span>
            </div>
          </div>

          {/* Room Name */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {room.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {room.category === 'Event Space'
              ? 'Ruang serbaguna untuk seminar, workshop, dan gathering komunitas skala besar.'
              : room.category === 'Meeting Pod'
              ? 'Ruangan kedap suara ber-AC dilengkapi display screen dan white board.'
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
            className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700'
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
