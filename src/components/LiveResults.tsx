/**
 * VOTEGUARD — Live & Post-Election Results Dashboard
 * Displays transparent tallies for active and concluded polls.
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  Lock,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Poll } from '../lib/types';

interface LiveResultsProps {
  polls: Poll[];
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigateToAuditor: () => void;
}

export const LiveResults: React.FC<LiveResultsProps> = ({
  polls,
  onRefresh,
  isRefreshing,
  onNavigateToAuditor,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');

  const filtered =
    filter === 'ALL'
      ? polls
      : filter === 'ACTIVE'
      ? polls.filter((p) => p.status === 'ACTIVE')
      : polls.filter((p) => p.status === 'CLOSED');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Live & Post-Election Poll Tallies</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time consensus tallies cryptographically reconciled with smart contract receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'All Polls' : f === 'ACTIVE' ? 'Open Polls' : 'Concluded'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Polls Result Cards */}
      <div className="space-y-6">
        {filtered.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
          const highestVotes = Math.max(...poll.options.map((o) => o.voteCount), 0);
          const isPostElectionSealed = poll.resultVisibility === 'POST_ELECTION' && poll.status === 'ACTIVE';

          return (
            <div
              key={poll.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-6"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-cyan-400">{poll.category}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">Poll #{poll.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{poll.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                    {totalVotes} verified vote{totalVotes === 1 ? '' : 's'}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold ${
                      poll.status === 'ACTIVE'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {poll.status === 'ACTIVE' ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* POST-ELECTION SEALED STATE */}
              {isPostElectionSealed ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">
                      Results Sealed until Voting Window Concludes
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This poll uses a <strong>Post-Election Transparency Protocol</strong> to prevent
                      bandwagon bias. Ballots are securely mined into the blockchain, and the final
                      tally will be revealed publicly when the poll concludes on{' '}
                      <span className="text-amber-300 font-mono">
                        {new Date(poll.endTime * 1000).toLocaleString()}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                /* LIVE / FINAL BREAKDOWN */
                <div className="space-y-4">
                  {poll.options.map((opt) => {
                    const percentage =
                      totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                    const isLeading = opt.voteCount > 0 && opt.voteCount === highestVotes;

                    return (
                      <div
                        key={opt.id}
                        className={`rounded-xl border p-4 transition-all space-y-2 ${
                          isLeading
                            ? 'border-cyan-500/40 bg-slate-900/80 shadow-md'
                            : 'border-slate-800/80 bg-slate-950/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {isLeading && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                                <Award className="h-3 w-3" /> Leading Choice
                              </span>
                            )}
                            <span className="font-semibold text-white">{opt.label}</span>
                          </div>

                          <span className="font-mono text-white font-bold tabular-nums">
                            {percentage}% ({opt.voteCount} vote{opt.voteCount === 1 ? '' : 's'})
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Card Footer: Merkle Root & Explorer Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="truncate">
                    Merkle Root:{' '}
                    {poll.merkleRoot &&
                    poll.merkleRoot !== '0x0000000000000000000000000000000000000000000000000000000000000000'
                      ? `${poll.merkleRoot.slice(0, 16)}...`
                      : 'ZeroRoot'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToAuditor}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Verify Receipts on Blockchain</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
