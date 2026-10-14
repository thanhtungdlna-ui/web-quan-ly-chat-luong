/**
 * @license
 * LOL Quality Control Center - Mathematical & Statistical Utilities
 * Các công thức tính toán quản lý chất lượng tuân thủ tiêu chuẩn ISO 9001 / IATF 16949 / IPC-A-610.
 * Không thực hiện chia cho 0. Trả về null khi mẫu số không hợp lệ.
 */

/**
 * Tính Tỷ lệ lỗi theo số lượng kiểm tra (%)
 * Công thức: (Số lượng lỗi / Số lượng kiểm tra) * 100
 * @returns number | null (null nếu mẫu số <= 0)
 */
export function calculateDefectRate(defectCount: number, inspectedCount: number): number | null {
  if (inspectedCount <= 0 || isNaN(defectCount) || isNaN(inspectedCount)) {
    return null;
  }
  const rate = (defectCount / inspectedCount) * 100;
  return Math.min(Math.max(rate, 0), 100);
}

/**
 * Tính Tỷ lệ lô đạt (%)
 * Công thức: (Số lô đạt / Tổng số lô đã đánh giá) * 100
 * @returns number | null
 */
export function calculateLotPassRate(passedLots: number, totalLots: number): number | null {
  if (totalLots <= 0 || isNaN(passedLots) || isNaN(totalLots)) {
    return null;
  }
  const rate = (passedLots / totalLots) * 100;
  return Math.min(Math.max(rate, 0), 100);
}

/**
 * Tính Tỷ lệ đạt đầu ra (%)
 * Công thức: (Số lượng đạt / Số lượng kiểm tra) * 100
 * @returns number | null
 */
export function calculatePassRate(passedCount: number, inspectedCount: number): number | null {
  if (inspectedCount <= 0 || isNaN(passedCount) || isNaN(inspectedCount)) {
    return null;
  }
  const rate = (passedCount / inspectedCount) * 100;
  return Math.min(Math.max(rate, 0), 100);
}

/**
 * Tính Số lỗi trên một triệu sản phẩm giao (PPM - Parts Per Million)
 * Công thức: (Số lượng lỗi phát hiện / Tổng số lượng giao hàng) * 1,000,000
 * @returns number | null
 */
export function calculatePPM(defectQuantity: number, totalQuantity: number): number | null {
  if (totalQuantity <= 0 || isNaN(defectQuantity) || isNaN(totalQuantity)) {
    return null;
  }
  const ppm = (defectQuantity / totalQuantity) * 1_000_000;
  return Math.round(ppm);
}

/**
 * Format số tỷ lệ % an toàn
 */
export function formatPercentage(value: number | null, decimals: number = 2): string {
  if (value === null || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format số nguyên có dấu phẩy phân tách nghìn
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Phân tích Pareto cho danh sách lỗi
 */
export interface ParetoItem {
  name: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
}

export function computePareto(items: { name: string; count: number }[]): ParetoItem[] {
  // Loại bỏ các mục không có tên hoặc count <= 0
  const validItems = items
    .filter(i => i.name && i.count > 0)
    .sort((a, b) => b.count - a.count);

  const total = validItems.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return [];

  let accumulated = 0;
  return validItems.map(item => {
    accumulated += item.count;
    const percentage = (item.count / total) * 100;
    const cumulativePercentage = (accumulated / total) * 100;
    return {
      name: item.name,
      count: item.count,
      percentage: Number(percentage.toFixed(1)),
      cumulativePercentage: Number(cumulativePercentage.toFixed(1)),
    };
  });
}

/**
 * Tính toán năng lực quy trình Cp, Cpk (Statistical Process Control)
 * Yêu cầu dữ liệu:
 * - Tập dữ liệu liên tục (thước đo độ dày kem hàn solder height, điện áp kiểm tra V, nhiệt độ reflow C...)
 * - Số lượng mẫu N >= 20 theo chuẩn thống kê SPC
 * - Giới hạn kỹ thuật trên (USL) và giới hạn kỹ thuật dưới (LSL)
 */
export interface CpkAnalysisResult {
  valid: boolean;
  message?: string;
  sampleCount: number;
  mean: number;
  stdDev: number;
  usl: number;
  lsl: number;
  cp: number | null;
  cpk: number | null;
  cpu: number | null;
  cpl: number | null;
  evaluation: 'Xuất sắc (Cpk >= 1.67)' | 'Đạt yêu cầu (1.33 <= Cpk < 1.67)' | 'Chấp nhận có kiểm soát (1.00 <= Cpk < 1.33)' | 'Không đạt (Cpk < 1.00)' | 'Không đủ điều kiện tính';
}

export function calculateCpk(
  samples: number[],
  usl: number,
  lsl: number
): CpkAnalysisResult {
  const n = samples.length;
  if (n < 5) {
    return {
      valid: false,
      message: 'Cần tối thiểu 5 mẫu đo thực tế để bắt đầu ước lượng (khuyến nghị >= 20 mẫu theo chuẩn SPC).',
      sampleCount: n,
      mean: 0,
      stdDev: 0,
      usl,
      lsl,
      cp: null,
      cpk: null,
      cpu: null,
      cpl: null,
      evaluation: 'Không đủ điều kiện tính'
    };
  }

  if (usl <= lsl) {
    return {
      valid: false,
      message: 'Giới hạn kỹ thuật trên (USL) phải lớn hơn giới hạn kỹ thuật dưới (LSL).',
      sampleCount: n,
      mean: 0,
      stdDev: 0,
      usl,
      lsl,
      cp: null,
      cpk: null,
      cpu: null,
      cpl: null,
      evaluation: 'Không đủ điều kiện tính'
    };
  }

  const sum = samples.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  const varianceSum = samples.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const stdDev = Math.sqrt(varianceSum / (n - 1));

  if (stdDev === 0) {
    return {
      valid: false,
      message: 'Độ lệch chuẩn bằng 0 (tất cả các mẫu có cùng một giá trị), không thể tính Cpk.',
      sampleCount: n,
      mean,
      stdDev: 0,
      usl,
      lsl,
      cp: null,
      cpk: null,
      cpu: null,
      cpl: null,
      evaluation: 'Không đủ điều kiện tính'
    };
  }

  const cp = (usl - lsl) / (6 * stdDev);
  const cpu = (usl - mean) / (3 * stdDev);
  const cpl = (mean - lsl) / (3 * stdDev);
  const cpk = Math.min(cpu, cpl);

  let evaluation: CpkAnalysisResult['evaluation'] = 'Không đạt (Cpk < 1.00)';
  if (cpk >= 1.67) {
    evaluation = 'Xuất sắc (Cpk >= 1.67)';
  } else if (cpk >= 1.33) {
    evaluation = 'Đạt yêu cầu (1.33 <= Cpk < 1.67)';
  } else if (cpk >= 1.0) {
    evaluation = 'Chấp nhận có kiểm soát (1.00 <= Cpk < 1.33)';
  }

  return {
    valid: true,
    sampleCount: n,
    mean: Number(mean.toFixed(3)),
    stdDev: Number(stdDev.toFixed(4)),
    usl,
    lsl,
    cp: Number(cp.toFixed(2)),
    cpk: Number(cpk.toFixed(2)),
    cpu: Number(cpu.toFixed(2)),
    cpl: Number(cpl.toFixed(2)),
    evaluation
  };
}

/**
 * Kiểm tra trạng thái KPI so với mục tiêu
 */
export function getKPIStatus(
  currentValue: number | null,
  targetValue: number,
  warningThreshold: number,
  dangerThreshold: number,
  comparisonType: 'LESS_THAN' | 'GREATER_THAN'
): 'GOOD' | 'WARNING' | 'DANGER' | 'NO_DATA' {
  if (currentValue === null || isNaN(currentValue)) {
    return 'NO_DATA';
  }

  if (comparisonType === 'LESS_THAN') {
    // Chỉ tiêu càng thấp càng tốt (ví dụ tỷ lệ lỗi, số khiếu nại)
    if (currentValue <= targetValue) return 'GOOD';
    if (currentValue <= dangerThreshold) return 'WARNING';
    return 'DANGER';
  } else {
    // Chỉ tiêu càng cao càng tốt (ví dụ tỷ lệ đạt, tỷ lệ đóng CAPA)
    if (currentValue >= targetValue) return 'GOOD';
    if (currentValue >= dangerThreshold) return 'WARNING';
    return 'DANGER';
  }
}
