/**
 * @license
 * LOL Quality Control Center - Quality Management Types
 */

export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type InspectionResult = 'PASS' | 'FAIL' | 'PENDING';

export type IQCDecision = 'ACCEPT' | 'QUARANTINE' | 'REJECT_RETURN' | 'CONCESSION_PENDING';

export type OQCDecision = 'RELEASE' | 'HOLD' | 'REWORK' | 'SCRAP' | 'PENDING_APPROVAL';

export type CAPAStatus = 
  | 'OPEN_PENDING_REVIEW'
  | 'OPEN' 
  | 'UNDER_INVESTIGATION' 
  | 'CONTAINMENT' 
  | 'PLAN_APPROVED' 
  | 'IMPLEMENTING' 
  | 'VERIFICATION_PENDING' 
  | 'CLOSED' 
  | 'REOPENED';

export type CustomerComplaintStatus =
  | 'NEW'
  | 'ANALYZING'
  | 'CONTAINED'
  | 'CAPA_IN_PROGRESS'
  | 'CUSTOMER_FEEDBACK_WAITING'
  | 'VERIFIED_CLOSED';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type UserRole = 
  | 'ADMIN' 
  | 'DIRECTOR' 
  | 'QA_QC_MANAGER' 
  | 'INSPECTOR' 
  | 'PRODUCTION_ENGINEER' 
  | 'VIEWER';

export interface AuditInfo {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface IQCRecord extends AuditInfo {
  id: string;
  recordCode: string; // e.g. IQC-202610-001
  receiptDate: string; // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  componentCode: string;
  componentName: string;
  lotNumber: string;
  deliveryNoteNumber: string; // Số phiếu nhập / delivery code
  receivedQuantity: number;
  inspectedQuantity: number;
  passedQuantity: number;
  defectQuantity: number;
  defectType?: string;
  defectCode?: string;
  severity: SeverityLevel;
  result: InspectionResult;
  decision: IQCDecision;
  inspector: string;
  notes?: string;
  correctiveAction?: string;
  status: IssueStatus;
  isSample: boolean; // Phân biệt dữ liệu minh họa vs thực tế
}

export interface IPQCRecord extends AuditInfo {
  id: string;
  recordCode: string; // e.g. IPQC-202610-001
  inspectionTime: string; // YYYY-MM-DD HH:mm
  factory: string;
  workshop: string;
  lineId: string; // e.g. SMT-01
  processId: string; // e.g. SMT_REFLOW
  processName: string;
  shift: 'Ca 1 (06:00 - 14:00)' | 'Ca 2 (14:00 - 22:00)' | 'Ca 3 (22:00 - 06:00)';
  productCode: string;
  productName: string;
  workOrderNumber: string; // Lệnh SX
  productionLotNumber: string; // Lô SX
  producedQuantity: number;
  inspectedQuantity: number;
  passedQuantity: number;
  defectQuantity: number;
  defectType?: string;
  defectCode?: string;
  severity: SeverityLevel;
  equipmentId?: string;
  inspector: string;
  handler?: string;
  suspectedCause?: string;
  confirmedCause?: string;
  immediateAction?: string;
  status: IssueStatus;
  isSample: boolean;
}

export interface OQCRecord extends AuditInfo {
  id: string;
  recordCode: string; // e.g. OQC-202610-001
  inspectionDate: string; // YYYY-MM-DD
  productCode: string;
  productName: string;
  finishedLotNumber: string;
  workOrderNumber: string;
  intendedCustomer: string;
  finishedQuantity: number;
  inspectedQuantity: number;
  passedQuantity: number;
  defectQuantity: number;
  defectType?: string;
  defectCode?: string;
  result: InspectionResult;
  inspector: string;
  shippingDecision: OQCDecision;
  isQuarantined: boolean;
  approvalDate?: string;
  approver?: string;
  notes?: string;
  isSample: boolean;
}

export interface CustomerComplaintRecord extends AuditInfo {
  id: string;
  complaintCode: string; // e.g. CC-202610-001
  reportedDate: string; // YYYY-MM-DD
  customerName: string;
  productCode: string;
  productName: string;
  lotOrSerialNumber?: string;
  orderNumber: string;
  deliveredQuantity: number;
  affectedQuantity: number;
  defectType: string;
  severity: SeverityLevel;
  problemDescription: string;
  evidenceUrlOrRef?: string;
  assignedPerson: string;
  containmentAction?: string;
  rootCauseAnalysis?: string;
  correctiveAction?: string;
  targetDate: string;
  status: CustomerComplaintStatus;
  customerResponseDate?: string;
  closedDate?: string;
  effectivenessVerificationResult?: 'EFFECTIVE' | 'NOT_EFFECTIVE' | 'PENDING';
  linkedWorkOrderId?: string;
  linkedOQCId?: string;
  isSample: boolean;
}

export interface DefectItem extends AuditInfo {
  id: string;
  defectCode: string; // e.g. DEF-SMT-001
  defectName: string;
  defectCategory: 'Hàn & Thiếc' | 'Ngoại quan & Bề mặt' | 'Lắp ráp cơ khí' | 'Linh kiện & Vật liệu' | 'Chức năng điện tử' | 'Khác';
  detectedProcess: string;
  severity: SeverityLevel;
  description: string;
  suspectedCause?: string;
  confirmedCause?: string;
  interimControl?: string;
  correctiveAction?: string;
  assignedPerson?: string;
  detectedDate: string;
  dueDate?: string;
  status: IssueStatus;
  linkedCAPAId?: string;
  isSample: boolean;
}

export interface CAPARecord extends AuditInfo {
  id: string;
  capaCode: string; // e.g. CAPA-2026-001
  source: 'IQC' | 'IPQC' | 'OQC' | 'Khiếu nại khách hàng' | 'Đánh giá nội bộ';
  relatedReferenceCode?: string;
  problemDescription: string;
  severity: SeverityLevel;
  assignedPerson: string;
  department: string;
  openDate: string;
  targetDate: string;
  status: CAPAStatus;
  analysisMethod: '5-Why' | 'Ishikawa / Xương cá' | 'FTA (Fault Tree Analysis)' | 'FMEA' | 'Chưa xác định';
  rootCauseConfirmed?: string;
  containmentAction: string;
  correctiveAction: string;
  preventiveAction?: string;
  executor: string;
  completionEvidence?: string;
  effectivenessVerificationResult?: 'EFFECTIVE' | 'INEFFECTIVE' | 'PENDING';
  verifiedBy?: string;
  verificationDate?: string;
  closedDate?: string;
  reopenReason?: string;
  historyLogs: {
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }[];
  isSample: boolean;
}

export interface KPITargetItem {
  id: string;
  key: string;
  name: string;
  targetValue: number;
  unit: string;
  warningThreshold: number;
  dangerThreshold: number;
  comparisonType: 'LESS_THAN' | 'GREATER_THAN'; // LESS_THAN for defect rates, GREATER_THAN for pass rates
  validPeriod: string;
  formulaDescription: string;
  lastUpdated: string;
  updatedBy: string;
  isSample: boolean;
}

export interface SupplierItem {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  ratingGrade: 'A' | 'B' | 'C' | 'D';
  status: 'ACTIVE' | 'AUDIT_PENDING' | 'BLOCKED';
}

export interface ProductItem {
  code: string;
  name: string;
  family: string;
  customer: string;
  standard: string;
}

export interface ComponentItem {
  code: string;
  name: string;
  category: string;
  defaultSupplierCode: string;
}

export interface ProcessItem {
  id: string;
  name: string;
  stage: 'IQC' | 'SMT' | 'THT' | 'TEST' | 'ASSY' | 'PACK' | 'OQC';
  line: string;
}

export interface FilterState {
  datePreset: 'today' | '7days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom';
  startDate: string;
  endDate: string;
  factory: string;
  line: string;
  process: string;
  productCode: string;
  supplier: string;
  customer: string;
  severity: string;
  status: string;
  keyword: string;
  dataMode: 'all' | 'sample' | 'real'; // Toggle sample vs real data
}

export interface AutoCAPAPromptData {
  source: 'IQC' | 'IPQC' | 'OQC' | 'Khiếu nại khách hàng';
  relatedReferenceCode: string;
  problemDescription: string;
  severity: SeverityLevel;
  suggestedPersonnel: string;
  department: string;
  containmentAction: string;
  triggerReason: string;
  isSample: boolean;
}
