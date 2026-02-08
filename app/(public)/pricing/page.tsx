import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Preview what Navigating Crypto has to offer",
      features: [
        "Access to beginner courses",
        "3 trading signals per week",
        "Basic market data",
        "Community read-only access",
        "Email support",
      ],
      cta: "Get Started",
      href: "/signup",
      highlighted: false,
      badge: null,
      annual: null,
    },
    {
      name: "Pro",
      price: "$99",
      period: "per month",
      description: "Full community access, signals, and education for serious traders",
      features: [
        "All free features",
        "Full community access & chat",
        "Unlimited trading signals",
        "Access to all courses & webinars",
        "Advanced analytics & charts",
        "AI-powered market insights",
        "Real-time signal notifications",
        "Portfolio tracking tools",
        "Priority email & chat support",
        "Weekly live trading sessions",
      ],
      cta: "Join Pro",
      href: "/signup?plan=pro",
      highlighted: true,
      badge: "Most Popular",
      annual: "$997/yr (save $191)",
    },
    {
      name: "Enterprise",
      price: "$249",
      period: "per month",
      description: "The full arsenal — proprietary indicator, 1-on-1 coaching, and VIP access",
      features: [
        "Everything in Pro",
        "Proprietary indicator & plugin access",
        "1-on-1 coaching sessions with Travis",
        "Copy trading access",
        "Custom AI trading agents",
        "Dedicated account manager",
        "API access & custom integrations",
        "Private VIP signal channel",
        "Priority support 24/7",
        "Early access to new tools & features",
      ],
      cta: "Go Enterprise",
      href: "/signup?plan=enterprise",
      highlighted: false,
      badge: "VIP",
      annual: "$2,497/yr (save $491)",
    },
  ];

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Simple, Transparent <span className="text-cyan-400">Pricing</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Choose the plan that fits your trading journey. All plans include our core features,
          with advanced tools available for Pro and Enterprise members.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-8 border ${
              plan.highlighted
                ? "bg-gradient-to-b from-cyan-500/10 to-purple-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                : "bg-gray-900 border-gray-800"
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-bold rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan Name */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500">/ {plan.period}</span>
              </div>
              {plan.annual && (
                <p className="text-cyan-400 text-sm mt-2 font-medium">{plan.annual}</p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="w-5 h-5 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs">✓</span>
                  </span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              href={plan.href}
              className={`block w-full py-4 rounded-lg font-semibold text-center transition ${
                plan.highlighted
                  ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/25"
                  : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              question: "Can I switch plans later?",
              answer:
                "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
            },
            {
              question: "Is there a free trial for Pro?",
              answer:
                "We offer a 14-day money-back guarantee on all paid plans. Try risk-free — if it's not for you within 14 days, get a full refund.",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, PayPal, and select cryptocurrencies for payment.",
            },
            {
              question: "Can I cancel anytime?",
              answer:
                "Absolutely. You can cancel your subscription at any time from your account settings. No questions asked.",
            },
            {
              question: "What's included in the Enterprise plan?",
              answer:
                "Enterprise includes everything in Pro plus our proprietary trading indicator & plugin, 1-on-1 coaching sessions with Travis, copy trading, custom AI agents, API access, and a dedicated account manager. It's the full VIP experience.",
            },
            {
              question: "Why is the pricing higher than other platforms?",
              answer:
                "We're not a mass-market newsletter. You get direct access to our proprietary indicator, live trading sessions, 1-on-1 coaching, and a proven community of serious traders. The value our members extract far exceeds the investment.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center mt-20">
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-400 mb-8">
            Our support team is here to help you choose the right plan for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="px-8 py-4 bg-cyan-500 text-black rounded-lg font-semibold hover:bg-cyan-400 transition"
            >
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
