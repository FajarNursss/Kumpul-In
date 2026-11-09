import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DateSelector({ selectedDate, onSelectDate }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const handleQuickAddDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleStepDay = (step) => {
    const cur = new Date(selectedDate + 'T00:00:00');
    cur.setDate(cur.getDate() + step);
    const resultStr = cur.toISOString().split('T')[0];
    if (resultStr >= todayStr) {
      onSelectDate(resultStr);
    }
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

  const isToday = selectedDate === todayStr;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Date display & day navigator */}
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-[#eef6f8] text-[#326273] border border-[#5c9ead]/30 shrink-0">
          <Calendar className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tanggal Reservasi
            </span>
            {isToday && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Hari Ini
              </span>
            )}
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900">
            {formatDateDisplay(selectedDate)}
          </div>
        </div>
      </div>

      {/* Date controls: Quick pills + Day Step + Native Picker */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        {/* Step Prev Day */}
        <button
          type="button"
          onClick={() => handleStepDay(-1)}
          disabled={isToday}
          aria-label="Pilih hari sebelumnya"
          className="p-2 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
          title="Hari Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Quick Date Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold" role="group" aria-label="Pilihan Cepat Tanggal">
          <button
            type="button"
            onClick={() => handleQuickAddDays(0)}
            aria-pressed={isToday}
            className={`px-3 py-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
              isToday
                ? 'bg-[#326273] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handleQuickAddDays(1)}
            aria-pressed={selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            className={`px-3 py-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
              selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                ? 'bg-[#326273] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Besok
          </button>
          <button
            type="button"
            onClick={() => handleQuickAddDays(2)}
            aria-pressed={selectedDate === new Date(Date.now() + 172800000).toISOString().split('T')[0]}
            className={`px-3 py-1.5 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
              selectedDate === new Date(Date.now() + 172800000).toISOString().split('T')[0]
                ? 'bg-[#326273] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lusa
          </button>
        </div>

        {/* Step Next Day */}
        <button
          type="button"
          onClick={() => handleStepDay(1)}
          aria-label="Pilih hari berikutnya"
          className="p-2 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
          title="Hari Berikutnya"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Date Input with Accessible Label */}
        <label htmlFor="calendar-date-input" className="sr-only">
          Pilih Tanggal Kalender
        </label>
        <input
          id="calendar-date-input"
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => onSelectDate(e.target.value)}
          className="text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50 py-1.5 px-3 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] font-semibold text-slate-700 cursor-pointer"
        />
      </div>
    </div>
  );
}
