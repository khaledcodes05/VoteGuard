/**
 * VOTEGUARD — Database Layer for Blockchain-Based Public Polling System
 * Enforcing Unique Constraints, Timed Lifecycles, and Cryptographic Hash Chains.
 */

import { ethers } from 'ethers';
import { Voter, Poll, PollOption, AuditLog, VoteReceipt } from '../lib/types';
import { blockchainNode, CONTRACT_ADDRESS } from './blockchain';

class DatabaseService {
  private voters: Map<string, Voter> = new Map();
  private polls: Map<number, Poll> = new Map();
  private auditLogs: AuditLog[] = [];
  private receipts: Map<string, VoteReceipt> = new Map();
  private lastAuditHash: string = ethers.ZeroHash;
  private nextPollId = 1;

  constructor() {
    this.seed();
  }

  /**
   * Seed standard mock polls and eligible students
   */
  public seed(): void {
    this.voters.clear();
    this.polls.clear();
    this.auditLogs = [];
    this.receipts.clear();
    this.lastAuditHash = ethers.ZeroHash;
    this.nextPollId = 1;
    blockchainNode.resetBlockchain();

    const now = Math.floor(Date.now() / 1000);

    // 1. Seed Real-World Campus & Public Polls
    const initialPolls: Array<{
      title: string;
      description: string;
      category: Poll['category'];
      creator: string;
      startTime: number;
      endTime: number;
      resultVisibility: Poll['resultVisibility'];
      options: string[];
    }> = [
      {
        title: '24/7 AI Lab & High-Performance Compute Cluster Access',
        description:
          'Student survey on proposed round-the-clock lab access for deep learning capstone teams, security hardware testing, and robotics simulators.',
        category: 'Campus Improvement',
        creator: 'Student Academic Council',
        startTime: now - 3600 * 4,
        endTime: now + 3600 * 48, // 2 days remaining
        resultVisibility: 'LIVE',
        options: [
          '24/7 Unrestricted Student Access via RFID Card',
          'Reserve-Only Scheduled Timed Slots via Campus Portal',
          'Extend Hours to 2:00 AM Daily with Night Shuttle',
          'Prioritize Senior Capstone & Funded Research Teams',
        ],
      },
      {
        title: 'Annual College Tech Fest 2026: Flagship Hackathon Focus',
        description:
          'Vote on the main theme and corporate sponsor track for the 48-hour national collegiate hackathon.',
        category: 'Tech & Innovation',
        creator: 'Department of Computer Science & Robotics',
        startTime: now - 3600 * 8,
        endTime: now + 3600 * 72, // 3 days remaining
        resultVisibility: 'LIVE',
        options: [
          'Autonomous AI Agents & Decentralized Zero-Knowledge Protocols',
          'Green Tech, Clean Energy Grid Simulators & EV Systems',
          'Cybersecurity Defense, Post-Quantum Cryptography & Red-Teaming',
          'Spatial Computing, AR/VR Digital Twins & Medical Robotics',
        ],
      },
      {
        title: 'Campus Dining & Cafeteria Modernization Plan',
        description:
          'Choose the preferred food service model and nutritional improvements for the central campus student union.',
        category: 'Facilities & Dining',
        creator: 'Campus Welfare Committee',
        startTime: now - 3600 * 12,
        endTime: now + 3600 * 24, // 1 day remaining
        resultVisibility: 'LIVE',
        options: [
          'Subsidized Organic Meal Plan & Farm-to-Table Salad Bar',
          'Multi-Cuisine Food Court with Express Mobile Ordering',
          'Extended Midnight Diner Hours & Specialty Coffee Roastery',
        ],
      },
      {
        title: 'Continuous Peer Evaluation & Milestone Grading Reform',
        description:
          'Confidential academic preference survey on shifting from heavy midterm exams to continuous weekly project milestone evaluations.',
        category: 'Academic Surveys',
        creator: 'Faculty Senate & Student Representatives',
        startTime: now - 3600 * 24,
        endTime: now + 3600 * 96,
        resultVisibility: 'POST_ELECTION', // Results verified after conclusion
        options: [
          '50% Continuous Weekly Milestones + 50% Final Demo',
          'Keep Traditional Midterm (30%) + Final Exam (70%)',
          'Flexible Grading Contract: Choose Exam or Project Route',
        ],
      },
      {
        title: 'Green Campus Mobility: Electric Bicycle Share Expansion',
        description:
          'Historical student survey on allocating green fund budget to dockless campus e-bikes.',
        category: 'Campus Improvement',
        creator: 'Sustainability Office',
        startTime: now - 3600 * 72,
        endTime: now - 3600 * 2, // Closed poll
        resultVisibility: 'LIVE',
        options: [
          'Deploy 100 Electric Scooters with Dedicated Solar Hubs',
          'Upgrade Pedestrian Walkways and Shaded Bicycle Lanes',
          'Introduce On-Demand Zero-Emission Autonomous Shuttles',
        ],
      },
    ];

    for (const p of initialPolls) {
      const pollId = this.nextPollId++;
      const pollOptions: PollOption[] = p.options.map((label, idx) => ({
        id: idx + 1,
        label,
        voteCount: 0,
      }));

      const pollStatus: Poll['status'] =
        now < p.startTime ? 'UPCOMING' : now > p.endTime ? 'CLOSED' : 'ACTIVE';

      this.polls.set(pollId, {
        id: pollId,
        title: p.title,
        description: p.description,
        category: p.category,
        creator: p.creator,
        startTime: p.startTime,
        endTime: p.endTime,
        resultVisibility: p.resultVisibility,
        status: pollStatus,
        options: pollOptions,
        totalVotesCast: 0,
        merkleRoot: ethers.ZeroHash,
        contractAddress: CONTRACT_ADDRESS,
        createdAt: new Date(p.startTime * 1000).toISOString(),
      });
    }

    // 2. Seed Registered Eligible Students / Participants
    const initialVoters: Voter[] = [
      {
        id: 'vtr-101',
        studentId: 'STU-2026-8819',
        fullName: 'Maya Rostova',
        department: 'Computer Science & Engineering',
        year: 3,
        email: 'maya.rostova@university.edu',
        studentCardHash: ethers.keccak256(ethers.toUtf8Bytes('STU_CARD_8819')),
        status: 'VERIFIED',
        votedPolls: [],
      },
      {
        id: 'vtr-102',
        studentId: 'STU-2026-4421',
        fullName: 'Marcus Chen',
        department: 'Electrical & Robotics Engineering',
        year: 2,
        email: 'marcus.chen@university.edu',
        studentCardHash: ethers.keccak256(ethers.toUtf8Bytes('STU_CARD_4421')),
        status: 'VERIFIED',
        votedPolls: [],
      },
      {
        id: 'vtr-103',
        studentId: 'STU-2026-9052',
        fullName: 'Sarah Jenkins',
        department: 'AI & Data Science',
        year: 4,
        email: 'sarah.jenkins@university.edu',
        studentCardHash: ethers.keccak256(ethers.toUtf8Bytes('STU_CARD_9052')),
        status: 'VERIFIED',
        votedPolls: [],
      },
      {
        id: 'vtr-104',
        studentId: 'STU-2026-3104',
        fullName: 'Jonathan Patel',
        department: 'Mechanical Engineering',
        year: 1,
        email: 'jonathan.patel@university.edu',
        studentCardHash: ethers.keccak256(ethers.toUtf8Bytes('STU_CARD_3104')),
        status: 'PENDING_CLEARANCE', // Ineligible: clearance hold
        votedPolls: [],
      },
      {
        id: 'vtr-105',
        studentId: 'STU-2026-1105',
        fullName: 'Alexander Vance',
        department: 'Civil Engineering',
        year: 3,
        email: 'alexander.vance@university.edu',
        studentCardHash: ethers.keccak256(ethers.toUtf8Bytes('STU_CARD_1105')),
        status: 'SUSPENDED', // Ineligible: academic suspension
        votedPolls: [],
      },
      {
        id: 'vtr-106',
        studentId: 'STU-2026-7733',
        fullName: 'Tanvi Deshmukh',
        department: 'Biotechnology',
        year: 2,
        email: 'tanvi.deshmukh@university.edu',
        studentCardHash: ethers.keccak256(ethers.toUtf8Bytes('STU_CARD_7733')),
        status: 'VERIFIED',
        votedPolls: [],
      },
    ];

    for (const v of initialVoters) {
      this.voters.set(v.studentId.toUpperCase(), v);
    }

    this.appendAuditLog(
      'POLL_CREATED',
      'SUCCESS',
      'SystemGenesis',
      'VOTEGUARD Blockchain Public Polling Engine initialized with 5 campus polls and cryptographic registries.'
    );
  }

  /**
   * Append to the tamper-evident cryptographic hash chain of audit logs
   */
  public appendAuditLog(
    eventType: AuditLog['eventType'],
    severity: AuditLog['severity'],
    actor: string,
    details: string,
    txHash?: string,
    blockNumber?: number,
    pollId?: number
  ): AuditLog {
    const timestamp = new Date().toISOString();
    const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const logPayload = `${this.lastAuditHash}:${id}:${timestamp}:${eventType}:${actor}:${details}:${txHash || ''}:${pollId || ''}`;
    const hash = ethers.keccak256(ethers.toUtf8Bytes(logPayload));

    const log: AuditLog = {
      id,
      timestamp,
      eventType,
      severity,
      actor,
      details,
      hash,
      previousHash: this.lastAuditHash,
      txHash,
      blockNumber,
      pollId,
    };

    this.lastAuditHash = hash;
    this.auditLogs.unshift(log); // Most recent first
    return log;
  }

  public getPolls(): Poll[] {
    const now = Math.floor(Date.now() / 1000);
    return Array.from(this.polls.values()).map((p) => {
      const currentStatus: Poll['status'] =
        now < p.startTime ? 'UPCOMING' : now > p.endTime ? 'CLOSED' : 'ACTIVE';
      const onChainRoot = blockchainNode.state.pollMerkleRoots.get(p.id) || ethers.ZeroHash;
      return {
        ...p,
        status: currentStatus,
        merkleRoot: onChainRoot,
      };
    });
  }

  public getPollById(id: number): Poll | undefined {
    return this.polls.get(id);
  }

  public getVoters(): Voter[] {
    return Array.from(this.voters.values());
  }

  public getVoterById(identifier: string): Voter | undefined {
    const key = identifier.toUpperCase().trim();
    if (this.voters.has(key)) return this.voters.get(key);
    return Array.from(this.voters.values()).find(
      (v) => v.studentId.toUpperCase() === key || v.id.toUpperCase() === key
    );
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getReceiptByHash(hash: string): VoteReceipt | undefined {
    return this.receipts.get(hash.toLowerCase());
  }

  /**
   * Create a new poll with multiple options and defined start/end times
   */
  public createPoll(data: {
    title: string;
    description: string;
    category: Poll['category'];
    creator: string;
    startTime: number;
    endTime: number;
    resultVisibility: Poll['resultVisibility'];
    options: string[];
  }): Poll {
    if (!data.title || data.title.trim().length < 5) {
      throw new Error('Poll title must be at least 5 characters.');
    }
    if (!data.options || data.options.length < 2) {
      throw new Error('A poll must have at least 2 options.');
    }
    if (data.endTime <= data.startTime) {
      throw new Error('Poll end time must be after start time.');
    }

    const pollId = this.nextPollId++;
    const now = Math.floor(Date.now() / 1000);

    const pollOptions: PollOption[] = data.options.map((label, idx) => ({
      id: idx + 1,
      label: label.trim(),
      voteCount: 0,
    }));

    const status: Poll['status'] =
      now < data.startTime ? 'UPCOMING' : now > data.endTime ? 'CLOSED' : 'ACTIVE';

    const newPoll: Poll = {
      id: pollId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'Campus Improvement',
      creator: data.creator.trim() || 'Campus Committee',
      startTime: data.startTime,
      endTime: data.endTime,
      resultVisibility: data.resultVisibility || 'LIVE',
      status,
      options: pollOptions,
      totalVotesCast: 0,
      merkleRoot: ethers.ZeroHash,
      contractAddress: CONTRACT_ADDRESS,
      createdAt: new Date().toISOString(),
    };

    this.polls.set(pollId, newPoll);

    this.appendAuditLog(
      'POLL_CREATED',
      'INFO',
      newPoll.creator,
      `New poll created: "${newPoll.title}" with ${newPoll.options.length} options. Window: ${new Date(
        newPoll.startTime * 1000
      ).toLocaleString()} to ${new Date(newPoll.endTime * 1000).toLocaleString()}`,
      undefined,
      undefined,
      pollId
    );

    return newPoll;
  }

  /**
   * Authorize participant for a specific poll and generate a one-way cryptographic nullifier
   */
  public generatePollNullifier(
    studentIdentifier: string,
    pollId: number
  ): {
    commitmentToken: string;
    nullifierHash: string;
    voter: Voter;
    poll: Poll;
  } {
    const voter = this.getVoterById(studentIdentifier);
    if (!voter) {
      this.appendAuditLog(
        'UNAUTHORIZED_ACCESS_BLOCKED',
        'ALERT',
        studentIdentifier,
        `Rejection: Participant '${studentIdentifier}' not found in registered database.`,
        undefined,
        undefined,
        pollId
      );
      throw new Error(`Participant ID '${studentIdentifier}' is not found in the verified directory.`);
    }

    if (voter.status !== 'VERIFIED') {
      this.appendAuditLog(
        'UNAUTHORIZED_ACCESS_BLOCKED',
        'ALERT',
        studentIdentifier,
        `Rejection: Participant ${studentIdentifier} has status '${voter.status}' (Must be VERIFIED)`,
        undefined,
        undefined,
        pollId
      );
      throw new Error(
        `Participant ${studentIdentifier} status is ${voter.status}. Voting privileges require verified registration.`
      );
    }

    const poll = this.getPollById(pollId);
    if (!poll) {
      throw new Error(`Poll #${pollId} does not exist.`);
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < poll.startTime) {
      this.appendAuditLog(
        'TIMING_INVARIANT_VIOLATION',
        'WARNING',
        studentIdentifier,
        `Rejection: Poll #${pollId} has not opened yet. Starts: ${new Date(
          poll.startTime * 1000
        ).toLocaleString()}`,
        undefined,
        undefined,
        pollId
      );
      throw new Error(`Poll has not opened yet. Voting opens on ${new Date(poll.startTime * 1000).toLocaleString()}.`);
    }

    if (now > poll.endTime) {
      this.appendAuditLog(
        'TIMING_INVARIANT_VIOLATION',
        'WARNING',
        studentIdentifier,
        `Rejection: Poll #${pollId} has ended. Closed on ${new Date(poll.endTime * 1000).toLocaleString()}`,
        undefined,
        undefined,
        pollId
      );
      throw new Error(`This poll is closed. Voting concluded on ${new Date(poll.endTime * 1000).toLocaleString()}.`);
    }

    // Check repeat vote in database
    if (voter.votedPolls.includes(pollId)) {
      this.appendAuditLog(
        'REPEAT_VOTE_BLOCKED',
        'WARNING',
        studentIdentifier,
        `Rejection: Participant ${studentIdentifier} has already submitted a ballot for Poll #${pollId}.`,
        undefined,
        undefined,
        pollId
      );
      throw new Error(`REPEAT_VOTE_BLOCKED: You have already submitted a ballot for this poll.`);
    }

    // Cryptographic Blind Nullifier per (Participant, PollId):
    // Nullifier = keccak256(studentCardHash + pollId + secretEntropy)
    const secretEntropy = ethers.hexlify(ethers.randomBytes(16));
    const nullifierHash = ethers.keccak256(
      ethers.solidityPacked(
        ['bytes32', 'uint256', 'bytes'],
        [voter.studentCardHash, pollId, secretEntropy]
      )
    );

    const commitmentToken = ethers.keccak256(
      ethers.toUtf8Bytes(`${studentIdentifier}-${pollId}-${Date.now()}`)
    );

    this.appendAuditLog(
      'NULLIFIER_COMMITTED',
      'INFO',
      studentIdentifier,
      `Participant authorized for Poll #${pollId}. One-way cryptographic nullifier derived. Choice decoupled from identity.`,
      undefined,
      undefined,
      pollId
    );

    return { commitmentToken, nullifierHash, voter, poll };
  }

  /**
   * Cast a vote into a poll with ACID guarantees and blockchain synchronization
   */
  public async executePollVote(
    studentIdentifier: string,
    pollId: number,
    optionId: number,
    nullifierHash: string
  ): Promise<VoteReceipt> {
    const voter = this.getVoterById(studentIdentifier);
    if (!voter) throw new Error(`Participant '${studentIdentifier}' not found.`);

    const poll = this.getPollById(pollId);
    if (!poll) throw new Error(`Poll #${pollId} not found.`);

    const option = poll.options.find((o) => o.id === optionId);
    if (!option) throw new Error(`Option #${optionId} does not exist in Poll #${pollId}.`);

    // 1. DATABASE CONSTRAINT CHECK
    if (voter.votedPolls.includes(pollId)) {
      this.appendAuditLog(
        'REPEAT_VOTE_BLOCKED',
        'ALERT',
        studentIdentifier,
        `SECURITY VIOLATION: Database unique constraint prevented repeat vote by ${studentIdentifier} on Poll #${pollId}.`,
        undefined,
        undefined,
        pollId
      );
      const err: any = new Error(
        `DB_REPEAT_VOTE_PREVENTED: Participant '${studentIdentifier}' has already voted on Poll #${pollId}.`
      );
      err.code = 'REPEAT_VOTE_DB';
      throw err;
    }

    // 2. SMART CONTRACT INVARIANT CHECK & BLOCK MINING
    let receipt: VoteReceipt;
    try {
      receipt = await blockchainNode.castPollVoteOnContract(
        pollId,
        poll.title,
        nullifierHash,
        optionId,
        option.label,
        poll.startTime,
        poll.endTime
      );
    } catch (contractErr: any) {
      this.appendAuditLog(
        'REPEAT_VOTE_BLOCKED',
        'ALERT',
        studentIdentifier,
        `Smart contract reverted transaction: ${contractErr.message}`,
        undefined,
        undefined,
        pollId
      );
      throw contractErr;
    }

    // 3. DATABASE STATE UPDATE (TRANSACTION ATOMICITY)
    voter.votedPolls.push(pollId);
    option.voteCount++;
    poll.totalVotesCast++;
    poll.merkleRoot = receipt.merkleRoot;

    this.receipts.set(receipt.receiptHash.toLowerCase(), receipt);

    // 4. AUDIT LOGGING
    this.appendAuditLog(
      'BALLOT_MINED',
      'SUCCESS',
      `Nullifier:${nullifierHash.slice(0, 10)}...`,
      `Vote for "${option.label}" in Poll #${pollId} mined in Block #${receipt.blockNumber}. TxHash: ${receipt.txHash.slice(
        0,
        12
      )}...`,
      receipt.txHash,
      receipt.blockNumber,
      pollId
    );

    return receipt;
  }

  /**
   * Tamper Simulation for Evaluators: Direct write to PostgreSQL table without blockchain transaction.
   */
  public tamperDatabaseOption(pollId: number, optionId: number, forgedDelta: number): {
    tampered: boolean;
    poll: Poll;
    option: PollOption;
    message: string;
  } {
    const poll = this.getPollById(pollId);
    if (!poll) throw new Error('Poll not found');

    const option = poll.options.find((o) => o.id === optionId);
    if (!option) throw new Error('Option not found');

    option.voteCount += forgedDelta;
    poll.totalVotesCast += forgedDelta;

    this.appendAuditLog(
      'DATABASE_TAMPER_DETECTED',
      'ALERT',
      'RogueAdmin_SQL_Inject',
      `UNAUTHORIZED MODIFICATION: Poll #${pollId} option "${option.label}" count forged by ${
        forgedDelta > 0 ? '+' : ''
      }${forgedDelta} votes directly in PostgreSQL database table without a valid blockchain transaction!`,
      undefined,
      undefined,
      pollId
    );

    return {
      tampered: true,
      poll,
      option,
      message: `Database forged: Option "${option.label}" in Poll #${pollId} now shows ${option.voteCount} votes in DB. Blockchain audit reconciliation will expose this!`,
    };
  }

  /**
   * Database-Blockchain Integrity Reconciliation
   */
  public checkIntegrity(): {
    isSecure: boolean;
    dbTotal: number;
    blockchainTotal: number;
    discrepancies: string[];
    pollsAudit: Array<{
      pollId: number;
      title: string;
      dbVotes: number;
      chainVotes: number;
      isMatch: boolean;
    }>;
  } {
    const discrepancies: string[] = [];
    let dbTotal = 0;
    const blockchainTotal = blockchainNode.state.allReceiptLeaves.length;
    const pollsAudit: Array<{
      pollId: number;
      title: string;
      dbVotes: number;
      chainVotes: number;
      isMatch: boolean;
    }> = [];

    for (const poll of this.polls.values()) {
      let pollDbVotes = 0;
      let pollChainVotes = 0;

      for (const opt of poll.options) {
        pollDbVotes += opt.voteCount;
        const tallyKey = `${poll.id}:${opt.id}`;
        const chainTally = blockchainNode.state.pollOptionTallies.get(tallyKey) || 0;
        pollChainVotes += chainTally;

        if (opt.voteCount !== chainTally) {
          discrepancies.push(
            `Poll #${poll.id} ("${poll.title}") Option "${opt.label}": PostgreSQL shows ${opt.voteCount} votes, but Smart Contract recorded ${chainTally} votes.`
          );
        }
      }

      dbTotal += pollDbVotes;
      const isMatch = pollDbVotes === pollChainVotes;
      pollsAudit.push({
        pollId: poll.id,
        title: poll.title,
        dbVotes: pollDbVotes,
        chainVotes: pollChainVotes,
        isMatch,
      });
    }

    const isSecure = discrepancies.length === 0 && dbTotal === blockchainTotal;

    if (!isSecure) {
      this.appendAuditLog(
        'DATABASE_TAMPER_DETECTED',
        'ALERT',
        'AuditorNode',
        `CRYPTOGRAPHIC AUDIT FAILED: Discrepancies detected between PostgreSQL DB and Smart Contract Ledger!`
      );
    } else {
      this.appendAuditLog(
        'MERKLE_ROOT_RECONCILED',
        'SUCCESS',
        'AuditorNode',
        `Audit verified: Database tallies (${dbTotal}) exactly match Blockchain state (${blockchainTotal}) across all polls.`
      );
    }

    return {
      isSecure,
      dbTotal,
      blockchainTotal,
      discrepancies,
      pollsAudit,
    };
  }

  /**
   * Restore database truth from immutable blockchain receipts
   */
  public restoreFromBlockchain(): { restored: boolean; message: string } {
    for (const poll of this.polls.values()) {
      let pollTotal = 0;
      for (const opt of poll.options) {
        const tallyKey = `${poll.id}:${opt.id}`;
        const chainCount = blockchainNode.state.pollOptionTallies.get(tallyKey) || 0;
        opt.voteCount = chainCount;
        pollTotal += chainCount;
      }
      poll.totalVotesCast = pollTotal;
    }

    this.appendAuditLog(
      'MERKLE_ROOT_RECONCILED',
      'SUCCESS',
      'AuditorNode',
      'PostgreSQL state successfully restored to authoritative Blockchain ledger truth.'
    );

    return {
      restored: true,
      message: 'PostgreSQL database records reconciled and restored from immutable smart contract ledger.',
    };
  }
}

export const db = new DatabaseService();
