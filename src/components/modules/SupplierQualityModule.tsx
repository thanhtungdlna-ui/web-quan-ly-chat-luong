/**
 * @license
 * LOL Quality Control Center - Phân hệ 8: Chất Lượng Nhà Cung Cấp (Supplier Quality Management - SQE)
 * Đánh giá xếp hạng nhà cung cấp, theo dõi tỷ lệ lô không đạt và quản lý yêu cầu khắc phục SCAR.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { calculateDefectRate, calculateLotPassRate, formatPercentage, formatNumber } from '../../utils/qualityMath';
import { 
  Building2, 
  Award, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Download, 
  Send,
  ExternalLink,
  X 
} from 'lucide-react';

export const SupplierQualityModule: React.FC = () => {
  const { suppliers, filteredIQC, filteredCAPA, exportModuleToCSV } = useQuality();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Calculate metrics for each supplier
  const supplierStats = suppliers.map(sup => {
    const records = filteredIQC.filter(r => r.supplierId === sup.id || r.supplierName === sup.name);
    const totalLots = records.length;
    const passedLots = records.filter(r => r.result === 'PASS').length;
    const failedLots = records.filter(r => r.result === 'FAIL').length;
    const lotRejectionRate = totalLots > 0 ? (failedLots / totalLots) * 100 : 0;

    const totalInspected = records.reduce((acc, r) => acc + r.inspectedQuantity, 0);
    const totalDefects = records.reduce((acc, r) => acc + r.defectQuantity, 0);
    const defectRate = calculateDefectRate(totalDefects, totalInspected);

    const criticalDefects = records.filter(r => r.severity === 'CRITICAL').length;
    const openCAPA = filteredCAPA.filter(c => c.source === 'IQC' && c.problemDescription.toLowerCase().includes(sup.name.toLowerCase()) && c.status !== 'CLOSED').length;

    // Rating formula explanation:
    // Base 100 points:
    // - Minus 15 points per failed lot
    // - Minus 20 points per critical defect
    // - Minus 10 points per open CAPA
    let qualityScore = 100 - (failedLots * 15) - (criticalDefects * 20) - (openCAPA * 10);
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    let evaluatedGrade: 'A' | 'B' | 'C' | 'D' = 'A';
    if (qualityScore < 60) evaluatedGrade = 'D';
    else if (qualityScore < 75) evaluatedGrade = 'C';
    else if (qualityScore < 90) evaluatedGrade = 'B';

    return {
      supplier: sup,
      records,
      totalLots,
      passedLots,
      failedLots,
      lotRejectionRate,
      totalInspected,
      totalDefects,
      defectRate,
      criticalDefects,
      openCAPA,
      qualityScore,
      evaluatedGrade
    };
  });

  const selectedStat = supplierStats.find(s => s.supplier.id === selectedSupplierId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 8</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Chất Lượng Nhà Cung Cấp (Supplier Quality)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng điểm xếp hạng chất lượng nhà cung cấp (A/B/C/D) dựa trên dữ liệu nghiệm thu IQC thực tế.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('IQC')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất dữ liệu IQC</span>
          </button>
        </div>
      </div>

      {/* Scoring basis explanation */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Award className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">Cơ sở tính điểm xếp hạng chất lượng NCC (Q-Score): </span>
          <span>
            Điểm khởi điểm 100 điểm. Trừ 15 điểm cho mỗi lô hàng bị từ chối; trừ 20 điểm cho mỗi lỗi nghiêm trọng (Critical); trừ 10 điểm cho mỗi yêu cầu SCAR quá hạn.
            Thang xếp hạng: <strong>Hạng A (≥ 90)</strong>: Ưu tiên đặt hàng; <strong>Hạng B (75 - 89)</strong>: Đạt chuẩn; <strong>Hạng C (60 - 74)</strong>: Cảnh báo; <strong>Hạng D (&lt; 60)</strong>: Tạm dừng cấp hàng & audit lại.
          </span>
        </div>
      </div>

      {/* Supplier Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supplierStats.map(stat => (
          <div
            key={stat.supplier.id}
            onClick={() => setSelectedSupplierId(stat.supplier.id)}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{stat.supplier.code}</span>
                <h3 className="font-semibold text-slate-900 text-sm">{stat.supplier.name}</h3>
                <span className="text-xs text-slate-500">{stat.supplier.category}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-base font-extrabold px-2.5 py-0.5 rounded font-mono ${
                  stat.evaluatedGrade === 'A' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  stat.evaluatedGrade === 'B' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                  stat.evaluatedGrade === 'C' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  Hạng {stat.evaluatedGrade}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Điểm: {stat.qualityScore}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">Tổng số lô nhận:</span>
                <span className="font-mono font-semibold text-slate-800">{stat.totalLots} lô</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lô không đạt:</span>
                <span className={`font-mono font-semibold ${stat.failedLots > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {stat.failedLots} lô ({stat.lotRejectionRate.toFixed(1)}%)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tỷ lệ lỗi linh kiện:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatPercentage(stat.defectRate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lỗi nghiêm trọng:</span>
                <span className={`font-mono font-semibold ${stat.criticalDefects > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {stat.criticalDefects} vụ
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-sky-600 font-medium">
              <span>Xem lịch sử lô hàng</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Detail Modal */}
      {selectedStat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{selectedStat.supplier.name} ({selectedStat.supplier.code})</h3>
                <span className="text-xs text-slate-500">Người liên hệ: {selectedStat.supplier.contactPerson} - {selectedStat.supplier.email}</span>
              </div>
              <button onClick={() => setSelectedSupplierId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border">
              <div>
                <span className="text-slate-500 block">Xếp hạng chất lượng:</span>
                <span className="font-bold text-sm text-sky-700">Hạng {selectedStat.evaluatedGrade} ({selectedStat.qualityScore} điểm)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tổng số lô kiểm tra:</span>
                <span className="font-bold text-sm font-mono text-slate-900">{selectedStat.totalLots}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tỷ lệ lô từ chối:</span>
                <span className="font-bold text-sm font-mono text-rose-600">{selectedStat.lotRejectionRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tỷ lệ lỗi linh kiện:</span>
                <span className="font-bold text-sm font-mono text-slate-900">{formatPercentage(selectedStat.defectRate)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-800 mb-2">Lịch Sử Các Lô Hàng Đã Nghiệm Thu:</h4>
              <div className="space-y-2">
                {selectedStat.records.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">Chưa có lô kiểm tra nào trong kỳ này.</div>
                ) : (
                  selectedStat.records.map(r => (
                    <div key={r.id} className="p-2.5 bg-slate-50 rounded border text-xs flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">{r.recordCode} - {r.componentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Lô: {r.lotNumber} | Ngày: {r.receiptDate}</div>
                        {r.defectType && <div className="text-[11px] text-rose-600">Lỗi: {r.defectType}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">{r.defectQuantity} / {r.inspectedQuantity} lỗi</div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          r.result === 'PASS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {r.result}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSupplierId(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
