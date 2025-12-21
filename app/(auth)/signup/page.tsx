'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Globe Icon Component
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

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Use API route to create user with email pre-verified
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create account')
        setLoading(false)
        return
      }

      // Now sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <GlobeIcon className="w-16 h-16" />
            <span className="text-white font-bold text-2xl">Navigating Crypto</span>
          </Link>
        </div>

        {/* Sign Up Form */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-500 mb-6">Start your crypto journey today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-gray-700 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-gray-400 text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-cyan-400 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 text-black py-3 rounded-lg font-semibold hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-cyan-400 hover:underline">
              Sign in
            </Link>
          </div>
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
