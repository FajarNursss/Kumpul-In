import React from 'react';
import { Filter, Users, Search, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = ['All', 'Open Desk', 'Meeting Pod', 'Event Space'];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  minCapacity,
  onChangeMinCapacity,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalRooms = 0,
}) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      {/* Top Filter Row: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari ruangan (cth: Pod, Meja, Aula, TV, AC)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Capacity Selectors */}
        <div className="flex items-center space-x-2">
          {/* Capacity */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={minCapacity}
              onChange={(e) => onChangeMinCapacity(e.target.value)}
              className="text-xs bg-transparent border-none p-0 focus:ring-0 font-medium text-slate-700 cursor-pointer"
            >
              <option value="">Kapasitas Bebas</option>
              <option value="1">≥ 1 Orang</option>
              <option value="4">≥ 4 Orang</option>
              <option value="8">≥ 8 Orang</option>
              <option value="20">≥ 20 Orang</option>
              <option value="50">≥ 50 Orang</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs bg-transparent border-none p-0 focus:ring-0 font-medium text-slate-700 cursor-pointer"
            >
              <option value="default">Urutan Standar</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="capacity-desc">Kapasitas Terbesar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Row: Category Tabs & Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#326273] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'All' ? 'Semua Ruangan' : cat}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-semibold text-slate-500">
          Menampilkan <strong className="text-slate-800">{totalRooms}</strong> Ruangan
        </span>
      </div>
    </div>
  );
}
