import React from 'react';
import { 
  LayoutDashboard, 
  Table2, 
  TrendingUp, 
  GitCommit, 
  Compass, 
  Sparkles, 
  BookOpen, 
  FileSpreadsheet
} from 'lucide-react';

export type NavigationTab = 
  | 'overview' 
  | 'sales-data' 
  | 'trend-analysis' 
  | 'regression' 
  | 'eigen-analysis' 
  | 'predictions' 
  | 'about';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  recordCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileMenuOpen,
  onCloseMobileMenu,
  recordCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: `${recordCount} rows`
    },
    {
      id: 'sales-data' as NavigationTab,
      label: 'Sales Data',
      icon: Table2,
      badge: 'Data Table'
    },
    {
      id: 'trend-analysis' as NavigationTab,
      label: 'Trend Analysis',
      icon: TrendingUp,
      badge: 'Moving Avg'
    },
    {
      id: 'regression' as NavigationTab,
      label: 'Correlation & Regression',
      icon: GitCommit,
      badge: 'Unit V'
    },
    {
      id: 'eigen-analysis' as NavigationTab,
      label: 'Eigenvalue Analysis',
      icon: Compass,
      badge: 'Unit I'
    },
    {
      id: 'predictions' as NavigationTab,
      label: 'Predictions',
      icon: Sparkles,
      badge: 'Interactive'
    },
    {
      id: 'about' as NavigationTab,
      label: 'About the Project',
      icon: BookOpen,
      badge: 'Viva Guide'
    },
  ];

  const handleItemClick = (id: NavigationTab) => {
    onSelectTab(id);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[61px] left-0 h-screen md:h-[calc(100vh-61px)] w-64 bg-white border-r border-slate-200 z-50 md:z-20 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } no-print`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mobile header inside drawer */}
          <div className="flex md:hidden items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
            <button
              onClick={onCloseMobileMenu}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Analytics Modules
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Academic Syllabus Mapping box */}
          <div className="mt-8 p-3 bg-gradient-to-br from-indigo-50/60 to-slate-50 rounded-xl border border-indigo-100/60 text-xs">
            <div className="font-semibold text-indigo-950 flex items-center gap-1.5 mb-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
              <span>Syllabus Alignment</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Unit I:</strong> 2×2 Covariance, Eigenvalues, Eigenvectors &amp; Principal Axes.<br/>
              <strong>Unit V:</strong> Least Squares Line, Pearson <em>r</em>, &amp; Residuals.
            </p>
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 flex items-center justify-between">
          <span>TrendFit v1.0.0</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online
          </span>
        </div>
      </aside>
    </>
  );
};
