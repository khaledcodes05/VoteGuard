/**
 * VOTEGUARD — AI Forensic Security Auditor (Powered by Gemini)
 * Analyzes event logs, calculates risk scores, and answers observer inquiries.
 * National Civic Governance & Electoral Commission (NCGEC 2026)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Send,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { SecurityAuditReport } from '../backend/aiAudit';

export const AIAuditInspector: React.FC = () => {
  const [report, setReport] = useState<SecurityAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const runAudit = async (query?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/forensic-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query || customPrompt }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Failed to run AI audit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'How does VOTEGUARD stop double voting if an insider modifies PostgreSQL?',
    'Explain how Zero-Knowledge nullifiers unlink citizen identity from ballot choice.',
    'What cryptographic guarantees prevent front-running or transaction replay attacks?',
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">AI Forensic Security Auditor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gemini-powered real-time evaluation of cryptographic invariants and election telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => runAudit()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Cpu className="h-4 w-4" />
          <span>{isLoading ? 'Synthesizing Forensic Audit...' : 'Generate Forensic Assessment'}</span>
        </button>
      </div>

      {/* Report View */}
      {report && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Top Score Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">System Integrity Score</span>
              <p
                className={`text-3xl font-extrabold font-mono tabular-nums ${
                  report.integrityScore > 80
                    ? 'text-emerald-400'
                    : report.integrityScore > 50
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {report.integrityScore} / 100
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Threat Level Assessment</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    report.threatLevel === 'LOW'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : report.threatLevel === 'ELEVATED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {report.threatLevel}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Audit Timestamp</span>
              <p className="text-xs font-mono text-slate-300">
                {new Date(report.timestamp).toLocaleString()}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono">
                {report.isAIPowered ? 'Verified by Gemini 2.5 Flash' : 'Deterministic Forensic Engine'}
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Forensic Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed rounded-xl bg-slate-950 p-4 border border-slate-800">
              {report.summary}
            </p>
          </div>

          {/* 4 Invariants Audit Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Cryptographic Invariants Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Repeat-Vote Prevention (EVM Nullifiers):</span>
                <span
                  className={`font-mono font-bold inline-flex items-center gap-1 ${
                    report.invariantsAudit.repeatVoteProtection === 'PASS'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {report.invariantsAudit.repeatVoteProtection === 'PASS' ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {report.invariantsAudit.repeatVoteProtection}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Database Tamper Evidence (Merkle Proofs):</span>
                <span
                  className={`font-mono font-bold inline-flex items-center gap-1 ${
                    report.invariantsAudit.tamperEvidence === 'PASS'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {report.invariantsAudit.tamperEvidence === 'PASS' ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {report.invariantsAudit.tamperEvidence}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Defined Voting Time Bounds (Start/End):</span>
                <span
                  className={`font-mono font-bold inline-flex items-center gap-1 ${
                    report.invariantsAudit.timeWindowEnforcement === 'PASS'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {report.invariantsAudit.timeWindowEnforcement === 'PASS' ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {report.invariantsAudit.timeWindowEnforcement}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Smart Contract Ledger Reconciliation:</span>
                <span
                  className={`font-mono font-bold inline-flex items-center gap-1 ${
                    report.invariantsAudit.smartContractReconciliation === 'PASS'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {report.invariantsAudit.smartContractReconciliation === 'PASS' ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {report.invariantsAudit.smartContractReconciliation}
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Insights */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Forensic Insights & Technical Evidence</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {report.forensicInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono">0{idx + 1}.</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h4 className="text-sm font-semibold text-white">Recommended Policy Directives</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Ask AI Observer Inquiries Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Ask the AI Security Auditor (Observer Inquiry)</h3>
        </div>
        <p className="text-xs text-slate-400">
          Have a question regarding cryptographic trade-offs, threat models, or EVM invariants? Ask the
          auditor below.
        </p>

        {/* Preset prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCustomPrompt(q);
                runAudit(q);
              }}
              className="text-[11px] text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 transition-colors cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. How does the contract prevent miner front-running?"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customPrompt.trim()) {
                runAudit(customPrompt);
              }
            }}
          />
          <button
            type="button"
            onClick={() => runAudit(customPrompt)}
            disabled={isLoading || !customPrompt.trim()}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
};
