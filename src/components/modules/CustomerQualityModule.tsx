/**
 * @license
 * LOL Quality Control Center - Phân hệ 5: Chất Lượng Khách Hàng (Customer Quality)
 * Quản lý phản ánh, khiếu nại bảo hành, RMA, tỷ lệ lỗi PPM và báo cáo 8D khách hàng.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { CustomerComplaintRecord } from '../../types/quality';
import { calculatePPM, formatNumber } from '../../utils/qualityMath';
import { 
  UserCheck, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  FileCheck,
  X 
} from 'lucide-react';

interface CustomerQualityProps {
  onOpenAddModal: () => void;
  onNavigateToCAPA?: (capaId?: string) => void;
}

export const CustomerQualityModule: React.FC<CustomerQualityProps> = ({ onOpenAddModal, onNavigateToCAPA }) => {
  const { filteredComplaints, deleteComplaint, updateComplaint, exportModuleToCSV, kpiTargets, triggerAutoCAPAPrompt, capaRecords } = useQuality();

  const [selectedRecord, setSelectedRecord] = useState<CustomerComplaintRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CustomerComplaintRecord | null>(null);

  // Detect unlinked critical or recurring customer complaints
  const unlinkedCustomerIssues = filteredComplaints.filter(r => {
    const hasCAPA = capaRecords.some(c => c.relatedReferenceCode === r.complaintCode);
    if (hasCAPA) return false;
    const isCritical = r.severity === 'CRITICAL';
    const isRecurring = filteredComplaints.filter(other => other.customerName === r.customerName && other.productCode === r.productCode).length > 1;
    return isCritical || isRecurring;
  });

  const triggerAutoCAPAFromComplaint = (r: CustomerComplaintRecord) => {
    const isCritical = r.severity === 'CRITICAL';
    const isRecurring = filteredComplaints.filter(other => other.customerName === r.customerName && other.productCode === r.productCode).length > 1;
    triggerAutoCAPAPrompt({
      source: 'Khiếu nại khách hàng',
      relatedReferenceCode: r.complaintCode,
      problemDescription: `Khiếu nại khách hàng ${r.customerName} cho sản phẩm ${r.productName} (${r.productCode}): ${r.problemDescription}. Số lượng ảnh hưởng: ${r.affectedQuantity} chiếc.`,
      severity: r.severity,
      suggestedPersonnel: 'Trần Văn Hòa (Kỹ sư Đảm bảo chất lượng khách hàng - CQE)',
      department: 'Bộ phận QA Khách hàng & Kỹ thuật ứng dụng (CQE)',
      containmentAction: `1. Gửi lô sản phẩm thay thế đã qua kiểm tra nhiệt sàng lọc 72h cho khách hàng trong 24h.\n2. Kiểm tra kho thành phẩm và rà soát lịch sử lệnh sản xuất ${r.orderNumber}.`,
      triggerReason: isRecurring ? `Khách hàng ${r.customerName} khiếu nại lặp lại trên cùng sản phẩm ${r.productCode}` : `Khiếu nại khách hàng mức độ Nghiêm trọng (Critical)`,
      isSample: r.isSample
    });
  };

  // Statistics
  const totalDelivered = filteredComplaints.reduce((acc, r) => acc + r.deliveredQuantity, 0);
  const totalAffected = filteredComplaints.reduce((acc, r) => acc + r.affectedQuantity, 0);
  const customerPPM = calculatePPM(totalAffected, totalDelivered);

  const targetPPM = kpiTargets.find(t => t.key === 'customer_complaint_ppm')?.targetValue || 200;

  const todayStr = new Date().toISOString().substring(0, 10);
  const overdueComplaints = filteredComplaints.filter(r => r.status !== 'VERIFIED_CLOSED' && r.targetDate < todayStr).length;

  const getStatusBadge = (status: CustomerComplaintRecord['status']) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Mới tiếp nhận</span>;
      case 'ANALYZING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Đang phân tích</span>;
      case 'CONTAINED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã ngăn chặn</span>;
      case 'CAPA_IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Đang thực hiện CAPA</span>;
      case 'CUSTOMER_FEEDBACK_WAITING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Chờ KH xác nhận</span>;
      case 'VERIFIED_CLOSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã thẩm tra & Đóng</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 5</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Chất Lượng Khách Hàng & Xử Lý Khiếu Nại (Customer Quality)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý vòng đời khiếu nại khách hàng, truy xuất nguồn gốc lô hàng, điều tra báo cáo 8D và chỉ số PPM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('CUSTOMER')}
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
            <span>Tiếp nhận khiếu nại</span>
          </button>
        </div>
      </div>

      {/* Critical / Recurring Customer Complaint Banner */}
      {unlinkedCustomerIssues.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900">
                Cảnh báo phát hiện {unlinkedCustomerIssues.length} khiếu nại khách hàng nghiêm trọng / lỗi lặp lại cần lập hồ sơ CAPA:
              </span>
              <div className="text-rose-700 mt-0.5">
                {unlinkedCustomerIssues[0].complaintCode} - {unlinkedCustomerIssues[0].customerName} ({unlinkedCustomerIssues[0].productName}): {unlinkedCustomerIssues[0].problemDescription}
              </div>
            </div>
          </div>
          <button
            onClick={() => triggerAutoCAPAFromComplaint(unlinkedCustomerIssues[0])}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Xem xét & Tạo CAPA ngay</span>
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Chỉ số lỗi khách hàng (PPM)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {customerPPM !== null ? `${customerPPM} PPM` : '0 PPM'}
            </span>
            <span className="text-xs text-slate-400">
              ({totalAffected} / {formatNumber(totalDelivered)} SP)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Mục tiêu: ≤ {targetPPM} PPM</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tổng số vụ khiếu nại</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {filteredComplaints.length}
            </span>
            <span className="text-xs text-slate-400">vụ việc ghi nhận</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Trong khoảng thời gian lọc</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Khiếu nại đang xử lý</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums font-mono">
              {filteredComplaints.filter(r => r.status !== 'VERIFIED_CLOSED').length}
            </span>
            <span className="text-xs text-slate-400">chờ hoàn tất 8D</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Đang ngăn chặn hoặc phân tích</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Khiếu nại quá hạn mục tiêu</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums font-mono ${overdueComplaints > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueComplaints}
            </span>
            <span className="text-xs text-slate-400">cần ưu tiên xử lý</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Quá ngày cam kết phản hồi KH</p>
        </div>
      </div>

      {/* Complaints List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Nhật Ký Quản Lý Khiếu Nại Khách Hàng ({filteredComplaints.length} Hồ sơ)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Quy trình xử lý theo tiêu chuẩn 8D</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Mã khiếu nại</th>
                <th className="py-2.5 px-3 font-semibold">Ngày phản ánh</th>
                <th className="py-2.5 px-3 font-semibold">Khách hàng</th>
                <th className="py-2.5 px-3 font-semibold">Sản phẩm</th>
                <th className="py-2.5 px-3 font-semibold">Số lô / Serial</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Giao</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Lỗi</th>
                <th className="py-2.5 px-3 font-semibold text-center">Mức độ</th>
                <th className="py-2.5 px-3 font-semibold">Mô tả hiện tượng lỗi</th>
                <th className="py-2.5 px-3 font-semibold">Người phụ trách</th>
                <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Không có khiếu nại khách hàng nào trong kỳ báo cáo.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(r => {
                  const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === r.complaintCode);
                  const isCritical = r.severity === 'CRITICAL';
                  const isRecurring = filteredComplaints.filter(other => other.customerName === r.customerName && other.productCode === r.productCode).length > 1;
                  const needsCAPA = (isCritical || isRecurring) && !linkedCAPA;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{r.complaintCode}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.reportedDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.customerName}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{r.productCode}</div>
                        <div className="text-[10px] text-slate-400">{r.productName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.lotOrSerialNumber || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatNumber(r.deliveredQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-rose-600">{r.affectedQuantity}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          r.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.severity}
                        </span>
                        {linkedCAPA && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-50 text-sky-700 border border-sky-200">
                              CAPA: {linkedCAPA.capaCode}
                            </span>
                          </div>
                        )}
                        {needsCAPA && (
                          <div className="mt-1">
                            <button
                              onClick={() => triggerAutoCAPAFromComplaint(r)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors shadow-2xs"
                              title="Khiếu nại nghiêm trọng/lặp lại: Bấm để xem xét & xác nhận tạo CAPA"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Tạo CAPA (Auto)</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-[200px] truncate" title={r.problemDescription}>
                        {r.problemDescription}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{r.assignedPerson}</td>
                      <td className="py-2.5 px-3">{getStatusBadge(r.status)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(r)}
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                            title="Xem chi tiết hồ sơ 8D"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRecord(r)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded"
                            title="Cập nhật tiến độ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa khiếu nại ${r.complaintCode}?`)) deleteComplaint(r.id);
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

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Chi Tiết Khiếu Nại 8D: {selectedRecord.complaintCode}</h3>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border">
                <div><strong>Khách hàng:</strong> {selectedRecord.customerName}</div>
                <div><strong>Ngày phản ánh:</strong> {selectedRecord.reportedDate}</div>
                <div><strong>Sản phẩm:</strong> {selectedRecord.productCode}</div>
                <div><strong>Số lô/serial:</strong> {selectedRecord.lotOrSerialNumber}</div>
                <div><strong>SL giao:</strong> {selectedRecord.deliveredQuantity}</div>
                <div><strong>SL lỗi:</strong> {selectedRecord.affectedQuantity}</div>
                <div><strong>Mức độ:</strong> {selectedRecord.severity}</div>
                <div><strong>Người phụ trách:</strong> {selectedRecord.assignedPerson}</div>
              </div>

              <div>
                <strong>Mô tả chi tiết lỗi từ khách hàng:</strong>
                <p className="mt-1 p-2 bg-slate-50 rounded border text-slate-800">{selectedRecord.problemDescription}</p>
              </div>

              {selectedRecord.containmentAction && (
                <div>
                  <strong>Hành động ngăn chặn tức thời (Containment):</strong>
                  <p className="mt-1 p-2 bg-blue-50 text-blue-900 rounded border border-blue-200">{selectedRecord.containmentAction}</p>
                </div>
              )}

              {selectedRecord.rootCauseAnalysis && (
                <div>
                  <strong>Phân tích nguyên nhân gốc rễ (Root Cause):</strong>
                  <p className="mt-1 p-2 bg-slate-50 rounded border text-slate-800">{selectedRecord.rootCauseAnalysis}</p>
                </div>
              )}

              {selectedRecord.correctiveAction && (
                <div>
                  <strong>Hành động khắc phục lâu dài:</strong>
                  <p className="mt-1 p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">{selectedRecord.correctiveAction}</p>
                </div>
              )}

              {/* CAPA Status / Trigger Callout */}
              {(() => {
                const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === selectedRecord.complaintCode);
                const isCritical = selectedRecord.severity === 'CRITICAL';
                const isRecurring = filteredComplaints.filter(other => other.customerName === selectedRecord.customerName && other.productCode === selectedRecord.productCode).length > 1;

                if (linkedCAPA) {
                  return (
                    <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200 text-sky-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        <span>Hồ sơ CAPA liên kết: <strong className="font-mono">{linkedCAPA.capaCode}</strong></span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {linkedCAPA.status}
                      </span>
                    </div>
                  );
                }

                if (isCritical || isRecurring) {
                  return (
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>Khiếu nại khách hàng đạt ngưỡng kích hoạt CAPA tự động</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {isCritical ? 'Mức độ Nghiêm trọng (Critical)' : 'Khiếu nại lặp lại từ khách hàng'} - Cần mở hồ sơ 8D/CAPA để xử lý và phản hồi trong 48h.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const target = selectedRecord;
                          setSelectedRecord(null);
                          triggerAutoCAPAFromComplaint(target);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Xem xét & Tạo CAPA ngay</span>
                      </button>
                    </div>
                  );
                }

                return null;
              })()}
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

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Cập Nhật Tiến Độ Khiếu Nại: {editingRecord.complaintCode}</h3>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Trạng thái xử lý</label>
                <select
                  value={editingRecord.status}
                  onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded"
                >
                  <option value="NEW">Mới tiếp nhận</option>
                  <option value="ANALYZING">Đang phân tích nguyên nhân</option>
                  <option value="CONTAINED">Đã triển khai ngăn chặn</option>
                  <option value="CAPA_IN_PROGRESS">Đang thực hiện CAPA</option>
                  <option value="CUSTOMER_FEEDBACK_WAITING">Chờ khách hàng nghiệm thu</option>
                  <option value="VERIFIED_CLOSED">Đã xác minh hiệu lực & Đóng</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Hành động ngăn chặn tức thời</label>
                <textarea
                  rows={2}
                  value={editingRecord.containmentAction || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, containmentAction: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Phân tích nguyên nhân & Hành động khắc phục</label>
                <textarea
                  rows={2}
                  value={editingRecord.correctiveAction || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, correctiveAction: e.target.value })}
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
                  updateComplaint(editingRecord.id, editingRecord);
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
