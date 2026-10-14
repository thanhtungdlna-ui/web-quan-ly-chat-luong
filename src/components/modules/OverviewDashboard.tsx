/**
 * @license
 * LOL Quality Control Center - Phân hệ 1: Dashboard Tổng Quan Chất Lượng
 * Màn hình trung tâm quản trị chất lượng sản xuất điện tử.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { 
  calculateDefectRate, 
  calculateLotPassRate, 
  calculatePassRate, 
  calculatePPM, 
  computePareto, 
  formatPercentage, 
  formatNumber, 
  getKPIStatus 
} from '../../utils/qualityMath';
import { 
  ParetoChart, 
  TrendLineChart, 
  StatusDonutChart 
} from '../charts/QualityCharts';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  PlusCircle, 
  FileText, 
  HelpCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { NavTabId } from '../layout/Sidebar';

interface OverviewDashboardProps {
  onNavigateTab: (tab: NavTabId) => void;
  onOpenQuickAdd: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigateTab,
  onOpenQuickAdd
}) => {
  const {
    filteredIQC,
    filteredIPQC,
    filteredOQC,
    filteredComplaints,
    filteredDefects,
    filteredCAPA,
    kpiTargets,
    resetFilters
  } = useQuality();

  const [drilldownTitle, setDrilldownTitle] = useState<string | null>(null);
  const [drilldownRecords, setDrilldownRecords] = useState<any[] | null>(null);

  // 1. Calculate KPI Metrics safely (protect against division by zero)
  // IQC
  const totalIQCInspected = filteredIQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const totalIQCDefects = filteredIQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const iqcDefectRate = calculateDefectRate(totalIQCDefects, totalIQCInspected);

  // IPQC
  const totalIPQCInspected = filteredIPQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const totalIPQCDefects = filteredIPQC.reduce((acc, r) => acc + r.defectQuantity, 0);
  const ipqcDefectRate = calculateDefectRate(totalIPQCDefects, totalIPQCInspected);

  // OQC
  const totalOQCInspected = filteredOQC.reduce((acc, r) => acc + r.inspectedQuantity, 0);
  const totalOQCPassed = filteredOQC.reduce((acc, r) => acc + r.passedQuantity, 0);
  const oqcPassRate = calculatePassRate(totalOQCPassed, totalOQCInspected);

  // Customer PPM
  const totalDelivered = filteredComplaints.reduce((acc, r) => acc + r.deliveredQuantity, 0);
  const totalAffected = filteredComplaints.reduce((acc, r) => acc + r.affectedQuantity, 0);
  const customerPPM = calculatePPM(totalAffected, totalDelivered);

  // Critical defects count across all modules
  const criticalDefectCount = 
    filteredIQC.filter(r => r.severity === 'CRITICAL').length +
    filteredIPQC.filter(r => r.severity === 'CRITICAL').length +
    filteredOQC.filter(r => r.defectQuantity > 0 && r.shippingDecision === 'HOLD').length +
    filteredComplaints.filter(r => r.severity === 'CRITICAL').length;

  // Open Issues
  const openIssuesCount = 
    filteredIQC.filter(r => r.status !== 'CLOSED').length +
    filteredIPQC.filter(r => r.status !== 'CLOSED').length +
    filteredComplaints.filter(r => r.status !== 'VERIFIED_CLOSED').length +
    filteredDefects.filter(r => r.status !== 'CLOSED').length;

  // Overdue CAPA (target date past today and not closed)
  const todayStr = new Date().toISOString().substring(0, 10);
  const overdueCAPACount = filteredCAPA.filter(c => c.status !== 'CLOSED' && c.targetDate < todayStr).length;

  // CAPA Closure Rate
  const totalClosedCAPA = filteredCAPA.filter(c => c.status === 'CLOSED').length;
  const capaClosureRate = filteredCAPA.length > 0 ? (totalClosedCAPA / filteredCAPA.length) * 100 : null;

  // KPI Targets lookup
  const targetIQC = kpiTargets.find(t => t.key === 'iqc_defect_rate') || { targetValue: 0.5, warningThreshold: 0.8, dangerThreshold: 1.2 };
  const targetIPQC = kpiTargets.find(t => t.key === 'ipqc_defect_rate') || { targetValue: 1.2, warningThreshold: 1.8, dangerThreshold: 2.5 };
  const targetOQC = kpiTargets.find(t => t.key === 'oqc_pass_rate') || { targetValue: 99.0, warningThreshold: 98.0, dangerThreshold: 96.5 };
  const targetPPM = kpiTargets.find(t => t.key === 'customer_complaint_ppm') || { targetValue: 200, warningThreshold: 350, dangerThreshold: 500 };
  const targetCAPA = kpiTargets.find(t => t.key === 'capa_closure_rate') || { targetValue: 95, warningThreshold: 90, dangerThreshold: 80 };

  // Status Evaluations
  const statusIQC = getKPIStatus(iqcDefectRate, targetIQC.targetValue, targetIQC.warningThreshold, targetIQC.dangerThreshold, 'LESS_THAN');
  const statusIPQC = getKPIStatus(ipqcDefectRate, targetIPQC.targetValue, targetIPQC.warningThreshold, targetIPQC.dangerThreshold, 'LESS_THAN');
  const statusOQC = getKPIStatus(oqcPassRate, targetOQC.targetValue, targetOQC.warningThreshold, targetOQC.dangerThreshold, 'GREATER_THAN');
  const statusPPM = getKPIStatus(customerPPM, targetPPM.targetValue, targetPPM.warningThreshold, targetPPM.dangerThreshold, 'LESS_THAN');

  // 2. Pareto calculation from defect list
  const defectAggMap: Record<string, number> = {};
  filteredDefects.forEach(d => {
    defectAggMap[d.defectName] = (defectAggMap[d.defectName] || 0) + 1;
  });
  filteredIPQC.forEach(r => {
    if (r.defectType && r.defectQuantity > 0) {
      defectAggMap[r.defectType] = (defectAggMap[r.defectType] || 0) + r.defectQuantity;
    }
  });
  filteredIQC.forEach(r => {
    if (r.defectType && r.defectQuantity > 0) {
      defectAggMap[r.defectType] = (defectAggMap[r.defectType] || 0) + r.defectQuantity;
    }
  });

  const paretoData = computePareto(
    Object.entries(defectAggMap).map(([name, count]) => ({ name, count }))
  );

  // 3. Trends over recent days
  const trendData = [
    { label: '08/10', iqcDefectRate: 0.0, ipqcDefectRate: 0.8, oqcPassRate: 100.0 },
    { label: '09/10', iqcDefectRate: 2.5, ipqcDefectRate: 0.9, oqcPassRate: 100.0 },
    { label: '10/10', iqcDefectRate: 0.2, ipqcDefectRate: 0.8, oqcPassRate: 100.0 },
    { label: '11/10', iqcDefectRate: 3.0, ipqcDefectRate: 2.7, oqcPassRate: 96.2 },
    { label: '12/10', iqcDefectRate: 0.0, ipqcDefectRate: 2.0, oqcPassRate: 98.0 },
    { label: '13/10', iqcDefectRate: 0.0, ipqcDefectRate: 2.0, oqcPassRate: 100.0 },
  ];

  // 4. Defect by process
  const processDefectMap: Record<string, number> = {};
  filteredIPQC.forEach(r => {
    processDefectMap[r.processName] = (processDefectMap[r.processName] || 0) + r.defectQuantity;
  });

  // 5. Defect by product
  const productDefectMap: Record<string, number> = {};
  filteredIPQC.forEach(r => {
    productDefectMap[r.productCode] = (productDefectMap[r.productCode] || 0) + r.defectQuantity;
  });
  filteredOQC.forEach(r => {
    productDefectMap[r.productCode] = (productDefectMap[r.productCode] || 0) + r.defectQuantity;
  });

  // 6. Defect by supplier
  const supplierDefectMap: Record<string, number> = {};
  filteredIQC.forEach(r => {
    if (r.defectQuantity > 0) {
      supplierDefectMap[r.supplierName] = (supplierDefectMap[r.supplierName] || 0) + r.defectQuantity;
    }
  });

  // 7. Complaints by customer
  const customerComplaintMap: Record<string, number> = {};
  filteredComplaints.forEach(r => {
    customerComplaintMap[r.customerName] = (customerComplaintMap[r.customerName] || 0) + 1;
  });

  // 8. Issue Status Distribution
  const statusData = [
    { label: 'Đang mở (Open)', count: filteredDefects.filter(d => d.status === 'OPEN').length + filteredIQC.filter(r => r.status === 'OPEN').length, color: '#ef4444' },
    { label: 'Đang xử lý (In-Progress)', count: filteredDefects.filter(d => d.status === 'IN_PROGRESS').length + filteredIPQC.filter(r => r.status === 'IN_PROGRESS').length, color: '#f59e0b' },
    { label: 'Đã giải quyết (Resolved)', count: filteredDefects.filter(d => d.status === 'RESOLVED').length + filteredIPQC.filter(r => r.status === 'RESOLVED').length, color: '#0ea5e9' },
    { label: 'Đã đóng (Closed)', count: filteredDefects.filter(d => d.status === 'CLOSED').length + filteredIQC.filter(r => r.status === 'CLOSED').length, color: '#10b981' },
  ];

  const renderStatusBadge = (status: 'GOOD' | 'WARNING' | 'DANGER' | 'NO_DATA') => {
    switch (status) {
      case 'GOOD':
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đạt mục tiêu</span>;
      case 'WARNING':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Cảnh báo</span>;
      case 'DANGER':
        return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Vượt ngưỡng</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Chưa có số liệu</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-sky-700 tracking-wider">CÔNG TY TNHH ĐIỆN TỬ LOL</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tổng Quan Tình Hình Chất Lượng Nhà Máy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giám sát thời gian thực toàn diện chuỗi chất lượng: IQC Đầu vào → IPQC SMT & Lắp ráp → OQC Xuất xưởng → Phản hồi khách hàng.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Xem Báo cáo</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nhập dữ liệu</span>
          </button>
        </div>
      </div>

      {/* 8 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: IQC Defect Rate */}
        <div
          onClick={() => onNavigateTab('iqc')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer relative"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ lỗi đầu vào IQC</span>
            {renderStatusBadge(statusIQC)}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {formatPercentage(iqcDefectRate)}
            </span>
            <span className="text-xs text-slate-400">/ {formatNumber(totalIQCInspected)} linh kiện</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Mục tiêu: ≤ {targetIQC.targetValue}%</span>
            <span className="text-sky-600 flex items-center gap-0.5 font-medium hover:underline">
              Chi tiết <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: IPQC Defect Rate */}
        <div
          onClick={() => onNavigateTab('ipqc')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer relative"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ lỗi công đoạn IPQC</span>
            {renderStatusBadge(statusIPQC)}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {formatPercentage(ipqcDefectRate)}
            </span>
            <span className="text-xs text-slate-400">/ {formatNumber(totalIPQCInspected)} bo mạch</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Mục tiêu: ≤ {targetIPQC.targetValue}%</span>
            <span className="text-sky-600 flex items-center gap-0.5 font-medium hover:underline">
              Chi tiết <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: OQC Pass Rate */}
        <div
          onClick={() => onNavigateTab('oqc')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer relative"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ đạt kiểm tra đầu ra OQC</span>
            {renderStatusBadge(statusOQC)}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">
              {formatPercentage(oqcPassRate)}
            </span>
            <span className="text-xs text-slate-400">/ {formatNumber(totalOQCInspected)} mẫu TP</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Mục tiêu: ≥ {targetOQC.targetValue}%</span>
            <span className="text-sky-600 flex items-center gap-0.5 font-medium hover:underline">
              Chi tiết <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Customer PPM */}
        <div
          onClick={() => onNavigateTab('customer')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer relative"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Khiếu nại khách hàng (PPM)</span>
            {renderStatusBadge(statusPPM)}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {customerPPM !== null ? `${customerPPM} PPM` : '0 PPM'}
            </span>
            <span className="text-xs text-slate-400">({totalAffected} SP lỗi)</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Mục tiêu: ≤ {targetPPM.targetValue} PPM</span>
            <span className="text-sky-600 flex items-center gap-0.5 font-medium hover:underline">
              Chi tiết <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 5: Critical Defects */}
        <div
          onClick={() => onNavigateTab('defects')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Lỗi nghiêm trọng (Critical)</span>
            {criticalDefectCount === 0 ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">0 Lỗi</span>
            ) : (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{criticalDefectCount} Vụ</span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums font-mono ${criticalDefectCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {criticalDefectCount}
            </span>
            <span className="text-xs text-slate-400">vụ cần cô lập</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Mục tiêu: 0 lỗi nguy cấp</span>
            <span className="text-sky-600 font-medium hover:underline">Xem lỗi</span>
          </div>
        </div>

        {/* KPI 6: Open Issues */}
        <div
          onClick={() => onNavigateTab('defects')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Vấn đề chất lượng đang mở</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Đang theo dõi
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums font-mono">
              {openIssuesCount}
            </span>
            <span className="text-xs text-slate-400">hồ sơ chờ xử lý</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Bao gồm IQC, IPQC, Khiếu nại</span>
            <span className="text-sky-600 font-medium hover:underline">Xử lý</span>
          </div>
        </div>

        {/* KPI 7: Overdue CAPA */}
        <div
          onClick={() => onNavigateTab('capa')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Hành động CAPA quá hạn</span>
            {overdueCAPACount > 0 ? (
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Cảnh báo quá hạn</span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đúng tiến độ</span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums font-mono ${overdueCAPACount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {overdueCAPACount}
            </span>
            <span className="text-xs text-slate-400">/ {filteredCAPA.length} tổng CAPA</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Mục tiêu: 0 hồ sơ quá hạn</span>
            <span className="text-sky-600 font-medium hover:underline">Xem CAPA</span>
          </div>
        </div>

        {/* KPI 8: CAPA Completion Rate */}
        <div
          onClick={() => onNavigateTab('capa')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ hoàn thành CAPA</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {totalClosedCAPA} / {filteredCAPA.length} Đã đóng
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-700 tabular-nums font-mono">
              {formatPercentage(capaClosureRate)}
            </span>
            <span className="text-xs text-slate-400">hoàn tất xác minh</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Mục tiêu: ≥ {targetCAPA.targetValue}%</span>
            <span className="text-sky-600 font-medium hover:underline">Chi tiết</span>
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Trend of Rates & Pareto Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Trend of Defect & Pass Rates */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                1. Xu Hướng Tỷ Lệ Lỗi IQC & IPQC Theo Ngày
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Theo dõi biến động chất lượng hàng ngày so với ngưỡng mục tiêu</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">7 ngày gần nhất</span>
          </div>
          <TrendLineChart data={trendData} metricType="defect" targetValue={targetIPQC.targetValue} height={260} />
        </div>

        {/* Chart 2: Pareto Defects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                2. Biểu Đồ Pareto Các Loại Lỗi Phổ Biến Nhất (80/20)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Xác định 20% nguyên nhân gây ra 80% số lỗi để ưu tiên cải tiến</p>
            </div>
            <button
              onClick={() => onNavigateTab('defects')}
              className="text-xs text-sky-600 font-medium hover:underline flex items-center gap-1"
            >
              Quản lý lỗi <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <ParetoChart
            data={paretoData}
            onBarClick={item => {
              setDrilldownTitle(`Chi tiết lỗi: ${item.name}`);
              const matched = [
                ...filteredIPQC.filter(r => r.defectType === item.name),
                ...filteredIQC.filter(r => r.defectType === item.name)
              ];
              setDrilldownRecords(matched);
            }}
            height={260}
          />
        </div>
      </div>

      {/* Row 2 Charts: Process distribution, Product distribution, Status donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 3: Defects by Process */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            3. Cơ Cấu Lỗi Theo Công Đoạn
          </h3>
          <p className="text-xs text-slate-500 mb-4">Số lượng lỗi phát hiện theo từng trạm sản xuất</p>
          <div className="space-y-3">
            {Object.keys(processDefectMap).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Không có dữ liệu lỗi công đoạn</div>
            ) : (
              Object.entries(processDefectMap).map(([pName, count]) => {
                const total = Object.values(processDefectMap).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={pName} className="text-xs">
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span className="truncate pr-2">{pName}</span>
                      <span className="tabular-nums font-mono text-slate-900 font-semibold">{count} lỗi ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart 4: Defects by Product Code */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            4. Phân Bổ Lỗi Theo Mã Sản Phẩm
          </h3>
          <p className="text-xs text-slate-500 mb-4">Tần suất lỗi phát sinh trên các model sản phẩm</p>
          <div className="space-y-3">
            {Object.keys(productDefectMap).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Không có dữ liệu lỗi theo model</div>
            ) : (
              Object.entries(productDefectMap).map(([code, count]) => {
                const total = Object.values(productDefectMap).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={code} className="text-xs">
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span className="font-mono text-slate-900 font-semibold">{code}</span>
                      <span className="tabular-nums font-mono text-slate-800">{count} lỗi ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart 5: Status Distribution Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            5. Tình Trạng Xử Lý Vấn Đề Chất Lượng
          </h3>
          <p className="text-xs text-slate-500 mb-3">Tỷ lệ mở, đang xử lý và đã đóng hồ sơ</p>
          <StatusDonutChart data={statusData} totalLabel="Tổng vấn đề" />
        </div>
      </div>

      {/* Row 3: Supplier defect ranking & Customer complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier defect analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                6. Đánh Giá Chất Lượng Nhà Cung Cấp Đầu Vào
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Số lượng linh kiện không đạt và quyết định xử lý</p>
            </div>
            <button
              onClick={() => onNavigateTab('suppliers')}
              className="text-xs text-sky-600 font-medium hover:underline flex items-center gap-1"
            >
              Chi tiết NCC <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.keys(supplierDefectMap).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Tất cả các lô kiểm tra IQC đều đạt tiêu chuẩn (0 lỗi)
              </div>
            ) : (
              Object.entries(supplierDefectMap).map(([supName, count]) => (
                <div key={supName} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-medium text-slate-800">{supName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums text-rose-600 font-semibold">{count} linh kiện lỗi</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Cần cải tiến</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer complaints summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                7. Khiếu Nại Chất Lượng Theo Khách Hàng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Theo dõi phản hồi và tiến độ điều tra báo cáo 8D</p>
            </div>
            <button
              onClick={() => onNavigateTab('customer')}
              className="text-xs text-sky-600 font-medium hover:underline flex items-center gap-1"
            >
              Chi tiết khiếu nại <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Không có khiếu nại nào từ khách hàng trong kỳ báo cáo
              </div>
            ) : (
              filteredComplaints.map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{c.customerName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({c.complaintCode})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.problemDescription}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      c.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {c.severity}
                    </span>
                    <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actual vs Target Comparison Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              8. Bảng Theo Dõi Mục Tiêu Chất Lượng Thực Tế So Với Kế Hoạch (Kỳ Áp Dụng 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh các chỉ số hiệu suất chất lượng cốt lõi với mục tiêu KPI đã ban hành.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="text-xs text-sky-600 font-medium hover:underline flex items-center gap-1"
          >
            Cấu hình mục tiêu <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Chỉ tiêu chất lượng</th>
                <th className="py-2.5 px-3 font-semibold text-right">Mục tiêu quy định</th>
                <th className="py-2.5 px-3 font-semibold text-right">Giá trị thực tế</th>
                <th className="py-2.5 px-3 font-semibold text-center">Trạng thái</th>
                <th className="py-2.5 px-3 font-semibold">Công thức tính toán</th>
                <th className="py-2.5 px-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-900">Tỷ lệ lỗi đầu vào IQC</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">≤ {targetIQC.targetValue}%</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                  {formatPercentage(iqcDefectRate)}
                </td>
                <td className="py-2.5 px-3 text-center">{renderStatusBadge(statusIQC)}</td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">(Số lỗi / Số kiểm tra) × 100</td>
                <td className="py-2.5 px-3 text-right">
                  <button onClick={() => onNavigateTab('iqc')} className="text-sky-600 hover:underline">Chi tiết</button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-900">Tỷ lệ lỗi công đoạn IPQC</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">≤ {targetIPQC.targetValue}%</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                  {formatPercentage(ipqcDefectRate)}
                </td>
                <td className="py-2.5 px-3 text-center">{renderStatusBadge(statusIPQC)}</td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">(Số lỗi / Số kiểm tra) × 100</td>
                <td className="py-2.5 px-3 text-right">
                  <button onClick={() => onNavigateTab('ipqc')} className="text-sky-600 hover:underline">Chi tiết</button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-900">Tỷ lệ đạt kiểm tra đầu ra OQC</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">≥ {targetOQC.targetValue}%</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600">
                  {formatPercentage(oqcPassRate)}
                </td>
                <td className="py-2.5 px-3 text-center">{renderStatusBadge(statusOQC)}</td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">(Số đạt / Số kiểm tra) × 100</td>
                <td className="py-2.5 px-3 text-right">
                  <button onClick={() => onNavigateTab('oqc')} className="text-sky-600 hover:underline">Chi tiết</button>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-900">Khiếu nại khách hàng (PPM)</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">≤ {targetPPM.targetValue} PPM</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                  {customerPPM !== null ? `${customerPPM} PPM` : '0 PPM'}
                </td>
                <td className="py-2.5 px-3 text-center">{renderStatusBadge(statusPPM)}</td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">(Lỗi khiếu nại / SL giao) × 10⁶</td>
                <td className="py-2.5 px-3 text-right">
                  <button onClick={() => onNavigateTab('customer')} className="text-sky-600 hover:underline">Chi tiết</button>
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-medium text-slate-900">Tỷ lệ hoàn thành CAPA đúng hạn</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">≥ {targetCAPA.targetValue}%</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                  {formatPercentage(capaClosureRate)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Theo dõi
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">(CAPA hoàn thành / Tổng CAPA) × 100</td>
                <td className="py-2.5 px-3 text-right">
                  <button onClick={() => onNavigateTab('capa')} className="text-sky-600 hover:underline">Chi tiết</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drilldown modal if clicked from Pareto bar */}
      {drilldownRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">{drilldownTitle}</h3>
              <button onClick={() => setDrilldownRecords(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
              {drilldownRecords.length === 0 ? (
                <div className="text-xs text-slate-400">Không tìm thấy bản ghi liên quan</div>
              ) : (
                drilldownRecords.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-200">
                    <div className="flex justify-between font-semibold">
                      <span>{r.recordCode}</span>
                      <span className="font-mono text-rose-600">Số lỗi: {r.defectQuantity}</span>
                    </div>
                    <p className="text-slate-600">Công đoạn/Vị trí: {r.processName || r.componentName}</p>
                    {r.immediateAction && <p className="text-slate-500 italic">Khắc phục: {r.immediateAction}</p>}
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setDrilldownRecords(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-medium"
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
