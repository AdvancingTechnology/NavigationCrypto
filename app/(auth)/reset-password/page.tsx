'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function GlobeIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#00B4D8" strokeWidth="4" fill="none"/>
      <ellipse cx="50" cy="50" rx="45" ry="20" stroke="#00B4D8" strokeWidth="3" fill="none"/>
      <ellipse cx="50" cy="50" rx="20" ry="45" stroke="#00B4D8" strokeWidth="3" fill="none"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="#00B4D8" strokeWidth="3"/>
      <line x1="50" y1="5" x2="50" y2="95" stroke="#00B4D8" strokeWidth="3"/>
    </svg>
  )
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verify that this is a password reset session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // If no session, user didn't come from a valid reset link
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.')
        setValidating(false)
        return
      }

      setValidating(false)
    }

    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <GlobeIcon className="w-16 h-16" />
            <span className="text-white font-bold text-2xl">Navigating Crypto</span>
          </Link>
        </div>

        {/* Reset Password Form */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
          <p className="text-gray-500 mb-6">
            Enter your new password below.
          </p>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-6 rounded-lg text-center">
              <div className="text-3xl mb-3">✓</div>
              <p className="font-semibold mb-2">Password Updated!</p>
              <p className="text-sm text-gray-400">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="text-gray-400 text-sm block mb-2">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="text-gray-400 text-sm block mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <Link href="/login" className="text-cyan-400 hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-white transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
