/**
 * @license
 * LOL Quality Control Center - Auto-Generated CAPA Review & Confirmation Modal
 * Tự động kích hoạt khi phát hiện lỗi nghiêm trọng (Critical) hoặc lỗi lặp lại (Recurring defect).
 * Cho phép người dùng xem xét, điều chỉnh và xác nhận khởi tạo hồ sơ CAPA ngay lập tức.
 */

import React, { useState, useEffect } from 'react';
import { useQuality } from '../../context/QualityContext';
import { AutoCAPAPromptData, SeverityLevel } from '../../types/quality';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  UserCheck, 
  Calendar, 
  Building2,
  FileCheck2,
  Flame
} from 'lucide-react';

interface AutoCAPAPromptModalProps {
  promptData: AutoCAPAPromptData | null;
  isOpen: boolean;
  onClose: () => void;
  onCAPACreated?: (capaCode: string) => void;
}

export const AutoCAPAPromptModal: React.FC<AutoCAPAPromptModalProps> = ({
  promptData,
  isOpen,
  onClose,
  onCAPACreated
}) => {
  const { addCAPARecord } = useQuality();

  const [form, setForm] = useState({
    capaCode: '',
    source: 'IQC' as any,
    relatedReferenceCode: '',
    problemDescription: '',
    severity: 'CRITICAL' as SeverityLevel,
    assignedPerson: '',
    department: '',
    containmentAction: '',
    targetDate: '',
    analysisMethod: '5-Why' as any,
    triggerReason: ''
  });

  useEffect(() => {
    if (promptData) {
      const year = new Date().getFullYear();
      const rand = Math.floor(100 + Math.random() * 900);
      setForm({
        capaCode: `CAPA-${year}-${rand}`,
        source: promptData.source,
        relatedReferenceCode: promptData.relatedReferenceCode,
        problemDescription: promptData.problemDescription,
        severity: promptData.severity,
        assignedPerson: promptData.suggestedPersonnel,
        department: promptData.department,
        containmentAction: promptData.containmentAction,
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
        analysisMethod: '5-Why',
        triggerReason: promptData.triggerReason
      });
    }
  }, [promptData]);

  if (!isOpen || !promptData) return null;

  const handleConfirm = () => {
    if (!form.problemDescription.trim()) {
      alert('Vui lòng nhập mô tả vấn đề chất lượng!');
      return;
    }
    if (!form.assignedPerson.trim()) {
      alert('Vui lòng chỉ định người phụ trách CAPA!');
      return;
    }

    // Create the CAPA with initial status 'OPEN_PENDING_REVIEW'
    const res = addCAPARecord({
      capaCode: form.capaCode,
      source: form.source,
      relatedReferenceCode: form.relatedReferenceCode,
      problemDescription: form.problemDescription,
      severity: form.severity,
      assignedPerson: form.assignedPerson,
      department: form.department,
      openDate: new Date().toISOString().substring(0, 10),
      targetDate: form.targetDate,
      status: 'OPEN_PENDING_REVIEW', // Initial status: Open - Pending Review
      analysisMethod: form.analysisMethod,
      containmentAction: form.containmentAction,
      correctiveAction: 'Đang chờ phân tích nguyên nhân gốc rễ và lập kế hoạch khắc phục.',
      preventiveAction: '',
      executor: form.assignedPerson,
      isSample: promptData.isSample ?? false
    });

    if (res.success) {
      onClose();
      if (onCAPACreated) {
        onCAPACreated(form.capaCode);
      }
    } else {
      alert(res.message || 'Lỗi khởi tạo CAPA!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl border-2 border-rose-300">
        {/* Header alert */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white px-6 py-4 rounded-t-xl flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/15 rounded-lg border border-white/20 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded text-amber-200">
                  CẢNH BÁO CHẤT LƯỢNG
                </span>
                <span className="text-xs text-white/90 font-mono font-medium">Hệ thống kích hoạt CAPA tự động</span>
              </div>
              <h3 className="text-base font-bold mt-1 text-white">
                Đề Xuất Khởi Tạo Hồ Sơ CAPA Khắc Phục Khẩn Cấp
              </h3>
              <p className="text-xs text-rose-100 mt-0.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Lý do: <strong>{form.triggerReason}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status banner info */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Trạng thái khởi tạo: <strong>Open - Pending Review (Mở - Chờ xem xét)</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              Mã đề xuất: <strong className="text-slate-900">{form.capaCode}</strong>
            </span>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nguồn phát sinh sự cố (Defect Source)
              </label>
              <input
                type="text"
                readOnly
                value={`${form.source} (Mã liên quan: ${form.relatedReferenceCode})`}
                className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mức độ nghiêm trọng (Severity) *
              </label>
              <select
                value={form.severity}
                onChange={e => setForm(prev => ({ ...prev, severity: e.target.value as SeverityLevel }))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-semibold text-rose-700 bg-white"
              >
                <option value="CRITICAL">Nghiêm trọng (Critical - Nguy cơ dừng chuyền/thu hồi)</option>
                <option value="MAJOR">Nặng (Major - Ảnh hưởng chức năng/thông số)</option>
                <option value="MINOR">Nhẹ (Minor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả sự cố chất lượng (Defect Description) *
            </label>
            <textarea
              rows={3}
              value={form.problemDescription}
              onChange={e => setForm(prev => ({ ...prev, problemDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 leading-relaxed focus:ring-1 focus:ring-sky-500 font-medium"
              placeholder="Mô tả hiện tượng lỗi, vị trí phát hiện và phạm vi ảnh hưởng..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Người phụ trách đề xuất (Suggested Responsible Personnel) *</span>
                <span className="text-[10px] text-sky-600 font-normal">Hệ thống gợi ý</span>
              </label>
              <div className="relative">
                <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.assignedPerson}
                  onChange={e => setForm(prev => ({ ...prev, assignedPerson: e.target.value }))}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-slate-800 font-medium"
                  placeholder="Họ tên kỹ sư phụ trách..."
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bộ phận liên quan (Department)</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hành động ngăn chặn tức thời (D3 Containment Action Draft)
            </label>
            <textarea
              rows={2}
              value={form.containmentAction}
              onChange={e => setForm(prev => ({ ...prev, containmentAction: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 focus:ring-1 focus:ring-sky-500"
              placeholder="Cách ly lô hàng, dừng chuyền tạm thời, kiểm tra 100%..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phương pháp phân tích nguyên nhân</label>
              <select
                value={form.analysisMethod}
                onChange={e => setForm(prev => ({ ...prev, analysisMethod: e.target.value as any }))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 bg-white"
              >
                <option value="5-Why">5-Why (Phân tích 5 câu hỏi Tại sao)</option>
                <option value="Ishikawa / Xương cá">Biểu đồ xương cá (Ishikawa / Fishbone)</option>
                <option value="FTA (Fault Tree Analysis)">Cây lỗi sự cố (Fault Tree Analysis - FTA)</option>
                <option value="FMEA">Phân tích FMEA</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hạn hoàn thành mục tiêu (Target Date)</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Bỏ qua / Xem xét sau
          </button>

          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác nhận & Khởi tạo CAPA Ngay (Open - Pending Review)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
