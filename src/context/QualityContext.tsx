/**
 * @license
 * LOL Quality Control Center - Quality Context & State Management
 * Quản lý lưu trữ localStorage, phân quyền, dữ liệu mẫu vs dữ liệu thật, CRUD và sao lưu phục hồi.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  IQCRecord,
  IPQCRecord,
  OQCRecord,
  CustomerComplaintRecord,
  DefectItem,
  CAPARecord,
  KPITargetItem,
  SupplierItem,
  ProductItem,
  ComponentItem,
  ProcessItem,
  FilterState,
  UserRole,
  AutoCAPAPromptData
} from '../types/quality';
import {
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_COMPONENTS,
  INITIAL_PROCESSES,
  INITIAL_KPI_TARGETS,
  INITIAL_IQC_RECORDS,
  INITIAL_IPQC_RECORDS,
  INITIAL_OQC_RECORDS,
  INITIAL_CUSTOMER_COMPLAINTS,
  INITIAL_DEFECT_ITEMS,
  INITIAL_CAPA_RECORDS,
} from '../data/initialData';

const STORAGE_PREFIX = 'lol_qc_v1_';

interface QualityContextType {
  // Master lists
  iqcRecords: IQCRecord[];
  ipqcRecords: IPQCRecord[];
  oqcRecords: OQCRecord[];
  customerComplaints: CustomerComplaintRecord[];
  defectItems: DefectItem[];
  capaRecords: CAPARecord[];
  kpiTargets: KPITargetItem[];
  suppliers: SupplierItem[];
  products: ProductItem[];
  components: ComponentItem[];
  processes: ProcessItem[];

  // Filter & Global State
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean) => void;

  // Filtered Lists (based on current filters & data mode)
  filteredIQC: IQCRecord[];
  filteredIPQC: IPQCRecord[];
  filteredOQC: OQCRecord[];
  filteredComplaints: CustomerComplaintRecord[];
  filteredDefects: DefectItem[];
  filteredCAPA: CAPARecord[];

  // CRUD IQC
  addIQCRecord: (rec: Omit<IQCRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => { success: boolean; message?: string };
  updateIQCRecord: (id: string, updates: Partial<IQCRecord>) => void;
  deleteIQCRecord: (id: string) => void;

  // CRUD IPQC
  addIPQCRecord: (rec: Omit<IPQCRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => { success: boolean; message?: string };
  updateIPQCRecord: (id: string, updates: Partial<IPQCRecord>) => void;
  deleteIPQCRecord: (id: string) => void;

  // CRUD OQC
  addOQCRecord: (rec: Omit<OQCRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => { success: boolean; message?: string };
  updateOQCRecord: (id: string, updates: Partial<OQCRecord>) => void;
  deleteOQCRecord: (id: string) => void;

  // CRUD Complaints
  addComplaint: (rec: Omit<CustomerComplaintRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => { success: boolean; message?: string };
  updateComplaint: (id: string, updates: Partial<CustomerComplaintRecord>) => void;
  deleteComplaint: (id: string) => void;

  // CRUD Defects
  addDefectItem: (rec: Omit<DefectItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => { success: boolean; message?: string };
  updateDefectItem: (id: string, updates: Partial<DefectItem>) => void;
  deleteDefectItem: (id: string) => void;

  // CRUD CAPA
  addCAPARecord: (rec: Omit<CAPARecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'historyLogs'>) => { success: boolean; message?: string };
  updateCAPARecord: (id: string, updates: Partial<CAPARecord>) => void;
  deleteCAPARecord: (id: string) => void;

  // Master Data & KPI updates
  updateKPITarget: (id: string, updates: Partial<KPITargetItem>) => void;
  addSupplier: (sup: SupplierItem) => void;
  updateSupplier: (id: string, updates: Partial<SupplierItem>) => void;
  addProduct: (prod: ProductItem) => void;
  updateProduct: (code: string, updates: Partial<ProductItem>) => void;

  // Auto CAPA Prompting & Detection
  pendingAutoCAPA: AutoCAPAPromptData | null;
  triggerAutoCAPAPrompt: (data: AutoCAPAPromptData) => void;
  dismissAutoCAPAPrompt: () => void;
  getUnlinkedCriticalAndRecurringIssues: () => {
    id: string;
    source: 'IQC' | 'IPQC' | 'OQC' | 'Khiếu nại khách hàng';
    code: string;
    description: string;
    severity: string;
    reason: string;
    promptData: AutoCAPAPromptData;
  }[];

  // Data management
  resetToDemoData: () => void;
  clearSampleData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (file: File) => Promise<{ success: boolean; message: string }>;
  exportModuleToCSV: (moduleName: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  datePreset: 'thisMonth',
  startDate: '',
  endDate: '',
  factory: '',
  line: '',
  process: '',
  productCode: '',
  supplier: '',
  customer: '',
  severity: '',
  status: '',
  keyword: '',
  dataMode: 'all', // 'all' | 'sample' | 'real'
};

const QualityContext = createContext<QualityContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export const QualityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [iqcRecords, setIqcRecords] = useState<IQCRecord[]>(() => loadFromStorage('iqc_records', INITIAL_IQC_RECORDS));
  const [ipqcRecords, setIpqcRecords] = useState<IPQCRecord[]>(() => loadFromStorage('ipqc_records', INITIAL_IPQC_RECORDS));
  const [oqcRecords, setOqcRecords] = useState<OQCRecord[]>(() => loadFromStorage('oqc_records', INITIAL_OQC_RECORDS));
  const [customerComplaints, setCustomerComplaints] = useState<CustomerComplaintRecord[]>(() => loadFromStorage('customer_complaints', INITIAL_CUSTOMER_COMPLAINTS));
  const [defectItems, setDefectItems] = useState<DefectItem[]>(() => loadFromStorage('defect_items', INITIAL_DEFECT_ITEMS));
  const [capaRecords, setCapaRecords] = useState<CAPARecord[]>(() => loadFromStorage('capa_records', INITIAL_CAPA_RECORDS));
  const [kpiTargets, setKpiTargets] = useState<KPITargetItem[]>(() => loadFromStorage('kpi_targets', INITIAL_KPI_TARGETS));
  
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => loadFromStorage('suppliers', INITIAL_SUPPLIERS));
  const [products, setProducts] = useState<ProductItem[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [components] = useState<ComponentItem[]>(() => loadFromStorage('components', INITIAL_COMPONENTS));
  const [processes] = useState<ProcessItem[]>(() => loadFromStorage('processes', INITIAL_PROCESSES));

  const [activeRole, setActiveRole] = useState<UserRole>(() => loadFromStorage('active_role', 'QA_QC_MANAGER'));
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [pendingAutoCAPA, setPendingAutoCAPA] = useState<AutoCAPAPromptData | null>(null);

  const triggerAutoCAPAPrompt = (data: AutoCAPAPromptData) => {
    setPendingAutoCAPA(data);
  };

  const dismissAutoCAPAPrompt = () => {
    setPendingAutoCAPA(null);
  };

  // Sync to localStorage
  useEffect(() => { saveToStorage('iqc_records', iqcRecords); }, [iqcRecords]);
  useEffect(() => { saveToStorage('ipqc_records', ipqcRecords); }, [ipqcRecords]);
  useEffect(() => { saveToStorage('oqc_records', oqcRecords); }, [oqcRecords]);
  useEffect(() => { saveToStorage('customer_complaints', customerComplaints); }, [customerComplaints]);
  useEffect(() => { saveToStorage('defect_items', defectItems); }, [defectItems]);
  useEffect(() => { saveToStorage('capa_records', capaRecords); }, [capaRecords]);
  useEffect(() => { saveToStorage('kpi_targets', kpiTargets); }, [kpiTargets]);
  useEffect(() => { saveToStorage('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { saveToStorage('products', products); }, [products]);
  useEffect(() => { saveToStorage('active_role', activeRole); }, [activeRole]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Helper filter function checking sample mode
  const matchDataMode = (isSample: boolean) => {
    if (filters.dataMode === 'sample') return isSample;
    if (filters.dataMode === 'real') return !isSample;
    return true; // 'all'
  };

  // Filtering IQC
  const filteredIQC = iqcRecords.filter(r => {
    if (!matchDataMode(r.isSample)) return false;
    if (filters.supplier && r.supplierId !== filters.supplier && r.supplierName !== filters.supplier) return false;
    if (filters.severity && r.severity !== filters.severity) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = r.recordCode.toLowerCase().includes(kw) ||
                    r.supplierName.toLowerCase().includes(kw) ||
                    r.componentName.toLowerCase().includes(kw) ||
                    r.componentCode.toLowerCase().includes(kw) ||
                    r.lotNumber.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  // Filtering IPQC
  const filteredIPQC = ipqcRecords.filter(r => {
    if (!matchDataMode(r.isSample)) return false;
    if (filters.line && r.lineId !== filters.line) return false;
    if (filters.process && r.processId !== filters.process && r.processName !== filters.process) return false;
    if (filters.productCode && r.productCode !== filters.productCode) return false;
    if (filters.severity && r.severity !== filters.severity) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = r.recordCode.toLowerCase().includes(kw) ||
                    r.productName.toLowerCase().includes(kw) ||
                    r.productCode.toLowerCase().includes(kw) ||
                    r.processName.toLowerCase().includes(kw) ||
                    r.productionLotNumber.toLowerCase().includes(kw) ||
                    (r.defectType && r.defectType.toLowerCase().includes(kw));
      if (!match) return false;
    }
    return true;
  });

  // Filtering OQC
  const filteredOQC = oqcRecords.filter(r => {
    if (!matchDataMode(r.isSample)) return false;
    if (filters.productCode && r.productCode !== filters.productCode) return false;
    if (filters.customer && r.intendedCustomer !== filters.customer) return false;
    if (filters.status && (r.result !== filters.status && r.shippingDecision !== filters.status)) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = r.recordCode.toLowerCase().includes(kw) ||
                    r.productName.toLowerCase().includes(kw) ||
                    r.productCode.toLowerCase().includes(kw) ||
                    r.finishedLotNumber.toLowerCase().includes(kw) ||
                    r.intendedCustomer.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  // Filtering Customer Complaints
  const filteredComplaints = customerComplaints.filter(r => {
    if (!matchDataMode(r.isSample)) return false;
    if (filters.productCode && r.productCode !== filters.productCode) return false;
    if (filters.customer && r.customerName !== filters.customer) return false;
    if (filters.severity && r.severity !== filters.severity) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = r.complaintCode.toLowerCase().includes(kw) ||
                    r.customerName.toLowerCase().includes(kw) ||
                    r.productName.toLowerCase().includes(kw) ||
                    r.problemDescription.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  // Filtering Defect Items
  const filteredDefects = defectItems.filter(r => {
    if (!matchDataMode(r.isSample)) return false;
    if (filters.severity && r.severity !== filters.severity) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = r.defectCode.toLowerCase().includes(kw) ||
                    r.defectName.toLowerCase().includes(kw) ||
                    r.defectCategory.toLowerCase().includes(kw) ||
                    r.description.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  // Filtering CAPA
  const filteredCAPA = capaRecords.filter(r => {
    if (!matchDataMode(r.isSample)) return false;
    if (filters.severity && r.severity !== filters.severity) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const match = r.capaCode.toLowerCase().includes(kw) ||
                    r.problemDescription.toLowerCase().includes(kw) ||
                    r.assignedPerson.toLowerCase().includes(kw) ||
                    r.source.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  // Current user label based on role
  const getCurrentUserLabel = () => {
    switch (activeRole) {
      case 'ADMIN': return 'Quản trị viên hệ thống (Admin)';
      case 'DIRECTOR': return 'Ban Giám Đốc (BOD)';
      case 'QA_QC_MANAGER': return 'Trưởng phòng QA/QC';
      case 'INSPECTOR': return 'Kỹ thuật viên kiểm tra (QC)';
      case 'PRODUCTION_ENGINEER': return 'Kỹ sư sản xuất (PE/SMT)';
      default: return 'Người xem (Viewer)';
    }
  };

  const getNowString = () => new Date().toISOString().replace('T', ' ').substring(0, 16);

  // IQC CRUD
  const addIQCRecord = (rec: Omit<IQCRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    if (rec.defectQuantity > rec.inspectedQuantity) {
      return { success: false, message: 'Số lượng lỗi không được vượt quá số lượng kiểm tra!' };
    }
    if (rec.inspectedQuantity <= 0) {
      return { success: false, message: 'Số lượng kiểm tra phải lớn hơn 0!' };
    }
    const newRecord: IQCRecord = {
      ...rec,
      id: 'IQC-' + Date.now(),
      createdAt: getNowString(),
      updatedAt: getNowString(),
      createdBy: getCurrentUserLabel(),
      updatedBy: getCurrentUserLabel(),
    };
    setIqcRecords(prev => [newRecord, ...prev]);

    // Check critical or recurring defect to prompt auto-CAPA
    const isCritical = rec.severity === 'CRITICAL';
    const isRecurring = rec.result === 'FAIL' && iqcRecords.some(r => r.supplierId === rec.supplierId && r.result === 'FAIL');
    if (isCritical || isRecurring) {
      triggerAutoCAPAPrompt({
        source: 'IQC',
        relatedReferenceCode: rec.recordCode,
        problemDescription: `Sự cố chất lượng đầu vào linh kiện ${rec.componentName} (${rec.componentCode}) từ NCC ${rec.supplierName}: ${rec.defectType || 'Lô hàng không đạt tiêu chuẩn nghiệm thu AQL'}. Mã lô: ${rec.lotNumber}.`,
        severity: rec.severity,
        suggestedPersonnel: 'Lê Văn Cường (Kỹ sư Quản lý NCC - SQE)',
        department: 'Bộ phận Quản lý chất lượng NCC (SQE)',
        containmentAction: `Cách ly toàn bộ lô hàng ${rec.lotNumber} tại kho biệt trữ IQC, dán tem ĐỎ HOLD và yêu cầu nhà cung cấp ${rec.supplierName} ban hành báo cáo 8D trong 48h.`,
        triggerReason: isRecurring ? `Phát hiện lỗi lặp lại từ nhà cung cấp ${rec.supplierName}` : `Phát hiện lỗi linh kiện mức độ Nghiêm trọng (Critical)`,
        isSample: rec.isSample
      });
    }

    return { success: true };
  };

  const updateIQCRecord = (id: string, updates: Partial<IQCRecord>) => {
    setIqcRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: getNowString(), updatedBy: getCurrentUserLabel() } : r));
  };

  const deleteIQCRecord = (id: string) => {
    setIqcRecords(prev => prev.filter(r => r.id !== id));
  };

  // IPQC CRUD
  const addIPQCRecord = (rec: Omit<IPQCRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    if (rec.defectQuantity > rec.inspectedQuantity) {
      return { success: false, message: 'Số lượng lỗi không được vượt quá số lượng kiểm tra!' };
    }
    if (rec.inspectedQuantity <= 0) {
      return { success: false, message: 'Số lượng kiểm tra phải lớn hơn 0!' };
    }
    const newRecord: IPQCRecord = {
      ...rec,
      id: 'IPQC-' + Date.now(),
      createdAt: getNowString(),
      updatedAt: getNowString(),
      createdBy: getCurrentUserLabel(),
      updatedBy: getCurrentUserLabel(),
    };
    setIpqcRecords(prev => [newRecord, ...prev]);

    // Check critical or recurring defect to prompt auto-CAPA
    const isCritical = rec.severity === 'CRITICAL';
    const isRecurring = !!rec.defectType && ipqcRecords.some(r => r.lineId === rec.lineId && r.defectType === rec.defectType);
    if (isCritical || isRecurring) {
      triggerAutoCAPAPrompt({
        source: 'IPQC',
        relatedReferenceCode: rec.recordCode,
        problemDescription: `Sự cố công đoạn ${rec.processName} - Dây chuyền ${rec.lineId} (Model ${rec.productCode}): ${rec.defectType || 'Lỗi quy trình sản xuất'}. Lô SX: ${rec.productionLotNumber}.`,
        severity: rec.severity,
        suggestedPersonnel: 'Nguyễn Tuấn Tú (Kỹ sư trưởng SMT/Process Leader)',
        department: 'Khối Kỹ thuật Quy trình SMT & Sản xuất',
        containmentAction: `Tạm dừng dây chuyền ${rec.lineId}, kiểm tra 100% bo mạch đã qua công đoạn ${rec.processName} trong 2 giờ gần nhất, hiệu chuẩn lại áp lực dao gạt/nhiệt độ.`,
        triggerReason: isRecurring ? `Phát hiện lỗi tái diễn "${rec.defectType}" trên dây chuyền ${rec.lineId}` : `Phát hiện lỗi công đoạn mức độ Nghiêm trọng (Critical)`,
        isSample: rec.isSample
      });
    }

    return { success: true };
  };

  const updateIPQCRecord = (id: string, updates: Partial<IPQCRecord>) => {
    setIpqcRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: getNowString(), updatedBy: getCurrentUserLabel() } : r));
  };

  const deleteIPQCRecord = (id: string) => {
    setIpqcRecords(prev => prev.filter(r => r.id !== id));
  };

  // OQC CRUD
  const addOQCRecord = (rec: Omit<OQCRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    if (rec.defectQuantity > rec.inspectedQuantity) {
      return { success: false, message: 'Số lượng lỗi không được lớn hơn số lượng kiểm tra!' };
    }
    if (rec.inspectedQuantity <= 0) {
      return { success: false, message: 'Số lượng kiểm tra phải lớn hơn 0!' };
    }
    const newRecord: OQCRecord = {
      ...rec,
      id: 'OQC-' + Date.now(),
      createdAt: getNowString(),
      updatedAt: getNowString(),
      createdBy: getCurrentUserLabel(),
      updatedBy: getCurrentUserLabel(),
    };
    setOqcRecords(prev => [newRecord, ...prev]);

    // Check critical or recurring defect to prompt auto-CAPA
    const isCritical = rec.shippingDecision === 'HOLD' || rec.result === 'FAIL';
    const isRecurring = rec.defectQuantity > 0 && oqcRecords.some(r => r.productCode === rec.productCode && r.defectQuantity > 0);
    if (isCritical || isRecurring) {
      triggerAutoCAPAPrompt({
        source: 'OQC',
        relatedReferenceCode: rec.recordCode,
        problemDescription: `Sự cố nghiệm thu xuất xưởng thành phẩm ${rec.productName} (${rec.productCode}) - Khách hàng: ${rec.intendedCustomer}: ${rec.defectType || 'Lô thành phẩm không đạt tiêu chuẩn xuất hàng'}. Lô TP: ${rec.finishedLotNumber}.`,
        severity: rec.defectQuantity > 2 ? 'CRITICAL' : 'MAJOR',
        suggestedPersonnel: 'Đặng Quốc Huy (Trưởng nhóm nghiệm thu OQC / QA Lead)',
        department: 'Bộ phận Đảm bảo chất lượng xuất xưởng (OQC/QA)',
        containmentAction: `Niêm phong cách ly toàn bộ lô thành phẩm ${rec.finishedLotNumber} tại khu vực OQC HOLD, tạm dừng cấp tem xuất kho và thông báo ban giám đốc.`,
        triggerReason: isRecurring ? `Phát hiện lỗi xuất xưởng lặp lại trên model ${rec.productCode}` : `Lô thành phẩm bị tạm giữ xuất hàng (OQC HOLD / FAIL)`,
        isSample: rec.isSample
      });
    }

    return { success: true };
  };

  const updateOQCRecord = (id: string, updates: Partial<OQCRecord>) => {
    setOqcRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: getNowString(), updatedBy: getCurrentUserLabel() } : r));
  };

  const deleteOQCRecord = (id: string) => {
    setOqcRecords(prev => prev.filter(r => r.id !== id));
  };

  // Complaints CRUD
  const addComplaint = (rec: Omit<CustomerComplaintRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    if (rec.affectedQuantity > rec.deliveredQuantity) {
      return { success: false, message: 'Số lượng bị ảnh hưởng không thể vượt quá số lượng giao!' };
    }
    const newRecord: CustomerComplaintRecord = {
      ...rec,
      id: 'CC-' + Date.now(),
      createdAt: getNowString(),
      updatedAt: getNowString(),
      createdBy: getCurrentUserLabel(),
      updatedBy: getCurrentUserLabel(),
    };
    setCustomerComplaints(prev => [newRecord, ...prev]);

    // Check critical or recurring defect to prompt auto-CAPA
    const isCritical = rec.severity === 'CRITICAL';
    const isRecurring = customerComplaints.some(c => c.customerName === rec.customerName && c.productCode === rec.productCode);
    if (isCritical || isRecurring) {
      triggerAutoCAPAPrompt({
        source: 'Khiếu nại khách hàng',
        relatedReferenceCode: rec.complaintCode,
        problemDescription: `Khiếu nại khách hàng ${rec.customerName} cho sản phẩm ${rec.productName} (${rec.productCode}): ${rec.problemDescription}. Số lượng ảnh hưởng: ${rec.affectedQuantity} chiếc.`,
        severity: rec.severity,
        suggestedPersonnel: 'Trần Văn Hòa (Kỹ sư Đảm bảo chất lượng khách hàng - CQE)',
        department: 'Bộ phận QA Khách hàng & Kỹ thuật ứng dụng (CQE)',
        containmentAction: `1. Gửi lô sản phẩm thay thế đã qua kiểm tra nhiệt sàng lọc 72h cho khách hàng trong 24h.\n2. Kiểm tra kho thành phẩm và rà soát lịch sử lệnh sản xuất ${rec.orderNumber}.`,
        triggerReason: isRecurring ? `Khách hàng ${rec.customerName} khiếu nại lặp lại trên cùng sản phẩm ${rec.productCode}` : `Khiếu nại khách hàng mức độ Nghiêm trọng (Critical)`,
        isSample: rec.isSample
      });
    }

    return { success: true };
  };

  const updateComplaint = (id: string, updates: Partial<CustomerComplaintRecord>) => {
    setCustomerComplaints(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: getNowString(), updatedBy: getCurrentUserLabel() } : r));
  };

  const deleteComplaint = (id: string) => {
    setCustomerComplaints(prev => prev.filter(r => r.id !== id));
  };

  // Defect Items CRUD
  const addDefectItem = (rec: Omit<DefectItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    const newRecord: DefectItem = {
      ...rec,
      id: 'DEF-' + Date.now(),
      createdAt: getNowString(),
      updatedAt: getNowString(),
      createdBy: getCurrentUserLabel(),
      updatedBy: getCurrentUserLabel(),
    };
    setDefectItems(prev => [newRecord, ...prev]);
    return { success: true };
  };

  const updateDefectItem = (id: string, updates: Partial<DefectItem>) => {
    setDefectItems(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: getNowString(), updatedBy: getCurrentUserLabel() } : r));
  };

  const deleteDefectItem = (id: string) => {
    setDefectItems(prev => prev.filter(r => r.id !== id));
  };

  // CAPA CRUD
  const addCAPARecord = (rec: Omit<CAPARecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'historyLogs'>) => {
    const now = getNowString();
    const newRecord: CAPARecord = {
      ...rec,
      id: 'CAPA-' + Date.now(),
      historyLogs: [
        {
          timestamp: now,
          actor: getCurrentUserLabel(),
          action: 'Khởi tạo hồ sơ CAPA mới',
          note: rec.problemDescription
        }
      ],
      createdAt: now,
      updatedAt: now,
      createdBy: getCurrentUserLabel(),
      updatedBy: getCurrentUserLabel(),
    };
    setCapaRecords(prev => [newRecord, ...prev]);
    return { success: true };
  };

  const updateCAPARecord = (id: string, updates: Partial<CAPARecord>) => {
    setCapaRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const historyLogs = [...r.historyLogs];
      if (updates.status && updates.status !== r.status) {
        historyLogs.push({
          timestamp: getNowString(),
          actor: getCurrentUserLabel(),
          action: `Chuyển trạng thái sang: ${updates.status}`,
          note: updates.effectivenessVerificationResult ? `Kết quả thẩm tra: ${updates.effectivenessVerificationResult}` : undefined
        });
      }
      return {
        ...r,
        ...updates,
        historyLogs,
        updatedAt: getNowString(),
        updatedBy: getCurrentUserLabel(),
      };
    }));
  };

  const deleteCAPARecord = (id: string) => {
    setCapaRecords(prev => prev.filter(r => r.id !== id));
  };

  // Targets & Masters
  const updateKPITarget = (id: string, updates: Partial<KPITargetItem>) => {
    setKpiTargets(prev => prev.map(t => t.id === id ? {
      ...t,
      ...updates,
      lastUpdated: new Date().toISOString().substring(0, 10),
      updatedBy: getCurrentUserLabel()
    } : t));
  };

  const addSupplier = (sup: SupplierItem) => {
    setSuppliers(prev => [...prev, sup]);
  };

  const updateSupplier = (id: string, updates: Partial<SupplierItem>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addProduct = (prod: ProductItem) => {
    setProducts(prev => [...prev, prod]);
  };

  const updateProduct = (code: string, updates: Partial<ProductItem>) => {
    setProducts(prev => prev.map(p => p.code === code ? { ...p, ...updates } : p));
  };

  // Data management functions
  const resetToDemoData = () => {
    setIqcRecords(INITIAL_IQC_RECORDS);
    setIpqcRecords(INITIAL_IPQC_RECORDS);
    setOqcRecords(INITIAL_OQC_RECORDS);
    setCustomerComplaints(INITIAL_CUSTOMER_COMPLAINTS);
    setDefectItems(INITIAL_DEFECT_ITEMS);
    setCapaRecords(INITIAL_CAPA_RECORDS);
    setKpiTargets(INITIAL_KPI_TARGETS);
    setSuppliers(INITIAL_SUPPLIERS);
    setProducts(INITIAL_PRODUCTS);
  };

  const clearSampleData = () => {
    setIqcRecords(prev => prev.filter(r => !r.isSample));
    setIpqcRecords(prev => prev.filter(r => !r.isSample));
    setOqcRecords(prev => prev.filter(r => !r.isSample));
    setCustomerComplaints(prev => prev.filter(r => !r.isSample));
    setDefectItems(prev => prev.filter(r => !r.isSample));
    setCapaRecords(prev => prev.filter(r => !r.isSample));
  };

  const clearAllData = () => {
    setIqcRecords([]);
    setIpqcRecords([]);
    setOqcRecords([]);
    setCustomerComplaints([]);
    setDefectItems([]);
    setCapaRecords([]);
  };

  const exportBackupJSON = () => {
    const backup = {
      appName: 'LOL Quality Control Center',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: getCurrentUserLabel(),
      data: {
        iqcRecords,
        ipqcRecords,
        oqcRecords,
        customerComplaints,
        defectItems,
        capaRecords,
        kpiTargets,
        suppliers,
        products,
        components,
        processes,
      }
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOL_QUALITY_BACKUP_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data || !parsed.data.iqcRecords) {
        return { success: false, message: 'Tệp sao lưu không đúng định dạng chuẩn của hệ thống LOL Quality Control Center!' };
      }
      setIqcRecords(parsed.data.iqcRecords || []);
      setIpqcRecords(parsed.data.ipqcRecords || []);
      setOqcRecords(parsed.data.oqcRecords || []);
      setCustomerComplaints(parsed.data.customerComplaints || []);
      setDefectItems(parsed.data.defectItems || []);
      setCapaRecords(parsed.data.capaRecords || []);
      if (parsed.data.kpiTargets) setKpiTargets(parsed.data.kpiTargets);
      if (parsed.data.suppliers) setSuppliers(parsed.data.suppliers);
      if (parsed.data.products) setProducts(parsed.data.products);
      return { success: true, message: 'Phục hồi dữ liệu từ bản sao lưu thành công!' };
    } catch (err: any) {
      return { success: false, message: `Lỗi đọc tệp sao lưu: ${err.message || 'Dữ liệu không hợp lệ'}` };
    }
  };

  const exportModuleToCSV = (moduleName: string) => {
    let rows: any[] = [];
    let filename = `LOL_QUALITY_${moduleName}_${new Date().toISOString().substring(0, 10)}.csv`;

    if (moduleName === 'IQC') {
      rows = filteredIQC.map(r => ({
        'Mã bản ghi': r.recordCode,
        'Ngày nhận': r.receiptDate,
        'Nhà cung cấp': r.supplierName,
        'Mã linh kiện': r.componentCode,
        'Tên linh kiện': r.componentName,
        'Mã lô': r.lotNumber,
        'Số nhận': r.receivedQuantity,
        'Số kiểm tra': r.inspectedQuantity,
        'Số đạt': r.passedQuantity,
        'Số lỗi': r.defectQuantity,
        'Tỷ lệ lỗi (%)': r.inspectedQuantity > 0 ? ((r.defectQuantity / r.inspectedQuantity) * 100).toFixed(2) + '%' : 'N/A',
        'Loại lỗi': r.defectType || '',
        'Mức độ': r.severity,
        'Kết quả': r.result,
        'Quyết định': r.decision,
        'Người kiểm tra': r.inspector,
        'Dữ liệu': r.isSample ? 'Minh họa' : 'Thực tế'
      }));
    } else if (moduleName === 'IPQC') {
      rows = filteredIPQC.map(r => ({
        'Mã bản ghi': r.recordCode,
        'Thời gian': r.inspectionTime,
        'Dây chuyền': r.lineId,
        'Công đoạn': r.processName,
        'Ca': r.shift,
        'Mã sản phẩm': r.productCode,
        'Tên sản phẩm': r.productName,
        'Lô sản xuất': r.productionLotNumber,
        'Số kiểm tra': r.inspectedQuantity,
        'Số đạt': r.passedQuantity,
        'Số lỗi': r.defectQuantity,
        'Tỷ lệ lỗi (%)': r.inspectedQuantity > 0 ? ((r.defectQuantity / r.inspectedQuantity) * 100).toFixed(2) + '%' : 'N/A',
        'Loại lỗi': r.defectType || '',
        'Mức độ': r.severity,
        'Người kiểm tra': r.inspector,
        'Trạng thái': r.status,
        'Dữ liệu': r.isSample ? 'Minh họa' : 'Thực tế'
      }));
    } else if (moduleName === 'OQC') {
      rows = filteredOQC.map(r => ({
        'Mã bản ghi': r.recordCode,
        'Ngày kiểm tra': r.inspectionDate,
        'Mã sản phẩm': r.productCode,
        'Tên sản phẩm': r.productName,
        'Lô thành phẩm': r.finishedLotNumber,
        'Khách hàng': r.intendedCustomer,
        'Số thành phẩm': r.finishedQuantity,
        'Số kiểm tra': r.inspectedQuantity,
        'Số đạt': r.passedQuantity,
        'Số lỗi': r.defectQuantity,
        'Tỷ lệ đạt (%)': r.inspectedQuantity > 0 ? ((r.passedQuantity / r.inspectedQuantity) * 100).toFixed(2) + '%' : 'N/A',
        'Quyết định': r.shippingDecision,
        'Cách ly': r.isQuarantined ? 'Đang cách ly' : 'Không',
        'Người kiểm tra': r.inspector,
        'Người duyệt': r.approver || '',
        'Dữ liệu': r.isSample ? 'Minh họa' : 'Thực tế'
      }));
    } else if (moduleName === 'CUSTOMER') {
      rows = filteredComplaints.map(r => ({
        'Mã khiếu nại': r.complaintCode,
        'Ngày phản ánh': r.reportedDate,
        'Khách hàng': r.customerName,
        'Mã sản phẩm': r.productCode,
        'Số lượng giao': r.deliveredQuantity,
        'Số bị ảnh hưởng': r.affectedQuantity,
        'Mức độ': r.severity,
        'Mô tả': r.problemDescription,
        'Người phụ trách': r.assignedPerson,
        'Hạn xử lý': r.targetDate,
        'Trạng thái': r.status,
        'Hiệu lực': r.effectivenessVerificationResult || '',
        'Dữ liệu': r.isSample ? 'Minh họa' : 'Thực tế'
      }));
    } else if (moduleName === 'CAPA') {
      rows = filteredCAPA.map(r => ({
        'Mã CAPA': r.capaCode,
        'Nguồn': r.source,
        'Mã liên quan': r.relatedReferenceCode || '',
        'Mô tả vấn đề': r.problemDescription,
        'Mức độ': r.severity,
        'Người phụ trách': r.assignedPerson,
        'Ngày mở': r.openDate,
        'Hạn hoàn thành': r.targetDate,
        'Trạng thái': r.status,
        'Nguyên nhân gốc': r.rootCauseConfirmed || '',
        'Hiệu lực': r.effectivenessVerificationResult || '',
        'Dữ liệu': r.isSample ? 'Minh họa' : 'Thực tế'
      }));
    } else if (moduleName === 'DEFECTS') {
      rows = filteredDefects.map(r => ({
        'Mã lỗi': r.defectCode,
        'Tên lỗi': r.defectName,
        'Nhóm lỗi': r.defectCategory,
        'Công đoạn phát hiện': r.detectedProcess,
        'Mức độ': r.severity,
        'Mô tả': r.description,
        'Trạng thái': r.status,
        'Người phụ trách': r.assignedPerson || '',
        'Dữ liệu': r.isSample ? 'Minh họa' : 'Thực tế'
      }));
    }

    if (rows.length === 0) {
      alert('Không có dữ liệu để xuất CSV theo bộ lọc hiện tại!');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => headers.map(fieldName => `"${String(row[fieldName] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getUnlinkedCriticalAndRecurringIssues = () => {
    const list: {
      id: string;
      source: 'IQC' | 'IPQC' | 'OQC' | 'Khiếu nại khách hàng';
      code: string;
      description: string;
      severity: string;
      reason: string;
      promptData: AutoCAPAPromptData;
    }[] = [];

    const existingCAPARefs = new Set(capaRecords.map(c => c.relatedReferenceCode).filter(Boolean));

    // 1. IQC critical or recurring (failed lots from same supplier)
    iqcRecords.forEach(r => {
      if (existingCAPARefs.has(r.recordCode)) return;
      const isCritical = r.severity === 'CRITICAL';
      const isRecurring = r.result === 'FAIL' && iqcRecords.filter(other => other.supplierId === r.supplierId && other.result === 'FAIL').length > 1;
      if (isCritical || isRecurring) {
        list.push({
          id: r.id,
          source: 'IQC',
          code: r.recordCode,
          description: `${r.componentName} (${r.supplierName}): ${r.defectType || 'Lô kiểm tra không đạt AQL'}`,
          severity: r.severity,
          reason: isCritical ? 'Lỗi linh kiện Nghiêm trọng (Critical)' : 'Nhà cung cấp có lỗi lặp lại',
          promptData: {
            source: 'IQC',
            relatedReferenceCode: r.recordCode,
            problemDescription: `Sự cố chất lượng đầu vào linh kiện ${r.componentName} (${r.componentCode}) từ NCC ${r.supplierName}: ${r.defectType || 'Lô hàng không đạt tiêu chuẩn'}. Mã lô: ${r.lotNumber}.`,
            severity: r.severity,
            suggestedPersonnel: 'Lê Văn Cường (Kỹ sư Quản lý NCC - SQE)',
            department: 'Bộ phận Quản lý chất lượng NCC (SQE)',
            containmentAction: `Cách ly toàn bộ lô hàng ${r.lotNumber} tại kho biệt trữ IQC, dán tem ĐỎ HOLD và yêu cầu ${r.supplierName} ban hành báo cáo 8D trong 48h.`,
            triggerReason: isCritical ? 'Lỗi linh kiện Nghiêm trọng (Critical)' : 'Nhà cung cấp có lỗi lặp lại',
            isSample: r.isSample
          }
        });
      }
    });

    // 2. IPQC critical or recurring
    ipqcRecords.forEach(r => {
      if (existingCAPARefs.has(r.recordCode)) return;
      const isCritical = r.severity === 'CRITICAL';
      const isRecurring = !!r.defectType && ipqcRecords.filter(other => other.lineId === r.lineId && other.defectType === r.defectType).length > 1;
      if (isCritical || isRecurring) {
        list.push({
          id: r.id,
          source: 'IPQC',
          code: r.recordCode,
          description: `Chuyền ${r.lineId} - ${r.processName} (${r.productCode}): ${r.defectType || 'Lỗi công đoạn'}`,
          severity: r.severity,
          reason: isCritical ? 'Lỗi công đoạn Nghiêm trọng (Critical)' : 'Lỗi tái diễn nhiều lần trên cùng dây chuyền',
          promptData: {
            source: 'IPQC',
            relatedReferenceCode: r.recordCode,
            problemDescription: `Sự cố công đoạn ${r.processName} - Dây chuyền ${r.lineId} (Model ${r.productCode}): ${r.defectType || 'Lỗi quy trình'}. Lô SX: ${r.productionLotNumber}.`,
            severity: r.severity,
            suggestedPersonnel: 'Nguyễn Tuấn Tú (Kỹ sư trưởng SMT/Process Leader)',
            department: 'Khối Kỹ thuật Quy trình SMT & Sản xuất',
            containmentAction: `Tạm dừng dây chuyền ${r.lineId}, kiểm tra 100% bo mạch đã qua công đoạn ${r.processName} trong 2 giờ gần nhất, kiểm tra thiết bị.`,
            triggerReason: isCritical ? 'Lỗi công đoạn Nghiêm trọng (Critical)' : 'Lỗi tái diễn trên dây chuyền',
            isSample: r.isSample
          }
        });
      }
    });

    // 3. OQC Hold
    oqcRecords.forEach(r => {
      if (existingCAPARefs.has(r.recordCode)) return;
      if (r.shippingDecision === 'HOLD' || r.result === 'FAIL' || r.isQuarantined) {
        list.push({
          id: r.id,
          source: 'OQC',
          code: r.recordCode,
          description: `${r.productName} (${r.productCode}) - Khách hàng: ${r.intendedCustomer}`,
          severity: 'CRITICAL',
          reason: 'Lô thành phẩm bị tạm giữ xuất hàng (OQC HOLD / FAIL)',
          promptData: {
            source: 'OQC',
            relatedReferenceCode: r.recordCode,
            problemDescription: `Sự cố nghiệm thu xuất xưởng thành phẩm ${r.productName} (${r.productCode}) - Khách hàng: ${r.intendedCustomer}: ${r.defectType || 'Lô thành phẩm không đạt'}. Lô TP: ${r.finishedLotNumber}.`,
            severity: 'CRITICAL',
            suggestedPersonnel: 'Đặng Quốc Huy (Trưởng nhóm nghiệm thu OQC / QA Lead)',
            department: 'Bộ phận Đảm bảo chất lượng xuất xưởng (OQC/QA)',
            containmentAction: `Niêm phong cách ly toàn bộ lô thành phẩm ${r.finishedLotNumber} tại khu vực OQC HOLD, tạm dừng xuất kho và thông báo ban giám đốc.`,
            triggerReason: 'Lô thành phẩm bị tạm giữ xuất hàng (OQC HOLD)',
            isSample: r.isSample
          }
        });
      }
    });

    // 4. Customer complaints
    customerComplaints.forEach(r => {
      if (existingCAPARefs.has(r.complaintCode)) return;
      if (r.severity === 'CRITICAL' || r.status !== 'VERIFIED_CLOSED') {
        list.push({
          id: r.id,
          source: 'Khiếu nại khách hàng',
          code: r.complaintCode,
          description: `${r.customerName} - ${r.productName}: ${r.problemDescription}`,
          severity: r.severity,
          reason: r.severity === 'CRITICAL' ? 'Khiếu nại mức độ Nghiêm trọng (Critical)' : 'Khiếu nại khách hàng đang mở',
          promptData: {
            source: 'Khiếu nại khách hàng',
            relatedReferenceCode: r.complaintCode,
            problemDescription: `Khiếu nại khách hàng ${r.customerName} cho sản phẩm ${r.productName} (${r.productCode}): ${r.problemDescription}. Số lượng ảnh hưởng: ${r.affectedQuantity} chiếc.`,
            severity: r.severity,
            suggestedPersonnel: 'Trần Văn Hòa (Kỹ sư Đảm bảo chất lượng khách hàng - CQE)',
            department: 'Bộ phận QA Khách hàng & Kỹ thuật ứng dụng (CQE)',
            containmentAction: `1. Gửi lô sản phẩm thay thế đã qua kiểm tra nhiệt sàng lọc 72h cho khách hàng trong 24h.\n2. Kiểm tra kho thành phẩm và rà soát lịch sử lệnh sản xuất ${r.orderNumber}.`,
            triggerReason: r.severity === 'CRITICAL' ? 'Khiếu nại mức độ Nghiêm trọng (Critical)' : 'Khiếu nại khách hàng đang mở',
            isSample: r.isSample
          }
        });
      }
    });

    return list;
  };

  return (
    <QualityContext.Provider
      value={{
        iqcRecords,
        ipqcRecords,
        oqcRecords,
        customerComplaints,
        defectItems,
        capaRecords,
        kpiTargets,
        suppliers,
        products,
        components,
        processes,
        filters,
        setFilters,
        resetFilters,
        activeRole,
        setActiveRole,
        isPresentationMode,
        setIsPresentationMode,
        pendingAutoCAPA,
        triggerAutoCAPAPrompt,
        dismissAutoCAPAPrompt,
        getUnlinkedCriticalAndRecurringIssues,
        filteredIQC,
        filteredIPQC,
        filteredOQC,
        filteredComplaints,
        filteredDefects,
        filteredCAPA,
        addIQCRecord,
        updateIQCRecord,
        deleteIQCRecord,
        addIPQCRecord,
        updateIPQCRecord,
        deleteIPQCRecord,
        addOQCRecord,
        updateOQCRecord,
        deleteOQCRecord,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        addDefectItem,
        updateDefectItem,
        deleteDefectItem,
        addCAPARecord,
        updateCAPARecord,
        deleteCAPARecord,
        updateKPITarget,
        addSupplier,
        updateSupplier,
        addProduct,
        updateProduct,
        resetToDemoData,
        clearSampleData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,
        exportModuleToCSV,
      }}
    >
      {children}
    </QualityContext.Provider>
  );
};

export const useQuality = () => {
  const context = useContext(QualityContext);
  if (!context) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return context;
};
