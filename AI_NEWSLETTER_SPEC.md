# AI-Powered Newsletter System Specification

## Overview

Build a comprehensive AI-powered newsletter system that enables admins to create, generate, and send crypto-focused newsletters to subscribers with minimal effort.

---

## Phase 1: Database Schema

### New Tables

#### `newsletter_campaigns`
```sql
CREATE TABLE newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Content
  subject VARCHAR(255) NOT NULL,
  preview_text VARCHAR(255),
  html_content TEXT NOT NULL,
  plain_text_content TEXT,

  -- Metadata
  template_id UUID REFERENCES newsletter_templates(id),
  created_by UUID REFERENCES profiles(id),

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Stats (updated after send)
  recipients_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,

  -- AI Generation metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  ai_model VARCHAR(50)
);
```

#### `newsletter_templates`
```sql
CREATE TABLE newsletter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- market_update, educational, signal_recap, announcement

  -- Template content (with {{placeholders}})
  html_template TEXT NOT NULL,

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,

  -- Preview
  thumbnail_url TEXT
);
```

#### `newsletter_sends`
```sql
CREATE TABLE newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,

  -- Delivery
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,

  -- Tracking
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained
  bounce_reason TEXT,

  -- Email service tracking
  external_id VARCHAR(255), -- Resend message ID

  UNIQUE(campaign_id, subscriber_id)
);
```

#### `newsletter_clicks`
```sql
CREATE TABLE newsletter_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID REFERENCES newsletter_sends(id) ON DELETE CASCADE,

  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  url TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET
);
```

### Migrations

**File: `supabase/migrations/006_newsletter_campaigns.sql`**

---

## Phase 2: Email Service Integration (Resend)

### Why Resend
- Modern API, built for developers
- React Email support for templates
- Generous free tier (3,000 emails/month)
- Webhook support for tracking
- Simple pricing

### Environment Variables
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=newsletter@navigatingcrypto.com
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

### API Routes

#### `app/api/newsletter/send/route.ts`
- POST: Send campaign to all active subscribers
- Batch sending (50 per batch with delay)
- Rate limiting protection
- Admin-only (verify role)

#### `app/api/newsletter/webhook/route.ts`
- POST: Receive Resend webhooks
- Handle: delivered, opened, clicked, bounced, complained
- Update newsletter_sends table
- Update campaign stats

#### `app/api/newsletter/preview/route.ts`
- POST: Send test email to admin
- Single recipient preview

### Resend Integration Library

**File: `lib/resend/client.ts`**
```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewsletter(params: {
  to: string;
  subject: string;
  html: string;
  campaignId: string;
  subscriberId: string;
}) {
  // Add tracking pixel
  // Add unsubscribe link
  // Send via Resend
}

export async function sendBatch(subscribers: Subscriber[], campaign: Campaign) {
  // Batch send with rate limiting
  // Return results
}
```

---

## Phase 3: AI Content Generation

### AI Capabilities

1. **Market Update Generator**
   - Analyze recent signals (from signals table)
   - Summarize market trends
   - Provide outlook

2. **Educational Content Generator**
   - Generate crypto education articles
   - Explain concepts for beginners
   - Create trading tips

3. **Signal Recap Generator**
   - Summarize weekly/monthly signals
   - Calculate hit rate
   - Highlight best performers

4. **Full Newsletter Generator**
   - Combine all sections
   - Match brand voice
   - Optimize for engagement

### API Routes

#### `app/api/newsletter/generate/route.ts`
```typescript
// POST body
{
  type: 'market_update' | 'educational' | 'signal_recap' | 'full',
  context?: {
    timeframe?: 'daily' | 'weekly' | 'monthly',
    topic?: string,
    tone?: 'professional' | 'casual' | 'urgent',
    includeSignals?: boolean,
    customPrompt?: string
  }
}

// Response
{
  subject: string,
  previewText: string,
  htmlContent: string,
  plainTextContent: string,
  tokensUsed: number
}
```

### AI Prompts Library

**File: `lib/ai/newsletter-prompts.ts`**

```typescript
export const NEWSLETTER_SYSTEM_PROMPT = `
You are an expert crypto newsletter writer for Navigating Crypto.
Your audience is crypto traders ranging from beginners to advanced.

Brand Voice:
- Professional but approachable
- Data-driven insights
- Educational without being condescending
- Urgent on opportunities, calm on market volatility

Format Guidelines:
- Use clear headings
- Include bullet points for readability
- Add relevant emojis sparingly (1-2 per section)
- Include clear CTAs
`;

export const MARKET_UPDATE_PROMPT = (signals: Signal[], timeframe: string) => `
Generate a ${timeframe} market update newsletter.

Recent Signals Data:
${JSON.stringify(signals, null, 2)}

Include:
1. Market Overview (2-3 sentences)
2. Top Performing Signals (highlight winners)
3. Key Market Movements
4. What to Watch Next
5. Call to Action

Format as clean HTML with inline styles for email compatibility.
`;

export const EDUCATIONAL_PROMPT = (topic: string) => `
Generate an educational newsletter section about: ${topic}

Include:
1. Clear explanation for beginners
2. Why it matters for traders
3. Practical example
4. Pro tip

Keep it under 300 words. Format as HTML.
`;

export const SIGNAL_RECAP_PROMPT = (signals: Signal[], period: string) => `
Generate a ${period} signal performance recap.

Signals Data:
${JSON.stringify(signals, null, 2)}

Calculate and include:
1. Total signals sent
2. Success rate (% that hit target)
3. Best performer (highest gain)
4. Asset breakdown (BTC, ETH, XRP, etc.)
5. Insights for next period

Format as HTML with a clean data visualization style.
`;
```

### AI Service

**File: `lib/ai/newsletter-generator.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateNewsletter(params: GenerateParams): Promise<NewsletterContent> {
  // Fetch relevant data (signals, market data)
  // Build prompt based on type
  // Call Claude API
  // Parse and validate response
  // Return structured content
}
```

---

## Phase 4: Admin UI Components

### New Pages

#### `app/admin/newsletter/campaigns/page.tsx`
- List all campaigns (draft, scheduled, sent)
- Filter by status
- Search by subject
- Pagination
- Quick actions (edit, duplicate, delete, view stats)

#### `app/admin/newsletter/campaigns/new/page.tsx`
- Campaign composer
- Template selection
- AI generation panel
- Subject line optimizer
- Preview (desktop/mobile)
- Schedule or send immediately

#### `app/admin/newsletter/campaigns/[id]/page.tsx`
- View campaign details
- Edit if draft
- View stats if sent
- Recipient list with status

#### `app/admin/newsletter/campaigns/[id]/stats/page.tsx`
- Detailed analytics
- Open rate chart over time
- Click heatmap
- Bounce analysis
- Unsubscribe reasons

#### `app/admin/newsletter/templates/page.tsx`
- Template gallery
- Create/edit templates
- Preview templates
- Set default template

### UI Components

#### `components/newsletter/CampaignComposer.tsx`
```typescript
// Rich text editor with:
// - WYSIWYG editing
// - HTML source view
// - Variable insertion ({{first_name}}, etc.)
// - Image upload
// - Link insertion
// - Mobile preview toggle
```

#### `components/newsletter/AIGeneratePanel.tsx`
```typescript
// Collapsible panel with:
// - Generation type selector
// - Context options (timeframe, topic, tone)
// - Custom prompt input
// - Generate button with loading state
// - Preview generated content
// - Insert/Replace buttons
```

#### `components/newsletter/SubjectLineOptimizer.tsx`
```typescript
// AI-powered subject line suggestions:
// - Current subject input
// - "Optimize" button
// - 5 AI suggestions with:
//   - Predicted open rate
//   - Character count
//   - Emoji suggestions
// - One-click apply
```

#### `components/newsletter/CampaignStats.tsx`
```typescript
// Stats dashboard with:
// - Key metrics cards (sent, opened, clicked, bounced)
// - Open rate over time chart
// - Device breakdown pie chart
// - Top clicked links table
// - Geographic distribution (if available)
```

---

## Phase 5: Email Templates

### Base Template Structure

**File: `lib/email-templates/base.tsx`**

Using React Email for type-safe, component-based email templates:

```typescript
import { Html, Head, Body, Container, Section, Text, Link, Img } from '@react-email/components';

export function BaseTemplate({
  content,
  preheader,
  unsubscribeUrl
}: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        {/* Preheader */}
        <Text style={preheaderStyle}>{preheader}</Text>

        {/* Header with logo */}
        <Container style={container}>
          <Section style={header}>
            <Img src="https://navigatingcrypto.com/logo.png" width={150} />
          </Section>

          {/* Main content */}
          <Section style={mainContent}>
            {content}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text>Navigating Crypto - Your Crypto Trading Partner</Text>
            <Link href={unsubscribeUrl}>Unsubscribe</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### Pre-built Templates

1. **Market Update Template**
   - Header with date
   - Market overview section
   - Signal highlights grid
   - CTA button

2. **Educational Template**
   - Article-style layout
   - Code/example blocks
   - Related resources

3. **Signal Recap Template**
   - Stats grid at top
   - Performance table
   - Best/worst performers

4. **Announcement Template**
   - Bold headline
   - Feature highlights
   - CTA buttons

---

## Phase 6: Webhook & Tracking

### Tracking Pixel

Insert tracking pixel in emails:
```html
<img src="https://navigatingcrypto.com/api/newsletter/track/open?sid={{send_id}}" width="1" height="1" />
```

### Link Wrapping

Wrap all links for click tracking:
```
Original: https://example.com/article
Wrapped:  https://navigatingcrypto.com/api/newsletter/track/click?sid={{send_id}}&url={{encoded_url}}
```

### Webhook Handler

**File: `app/api/newsletter/webhook/route.ts`**

Handle Resend webhook events:
- `email.sent`
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.bounced`
- `email.complained`

Update `newsletter_sends` and aggregate to `newsletter_campaigns`.

---

## Phase 7: Scheduled Sending

### Cron Job Setup

Using Vercel Cron:

**File: `vercel.json`**
```json
{
  "crons": [
    {
      "path": "/api/newsletter/cron/send-scheduled",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Scheduled Send API

**File: `app/api/newsletter/cron/send-scheduled/route.ts`**

- Run every 5 minutes
- Find campaigns where `status = 'scheduled'` and `scheduled_for <= NOW()`
- Update status to `sending`
- Batch send to all active subscribers
- Update status to `sent` on completion

---

## Implementation Order

### Week 1: Foundation
1. [ ] Create database migrations (Phase 1)
2. [ ] Set up Resend account and env vars
3. [ ] Build Resend client library (Phase 2)
4. [ ] Create send/preview API routes

### Week 2: AI Integration
5. [ ] Set up Anthropic/Claude integration
6. [ ] Build AI prompts library (Phase 3)
7. [ ] Create generate API route
8. [ ] Test AI generation with real signal data

### Week 3: Admin UI
9. [ ] Build campaign list page
10. [ ] Build campaign composer with editor
11. [ ] Build AI generation panel
12. [ ] Build preview functionality

### Week 4: Templates & Tracking
13. [ ] Create React Email templates (Phase 5)
14. [ ] Implement tracking pixel
15. [ ] Implement link wrapping
16. [ ] Build webhook handler (Phase 6)

### Week 5: Polish & Launch
17. [ ] Build stats dashboard
18. [ ] Set up scheduled sending cron
19. [ ] Testing & QA
20. [ ] Deploy to production

---

## Environment Variables Required

```env
# Resend (Email Service)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=newsletter@navigatingcrypto.com
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# AI (Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=https://navigatingcrypto.advancingtechnology.dev
```

---

## Dependencies to Add

```bash
npm install resend @react-email/components @anthropic-ai/sdk
npm install -D @types/nodemailer  # For types only
```

---

## Security Considerations

1. **Admin-only access** - All newsletter APIs verify admin role
2. **Rate limiting** - Prevent abuse of AI generation
3. **Webhook verification** - Validate Resend webhook signatures
4. **Unsubscribe compliance** - CAN-SPAM compliant unsubscribe in every email
5. **Data privacy** - Don't log email content, only metadata
6. **DKIM/SPF** - Configure DNS for email deliverability

---

## Success Metrics

- **Delivery rate** > 98%
- **Open rate** > 25% (crypto industry average ~20%)
- **Click rate** > 5%
- **Unsubscribe rate** < 0.5%
- **AI generation time** < 10 seconds
- **Time to create newsletter** < 5 minutes (with AI)

---

## Future Enhancements

1. **A/B Testing** - Test subject lines, content variations
2. **Segmentation** - Send to specific subscriber groups
3. **Personalization** - Dynamic content based on user preferences
4. **Automation** - Triggered emails (welcome, re-engagement)
5. **RSS-to-Email** - Auto-generate from blog posts
6. **Multi-language** - Translate newsletters for global audience
