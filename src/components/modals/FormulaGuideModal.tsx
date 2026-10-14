/**
 * @license
 * LOL Quality Control Center - Formula Guide Modal
 * Hướng dẫn giải thích công thức toán học và tiêu chuẩn chất lượng.
 */

import React from 'react';
import { X, HelpCircle, AlertTriangle, Calculator, CheckCircle2 } from 'lucide-react';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Cơ sở Công thức Quản lý Chất lượng & Tiêu chuẩn Tính toán
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Note on Zero division */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Quy tắc bắt buộc về mẫu số và chia cho 0:</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Nếu số lượng kiểm tra bằng 0 hoặc dữ liệu còn trống, hệ thống không thực hiện phép chia và hiển thị "N/A".
                Số lượng lỗi không được vượt quá số lượng kiểm tra. Không cộng gộp trực tiếp các tỷ lệ phần trăm giữa các nhóm mà tính lại từ tổng số lượng tương ứng.
              </p>
            </div>
          </div>

          {/* Formulas list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-sky-700 tracking-wider">01. CHẤT LƯỢNG ĐẦU VÀO IQC</span>
              <h4 className="font-semibold text-slate-900 mt-1">Tỷ lệ lỗi linh kiện đầu vào (%)</h4>
              <div className="p-2 bg-white rounded border border-slate-200 my-2 font-mono text-xs text-slate-800 tabular-nums">
                Tỷ lệ lỗi (%) = (Số lượng lỗi / Số lượng kiểm tra) × 100
              </div>
              <p className="text-xs text-slate-500">
                Phân biệt với <strong>Tỷ lệ lô đạt (%)</strong> = (Số lô đạt / Tổng số lô đã đánh giá) × 100. Không dùng thay thế cho nhau.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-sky-700 tracking-wider">02. CHẤT LƯỢNG CÔNG ĐOẠN IPQC</span>
              <h4 className="font-semibold text-slate-900 mt-1">Tỷ lệ lỗi quá trình sản xuất (%)</h4>
              <div className="p-2 bg-white rounded border border-slate-200 my-2 font-mono text-xs text-slate-800 tabular-nums">
                Tỷ lệ lỗi (%) = (Số sản phẩm lỗi / Số sản phẩm kiểm tra) × 100
              </div>
              <p className="text-xs text-slate-500">
                Phân biệt tỷ lệ sản phẩm lỗi với tổng số lỗi phát hiện (một sản phẩm có thể có nhiều lỗi hàn hoặc lệch linh kiện).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-sky-700 tracking-wider">03. CHẤT LƯỢNG ĐẦU RA OQC/FQC</span>
              <h4 className="font-semibold text-slate-900 mt-1">Tỷ lệ đạt thành phẩm xuất xưởng (%)</h4>
              <div className="p-2 bg-white rounded border border-slate-200 my-2 font-mono text-xs text-slate-800 tabular-nums">
                Tỷ lệ đạt (%) = (Số lượng đạt / Số lượng kiểm tra) × 100
              </div>
              <p className="text-xs text-slate-500">
                Lấy mẫu theo tiêu chuẩn AQL (Acceptable Quality Level). Tỷ lệ mẫu lỗi không tự suy diễn cho toàn bộ lô nếu chưa có cơ sở thống kê.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-sky-700 tracking-wider">04. CHẤT LƯỢNG KHÁCH HÀNG</span>
              <h4 className="font-semibold text-slate-900 mt-1">Tỷ lệ khiếu nại khách hàng (PPM)</h4>
              <div className="p-2 bg-white rounded border border-slate-200 my-2 font-mono text-xs text-slate-800 tabular-nums">
                PPM = (Số sản phẩm bị khiếu nại / Tổng số lượng đã giao) × 1,000,000
              </div>
              <p className="text-xs text-slate-500">
                Chỉ tính khiếu nại chính thức khi đã qua xác minh kỹ thuật giữa LOL và khách hàng.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
              <span className="text-xs font-bold text-sky-700 tracking-wider">05. THỐNG KÊ NĂNG LỰC QUY TRÌNH (SPC - Cp / Cpk)</span>
              <h4 className="font-semibold text-slate-900 mt-1">Chỉ số Năng lực Quy trình Cp & Cpk</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 font-mono text-xs text-slate-800">
                <div className="p-2 bg-white rounded border border-slate-200">
                  Cp = (USL - LSL) / (6 × σ)
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  Cpk = Min((USL - μ) / 3σ, (μ - LSL) / 3σ)
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p>• <strong>Điều kiện thống kê</strong>: Dữ liệu phân phối chuẩn, số mẫu N ≥ 20 từ các mẻ sản xuất ổn định.</p>
                <p>• <strong>Tiêu chuẩn đánh giá</strong>: Cpk ≥ 1.67 (Xuất sắc, 6-Sigma); 1.33 ≤ Cpk &lt; 1.67 (Đạt yêu cầu công nghiệp); 1.00 ≤ Cpk &lt; 1.33 (Chấp nhận có giám sát); Cpk &lt; 1.00 (Không đạt).</p>
                <p>• Hệ thống chỉ tính toán trên các thông số đo lường liên tục thực tế, không tự tính Cpk từ tổng số lỗi chung.</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Tất cả công thức trên đã được tích hợp tự động vào thuật toán tính toán của hệ thống.
            </span>
            <span className="text-blue-700">LOL Quality Policy 2026</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
