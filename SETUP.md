# Gharpayy CRM MVP - Setup Instructions

## Quick Start (5 minutes)

### Step 1: Set up Database

**Option A: Use Neon (Free, Recommended)**

1. Go to https://neon.tech
2. Sign up for free account
3. Create new project: "gharpayy-crm"
4. Copy the connection string (looks like `postgresql://...`)

**Option B: Use Supabase (Free)**

1. Go to https://supabase.com
2. Create new project
3. Go to Project Settings → Database
4. Copy the "Connection string (URI)"

**Option C: Local PostgreSQL**

```bash
createdb gharpayy_crm
# Connection string: postgresql://localhost:5432/gharpayy_crm
```

### Step 2: Configure Environment

```bash
cd gharpayy-crm

# Copy example env file
cp .env.example .env

# Edit .env and paste your DATABASE_URL
nano .env
```

Your `.env` should look like:

```env
DATABASE_URL="postgresql://your-connection-string-here"
```

### Step 3: Install & Initialize

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### Step 4: Run Application

```bash
npm run dev
```

Open http://localhost:3000

## Testing the MVP

### 1. View Dashboard

Navigate to: http://localhost:3000/dashboard

You should see:

- Total leads: 3
- Pipeline distribution
- Agent performance table

### 2. View Leads

Navigate to: http://localhost:3000/leads

You should see:

- Rahul Verma (NEW_LEAD)
- Sneha Reddy (CONTACTED)
- Arjun Singh (VISIT_SCHEDULED)

### 3. Test Lead Creation API

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "phone": "+91 9876543210",
    "email": "test@example.com",
    "source": "Website",
    "budget": "12000-15000",
    "location": "Koramangala",
    "requirements": "Need 1BHK near my office"
  }'
```

Response should include assigned agent details.

### 4. Test Dashboard API

```bash
curl http://localhost:3000/api/dashboard | jq
```

### 5. Test Lead Status Update

```bash
curl -X PATCH http://localhost:3000/api/leads/[LEAD_ID]/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED",
    "agentId": "[AGENT_ID]",
    "notes": "Spoke to customer, requirements collected"
  }'
```

Get LEAD_ID and AGENT_ID from:

```bash
curl http://localhost:3000/api/leads | jq '.leads[].id'
curl http://localhost:3000/api/agents | jq '.[].id'
```

## Integration Examples

### Connect Tally Form

1. Open your Tally form: https://tally.so/r/m66B1A
2. Go to Settings → Webhooks
3. Add webhook URL: `https://your-domain.com/api/leads`
4. Map fields:
   ```json
   {
     "name": "{{answer_abc123}}",
     "phone": "{{answer_xyz789}}",
     "email": "{{answer_email}}",
     "source": "Lead Form",
     "budget": "{{answer_budget}}",
     "location": "{{answer_location}}",
     "accommodationType": "{{answer_type}}",
     "requirements": "{{answer_requirements}}"
   }
   ```

### Connect Google Form

Create Google Apps Script:

```javascript
function onFormSubmit(e) {
  const values = e.values;

  const payload = {
    name: values[1], // Assuming name is column B
    phone: values[2],
    email: values[3],
    source: "Google Form",
    budget: values[4],
    location: values[5],
    requirements: values[6],
  };

  fetch("https://your-domain.com/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
```

## Troubleshooting

### Error: "Can't reach database server"

- Check your DATABASE_URL in `.env`
- Make sure there are no quotes around the connection string
- Verify database is accessible (not blocked by firewall)

### Error: "Prisma Client not generated"

```bash
npm run db:generate
```

### Error: "Table doesn't exist"

```bash
npm run db:push
```

### Port 3000 already in use

```bash
PORT=3001 npm run dev
```

## Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard:

1. Go to project settings
2. Environment Variables
3. Add `DATABASE_URL`

### Custom Domain

1. Buy domain (e.g., crm.gharpayy.com)
2. In Vercel: Settings → Domains → Add domain
3. Update DNS records as instructed

## Next Steps

### Week 1: User Testing

- [ ] Have agents use the dashboard daily
- [ ] Collect feedback on UI/UX
- [ ] Track bugs and issues

### Week 2-3: Enhancements

- [ ] Add authentication (NextAuth.js)
- [ ] Implement WhatsApp integration
- [ ] Build bulk upload feature
- [ ] Add export to Excel

### Month 2: Scale

- [ ] Set up monitoring (Sentry)
- [ ] Optimize slow queries
- [ ] Add caching layer
- [ ] Implement background jobs

## Support

For issues or questions:

- Check README.md
- Check TECHNICAL_DOCS.md
- Email: gharpayy@gmail.com

---

**MVP Built in**: 48 hours
**Tech Stack**: Next.js + TypeScript + Prisma + PostgreSQL
**Lines of Code**: ~2000+
**Features Delivered**: All 6 core requirements ✅
