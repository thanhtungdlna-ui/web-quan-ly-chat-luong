/**
 * @license
 * LOL Quality Control Center - Phân hệ 2: Chất Lượng Đầu Vào IQC (Incoming Quality Control)
 * Quản lý kiểm tra nguyên vật liệu, đánh giá lô đạt/không đạt và xếp hạng nhà cung cấp.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { IQCRecord } from '../../types/quality';
import { calculateDefectRate, calculateLotPassRate, formatPercentage, formatNumber } from '../../utils/qualityMath';
import { 
  PackageCheck, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert,
  X
} from 'lucide-react';

interface IQCModuleProps {
  onOpenAddModal: () => void;
}

export const IQCModule: React.FC<IQCModuleProps> = ({ onOpenAddModal }) => {
  const { filteredIQC, deleteIQCRecord, updateIQCRecord, exportModuleToCSV, triggerAutoCAPAPrompt, capaRecords } = useQuality();

  const [selectedRecord, setSelectedRecord] = useState<IQCRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<IQCRecord | null>(null);

  // Statistics calculation
  const totalLots = filteredIQC.length;
  const passedLots = filteredIQC.filter(r => r.result === 'PASS').length;
  const failedLots = filteredIQC.filter(r => r.result === 'FAIL').length;
  const pendingLots = filteredIQC.filter(r => r.result === 'PENDING').length;
  const lotPassRate = calculateLotPassRate(passedLots, totalLots);

  const totalInspectedQty = filteredIQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const totalDefectQty = filteredIQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const defectRate = calculateDefectRate(totalDefectQty, totalInspectedQty);

  // Supplier recurrence detection (suppliers with multiple rejected lots)
  const supplierRejectionCount: Record<string, number> = {};
  filteredIQC.forEach(r => {
    if (r.result === 'FAIL') {
      supplierRejectionCount[r.supplierName] = (supplierRejectionCount[r.supplierName] || 0) + 1;
    }
  });

  const recurringSuppliers = Object.entries(supplierRejectionCount).filter(([_, count]) => count > 1);

  // Detect critical or recurring IQC defects that have no CAPA yet
  const unlinkedIQCIssues = filteredIQC.filter(r => {
    const hasCAPA = capaRecords.some(c => c.relatedReferenceCode === r.recordCode);
    if (hasCAPA) return false;
    const isCritical = r.severity === 'CRITICAL' || r.decision === 'REJECT_RETURN' || r.decision === 'QUARANTINE';
    const isRecurring = r.result === 'FAIL' && filteredIQC.filter(other => other.supplierId === r.supplierId && other.result === 'FAIL').length > 1;
    return isCritical || isRecurring;
  });

  const triggerAutoCAPAFromIQC = (r: IQCRecord) => {
    const isCritical = r.severity === 'CRITICAL' || r.decision === 'REJECT_RETURN' || r.decision === 'QUARANTINE';
    const isRecurring = r.result === 'FAIL' && filteredIQC.filter(other => other.supplierId === r.supplierId && other.result === 'FAIL').length > 1;
    triggerAutoCAPAPrompt({
      source: 'IQC',
      relatedReferenceCode: r.recordCode,
      problemDescription: `Sự cố chất lượng đầu vào linh kiện ${r.componentName} (${r.componentCode}) từ NCC ${r.supplierName}: ${r.defectType || 'Lô hàng không đạt tiêu chuẩn nghiệm thu AQL'}. Mã lô: ${r.lotNumber}.`,
      severity: r.severity,
      suggestedPersonnel: 'Lê Văn Cường (Kỹ sư Quản lý NCC - SQE)',
      department: 'Bộ phận Quản lý chất lượng NCC (SQE)',
      containmentAction: `Cách ly toàn bộ lô hàng ${r.lotNumber} tại kho biệt trữ IQC, dán tem ĐỎ HOLD và yêu cầu nhà cung cấp ${r.supplierName} ban hành báo cáo 8D trong 48h.`,
      triggerReason: isRecurring ? `Phát hiện lỗi lặp lại từ nhà cung cấp ${r.supplierName}` : `Phát hiện lỗi linh kiện mức độ Nghiêm trọng (Critical)`,
      isSample: r.isSample
    });
  };

  const getDecisionBadge = (decision: IQCRecord['decision']) => {
    switch (decision) {
      case 'ACCEPT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Chấp nhận nhập kho</span>;
      case 'QUARANTINE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Cách ly tại kho IQC</span>;
      case 'REJECT_RETURN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Từ chối - Trả NCC</span>;
      case 'CONCESSION_PENDING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Chờ phê duyệt nhân nhượng</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">{decision}</span>;
    }
  };

  const getResultBadge = (result: IQCRecord['result']) => {
    switch (result) {
      case 'PASS':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Đạt</span>;
      case 'FAIL':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700"><XCircle className="w-3.5 h-3.5" /> Không đạt</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700"><Clock className="w-3.5 h-3.5" /> Chờ xử lý</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Summary banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 2</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Chất Lượng Đầu Vào – IQC (Incoming Quality Control)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm tra nguyên vật liệu và linh kiện điện tử nhận từ nhà cung cấp trước khi nhập kho sản xuất.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('IQC')}
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
            <span>Thêm lô kiểm tra</span>
          </button>
        </div>
      </div>

      {/* Critical / Recurring IQC Defects Banner */}
      {unlinkedIQCIssues.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900">
                Cảnh báo phát hiện {unlinkedIQCIssues.length} lô linh kiện đầu vào nghiêm trọng / lỗi lặp lại cần lập hồ sơ CAPA:
              </span>
              <div className="text-rose-700 mt-0.5">
                {unlinkedIQCIssues[0].recordCode} - {unlinkedIQCIssues[0].componentName} ({unlinkedIQCIssues[0].supplierName}): {unlinkedIQCIssues[0].defectType || 'Lô kiểm tra không đạt'}
              </div>
            </div>
          </div>
          <button
            onClick={() => triggerAutoCAPAFromIQC(unlinkedIQCIssues[0])}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Xem xét & Tạo CAPA ngay</span>
          </button>
        </div>
      )}

      {/* IQC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Defect Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tỷ lệ lỗi theo SL kiểm tra (%)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {formatPercentage(defectRate)}
            </span>
            <span className="text-xs text-slate-400">
              ({formatNumber(totalDefectQty)} / {formatNumber(totalInspectedQty)} LK)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Công thức: (Tổng SL lỗi / Tổng SL kiểm tra) × 100
          </p>
        </div>

        {/* Metric 2: Lot Pass Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tỷ lệ lô đạt tiêu chuẩn (%)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">
              {formatPercentage(lotPassRate)}
            </span>
            <span className="text-xs text-slate-400">
              ({passedLots} / {totalLots} Lô)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Phân biệt với tỷ lệ lỗi linh kiện
          </p>
        </div>

        {/* Metric 3: Rejected / Quarantined Lots */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Số lô không đạt / Bị giữ</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums font-mono ${failedLots > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {failedLots}
            </span>
            <span className="text-xs text-slate-400">lô cần hành động</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Đang cách ly hoặc yêu cầu SCAR
          </p>
        </div>

        {/* Metric 4: Pending inspection */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Lô đang chờ thẩm tra</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums font-mono">
              {pendingLots}
            </span>
            <span className="text-xs text-slate-400">lô đang lấy mẫu</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Theo tiêu chuẩn lấy mẫu AQL
          </p>
        </div>
      </div>

      {/* Recurrence Warning Banner if applicable */}
      {recurringSuppliers.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-950">Phát hiện lỗi lặp lại từ nhà cung cấp: </span>
            <span>
              {recurringSuppliers.map(([name, count]) => `${name} (${count} lô lỗi)`).join(', ')}. 
              Vui lòng xem xét phát hành yêu cầu hành động khắc phục nhà cung cấp (SCAR).
            </span>
          </div>
        </div>
      )}

      {/* Table of IQC Records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Danh Sách Kết Quả Kiểm Tra IQC ({filteredIQC.length} Bản ghi)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Hiển thị theo bộ lọc đang chọn
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Mã bản ghi</th>
                <th className="py-2.5 px-3 font-semibold">Ngày nhận</th>
                <th className="py-2.5 px-3 font-semibold">Nhà cung cấp</th>
                <th className="py-2.5 px-3 font-semibold">Linh kiện / Vật liệu</th>
                <th className="py-2.5 px-3 font-semibold">Mã lô / Phiếu</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Nhận</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Kiểm</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Lỗi</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tỷ lệ lỗi</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kết quả</th>
                <th className="py-2.5 px-3 font-semibold">Quyết định xử lý</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIQC.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Chưa có bản ghi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredIQC.map(r => {
                  const rate = calculateDefectRate(r.defectQuantity, r.inspectedQuantity);
                  const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === r.recordCode);
                  const isCritical = r.severity === 'CRITICAL' || r.decision === 'REJECT_RETURN' || r.decision === 'QUARANTINE';
                  const isRecurring = r.result === 'FAIL' && filteredIQC.filter(other => other.supplierId === r.supplierId && other.result === 'FAIL').length > 1;
                  const needsCAPA = (isCritical || isRecurring) && !linkedCAPA;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">
                        {r.recordCode}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.receiptDate}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{r.supplierName}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{r.componentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.componentCode}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        <div>{r.lotNumber}</div>
                        {r.deliveryNoteNumber && <div className="text-[10px] text-slate-400">{r.deliveryNoteNumber}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatNumber(r.receivedQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatNumber(r.inspectedQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-rose-600">
                        {r.defectQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {formatPercentage(rate)}
                      </td>
                      <td className="py-2.5 px-3 text-center">{getResultBadge(r.result)}</td>
                      <td className="py-2.5 px-3">
                        <div>{getDecisionBadge(r.decision)}</div>
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
                              onClick={() => triggerAutoCAPAFromIQC(r)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors shadow-2xs"
                              title="Phát hiện lỗi nghiêm trọng/lặp lại: Bấm để xem xét & xác nhận tạo CAPA"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Tạo CAPA (Auto)</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(r)}
                            className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRecord(r)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded"
                            title="Sửa bản ghi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa bản ghi ${r.recordCode}?`)) {
                                deleteIQCRecord(r.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded"
                            title="Xóa bản ghi"
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

      {/* View Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Chi Tiết Hồ Sơ IQC: {selectedRecord.recordCode}</h3>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Nhà cung cấp:</strong> {selectedRecord.supplierName}</div>
                <div><strong>Ngày nhận:</strong> {selectedRecord.receiptDate}</div>
                <div><strong>Linh kiện:</strong> {selectedRecord.componentName}</div>
                <div><strong>Mã lô:</strong> {selectedRecord.lotNumber}</div>
                <div><strong>SL kiểm tra:</strong> {selectedRecord.inspectedQuantity}</div>
                <div><strong>SL lỗi:</strong> {selectedRecord.defectQuantity}</div>
                <div><strong>Mức độ:</strong> {selectedRecord.severity}</div>
                <div><strong>Người kiểm tra:</strong> {selectedRecord.inspector}</div>
              </div>
              {selectedRecord.defectType && (
                <div className="pt-2"><strong>Loại lỗi:</strong> {selectedRecord.defectType}</div>
              )}
              {selectedRecord.notes && (
                <div><strong>Ghi chú:</strong> {selectedRecord.notes}</div>
              )}
              {selectedRecord.correctiveAction && (
                <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900">
                  <strong>Hành động khắc phục:</strong> {selectedRecord.correctiveAction}
                </div>
              )}

              {/* CAPA Status / Trigger Callout */}
              {(() => {
                const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === selectedRecord.recordCode);
                const isCritical = selectedRecord.severity === 'CRITICAL' || selectedRecord.decision === 'REJECT_RETURN' || selectedRecord.decision === 'QUARANTINE';
                const isRecurring = selectedRecord.result === 'FAIL' && filteredIQC.filter(other => other.supplierId === selectedRecord.supplierId && other.result === 'FAIL').length > 1;

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
                          <span>Sự cố chất lượng đạt ngưỡng kích hoạt CAPA tự động</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {isCritical ? 'Mức độ Nghiêm trọng (Critical)' : 'Phát hiện lỗi lặp lại từ nhà cung cấp'} - Cần mở hồ sơ 8D/CAPA để khắc phục.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const target = selectedRecord;
                          setSelectedRecord(null);
                          triggerAutoCAPAFromIQC(target);
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

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Chỉnh Sửa Hồ Sơ IQC: {editingRecord.recordCode}</h3>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Quyết định xử lý</label>
                <select
                  value={editingRecord.decision}
                  onChange={e => setEditingRecord({ ...editingRecord, decision: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded"
                >
                  <option value="ACCEPT">Chấp nhận nhập kho</option>
                  <option value="QUARANTINE">Cách ly tại kho IQC</option>
                  <option value="REJECT_RETURN">Từ chối - Trả NCC</option>
                  <option value="CONCESSION_PENDING">Chờ phê duyệt nhân nhượng</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Kết quả kiểm tra</label>
                <select
                  value={editingRecord.result}
                  onChange={e => setEditingRecord({ ...editingRecord, result: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded"
                >
                  <option value="PASS">Đạt (PASS)</option>
                  <option value="FAIL">Không đạt (FAIL)</option>
                  <option value="PENDING">Chờ xử lý (PENDING)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Ghi chú & Hành động khắc phục</label>
                <textarea
                  rows={3}
                  value={editingRecord.notes || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, notes: e.target.value })}
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
                  updateIQCRecord(editingRecord.id, editingRecord);
                  setEditingRecord(null);
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
