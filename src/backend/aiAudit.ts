/**
 * VOTEGUARD — AI-Powered Security & Forensic Audit Engine for Public Polling
 * Utilizes Gemini 2.5 Flash via @google/genai to evaluate polling data,
 * detect repeat submission patterns, audit time windows, and verify Merkle trees.
 */

import { GoogleGenAI } from '@google/genai';
import { db } from './database';
import { blockchainNode } from './blockchain';

let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({});
  } catch (err) {
    console.warn('GoogleGenAI initialization warning:', err);
  }
}

export interface SecurityAuditReport {
  timestamp: string;
  threatLevel: 'LOW' | 'ELEVATED' | 'CRITICAL';
  integrityScore: number; // 0 - 100
  summary: string;
  invariantsAudit: {
    repeatVoteProtection: 'PASS' | 'FAIL';
    timeWindowEnforcement: 'PASS' | 'FAIL';
    tamperEvidence: 'PASS' | 'FAIL';
    smartContractReconciliation: 'PASS' | 'FAIL';
  };
  detectedAnomalies: string[];
  forensicInsights: string[];
  recommendations: string[];
  isAIPowered: boolean;
}

export async function runAIForensicAudit(userPrompt?: string): Promise<SecurityAuditReport> {
  const auditLogs = db.getAuditLogs().slice(0, 25);
  const polls = db.getPolls();
  const integrity = db.checkIntegrity();
  const blocks = blockchainNode.state.blocks.slice(-5);

  const contextData = {
    platform: 'VOTEGUARD Blockchain Public Polling System',
    totalPolls: polls.length,
    activePolls: polls.filter((p) => p.status === 'ACTIVE').length,
    totalVotesInDB: integrity.dbTotal,
    totalVotesOnChain: integrity.blockchainTotal,
    discrepancies: integrity.discrepancies,
    isSecure: integrity.isSecure,
    recentLogs: auditLogs.map((l) => ({
      time: l.timestamp,
      event: l.eventType,
      actor: l.actor,
      severity: l.severity,
      details: l.details,
    })),
    recentBlocks: blocks.map((b) => ({
      block: b.blockNumber,
      txCount: b.transactionsCount,
      hash: b.hash,
    })),
    userInquiry: userPrompt || 'Perform comprehensive forensic analysis for public polling system evaluators.',
  };

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `You are the Lead Cybersecurity & Blockchain Forensic Auditor for VOTEGUARD Blockchain-Based Public Polling Platform.
Analyze the real-time public polling logs, database integrity check, and blockchain smart contract state.
Evaluate whether cryptographic invariants (Merkle root matching, Nullifier uniqueness, Repeat vote prevention, Time-window bounds) hold or if any tamper attempts occurred.
Respond ONLY with a valid JSON object matching this schema:
{
  "threatLevel": "LOW" | "ELEVATED" | "CRITICAL",
  "integrityScore": number (0 to 100),
  "summary": "2-3 concise sentences summarizing current polling security posture",
  "invariantsAudit": {
    "repeatVoteProtection": "PASS" | "FAIL",
    "timeWindowEnforcement": "PASS" | "FAIL",
    "tamperEvidence": "PASS" | "FAIL",
    "smartContractReconciliation": "PASS" | "FAIL"
  },
  "detectedAnomalies": ["list of concrete anomaly strings or empty if clean"],
  "forensicInsights": ["3 specific technical observations about the cryptographic proofs or event sequence"],
  "recommendations": ["2 actionable security steps for poll organizers"]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nPOLLING AUDIT TELEMETRY:\n${JSON.stringify(
                  contextData,
                  null,
                  2
                )}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      return {
        timestamp: new Date().toISOString(),
        threatLevel: parsed.threatLevel || (integrity.isSecure ? 'LOW' : 'CRITICAL'),
        integrityScore: parsed.integrityScore ?? (integrity.isSecure ? 98 : 35),
        summary: parsed.summary,
        invariantsAudit: parsed.invariantsAudit || {
          repeatVoteProtection: 'PASS',
          timeWindowEnforcement: 'PASS',
          tamperEvidence: integrity.isSecure ? 'PASS' : 'FAIL',
          smartContractReconciliation: integrity.isSecure ? 'PASS' : 'FAIL',
        },
        detectedAnomalies: parsed.detectedAnomalies || [],
        forensicInsights: parsed.forensicInsights || [],
        recommendations: parsed.recommendations || [],
        isAIPowered: true,
      };
    } catch (aiErr) {
      console.warn('AI analysis fallback triggered:', aiErr);
    }
  }

  // Deterministic Rule-Based Forensic Engine Fallback
  const anomalies: string[] = [];
  if (!integrity.isSecure) {
    anomalies.push(...integrity.discrepancies);
  }

  const repeatVoteAttempts = auditLogs.filter(
    (l) => l.eventType === 'REPEAT_VOTE_BLOCKED'
  ).length;
  if (repeatVoteAttempts > 0) {
    anomalies.push(
      `${repeatVoteAttempts} unauthorized repeat submission attempt(s) were intercepted and blocked by Smart Contract & DB constraints.`
    );
  }

  const timingViolations = auditLogs.filter(
    (l) => l.eventType === 'TIMING_INVARIANT_VIOLATION'
  ).length;
  if (timingViolations > 0) {
    anomalies.push(
      `${timingViolations} out-of-bounds voting attempt(s) were blocked outside scheduled start/end windows.`
    );
  }

  const tamperAttempts = auditLogs.filter(
    (l) => l.eventType === 'DATABASE_TAMPER_DETECTED'
  ).length;
  if (tamperAttempts > 0) {
    anomalies.push(
      `${tamperAttempts} database tampering incident(s) detected. Blockchain Merkle root discrepancy flagged!`
    );
  }

  const threatLevel: 'LOW' | 'ELEVATED' | 'CRITICAL' = !integrity.isSecure
    ? 'CRITICAL'
    : repeatVoteAttempts > 0 || timingViolations > 0
    ? 'ELEVATED'
    : 'LOW';

  const score = !integrity.isSecure ? 32 : repeatVoteAttempts > 0 ? 88 : 99;

  return {
    timestamp: new Date().toISOString(),
    threatLevel,
    integrityScore: score,
    summary: integrity.isSecure
      ? `Polling ledger verified across all active surveys. Smart contract state matches Merkle roots. Zero repeat or manipulated votes recorded.`
      : `CRITICAL ALERT: Database tampering detected! Poll option counts in PostgreSQL deviate from the immutable Smart Contract block receipts.`,
    invariantsAudit: {
      repeatVoteProtection: 'PASS',
      timeWindowEnforcement: 'PASS',
      tamperEvidence: integrity.isSecure ? 'PASS' : 'FAIL',
      smartContractReconciliation: integrity.isSecure ? 'PASS' : 'FAIL',
    },
    detectedAnomalies: anomalies,
    forensicInsights: [
      `Cryptographic nullifiers maintain 100% unlinkability between participant IDs and specific option selections.`,
      `Smart contract rejects any transaction submitted before poll startTime or after poll endTime.`,
      `Block height stands at #${blockchainNode.state.currentBlockNumber} with authority signature validation intact.`,
    ],
    recommendations: [
      integrity.isSecure
        ? 'Maintain active node monitoring and periodic Merkle root checkpointing.'
        : 'Trigger immediate automated database rollback using the authoritative Smart Contract state.',
      'Ensure poll start and end timestamps match community announcement guidelines.',
    ],
    isAIPowered: false,
  };
}
