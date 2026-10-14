/**
 * @license
 * LOL Quality Control Center - Phân hệ 7: Quản Lý CAPA (Corrective and Preventive Action)
 * Quy trình 9 bước giải quyết sự cố chất lượng theo chuẩn 8D / IATF 16949 / ISO 9001.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { CAPARecord } from '../../types/quality';
import { 
  Repeat, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  History,
  X 
} from 'lucide-react';

interface CAPAModuleProps {
  onOpenAddModal: () => void;
}

export const CAPAModule: React.FC<CAPAModuleProps> = ({ onOpenAddModal }) => {
  const { filteredCAPA, deleteCAPARecord, updateCAPARecord, exportModuleToCSV } = useQuality();

  const [selectedRecord, setSelectedRecord] = useState<CAPARecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CAPARecord | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  const todayStr = new Date().toISOString().substring(0, 10);
  const totalCAPA = filteredCAPA.length;
  const closedCAPA = filteredCAPA.filter(c => c.status === 'CLOSED').length;
  const overdueCAPA = filteredCAPA.filter(c => c.status !== 'CLOSED' && c.targetDate < todayStr).length;
  const unverifiedCAPA = filteredCAPA.filter(c => c.status !== 'CLOSED' && (!c.effectivenessVerificationResult || c.effectivenessVerificationResult === 'PENDING')).length;

  const pendingReviewCAPA = filteredCAPA.filter(c => c.status === 'OPEN_PENDING_REVIEW').length;

  const getStatusBadge = (status: CAPARecord['status']) => {
    switch (status) {
      case 'OPEN_PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Open - Pending Review</span>
          </span>
        );
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Mới mở (Open)</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Đang điều tra 5-Why</span>;
      case 'CONTAINMENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã ngăn chặn</span>;
      case 'PLAN_APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Kế hoạch đã duyệt</span>;
      case 'IMPLEMENTING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Đang thực hiện</span>;
      case 'VERIFICATION_PENDING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">Chờ thẩm tra hiệu lực</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã đóng hồ sơ</span>;
      case 'REOPENED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-300">Mở lại (Tái diễn)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">{status}</span>;
    }
  };

  const getEffectivenessBadge = (res?: string) => {
    if (res === 'EFFECTIVE') return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đạt hiệu lực 100%</span>;
    if (res === 'INEFFECTIVE') return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Không đạt hiệu lực</span>;
    return <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Chưa thẩm tra</span>;
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 7</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            CAPA – Hành Động Khắc Phục và Phòng Ngừa (Corrective & Preventive Action)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình chuẩn mực 9 bước: Tiếp nhận → Ngăn chặn → Tìm nguyên nhân gốc 5-Why/Fishbone → Khắc phục → Thẩm tra hiệu lực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('CAPA')}
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
            <span>Mở hồ sơ CAPA mới</span>
          </button>
        </div>
      </div>

      {/* 9 Steps Visual Workflow */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="text-xs font-semibold text-slate-800 mb-2.5">
          Quy Trình Chuẩn 9 Bước Xử Lý CAPA (LOL Quality Standard Workflow):
        </div>
        <div className="flex items-center justify-between min-w-[760px] text-xs">
          {[
            { step: '1', title: 'Ghi nhận' },
            { step: '2', title: 'Đánh giá' },
            { step: '3', title: 'Ngăn chặn' },
            { step: '4', title: 'Nguyên nhân' },
            { step: '5', title: 'Đề xuất' },
            { step: '6', title: 'Phê duyệt' },
            { step: '7', title: 'Thực hiện' },
            { step: '8', title: 'Thẩm tra' },
            { step: '9', title: 'Đóng hồ sơ' },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 border border-sky-300 flex items-center justify-center font-bold text-xs">
                  {s.step}
                </div>
                <span className="text-[11px] font-medium text-slate-700 mt-1">{s.title}</span>
              </div>
              {idx < 8 && <div className="h-0.5 flex-1 bg-slate-200 mx-2"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tổng số hồ sơ CAPA</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">{totalCAPA}</span>
            <span className="text-xs text-slate-400">hồ sơ đã mở</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Bao gồm các nguồn IQC, IPQC, Khiếu nại</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Hồ sơ đã đóng hoàn tất</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">{closedCAPA}</span>
            <span className="text-xs text-slate-400">/ {totalCAPA} hồ sơ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Đã thẩm tra đạt hiệu lực</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Hồ sơ quá hạn cam kết</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums font-mono ${overdueCAPA > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueCAPA}
            </span>
            <span className="text-xs text-slate-400">cần giải trình</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Quá ngày mục tiêu hoàn thành</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Chưa xác minh hiệu lực</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums font-mono">{unverifiedCAPA}</span>
            <span className="text-xs text-slate-400">hồ sơ</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Bắt buộc theo dõi trước khi đóng</p>
        </div>
      </div>

      {/* CAPA Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Danh Sách Hồ Sơ CAPA Toàn Nhà Máy ({filteredCAPA.length} Hồ sơ)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Theo dõi tiến độ theo người phụ trách</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Mã CAPA</th>
                <th className="py-2.5 px-3 font-semibold">Nguồn phát sinh</th>
                <th className="py-2.5 px-3 font-semibold">Mô tả sự cố chất lượng</th>
                <th className="py-2.5 px-3 font-semibold text-center">Mức độ</th>
                <th className="py-2.5 px-3 font-semibold">Người phụ trách</th>
                <th className="py-2.5 px-3 font-semibold">Ngày mở</th>
                <th className="py-2.5 px-3 font-semibold">Hạn xử lý</th>
                <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold">Thẩm tra hiệu lực</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCAPA.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không có hồ sơ CAPA nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredCAPA.map(r => {
                  const isOverdue = r.status !== 'CLOSED' && r.targetDate < todayStr;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{r.capaCode}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{r.source}</span>
                        {r.relatedReferenceCode && <div className="text-[10px] text-slate-400 font-mono">Ref: {r.relatedReferenceCode}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-[240px] truncate" title={r.problemDescription}>
                        {r.problemDescription}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          r.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{r.assignedPerson}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.openDate}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {r.targetDate}
                        </span>
                        {isOverdue && <span className="block text-[10px] text-rose-500 font-medium">Quá hạn</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <div>{getStatusBadge(r.status)}</div>
                        {r.status === 'OPEN_PENDING_REVIEW' && (
                          <div className="mt-1">
                            <button
                              onClick={() => {
                                updateCAPARecord(r.id, {
                                  status: 'CONTAINMENT',
                                  rootCauseConfirmed: r.rootCauseConfirmed || 'Đã phê duyệt khởi tạo. Bắt đầu triển khai ngăn chặn D3.'
                                });
                                alert(`Đã duyệt hồ sơ ${r.capaCode} và kích hoạt ngay hành động ngăn chặn (CONTAINMENT)!`);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-colors"
                              title="Phê duyệt ngay và chuyển sang bước Ngăn chặn (Containment) để khắc phục khẩn cấp"
                            >
                              <span>⚡ Bắt đầu hành động</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">{getEffectivenessBadge(r.effectivenessVerificationResult)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(r)}
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                            title="Xem chi tiết 9 bước"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRecord(r)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded"
                            title="Cập nhật bước CAPA"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa hồ sơ CAPA ${r.capaCode}?`)) deleteCAPARecord(r.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail 9-step View Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900">Chi Tiết Hồ Sơ CAPA: {selectedRecord.capaCode}</h3>
                <span className="text-xs text-slate-500">Nguồn: {selectedRecord.source}</span>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border">
                <div><strong>Người phụ trách:</strong> {selectedRecord.assignedPerson}</div>
                <div><strong>Bộ phận:</strong> {selectedRecord.department}</div>
                <div><strong>Ngày mở:</strong> {selectedRecord.openDate}</div>
                <div><strong>Hạn mục tiêu:</strong> {selectedRecord.targetDate}</div>
                <div><strong>Phương pháp phân tích:</strong> {selectedRecord.analysisMethod}</div>
                <div><strong>Trạng thái:</strong> {selectedRecord.status}</div>
              </div>

              <div>
                <strong>Mô tả vấn đề:</strong>
                <p className="mt-1 p-2.5 bg-slate-50 rounded border text-slate-800">{selectedRecord.problemDescription}</p>
              </div>

              {selectedRecord.containmentAction && (
                <div>
                  <strong>Hành động ngăn chặn tức thời (D3 Containment):</strong>
                  <p className="mt-1 p-2.5 bg-blue-50 text-blue-900 rounded border border-blue-200">{selectedRecord.containmentAction}</p>
                </div>
              )}

              {selectedRecord.rootCauseConfirmed && (
                <div>
                  <strong>Nguyên nhân gốc rễ đã xác nhận (D4 Root Cause):</strong>
                  <p className="mt-1 p-2.5 bg-slate-50 rounded border text-slate-800">{selectedRecord.rootCauseConfirmed}</p>
                </div>
              )}

              {selectedRecord.correctiveAction && (
                <div>
                  <strong>Hành động khắc phục (D5/D6 Corrective Actions):</strong>
                  <p className="mt-1 p-2.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">{selectedRecord.correctiveAction}</p>
                </div>
              )}

              {selectedRecord.preventiveAction && (
                <div>
                  <strong>Hành động phòng ngừa tái diễn (D7 Preventive Action):</strong>
                  <p className="mt-1 p-2.5 bg-slate-50 rounded border text-slate-800">{selectedRecord.preventiveAction}</p>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded border space-y-1">
                <div className="flex justify-between items-center">
                  <strong>Thẩm tra hiệu lực (D8 Verification):</strong>
                  {getEffectivenessBadge(selectedRecord.effectivenessVerificationResult)}
                </div>
                {selectedRecord.verifiedBy && (
                  <p className="text-[11px] text-slate-500">Xác nhận bởi: {selectedRecord.verifiedBy} vào ngày {selectedRecord.verificationDate}</p>
                )}
              </div>

              {/* History logs */}
              {selectedRecord.historyLogs && selectedRecord.historyLogs.length > 0 && (
                <div>
                  <strong className="flex items-center gap-1.5 mb-2 text-slate-800">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lịch sử thay đổi hồ sơ:</span>
                  </strong>
                  <div className="space-y-1.5 border-l-2 border-slate-200 pl-3">
                    {selectedRecord.historyLogs.map((log, idx) => (
                      <div key={idx} className="text-[11px]">
                        <span className="font-mono text-slate-400">{log.timestamp}</span> - <strong>{log.actor}</strong>: {log.action}
                        {log.note && <div className="text-slate-500 italic ml-2">"{log.note}"</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit CAPA Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Cập Nhật Tiến Độ CAPA: {editingRecord.capaCode}</h3>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Trạng thái hồ sơ</label>
                  <select
                    value={editingRecord.status}
                    onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border rounded"
                  >
                    <option value="OPEN_PENDING_REVIEW">Open - Pending Review (Mở - Chờ xem xét)</option>
                    <option value="OPEN">Mới mở (OPEN)</option>
                    <option value="UNDER_INVESTIGATION">Đang điều tra 5-Why</option>
                    <option value="CONTAINMENT">Đã ngăn chặn</option>
                    <option value="PLAN_APPROVED">Kế hoạch đã duyệt</option>
                    <option value="IMPLEMENTING">Đang thực hiện</option>
                    <option value="VERIFICATION_PENDING">Chờ thẩm tra hiệu lực</option>
                    <option value="CLOSED">Đã đóng hồ sơ (CLOSED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Thẩm tra hiệu lực</label>
                  <select
                    value={editingRecord.effectivenessVerificationResult || 'PENDING'}
                    onChange={e => setEditingRecord({ ...editingRecord, effectivenessVerificationResult: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border rounded"
                  >
                    <option value="PENDING">Chưa thẩm tra (PENDING)</option>
                    <option value="EFFECTIVE">Đạt hiệu lực (EFFECTIVE)</option>
                    <option value="INEFFECTIVE">Không đạt (INEFFECTIVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nguyên nhân gốc rễ đã xác nhận (Root Cause)</label>
                <textarea
                  rows={2}
                  value={editingRecord.rootCauseConfirmed || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, rootCauseConfirmed: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Hành động khắc phục (Corrective Action)</label>
                <textarea
                  rows={2}
                  value={editingRecord.correctiveAction || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, correctiveAction: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Hành động phòng ngừa tái diễn (Preventive Action)</label>
                <textarea
                  rows={2}
                  value={editingRecord.preventiveAction || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, preventiveAction: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (editingRecord.status === 'CLOSED' && editingRecord.effectivenessVerificationResult !== 'EFFECTIVE') {
                    if (!confirm('Hồ sơ chưa có kết quả "Đạt hiệu lực". Bạn có chắc chắn muốn đóng hồ sơ này không?')) {
                      return;
                    }
                  }
                  updateCAPARecord(editingRecord.id, editingRecord);
                  setEditingRecord(null);
                }}
                className="px-4 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold"
              >
                Lưu cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
