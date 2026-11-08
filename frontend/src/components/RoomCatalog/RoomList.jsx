import React from 'react';
import RoomCard from './RoomCard';
import { SearchX, Loader2 } from 'lucide-react';

export default function RoomList({ rooms, selectedRoomId, onSelectRoom, loading }) {
  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Memuat katalog ruangan...</p>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Tidak ada ruangan ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Coba ubah filter kategori atau turunkan batas kapasitas minimum yang dipilih.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isSelected={selectedRoomId === room.id}
          onSelect={() => onSelectRoom(room)}
        />
      ))}
    </div>
  );
}

