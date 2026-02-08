"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
}

export default function SettingsPage() {
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profileData, error: profileError } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('Failed to load profile. Please try refreshing the page.');
          setLoading(false);
          return;
        }

        if (profileData) {
          setProfile(profileData as Profile);
          setFullName(profileData.full_name || "");

          // Load preferences if they exist
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((profileData as any).preferences) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPreferences((profileData as any).preferences as NotificationPreferences);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update({
          full_name: fullName,
          preferences: preferences
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile({ ...profile, full_name: fullName });
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    // Auto-save preferences
    if (profile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('profiles') as any)
        .update({ preferences: newPreferences })
        .eq('id', profile.id)
        .then(({ error }: { error: Error | null }) => {
          if (error) {
            console.error('Error saving preferences:', error);
          }
        });
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    setDeleting(true);
    try {
      // Delete user's data first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('user_progress') as any).delete().eq('user_id', profile.id);

      // Delete profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase.from('profiles') as any)
        .delete()
        .eq('id', profile.id);

      if (deleteError) throw deleteError;

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting account:', err);
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      free: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
      pro: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
      enterprise: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    };
    return styles[plan as keyof typeof styles] || styles.free;
  };

  const getPlanFeatures = (plan: string) => {
    const features = {
      free: [
        'Access to beginner courses',
        '3 trading signals per week',
        'Basic market data',
        'Community read-only access',
      ],
      pro: [
        'Full community access & chat',
        'Unlimited trading signals',
        'All courses & webinars',
        'Advanced analytics & charts',
        'AI-powered market insights',
        'Weekly live trading sessions',
      ],
      enterprise: [
        'Everything in Pro',
        'Proprietary indicator & plugin access',
        '1-on-1 coaching with Travis',
        'Copy trading access',
        'Custom AI trading agents',
        'API access & dedicated manager',
      ],
    };
    return features[plan as keyof typeof features] || features.free;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Settings</h3>
        <p className="text-gray-400 mb-4">{error || 'Failed to load profile'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const planStyle = getPlanBadge(profile.plan);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-gray-800 text-gray-500 px-4 py-3 rounded-lg border border-gray-700 cursor-not-allowed"
            />
            <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <div className="text-gray-500 text-sm">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Section */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Current Plan</h3>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
            {profile.plan.toUpperCase()}
          </span>
        </div>

        {/* Plan Features */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Your Plan Includes:</h4>
          <ul className="space-y-2">
            {getPlanFeatures(profile.plan).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-green-400">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade CTA */}
        {profile.plan !== 'enterprise' && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚀</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">
                  {profile.plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Enterprise'}
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  {profile.plan === 'free'
                    ? 'Get full community access, unlimited signals, all courses, and live trading sessions — $99/mo or $997/yr.'
                    : 'Get our proprietary indicator, 1-on-1 coaching with Travis, copy trading, and VIP access — $249/mo or $2,497/yr.'}
                </p>
                <button
                  onClick={() => alert('Pricing page coming soon! Contact support@navigationcrypto.com for upgrade inquiries.')}
                  className="inline-block px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-semibold text-sm"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium">Email Notifications</div>
              <div className="text-gray-500 text-sm">Receive email alerts for new signals</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.email_notifications}
                onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium">Push Notifications</div>
              <div className="text-gray-500 text-sm">Get notified about important updates</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.push_notifications}
                onChange={(e) => handlePreferenceChange('push_notifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium">Marketing Emails</div>
              <div className="text-gray-500 text-sm">Receive news and promotional content</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.marketing_emails}
                onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-gray-400 text-sm mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition font-semibold text-sm"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-red-500/30 max-w-md w-full p-6">
            <div className="text-4xl mb-4 text-center">⚠️</div>
            <h3 className="text-xl font-bold text-red-400 mb-2 text-center">Delete Account</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Are you sure you want to delete your account? This will permanently delete:
            </p>
            <ul className="text-gray-400 text-sm mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-red-400">•</span>
                <span>Your profile and personal information</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">•</span>
                <span>All course progress and enrollments</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">•</span>
                <span>Your subscription and payment history</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">•</span>
                <span>All saved preferences and settings</span>
              </li>
            </ul>
            <p className="text-red-400 font-semibold text-sm mb-6 text-center">
              This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
