"use client";

import { useState } from "react";

type FAQ = {
  question: string;
  answer: string;
  category: string;
};

const faqs: FAQ[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I create an account?",
    answer: "Click the 'Get Started' button in the navigation bar, fill out the registration form with your email and password, and verify your email address. You'll immediately get access to free educational content and signals."
  },
  {
    category: "Getting Started",
    question: "Is there a free plan?",
    answer: "Yes! Our free plan includes access to beginner courses, 3 trading signals per week, and read-only community access. Upgrade to Pro ($99/mo or $997/yr) for the full community experience, unlimited signals, and all courses — or Enterprise ($249/mo or $2,497/yr) for our proprietary indicator, 1-on-1 coaching with Travis, and VIP access."
  },
  {
    category: "Getting Started",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and select cryptocurrencies for subscription payments."
  },

  // Signals
  {
    category: "Signals",
    question: "What are trading signals?",
    answer: "Trading signals are expert recommendations for when to buy or sell specific cryptocurrencies. Each signal includes entry price, take profit targets, stop loss levels, and analysis from our professional traders."
  },
  {
    category: "Signals",
    question: "How accurate are the signals?",
    answer: "Our signals maintain an average win rate of 89% based on historical performance. However, cryptocurrency trading involves risk, and past performance does not guarantee future results. Always use proper risk management."
  },
  {
    category: "Signals",
    question: "How do I receive signal notifications?",
    answer: "Enable notifications in your dashboard settings. You can receive alerts via email, push notifications on the mobile app, or Telegram. Signals are delivered in real-time as soon as they're published."
  },
  {
    category: "Signals",
    question: "Can I automate trading based on signals?",
    answer: "Pro and Enterprise plans include copy trading features that allow you to automatically execute trades based on our signals. You maintain full control and can enable/disable automation at any time."
  },

  // Courses
  {
    category: "Courses",
    question: "Are courses suitable for beginners?",
    answer: "Absolutely! We offer courses for all skill levels. Our beginner courses start with the fundamentals of blockchain and cryptocurrency, requiring no prior knowledge. Advanced courses cover technical analysis, DeFi, and trading strategies."
  },
  {
    category: "Courses",
    question: "Do I get a certificate after completing a course?",
    answer: "Yes! Upon completing a course and passing the final assessment, you'll receive a digital certificate that you can share on LinkedIn and other platforms."
  },
  {
    category: "Courses",
    question: "Can I access courses offline?",
    answer: "Pro and Enterprise members can download course videos for offline viewing through our mobile app. Course materials and quizzes require an internet connection."
  },

  // Billing
  {
    category: "Billing",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period, and no further charges will be made."
  },
  {
    category: "Billing",
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for new subscriptions. If you're not satisfied within the first 14 days, contact support for a full refund. Refunds are not available after 14 days."
  },
  {
    category: "Billing",
    question: "What's the difference between Pro and Enterprise plans?",
    answer: "Pro ($99/mo or $997/yr) gives you the full community, unlimited signals, all courses, advanced analytics, and weekly live trading sessions. Enterprise ($249/mo or $2,497/yr) adds our proprietary indicator & plugin, 1-on-1 coaching sessions with Travis, copy trading, custom AI agents, API access, and a dedicated account manager. Both plans offer annual pricing with significant savings."
  },

  // Account
  {
    category: "Account",
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. The link expires after 1 hour for security."
  },
  {
    category: "Account",
    question: "Can I change my email address?",
    answer: "Yes, go to Account Settings > Profile and update your email address. You'll need to verify the new email before the change takes effect."
  },
  {
    category: "Account",
    question: "Is my data secure?",
    answer: "We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. We never store your payment information directly - all payments are processed securely through Stripe. We're also GDPR compliant."
  },
  {
    category: "Account",
    question: "Can I delete my account?",
    answer: "Yes, you can request account deletion from Account Settings. This will permanently delete all your data within 30 days. Please note this action is irreversible."
  }
];

const categories = ["All", "Getting Started", "Signals", "Courses", "Billing", "Account"];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filter FAQs
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg">
            Find answers to common questions about Navigating Crypto
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-6 py-4 pl-12 focus:outline-none focus:border-cyan-500 transition"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
              🔍
            </span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedCategory === category
                  ? "bg-cyan-500 text-black"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions found matching your search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === index;
              const contentId = `faq-content-${index}`;

              return (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-start justify-between text-left"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                  >
                    <div className="flex-1 pr-4">
                      <div className="text-xs text-cyan-400 font-semibold mb-2">
                        {faq.category}
                      </div>
                      <h3 className="text-white font-semibold text-lg">
                        {faq.question}
                      </h3>
                    </div>
                    <span className={`text-2xl text-gray-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div id={contentId} className="px-6 pb-5 pt-2">
                      <p className="text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Still have questions?
          </h2>
          <p className="text-gray-400 mb-6">
            Our support team is here to help you 24/7
          </p>
          <a
            href="/support"
            className="inline-block bg-cyan-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-cyan-400 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
