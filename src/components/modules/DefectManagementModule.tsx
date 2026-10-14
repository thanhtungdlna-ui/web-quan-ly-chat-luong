/**
 * @license
 * LOL Quality Control Center - Phân hệ 6: Quản Lý Danh Mục Lỗi (Defect Management)
 * Danh mục chuẩn hóa phân loại lỗi SMT, hàn sóng, cơ khí và vi mạch điện tử.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { DefectItem } from '../../types/quality';
import { computePareto } from '../../utils/qualityMath';
import { ParetoChart } from '../charts/QualityCharts';
import { 
  AlertOctagon, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  X 
} from 'lucide-react';

interface DefectManagementProps {
  onOpenAddModal: () => void;
  onNavigateToCAPA?: (capaId?: string) => void;
}

export const DefectManagementModule: React.FC<DefectManagementProps> = ({ onOpenAddModal, onNavigateToCAPA }) => {
  const { filteredDefects, deleteDefectItem, updateDefectItem, exportModuleToCSV, triggerAutoCAPAPrompt } = useQuality();

  const [selectedDefect, setSelectedDefect] = useState<DefectItem | null>(null);
  const [editingDefect, setEditingDefect] = useState<DefectItem | null>(null);

  // Pareto data
  const defectCountMap: Record<string, number> = {};
  filteredDefects.forEach(d => {
    defectCountMap[d.defectName] = (defectCountMap[d.defectName] || 0) + 1;
  });
  const paretoData = computePareto(Object.entries(defectCountMap).map(([name, count]) => ({ name, count })));

  // Category breakdown
  const categoryStats: Record<string, number> = {};
  filteredDefects.forEach(d => {
    categoryStats[d.defectCategory] = (categoryStats[d.defectCategory] || 0) + 1;
  });

  const handleCreateCAPAFromDefect = (defect: DefectItem) => {
    triggerAutoCAPAPrompt({
      source: 'IPQC',
      relatedReferenceCode: defect.defectCode,
      problemDescription: `Khắc phục lỗi tái diễn: ${defect.defectName} (${defect.description}). Công đoạn: ${defect.detectedProcess}.`,
      severity: defect.severity,
      suggestedPersonnel: defect.assignedPerson || 'Nguyễn Tuấn Tú (Kỹ sư trưởng SMT/Process Leader)',
      department: 'Khối Kỹ thuật Quy trình & Sản xuất',
      containmentAction: defect.interimControl || 'Kiểm tra 100% tại trạm công đoạn, hiệu chuẩn thông số kỹ thuật.',
      triggerReason: `Phát hiện lỗi lặp lại trong danh mục lỗi: ${defect.defectName}`,
      isSample: defect.isSample,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 6</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Danh Mục Lỗi (Defect Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chuẩn hóa từ điển mã lỗi toàn nhà máy, thống kê Pareto và kích hoạt quy trình cải tiến CAPA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('DEFECTS')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất dữ liệu</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm loại lỗi</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tổng danh mục loại lỗi</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">{filteredDefects.length}</span>
            <span className="text-xs text-slate-400">mã lỗi định nghĩa</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Phân loại theo IPC-A-610</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Lỗi nghiêm trọng (Critical)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums font-mono">
              {filteredDefects.filter(d => d.severity === 'CRITICAL').length}
            </span>
            <span className="text-xs text-slate-400">loại lỗi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Bắt buộc lập hồ sơ CAPA</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Nhóm lỗi chiếm tỷ trọng cao</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-800">Hàn & Thiếc</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Cầu chì hàn, hở thiếc, rỗ khí</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Lỗi đang xử lý cải tiến</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums font-mono">
              {filteredDefects.filter(d => d.status !== 'CLOSED').length}
            </span>
            <span className="text-xs text-slate-400">loại lỗi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Đang áp dụng biện pháp phòng ngừa</p>
        </div>
      </div>

      {/* Pareto Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Phân Tích Pareto Tần Suất Các Loại Lỗi
          </h3>
          <p className="text-xs text-slate-500 mb-3">Tập trung nguồn lực vào nhóm lỗi gây ảnh hưởng lớn nhất</p>
          <ParetoChart data={paretoData} height={260} />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Cơ Cấu Lỗi Theo Nhóm Nghiệp Vụ
          </h3>
          <p className="text-xs text-slate-500 mb-4">Tỷ trọng lỗi giữa các công đoạn hàn thiếc, cơ khí và linh kiện</p>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const total = filteredDefects.length || 1;
              const pct = (count / total) * 100;
              return (
                <div key={cat} className="text-xs">
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>{cat}</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">{count} loại ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table of Defect Catalog */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Danh Mục Các Loại Lỗi Chuẩn Hóa ({filteredDefects.length} Bản ghi)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Tra cứu nhanh theo từ khóa hoặc mã lỗi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Mã lỗi</th>
                <th className="py-2.5 px-3 font-semibold">Tên loại lỗi</th>
                <th className="py-2.5 px-3 font-semibold">Nhóm lỗi</th>
                <th className="py-2.5 px-3 font-semibold">Công đoạn phát hiện</th>
                <th className="py-2.5 px-3 font-semibold text-center">Mức độ</th>
                <th className="py-2.5 px-3 font-semibold">Mô tả đặc điểm nhận diện</th>
                <th className="py-2.5 px-3 font-semibold">Người phụ trách</th>
                <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDefects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không tìm thấy mã lỗi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredDefects.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{d.defectCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{d.defectName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{d.defectCategory}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{d.detectedProcess}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        d.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : d.severity === 'MAJOR' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-[220px] truncate" title={d.description}>
                      {d.description}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{d.assignedPerson || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        d.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700' : d.status === 'RESOLVED' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedDefect(d)}
                          className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCreateCAPAFromDefect(d)}
                          className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded"
                          title="Tạo hồ sơ CAPA cho lỗi này"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingDefect(d)}
                          className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded"
                          title="Sửa lỗi"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa mã lỗi ${d.defectCode}?`)) deleteDefectItem(d.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Chi Tiết Loại Lỗi: {selectedDefect.defectCode}</h3>
              <button onClick={() => setSelectedDefect(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border">
                <div><strong>Tên lỗi:</strong> {selectedDefect.defectName}</div>
                <div><strong>Nhóm lỗi:</strong> {selectedDefect.defectCategory}</div>
                <div><strong>Công đoạn phát hiện:</strong> {selectedDefect.detectedProcess}</div>
                <div><strong>Mức độ:</strong> {selectedDefect.severity}</div>
                <div><strong>Người phụ trách:</strong> {selectedDefect.assignedPerson || 'Chưa gán'}</div>
                <div><strong>Trạng thái:</strong> {selectedDefect.status}</div>
              </div>
              <div>
                <strong>Mô tả chi tiết:</strong>
                <p className="mt-1 p-2 bg-slate-50 rounded border">{selectedDefect.description}</p>
              </div>
              {selectedDefect.confirmedCause && (
                <div>
                  <strong>Nguyên nhân xác nhận:</strong>
                  <p className="mt-1 p-2 bg-slate-50 rounded border">{selectedDefect.confirmedCause}</p>
                </div>
              )}
              {selectedDefect.correctiveAction && (
                <div>
                  <strong>Hành động khắc phục:</strong>
                  <p className="mt-1 p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">{selectedDefect.correctiveAction}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => handleCreateCAPAFromDefect(selectedDefect)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-xs font-semibold hover:bg-sky-100"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở hồ sơ CAPA</span>
              </button>
              <button
                onClick={() => setSelectedDefect(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Sửa Loại Lỗi: {editingDefect.defectCode}</h3>
              <button onClick={() => setEditingDefect(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tên loại lỗi</label>
                <input
                  type="text"
                  value={editingDefect.defectName}
                  onChange={e => setEditingDefect({ ...editingDefect, defectName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Mức độ nghiêm trọng</label>
                <select
                  value={editingDefect.severity}
                  onChange={e => setEditingDefect({ ...editingDefect, severity: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded"
                >
                  <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                  <option value="MAJOR">Nặng (Major)</option>
                  <option value="MINOR">Nhẹ (Minor)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Mô tả nhận diện</label>
                <textarea
                  rows={2}
                  value={editingDefect.description}
                  onChange={e => setEditingDefect({ ...editingDefect, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Hành động khắc phục</label>
                <textarea
                  rows={2}
                  value={editingDefect.correctiveAction || ''}
                  onChange={e => setEditingDefect({ ...editingDefect, correctiveAction: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingDefect(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  updateDefectItem(editingDefect.id, editingDefect);
                  setEditingDefect(null);
                }}
                className="px-4 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
