# Quick Reference Card - Gharpayy CRM MVP

## 🚀 Getting Started (3 minutes)

```bash
cd gharpayy-crm
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

---

## 📡 API Endpoints

### Create Lead

```bash
POST /api/leads
{
  "name": "John",
  "phone": "+91 9876543210",
  "source": "Website"
}
```

### Get Dashboard

```bash
GET /api/dashboard
```

### List Leads

```bash
GET /api/leads?status=NEW_LEAD&search=john
```

### Update Status

```bash
PATCH /api/leads/[id]/status
{
  "status": "CONTACTED",
  "agentId": "abc123"
}
```

### Schedule Visit

```bash
POST /api/visits
{
  "leadId": "xyz",
  "propertyId": "prop123",
  "scheduledBy": "agent123",
  "visitDate": "2026-03-15",
  "visitTime": "10:00 AM"
}
```

---

## 🗄️ Database Schema

**Agents**: id, name, email, phone, isActive  
**Leads**: id, name, phone, email, source, status, priority, assignedToId  
**Properties**: id, name, address, location, type, price  
**Visits**: id, leadId, propertyId, scheduledBy, visitDate, visitTime, status  
**Activities**: id, leadId, agentId, type, description

---

## 📊 Pipeline Stages

1. NEW_LEAD
2. CONTACTED
3. REQUIREMENT_COLLECTED
4. PROPERTY_SUGGESTED
5. VISIT_SCHEDULED
6. VISIT_COMPLETED
7. BOOKED
8. LOST

---

## 🎯 Assignment Algorithms

**Round-Robin**: Cycles through agents fairly  
**Workload**: Assigns to agent with fewest active leads  
**Manual**: Specify preferred agent

---

## 🔧 npm Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (visual DB editor)
```

---

## 📁 Key Files

```
app/
  api/
    leads/route.ts       # Lead CRUD
    visits/route.ts      # Visit scheduling
    dashboard/route.ts   # Analytics
  dashboard/page.tsx     # Dashboard UI
  leads/page.tsx         # Leads management
lib/services/
  lead-service.ts        # Business logic
prisma/
  schema.prisma          # Database schema
  seed.ts                # Sample data
```

---

## 🌐 Pages

- `/` - Landing page
- `/dashboard` - Analytics dashboard
- `/leads` - Lead management

---

## 💾 Environment Variables

```env
DATABASE_URL="postgresql://..."
```

Get free PostgreSQL at:

- https://neon.tech
- https://supabase.com

---

## 🧪 Test Commands

```bash
# Create lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+919999999999","source":"Website"}'

# Get analytics
curl http://localhost:3000/api/dashboard | jq

# List agents
curl http://localhost:3000/api/agents | jq
```

---

## 📋 Sample Data Created

**3 Agents**: Rajesh Kumar, Priya Sharma, Amit Patel  
**3 Properties**: Sunrise PG, Green Valley, Student Hub  
**3 Leads**: Different stages for testing

---

## 🚨 Troubleshooting

**Can't connect to database?**

- Check DATABASE_URL format
- Ensure no quotes around connection string
- Verify database is accessible

**Prisma errors?**

```bash
npm run db:generate
npm run db:push
```

**Port 3000 in use?**

```bash
PORT=3001 npm run dev
```

---

## 📈 Next Steps

1. Set up authentication
2. Integrate WhatsApp API
3. Add bulk upload
4. Implement automated follow-ups
5. Build mobile app

---

## 📞 Support

- README.md - Full documentation
- SETUP.md - Detailed setup guide
- TECHNICAL_DOCS.md - Architecture deep-dive
- SUBMISSION.md - Complete feature list

Email: gharpayy@gmail.com

---

**Built with**: Next.js + TypeScript + Prisma + PostgreSQL  
**Lines of Code**: 2000+  
**Features**: All 6 core + 8 bonus ✅  
**Time**: 48 hours
