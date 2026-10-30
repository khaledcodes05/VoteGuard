/**
 * VOTEGUARD — Hero & System Overview Banner
 * Blockchain-Based Public Polling & Campus Survey System
 */

import React from 'react';
import {
  ShieldCheck,
  Clock,
  KeyRound,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Vote,
  Search,
} from 'lucide-react';
import { SystemStats } from '../lib/types';

interface HeroBannerProps {
  stats: SystemStats | null;
  onOpenCreatePoll: () => void;
  onNavigateToPolls: () => void;
  onNavigateToAuditor: () => void;
  systemStatus: 'SECURE' | 'TAMPER_DETECTED';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  stats,
  onOpenCreatePoll,
  onNavigateToPolls,
  onNavigateToAuditor,
  systemStatus,
}) => {
  return (
    <div className="relative border-b border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading and Mission */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400 font-semibold">BLOCKCHAIN PUBLIC POLLING</span>
              <span>·</span>
              <span>Campus Surveys & Governance</span>
              <span>·</span>
              <span>EVM Smart Contract Verified</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Trustworthy Campus Surveys. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                Mathematically Verifiable Records.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Online polls are often plagued by repeated bot submissions and unverifiable tallies.
              VOTEGUARD replaces vulnerable web forms with an EVM smart contract system enforcing
              strict voting time windows, one-vote-per-participant nullifiers, and public receipt verification.
            </p>

            {/* Problem Statement Resolution Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                <KeyRound className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Zero Repeat Voting:</strong> Cryptographic nullifiers reject duplicate ballots per participant.
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Timed Lifecycle:</strong> Smart contract strictly enforces start & end timestamps.
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                <FileCheck2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Verifiable Receipts:</strong> Each participant receives a Keccak-256 Merkle inclusion proof.
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Dual-Ledger Audit:</strong> Detects and repairs unauthorized SQL database alterations.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToPolls}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Vote className="h-3.5 w-3.5" />
                <span>Vote in Active Polls</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreatePoll}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />
                <span>Create New Poll</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToAuditor}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Verify Recorded Vote</span>
              </button>
            </div>
          </div>

          {/* Right Column: Campus Quad & Live Ledger Status Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl group">
              <img
                src="/src/assets/images/university_campus_quad_1793344915479.jpg"
                alt="University College Campus Quad"
                className="w-full h-48 sm:h-56 object-cover opacity-85 group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-cyan-400 font-medium">CAMPUS PARTICIPATION HUB</p>
                  <p className="text-sm font-semibold text-white">Student Preferences & Surveys</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-xs text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Solidity 0.8.24</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-6">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Total Public Polls</p>
            <p className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats ? stats.totalPolls : '--'}
            </p>
            <p className="text-xs text-cyan-400">
              {stats ? `${stats.activePolls} Polls Open Now` : '--'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Total Ballots Cast</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats ? stats.totalVotesRecorded : '--'}
            </p>
            <p className="text-xs text-slate-400">Smart contract confirmed</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Blockchain Block Height</p>
            <p className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats ? `#${stats.blocksMined + 1399}` : '--'}
            </p>
            <p className="text-xs text-indigo-400">
              {stats ? `${stats.blocksMined} Blocks Mined` : '--'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Cryptographic Integrity</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {systemStatus === 'SECURE' ? (
                <span className="text-emerald-400 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> All Polls Reconciled
                </span>
              ) : (
                <span className="text-red-400 inline-flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Tamper Discrepancy
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Dual-ledger checked</p>
          </div>
        </div>
      </div>
    </div>
  );
};
