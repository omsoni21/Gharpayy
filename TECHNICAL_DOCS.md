# Technical Architecture Document

## Gharpayy Lead Management System

## Executive Summary

This document outlines the technical architecture, design decisions, and scalability considerations for the Gharpayy CRM MVP.

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Home    │  │Dashboard │  │  Leads   │              │
│  │   Page   │  │   Page   │  │   Page   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│         │             │             │                   │
│         └─────────────┴─────────────┘                   │
│                   │                                     │
│            React Components                             │
└───────────────────┼─────────────────────────────────────┘
                    │ HTTP/REST
┌───────────────────┼─────────────────────────────────────┐
│                   │           API Layer                  │
│         ┌─────────┴─────────┐                           │
│         │  Next.js API      │                           │
│         │     Routes        │                           │
│         └─────────┬─────────┘                           │
│                   │                                     │
│    ┌──────────────┼──────────────┐                     │
│    │              │              │                     │
│    ▼              ▼              ▼                     │
│ ┌──────┐   ┌──────────┐   ┌──────────┐                │
│ │Lead  │   │  Visit   │   │Dashboard │                │
│ │Service│   │ Service  │   │ Service  │                │
│ └──────┘   └──────────┘   └──────────┘                │
│       │            │             │                     │
│       └────────────┴─────────────┘                     │
│                    │                                    │
│            Prisma ORM                                   │
└────────────────────┼────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────┐
│                    │          Data Layer                │
│                    ▼                                    │
│         ┌───────────────────┐                          │
│         │   PostgreSQL      │                          │
│         │    Database       │                          │
│         └───────────────────┘                          │
│                                                        │
│  Tables: agents, leads, activities, visits,            │
│          properties, notes                             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Selection

### Frontend: Next.js 14 + React + TypeScript

**Why Next.js?**

- Server-side rendering for better SEO
- API routes eliminate need for separate backend
- File-based routing for simplicity
- Vercel deployment (zero config)
- React ecosystem compatibility

**Why TypeScript?**

- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### Backend: Next.js API Routes

**Rationale:**

- Unified codebase (no separate backend repo)
- Shared types between frontend/backend
- Serverless-ready architecture
- Cost-effective for MVP

**Alternative Considered:**

- Express.js: Would require separate deployment
- NestJS: Overkill for MVP scope

### Database: PostgreSQL + Prisma ORM

**Why PostgreSQL?**

- Robust, production-proven
- Excellent for relational data
- Free tiers available (Supabase, Neon)
- Scales well

**Why Prisma?**

- Type-safe database queries
- Auto-generated types from schema
- Easy migrations
- Great developer experience

**Alternative Considered:**

- MongoDB: Less suitable for relational data
- Drizzle ORM: Less mature than Prisma

### Styling: Tailwind CSS

**Why Tailwind?**

- Rapid UI development
- Consistent design system
- Small bundle size (PurgeCSS)
- Easy customization

---

## 3. Database Design

### Entity Relationship Diagram

```
┌─────────────┐
│   Agent     │
│─────────────│
│ id          │◄────┐
│ name        │     │
│ email       │     │
│ phone       │     │
│ isActive    │     │
│ createdAt   │     │
│ updatedAt   │     │
└──────┬──────┘     │
       │            │
       │ 1:N        │ N:N (via leads)
       │            │
┌──────▼──────┐     │
│    Lead     │     │
│─────────────│     │
│ id          │─────┘
│ name        │
│ phone       │
│ email       │
│ source      │
│ status      │
│ priority    │
│ assignedToId├─────────► Agent.id
│ budget      │
│ location    │
│ requirements│
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1:N
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  Activity   │    │    Visit    │
│─────────────│    │─────────────│
│ id          │    │ id          │
│ leadId      │    │ leadId      │
│ agentId     │    │ propertyId  │────► Property
│ type        │    │ scheduledBy │────► Agent
│ description │    │ visitDate   │
│ metadata    │    │ visitTime   │
│ createdAt   │    │ status      │
└─────────────┘    │ outcome     │
                   └─────────────┘

┌─────────────┐
│  Property   │
│─────────────│
│ id          │
│ name        │
│ address     │
│ location    │
│ type        │
│ price       │
│ amenities   │
└─────────────┘
```

### Schema Design Decisions

**1. Separate Agent Table**

- Clear ownership tracking
- Performance analytics per agent
- Easy to add authentication later

**2. Enum Types for Status**

- Type-safe status transitions
- Prevents invalid states
- Self-documenting code

**3. Activity Tracking**

- Complete audit trail
- Enables performance analysis
- Customer service history

**4. JSON Metadata in Activities**

- Flexible schema for different activity types
- Store call duration, message content, etc.
- No schema migration needed for new fields

### Indexes

```sql
-- Optimizing common queries
CREATE INDEX idx_leads_assignedTo ON leads("assignedToId");
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_activities_leadId ON activities("leadId");
CREATE INDEX idx_visits_propertyId ON visits("propertyId");
```

---

## 4. API Design

### RESTful Principles

- Resource-based URLs (`/api/leads`, `/api/visits`)
- HTTP verbs for actions (GET, POST, PATCH)
- JSON request/response format
- Proper status codes (200, 201, 400, 404, 500)

### Endpoint Specifications

#### POST /api/leads

```typescript
// Request
{
  name: string (required)
  phone: string (required)
  email?: string
  source: 'WhatsApp' | 'Website' | 'Social Media' | 'Phone Call' | 'Lead Form'
  budget?: string
  location?: string
  accommodationType?: string
  requirements?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignmentMethod?: 'round-robin' | 'workload'
  preferredAgentId?: string
}

// Response (201)
{
  id: string
  name: string
  phone: string
  // ... all fields
  assignedTo: {
    id: string
    name: string
    email: string
  }
  createdAt: DateTime
}
```

#### GET /api/leads

```typescript
// Query Parameters
?status=CONTACTED
&assignedToId=agent-id
&source=WhatsApp
&search=john
&limit=50
&offset=0

// Response
{
  leads: Lead[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
```

### Error Handling Strategy

```typescript
try {
  // Business logic
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known database errors
    return NextResponse.json({ error: "Lead already exists" }, { status: 409 });
  }

  // Generic error
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

---

## 5. Lead Assignment Algorithm

### Round-Robin Implementation

```typescript
async function assignLeadRoundRobin(activeAgents: Agent[]) {
  // Find last assigned lead
  const lastLead = await prisma.lead.findFirst({
    where: { assignedToId: { in: activeAgents.map((a) => a.id) } },
    orderBy: { createdAt: "desc" },
    select: { assignedToId: true },
  });

  if (!lastLead?.assignedToId) {
    return activeAgents[0].id; // Start with first agent
  }

  // Find next agent in sequence
  const currentIndex = activeAgents.findIndex(
    (a) => a.id === lastLead.assignedToId
  );
  const nextIndex = (currentIndex + 1) % activeAgents.length;

  return activeAgents[nextIndex].id;
}
```

### Workload Balancing

```typescript
async function assignLeadByWorkload(activeAgents: AgentWithLeads[]) {
  const agentWithLeastLeads = activeAgents.reduce((min, agent) =>
    agent.leads.length < min.leads.length ? agent : min
  );

  return agentWithLeastLeads.id;
}
```

### Why Round-Robin for MVP?

- Simple to understand and implement
- Perceived as fair by agents
- No complex weighting logic
- Easy to debug

### Future Enhancement: Smart Assignment

Consider ML-based assignment considering:

- Agent expertise (location, property type)
- Historical conversion rates
- Agent availability
- Time zone differences
- Language preferences

---

## 6. Scalability Considerations

### Current MVP Limitations

1. **No Authentication**: All endpoints open
2. **No Rate Limiting**: Vulnerable to abuse
3. **Monolithic Deployment**: Single server
4. **No Caching**: Database hit on every request
5. **Synchronous Processing**: No background jobs

### Scaling Roadmap

#### Phase 1: Production Ready (100-1000 leads/month)

- [ ] Add NextAuth.js for authentication
- [ ] Implement role-based access control
- [ ] Add rate limiting (express-rate-limit)
- [ ] Set up error monitoring (Sentry)
- [ ] Add logging (Winston + Logtail)

#### Phase 2: Growth Stage (1000-10000 leads/month)

- [ ] Implement Redis caching
  - Cache dashboard queries
  - Session storage
  - Rate limit storage
- [ ] Background job queue (Bull)
  - Send follow-up emails
  - Generate reports
  - Process webhooks
- [ ] Database optimization
  - Connection pooling (PgBouncer)
  - Read replicas for analytics
  - Query optimization

#### Phase 3: Scale Stage (10000+ leads/month)

- [ ] Microservices architecture
  - Lead service
  - Notification service
  - Analytics service
- [ ] Event-driven architecture (Kafka/RabbitMQ)
- [ ] Horizontal scaling
  - Kubernetes cluster
  - Auto-scaling based on load
- [ ] CDN for static assets
- [ ] Database sharding by region

### Performance Optimization

**Database Queries:**

```typescript
// ❌ Bad: N+1 query problem
const leads = await prisma.lead.findMany();
for (const lead of leads) {
  const agent = await prisma.agent.findUnique({
    where: { id: lead.assignedToId },
  });
}

// ✅ Good: Eager loading
const leads = await prisma.lead.findMany({
  include: { assignedTo: true },
});
```

**API Response Time Targets:**

- GET /api/leads: < 200ms
- POST /api/leads: < 500ms
- GET /api/dashboard: < 300ms

---

## 7. Security Considerations

### Current State (MVP)

- Basic input validation
- SQL injection prevention (Prisma parameterized queries)
- CORS configured

### Production Requirements

#### Authentication & Authorization

```typescript
// Middleware for protected routes
export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request });

  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }

  // Check role-based permissions
  if (!hasPermission(session.user.role, request.nextUrl.pathname)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

#### Data Validation with Zod

```typescript
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\+91\d{10}$/),
  email: z.string().email().optional(),
  source: z.enum([
    "WhatsApp",
    "Website",
    "Social Media",
    "Phone Call",
    "Lead Form",
  ]),
});

// In API route
const validationResult = leadSchema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json(
    { error: "Validation failed", details: validationResult.error },
    { status: 400 }
  );
}
```

#### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});
```

---

## 8. Integration Strategy

### Current Lead Sources

**1. Tally Forms**

- Webhook integration
- Real-time lead creation
- Field mapping configuration

**2. Google Forms**

- Google Apps Script trigger
- Batch processing
- CSV import fallback

**3. Manual Entry**

- Dashboard form
- Bulk upload (CSV)

### Future Integrations

#### WhatsApp Cloud API

```typescript
// Webhook handler for WhatsApp messages
POST / api / webhooks / whatsapp;

// Extract sender info and message
const { from, profile, text } = req.body.entry[0].changes[0].value;

// Create or update lead
await createLead({
  name: profile.name,
  phone: `+91${from}`,
  source: "WhatsApp",
  requirements: text.body,
});
```

#### Calendly Integration

```typescript
// Webhook for visit scheduling
POST / api / webhooks / calendly;

const { event, invitee } = req.body;

await scheduleVisit({
  leadEmail: invitee.email,
  visitDate: event.start_time,
  propertyId: extractPropertyId(event.location),
});
```

---

## 9. Monitoring & Observability

### Metrics to Track

**Business Metrics:**

- Leads per day/week/month
- Conversion rate by source
- Average time per pipeline stage
- Agent performance

**Technical Metrics:**

- API response times (p50, p95, p99)
- Error rates
- Database query performance
- Uptime

### Logging Strategy

```typescript
// Structured logging
logger.info("Lead created", {
  leadId: lead.id,
  source: lead.source,
  assignedTo: lead.assignedToId,
  timestamp: new Date().toISOString(),
});
```

### Alerting Rules

- Error rate > 1% → Page on-call
- API latency p95 > 500ms → Slack alert
- Database connections > 80% → Warning
- Failed payments → Email notification

---

## 10. Deployment Architecture

### MVP Deployment (Vercel + Supabase)

```
┌─────────────────┐
│     Vercel      │
│  ┌───────────┐  │
│  │   Next.js │  │
│  │   App     │  │
│  └───────────┘  │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│    Supabase     │
│  ┌───────────┐  │
│  │PostgreSQL │  │
│  └───────────┘  │
└─────────────────┘
```

**Cost Estimate:**

- Vercel Hobby: Free
- Supabase Free Tier: Free
- Total: $0/month (perfect for MVP!)

### Production Deployment

```
┌─────────────────────────────────────┐
│              Vercel                 │
│  ┌──────────┐  ┌────────────────┐  │
│  │Frontend  │  │   API Routes   │  │
│  │  (SSR)   │  │  (Serverless)  │  │
│  └──────────┘  └────────────────┘  │
└──────────┬──────────────┬──────────┘
           │              │
     ┌─────▼─────┐  ┌─────▼─────┐
     │   Redis   │  │  Neon DB  │
     │  (Cache)  │  │(PostgreSQL│
     └───────────┘  └───────────┘
```

---

## 11. Testing Strategy

### Unit Tests (Jest)

```typescript
describe("Lead Assignment", () => {
  it("should assign lead using round-robin", async () => {
    const agents = await createTestAgents(3);
    const assignedAgentId = await assignLead({ method: "round-robin" });

    expect(assignedAgentId).toBeDefined();
    expect(agents.map((a) => a.id)).toContain(assignedAgentId);
  });
});
```

### Integration Tests

```typescript
describe("POST /api/leads", () => {
  it("should create lead and assign agent", async () => {
    const response = await fetch("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        phone: "+91 9999999999",
        source: "Website",
      }),
    });

    expect(response.status).toBe(201);
    const lead = await response.json();
    expect(lead.assignedToId).toBeDefined();
  });
});
```

---

## 12. Development Workflow

### Git Branch Strategy

```
main (production)
  ↑
staging (pre-production)
  ↑
feature/lead-capture
feature/visit-scheduling
bugfix/assignment-logic
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run lint
      - run: npm run db:generate
      - run: npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 13. Conclusion

This MVP demonstrates a solid foundation for the Gharpayy CRM system with:

✅ **Clean Architecture**: Separation of concerns, modular design
✅ **Type Safety**: TypeScript throughout
✅ **Scalable Database**: Normalized schema with proper indexing
✅ **RESTful API**: Standard HTTP conventions
✅ **Modern UI**: Responsive, intuitive interface
✅ **Production-Ready**: Can handle real traffic immediately

### Next Steps

1. **Immediate** (Week 1-2):

   - Add authentication
   - Deploy to staging
   - User testing with actual agents

2. **Short-term** (Month 1-2):

   - WhatsApp integration
   - Automated follow-ups
   - Advanced analytics

3. **Long-term** (Month 3-6):
   - Mobile app
   - AI-powered lead scoring
   - Multi-city expansion support

---

**Document Version**: 1.0  
**Last Updated**: March 9, 2026  
**Author**: AI Assistant for Gharpayy
