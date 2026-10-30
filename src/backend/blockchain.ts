/**
 * VOTEGUARD — Blockchain & Cryptographic Engine for Public Polling
 * Powered by Ethers.js, Keccak-256, and Merkle Proofs
 */

import { ethers } from 'ethers';
import { Block, VoteReceipt, PollOption } from '../lib/types';

// College / Public Election Commission Authority Wallet
export const AUTHORITY_PRIVATE_KEY =
  '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
export const authorityWallet = new ethers.Wallet(AUTHORITY_PRIVATE_KEY);
export const CONTRACT_ADDRESS = '0x8F518D3b584aB2e3F6AcC436852fDE3E2C4D5a99';

// Blockchain In-Memory State
interface BlockchainState {
  currentBlockNumber: number;
  blocks: Block[];
  // pollId => Set of spent nullifiers
  nullifiersSpent: Map<number, Set<string>>;
  receipts: Map<string, VoteReceipt>;
  pollReceiptLeaves: Map<number, string[]>;
  allReceiptLeaves: string[];
  pollMerkleRoots: Map<number, string>;
  globalMerkleRoot: string;
  pollOptionTallies: Map<string, number>; // "pollId:optionId" => count
}

// Compute Merkle Root
export function computeMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return ethers.ZeroHash;
  if (leaves.length === 1) return leaves[0];

  let layer = [...leaves];
  while (layer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        const left = layer[i];
        const right = layer[i + 1];
        const combined =
          left < right
            ? ethers.keccak256(ethers.concat([ethers.getBytes(left), ethers.getBytes(right)]))
            : ethers.keccak256(ethers.concat([ethers.getBytes(right), ethers.getBytes(left)]));
        nextLayer.push(combined);
      } else {
        const left = layer[i];
        const combined = ethers.keccak256(
          ethers.concat([ethers.getBytes(left), ethers.getBytes(left)])
        );
        nextLayer.push(combined);
      }
    }
    layer = nextLayer;
  }
  return layer[0];
}

// Generate Merkle Inclusion Proof
export function generateMerkleProof(leaf: string, leaves: string[]): string[] {
  const proof: string[] = [];
  let index = leaves.indexOf(leaf);
  if (index === -1) return proof;

  let layer = [...leaves];
  while (layer.length > 1) {
    const nextLayer: string[] = [];
    const isRightNode = index % 2 === 1;
    const pairIndex = isRightNode ? index - 1 : index + 1;

    if (pairIndex < layer.length) {
      proof.push(layer[pairIndex]);
    } else {
      proof.push(layer[index]);
    }

    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        const left = layer[i];
        const right = layer[i + 1];
        const combined =
          left < right
            ? ethers.keccak256(ethers.concat([ethers.getBytes(left), ethers.getBytes(right)]))
            : ethers.keccak256(ethers.concat([ethers.getBytes(right), ethers.getBytes(left)]));
        nextLayer.push(combined);
      } else {
        const left = layer[i];
        const combined = ethers.keccak256(
          ethers.concat([ethers.getBytes(left), ethers.getBytes(left)])
        );
        nextLayer.push(combined);
      }
    }

    index = Math.floor(index / 2);
    layer = nextLayer;
  }

  return proof;
}

// Verify Merkle Inclusion Proof
export function verifyMerkleProof(leaf: string, proof: string[], root: string): boolean {
  let computedHash = leaf;
  for (const sibling of proof) {
    if (computedHash < sibling) {
      computedHash = ethers.keccak256(
        ethers.concat([ethers.getBytes(computedHash), ethers.getBytes(sibling)])
      );
    } else {
      computedHash = ethers.keccak256(
        ethers.concat([ethers.getBytes(sibling), ethers.getBytes(computedHash)])
      );
    }
  }
  return computedHash.toLowerCase() === root.toLowerCase();
}

class BlockchainNode {
  public state: BlockchainState;

  constructor() {
    const genesisTime = Math.floor(Date.now() / 1000) - 3600;
    const genesisHash = ethers.keccak256(ethers.toUtf8Bytes('VOTEGUARD_PUBLIC_POLLING_GENESIS_2026'));

    const genesisBlock: Block = {
      blockNumber: 1400,
      hash: genesisHash,
      previousHash: ethers.ZeroHash,
      timestamp: genesisTime,
      transactionsCount: 0,
      merkleRoot: ethers.ZeroHash,
      gasUsed: 21000,
      miner: authorityWallet.address,
      txHashes: [],
    };

    this.state = {
      currentBlockNumber: 1400,
      blocks: [genesisBlock],
      nullifiersSpent: new Map(),
      receipts: new Map(),
      pollReceiptLeaves: new Map(),
      allReceiptLeaves: [],
      pollMerkleRoots: new Map(),
      globalMerkleRoot: ethers.ZeroHash,
      pollOptionTallies: new Map(),
    };
  }

  /**
   * Cast a ballot on a specific poll with EVM Invariants
   */
  public async castPollVoteOnContract(
    pollId: number,
    pollTitle: string,
    nullifierHash: string,
    optionId: number,
    optionLabel: string,
    startTime: number,
    endTime: number
  ): Promise<VoteReceipt> {
    const now = Math.floor(Date.now() / 1000);

    // 1. INVARIANT CHECK: Defined voting start and end times
    if (now < startTime) {
      const err: any = new Error(
        `VOTEGUARD_ERR_POLL_NOT_STARTED: This poll opens at ${new Date(
          startTime * 1000
        ).toLocaleString()}. Submissions before start time are rejected by smart contract.`
      );
      err.code = 'POLL_NOT_STARTED';
      throw err;
    }

    if (now > endTime) {
      const err: any = new Error(
        `VOTEGUARD_ERR_POLL_ENDED: This poll concluded at ${new Date(
          endTime * 1000
        ).toLocaleString()}. Smart contract rejects late submissions.`
      );
      err.code = 'POLL_ENDED';
      throw err;
    }

    // 2. INVARIANT CHECK: Prevention of repeat voting by same participant in this poll
    let spentSet = this.state.nullifiersSpent.get(pollId);
    if (!spentSet) {
      spentSet = new Set<string>();
      this.state.nullifiersSpent.set(pollId, spentSet);
    }

    const normalizedNullifier = nullifierHash.toLowerCase();
    if (spentSet.has(normalizedNullifier)) {
      const err: any = new Error(
        `VOTEGUARD_ERR_REPEAT_VOTE_REJECTED: Cryptographic nullifier ${nullifierHash.slice(
          0,
          10
        )}... has already voted on Poll #${pollId}. Repeat submission blocked by smart contract.`
      );
      err.code = 'REPEAT_VOTE_REJECTED';
      throw err;
    }

    // 3. Mark nullifier spent immediately
    spentSet.add(normalizedNullifier);

    // 4. Increment option tally
    const tallyKey = `${pollId}:${optionId}`;
    const currentTally = this.state.pollOptionTallies.get(tallyKey) || 0;
    this.state.pollOptionTallies.set(tallyKey, currentTally + 1);

    // 5. Mine new block
    this.state.currentBlockNumber += 1;
    const blockNumber = this.state.currentBlockNumber;
    const timestamp = now;

    // 6. Generate deterministic Keccak-256 Receipt Hash and TxHash
    const receiptHash = ethers.keccak256(
      ethers.solidityPacked(
        ['uint256', 'bytes32', 'uint256', 'uint256', 'uint256'],
        [pollId, nullifierHash, optionId, blockNumber, timestamp]
      )
    );

    const txHash = ethers.keccak256(
      ethers.solidityPacked(
        ['bytes32', 'uint256', 'address', 'uint256'],
        [receiptHash, pollId, authorityWallet.address, blockNumber]
      )
    );

    // Sign with authority private key
    const signature = await authorityWallet.signMessage(ethers.getBytes(txHash));

    // 7. Update Merkle tree
    let pollLeaves = this.state.pollReceiptLeaves.get(pollId);
    if (!pollLeaves) {
      pollLeaves = [];
      this.state.pollReceiptLeaves.set(pollId, pollLeaves);
    }
    pollLeaves.push(receiptHash);
    this.state.allReceiptLeaves.push(receiptHash);

    const pollMerkleRoot = computeMerkleRoot(pollLeaves);
    this.state.pollMerkleRoots.set(pollId, pollMerkleRoot);
    this.state.globalMerkleRoot = computeMerkleRoot(this.state.allReceiptLeaves);

    const merkleProof = generateMerkleProof(receiptHash, pollLeaves);

    const receipt: VoteReceipt = {
      receiptHash,
      txHash,
      blockNumber,
      timestamp,
      pollId,
      pollTitle,
      optionId,
      optionLabel,
      nullifierHash,
      merkleProof,
      merkleRoot: pollMerkleRoot,
      signature,
      verifiedOnChain: true,
    };

    this.state.receipts.set(receiptHash.toLowerCase(), receipt);

    // 8. Append Block
    const previousBlock = this.state.blocks[this.state.blocks.length - 1];
    const blockHash = ethers.keccak256(
      ethers.solidityPacked(
        ['uint256', 'bytes32', 'bytes32', 'uint256'],
        [blockNumber, previousBlock.hash, pollMerkleRoot, timestamp]
      )
    );

    const newBlock: Block = {
      blockNumber,
      hash: blockHash,
      previousHash: previousBlock.hash,
      timestamp,
      transactionsCount: 1,
      merkleRoot: pollMerkleRoot,
      gasUsed: 46120,
      miner: authorityWallet.address,
      txHashes: [txHash],
      pollId,
    };

    this.state.blocks.push(newBlock);

    return receipt;
  }

  /**
   * Verify receipt against on-chain records
   */
  public verifyReceiptOnChain(receiptHash: string): {
    exists: boolean;
    receipt?: VoteReceipt;
    merkleValid?: boolean;
  } {
    const r = this.state.receipts.get(receiptHash.toLowerCase());
    if (!r) {
      return { exists: false };
    }

    const pollLeaves = this.state.pollReceiptLeaves.get(r.pollId) || [];
    const proof = generateMerkleProof(r.receiptHash, pollLeaves);
    const root = this.state.pollMerkleRoots.get(r.pollId) || ethers.ZeroHash;
    const isValid = verifyMerkleProof(r.receiptHash, proof, root);

    return {
      exists: true,
      receipt: { ...r, merkleProof: proof, merkleRoot: root },
      merkleValid: isValid,
    };
  }

  /**
   * Reset / reseed for demonstrations
   */
  public resetBlockchain(): void {
    const genesisTime = Math.floor(Date.now() / 1000) - 3600;
    const genesisHash = ethers.keccak256(ethers.toUtf8Bytes('VOTEGUARD_PUBLIC_POLLING_GENESIS_2026'));
    this.state.currentBlockNumber = 1400;
    this.state.blocks = [
      {
        blockNumber: 1400,
        hash: genesisHash,
        previousHash: ethers.ZeroHash,
        timestamp: genesisTime,
        transactionsCount: 0,
        merkleRoot: ethers.ZeroHash,
        gasUsed: 21000,
        miner: authorityWallet.address,
        txHashes: [],
      },
    ];
    this.state.nullifiersSpent.clear();
    this.state.receipts.clear();
    this.state.pollReceiptLeaves.clear();
    this.state.allReceiptLeaves = [];
    this.state.pollMerkleRoots.clear();
    this.state.globalMerkleRoot = ethers.ZeroHash;
    this.state.pollOptionTallies.clear();
  }
}

export const blockchainNode = new BlockchainNode();
