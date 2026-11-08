import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DateSelector({ selectedDate, onSelectDate }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const handleQuickAddDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Date display & picker */}
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Reservasi</div>
          <div className="text-sm sm:text-base font-bold text-slate-900">
            {formatDateDisplay(selectedDate)}
          </div>
        </div>
      </div>

      {/* Date controls */}
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={() => handleQuickAddDays(0)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            selectedDate === todayStr
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Hari Ini
        </button>
        <button
          type="button"
          onClick={() => handleQuickAddDays(1)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          Besok
        </button>

        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => onSelectDate(e.target.value)}
          className="text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50 py-1.5 px-3 focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700"
        />
      </div>
    </div>
  );
}

