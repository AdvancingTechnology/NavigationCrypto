"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Signal } from "@/lib/supabase/types";

interface FormData {
  pair: string;
  action: "LONG" | "SHORT";
  entry_price: string;
  take_profit: string;
  stop_loss: string;
  notes: string;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "closed">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    pair: "",
    action: "LONG",
    entry_price: "",
    take_profit: "",
    stop_loss: "",
    notes: "",
  });

  const supabase = createClient();

  // Load signals from database
  const loadSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await (supabase.from('signals') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignals(data || []);
    } catch (err: any) {
      console.error('Error loading signals:', err);
      setError(err.message || 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  };

  // Create new signal
  const handleCreateSignal = async (status: 'draft' | 'active') => {
    try {
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase.from('signals') as any).insert({
        pair: formData.pair,
        action: formData.action,
        entry_price: parseFloat(formData.entry_price),
        take_profit: parseFloat(formData.take_profit),
        stop_loss: parseFloat(formData.stop_loss),
        notes: formData.notes || null,
        status,
        created_by: user.id,
        ai_generated: false,
      });

      if (error) throw error;

      // Reload signals and close modal
      await loadSignals();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating signal:', err);
      setError(err.message || 'Failed to create signal');
    }
  };

  // Update existing signal
  const handleUpdateSignal = async (status: 'draft' | 'active') => {
    if (!editingSignal) return;

    try {
      setError(null);
      const { error } = await (supabase.from('signals') as any)
        .update({
          pair: formData.pair,
          action: formData.action,
          entry_price: parseFloat(formData.entry_price),
          take_profit: parseFloat(formData.take_profit),
          stop_loss: parseFloat(formData.stop_loss),
          notes: formData.notes || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSignal.id);

      if (error) throw error;

      // Reload signals and close modal
      await loadSignals();
      setShowModal(false);
      setEditingSignal(null);
      resetForm();
    } catch (err: any) {
      console.error('Error updating signal:', err);
      setError(err.message || 'Failed to update signal');
    }
  };

  // Delete signal
  const handleDeleteSignal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this signal?')) return;

    try {
      setError(null);
      const { error } = await (supabase.from('signals') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSignals();
    } catch (err: any) {
      console.error('Error deleting signal:', err);
      setError(err.message || 'Failed to delete signal');
    }
  };

  // Change signal status
  const handleStatusChange = async (id: string, newStatus: 'active' | 'closed') => {
    try {
      setError(null);
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString();
      }

      const { error } = await (supabase.from('signals') as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadSignals();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
    }
  };

  // AI Generate placeholder
  const handleAIGenerate = () => {
    alert('AI Signal Generation - Coming Soon!');
  };

  // Edit signal - load into form
  const handleEditSignal = (signal: Signal) => {
    setEditingSignal(signal);
    setFormData({
      pair: signal.pair,
      action: signal.action,
      entry_price: signal.entry_price.toString(),
      take_profit: signal.take_profit.toString(),
      stop_loss: signal.stop_loss.toString(),
      notes: signal.notes || "",
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      pair: "",
      action: "LONG",
      entry_price: "",
      take_profit: "",
      stop_loss: "",
      notes: "",
    });
    setEditingSignal(null);
  };

  // Load signals on mount
  useEffect(() => {
    loadSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter signals
  const filteredSignals = filter === "all" ? signals : signals.filter(s => s.status === filter);

  // Calculate stats
  const activeSignals = signals.filter(s => s.status === 'active').length;
  const draftSignals = signals.filter(s => s.status === 'draft').length;
  const closedSignals = signals.filter(s => s.status === 'closed' && s.profit_loss !== null);
  const winRate = closedSignals.length > 0
    ? `${Math.round((closedSignals.filter(s => s.profit_loss! > 0).length / closedSignals.length) * 100)}%`
    : "N/A";
  const avgProfit = closedSignals.length > 0
    ? `${(closedSignals.reduce((sum, s) => sum + (s.profit_loss || 0), 0) / closedSignals.length).toFixed(1)}%`
    : "N/A";

  // Format timestamp (currently unused but kept for future use)
  // const formatTime = (timestamp: string) => {
  //   const date = new Date(timestamp);
  //   const now = new Date();
  //   const diff = now.getTime() - date.getTime();
  //   const minutes = Math.floor(diff / 60000);
  //   const hours = Math.floor(minutes / 60);
  //   const days = Math.floor(hours / 24);
  //
  //   if (minutes < 60) return `${minutes}m ago`;
  //   if (hours < 24) return `${hours}h ago`;
  //   return `${days}d ago`;
  // };

  // Format price
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trading Signals</h2>
          <p className="text-gray-500">Manage and publish trading signals for your users.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAIGenerate}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            🤖 AI Generate
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-cyan-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-400 transition"
          >
            + New Signal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Signals", value: activeSignals, color: "green" },
          { label: "Pending Review", value: draftSignals, color: "yellow" },
          { label: "Win Rate", value: winRate, color: "cyan" },
          { label: "Avg. Profit", value: avgProfit, color: "green" },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className={`text-2xl font-bold ${stat.color === 'green' ? 'text-green-400' : stat.color === 'yellow' ? 'text-yellow-400' : 'text-cyan-400'} mb-1`}>
              {stat.value}
            </div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "draft", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === f
                ? "bg-cyan-500 text-black font-semibold"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Signals Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Pair</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Action</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Entry</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">TP / SL</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">P/L</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Source</th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Loading signals...
                </td>
              </tr>
            ) : filteredSignals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No signals found. Create your first signal to get started.
                </td>
              </tr>
            ) : (
              filteredSignals.map((signal) => (
                <tr key={signal.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <span className="text-white font-semibold">{signal.pair}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      signal.action === "LONG"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      {signal.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{formatPrice(signal.entry_price)}</td>
                  <td className="px-6 py-4">
                    <div className="text-green-400 text-sm">{formatPrice(signal.take_profit)}</div>
                    <div className="text-red-400 text-sm">{formatPrice(signal.stop_loss)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      signal.status === "active"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : signal.status === "draft"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {signal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={signal.profit_loss ? (signal.profit_loss > 0 ? "text-green-400" : "text-red-400") + " font-semibold" : "text-gray-500"}>
                      {signal.profit_loss ? `${signal.profit_loss > 0 ? '+' : ''}${signal.profit_loss.toFixed(1)}%` : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${signal.ai_generated ? "text-purple-400" : "text-gray-400"}`}>
                      {signal.ai_generated ? "🤖 AI" : "👤 Manual"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSignal(signal)}
                        className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition text-sm"
                        title="Edit signal"
                      >
                        ✏️
                      </button>
                      {signal.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(signal.id, 'active')}
                          className="px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition text-sm font-semibold"
                        >
                          Publish
                        </button>
                      )}
                      {signal.status === "active" && (
                        <button
                          onClick={() => handleStatusChange(signal.id, 'closed')}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-sm font-semibold"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSignal(signal.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-sm"
                        title="Delete signal"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Signal Modal (Create/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingSignal ? 'Edit Signal' : 'Create New Signal'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSignal(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Trading Pair</label>
                  <input
                    type="text"
                    placeholder="BTC/USDT"
                    value={formData.pair}
                    onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Action</label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value as "LONG" | "SHORT" })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="67450"
                  value={formData.entry_price}
                  onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Take Profit</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="72000"
                    value={formData.take_profit}
                    onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="65000"
                    value={formData.stop_loss}
                    onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Analysis Notes</label>
                <textarea
                  placeholder="Technical analysis, reasoning..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => editingSignal ? handleUpdateSignal('draft') : handleCreateSignal('draft')}
                  className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => editingSignal ? handleUpdateSignal('active') : handleCreateSignal('active')}
                  className="flex-1 bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition"
                >
                  {editingSignal ? 'Update & Publish' : 'Publish Signal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
