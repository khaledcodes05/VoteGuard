/**
 * VOTEGUARD — Auditor Suite & Blockchain Block Explorer
 * Independent receipt verifier, Merkle tree proof validator, and block explorer.
 * National Civic Governance & Electoral Commission (NCGEC 2026)
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Blocks,
  ShieldCheck,
  Hash,
  Clock,
  Cpu,
} from 'lucide-react';
import { Block, AuditLog, VoteReceipt } from '../lib/types';

interface AuditorSuiteProps {
  initialReceiptHash?: string | null;
}

export const AuditorSuite: React.FC<AuditorSuiteProps> = ({ initialReceiptHash }) => {
  const [activeSubTab, setActiveSubTab] = useState<'VERIFY' | 'BLOCKS' | 'LOGS'>('VERIFY');
  const [receiptInput, setReceiptInput] = useState(initialReceiptHash || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    merkleValid?: boolean;
    receipt?: VoteReceipt;
    message?: string;
    contractAddress?: string;
  } | null>(null);

  // Explorer Data
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLogFilter, setSelectedLogFilter] = useState<string>('ALL');

  useEffect(() => {
    if (initialReceiptHash) {
      setReceiptInput(initialReceiptHash);
      handleVerifyReceipt(initialReceiptHash);
    }
    fetchExplorerData();
  }, [initialReceiptHash]);

  const fetchExplorerData = async () => {
    try {
      const [blocksRes, logsRes] = await Promise.all([
        fetch('/api/audit/blocks'),
        fetch('/api/audit/logs'),
      ]);
      const blocksData = await blocksRes.json();
      const logsData = await logsRes.json();

      setBlocks(blocksData.blocks || []);
      setAuditLogs(logsData.logs || []);
    } catch (err) {
      console.error('Failed to fetch auditor data:', err);
    }
  };

  const handleVerifyReceipt = async (hashToVerify?: string) => {
    const target = hashToVerify || receiptInput.trim();
    if (!target) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/audit/verify-receipt/${target}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult({
        verified: false,
        message: err.message || 'Verification connection failed.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredLogs =
    selectedLogFilter === 'ALL'
      ? auditLogs
      : auditLogs.filter((l) => l.eventType.includes(selectedLogFilter));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header & Sub-Navigation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Auditor Suite & Public Blockchain Explorer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent mathematical verification tools for electoral observers, public auditors, and voters.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('VERIFY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'VERIFY'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Receipt Verifier
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('BLOCKS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'BLOCKS'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Block Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('LOGS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'LOGS'
                ? 'bg-slate-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cryptographic Audit Chain
          </button>
        </div>
      </div>

      {/* 1. RECEIPT VERIFIER TAB */}
      {activeSubTab === 'VERIFY' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Independent Cryptographic Ballot Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Paste your Keccak-256 Receipt Hash to verify whether your vote was incorporated into the
              smart contract's Merkle tree without revealing your candidate choice or identity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Hash className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={receiptInput}
                onChange={(e) => setReceiptInput(e.target.value)}
                placeholder="Enter 0x... receipt hash"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleVerifyReceipt()}
              disabled={isVerifying || !receiptInput.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{isVerifying ? 'Verifying...' : 'Verify on Chain'}</span>
            </button>
          </div>

          {/* VERIFICATION RESULT CARD */}
          {verificationResult && (
            <div
              className={`rounded-xl border p-6 space-y-4 ${
                verificationResult.verified
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : 'border-red-500/40 bg-red-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {verificationResult.verified ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <div>
                  <h4 className="text-base font-bold text-white">
                    {verificationResult.verified
                      ? 'Receipt Validated: Cryptographic Invariants Satisfied'
                      : 'Receipt Verification Failed'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {verificationResult.verified
                      ? 'Receipt hash resides in the smart contract state and forms part of the Merkle Tree.'
                      : verificationResult.message || 'Hash not found in blockchain ledger.'}
                  </p>
                </div>
              </div>

              {verificationResult.receipt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-slate-950 p-4 font-mono text-xs border border-slate-800">
                  <div>
                    <span className="text-slate-500">Mined Block:</span>
                    <p className="text-white font-bold">#{verificationResult.receipt.blockNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Timestamp:</span>
                    <p className="text-slate-300">
                      {new Date(verificationResult.receipt.timestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <span className="text-slate-500">Merkle Inclusion Status:</span>
                    <p className="text-emerald-400 font-semibold">
                      {verificationResult.merkleValid
                        ? 'VERIFIED (Proof path recomputes directly to Merkle Root)'
                        : 'MISMATCH'}
                    </p>
                  </div>
                  <div className="col-span-full">
                    <span className="text-slate-500">Merkle Proof Path (Siblings):</span>
                    <div className="mt-1 space-y-1">
                      {verificationResult.receipt.merkleProof.length === 0 ? (
                        <p className="text-slate-400 italic">Single leaf root (Proof length 0)</p>
                      ) : (
                        verificationResult.receipt.merkleProof.map((sibling, i) => (
                          <p key={i} className="text-[11px] text-cyan-300 break-all">
                            Layer {i + 1}: {sibling}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. BLOCK LEDGER EXPLORER TAB */}
      {activeSubTab === 'BLOCKS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Block Ledger</h3>
              <p className="text-xs text-slate-400">
                Cryptographic blocks chaining state with Keccak-256 and Merkle roots.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded border border-cyan-800/50">
              {blocks.length} Blocks Mined
            </span>
          </div>

          <div className="space-y-3">
            {blocks.map((block) => (
              <div
                key={block.blockNumber}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Blocks className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold text-white">Block #{block.blockNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(block.timestamp * 1000).toLocaleTimeString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-indigo-400" />
                      {block.gasUsed.toLocaleString()} Gas
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500">Block Hash:</span>
                    <p className="text-cyan-300 truncate" title={block.hash}>
                      {block.hash}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Previous Hash:</span>
                    <p className="text-slate-400 truncate" title={block.previousHash}>
                      {block.previousHash}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Merkle Root:</span>
                    <p className="text-slate-300 truncate" title={block.merkleRoot}>
                      {block.merkleRoot}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Transactions:</span>
                    <p className="text-white">{block.transactionsCount} transaction(s)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CRYPTOGRAPHIC AUDIT CHAIN TAB */}
      {activeSubTab === 'LOGS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Tamper-Evident Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Each event links cryptographically to the previous log hash (Hash Chain Invariant).
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'BALLOT', 'DOUBLE_VOTE', 'TAMPER'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedLogFilter(filter)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                    selectedLogFilter === filter
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.severity === 'ALERT'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : log.severity === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {log.eventType}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">Actor: {log.actor}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{log.details}</p>

                <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row gap-2 font-mono text-[10px] text-slate-500">
                  <span className="truncate">Log Hash: {log.hash.slice(0, 24)}...</span>
                  <span className="truncate">Prev Hash: {log.previousHash.slice(0, 24)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
