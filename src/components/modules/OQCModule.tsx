/**
 * @license
 * LOL Quality Control Center - Phân hệ 4: Chất Lượng Đầu Ra OQC/FQC (Outgoing / Final Quality Control)
 * Quản lý nghiệm thu thành phẩm trước khi xuất xưởng giao khách hàng.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { OQCRecord } from '../../types/quality';
import { calculatePassRate, formatPercentage, formatNumber } from '../../utils/qualityMath';
import { 
  Truck, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  ShieldCheck, 
  Lock,
  X,
  ShieldAlert
} from 'lucide-react';

interface OQCModuleProps {
  onOpenAddModal: () => void;
}

export const OQCModule: React.FC<OQCModuleProps> = ({ onOpenAddModal }) => {
  const { filteredOQC, deleteOQCRecord, updateOQCRecord, exportModuleToCSV, kpiTargets, triggerAutoCAPAPrompt, capaRecords } = useQuality();

  const [selectedRecord, setSelectedRecord] = useState<OQCRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<OQCRecord | null>(null);

  // Detect unlinked critical or recurring defects in OQC
  const unlinkedOQCIssues = filteredOQC.filter(r => {
    const hasCAPA = capaRecords.some(c => c.relatedReferenceCode === r.recordCode);
    if (hasCAPA) return false;
    const isCritical = r.shippingDecision === 'HOLD' || r.result === 'FAIL' || r.isQuarantined || r.defectQuantity > 2;
    const isRecurring = r.defectQuantity > 0 && filteredOQC.filter(other => other.productCode === r.productCode && other.defectQuantity > 0).length > 1;
    return isCritical || isRecurring;
  });

  const triggerAutoCAPAFromOQC = (r: OQCRecord) => {
    const isCritical = r.shippingDecision === 'HOLD' || r.result === 'FAIL' || r.isQuarantined;
    const isRecurring = r.defectQuantity > 0 && filteredOQC.filter(other => other.productCode === r.productCode && other.defectQuantity > 0).length > 1;
    triggerAutoCAPAPrompt({
      source: 'OQC',
      relatedReferenceCode: r.recordCode,
      problemDescription: `Sự cố nghiệm thu xuất xưởng thành phẩm ${r.productName} (${r.productCode}) - Khách hàng: ${r.intendedCustomer}: ${r.defectType || 'Lô thành phẩm không đạt tiêu chuẩn xuất hàng'}. Lô TP: ${r.finishedLotNumber}.`,
      severity: (r.defectQuantity > 2 || r.shippingDecision === 'HOLD') ? 'CRITICAL' : 'MAJOR',
      suggestedPersonnel: 'Đặng Quốc Huy (Trưởng nhóm nghiệm thu OQC / QA Lead)',
      department: 'Bộ phận Đảm bảo chất lượng xuất xưởng (OQC/QA)',
      containmentAction: `Niêm phong cách ly toàn bộ lô thành phẩm ${r.finishedLotNumber} tại khu vực OQC HOLD, tạm dừng cấp tem xuất kho và thông báo ban giám đốc.`,
      triggerReason: isRecurring ? `Phát hiện lỗi xuất xưởng lặp lại trên model ${r.productCode}` : `Lô thành phẩm bị tạm giữ xuất hàng (OQC HOLD / FAIL)`,
      isSample: r.isSample
    });
  };

  // Statistics
  const totalInspected = filteredOQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const totalPassed = filteredOQC.reduce((acc, r) => acc + r.passedQuantity, 0);
  const totalDefects = filteredOQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const passRate = calculatePassRate(totalPassed, totalInspected);

  const releasedLots = filteredOQC.filter(r => r.shippingDecision === 'RELEASE').length;
  const heldLots = filteredOQC.filter(r => r.shippingDecision === 'HOLD' || r.isQuarantined).length;

  const targetOQC = kpiTargets.find(t => t.key === 'oqc_pass_rate')?.targetValue || 99.0;

  const getShippingDecisionBadge = (decision: OQCRecord['shippingDecision']) => {
    switch (decision) {
      case 'RELEASE':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Cho phép xuất hàng</span>;
      case 'HOLD':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Tạm giữ - Cách ly</span>;
      case 'REWORK':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Chuyển tái chế</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Chờ giám đốc duyệt</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">{decision}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 4</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Chất Lượng Đầu Ra – OQC/FQC (Outgoing / Final Quality Control)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm tra thành phẩm điện tử xuất xưởng, quyết định phê duyệt xuất hàng và quản lý cách ly lô hàng không đạt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('OQC')}
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
            <span>Kiểm tra lô xuất</span>
          </button>
        </div>
      </div>

      {/* Critical / Recurring OQC Defects Banner */}
      {unlinkedOQCIssues.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900">
                Cảnh báo phát hiện {unlinkedOQCIssues.length} lô xuất xưởng OQC bị giữ/lỗi nghiêm trọng chưa có hồ sơ CAPA:
              </span>
              <div className="text-rose-700 mt-0.5">
                {unlinkedOQCIssues[0].recordCode} - {unlinkedOQCIssues[0].productName} ({unlinkedOQCIssues[0].intendedCustomer}): Lô {unlinkedOQCIssues[0].finishedLotNumber} (Quyết định: {unlinkedOQCIssues[0].shippingDecision})
              </div>
            </div>
          </div>
          <button
            onClick={() => triggerAutoCAPAFromOQC(unlinkedOQCIssues[0])}
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
          <span className="text-xs font-medium text-slate-500">Tỷ lệ đạt kiểm tra đầu ra OQC (%)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">
              {formatPercentage(passRate)}
            </span>
            <span className="text-xs text-slate-400">
              ({formatNumber(totalPassed)} / {formatNumber(totalInspected)} mẫu TP)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Mục tiêu: ≥ {targetOQC}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Số lô đã duyệt xuất xưởng</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {releasedLots}
            </span>
            <span className="text-xs text-slate-400">/ {filteredOQC.length} lô</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Đạt tiêu chuẩn xuất giao</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Số lô đang bị giữ / Cách ly</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums font-mono ${heldLots > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {heldLots}
            </span>
            <span className="text-xs text-slate-400">lô niêm phong</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Tuyệt đối không xuất hàng</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Tổng sản phẩm thành phẩm kiểm tra</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {formatNumber(filteredOQC.reduce((acc, r) => acc + r.finishedQuantity, 0))}
            </span>
            <span className="text-xs text-slate-400">chiếc</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Theo kế hoạch giao hàng</p>
        </div>
      </div>

      {/* OQC Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Nhật Ký Nghiệm Thu Xuất Xưởng OQC ({filteredOQC.length} Lô thành phẩm)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Tra cứu nhanh lịch sử kiểm tra trước khi xuất</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Mã bản ghi</th>
                <th className="py-2.5 px-3 font-semibold">Ngày KT</th>
                <th className="py-2.5 px-3 font-semibold">Mã sản phẩm & Tên</th>
                <th className="py-2.5 px-3 font-semibold">Lô TP / Lệnh SX</th>
                <th className="py-2.5 px-3 font-semibold">Khách hàng</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Thành phẩm</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Kiểm tra</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Đạt</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Lỗi</th>
                <th className="py-2.5 px-3 font-semibold">Quyết định xuất hàng</th>
                <th className="py-2.5 px-3 font-semibold">Người duyệt</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOQC.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Chưa có hồ sơ kiểm tra OQC nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOQC.map(r => {
                  const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === r.recordCode);
                  const isCritical = r.shippingDecision === 'HOLD' || r.result === 'FAIL' || r.isQuarantined || r.defectQuantity > 2;
                  const isRecurring = r.defectQuantity > 0 && filteredOQC.filter(other => other.productCode === r.productCode && other.defectQuantity > 0).length > 1;
                  const needsCAPA = (isCritical || isRecurring) && !linkedCAPA;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{r.recordCode}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.inspectionDate}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{r.productCode}</div>
                        <div className="text-[10px] text-slate-500">{r.productName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        <div>{r.finishedLotNumber}</div>
                        <div className="text-[10px] text-slate-400">{r.workOrderNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{r.intendedCustomer}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatNumber(r.finishedQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatNumber(r.inspectedQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">{formatNumber(r.passedQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-600 font-semibold">{r.defectQuantity}</td>
                      <td className="py-2.5 px-3">
                        <div>{getShippingDecisionBadge(r.shippingDecision)}</div>
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
                              onClick={() => triggerAutoCAPAFromOQC(r)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors shadow-2xs"
                              title="Lô bị giữ/lỗi nghiêm trọng: Bấm để xem xét & xác nhận tạo CAPA"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Tạo CAPA (Auto)</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{r.approver || 'Chưa duyệt'}</td>
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
                          title="Chỉnh sửa phê duyệt"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa bản ghi OQC ${r.recordCode}?`)) deleteOQCRecord(r.id);
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

      {/* View Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Chi Tiết Hồ Sơ OQC: {selectedRecord.recordCode}</h3>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Mã sản phẩm:</strong> {selectedRecord.productCode}</div>
                <div><strong>Tên sản phẩm:</strong> {selectedRecord.productName}</div>
                <div><strong>Khách hàng dự kiến:</strong> {selectedRecord.intendedCustomer}</div>
                <div><strong>Lô thành phẩm:</strong> {selectedRecord.finishedLotNumber}</div>
                <div><strong>SL thành phẩm:</strong> {selectedRecord.finishedQuantity}</div>
                <div><strong>SL kiểm tra:</strong> {selectedRecord.inspectedQuantity}</div>
                <div><strong>SL đạt:</strong> {selectedRecord.passedQuantity}</div>
                <div><strong>SL lỗi:</strong> {selectedRecord.defectQuantity}</div>
                <div><strong>Người kiểm tra:</strong> {selectedRecord.inspector}</div>
                <div><strong>Người phê duyệt:</strong> {selectedRecord.approver || 'Chưa phê duyệt'}</div>
              </div>
              {selectedRecord.notes && (
                <div className="pt-2"><strong>Ghi chú kiểm tra:</strong> {selectedRecord.notes}</div>
              )}
              {selectedRecord.isQuarantined && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Lô hàng đang bị niêm phong cách ly tại khu vực OQC HOLD.</span>
                </div>
              )}

              {/* CAPA Status / Trigger Callout */}
              {(() => {
                const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === selectedRecord.recordCode);
                const isCritical = selectedRecord.shippingDecision === 'HOLD' || selectedRecord.result === 'FAIL' || selectedRecord.isQuarantined || selectedRecord.defectQuantity > 2;
                const isRecurring = selectedRecord.defectQuantity > 0 && filteredOQC.filter(other => other.productCode === selectedRecord.productCode && other.defectQuantity > 0).length > 1;

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
                          <span>Lô xuất xưởng đạt ngưỡng kích hoạt CAPA tự động</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {isCritical ? 'Lô thành phẩm bị HOLD/Không đạt' : 'Phát hiện lỗi xuất xưởng lặp lại'} - Cần mở hồ sơ CAPA xử lý ngăn chặn trước khi giao hàng.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const target = selectedRecord;
                          setSelectedRecord(null);
                          triggerAutoCAPAFromOQC(target);
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

      {/* Edit Approval Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Phê Duyệt Xuất Hàng: {editingRecord.recordCode}</h3>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Quyết định xuất hàng</label>
                <select
                  value={editingRecord.shippingDecision}
                  onChange={e => setEditingRecord({
                    ...editingRecord,
                    shippingDecision: e.target.value as any,
                    isQuarantined: e.target.value === 'HOLD'
                  })}
                  className="w-full px-2.5 py-1.5 border rounded"
                >
                  <option value="RELEASE">Cho phép xuất hàng (RELEASE)</option>
                  <option value="HOLD">Tạm giữ cách ly (HOLD)</option>
                  <option value="REWORK">Tái chế lại (REWORK)</option>
                  <option value="PENDING_APPROVAL">Chờ phê duyệt ban giám đốc</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Người phê duyệt</label>
                <input
                  type="text"
                  value={editingRecord.approver || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, approver: e.target.value })}
                  placeholder="Họ tên người duyệt (QA Manager / Director)..."
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Ghi chú phê duyệt</label>
                <textarea
                  rows={2}
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
                  updateOQCRecord(editingRecord.id, editingRecord);
                  setEditingRecord(null);
                }}
                className="px-4 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold"
              >
                Lưu phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
