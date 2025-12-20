import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-cyan-400 hover:underline mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-cyan max-w-none">
          <p className="text-gray-400 mb-6">Last updated: December 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 mb-4">
              By accessing and using Navigating Crypto (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-300 mb-4">
              Navigating Crypto provides cryptocurrency trading signals, educational content, and AI-powered market analysis.
              Our services are for informational purposes only and do not constitute financial advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Risk Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              Cryptocurrency trading involves substantial risk of loss. Past performance is not indicative of future results.
              You should only trade with money you can afford to lose. We are not responsible for any trading losses you may incur.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
              <strong>Warning:</strong> Never invest more than you can afford to lose. Cryptocurrency markets are highly volatile.
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. User Accounts</h2>
            <p className="text-gray-300 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Subscription and Payments</h2>
            <p className="text-gray-300 mb-4">
              Some features require a paid subscription. All payments are processed securely through our payment providers.
              Refunds are handled on a case-by-case basis as outlined in our refund policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-300 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use the Service for any illegal purposes</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Redistribute or resell our trading signals</li>
              <li>Use automated systems to scrape our content</li>
              <li>Impersonate other users or entities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact</h2>
            <p className="text-gray-300">
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@navigatingcrypto.com" className="text-cyan-400 hover:underline">
                legal@navigatingcrypto.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
