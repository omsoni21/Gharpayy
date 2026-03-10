# Gharpayy Lead Management System - MVP

A comprehensive CRM system for managing PG accommodation leads with automated capture, intelligent assignment, and complete pipeline tracking.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud-hosted)
- npm or yarn

### Installation

1. **Setup Database**

   ```bash
   # Copy environment example
   cp .env.example .env

   # Update with your PostgreSQL connection string
   # You can use:
   # - Local PostgreSQL: postgresql://localhost:5432/gharpayy_crm
   # - Supabase (free): https://supabase.com
   # - Neon (free): https://neon.tech
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Initialize Database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to `http://localhost:3000`

## 📋 Features Implemented

### 1. Lead Capture ✅

- **Multi-source Integration**: WhatsApp, Website, Social Media, Phone Calls, Lead Forms
- **Automatic Lead Profile Creation**: Name, Phone, Email, Source, Timestamp
- **Duplicate Detection**: Prevents duplicate phone numbers
- **Auto-assignment**: Leads automatically assigned to agents

### 2. Lead Assignment ✅

- **Round-Robin Distribution**: Fair distribution among agents
- **Workload Balancing**: Assign to agent with least active leads
- **Manual Override**: Ability to assign to specific agent
- **Clear Ownership**: Each lead has one assigned agent

### 3. Pipeline Management ✅

Complete sales funnel with 8 stages:

1. New Lead
2. Contacted
3. Requirement Collected
4. Property Suggested
5. Visit Scheduled
6. Visit Completed
7. Booked
8. Lost

### 4. Visit Scheduling ✅

- Select from available properties
- Choose date and time slots
- Track visit outcomes
- Automatic status updates

### 5. Follow-up Reminders ✅

- Automatic Day 1 follow-up reminder
- Next follow-up date tracking
- Dashboard shows pending follow-ups

### 6. Dashboard & Analytics ✅

- Total leads received
- Pipeline stage distribution
- Visits scheduled
- Bookings confirmed
- Conversion rates
- Agent performance leaderboard

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (React) + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Database Schema

```
Agents (1) ──< (N) Leads
Leads (1) ──< (N) Activities
Leads (1) ──< (N) Visits
Properties (1) ──< (N) Visits
Leads (1) ──< (N) Notes
```

### API Endpoints

#### Leads

- `POST /api/leads` - Create new lead
- `GET /api/leads` - List all leads (with filters)
- `GET /api/leads/[id]` - Get specific lead details
- `PATCH /api/leads/[id]/status` - Update lead status

#### Visits

- `POST /api/visits` - Schedule new visit
- `GET /api/visits` - List visits

#### Properties

- `GET /api/properties` - List all properties
- `POST /api/properties` - Add new property

#### Agents

- `GET /api/agents` - List all agents

#### Dashboard

- `GET /api/dashboard` - Get analytics and metrics

## 📱 Usage Examples

### Creating a Lead via API

```javascript
// Example: Webhook from Tally form
const response = await fetch("/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john@example.com",
    source: "Lead Form", // or 'WhatsApp', 'Website', etc.
    budget: "10000-15000",
    location: "Indiranagar",
    accommodationType: "Single Room",
    requirements: "Looking for peaceful area near office",
  }),
});

const lead = await response.json();
// Lead is automatically assigned to an agent!
```

### Integrating with Form Sources

**Tally Forms:**

1. Go to your Tally form settings
2. Add webhook: `https://your-domain.com/api/leads`
3. Map form fields to API payload

**Google Forms:**
Use Google Apps Script to send POST requests:

```javascript
function onFormSubmit(e) {
  const formData = e.values;
  fetch("https://your-domain.com/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData[1],
      phone: formData[2],
      email: formData[3],
      source: "Lead Form",
      // ... map other fields
    }),
  });
}
```

**WhatsApp Business API:**
Integrate with Meta's WhatsApp Cloud API to capture incoming messages as leads.

## 🎯 Pages

- **Home** (`/`) - Landing page with feature overview
- **Dashboard** (`/dashboard`) - Analytics and metrics
- **Leads** (`/leads`) - Lead management and filtering

## 🔐 Security Considerations

For production deployment:

1. **Authentication**: Implement NextAuth.js (already installed)
2. **Authorization**: Role-based access control (Admin, Agent, Manager)
3. **Rate Limiting**: Protect API endpoints
4. **Data Validation**: Zod schemas for input validation
5. **Audit Logging**: All activities tracked

## 📈 Scaling for Production

### Database Optimization

- Add indexes on frequently queried fields (phone, status, assignedToId)
- Use connection pooling (PgBouncer)
- Partition large tables by date

### Performance

- Implement caching (Redis) for dashboard queries
- Use React Query for client-side caching
- Paginate large lead lists

### Infrastructure

- Deploy on Vercel (frontend + API)
- Use managed PostgreSQL (Supabase/Neon)
- Set up monitoring (Sentry, LogRocket)

### Integrations Roadmap

- WhatsApp Cloud API integration
- Twilio for SMS/calls
- Email automation (SendGrid)
- Calendar sync (Google Calendar API)
- Automated follow-up sequences

## 🧪 Testing the MVP

1. **Test Lead Creation**

   ```bash
   curl -X POST http://localhost:3000/api/leads \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "phone": "+91 9999999999",
       "email": "test@example.com",
       "source": "Website"
     }'
   ```

2. **View Dashboard**
   Navigate to `/dashboard` to see real-time analytics

3. **Browse Leads**
   Visit `/leads` to see all captured leads

## 📝 Sample Data

The seed script creates:

- 3 sample agents
- 3 properties in different locations
- 3 leads at different pipeline stages
- Sample activities and visits

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

### Docker

```bash
docker build -t gharpayy-crm .
docker run -p 3000:3000 --env-file .env gharpayy-crm
```

## 💡 Future Enhancements

- [ ] WhatsApp API integration
- [ ] Automated reassignment if agent inactive
- [ ] Lead activity timeline visualization
- [ ] Advanced analytics and reporting
- [ ] Mobile app for agents
- [ ] Bulk SMS/Email campaigns
- [ ] Document management
- [ ] Payment tracking

## 📞 Support

For questions or issues, contact: gharpayy@gmail.com

---

**Built with ❤️ for Gharpayy**
