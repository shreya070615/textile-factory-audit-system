import React, { useState, useEffect } from 'react';
import { UserSession } from '../auth/LoginView';
import { getBackendHealth, BackendHealth } from '../../services/api';

export type TabId =
  | 'dashboard'
  | 'dataset'
  | 'audit'
  | 'compare'
  | 'dispatch'
  | 'dpr'
  | 'cluster'
  | 'scheduling';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  selectedFactory: string;
  onSelectFactory: (factory: string) => void;
  userSession: UserSession | null;
  onLogout: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  selectedFactory,
  onSelectFactory,
  userSession,
  onLogout,
}: SidebarProps) {
  const auditNavItems: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'dataset', label: 'Dataset Overview', icon: '🗄️' },
    { id: 'audit', label: 'Audit Report', icon: '📋' },
    { id: 'compare', label: 'Compare Companies', icon: '⚖️' },
  ];

  const actionNavItems: Array<{ id: TabId; label: string; icon: string; badge?: string }> = [
    { id: 'dispatch', label: 'Floor Dispatch', icon: '🎙️', badge: 'Voice' },
    { id: 'dpr', label: 'Loan & DPR Dossier', icon: '📑', badge: 'ADEETIE' },
    { id: 'cluster', label: 'Cluster Benchmark', icon: '🌐' },
    { id: 'scheduling', label: 'Tariff Scheduling', icon: '⚡' },
  ];

  return (
    <aside className="w-[200px] md:w-[240px] shrink-0 bg-[#0f2d45] text-[#cddde6] flex flex-col h-full border-r border-[#1a3f58] select-none transition-all duration-200">
      {/* Brand Block */}
      <div className="p-4 md:p-[20px] border-b border-[#1a3f58] flex items-center gap-3">
        <div className="w-[36px] h-[36px] md:w-[38px] md:h-[38px] rounded-[8px] bg-[#1d7a5f] flex items-center justify-center shrink-0 shadow-xs">
          <span className="text-[18px] md:text-[20px] leading-none">🏭</span>
        </div>
        <div className="overflow-hidden">
          <h1 className="text-[13.5px] md:text-[14px] font-bold text-white tracking-tight leading-tight truncate">
            Textile Audit
          </h1>
          <p className="text-[10px] md:text-[11px] text-[#7ea8be] leading-tight truncate mt-0.5">
            Synthetic Sensor Compliance
          </p>
        </div>
      </div>

      {/* Factory Selector */}
      <div className="p-3 md:p-[12px_16px] border-b border-[#1a3f58]">
        <label
          htmlFor="factory-select"
          className="block text-[9.5px] md:text-[10px] font-bold uppercase tracking-wider text-[#7ea8be] mb-1.5"
        >
          SELECT FACTORY
        </label>
        <select
          id="factory-select"
          value={selectedFactory}
          onChange={(e) => onSelectFactory(e.target.value)}
          className="w-full bg-[#152e42] border border-[#2a4f6a] text-[#e0ecf4] text-[12px] md:text-[12.5px] font-medium rounded-[6px] p-[6px_9px] md:p-[7px_10px] focus:outline-hidden focus:border-[#1d7a5f] cursor-pointer"
        >
          <option value="TexAlpha Mills">TexAlpha Mills</option>
          <option value="BetaWeave Industries">BetaWeave Industries</option>
        </select>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex-1 p-2 md:p-[12px] space-y-3 overflow-y-auto">
        {/* Group 1: Statutory Audits */}
        <div>
          <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#5a7e90]">
            Audit & Compliance
          </div>
          <div className="space-y-0.5">
            {auditNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[12px] md:text-[12.5px] text-left transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1f4f72] text-white font-bold'
                      : 'text-[#a8c0cc] font-medium hover:bg-[#1a3d5c] hover:text-white'
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: 'inset 3px 0 0 #1d7a5f',
                        }
                      : undefined
                  }
                >
                  <span className="text-[14px] shrink-0 leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group 2: Operational Action & Financing */}
        <div className="pt-1 border-t border-[#1a3f58]/60">
          <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#5a7e90]">
            Action & Financing
          </div>
          <div className="space-y-0.5">
            {actionNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-[6px] text-[12px] md:text-[12.5px] text-left transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1f4f72] text-white font-bold'
                      : 'text-[#a8c0cc] font-medium hover:bg-[#1a3d5c] hover:text-white'
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: 'inset 3px 0 0 #1d7a5f',
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-[14px] shrink-0 leading-none">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#1d7a5f]/30 text-[#8be2ca]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Logged in User Bar */}
      {userSession && (
        <div className="p-2.5 md:p-[10px_14px] border-t border-[#1a3f58] bg-[#0c2438]">
          <div className="flex items-center justify-between mb-0.5">
            <span
              className={`px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase tracking-wider ${
                userSession.role === 'admin'
                  ? 'bg-[#1d7a5f] text-white'
                  : 'bg-[#1a6ea8] text-white'
              }`}
            >
              {userSession.role === 'admin' ? '⚡ ADMIN' : 'AUDITOR'}
            </span>
            <button
              onClick={onLogout}
              className="text-[10px] text-[#7ea8be] hover:text-white cursor-pointer hover:underline transition-colors"
            >
              Sign out
            </button>
          </div>
          <div className="text-[11px] font-semibold text-white truncate">
            {userSession.displayName}
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-2.5 md:p-[12px_16px] border-t border-[#1a3f58] text-[9.5px] text-[#5a7e90] leading-[1.5]">
        <div>Data source: Synthetic CSV · Zenodo #15277168</div>
        <div className="mt-0.5 text-[8.5px] text-[#4d6d7e]">
          BEE ADEETIE · SIDBI 4E · ISO 50001 · CPCB
        </div>
      </div>
    </aside>
  );
}

interface TopbarProps {
  currentTab: TabId;
  userSession: UserSession | null;
  onLogout: () => void;
}

export function Topbar({ currentTab, userSession, onLogout }: TopbarProps) {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const data = await getBackendHealth();
      if (isMounted) {
        setHealth(data);
        setChecked(true);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const titles: Record<TabId, string> = {
    dashboard: 'Dashboard',
    dataset: 'Dataset Overview',
    audit: 'Audit Report',
    compare: 'Company Comparison',
    dispatch: 'Floor Dispatch (Vernacular WhatsApp & Voice)',
    dpr: 'Statutory DPR & Subsidized Green Loan Dossier',
    cluster: 'Federated MSME Cluster Benchmarking',
    scheduling: 'Time-of-Day (ToD) Tariff & Carbon Scheduler',
  };

  return (
    <header className="h-[60px] bg-white border-b border-[#dde5ea] px-4 md:px-[28px] flex items-center justify-between shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.05)] z-10">
      <h2 className="text-[14px] md:text-[16px] font-bold text-[#1e3344] tracking-tight truncate pr-2">
        {titles[currentTab]}
      </h2>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f3e8ff] text-[#6d28d9]">
          <span>📂</span>
          <span>Synthetic CSV Dataset</span>
        </span>

        {checked && health ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8f5f1] text-[#1d7a5f] border border-[#c8e6c9]/60"
            title={`Backend: ${health.service} (Uptime: ${health.uptimeSeconds}s) | AI: ${health.aiModule.provider} | Total Readings: ${health.totalReadingsTracked.toLocaleString()}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1d7a5f] animate-pulse" />
            <span>Backend Connected (:5000)</span>
          </span>
        ) : checked && !health ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
            title="Backend server offline - using client fallback data"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>Fallback Mode</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#64748b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-ping" />
            <span>Connecting API...</span>
          </span>
        )}

        {userSession && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#dde5ea]">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                userSession.role === 'admin'
                  ? 'bg-[#e8f5f1] text-[#1d7a5f] border border-[#c8e6c9]'
                  : 'bg-[#e3f2fd] text-[#1565c0] border border-[#bbdefb]'
              }`}
            >
              {userSession.role === 'admin' ? 'Admin' : 'Auditor'}
            </span>
            <button
              onClick={onLogout}
              className="px-2 py-1 text-[11px] font-semibold text-[#607d8b] hover:text-[#c0392b] hover:bg-[#fdecea] rounded transition-colors cursor-pointer"
              title="Sign out of system"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
