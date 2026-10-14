/**
 * @license
 * LOL Quality Control Center - Phân hệ 9: Phân Tích Dữ Liệu Chuyên Sâu & SPC (Statistical Process Control)
 * Biểu đồ kiểm soát SPC, tính toán năng lực quy trình Cp/Cpk, ma trận lỗi công đoạn và phân tích thời gian xử lý.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { calculateCpk, computePareto } from '../../utils/qualityMath';
import { SPCControlChart, ParetoChart } from '../charts/QualityCharts';
import { 
  LineChart, 
  Calculator, 
  Grid, 
  Clock, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

export const DataAnalysisModule: React.FC = () => {
  const { filteredIPQC, filteredIQC, filteredDefects, processes } = useQuality();

  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'spc' | 'pareto' | 'matrix' | 'backlog'>('spc');

  // Interactive Cp/Cpk parameters (Solder Paste Thickness measurement in um)
  const [usl, setUsl] = useState<number>(180); // Giới hạn trên Upper Spec Limit
  const [lsl, setLsl] = useState<number>(120); // Giới hạn dưới Lower Spec Limit
  const [sampleDataString, setSampleDataString] = useState<string>(
    '152, 148, 155, 142, 160, 151, 149, 153, 158, 146, 150, 154, 152, 147, 159, 145, 156, 150, 153, 148, 155, 152, 149, 154'
  );

  const sampleValues = sampleDataString
    .split(',')
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v));

  const cpkResult = calculateCpk(sampleValues, usl, lsl);

  // SPC Limits derived from sample distribution
  const ucl = cpkResult.valid ? Number((cpkResult.mean + 3 * cpkResult.stdDev).toFixed(1)) : 165;
  const cl = cpkResult.valid ? cpkResult.mean : 150;
  const lcl = cpkResult.valid ? Number((cpkResult.mean - 3 * cpkResult.stdDev).toFixed(1)) : 135;

  // Defect Matrix: Processes x Defect types
  const matrixProcesses = Array.from(new Set(filteredIPQC.map(r => r.processName))).slice(0, 6);
  const matrixDefectTypes = Array.from(new Set(filteredIPQC.map(r => r.defectType).filter(Boolean))).slice(0, 6);

  const getDefectMatrixCount = (proc: string, defectType?: string) => {
    if (!defectType) return 0;
    return filteredIPQC
      .filter(r => r.processName === proc && r.defectType === defectType)
      .reduce((sum, r) => sum + r.defectQuantity, 0);
  };

  // Pareto of all combined defects
  const combinedDefects: { name: string; count: number }[] = [];
  const map: Record<string, number> = {};
  filteredIPQC.forEach(r => {
    if (r.defectType) map[r.defectType] = (map[r.defectType] || 0) + r.defectQuantity;
  });
  filteredIQC.forEach(r => {
    if (r.defectType) map[r.defectType] = (map[r.defectType] || 0) + r.defectQuantity;
  });
  const allPareto = computePareto(Object.entries(map).map(([name, count]) => ({ name, count })));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 9</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Phân Tích Dữ Liệu Chuyên Sâu & Kiểm Soát Quá Trình (SPC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thống kê chất lượng nâng cao, chỉ số năng lực quy trình Cp/Cpk, ma trận tương quan và biểu đồ chạy mẫu (Run Chart).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveAnalysisTab('spc')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeAnalysisTab === 'spc'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Năng lực quy trình Cp / Cpk & Biểu đồ SPC</span>
        </button>

        <button
          onClick={() => setActiveAnalysisTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeAnalysisTab === 'matrix'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Ma trận Lỗi × Công đoạn (Defect Matrix)</span>
        </button>

        <button
          onClick={() => setActiveAnalysisTab('pareto')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeAnalysisTab === 'pareto'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>Phân tích Pareto toàn diện</span>
        </button>
      </div>

      {/* TAB 1: SPC & CPK */}
      {activeAnalysisTab === 'spc' && (
        <div className="space-y-6">
          {/* Important statistical note */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-950">Nguyên tắc diễn giải thống kê SPC / Cpk: </span>
              <p className="mt-0.5 text-blue-800">
                Chỉ số Cp/Cpk chỉ có giá trị khi áp dụng cho dữ liệu biến đổi liên tục (độ dày kem hàn, khe hở, nhiệt độ, điện áp đo) với mẫu kiểm tra tối thiểu N ≥ 20 và quy trình ở trạng thái ổn định thống kê.
                Tuyệt đối không tính toán Cp/Cpk từ số đếm lỗi chung (như số sản phẩm hỏng).
              </p>
            </div>
          </div>

          {/* Interactive Calculator Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Công Cụ Tính Năng Lực Quy Trình (Process Capability Calculator)
            </h3>
            <p className="text-xs text-slate-500">
              Ví dụ kiểm soát: Độ dày kem hàn sau máy in SPI tại trạm SMT-01 (Đơn vị: μm).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Giới hạn kỹ thuật trên (USL)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={usl}
                    onChange={e => setUsl(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono font-semibold text-slate-800"
                  />
                  <span className="text-slate-400">μm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Giới hạn kỹ thuật dưới (LSL)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={lsl}
                    onChange={e => setLsl(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono font-semibold text-slate-800"
                  />
                  <span className="text-slate-400">μm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Số mẫu đo hiện tại</label>
                <div className="px-3 py-1.5 bg-slate-50 border rounded font-mono text-slate-800 font-bold">
                  N = {sampleValues.length} mẫu
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium text-xs mb-1">
                Dữ liệu mẫu đo thực nghiệm (phân tách bởi dấu phẩy):
              </label>
              <textarea
                rows={2}
                value={sampleDataString}
                onChange={e => setSampleDataString(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded font-mono text-xs text-slate-800"
              />
            </div>

            {/* Calculation Result Cards */}
            {cpkResult.valid ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[11px]">Trung bình (Mean - μ):</span>
                  <span className="text-lg font-bold font-mono text-slate-800">{cpkResult.mean} μm</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[11px]">Độ lệch chuẩn (Sigma - σ):</span>
                  <span className="text-lg font-bold font-mono text-slate-800">{cpkResult.stdDev}</span>
                </div>
                <div className="p-3 bg-sky-50 rounded-lg text-xs border border-sky-100">
                  <span className="text-sky-700 block text-[11px]">Chỉ số tiềm năng (Cp):</span>
                  <span className="text-lg font-bold font-mono text-sky-900">{cpkResult.cp}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-xs border border-emerald-100">
                  <span className="text-emerald-700 block text-[11px]">Chỉ số năng lực thực tế (Cpk):</span>
                  <span className="text-lg font-bold font-mono text-emerald-900">{cpkResult.cpk}</span>
                  <span className="block text-[10px] text-emerald-800 font-medium mt-0.5">{cpkResult.evaluation}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 rounded text-rose-700 text-xs">
                {cpkResult.message}
              </div>
            )}
          </div>

          {/* SPC Control Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Biểu Đồ Kiểm Soát Quá Trình (SPC Run Chart)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Giới hạn kiểm soát trên UCL (+3σ) và Giới hạn kiểm soát dưới LCL (-3σ) theo quy chuẩn Western Electric.
            </p>
            <SPCControlChart
              samples={sampleValues}
              ucl={ucl}
              cl={cl}
              lcl={lcl}
              paramName="Độ dày kem hàn SPI"
              unit="μm"
            />
          </div>
        </div>
      )}

      {/* TAB 2: Defect Matrix */}
      {activeAnalysisTab === 'matrix' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Ma Trận Phân Bổ Lỗi Theo Công Đoạn & Loại Lỗi (Defect Matrix)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xác định chính xác vị trí và loại lỗi có mật độ xuất hiện cao nhất để lập phương án bảo trì.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">Công đoạn sản xuất</th>
                  {matrixDefectTypes.map(def => (
                    <th key={def} className="py-2.5 px-3 font-semibold text-center max-w-[120px] truncate" title={def}>
                      {def}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 font-semibold text-right">Tổng lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {matrixProcesses.length === 0 ? (
                  <tr>
                    <td colSpan={matrixDefectTypes.length + 2} className="py-8 text-center text-slate-400">
                      Chưa có đủ dữ liệu công đoạn để dựng ma trận.
                    </td>
                  </tr>
                ) : (
                  matrixProcesses.map(proc => {
                    let rowSum = 0;
                    return (
                      <tr key={proc} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{proc}</td>
                        {matrixDefectTypes.map(def => {
                          const cnt = getDefectMatrixCount(proc, def);
                          rowSum += cnt;
                          return (
                            <td key={def} className="py-2.5 px-3 text-center font-mono tabular-nums">
                              {cnt > 0 ? (
                                <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  {cnt}
                                </span>
                              ) : (
                                <span className="text-slate-300">0</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{rowSum}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Pareto */}
      {activeAnalysisTab === 'pareto' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Biểu Đồ Pareto Phân Tích Toàn Nhà Máy (IQC + IPQC)
          </h3>
          <p className="text-xs text-slate-500">
            Áp dụng nguyên lý 80/20: 80% thời gian dừng chuyền và phế phẩm thường xuất phát từ 20% chủng loại lỗi hàng đầu.
          </p>
          <ParetoChart data={allPareto} height={320} />
        </div>
      )}
    </div>
  );
};
