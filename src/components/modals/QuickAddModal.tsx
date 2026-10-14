/**
 * @license
 * LOL Quality Control Center - Quick Add Record Modal
 * Form nhập dữ liệu chuẩn xác thực tế, kiểm tra tính hợp lệ trước khi lưu.
 */

import React, { useState } from 'react';
import { useQuality } from '../../context/QualityContext';
import { X, Check, AlertCircle } from 'lucide-react';
import { SeverityLevel, InspectionResult, IQCDecision, OQCDecision } from '../../types/quality';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: 'IQC' | 'IPQC' | 'OQC' | 'CUSTOMER' | 'DEFECT' | 'CAPA';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultModule = 'IQC'
}) => {
  const {
    addIQCRecord,
    addIPQCRecord,
    addOQCRecord,
    addComplaint,
    addDefectItem,
    addCAPARecord,
    suppliers,
    products,
    components,
    processes
  } = useQuality();

  const [activeTab, setActiveTab] = useState<'IQC' | 'IPQC' | 'OQC' | 'CUSTOMER' | 'DEFECT' | 'CAPA'>(defaultModule);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // IQC Form state
  const [iqcForm, setIqcForm] = useState({
    recordCode: `IQC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    receiptDate: new Date().toISOString().substring(0, 10),
    supplierId: suppliers[0]?.id || '',
    supplierName: suppliers[0]?.name || '',
    componentCode: components[0]?.code || '',
    componentName: components[0]?.name || '',
    lotNumber: '',
    deliveryNoteNumber: '',
    receivedQuantity: 1000,
    inspectedQuantity: 80,
    passedQuantity: 80,
    defectQuantity: 0,
    defectType: '',
    severity: 'MINOR' as SeverityLevel,
    result: 'PASS' as InspectionResult,
    decision: 'ACCEPT' as IQCDecision,
    inspector: 'Kỹ thuật viên IQC',
    notes: '',
    status: 'CLOSED' as any,
    isSample: false
  });

  // IPQC Form state
  const [ipqcForm, setIpqcForm] = useState({
    recordCode: `IPQC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    inspectionTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    factory: 'Nhà máy 1 - Bắc Ninh',
    workshop: 'Xưởng SMT A',
    lineId: 'SMT-01',
    processId: 'SMT_AOI',
    processName: 'Kiểm tra quang học tự động (3D AOI)',
    shift: 'Ca 1 (06:00 - 14:00)' as any,
    productCode: products[0]?.code || '',
    productName: products[0]?.name || '',
    workOrderNumber: `WO-${new Date().getFullYear()}-01`,
    productionLotNumber: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
    producedQuantity: 500,
    inspectedQuantity: 80,
    passedQuantity: 78,
    defectQuantity: 2,
    defectType: '',
    severity: 'MAJOR' as SeverityLevel,
    equipmentId: '',
    inspector: 'Kỹ thuật viên IPQC',
    immediateAction: '',
    status: 'IN_PROGRESS' as any,
    isSample: false
  });

  // OQC Form state
  const [oqcForm, setOqcForm] = useState({
    recordCode: `OQC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    inspectionDate: new Date().toISOString().substring(0, 10),
    productCode: products[0]?.code || '',
    productName: products[0]?.name || '',
    finishedLotNumber: `LOT-TP-${Math.floor(1000 + Math.random() * 9000)}`,
    workOrderNumber: `WO-${new Date().getFullYear()}-01`,
    intendedCustomer: products[0]?.customer || 'Khách hàng',
    finishedQuantity: 500,
    inspectedQuantity: 50,
    passedQuantity: 50,
    defectQuantity: 0,
    defectType: '',
    result: 'PASS' as InspectionResult,
    inspector: 'Kỹ thuật viên OQC',
    shippingDecision: 'RELEASE' as OQCDecision,
    isQuarantined: false,
    notes: '',
    isSample: false
  });

  // Complaint Form state
  const [complaintForm, setComplaintForm] = useState({
    complaintCode: `CC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
    reportedDate: new Date().toISOString().substring(0, 10),
    customerName: 'Yamaha Robotics',
    productCode: products[0]?.code || '',
    productName: products[0]?.name || '',
    lotOrSerialNumber: '',
    orderNumber: 'PO-2026-001',
    deliveredQuantity: 1000,
    affectedQuantity: 1,
    defectType: '',
    severity: 'MAJOR' as SeverityLevel,
    problemDescription: '',
    assignedPerson: 'Kỹ sư CQE',
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
    status: 'NEW' as any,
    isSample: false
  });

  // Defect Form state
  const [defectForm, setDefectForm] = useState({
    defectCode: `DEF-${Math.floor(100 + Math.random() * 900)}`,
    defectName: '',
    defectCategory: 'Hàn & Thiếc' as any,
    detectedProcess: 'SMT_AOI',
    severity: 'MAJOR' as SeverityLevel,
    description: '',
    detectedDate: new Date().toISOString().substring(0, 10),
    status: 'OPEN' as any,
    isSample: false
  });

  // CAPA Form state
  const [capaForm, setCapaForm] = useState({
    capaCode: `CAPA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    source: 'IPQC' as any,
    relatedReferenceCode: '',
    problemDescription: '',
    severity: 'MAJOR' as SeverityLevel,
    assignedPerson: 'Trưởng nhóm chất lượng',
    department: 'Khối Sản xuất & QA',
    openDate: new Date().toISOString().substring(0, 10),
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
    status: 'OPEN' as any,
    analysisMethod: '5-Why' as any,
    containmentAction: '',
    correctiveAction: '',
    preventiveAction: '',
    executor: 'Kỹ sư phụ trách',
    isSample: false
  });

  if (!isOpen) return null;

  const handleSave = () => {
    setErrorMessage('');

    if (activeTab === 'IQC') {
      if (!iqcForm.lotNumber) {
        setErrorMessage('Vui lòng nhập Mã lô hàng nguyên vật liệu!');
        return;
      }
      const res = addIQCRecord(iqcForm);
      if (!res.success) {
        setErrorMessage(res.message || 'Lỗi lưu bản ghi IQC!');
        return;
      }
    } else if (activeTab === 'IPQC') {
      if (!ipqcForm.workOrderNumber || !ipqcForm.productionLotNumber) {
        setErrorMessage('Vui lòng nhập Mã lệnh sản xuất và Lô sản xuất!');
        return;
      }
      const res = addIPQCRecord(ipqcForm);
      if (!res.success) {
        setErrorMessage(res.message || 'Lỗi lưu bản ghi IPQC!');
        return;
      }
    } else if (activeTab === 'OQC') {
      if (!oqcForm.finishedLotNumber) {
        setErrorMessage('Vui lòng nhập Mã lô thành phẩm!');
        return;
      }
      const res = addOQCRecord(oqcForm);
      if (!res.success) {
        setErrorMessage(res.message || 'Lỗi lưu bản ghi OQC!');
        return;
      }
    } else if (activeTab === 'CUSTOMER') {
      if (!complaintForm.problemDescription) {
        setErrorMessage('Vui lòng nhập mô tả khiếu nại khách hàng!');
        return;
      }
      const res = addComplaint(complaintForm);
      if (!res.success) {
        setErrorMessage(res.message || 'Lỗi lưu khiếu nại!');
        return;
      }
    } else if (activeTab === 'DEFECT') {
      if (!defectForm.defectName) {
        setErrorMessage('Vui lòng nhập tên loại lỗi!');
        return;
      }
      addDefectItem(defectForm);
    } else if (activeTab === 'CAPA') {
      if (!capaForm.problemDescription) {
        setErrorMessage('Vui lòng nhập mô tả vấn đề CAPA!');
        return;
      }
      addCAPARecord(capaForm);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <h3 className="text-base font-semibold text-slate-900">
            Nhập Dữ Liệu Kiểm Tra Mới
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Module Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'IQC', label: '1. IQC Đầu vào' },
            { id: 'IPQC', label: '2. IPQC Công đoạn' },
            { id: 'OQC', label: '3. OQC Đầu ra' },
            { id: 'CUSTOMER', label: '4. Khiếu nại KH' },
            { id: 'DEFECT', label: '5. Danh mục Lỗi' },
            { id: 'CAPA', label: '6. Hồ sơ CAPA' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setErrorMessage('');
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-sky-700 border-t-2 border-sky-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error alert if any */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Form */}
        <div className="p-6 space-y-4 text-xs">
          {/* IQC Form */}
          {activeTab === 'IQC' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã bản ghi</label>
                  <input
                    type="text"
                    value={iqcForm.recordCode}
                    onChange={e => setIqcForm(p => ({ ...p, recordCode: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày nhận hàng</label>
                  <input
                    type="date"
                    value={iqcForm.receiptDate}
                    onChange={e => setIqcForm(p => ({ ...p, receiptDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nhà cung cấp</label>
                  <select
                    value={iqcForm.supplierId}
                    onChange={e => {
                      const sup = suppliers.find(s => s.id === e.target.value);
                      setIqcForm(p => ({ ...p, supplierId: e.target.value, supplierName: sup?.name || '' }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Linh kiện / Vật liệu</label>
                  <select
                    value={iqcForm.componentCode}
                    onChange={e => {
                      const comp = components.find(c => c.code === e.target.value);
                      setIqcForm(p => ({ ...p, componentCode: e.target.value, componentName: comp?.name || '' }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 truncate"
                  >
                    {components.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã lô (Lot Number) *</label>
                  <input
                    type="text"
                    placeholder="VD: LOT-2026-A1"
                    value={iqcForm.lotNumber}
                    onChange={e => setIqcForm(p => ({ ...p, lotNumber: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Số phiếu nhập / DN</label>
                  <input
                    type="text"
                    placeholder="VD: DN-9910"
                    value={iqcForm.deliveryNoteNumber}
                    onChange={e => setIqcForm(p => ({ ...p, deliveryNoteNumber: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL nhận</label>
                  <input
                    type="number"
                    min="1"
                    value={iqcForm.receivedQuantity}
                    onChange={e => setIqcForm(p => ({ ...p, receivedQuantity: Number(e.target.value) }))}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL kiểm tra *</label>
                  <input
                    type="number"
                    min="1"
                    value={iqcForm.inspectedQuantity}
                    onChange={e => {
                      const inspected = Number(e.target.value);
                      const defect = iqcForm.defectQuantity;
                      setIqcForm(p => ({ ...p, inspectedQuantity: inspected, passedQuantity: Math.max(0, inspected - defect) }));
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL lỗi</label>
                  <input
                    type="number"
                    min="0"
                    value={iqcForm.defectQuantity}
                    onChange={e => {
                      const defect = Number(e.target.value);
                      const inspected = iqcForm.inspectedQuantity;
                      setIqcForm(p => ({
                        ...p,
                        defectQuantity: defect,
                        passedQuantity: Math.max(0, inspected - defect),
                        result: defect > 0 ? 'FAIL' : 'PASS',
                        decision: defect > 0 ? 'QUARANTINE' : 'ACCEPT'
                      }));
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL đạt</label>
                  <input
                    type="number"
                    readOnly
                    value={iqcForm.passedQuantity}
                    className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={iqcForm.severity}
                    onChange={e => setIqcForm(p => ({ ...p, severity: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                    <option value="MAJOR">Nặng (Major)</option>
                    <option value="MINOR">Nhẹ (Minor)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kết quả kiểm tra</label>
                  <select
                    value={iqcForm.result}
                    onChange={e => setIqcForm(p => ({ ...p, result: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="PASS">Đạt (PASS)</option>
                    <option value="FAIL">Không đạt (FAIL)</option>
                    <option value="PENDING">Chờ xử lý (PENDING)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quyết định xử lý</label>
                  <select
                    value={iqcForm.decision}
                    onChange={e => setIqcForm(p => ({ ...p, decision: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="ACCEPT">Chấp nhận nhập kho</option>
                    <option value="QUARANTINE">Cách ly chờ xử lý</option>
                    <option value="REJECT_RETURN">Từ chối - Trả NCC</option>
                    <option value="CONCESSION_PENDING">Chờ duyệt nhân nhượng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Loại lỗi phát hiện (nếu có)</label>
                <input
                  type="text"
                  placeholder="VD: Oxi hóa chân cắm, cong vênh, rộp vỏ..."
                  value={iqcForm.defectType}
                  onChange={e => setIqcForm(p => ({ ...p, defectType: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                />
              </div>
            </div>
          )}

          {/* IPQC Form */}
          {activeTab === 'IPQC' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã bản ghi</label>
                  <input
                    type="text"
                    value={ipqcForm.recordCode}
                    onChange={e => setIpqcForm(p => ({ ...p, recordCode: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Thời gian kiểm tra</label>
                  <input
                    type="text"
                    value={ipqcForm.inspectionTime}
                    onChange={e => setIpqcForm(p => ({ ...p, inspectionTime: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Dây chuyền</label>
                  <select
                    value={ipqcForm.lineId}
                    onChange={e => setIpqcForm(p => ({ ...p, lineId: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="SMT-01">SMT-01</option>
                    <option value="SMT-02">SMT-02</option>
                    <option value="SMT-03">SMT-03</option>
                    <option value="ASSY-01">ASSY-01</option>
                    <option value="ASSY-02">ASSY-02</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Công đoạn</label>
                  <select
                    value={ipqcForm.processId}
                    onChange={e => {
                      const proc = processes.find(p => p.id === e.target.value);
                      setIpqcForm(p => ({ ...p, processId: e.target.value, processName: proc?.name || '' }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 truncate"
                  >
                    {processes.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ca sản xuất</label>
                  <select
                    value={ipqcForm.shift}
                    onChange={e => setIpqcForm(p => ({ ...p, shift: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="Ca 1 (06:00 - 14:00)">Ca 1 (06:00 - 14:00)</option>
                    <option value="Ca 2 (14:00 - 22:00)">Ca 2 (14:00 - 22:00)</option>
                    <option value="Ca 3 (22:00 - 06:00)">Ca 3 (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã sản phẩm</label>
                  <select
                    value={ipqcForm.productCode}
                    onChange={e => {
                      const prod = products.find(p => p.code === e.target.value);
                      setIpqcForm(p => ({ ...p, productCode: e.target.value, productName: prod?.name || '' }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    {products.map(p => (
                      <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lệnh SX (WO) & Lô SX *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="WO-2610-..."
                      value={ipqcForm.workOrderNumber}
                      onChange={e => setIpqcForm(p => ({ ...p, workOrderNumber: e.target.value }))}
                      className="px-2 py-1.5 border border-slate-200 rounded text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="LOT-..."
                      value={ipqcForm.productionLotNumber}
                      onChange={e => setIpqcForm(p => ({ ...p, productionLotNumber: e.target.value }))}
                      className="px-2 py-1.5 border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL sản xuất</label>
                  <input
                    type="number"
                    min="1"
                    value={ipqcForm.producedQuantity}
                    onChange={e => setIpqcForm(p => ({ ...p, producedQuantity: Number(e.target.value) }))}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL kiểm tra *</label>
                  <input
                    type="number"
                    min="1"
                    value={ipqcForm.inspectedQuantity}
                    onChange={e => {
                      const inspected = Number(e.target.value);
                      const defect = ipqcForm.defectQuantity;
                      setIpqcForm(p => ({ ...p, inspectedQuantity: inspected, passedQuantity: Math.max(0, inspected - defect) }));
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL lỗi</label>
                  <input
                    type="number"
                    min="0"
                    value={ipqcForm.defectQuantity}
                    onChange={e => {
                      const defect = Number(e.target.value);
                      const inspected = ipqcForm.inspectedQuantity;
                      setIpqcForm(p => ({ ...p, defectQuantity: defect, passedQuantity: Math.max(0, inspected - defect) }));
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL đạt</label>
                  <input
                    type="number"
                    readOnly
                    value={ipqcForm.passedQuantity}
                    className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Loại lỗi phát hiện</label>
                  <input
                    type="text"
                    placeholder="VD: Cầu chì hàn, lệch linh kiện, thiếu thiếc..."
                    value={ipqcForm.defectType}
                    onChange={e => setIpqcForm(p => ({ ...p, defectType: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={ipqcForm.severity}
                    onChange={e => setIpqcForm(p => ({ ...p, severity: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                    <option value="MAJOR">Nặng (Major)</option>
                    <option value="MINOR">Nhẹ (Minor)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* OQC Form */}
          {activeTab === 'OQC' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã bản ghi OQC</label>
                  <input
                    type="text"
                    value={oqcForm.recordCode}
                    onChange={e => setOqcForm(p => ({ ...p, recordCode: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày kiểm tra</label>
                  <input
                    type="date"
                    value={oqcForm.inspectionDate}
                    onChange={e => setOqcForm(p => ({ ...p, inspectionDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã sản phẩm</label>
                  <select
                    value={oqcForm.productCode}
                    onChange={e => {
                      const prod = products.find(p => p.code === e.target.value);
                      setOqcForm(p => ({ ...p, productCode: e.target.value, productName: prod?.name || '', intendedCustomer: prod?.customer || '' }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    {products.map(p => (
                      <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Khách hàng dự kiến</label>
                  <input
                    type="text"
                    value={oqcForm.intendedCustomer}
                    onChange={e => setOqcForm(p => ({ ...p, intendedCustomer: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã lô thành phẩm *</label>
                  <input
                    type="text"
                    placeholder="LOT-TP-..."
                    value={oqcForm.finishedLotNumber}
                    onChange={e => setOqcForm(p => ({ ...p, finishedLotNumber: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quyết định xuất hàng</label>
                  <select
                    value={oqcForm.shippingDecision}
                    onChange={e => setOqcForm(p => ({ ...p, shippingDecision: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="RELEASE">Cho phép xuất hàng (RELEASE)</option>
                    <option value="HOLD">Tạm giữ chờ xử lý (HOLD)</option>
                    <option value="REWORK">Tái chế lại (REWORK)</option>
                    <option value="PENDING_APPROVAL">Chờ phê duyệt ban giám đốc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL thành phẩm</label>
                  <input
                    type="number"
                    min="1"
                    value={oqcForm.finishedQuantity}
                    onChange={e => setOqcForm(p => ({ ...p, finishedQuantity: Number(e.target.value) }))}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL kiểm tra *</label>
                  <input
                    type="number"
                    min="1"
                    value={oqcForm.inspectedQuantity}
                    onChange={e => {
                      const inspected = Number(e.target.value);
                      const defect = oqcForm.defectQuantity;
                      setOqcForm(p => ({ ...p, inspectedQuantity: inspected, passedQuantity: Math.max(0, inspected - defect) }));
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL lỗi</label>
                  <input
                    type="number"
                    min="0"
                    value={oqcForm.defectQuantity}
                    onChange={e => {
                      const defect = Number(e.target.value);
                      const inspected = oqcForm.inspectedQuantity;
                      setOqcForm(p => ({ ...p, defectQuantity: defect, passedQuantity: Math.max(0, inspected - defect) }));
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">SL đạt</label>
                  <input
                    type="number"
                    readOnly
                    value={oqcForm.passedQuantity}
                    className="w-full px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Form */}
          {activeTab === 'CUSTOMER' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã khiếu nại</label>
                  <input
                    type="text"
                    value={complaintForm.complaintCode}
                    onChange={e => setComplaintForm(p => ({ ...p, complaintCode: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Khách hàng phản ánh</label>
                  <input
                    type="text"
                    value={complaintForm.customerName}
                    onChange={e => setComplaintForm(p => ({ ...p, customerName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mô tả khiếu nại của khách hàng *</label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ hiện tượng lỗi khách hàng gặp phải..."
                  value={complaintForm.problemDescription}
                  onChange={e => setComplaintForm(p => ({ ...p, problemDescription: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SL giao hàng</label>
                  <input
                    type="number"
                    min="1"
                    value={complaintForm.deliveredQuantity}
                    onChange={e => setComplaintForm(p => ({ ...p, deliveredQuantity: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SL bị ảnh hưởng</label>
                  <input
                    type="number"
                    min="1"
                    value={complaintForm.affectedQuantity}
                    onChange={e => setComplaintForm(p => ({ ...p, affectedQuantity: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức độ</label>
                  <select
                    value={complaintForm.severity}
                    onChange={e => setComplaintForm(p => ({ ...p, severity: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                    <option value="MAJOR">Nặng (Major)</option>
                    <option value="MINOR">Nhẹ (Minor)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Defect catalog Form */}
          {activeTab === 'DEFECT' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã loại lỗi</label>
                  <input
                    type="text"
                    value={defectForm.defectCode}
                    onChange={e => setDefectForm(p => ({ ...p, defectCode: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tên lỗi *</label>
                  <input
                    type="text"
                    placeholder="VD: Cầu chì hàn, Rỗ khí..."
                    value={defectForm.defectName}
                    onChange={e => setDefectForm(p => ({ ...p, defectName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nhóm lỗi</label>
                  <select
                    value={defectForm.defectCategory}
                    onChange={e => setDefectForm(p => ({ ...p, defectCategory: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="Hàn & Thiếc">Hàn & Thiếc</option>
                    <option value="Ngoại quan & Bề mặt">Ngoại quan & Bề mặt</option>
                    <option value="Lắp ráp cơ khí">Lắp ráp cơ khí</option>
                    <option value="Linh kiện & Vật liệu">Linh kiện & Vật liệu</option>
                    <option value="Chức năng điện tử">Chức năng điện tử</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={defectForm.severity}
                    onChange={e => setDefectForm(p => ({ ...p, severity: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                    <option value="MAJOR">Nặng (Major)</option>
                    <option value="MINOR">Nhẹ (Minor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mô tả đặc điểm nhận diện lỗi</label>
                <textarea
                  rows={2}
                  value={defectForm.description}
                  onChange={e => setDefectForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                />
              </div>
            </div>
          )}

          {/* CAPA Form */}
          {activeTab === 'CAPA' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã hồ sơ CAPA</label>
                  <input
                    type="text"
                    value={capaForm.capaCode}
                    onChange={e => setCapaForm(p => ({ ...p, capaCode: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nguồn phát sinh</label>
                  <select
                    value={capaForm.source}
                    onChange={e => setCapaForm(p => ({ ...p, source: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  >
                    <option value="IQC">IQC Đầu vào</option>
                    <option value="IPQC">IPQC Công đoạn</option>
                    <option value="OQC">OQC Đầu ra</option>
                    <option value="Khiếu nại khách hàng">Khiếu nại khách hàng</option>
                    <option value="Đánh giá nội bộ">Đánh giá nội bộ (Audit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mô tả vấn đề cần khắc phục / phòng ngừa *</label>
                <textarea
                  rows={2}
                  value={capaForm.problemDescription}
                  onChange={e => setCapaForm(p => ({ ...p, problemDescription: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Người phụ trách chính</label>
                  <input
                    type="text"
                    value={capaForm.assignedPerson}
                    onChange={e => setCapaForm(p => ({ ...p, assignedPerson: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hạn hoàn thành (Target Date)</label>
                  <input
                    type="date"
                    value={capaForm.targetDate}
                    onChange={e => setCapaForm(p => ({ ...p, targetDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Hành động ngăn chặn tức thời (Containment)</label>
                <textarea
                  rows={2}
                  placeholder="Cách ly sản phẩm, dừng chuyền, kiểm tra 100%..."
                  value={capaForm.containmentAction}
                  onChange={e => setCapaForm(p => ({ ...p, containmentAction: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <span className="text-[11px] text-slate-500">
            Dữ liệu lưu vào bộ nhớ cục bộ thiết bị của bạn.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu bản ghi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
