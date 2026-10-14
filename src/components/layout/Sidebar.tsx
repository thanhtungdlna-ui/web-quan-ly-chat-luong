/**
 * @license
 * LOL Quality Control Center - Sidebar Navigation
 * 11 Phân hệ nghiệp vụ chất lượng điện tử.
 */

import React from 'react';
import { 
  LayoutDashboard, 
  PackageCheck, 
  Cpu, 
  Truck, 
  UserCheck, 
  AlertOctagon, 
  Repeat, 
  Building2, 
  LineChart, 
  FileSpreadsheet, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useQuality } from '../../context/QualityContext';

export type NavTabId =
  | 'overview'
  | 'iqc'
  | 'ipqc'
  | 'oqc'
  | 'customer'
  | 'defects'
  | 'capa'
  | 'suppliers'
  | 'analysis'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile
}) => {
  const { 
    filteredIQC, 
    filteredIPQC, 
    filteredOQC, 
    filteredComplaints, 
    filteredDefects, 
    filteredCAPA 
  } = useQuality();

  const openCAPACount = filteredCAPA.filter(c => c.status !== 'CLOSED').length;
  const openComplaintsCount = filteredComplaints.filter(c => c.status !== 'VERIFIED_CLOSED').length;
  const criticalDefectsCount = filteredDefects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length;

  const navItems = [
    {
      id: 'overview' as NavTabId,
      name: '1. Tổng quan chất lượng',
      shortName: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'iqc' as NavTabId,
      name: '2. Chất lượng đầu vào – IQC',
      shortName: 'IQC Đầu vào',
      icon: PackageCheck,
      badge: filteredIQC.length,
      badgeColor: 'text-slate-600 bg-slate-100',
    },
    {
      id: 'ipqc' as NavTabId,
      name: '3. Chất lượng công đoạn – IPQC',
      shortName: 'IPQC Công đoạn',
      icon: Cpu,
      badge: filteredIPQC.length,
      badgeColor: 'text-slate-600 bg-slate-100',
    },
    {
      id: 'oqc' as NavTabId,
      name: '4. Chất lượng đầu ra – OQC/FQC',
      shortName: 'OQC Đầu ra',
      icon: Truck,
      badge: filteredOQC.length,
      badgeColor: 'text-slate-600 bg-slate-100',
    },
    {
      id: 'customer' as NavTabId,
      name: '5. Chất lượng khách hàng',
      shortName: 'Khách hàng',
      icon: UserCheck,
      badge: openComplaintsCount > 0 ? `${openComplaintsCount} mở` : null,
      badgeColor: openComplaintsCount > 0 ? 'text-amber-700 bg-amber-50' : '',
    },
    {
      id: 'defects' as NavTabId,
      name: '6. Quản lý lỗi – Defect',
      shortName: 'Quản lý lỗi',
      icon: AlertOctagon,
      badge: criticalDefectsCount > 0 ? `${criticalDefectsCount} critical` : null,
      badgeColor: criticalDefectsCount > 0 ? 'text-rose-700 bg-rose-50' : '',
    },
    {
      id: 'capa' as NavTabId,
      name: '7. CAPA – Khắc phục & phòng ngừa',
      shortName: 'CAPA',
      icon: Repeat,
      badge: openCAPACount > 0 ? `${openCAPACount} xử lý` : null,
      badgeColor: openCAPACount > 0 ? 'text-blue-700 bg-blue-50' : '',
    },
    {
      id: 'suppliers' as NavTabId,
      name: '8. Nhà cung cấp – Supplier Quality',
      shortName: 'Nhà cung cấp',
      icon: Building2,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'analysis' as NavTabId,
      name: '9. Phân tích dữ liệu & SPC',
      shortName: 'Phân tích dữ liệu',
      icon: LineChart,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'reports' as NavTabId,
      name: '10. Báo cáo chất lượng',
      shortName: 'Báo cáo',
      icon: FileSpreadsheet,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'settings' as NavTabId,
      name: '11. Danh mục và thiết lập',
      shortName: 'Thiết lập',
      icon: Settings,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 tracking-wider">HỆ THỐNG QUẢN LÝ</div>
            <div className="text-[11px] text-slate-500">11 Phân hệ Giám sát</div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">v1.0-EMS</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-sky-50 text-sky-900 font-semibold border-l-4 border-sky-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-600" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700">Công ty TNHH Điện Tử LOL</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Tiêu chuẩn: ISO 9001 / IPC-A-610</p>
        </div>
      </aside>
    </>
  );
};
