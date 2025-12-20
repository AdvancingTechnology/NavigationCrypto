import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-cyan-400 hover:underline mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-cyan max-w-none">
          <p className="text-gray-400 mb-6">Last updated: December 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">We collect information you provide directly:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Profile information you choose to add</li>
              <li>Payment information (processed by secure payment providers)</li>
              <li>Communications with our support team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use collected information to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide and improve our services</li>
              <li>Send trading signals and notifications</li>
              <li>Process payments and manage subscriptions</li>
              <li>Personalize your experience with AI-powered recommendations</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p className="text-gray-300 mb-4">
              We implement industry-standard security measures including encryption, secure servers,
              and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p className="text-gray-300">
              For privacy-related inquiries, contact us at{' '}
              <a href="mailto:privacy@navigatingcrypto.com" className="text-cyan-400 hover:underline">
                privacy@navigatingcrypto.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
