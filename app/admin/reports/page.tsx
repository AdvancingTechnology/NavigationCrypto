"use client";

import { useState, ReactElement } from "react";

// Report data structure - easy to add new reports
const reports = [
  {
    id: "executive-dec-2025",
    title: "Executive Report - CEO & Investor",
    date: "December 22, 2025",
    author: "Elijah Brown (CTO)",
    category: "Business",
    summary: "Platform status, cost breakdown, and action items for business formation.",
    content: `
## Executive Summary

NavigationCrypto is a crypto education and trading signals platform built with Next.js 16, Supabase, and AI-powered features. The platform is **fully functional** and ready for monetization pending business formation and payment processing setup.

---

## Action Items for CEO & Investor

### 1. Business Incorporation (REQUIRED FOR BANKING)

| Option | Filing Fee | Registered Agent | Annual Fee | Total Year 1 |
|--------|-----------|------------------|------------|--------------|
| **Wyoming LLC** (Recommended) | $100 | $125/year | $60/year | **~$285** |
| Delaware LLC | $90 | $100-200/year | $300/year | ~$500+ |

**Recommendation**: Wyoming LLC - crypto-friendly, low fees, no state income tax.

**Action Required**:
- Choose LLC formation service (ZenBusiness, Northwest, or DIY)
- Add Elijah Brown to Articles of Organization as member
- Obtain EIN from IRS (free)
- Open business bank account

---

### 2. Stripe Payment Processing

Once incorporated with banking, Stripe can be activated.

| Fee Type | Cost |
|----------|------|
| Setup Fee | **$0** |
| Monthly Fee | **$0** |
| Per Transaction (Cards) | **2.9% + $0.30** |
| Subscription Billing | **+0.5% of recurring** |
| ACH/Bank Transfer | **0.8%** (max $5) |

**Example Revenue Calculation** (25 Pro + 5 Enterprise @ new pricing):
- Gross: $3,720/month ($2,475 Pro + $1,245 Enterprise)
- Stripe Fees: ~$126/month (3.4% effective)
- Net: ~$3,594/month

**Action Required**:
- Trav to complete Stripe account setup (needs LLC + bank account)
- Connect to NavigationCrypto dashboard

---

### 3. Anthropic Claude API (AI Features)

**Status**: Trav received text to set up account. If not done, Elijah will handle.

| Model | Input Cost | Output Cost | Use Case |
|-------|-----------|-------------|----------|
| Claude Haiku 3.5 | $0.80/M tokens | $4/M tokens | Fast AI tasks |
| Claude Sonnet 4 | $3/M tokens | $15/M tokens | Newsletter generation |
| Claude Opus 4.5 | $15/M tokens | $75/M tokens | Complex analysis |

**Estimated Monthly Cost** (1,000 newsletter generations):
- Using Sonnet: **~$20-50/month**
- Using Haiku: **~$5-15/month**

**Action Required**:
- Confirm Anthropic account setup
- Add API key to production environment

---

### 4. Email Notifications (Newsletter System)

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Resend** (Recommended) | 3,000 emails/month | $20/mo for 50K emails |

**Cost**: **FREE** for initial launch (3,000 emails/month covers early growth)

Paid tier only needed when subscriber base exceeds ~1,000 active users.

---

### 5. Mobile App (Future Phase)

| Platform | Account Fee | Commission on Sales |
|----------|-------------|---------------------|
| **Apple App Store** | $99/year | 15-30% |
| **Google Play** | $25 one-time | 15-30% |

**Total to publish on both stores**: **$124** first year, **$99/year** thereafter

**Note**: Mobile app is Phase 2. Web platform should prove revenue model first.

---

### 6. Custom Domain

**Status**: Domain available via Zoho Domains

| Item | Cost |
|------|------|
| Domain Transfer/Pointing | Included with Zoho |
| SSL Certificate | **FREE** (via Vercel) |
| DNS Configuration | **FREE** |

**Action Required**:
- Point navigatingcrypto.com DNS to Vercel
- Configure in Vercel dashboard

---

## Cost Summary

### Immediate Costs (To Launch Monetization)

| Item | Cost | Frequency |
|------|------|-----------|
| Wyoming LLC Formation | $100 | One-time |
| Registered Agent | $125 | Annual |
| Wyoming Annual Report | $60 | Annual |
| **Subtotal** | **$285** | **Year 1** |

### Operational Costs (Monthly, Post-Launch)

| Item | Cost | Notes |
|------|------|-------|
| Stripe | ~3.4% of revenue | Variable |
| Claude API | $20-50 | For AI features |
| Email (Resend) | $0 | Free tier |
| Vercel Hosting | $0 | Free tier |
| Supabase | $0 | Free tier |
| **Subtotal** | **~$50/month** | **+ Stripe %** |

### Future Costs (Phase 2)

| Item | Cost | Notes |
|------|------|-------|
| Mobile App Stores | $124 | First year |
| Resend Pro | $20/mo | When >1K subscribers |
| Supabase Pro | $25/mo | When >50K requests/day |

---

## Revenue Projections

### Pricing Tiers (Updated Feb 2026)

| Plan | Monthly | Annual | Features |
|------|---------|--------|----------|
| Free | $0 | $0 | 3 signals/week, beginner courses, read-only community |
| Pro | $99/mo | $997/yr | Full community, unlimited signals, all courses, live sessions |
| Enterprise | $249/mo | $2,497/yr | Everything + proprietary indicator/plugin, 1-on-1 coaching with Travis, copy trading, API |

### Break-Even Analysis

| Subscribers Needed | Revenue | After Stripe | Covers |
|--------------------|---------|--------------|--------|
| 1 Pro | $99/mo | $96/mo | All monthly ops + API costs |
| 3 Pro | $297/mo | $287/mo | Annual LLC + all monthly ops |
| 5 Pro | $495/mo | $478/mo | All costs + profit margin |

**Break-even**: Just 1 Pro subscriber covers all monthly operational costs.

---

## Platform Status

### Completed ✅
- Full web platform (26 pages)
- User dashboard with signals, courses, progress tracking
- Admin dashboard (8 management sections)
- Authentication system
- Database with demo content
- Mobile-responsive design
- SEO optimization

### Ready for Activation (Pending Business Setup)
- Stripe checkout integration
- AI newsletter generation
- Email notifications

### Future Roadmap
- Mobile apps (iOS/Android)
- Advanced AI signal generation
- Automated trading integrations
- Affiliate program

---

## Immediate Next Steps

1. **CEO**: Initiate Wyoming LLC formation
2. **CEO**: Add Elijah Brown as member to Articles
3. **Investor**: Confirm capital allocation for Year 1 costs (~$285 + buffer)
4. **Trav**: Confirm Anthropic account OR Elijah will set up
5. **All**: Test platform at navigatingcrypto.advancingtechnology.dev
    `,
  },
];

// Simple markdown-like renderer for tables and formatting
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: ReactElement[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                {tableHeaders.map((header, i) => (
                  <th key={i} className="px-4 py-2 text-left text-gray-400 font-medium">
                    {header.replace(/\*\*/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 text-gray-300">
                      {cell.includes("**") ? (
                        <span className="font-semibold text-cyan-400">
                          {cell.replace(/\*\*/g, "")}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-3 space-y-2 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-300 flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    listItems = [];
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inList) flushList();
      const cells = trimmed
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());

      if (!inTable) {
        tableHeaders = cells;
        inTable = true;
      } else if (trimmed.includes("---")) {
        // Skip separator row
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      flushTable();
    }

    // List detection
    if (trimmed.startsWith("- ")) {
      if (!inList) inList = true;
      listItems.push(trimmed.substring(2));
      return;
    } else if (inList) {
      flushList();
    }

    // Headers
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b border-gray-800">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-xl font-semibold text-cyan-400 mt-6 mb-3">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed === "---") {
      elements.push(<hr key={index} className="border-gray-800 my-6" />);
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      elements.push(
        <p key={index} className="text-white font-semibold my-2">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    } else if (trimmed.length > 0) {
      // Regular paragraph with bold text support
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={index} className="text-gray-300 my-2 leading-relaxed">
          {parts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <span key={i} className="font-semibold text-white">
                {part.replace(/\*\*/g, "")}
              </span>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  });

  // Flush any remaining table or list
  if (inTable) flushTable();
  if (inList) flushList();

  return elements;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeReport = reports.find((r) => r.id === selectedReport);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Partner Reports</h1>
        <p className="text-gray-400">Business reports, cost breakdowns, and strategic documents for partners.</p>
      </div>

      {!selectedReport ? (
        <>
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Reports Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-cyan-500/50 hover:bg-gray-800/50 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">
                    {report.category}
                  </span>
                  <span className="text-gray-500 text-sm">{report.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition">
                  {report.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{report.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">By {report.author}</span>
                  <span className="text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Read →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📄</div>
              <p>No reports found matching your search.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Report View */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <span>←</span>
              <span>Back to Reports</span>
            </button>
          </div>

          {activeReport && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Report Header */}
              <div className="p-6 border-b border-gray-800 bg-gray-950">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">
                    {activeReport.category}
                  </span>
                  <span className="text-gray-500 text-sm">{activeReport.date}</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{activeReport.title}</h1>
                <p className="text-gray-400">Prepared by {activeReport.author}</p>
              </div>

              {/* Report Content */}
              <div className="p-6 md:p-8 max-w-4xl">
                {renderContent(activeReport.content)}
              </div>

              {/* Report Footer */}
              <div className="p-6 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
                <p className="text-gray-500 text-sm">
                  Last updated: {activeReport.date}
                </p>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <span>🖨️</span>
                  Print Report
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
