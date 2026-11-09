import React, { useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function ProposalUpload({ file, onSelectFile, error }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        alert('File harus berformat PDF (.pdf)');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5 MB');
        return;
      }
      onSelectFile(selected);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">
        Upload Proposal Kegiatan (Wajib untuk Aula Kampus) <span className="text-rose-500">*</span>
      </label>

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            error
              ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-50'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="w-8 h-8 text-[#326273] mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Klik untuk pilih file proposal (PDF)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Maksimal ukuran file 5 MB
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl border border-[#5c9ead]/40 bg-[#eef6f8]">
          <div className="flex items-center space-x-3 truncate">
            <FileText className="w-6 h-6 text-[#326273] shrink-0" />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectFile(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

