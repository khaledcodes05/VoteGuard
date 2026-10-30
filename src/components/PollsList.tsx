/**
 * VOTEGUARD — Public & Campus Polls List & Interactive Voting Booth
 */

import React, { useState } from 'react';
import {
  Vote,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Poll, PollOption, VoteReceipt } from '../lib/types';

interface PollsListProps {
  polls: Poll[];
  onVoteSuccess: (receipt: VoteReceipt) => void;
  onNavigateToAuditor: (receiptHash: string) => void;
  onOpenCreatePoll: () => void;
}

export const PollsList: React.FC<PollsListProps> = ({
  polls,
  onVoteSuccess,
  onNavigateToAuditor,
  onOpenCreatePoll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePollVoting, setActivePollVoting] = useState<number | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('STU-2026-8819');
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<{ pollId: number; message: string } | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<VoteReceipt | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [expandedResultsPollId, setExpandedResultsPollId] = useState<number | null>(null);

  // Quick Preset demo voters
  const demoVoters = [
    { id: 'STU-2026-8819', label: 'STU-2026-8819 (Maya - CS)', tag: 'Verified' },
    { id: 'STU-2026-4421', label: 'STU-2026-4421 (Marcus - ECE)', tag: 'Verified' },
    { id: 'STU-2026-3104', label: 'STU-2026-3104 (Jonathan - Mech)', tag: 'Clearance Hold' },
    { id: 'STU-2026-1105', label: 'STU-2026-1105 (Alexander - Civil)', tag: 'Suspended' },
  ];

  const categories = [
    'ALL',
    'Campus Improvement',
    'Tech & Innovation',
    'Facilities & Dining',
    'Academic Surveys',
  ];

  const filteredPolls =
    selectedCategory === 'ALL'
      ? polls
      : polls.filter((p) => p.category === selectedCategory);

  const handleCastVote = async (poll: Poll) => {
    if (!studentIdInput.trim()) {
      setActionError({ pollId: poll.id, message: 'Please enter a Student ID or Roll Number.' });
      return;
    }
    if (!selectedOptionId) {
      setActionError({ pollId: poll.id, message: 'Please select an option before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      // Step 1: Authorize and acquire nullifier
      const authRes = await fetch(`/api/polls/${poll.id}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentIdInput.trim() }),
      });
      const authData = await authRes.json();

      if (!authRes.ok) {
        throw new Error(authData.error || 'Authorization failed.');
      }

      // Step 2: Cast vote with one-way nullifier
      const voteRes = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentIdInput.trim(),
          optionId: selectedOptionId,
          nullifierHash: authData.nullifierHash,
        }),
      });
      const voteData = await voteRes.json();

      if (!voteRes.ok) {
        throw new Error(voteData.error || 'Transaction failed on blockchain.');
      }

      setActiveReceipt(voteData.receipt);
      onVoteSuccess(voteData.receipt);
      setActivePollVoting(null);
      setSelectedOptionId(null);

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setActionError({ pollId: poll.id, message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatRemainingTime = (endTime: number) => {
    const diff = endTime - Math.floor(Date.now() / 1000);
    if (diff <= 0) return 'Concluded';
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    const mins = Math.floor(diff / 60);
    return `${mins} min${mins > 1 ? 's' : ''} left`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Category Filter Bar & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Campus Surveys & Public Polls</h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose an active poll below to cast an anonymous ballot recorded on the blockchain.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RECEIPT MODAL BANNER (If vote just succeeded) */}
      {activeReceipt && (
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Vote Mined & Sealed on Blockchain!
                </h3>
                <p className="text-xs text-slate-400">
                  Recorded in Block #{activeReceipt.blockNumber} for poll: "{activeReceipt.pollTitle}"
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveReceipt(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1 rounded bg-slate-800"
            >
              Dismiss
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500">Option Selected:</span>
              <span className="text-white font-bold">{activeReceipt.optionLabel}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-slate-800/80 pt-2">
              <span className="text-slate-500">Receipt Hash (Keccak-256):</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 break-all">{activeReceipt.receiptHash}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeReceipt.receiptHash)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Copy Receipt Hash"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-slate-800/80 pt-2">
              <span className="text-slate-500">Transaction Hash:</span>
              <span className="text-cyan-400 break-all">{activeReceipt.txHash}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigateToAuditor(activeReceipt.receiptHash)}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Verify Receipt in Auditor Suite</span>
            </button>
            <span className="text-xs text-slate-400">
              {copiedHash ? '✓ Copied to clipboard!' : 'Keep this receipt to verify independent inclusion.'}
            </span>
          </div>
        </div>
      )}

      {/* POLLS GRID */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPolls.map((poll) => {
          const isOpen = poll.status === 'ACTIVE';
          const isVoting = activePollVoting === poll.id;
          const isResultsExpanded = expandedResultsPollId === poll.id;

          const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
          const highestOptionVote = Math.max(...poll.options.map((o) => o.voteCount), 0);

          return (
            <div
              key={poll.id}
              className={`rounded-2xl border transition-all p-6 space-y-5 ${
                isOpen
                  ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-90'
              }`}
            >
              {/* Poll Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-cyan-400 font-semibold">{poll.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">By {poll.creator}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">Poll #{poll.id}</span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold flex items-center gap-1.5 ${
                      poll.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                        : poll.status === 'UPCOMING'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      {poll.status === 'ACTIVE'
                        ? `Open · ${formatRemainingTime(poll.endTime)}`
                        : poll.status === 'UPCOMING'
                        ? 'Upcoming'
                        : 'Poll Concluded'}
                    </span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {poll.resultVisibility === 'LIVE' ? 'Live Results' : 'Post-Election Tally'}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">{poll.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {poll.description}
                </p>
              </div>

              {/* Time Window Details */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/70">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Opens: {new Date(poll.startTime * 1000).toLocaleDateString()} at{' '}
                  {new Date(poll.startTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  Closes: {new Date(poll.endTime * 1000).toLocaleDateString()} at{' '}
                  {new Date(poll.endTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Layers className="h-3.5 w-3.5" />
                  {totalVotes} total verified vote{totalVotes === 1 ? '' : 's'}
                </span>
              </div>

              {/* ACTION ROW */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePollVoting(isVoting ? null : poll.id);
                        setActionError(null);
                        setSelectedOptionId(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Vote className="h-3.5 w-3.5" />
                      <span>{isVoting ? 'Close Voting Drawer' : 'Cast Vote on This Poll'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Voting Window Closed
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedResultsPollId(isResultsExpanded ? null : poll.id)
                    }
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{isResultsExpanded ? 'Hide Tallies' : 'View Tallies & Breakdown'}</span>
                    {isResultsExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  {poll.options.length} options configured
                </div>
              </div>

              {/* INLINE VOTING FORM DRAWER */}
              {isVoting && (
                <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-5 space-y-5 animate-fade-in">
                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-cyan-400" />
                      <span>Submit Cryptographic Anonymous Ballot for Poll #{poll.id}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Your participant ID guarantees one vote per person. An uninvertible cryptographic
                      nullifier ensures your ballot choice remains 100% private.
                    </p>
                  </div>

                  {/* Demo Preset Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-400">
                      Quick Demo Participant IDs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {demoVoters.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStudentIdInput(item.id)}
                          className={`px-2.5 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
                            studentIdInput === item.id
                              ? 'border-cyan-500 bg-cyan-950/60 text-cyan-200 shadow-sm'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`ml-1 text-[10px] ${
                              item.tag === 'Verified'
                                ? 'text-emerald-400'
                                : item.tag === 'Clearance Hold'
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            ({item.tag})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Participant ID Input */}
                  <div>
                    <label
                      htmlFor={`studentId-${poll.id}`}
                      className="block text-xs font-medium text-slate-300 mb-1"
                    >
                      Student / Participant ID
                    </label>
                    <input
                      id={`studentId-${poll.id}`}
                      type="text"
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value.toUpperCase())}
                      placeholder="e.g. STU-2026-8819"
                      className="w-full sm:w-80 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Poll Options Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300">
                      Select One Option:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {poll.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                            selectedOptionId === opt.id
                              ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`poll-${poll.id}-opt`}
                            checked={selectedOptionId === opt.id}
                            onChange={() => setSelectedOptionId(opt.id)}
                            className="mt-0.5 text-cyan-500 focus:ring-cyan-400"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-white block">
                              {opt.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Option #{opt.id}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Action Error Banner */}
                  {actionError && actionError.pollId === poll.id && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200 font-mono">
                      <AlertOctagon className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{actionError.message}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCastVote(poll)}
                      disabled={isSubmitting || !selectedOptionId}
                      className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                    >
                      <Vote className="h-3.5 w-3.5" />
                      <span>{isSubmitting ? 'Mining Vote to Block...' : 'Submit Anonymous Ballot'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePollVoting(null)}
                      className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-medium text-xs hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* EXPANDED RESULTS ACCORDION */}
              {isResultsExpanded && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {poll.resultVisibility === 'LIVE'
                          ? 'Live Recorded Tally'
                          : isOpen
                          ? 'Interim Confidential Count (Revealed After Conclusion)'
                          : 'Official Post-Election Final Tally'}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Total: {totalVotes} votes
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {poll.options.map((opt) => {
                      const percentage =
                        totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                      const isLeading = opt.voteCount > 0 && opt.voteCount === highestOptionVote;

                      return (
                        <div key={opt.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-white">
                              {isLeading && <Award className="h-3.5 w-3.5 text-cyan-400" />}
                              <span>{opt.label}</span>
                            </div>
                            <span className="font-mono text-slate-300 tabular-nums font-bold">
                              {percentage}% ({opt.voteCount} votes)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
