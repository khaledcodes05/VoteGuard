/**
 * VOTEGUARD — System Architecture Modal
 * Complete architectural diagram and responsibility matrix for College Surveys & Public Polling.
 */

import React from 'react';
import { X, Server, Cpu, Eye, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            VOTEGUARD DUAL-LEDGER SPECIFICATION
          </span>
          <h2 className="text-2xl font-bold text-white">
            Dual-Ledger Hybrid Architecture: Relational Database + Immutable Blockchain
          </h2>
          <p className="text-xs text-slate-400">
            How PostgreSQL ACID guarantees meet EVM Smart Contract immutability, timing constraints, and Nullifier privacy for college polling.
          </p>
        </div>

        {/* 3-Tier Diagram Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Server className="h-4 w-4" />
              <span>1. Application & Gatekeeper</span>
            </div>
            <p className="text-xs text-slate-300">
              React + Node.js Express REST API handles student registration roll, participant verification, and blind nullifier generation.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Student ID & campus eligibility check</li>
              <li>Generates one-way cryptographic nullifiers per poll</li>
              <li>Ultra-fast in-memory caching & rate limiting</li>
            </ul>
          </div>

          {/* Layer 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="h-4 w-4" />
              <span>2. Immutable EVM Contract</span>
            </div>
            <p className="text-xs text-slate-300">
              Solidity 0.8.24 Smart Contract serves as the single authoritative source of truth for vote tallies and nullifiers.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Enforces repeat-vote prevention invariant</li>
              <li>Validates defined start and end time windows</li>
              <li>Issues tamper-evident cryptographic receipts</li>
            </ul>
          </div>

          {/* Layer 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Eye className="h-4 w-4" />
              <span>3. Independent Auditor</span>
            </div>
            <p className="text-xs text-slate-300">
              Reconciles database tallies against smart contract blocks and evaluates logarithmic Merkle inclusion proofs.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Instant cryptographic receipt verifier</li>
              <li>Exposes rogue SQL database record tampering</li>
              <li>Gemini AI forensic log telemetry audit</li>
            </ul>
          </div>
        </div>

        {/* Responsibility Matrix */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Responsibility Matrix & Separation of Concerns</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-cyan-300">PostgreSQL (Relational Store)</h4>
              <p className="text-slate-400 leading-relaxed">
                Stores student eligibility rolls, survey metadata, poll categories, and indexed query data. Relational unique composite indexes (pollId, studentId) reject duplicate attempts instantly at the API boundary.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-emerald-300">Blockchain Smart Contract</h4>
              <p className="text-slate-400 leading-relaxed">
                Holds authoritative option vote counts, nullifier status mappings, and Merkle root leaves. Even if a rogue system administrator tampers with the database, the blockchain cannot be edited and proves the tampering immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Architecture View
          </button>
        </div>
      </div>
    </div>
  );
};
