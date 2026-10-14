/**
 * @license
 * LOL Quality Control Center - Header Component
 * Tuân thủ Top Bar Contract: Brand zone (1 dòng), Status / Context, Action buttons.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  ShieldCheck, 
  HelpCircle, 
  MonitorPlay, 
  Download, 
  Upload, 
  UserCheck, 
  Layers,
  Database,
  Plus
} from 'lucide-react';
import { UserRole } from '../../types/quality';

interface HeaderProps {
  onOpenFormulaGuide: () => void;
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFormulaGuide, onOpenQuickAdd }) => {
  const { 
    activeRole, 
    setActiveRole, 
    isPresentationMode, 
    setIsPresentationMode,
    filters,
    exportBackupJSON,
    importBackupJSON,
    resetToDemoData,
    clearSampleData,
    iqcRecords
  } = useQuality();

  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const hasSampleData = iqcRecords.some(r => r.isSample);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await importBackupJSON(file);
      alert(res.message);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRole(e.target.value as UserRole);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Zone 1: Brand & System Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white uppercase">LOL QUALITY</span>
              <span className="text-[10px] text-slate-400 font-medium">| Công ty TNHH Điện Tử LOL</span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Hệ Thống Giám Sát & Quản Lý Chất Lượng Sản Phẩm Điện Tử
            </p>
          </div>
        </div>

        {/* Data mode banner badge */}
        {hasSampleData ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-400/30 rounded text-amber-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Dữ liệu minh họa (Demo)</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-400/30 rounded text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Dữ liệu thực tế nhà máy</span>
          </div>
        )}
      </div>

      {/* Zone 2: Role Selector & Mode Toggle */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Vai trò:</span>
          <select
            value={activeRole}
            onChange={handleRoleChange}
            aria-label="Chọn vai trò sử dụng"
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
          >
            <option value="QA_QC_MANAGER" className="bg-slate-900 text-white">Trưởng phòng QA/QC</option>
            <option value="DIRECTOR" className="bg-slate-900 text-white">Ban Giám Đốc</option>
            <option value="INSPECTOR" className="bg-slate-900 text-white">Kỹ thuật viên QC</option>
            <option value="PRODUCTION_ENGINEER" className="bg-slate-900 text-white">Kỹ sư Sản xuất (SMT/PE)</option>
            <option value="ADMIN" className="bg-slate-900 text-white">Quản trị viên (Admin)</option>
            <option value="VIEWER" className="bg-slate-900 text-white">Người xem (Viewer)</option>
          </select>
        </div>

        <button
          onClick={onOpenFormulaGuide}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          title="Xem giải thích công thức KPI & Chuẩn tính toán"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>Công thức KPI</span>
        </button>

        <button
          onClick={() => setIsPresentationMode(!isPresentationMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
            isPresentationMode
              ? 'bg-sky-600 text-white border-sky-500'
              : 'text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border-slate-700'
          }`}
          title="Bật/Tắt chế độ trình chiếu báo cáo"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>{isPresentationMode ? 'Thoát trình chiếu' : 'Trình chiếu'}</span>
        </button>
      </div>

      {/* Zone 3: Actions (Quick Add, Data Menu, Backup) */}
      <div className="flex items-center gap-2">
        {/* Data Management Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Dữ liệu & Sao lưu</span>
          </button>

          {isDataMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 font-semibold text-slate-500 border-b border-slate-100">
                Thao tác Dữ liệu
              </div>
              <button
                onClick={() => {
                  exportBackupJSON();
                  setIsDataMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Xuất file sao lưu (JSON)</span>
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsDataMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nhập lại từ bản sao lưu</span>
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <button
                onClick={() => {
                  if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của LOL?')) {
                    resetToDemoData();
                  }
                  setIsDataMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Khôi phục dữ liệu mẫu</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa toàn bộ bản ghi minh họa (chỉ giữ lại dữ liệu thật bạn đã nhập)?')) {
                    clearSampleData();
                  }
                  setIsDataMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
              >
                <span>Xóa dữ liệu minh họa</span>
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nhập dữ liệu</span>
        </button>
      </div>
    </header>
  );
};
