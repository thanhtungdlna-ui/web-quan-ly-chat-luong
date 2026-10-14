/**
 * @license
 * LOL Quality Control Center – Hệ Thống Giám Sát Chất Lượng Sản Phẩm Điện Tử
 * Công ty TNHH Điện Tử LOL
 */

import React, { useState } from 'react';
import { QualityProvider, useQuality } from './context/QualityContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { FilterToolbar } from './components/layout/FilterToolbar';
import { OverviewDashboard } from './components/modules/OverviewDashboard';
import { IQCModule } from './components/modules/IQCModule';
import { IPQCModule } from './components/modules/IPQCModule';
import { OQCModule } from './components/modules/OQCModule';
import { CustomerQualityModule } from './components/modules/CustomerQualityModule';
import { DefectManagementModule } from './components/modules/DefectManagementModule';
import { CAPAModule } from './components/modules/CAPAModule';
import { SupplierQualityModule } from './components/modules/SupplierQualityModule';
import { DataAnalysisModule } from './components/modules/DataAnalysisModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { FormulaGuideModal } from './components/modals/FormulaGuideModal';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { AutoCAPAPromptModal } from './components/modals/AutoCAPAPromptModal';
import { Menu, BookOpen, X, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    isPresentationMode, 
    pendingAutoCAPA, 
    dismissAutoCAPAPrompt,
    triggerAutoCAPAPrompt,
    getUnlinkedCriticalAndRecurringIssues
  } = useQuality();
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState<boolean>(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);
  const [capaSuccessToast, setCapaSuccessToast] = useState<{ message: string; capaCode: string } | null>(null);

  const unlinkedIssues = getUnlinkedCriticalAndRecurringIssues();

  const renderModuleContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewDashboard
            onNavigateTab={tab => setActiveTab(tab)}
            onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
          />
        );
      case 'iqc':
        return <IQCModule onOpenAddModal={() => setIsQuickAddModalOpen(true)} />;
      case 'ipqc':
        return <IPQCModule onOpenAddModal={() => setIsQuickAddModalOpen(true)} />;
      case 'oqc':
        return <OQCModule onOpenAddModal={() => setIsQuickAddModalOpen(true)} />;
      case 'customer':
        return (
          <CustomerQualityModule
            onOpenAddModal={() => setIsQuickAddModalOpen(true)}
            onNavigateToCAPA={() => setActiveTab('capa')}
          />
        );
      case 'defects':
        return (
          <DefectManagementModule
            onOpenAddModal={() => setIsQuickAddModalOpen(true)}
            onNavigateToCAPA={() => setActiveTab('capa')}
          />
        );
      case 'capa':
        return <CAPARecordWrapper onOpenAddModal={() => setIsQuickAddModalOpen(true)} />;
      case 'suppliers':
        return <SupplierQualityModule />;
      case 'analysis':
        return <DataAnalysisModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return (
          <OverviewDashboard
            onNavigateTab={tab => setActiveTab(tab)}
            onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${isPresentationMode ? 'presentation-mode' : ''}`}>
      {/* Top Bar */}
      <Header
        onOpenFormulaGuide={() => setIsFormulaModalOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        {!isPresentationMode && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={tab => setActiveTab(tab)}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Menu Toggle & Filter Bar */}
          {!isPresentationMode && (
            <div className="no-print">
              <div className="lg:hidden px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
                >
                  <Menu className="w-4 h-4" />
                  <span>Mục lục phân hệ</span>
                </button>
                <span className="font-semibold text-slate-800">
                  {activeTab.toUpperCase()}
                </span>
              </div>

              {/* Shared Global Multi-dimensional Filter Bar */}
              <FilterToolbar currentModule={activeTab} />
            </div>
          )}

          {/* Critical / Recurring Issues Alert Banner */}
          {!isPresentationMode && unlinkedIssues.length > 0 && (
            <div className="no-print mx-4 sm:mx-6 lg:mx-8 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-rose-900">
                    Phát hiện {unlinkedIssues.length} sự cố chất lượng nghiêm trọng / lặp lại chưa có hồ sơ CAPA:
                  </span>
                  <span className="text-rose-700 ml-1">
                    {unlinkedIssues[0].code} - {unlinkedIssues[0].description} ({unlinkedIssues[0].reason})
                  </span>
                </div>
              </div>
              <button
                onClick={() => triggerAutoCAPAPrompt(unlinkedIssues[0].promptData)}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-2xs transition-colors shrink-0 whitespace-nowrap self-start sm:self-auto"
              >
                <span>Xem xét & Tạo CAPA ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* CAPA Creation Success Toast */}
          {capaSuccessToast && (
            <div className="no-print mx-4 sm:mx-6 lg:mx-8 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{capaSuccessToast.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('capa');
                    setCapaSuccessToast(null);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1"
                >
                  <span>Chuyển tới hồ sơ CAPA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCapaSuccessToast(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Module Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderModuleContent()}
          </main>

          {/* Quiet Page Footer */}
          <footer className="no-print border-t border-slate-200 bg-white py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span>Công ty TNHH Điện Tử LOL · Hệ Thống Giám Sát Chất Lượng Sản Phẩm Điện Tử</span>
              <span className="text-slate-400 ml-2">ISO 9001 / IATF 16949 / IPC-A-610</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsUserManualOpen(true)}
                className="text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 font-medium"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Hướng dẫn sử dụng hệ thống</span>
              </button>
              <button
                onClick={() => setIsFormulaModalOpen(true)}
                className="text-slate-500 hover:text-slate-800 hover:underline"
              >
                Quy chuẩn công thức
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Formula Guide Modal */}
      <FormulaGuideModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
      />

      {/* Auto CAPA Prompt Modal */}
      <AutoCAPAPromptModal
        isOpen={!!pendingAutoCAPA}
        promptData={pendingAutoCAPA}
        onClose={dismissAutoCAPAPrompt}
        onCAPACreated={(capaCode) => {
          setCapaSuccessToast({
            message: `Hồ sơ CAPA ${capaCode} đã được khởi tạo thành công với trạng thái "Open - Pending Review"!`,
            capaCode
          });
        }}
      />

      {/* User Manual Modal */}
      {isUserManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Hướng Dẫn Vận Hành – LOL Quality Control Center</h3>
              </div>
              <button onClick={() => setIsUserManualOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <strong className="text-slate-900 block font-semibold mb-1">1. Luồng theo dõi chất lượng toàn diện:</strong>
                <p>
                  1. Mở app và xem <strong>Dashboard Tổng quan</strong> để nắm bắt 8 thẻ KPI quan trọng nhất cùng các cảnh báo vượt ngưỡng.<br />
                  2. Sử dụng <strong>Thanh bộ lọc dùng chung</strong> ở trên để lọc theo kỳ (Hôm nay, 7 ngày, Tháng này...), Dây chuyền, Model sản phẩm hoặc Nhà cung cấp.<br />
                  3. Nhấn vào bất kỳ biểu đồ Pareto hoặc thẻ KPI để xem danh sách chi tiết các bản ghi vi phạm.<br />
                  4. Vào các phân hệ chuyên biệt (IQC, IPQC, OQC, Khách hàng) để xem xét quyết định Chấp nhận / Cách ly / Từ chối xuất hàng.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold mb-1">2. Nhập và cập nhật dữ liệu kiểm tra:</strong>
                <p>
                  • Nhấn nút <strong>"Nhập dữ liệu"</strong> ở thanh tiêu đề góc trên bên phải để ghi nhận nhanh kết quả lấy mẫu IQC, IPQC, OQC hoặc tiếp nhận khiếu nại khách hàng.<br />
                  • Hệ thống tự động kiểm tra logic: Số lượng lỗi không được vượt quá số lượng kiểm tra. Nếu mẫu số bằng 0, tỷ lệ phần trăm an toàn hiển thị "N/A".
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold mb-1">3. Phân biệt dữ liệu minh họa và dữ liệu thực tế:</strong>
                <p>
                  • Toàn bộ dữ liệu ban đầu được gắn nhãn <em>"Dữ liệu minh họa (Demo)"</em> để phục vụ đào tạo.<br />
                  • Tại thanh công cụ lọc hoặc mục <em>"Dữ liệu & Sao lưu"</em>, người dùng có thể chọn <strong>"Xóa dữ liệu minh họa"</strong> khi bắt đầu vận hành thực tế tại nhà máy hoặc <strong>"Khôi phục dữ liệu mẫu"</strong> bất kỳ lúc nào.
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold mb-1">4. Sao lưu và in ấn báo cáo:</strong>
                <p>
                  • Chọn <strong>"Xuất Báo Cáo"</strong> (Phân hệ 10) để xem bảng tổng hợp A4, sau đó nhấn <em>"In báo cáo / Lưu PDF"</em> để in trực tiếp hoặc xuất file PDF phục vụ họp giao ban.<br />
                  • Xuất bản sao lưu dự phòng JSON thường xuyên tại menu <em>"Dữ liệu & Sao lưu"</em> để bảo vệ số liệu.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsUserManualOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component wrapper for CAPA module
const CAPARecordWrapper: React.FC<{ onOpenAddModal: () => void }> = ({ onOpenAddModal }) => {
  return <CAPAModule onOpenAddModal={onOpenAddModal} />;
};

export default function App() {
  return (
    <QualityProvider>
      <MainAppContent />
    </QualityProvider>
  );
}
