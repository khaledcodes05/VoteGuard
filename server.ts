/**
 * VOTEGUARD — Production Full-Stack Server
 * Express Backend + Vite Middleware (Dev) / Static Dist (Prod)
 * Blockchain-Based Public Polling & Campus Survey System
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/backend/database';
import { blockchainNode, CONTRACT_ADDRESS, authorityWallet } from './src/backend/blockchain';
import { runAIForensicAudit } from './src/backend/aiAudit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API: System Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'VOTEGUARD_POLLING',
    version: '2026.4.0',
    type: 'Blockchain-Based Public Polling System',
    blockHeight: blockchainNode.state.currentBlockNumber,
    timestamp: new Date().toISOString(),
  });
});

// API: Overall Polling System Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const polls = db.getPolls();
  const integrity = db.checkIntegrity();
  res.json({
    stats: {
      totalPolls: polls.length,
      activePolls: polls.filter((p) => p.status === 'ACTIVE').length,
      totalRegisteredParticipants: db.getVoters().length,
      totalVotesRecorded: integrity.blockchainTotal,
      blocksMined: blockchainNode.state.blocks.length,
      auditChainLength: db.getAuditLogs().length,
      contractAddress: CONTRACT_ADDRESS,
      authorityAddress: authorityWallet.address,
      integrityStatus: integrity.isSecure ? 'SECURE' : 'TAMPER_DETECTED',
    },
  });
});

// API: Get All Polls
app.get('/api/polls', (req: Request, res: Response) => {
  const polls = db.getPolls();
  res.json({ polls });
});

// API: Get Single Poll
app.get('/api/polls/:id', (req: Request, res: Response) => {
  const poll = db.getPollById(Number(req.params.id));
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found.' });
  }
  res.json({ poll });
});

// API: Create Poll with Multiple Options & Defined Start/End Times
app.post('/api/polls', (req: Request, res: Response) => {
  try {
    const { title, description, category, creator, startTime, endTime, resultVisibility, options } =
      req.body;

    const newPoll = db.createPoll({
      title,
      description,
      category,
      creator,
      startTime: Number(startTime),
      endTime: Number(endTime),
      resultVisibility,
      options,
    });

    res.status(201).json({ success: true, poll: newPoll });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// API: Authorize Participant for Poll & Generate Nullifier
app.post('/api/polls/:id/authorize', (req: Request, res: Response) => {
  try {
    const pollId = Number(req.params.id);
    const studentIdentifier =
      req.body.studentId ||
      req.body.registrationNumber ||
      req.body.rollNumber ||
      req.body.voterId;

    if (!studentIdentifier) {
      return res.status(400).json({ error: 'Participant ID or Student Roll Number is required.' });
    }

    const result = db.generatePollNullifier(studentIdentifier, pollId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message, code: err.code || 'AUTHORIZATION_FAILED' });
  }
});

// API: Cast Ballot into Poll
app.post('/api/polls/:id/vote', async (req: Request, res: Response) => {
  try {
    const pollId = Number(req.params.id);
    const studentIdentifier =
      req.body.studentId ||
      req.body.registrationNumber ||
      req.body.rollNumber ||
      req.body.voterId;
    const { optionId, nullifierHash } = req.body;

    if (!studentIdentifier || !optionId || !nullifierHash) {
      return res.status(400).json({
        error: 'Missing required parameters (studentId, optionId, nullifierHash).',
      });
    }

    const receipt = await db.executePollVote(
      studentIdentifier,
      pollId,
      Number(optionId),
      nullifierHash
    );

    res.json({
      success: true,
      message: 'Vote cryptographically mined and recorded on blockchain!',
      receipt,
    });
  } catch (err: any) {
    const statusCode =
      err.code === 'REPEAT_VOTE_REJECTED' || err.code === 'REPEAT_VOTE_DB' ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      error: err.message,
      code: err.code || 'VOTE_FAILED',
    });
  }
});

// API: Voter Directory
app.get('/api/voters', (req: Request, res: Response) => {
  res.json({ voters: db.getVoters() });
});

// API: Audit Logs
app.get('/api/audit/logs', (req: Request, res: Response) => {
  res.json({ logs: db.getAuditLogs() });
});

// API: Blockchain Blocks & Explorer
app.get('/api/audit/blocks', (req: Request, res: Response) => {
  const blocks = blockchainNode.state.blocks.slice(-25).reverse();
  res.json({
    blocks,
    currentBlockNumber: blockchainNode.state.currentBlockNumber,
    globalMerkleRoot: blockchainNode.state.globalMerkleRoot,
    totalReceipts: blockchainNode.state.allReceiptLeaves.length,
    contractAddress: CONTRACT_ADDRESS,
  });
});

// API: Independent Receipt Verifier
app.get('/api/audit/verify-receipt/:receiptHash', (req: Request, res: Response) => {
  const { receiptHash } = req.params;
  const verification = blockchainNode.verifyReceiptOnChain(receiptHash);
  if (!verification.exists) {
    return res.status(404).json({
      verified: false,
      message: 'Receipt hash not found in blockchain transaction registry.',
    });
  }

  res.json({
    verified: true,
    merkleValid: verification.merkleValid,
    receipt: verification.receipt,
    contractAddress: CONTRACT_ADDRESS,
    blockNumber: verification.receipt?.blockNumber,
    timestamp: verification.receipt?.timestamp,
  });
});

// API: Tamper Simulation for Evaluators
app.post('/api/security/tamper-db', (req: Request, res: Response) => {
  try {
    const { pollId, optionId, forgedDelta } = req.body;
    const result = db.tamperDatabaseOption(
      Number(pollId || 1),
      Number(optionId || 1),
      Number(forgedDelta || 50)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// API: Security Restore DB from blockchain
app.post('/api/security/restore-db', (req: Request, res: Response) => {
  const result = db.restoreFromBlockchain();
  res.json(result);
});

// API: Integrity Status
app.get('/api/security/integrity', (req: Request, res: Response) => {
  const result = db.checkIntegrity();
  res.json(result);
});

// API: AI Forensic Audit (Gemini)
app.post('/api/ai/forensic-audit', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const report = await runAIForensicAudit(query);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'AI Forensic Audit failed: ' + err.message });
  }
});

// API: System Reset for Demo
app.post('/api/system/reset', (req: Request, res: Response) => {
  db.seed();
  res.json({ success: true, message: 'VOTEGUARD database and blockchain reset to clean seed.' });
});

// FRONTEND INTEGRATION
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VOTEGUARD] Server live at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VOTEGUARD server:', err);
});
