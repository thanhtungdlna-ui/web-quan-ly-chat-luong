/**
 * @license
 * LOL Quality Control Center - Phân hệ 10: Báo Cáo Chất Lượng (Quality Reports)
 * Tạo báo cáo ngày, tuần, tháng, IQC, IPQC, OQC, Khách hàng, CAPA phục vụ họp ban giám đốc.
 * Hỗ trợ in ấn chuẩn A4 và xuất CSV.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  UserCheck
} from 'lucide-react';
import { calculateDefectRate, calculatePassRate, calculatePPM, formatPercentage, formatNumber } from '../../utils/qualityMath';

export const ReportsModule: React.FC = () => {
  const {
    filteredIQC,
    filteredIPQC,
    filteredOQC,
    filteredComplaints,
    filteredCAPA,
    kpiTargets,
    filters,
    activeRole,
    exportModuleToCSV
  } = useQuality();

  const [reportType, setReportType] = useState<string>('daily');
  const [reportNote, setReportNote] = useState<string>(
    'Tình hình chất lượng trong ca ổn định. Cần tiếp tục theo dõi trạm in kem hàn SMT-01 và đôn đốc nhà cung cấp Foxconn gửi báo cáo 8D cho lô đầu nối Type-C.'
  );

  const todayStr = new Date().toISOString().substring(0, 10);

  // Calculations for current report
  const iqcInspected = filteredIQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const iqcDefects = filteredIQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const iqcRate = calculateDefectRate(iqcDefects, iqcInspected);

  const ipqcInspected = filteredIPQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const ipqcDefects = filteredIPQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const ipqcRate = calculateDefectRate(ipqcDefects, ipqcInspected);

  const oqcInspected = filteredOQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const oqcPassed = filteredOQC.reduce((acc, r) => acc + r.passedQuantity, 0);
  const oqcRate = calculatePassRate(oqcPassed, oqcInspected);

  const customerDelivered = filteredComplaints.reduce((acc, r) => acc + r.deliveredQuantity, 0);
  const customerAffected = filteredComplaints.reduce((acc, r) => acc + r.affectedQuantity, 0);
  const customerPPM = calculatePPM(customerAffected, customerDelivered);

  const openCAPACount = filteredCAPA.filter(c => c.status !== 'CLOSED').length;
  const overdueCAPACount = filteredCAPA.filter(c => c.status !== 'CLOSED' && c.targetDate < todayStr).length;

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'daily': return 'Báo Cáo Chất Lượng Hằng Ngày (Daily Quality Report)';
      case 'weekly': return 'Báo Cáo Chất Lượng Tuần (Weekly Quality Review)';
      case 'monthly': return 'Báo Cáo Chất Lượng Tháng (Monthly Quality Executive Summary)';
      case 'iqc': return 'Báo Cáo Nghiệm Thu Đầu Vào IQC';
      case 'ipqc': return 'Báo Cáo Giám Sát Công Đoạn SMT & IPQC';
      case 'oqc': return 'Báo Cáo Nghiệm Thu Xuất Xưởng OQC';
      case 'customer': return 'Báo Cáo Khiếu Nại & Mức Độ Hài Lòng Khách Hàng';
      case 'capa': return 'Báo Cáo Tiến Độ Hành Động Khắc Phục CAPA';
      default: return 'Báo Cáo Tình Hình Chất Lượng Toàn Diện';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">PHÂN HỆ 10</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Báo Cáo Chất Lượng Định Kỳ (Quality Reports)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu phục vụ họp chất lượng hằng ngày, hằng tuần và báo cáo ban giám đốc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportModuleToCSV('IQC')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất dữ liệu CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* Report Template Selector (Hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-slate-700">Chọn mẫu báo cáo:</span>
        <select
          value={reportType}
          onChange={e => setReportType(e.target.value)}
          aria-label="Chọn mẫu báo cáo"
          className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-800 bg-slate-50"
        >
          <option value="daily">Báo cáo chất lượng hàng ngày</option>
          <option value="weekly">Báo cáo chất lượng tuần</option>
          <option value="monthly">Báo cáo chất lượng tháng</option>
          <option value="iqc">Báo cáo chuyên sâu IQC</option>
          <option value="ipqc">Báo cáo chuyên sâu IPQC</option>
          <option value="oqc">Báo cáo chuyên sâu OQC</option>
          <option value="customer">Báo cáo chất lượng khách hàng</option>
          <option value="capa">Báo cáo tình trạng CAPA</option>
        </select>
        <span className="text-slate-400 italic">| Báo cáo tự động tổng hợp số liệu theo các bộ lọc hiện tại</span>
      </div>

      {/* Printable Report Document (A4 format ready) */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              CÔNG TY TNHH ĐIỆN TỬ LOL
            </div>
            <div className="text-[11px] text-slate-400">
              Nhà máy sản xuất linh kiện & Bo mạch điện tử - KCN Yên Phong, Bắc Ninh
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2 uppercase">
              {getReportTitle()}
            </h2>
          </div>

          <div className="text-right text-xs space-y-1">
            <div><strong>Mã báo cáo:</strong> QR-{todayStr.replace(/-/g, '')}-01</div>
            <div><strong>Ngày lập:</strong> {todayStr}</div>
            <div><strong>Kỳ báo cáo:</strong> {filters.datePreset}</div>
            <div className="text-slate-500 text-[11px]">Tiêu chuẩn: ISO 9001:2015</div>
          </div>
        </div>

        {/* Section 1: Executive KPI Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800 border-b pb-1">
            I. Tổng Hợp Các Chỉ Số Hiệu Suất Chất Lượng Cốt Lõi (KPIs)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded border">
              <span className="text-slate-500 block text-[11px]">Tỷ lệ lỗi IQC:</span>
              <span className="text-base font-bold font-mono text-slate-900">{formatPercentage(iqcRate)}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Mục tiêu: ≤ 0.5%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border">
              <span className="text-slate-500 block text-[11px]">Tỷ lệ lỗi IPQC:</span>
              <span className="text-base font-bold font-mono text-slate-900">{formatPercentage(ipqcRate)}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Mục tiêu: ≤ 1.2%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border">
              <span className="text-slate-500 block text-[11px]">Tỷ lệ đạt OQC:</span>
              <span className="text-base font-bold font-mono text-emerald-700">{formatPercentage(oqcRate)}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Mục tiêu: ≥ 99.0%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border">
              <span className="text-slate-500 block text-[11px]">Khiếu nại KH:</span>
              <span className="text-base font-bold font-mono text-slate-900">{customerPPM !== null ? `${customerPPM} PPM` : '0 PPM'}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Mục tiêu: ≤ 200 PPM</span>
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Observations Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800 border-b pb-1">
            II. Thống Kê Chi Tiết Tình Hình Kiểm Tra Theo Công Đoạn
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="p-2 border border-slate-200">Công đoạn / Phân hệ</th>
                <th className="p-2 border border-slate-200 text-right">SL Kiểm tra</th>
                <th className="p-2 border border-slate-200 text-right">SL Đạt</th>
                <th className="p-2 border border-slate-200 text-right">SL Lỗi</th>
                <th className="p-2 border border-slate-200 text-right">Tỷ lệ lỗi / Đạt</th>
                <th className="p-2 border border-slate-200">Đánh giá thực tế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 border border-slate-200 font-medium">IQC – Nguyên vật liệu đầu vào</td>
                <td className="p-2 border border-slate-200 text-right font-mono">{formatNumber(iqcInspected)}</td>
                <td className="p-2 border border-slate-200 text-right font-mono">{formatNumber(iqcInspected - iqcDefects)}</td>
                <td className="p-2 border border-slate-200 text-right font-mono font-semibold text-rose-600">{iqcDefects}</td>
                <td className="p-2 border border-slate-200 text-right font-mono font-bold">{formatPercentage(iqcRate)}</td>
                <td className="p-2 border border-slate-200">
                  {iqcRate !== null && iqcRate <= 0.5 ? 'Đạt tiêu chuẩn AQL' : 'Cần kiểm soát chặt nhà cung cấp'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">IPQC – Dây chuyền SMT & Lắp ráp</td>
                <td className="p-2 border border-slate-200 text-right font-mono">{formatNumber(ipqcInspected)}</td>
                <td className="p-2 border border-slate-200 text-right font-mono">{formatNumber(ipqcInspected - ipqcDefects)}</td>
                <td className="p-2 border border-slate-200 text-right font-mono font-semibold text-rose-600">{ipqcDefects}</td>
                <td className="p-2 border border-slate-200 text-right font-mono font-bold">{formatPercentage(ipqcRate)}</td>
                <td className="p-2 border border-slate-200">
                  {ipqcRate !== null && ipqcRate <= 1.2 ? 'Quy trình vận hành ổn định' : 'Có lỗi mối hàn cần hiệu chuẩn lò'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">OQC – Thành phẩm xuất hàng</td>
                <td className="p-2 border border-slate-200 text-right font-mono">{formatNumber(oqcInspected)}</td>
                <td className="p-2 border border-slate-200 text-right font-mono text-emerald-700 font-semibold">{formatNumber(oqcPassed)}</td>
                <td className="p-2 border border-slate-200 text-right font-mono font-semibold text-rose-600">{oqcInspected - oqcPassed}</td>
                <td className="p-2 border border-slate-200 text-right font-mono font-bold text-emerald-700">{formatPercentage(oqcRate)}</td>
                <td className="p-2 border border-slate-200">
                  {oqcRate !== null && oqcRate >= 99.0 ? 'Đủ điều kiện xuất giao khách hàng' : 'Có lô bị cách ly tạm giữ'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Open Critical Issues & CAPA Tracking */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800 border-b pb-1">
            III. Danh Sách Vấn Đề Chất Lượng Trọng Điểm Đang Xử Lý (CAPA & Khiếu Nại)
          </h3>
          <div className="space-y-2">
            {filteredCAPA.filter(c => c.status !== 'CLOSED').length === 0 ? (
              <div className="p-3 bg-slate-50 text-slate-500 text-xs italic">
                Hiện không có hồ sơ CAPA tồn đọng.
              </div>
            ) : (
              filteredCAPA.filter(c => c.status !== 'CLOSED').map(c => (
                <div key={c.id} className="p-2.5 bg-slate-50 border rounded text-xs flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-sky-800">[{c.capaCode}] </span>
                    <span className="font-semibold text-slate-900">{c.problemDescription}</span>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Phụ trách: {c.assignedPerson} | Hạn hoàn thành: <span className="font-mono">{c.targetDate}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 4: QA Engineer Remarks */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800 border-b pb-1">
            IV. Nhận Xét & Đề Xuất Của Bộ Phận QA/QC
          </h3>
          <textarea
            rows={3}
            value={reportNote}
            onChange={e => setReportNote(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 italic"
          />
        </div>

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-3 text-center text-xs">
          <div>
            <div className="font-bold text-slate-900 uppercase">Người Lập Báo Cáo</div>
            <div className="text-slate-400 text-[10px] mt-0.5">(Kỹ sư QA / Lead QC)</div>
            <div className="h-14"></div>
            <div className="font-medium text-slate-700">Nguyễn Văn Hùng</div>
          </div>
          <div>
            <div className="font-bold text-slate-900 uppercase">Trưởng Bộ Phận QA/QC</div>
            <div className="text-slate-400 text-[10px] mt-0.5">(Xác nhận dữ liệu)</div>
            <div className="h-14"></div>
            <div className="font-medium text-slate-700">Trần Tuấn Kiệt</div>
          </div>
          <div>
            <div className="font-bold text-slate-900 uppercase">Ban Giám Đốc Phê Duyệt</div>
            <div className="text-slate-400 text-[10px] mt-0.5">(Ký & Đóng dấu)</div>
            <div className="h-14"></div>
            <div className="font-medium text-slate-700">Tổng Giám Đốc LOL</div>
          </div>
        </div>
      </div>
    </div>
  );
};
