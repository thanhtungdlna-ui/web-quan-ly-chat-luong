/**
 * @license
 * LOL Quality Control Center - Filter Toolbar
 * Bộ lọc đa chiều đồng bộ cho tất cả biểu đồ, KPI và bảng dữ liệu.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  Filter, 
  RotateCcw, 
  Search, 
  Download, 
  Calendar, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { NavTabId } from './Sidebar';

interface FilterToolbarProps {
  currentModule: NavTabId;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({ currentModule }) => {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    suppliers, 
    products, 
    processes,
    exportModuleToCSV
  } = useQuality();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Count active filters
  const activeCount = [
    filters.line,
    filters.productCode,
    filters.supplier,
    filters.customer,
    filters.severity,
    filters.status,
    filters.keyword,
    filters.datePreset !== 'thisMonth',
    filters.dataMode !== 'all'
  ].filter(Boolean).length;

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, datePreset: e.target.value as any }));
  };

  const getModuleCSVName = () => {
    switch (currentModule) {
      case 'iqc': return 'IQC';
      case 'ipqc': return 'IPQC';
      case 'oqc': return 'OQC';
      case 'customer': return 'CUSTOMER';
      case 'capa': return 'CAPA';
      case 'defects': return 'DEFECTS';
      default: return 'IQC';
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Main Quick Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Preset */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.datePreset}
              onChange={handlePresetChange}
              aria-label="Kỳ báo cáo thời gian"
              className="bg-transparent text-slate-700 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="thisMonth">Tháng này (10/2026)</option>
              <option value="lastMonth">Tháng trước (09/2026)</option>
              <option value="thisQuarter">Quý này (Q4/2026)</option>
              <option value="thisYear">Cả năm 2026</option>
              <option value="custom">Khoảng tùy chọn...</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {filters.datePreset === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                aria-label="Từ ngày"
                className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-700"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                aria-label="Đến ngày"
                className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-700"
              />
            </div>
          )}

          {/* Product Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px]">Sản phẩm:</span>
            <select
              value={filters.productCode}
              onChange={e => setFilters(prev => ({ ...prev, productCode: e.target.value }))}
              aria-label="Lọc theo sản phẩm"
              className="bg-transparent text-slate-700 font-medium text-xs focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="">Tất cả</option>
              {products.map(p => (
                <option key={p.code} value={p.code}>{p.code} - {p.name.slice(0, 16)}...</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px]">Mức độ:</span>
            <select
              value={filters.severity}
              onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              aria-label="Lọc theo mức độ nghiêm trọng"
              className="bg-transparent text-slate-700 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả</option>
              <option value="CRITICAL">Nghiêm trọng (Critical)</option>
              <option value="MAJOR">Nặng (Major)</option>
              <option value="MINOR">Nhẹ (Minor)</option>
            </select>
          </div>

          {/* Data Mode Switcher (All / Demo Sample / Real) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 text-[11px]">Nguồn:</span>
            <select
              value={filters.dataMode}
              onChange={e => setFilters(prev => ({ ...prev, dataMode: e.target.value as any }))}
              aria-label="Lọc nguồn dữ liệu"
              className="bg-transparent text-slate-700 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả dữ liệu</option>
              <option value="sample">Chỉ dữ liệu mẫu (Demo)</option>
              <option value="real">Chỉ dữ liệu thực tế</option>
            </select>
          </div>

          {/* Toggle More Filters */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isAdvancedOpen
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Thêm bộ lọc</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 bg-sky-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </button>

          {/* Clear Filters Button */}
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
              title="Đặt lại tất cả bộ lọc về mặc định"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc ({activeCount})</span>
            </button>
          )}
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã lô, linh kiện, lỗi..."
              value={filters.keyword}
              onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 w-44 sm:w-56"
            />
            {filters.keyword && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, keyword: '' }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => exportModuleToCSV(getModuleCSVName())}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors shrink-0"
            title="Xuất bảng dữ liệu hiện tại ra tệp CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Extended Filter Row */}
      {isAdvancedOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {/* Line Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Dây chuyền:</span>
            <select
              value={filters.line}
              onChange={e => setFilters(prev => ({ ...prev, line: e.target.value }))}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="">Tất cả chuyền</option>
              <option value="SMT-01">SMT-01 (Mainboard)</option>
              <option value="SMT-02">SMT-02 (Power Module)</option>
              <option value="SMT-03">SMT-03 (IoT Gateway)</option>
              <option value="ASSY-01">ASSY-01 (Lắp ráp FCT)</option>
              <option value="ASSY-02">ASSY-02 (Đóng gói OQC)</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Nhà cung cấp:</span>
            <select
              value={filters.supplier}
              onChange={e => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 max-w-[160px] truncate"
            >
              <option value="">Tất cả NCC</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Khách hàng:</span>
            <select
              value={filters.customer}
              onChange={e => setFilters(prev => ({ ...prev, customer: e.target.value }))}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="">Tất cả khách hàng</option>
              <option value="Yamaha Robotics">Yamaha Robotics</option>
              <option value="Viettel Network">Viettel Network</option>
              <option value="Schneider Electric">Schneider Electric</option>
              <option value="Omron Automation">Omron Automation</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Trạng thái:</span>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="OPEN">Đang mở (Open)</option>
              <option value="IN_PROGRESS">Đang xử lý (In-Progress)</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="CLOSED">Đã đóng (Closed)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
