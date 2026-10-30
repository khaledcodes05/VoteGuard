/**
 * VOTEGUARD — Blockchain-Based Public Polling System
 * Types & Domain Models
 */

export type VoterStatus = 'VERIFIED' | 'PENDING_CLEARANCE' | 'SUSPENDED';

export type PollCategory =
  | 'Campus Improvement'
  | 'Student Preferences'
  | 'Academic Surveys'
  | 'Tech & Innovation'
  | 'Facilities & Dining';

export type ResultVisibility = 'LIVE' | 'POST_ELECTION';

export interface PollOption {
  id: number;
  label: string;
  description?: string;
  voteCount: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  category: PollCategory;
  creator: string;
  startTime: number;
  endTime: number;
  resultVisibility: ResultVisibility;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  options: PollOption[];
  totalVotesCast: number;
  merkleRoot: string;
  contractAddress: string;
  createdAt: string;
}

export interface Voter {
  id: string;
  studentId: string; // e.g. "STU-2026-8819"
  fullName: string;
  department: string;
  year: number;
  email: string;
  studentCardHash: string; // Keccak-256 hash of student credential
  status: VoterStatus;
  votedPolls: number[]; // Set of poll IDs participant has voted on
}

export interface VoteReceipt {
  receiptHash: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  pollId: number;
  pollTitle: string;
  optionId: number;
  optionLabel: string;
  nullifierHash: string;
  merkleProof: string[];
  merkleRoot: string;
  signature: string;
  verifiedOnChain: boolean;
}

export interface Block {
  blockNumber: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  transactionsCount: number;
  merkleRoot: string;
  gasUsed: number;
  miner: string;
  txHashes: string[];
  pollId?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType:
    | 'POLL_CREATED'
    | 'VOTER_AUTHENTICATED'
    | 'NULLIFIER_COMMITTED'
    | 'BALLOT_MINED'
    | 'REPEAT_VOTE_BLOCKED'
    | 'TIMING_INVARIANT_VIOLATION'
    | 'UNAUTHORIZED_ACCESS_BLOCKED'
    | 'DATABASE_TAMPER_DETECTED'
    | 'MERKLE_ROOT_RECONCILED'
    | 'RECEIPT_INDEPENDENTLY_VERIFIED';
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  actor: string;
  details: string;
  hash: string;
  previousHash: string;
  txHash?: string;
  blockNumber?: number;
  pollId?: number;
}

export interface TestResult {
  name: string;
  category: 'SMART_CONTRACT' | 'DATABASE_CONSTRAINT' | 'CRYPTOGRAPHIC_PROOF' | 'TIMING_INVARIANT';
  passed: boolean;
  durationMs: number;
  details: string;
  evidence: string;
}

export interface SystemStats {
  totalPolls: number;
  activePolls: number;
  totalRegisteredParticipants: number;
  totalVotesRecorded: number;
  blocksMined: number;
  auditChainLength: number;
  integrityStatus: 'SECURE' | 'TAMPER_DETECTED';
}
