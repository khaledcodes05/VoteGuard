/**
 * VOTEGUARD — Top Navigation Bar for Blockchain Public Polling System
 */

import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, Menu, X, PlusCircle, Vote } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePoll: () => void;
  onReset: () => void;
  isResetting: boolean;
  systemStatus: 'SECURE' | 'TAMPER_DETECTED';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePoll,
  onReset,
  isResetting,
  systemStatus,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'polls', label: 'Public Polls' },
    { id: 'results', label: 'Live & Post Tallies' },
    { id: 'security', label: 'Security & Repeat-Vote Lab' },
    { id: 'auditor', label: 'Receipt Verifier' },
    { id: 'ai-audit', label: 'AI Forensic Auditor' },
    { id: 'contract', label: 'Smart Contract' },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelectTab('polls')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white ring-1 ring-cyan-500/40 group-hover:ring-cyan-300 transition-all">
              <Vote className="h-4 w-4" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                VOTEGUARD
              </span>
              <span className="text-xs text-slate-400 ml-2 font-mono tracking-tight hidden sm:inline">
                POLLING ENGINE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer text-xs lg:text-sm ${
                activeTab === item.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Create Poll Button */}
          <button
            type="button"
            onClick={onOpenCreatePoll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Poll</span>
          </button>

          {/* Status Badge */}
          <button
            type="button"
            onClick={() => handleSelectTab('auditor')}
            title="Click to view live blockchain audit explorer"
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${
              systemStatus === 'SECURE'
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400'
                : 'border-red-500/30 bg-red-950/40 text-red-300 hover:border-red-400'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{systemStatus === 'SECURE' ? 'Ledger Verified' : 'Tamper Detected'}</span>
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onReset}
            disabled={isResetting}
            title="Reset Database and Blockchain to Initial Clean Seed State"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Horizontal Tab Strip for Mobile & Tablet */}
      <div className="lg:hidden border-t border-slate-900 bg-slate-950 px-2 py-1.5 overflow-x-auto scrollbar-none flex gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectTab(item.id)}
            className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer ${
              activeTab === item.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-4 space-y-2 shadow-2xl animate-fade-in">
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
            Navigation Menu
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
