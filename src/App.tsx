/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * VOTEGUARD — Blockchain-Based Public Polling System
 * College Surveys · Student Preferences · Campus Improvement Suggestions
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PollsList } from './components/PollsList';
import { CreatePollModal } from './components/CreatePollModal';
import { LiveResults } from './components/LiveResults';
import { SecurityLab } from './components/SecurityLab';
import { AuditorSuite } from './components/AuditorSuite';
import { AIAuditInspector } from './components/AIAuditInspector';
import { ContractViewer } from './components/ContractViewer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { Poll, SystemStats, VoteReceipt } from './lib/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('polls');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<'SECURE' | 'TAMPER_DETECTED'>('SECURE');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [auditorReceiptHash, setAuditorReceiptHash] = useState<string | null>(null);

  const fetchSystemData = async () => {
    setIsRefreshing(true);
    try {
      const [pollsRes, integrityRes] = await Promise.all([
        fetch('/api/polls'),
        fetch('/api/security/integrity'),
      ]);

      const pollsData = await pollsRes.json();
      const integrityData = await integrityRes.json();

      setPolls(pollsData.polls || []);
      setStats(pollsData.stats || null);
      setSystemStatus(integrityData.isSecure ? 'SECURE' : 'TAMPER_DETECTED');
    } catch (err) {
      console.error('Error fetching system data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/system/reset', { method: 'POST' });
      await fetchSystemData();
      setActiveTab('polls');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleVoteCastSuccess = (_receipt: VoteReceipt) => {
    fetchSystemData();
  };

  const handleNavigateToAuditor = (receiptHash: string) => {
    setAuditorReceiptHash(receiptHash);
    setActiveTab('auditor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreatePoll={() => setIsCreateModalOpen(true)}
        onReset={handleResetDemo}
        isResetting={isResetting}
        systemStatus={systemStatus}
      />

      {/* Hero Banner */}
      <HeroBanner
        stats={stats}
        onOpenCreatePoll={() => setIsCreateModalOpen(true)}
        onNavigateToPolls={() => {
          setActiveTab('polls');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToAuditor={() => {
          setActiveTab('auditor');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        systemStatus={systemStatus}
      />

      {/* Main Tabbed Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'polls' && (
          <PollsList
            polls={polls}
            onVoteSuccess={handleVoteCastSuccess}
            onNavigateToAuditor={handleNavigateToAuditor}
            onOpenCreatePoll={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeTab === 'results' && (
          <LiveResults
            polls={polls}
            onRefresh={fetchSystemData}
            isRefreshing={isRefreshing}
            onNavigateToAuditor={() => {
              setActiveTab('auditor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'security' && (
          <SecurityLab onIntegrityChange={fetchSystemData} />
        )}

        {activeTab === 'auditor' && (
          <AuditorSuite initialReceiptHash={auditorReceiptHash} />
        )}

        {activeTab === 'ai-audit' && <AIAuditInspector />}

        {activeTab === 'contract' && <ContractViewer />}
      </main>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPollCreated={fetchSystemData}
      />

      {/* Architecture Explainer Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl space-y-2">
          <p className="font-mono text-slate-400">
            VOTEGUARD · Blockchain-Based Public Polling & Campus Survey System
          </p>
          <p>
            Multi-Option Surveys · Defined Start &amp; End Timestamps · Repeat-Vote Prevention via Nullifiers · Live &amp; Post-Election Tallies · Cryptographic Receipt Verification
          </p>
        </div>
      </footer>
    </div>
  );
}
