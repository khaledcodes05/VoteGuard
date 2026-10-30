/**
 * VOTEGUARD — Create Poll Modal
 * Allows organizers to create multi-option polls with defined time windows.
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Layers, Sparkles } from 'lucide-react';
import { PollCategory, ResultVisibility } from '../lib/types';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onPollCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PollCategory>('Campus Improvement');
  const [creator, setCreator] = useState('Student Council Committee');
  const [durationHours, setDurationHours] = useState('48');
  const [resultVisibility, setResultVisibility] = useState<ResultVisibility>('LIVE');
  const [options, setOptions] = useState<string[]>([
    'Approve Proposed Initiative with Full Budget',
    'Reject and Request Alternative Proposals',
    'Run a 30-Day Pilot in Selected Dormitories/Labs',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a poll title.');
      return;
    }
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (cleanOptions.length < 2) {
      setErrorMsg('A poll must have at least 2 non-empty options.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const now = Math.floor(Date.now() / 1000);
    const duration = Number(durationHours) * 3600;

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          creator,
          startTime: now,
          endTime: now + duration,
          resultVisibility,
          options: cleanOptions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create poll.');
      }

      onPollCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Poll Deployment Wizard
          </span>
          <h2 className="text-xl font-bold text-white">Create New Blockchain Poll</h2>
          <p className="text-xs text-slate-400">
            Define multi-option questions and cryptographic voting time windows.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200 font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Poll Question / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus Library 24-Hour Study Lounge Expansion"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Background & Context</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the context, decision criteria, or budget details..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Category & Creator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PollCategory)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Campus Improvement">Campus Improvement</option>
                <option value="Tech & Innovation">Tech & Innovation</option>
                <option value="Facilities & Dining">Facilities & Dining</option>
                <option value="Academic Surveys">Academic Surveys</option>
                <option value="Student Preferences">Student Preferences</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">Organizer / Committee</label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. Student Council Tech Committee"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Duration & Result Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">
                Poll Duration (Time Window)
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="1">1 Hour (Quick Flash Poll)</option>
                <option value="24">24 Hours (1 Day)</option>
                <option value="48">48 Hours (2 Days - Recommended)</option>
                <option value="72">72 Hours (3 Days)</option>
                <option value="168">7 Days (1 Week)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-200">Result Transparency</label>
              <select
                value={resultVisibility}
                onChange={(e) => setResultVisibility(e.target.value as ResultVisibility)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="LIVE">Live Results (Visible immediately after voting)</option>
                <option value="POST_ELECTION">
                  Post-Election Only (Revealed only after end timestamp)
                </option>
              </select>
            </div>
          </div>

          {/* Multiple Options Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">
                Poll Options (Minimum 2, Maximum 6)
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 w-5 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1} text`}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Deploying to Blockchain...' : 'Deploy Poll on Blockchain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
