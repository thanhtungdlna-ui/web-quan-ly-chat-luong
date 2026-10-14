/**
 * @license
 * LOL Quality Control Center - Phân hệ 3: Chất Lượng Công Đoạn IPQC (In-Process Quality Control)
 * Giám sát chất lượng SMT, lò hàn Reflow, kiểm tra quang học 3D AOI, hàn sóng và trạm FCT.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { IPQCRecord } from '../../types/quality';
import { calculateDefectRate, formatPercentage, formatNumber } from '../../utils/qualityMath';
import { 
  Cpu, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Sliders, 
  X,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface IPQCModuleProps {
  onOpenAddModal: () => void;
}

export const IPQCModule: React.FC<IPQCModuleProps> = ({ onOpenAddModal }) => {
  const { filteredIPQC, deleteIPQCRecord, updateIPQCRecord, exportModuleToCSV, kpiTargets, triggerAutoCAPAPrompt, capaRecords } = useQuality();

  const [selectedRecord, setSelectedRecord] = useState<IPQCRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<IPQCRecord | null>(null);

  // Detect unlinked critical or recurring defects in IPQC
  const unlinkedIPQCIssues = filteredIPQC.filter(r => {
    const hasCAPA = capaRecords.some(c => c.relatedReferenceCode === r.recordCode);
    if (hasCAPA) return false;
    const isCritical = r.severity === 'CRITICAL';
    const isRecurring = !!r.defectType && filteredIPQC.filter(other => other.lineId === r.lineId && other.defectType === r.defectType).length > 1;
    return isCritical || isRecurring;
  });

  const triggerAutoCAPAFromIPQC = (r: IPQCRecord) => {
    const isCritical = r.severity === 'CRITICAL';
    const isRecurring = !!r.defectType && filteredIPQC.filter(other => other.lineId === r.lineId && other.defectType === r.defectType).length > 1;
    triggerAutoCAPAPrompt({
      source: 'IPQC',
      relatedReferenceCode: r.recordCode,
      problemDescription: `Sự cố công đoạn ${r.processName} - Dây chuyền ${r.lineId} (Model ${r.productCode}): ${r.defectType || 'Lỗi quy trình sản xuất'}. Lô SX: ${r.productionLotNumber}.`,
      severity: r.severity,
      suggestedPersonnel: 'Nguyễn Tuấn Tú (Kỹ sư trưởng SMT/Process Leader)',
      department: 'Khối Kỹ thuật Quy trình SMT & Sản xuất',
      containmentAction: `Tạm dừng dây chuyền ${r.lineId}, kiểm tra 100% bo mạch đã qua công đoạn ${r.processName} trong 2 giờ gần nhất, hiệu chuẩn lại áp lực dao gạt/nhiệt độ.`,
      triggerReason: isRecurring ? `Phát hiện lỗi tái diễn "${r.defectType}" trên dây chuyền ${r.lineId}` : `Phát hiện lỗi công đoạn mức độ Nghiêm trọng (Critical)`,
      isSample: r.isSample
    });
  };

  // Statistics
  const totalInspected = filteredIPQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const totalDefects = filteredIPQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const overallDefectRate = calculateDefectRate(totalDefects, totalInspected);

  const targetIPQC = kpiTargets.find(t => t.key === 'ipqc_defect_rate')?.targetValue || 1.2;

  // Analysis by Shift
  const shiftStats: Record<string, { inspected: number; defects: number }> = {
    'Ca 1 (06:00 - 14:00)': { inspected: 0, defects: 0 },
    'Ca 2 (14:00 - 22:00)': { inspected: 0, defects: 0 },
    'Ca 3 (22:00 - 06:00)': { inspected: 0, defects: 0 },
  };

  filteredIPQC.forEach(r => {
    if (shiftStats[r.shift]) {
      shiftStats[r.shift].inspected += r.inspectedQuantity;
      shiftStats[r.shift].defects += r.defectQuantity;
    }
  });

  // Analysis by Line
  const lineStats: Record<string, { inspected: number; defects: number }> = {};
  filteredIPQC.forEach(r => {
    if (!lineStats[r.lineId]) lineStats[r.lineId] = { inspected: 0, defects: 0 };
    lineStats[r.lineId].inspected += r.inspectedQuantity;
    lineStats[r.lineId].defects += r.defectQuantity;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 3</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Chất Lượng Công Đoạn – IPQC (In-Process Quality Control)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi lỗi phát sinh trong quy trình dán bề mặt SMT, kiểm tra quang học AOI, hàn sóng và trạm đo kiểm chức năng FCT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('IPQC')}
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
            <span>Nhập kiểm tra công đoạn</span>
          </button>
        </div>
      </div>

      {/* Critical / Recurring IPQC Defects Banner */}
      {unlinkedIPQCIssues.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900">
                Cảnh báo phát hiện {unlinkedIPQCIssues.length} sự cố công đoạn IPQC nghiêm trọng / lỗi lặp lại cần lập hồ sơ CAPA:
              </span>
              <div className="text-rose-700 mt-0.5">
                {unlinkedIPQCIssues[0].recordCode} - Chuyền {unlinkedIPQCIssues[0].lineId} ({unlinkedIPQCIssues[0].processName}): {unlinkedIPQCIssues[0].defectType || 'Lỗi công đoạn'}
              </div>
            </div>
          </div>
          <button
            onClick={() => triggerAutoCAPAFromIPQC(unlinkedIPQCIssues[0])}
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
          <span className="text-xs font-medium text-slate-500">Tỷ lệ lỗi công đoạn toàn nhà máy</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {formatPercentage(overallDefectRate)}
            </span>
            <span className="text-xs text-slate-400">
              ({formatNumber(totalDefects)} / {formatNumber(totalInspected)} bo mạch)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Mục tiêu: ≤ {targetIPQC}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Số bản ghi kiểm tra IPQC</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {filteredIPQC.length}
            </span>
            <span className="text-xs text-slate-400">mẻ kiểm tra</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Trải đều trên các chuyền SMT & Lắp ráp
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Số lỗi nghiêm trọng (Critical)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 tabular-nums font-mono">
              {filteredIPQC.filter(r => r.severity === 'CRITICAL').length}
            </span>
            <span className="text-xs text-slate-400">vụ cần cô lập</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Yêu cầu dừng chuyền xử lý ngay
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Lỗi đang xử lý (In-Progress)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums font-mono">
              {filteredIPQC.filter(r => r.status === 'IN_PROGRESS' || r.status === 'OPEN').length}
            </span>
            <span className="text-xs text-slate-400">chờ khắc phục</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Đang phân tích nguyên nhân kỹ thuật
          </p>
        </div>
      </div>

      {/* Comparisons: By Shift & By Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison by Shift */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              So Sánh Chất Lượng Giữa Các Ca Sản Xuất
            </h3>
            <span className="text-xs text-slate-400 font-mono">Ca 1, Ca 2, Ca 3</span>
          </div>
          <div className="space-y-3">
            {Object.entries(shiftStats).map(([shiftName, stat]) => {
              const rate = calculateDefectRate(stat.defects, stat.inspected);
              const isHigh = rate !== null && rate > targetIPQC;
              return (
                <div key={shiftName} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">{shiftName}</span>
                    <span className={`font-mono tabular-nums font-bold ${isHigh ? 'text-rose-600' : 'text-emerald-700'}`}>
                      Tỷ lệ lỗi: {formatPercentage(rate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Kiểm tra: {formatNumber(stat.inspected)} bo</span>
                    <span>Phát hiện: {stat.defects} lỗi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison by Line */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Tỷ Lệ Lỗi Theo Từng Dây Chuyền Sản Xuất
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dây chuyền</span>
          </div>
          <div className="space-y-3">
            {Object.entries(lineStats).map(([lineId, stat]) => {
              const rate = calculateDefectRate(stat.defects, stat.inspected);
              const isHigh = rate !== null && rate > targetIPQC;
              return (
                <div key={lineId} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">Dây chuyền {lineId}</span>
                    <span className={`font-mono tabular-nums font-bold ${isHigh ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatPercentage(rate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Số lượng kiểm: {formatNumber(stat.inspected)}</span>
                    <span>Số lỗi: {stat.defects}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* IPQC Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Nhật Ký Kiểm Tra Công Đoạn IPQC ({filteredIPQC.length} Bản ghi)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Cập nhật liên tục từ các trạm kiểm tra</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Mã bản ghi</th>
                <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                <th className="py-2.5 px-3 font-semibold">Chuyền / Ca</th>
                <th className="py-2.5 px-3 font-semibold">Công đoạn</th>
                <th className="py-2.5 px-3 font-semibold">Model / Lô SX</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Kiểm</th>
                <th className="py-2.5 px-3 font-semibold text-right">SL Lỗi</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tỷ lệ lỗi</th>
                <th className="py-2.5 px-3 font-semibold">Loại lỗi phát hiện</th>
                <th className="py-2.5 px-3 font-semibold text-center">Mức độ</th>
                <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIPQC.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    Chưa có bản ghi IPQC phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredIPQC.map(r => {
                  const rate = calculateDefectRate(r.defectQuantity, r.inspectedQuantity);
                  const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === r.recordCode);
                  const isCritical = r.severity === 'CRITICAL';
                  const isRecurring = !!r.defectType && filteredIPQC.filter(other => other.lineId === r.lineId && other.defectType === r.defectType).length > 1;
                  const needsCAPA = (isCritical || isRecurring) && !linkedCAPA;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{r.recordCode}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.inspectionTime}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{r.lineId}</div>
                        <div className="text-[10px] text-slate-400">{r.shift.slice(0, 4)}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{r.processName}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{r.productCode}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.productionLotNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatNumber(r.inspectedQuantity)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-rose-600">{r.defectQuantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {formatPercentage(rate)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{r.defectType || '—'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          r.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : r.severity === 'MAJOR' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
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
                              onClick={() => triggerAutoCAPAFromIPQC(r)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors shadow-2xs"
                              title="Lỗi công đoạn nghiêm trọng/lặp lại: Bấm để xem xét & xác nhận tạo CAPA"
                            >
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Tạo CAPA (Auto)</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          r.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700' : r.status === 'RESOLVED' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {r.status}
                        </span>
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
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa bản ghi IPQC ${r.recordCode}?`)) deleteIPQCRecord(r.id);
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

      {/* View Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-semibold text-slate-900">Chi Tiết Kiểm Tra IPQC: {selectedRecord.recordCode}</h3>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Dây chuyền:</strong> {selectedRecord.lineId}</div>
                <div><strong>Công đoạn:</strong> {selectedRecord.processName}</div>
                <div><strong>Ca sản xuất:</strong> {selectedRecord.shift}</div>
                <div><strong>Sản phẩm:</strong> {selectedRecord.productCode}</div>
                <div><strong>Lệnh SX (WO):</strong> {selectedRecord.workOrderNumber}</div>
                <div><strong>Lô SX:</strong> {selectedRecord.productionLotNumber}</div>
                <div><strong>SL kiểm tra:</strong> {selectedRecord.inspectedQuantity}</div>
                <div><strong>SL lỗi:</strong> {selectedRecord.defectQuantity}</div>
                <div><strong>Người kiểm tra:</strong> {selectedRecord.inspector}</div>
                <div><strong>Người xử lý:</strong> {selectedRecord.handler || 'Chưa gán'}</div>
              </div>

              {selectedRecord.defectType && (
                <div className="pt-2"><strong>Loại lỗi:</strong> {selectedRecord.defectType}</div>
              )}
              {selectedRecord.suspectedCause && (
                <div><strong>Nguyên nhân nghi ngờ:</strong> {selectedRecord.suspectedCause}</div>
              )}
              {selectedRecord.confirmedCause && (
                <div><strong>Nguyên nhân xác nhận:</strong> {selectedRecord.confirmedCause}</div>
              )}
              {selectedRecord.immediateAction && (
                <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-blue-900">
                  <strong>Hành động tức thời:</strong> {selectedRecord.immediateAction}
                </div>
              )}

              {/* CAPA Status / Trigger Callout */}
              {(() => {
                const linkedCAPA = capaRecords.find(c => c.relatedReferenceCode === selectedRecord.recordCode);
                const isCritical = selectedRecord.severity === 'CRITICAL';
                const isRecurring = !!selectedRecord.defectType && filteredIPQC.filter(other => other.lineId === selectedRecord.lineId && other.defectType === selectedRecord.defectType).length > 1;

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
                          <span>Sự cố công đoạn đạt ngưỡng kích hoạt CAPA tự động</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {isCritical ? 'Mức độ Nghiêm trọng (Critical)' : 'Phát hiện lỗi tái diễn trên cùng chuyền/công đoạn'} - Cần mở hồ sơ CAPA xử lý ngay.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const target = selectedRecord;
                          setSelectedRecord(null);
                          triggerAutoCAPAFromIPQC(target);
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
              <h3 className="font-semibold text-slate-900">Cập Nhật IPQC: {editingRecord.recordCode}</h3>
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
                  <option value="OPEN">Đang mở (OPEN)</option>
                  <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                  <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
                  <option value="CLOSED">Đã đóng (CLOSED)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nguyên nhân đã xác nhận</label>
                <textarea
                  rows={2}
                  value={editingRecord.confirmedCause || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, confirmedCause: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Hành động khắc phục tức thời</label>
                <textarea
                  rows={2}
                  value={editingRecord.immediateAction || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, immediateAction: e.target.value })}
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
                  updateIPQCRecord(editingRecord.id, editingRecord);
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
