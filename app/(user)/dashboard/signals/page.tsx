"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Signal } from "@/lib/supabase/types";

export default function SignalsPage() {
  const supabase = createClient();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        setError(null);
        const { data, error: signalsError } = await supabase
          .from('signals')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (signalsError) {
          setError('Failed to load signals. Please try refreshing the page.');
          setLoading(false);
          return;
        }

        if (data) {
          setSignals(data);
          setFilteredSignals(data);
        }
      } catch (err) {
        console.error('Error loading signals:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSignals();

    // Set up real-time subscription
    const channel = supabase
      .channel('signals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signals',
          filter: 'status=eq.active'
        },
        (payload) => {
          console.log('Signal updated:', payload);
          loadSignals(); // Reload signals on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPair === "all") {
      setFilteredSignals(signals);
    } else {
      setFilteredSignals(signals.filter(s => s.pair === selectedPair));
    }
  }, [selectedPair, signals]);

  const pairs = ["all", ...Array.from(new Set(signals.map(s => s.pair)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading signals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Signals</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trading Signals</h2>
          <p className="text-gray-500">
            Live trading signals from our AI analysts
            <span className="ml-2 inline-flex items-center gap-1 text-xs">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400">Real-time updates</span>
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{signals.length}</div>
          <div className="text-gray-500 text-sm">Active Signals</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-sm">Filter by pair:</span>
        {pairs.map((pair) => (
          <button
            key={pair}
            onClick={() => setSelectedPair(pair)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              selectedPair === pair
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {pair === "all" ? "All Pairs" : pair}
          </button>
        ))}
      </div>

      {/* Signals List */}
      {filteredSignals.length > 0 ? (
        <div className="grid gap-4">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    signal.action === 'LONG'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {signal.action}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                    <p className="text-gray-500 text-xs">
                      {signal.ai_generated && '🤖 AI Generated • '}
                      {new Date(signal.created_at).toLocaleDateString()} at {new Date(signal.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  <span className="text-cyan-400 text-sm font-semibold">Active</span>
                </div>
              </div>

              {/* Price Levels */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-500 text-xs mb-1">Entry Price</div>
                  <div className="text-white text-lg font-bold">${signal.entry_price.toLocaleString()}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 text-xs mb-1">Take Profit</div>
                  <div className="text-green-400 text-lg font-bold">${signal.take_profit.toLocaleString()}</div>
                  <div className="text-green-400/70 text-xs mt-1">
                    +{(signal.entry_price && signal.entry_price > 0
                      ? ((signal.take_profit - signal.entry_price) / signal.entry_price * 100).toFixed(2)
                      : '0.00')}%
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="text-red-400 text-xs mb-1">Stop Loss</div>
                  <div className="text-red-400 text-lg font-bold">${signal.stop_loss.toLocaleString()}</div>
                  <div className="text-red-400/70 text-xs mt-1">
                    {(signal.entry_price && signal.entry_price > 0
                      ? ((signal.stop_loss - signal.entry_price) / signal.entry_price * 100).toFixed(2)
                      : '0.00')}%
                  </div>
                </div>
              </div>

              {/* Notes */}
              {signal.notes && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-xs mb-2">Analysis</div>
                  <p className="text-gray-300 text-sm">{signal.notes}</p>
                </div>
              )}

              {/* Risk Warning */}
              <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                <span>⚠️</span>
                <p>
                  Not financial advice. Always do your own research and manage your risk accordingly.
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">No Active Signals</h3>
          <p className="text-gray-500 mb-4">
            {selectedPair === "all"
              ? "There are currently no active signals. Check back soon!"
              : `No active signals for ${selectedPair}. Try selecting a different pair.`}
          </p>
          {selectedPair !== "all" && (
            <button
              onClick={() => setSelectedPair("all")}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              View All Pairs
            </button>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-yellow-400 font-semibold mb-1">Important Disclaimer</h4>
            <p className="text-gray-400 text-sm">
              Trading signals are for educational purposes only and do not constitute financial advice.
              Cryptocurrency trading involves substantial risk of loss. Always conduct your own research
              and never invest more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
