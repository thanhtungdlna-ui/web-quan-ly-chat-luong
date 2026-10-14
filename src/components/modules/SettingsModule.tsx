/**
 * @license
 * LOL Quality Control Center - Phân hệ 11: Danh Mục và Thiết Lập (Settings & Master Data)
 * Quản trị nhà cung cấp, sản phẩm, dây chuyền, mục tiêu KPI và cơ chế sao lưu dữ liệu.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { KPITargetItem, SupplierItem, ProductItem, UserRole } from '../../types/quality';
import { 
  Settings, 
  Target, 
  Building2, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2,
  Plus,
  CheckCircle2
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    kpiTargets,
    updateKPITarget,
    suppliers,
    addSupplier,
    products,
    addProduct,
    resetToDemoData,
    clearSampleData,
    clearAllData,
    exportBackupJSON,
    importBackupJSON,
    activeRole,
    setActiveRole
  } = useQuality();

  const [activeTab, setActiveTab] = useState<'kpi' | 'suppliers' | 'products' | 'backup' | 'roles'>('kpi');
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetForm, setTargetForm] = useState<Partial<KPITargetItem>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleStartEditTarget = (target: KPITargetItem) => {
    setEditingTargetId(target.id);
    setTargetForm(target);
    setSaveSuccessMsg('');
  };

  const handleSaveTarget = () => {
    if (!editingTargetId) return;
    updateKPITarget(editingTargetId, targetForm);
    setEditingTargetId(null);
    setSaveSuccessMsg('Đã cập nhật mục tiêu KPI và lưu vết lịch sử thành công!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await importBackupJSON(file);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 11</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Danh Mục và Thiết Lập Hệ Thống (Master Data & Settings)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình chỉ tiêu KPI, danh sách nhà cung cấp, sản phẩm, phân quyền vai trò và sao lưu cơ sở dữ liệu.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'kpi'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Mục tiêu KPI & Ngưỡng cảnh báo</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Danh sách Nhà cung cấp</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Danh mục Sản phẩm & Tiêu chuẩn</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Phân quyền & Vai trò người dùng</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sao lưu & Quản trị Dữ liệu</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: KPI Targets */}
      {activeTab === 'kpi' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Cấu Hình Mục Tiêu Chất Lượng & Ngưỡng Cảnh Báo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập ngưỡng Đạt, Cảnh báo (Warning) và Nguy cấp (Danger) cho từng chỉ số chất lượng nhà máy.
            </p>
          </div>

          <div className="space-y-3">
            {kpiTargets.map(t => {
              const isEditing = editingTargetId === t.id;
              return (
                <div key={t.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">({t.key})</span>
                    </div>
                    <div>
                      {!isEditing ? (
                        <button
                          onClick={() => handleStartEditTarget(t)}
                          className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-xs font-medium text-slate-700"
                        >
                          Chỉnh sửa
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTargetId(null)}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleSaveTarget}
                            className="px-3 py-1 bg-sky-600 text-white rounded font-medium hover:bg-sky-500"
                          >
                            Lưu thay đổi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Mức mục tiêu:</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {t.comparisonType === 'LESS_THAN' ? '≤ ' : '≥ '}
                          {t.targetValue} {t.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ngưỡng cảnh báo:</span>
                        <span className="font-mono font-semibold text-amber-600">
                          {t.warningThreshold} {t.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ngưỡng nguy cấp:</span>
                        <span className="font-mono font-semibold text-rose-600">
                          {t.dangerThreshold} {t.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kỳ áp dụng:</span>
                        <span className="font-medium text-slate-700">{t.validPeriod}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Mục tiêu ({t.unit})</label>
                        <input
                          type="number"
                          step="0.1"
                          value={targetForm.targetValue || 0}
                          onChange={e => setTargetForm({ ...targetForm, targetValue: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Ngưỡng cảnh báo</label>
                        <input
                          type="number"
                          step="0.1"
                          value={targetForm.warningThreshold || 0}
                          onChange={e => setTargetForm({ ...targetForm, warningThreshold: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Ngưỡng nguy cấp</label>
                        <input
                          type="number"
                          step="0.1"
                          value={targetForm.dangerThreshold || 0}
                          onChange={e => setTargetForm({ ...targetForm, dangerThreshold: Number(e.target.value) })}
                          className="w-full px-2 py-1 bg-white border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Kỳ hiệu lực</label>
                        <input
                          type="text"
                          value={targetForm.validPeriod || ''}
                          onChange={e => setTargetForm({ ...targetForm, validPeriod: e.target.value })}
                          className="w-full px-2 py-1 bg-white border rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex justify-between">
                    <span>Công thức: {t.formulaDescription}</span>
                    <span>Cập nhật lần cuối: {t.lastUpdated} ({t.updatedBy})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers Master */}
      {activeTab === 'suppliers' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Danh Mục Nhà Cung Cấp Linh Kiện ({suppliers.length} NCC)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b">
                  <th className="py-2.5 px-3">Mã NCC</th>
                  <th className="py-2.5 px-3">Tên Nhà cung cấp</th>
                  <th className="py-2.5 px-3">Hạng mục linh kiện</th>
                  <th className="py-2.5 px-3">Người liên hệ</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Xếp hạng</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{s.code}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.category}</td>
                    <td className="py-2.5 px-3">{s.contactPerson}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{s.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        Hạng {s.ratingGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Products Master */}
      {activeTab === 'products' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Danh Mục Sản Phẩm & Tiêu Chuẩn Áp Dụng ({products.length} Model)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b">
                  <th className="py-2.5 px-3">Mã Model</th>
                  <th className="py-2.5 px-3">Tên sản phẩm</th>
                  <th className="py-2.5 px-3">Dòng sản phẩm</th>
                  <th className="py-2.5 px-3">Khách hàng chính</th>
                  <th className="py-2.5 px-3">Tiêu chuẩn kiểm tra</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {products.map(p => (
                  <tr key={p.code} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{p.code}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.family}</td>
                    <td className="py-2.5 px-3">{p.customer}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{p.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Role Simulator */}
      {activeTab === 'roles' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Mô Phỏng Phân Quyền Người Dùng (User Roles Simulator)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cho phép kiểm tra trải nghiệm và quyền thao tác đối với từng vai trò trong nhà máy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { role: 'QA_QC_MANAGER', title: 'Trưởng Phòng QA/QC', desc: 'Toàn quyền duyệt OQC, duyệt kế hoạch CAPA, hiệu chỉnh mục tiêu KPI.' },
              { role: 'DIRECTOR', title: 'Ban Giám Đốc (BOD)', desc: 'Xem báo cáo tổng hợp, phê duyệt xuất hàng các lô ngoại lệ và các vụ khiếu nại lớn.' },
              { role: 'INSPECTOR', title: 'Kỹ Thuật Viên Kiểm Tra (QC)', desc: 'Nhập kết quả lấy mẫu IQC, IPQC và OQC, ghi nhận lỗi phát hiện.' },
              { role: 'PRODUCTION_ENGINEER', title: 'Kỹ Sư Sản Xuất (SMT/PE)', desc: 'Cập nhật nguyên nhân kỹ thuật, hành động khắc phục tức thời trên dây chuyền.' },
              { role: 'ADMIN', title: 'Quản Trị Viên Hệ Thống', desc: 'Quản lý sao lưu dữ liệu, danh mục master data và thiết lập cấu hình.' },
              { role: 'VIEWER', title: 'Người Xem Báo Cáo (Auditor)', desc: 'Chỉ xem báo cáo và xuất file, không được sửa đổi số liệu kiểm tra.' },
            ].map(item => (
              <div
                key={item.role}
                onClick={() => setActiveRole(item.role as UserRole)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  activeRole === item.role
                    ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-400'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  {activeRole === item.role && (
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Đang kích hoạt</span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Sao Lưu & Phục Hồi Dữ Liệu Cục Bộ (Device Storage Management)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ dữ liệu được lưu trữ an toàn trong localStorage trên trình duyệt thiết bị của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-600" />
                <span>Xuất Bản Sao Lưu (Export Backup JSON)</span>
              </h4>
              <p className="text-slate-600">
                Tải về toàn bộ cơ sở dữ liệu gồm IQC, IPQC, OQC, Khiếu nại, Lỗi và CAPA dưới dạng file JSON chuẩn để lưu trữ an toàn.
              </p>
              <button
                onClick={exportBackupJSON}
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Tải về file sao lưu JSON</span>
              </button>
            </div>

            {/* Restore */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Phục Hồi Dữ Liệu (Import Restore JSON)</span>
              </h4>
              <p className="text-slate-600">
                Khôi phục lại toàn bộ dữ liệu từ file sao lưu JSON đã tải về trước đó trên bất kỳ máy tính nào.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn file phục hồi (.json)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Danger zone */}
          <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 text-xs space-y-3">
            <h4 className="font-semibold text-rose-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Khu Vực Quản Lý Dữ Liệu Mẫu & Khởi Tạo Lại</span>
            </h4>
            <p className="text-rose-800">
              Các thao tác này sẽ can thiệp trực tiếp vào bộ nhớ cục bộ. Vui lòng xác nhận trước khi thực hiện.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Khôi phục lại toàn bộ bộ dữ liệu mẫu ban đầu của Công ty Điện Tử LOL?')) {
                    resetToDemoData();
                    alert('Đã khôi phục dữ liệu mẫu thành công!');
                  }
                }}
                className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg font-medium"
              >
                Khôi phục dữ liệu mẫu ban đầu
              </button>

              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tất cả bản ghi mẫu minh họa (chỉ giữ lại dữ liệu thật đã nhập)?')) {
                    clearSampleData();
                    alert('Đã xóa sạch dữ liệu minh họa!');
                  }
                }}
                className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg font-medium"
              >
                Xóa toàn bộ dữ liệu minh họa
              </button>

              <button
                onClick={() => {
                  if (confirm('CẢNH BÁO: Thao tác này sẽ xóa trắng toàn bộ dữ liệu trong hệ thống! Bạn có chắc không?')) {
                    clearAllData();
                    alert('Đã làm trống toàn bộ dữ liệu!');
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-semibold"
              >
                Xóa tất cả dữ liệu (Reset sạch)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
