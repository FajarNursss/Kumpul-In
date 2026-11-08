import React from 'react';
import { Filter, Users } from 'lucide-react';

const CATEGORIES = ['All', 'Open Desk', 'Meeting Pod', 'Event Space'];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  minCapacity,
  onChangeMinCapacity,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Kategori:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Min Capacity Filter */}
      <div className="flex items-center gap-2 self-start md:self-auto">
        <label htmlFor="min-capacity" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> Kapasitas Min:
        </label>
        <select
          id="min-capacity"
          value={minCapacity}
          onChange={(e) => onChangeMinCapacity(e.target.value)}
          className="text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50 py-1.5 px-3 focus:border-brand-dark focus:ring-brand-dark font-medium text-slate-700"
        >
          <option value="">Semua Kapasitas</option>
          <option value="1">≥ 1 Orang</option>
          <option value="4">≥ 4 Orang</option>
          <option value="8">≥ 8 Orang</option>
          <option value="20">≥ 20 Orang</option>
          <option value="50">≥ 50 Orang</option>
        </select>
      </div>
    </div>
  );
}
