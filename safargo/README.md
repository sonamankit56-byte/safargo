# SafarGo Mobility & Agricultural Services Platform
> **Brand Tagline:** *अब हर सफर होगा आसान*  
> **Mission:** Building a transparent travel booking, agent distribution, and agricultural marketplace platform from scratch.

---

## 1. Architectural Model & Business Philosophy

### The Manual Assisted Booking Model
SafarGo operates on a **strictly authentic manual bus booking model**:
- **No Speculative Inventory:** SafarGo never invents fake bus seats, fabricated schedules, or speculative PNRs.
- **Dedicated 15-Minute Assistance Target:** Once a customer or agent submits a booking request, an internal reference (`SFG-2026-XXXXXX`) is generated and placed into the authorized operations queue. Staff coordinate directly with the verified bus operator to confirm actual seat availability.
- **Genuine Operator PNR Confirmation:** A booking is marked **Confirmed** only after a real, authorized bus operator PNR is entered.
- **Delayed-Response Handling:** If an operator response exceeds the 15-minute service target, the system alerts operations staff and offers the customer direct WhatsApp desk connectivity.

---

## 2. All 12 SafarGo Subdomains

The application uses **hostname-aware routing**. When deployed to custom domains or accessed in local development, each subdomain dynamically loads its own dedicated portal:

| # | Subdomain | Portal Name | Primary Functionality |
|---|---|---|---|
| 1 | `www.safargo.in` | Main Public Portal | Brand intro, bus search widget, configured routes, Go Agent highlights, Kisan intro, offers, FAQs. |
| 2 | `book.safargo.in` | Customer Booking | Route search, 15-minute manual booking request, assistance timer, status lookup by reference, official receipts, cancellations. |
| 3 | `agent.safargo.in` | Regular Agent Hub | Agent registration, KYC verification, book for walk-in customers, commission ledger, referral code. |
| 4 | `go.safargo.in` | Special Go Agent HQ | Monthly 150-booking target tracker, ₹5,000 fixed salary ledger, ₹19.34/booking commission ledger, ₹100 referral bonuses. |
| 5 | `admin.safargo.in` | Central Operations | Manual booking queue, delayed alerts, operator confirmations with real PNR, Go Agent config settings, refunds, audit logs. |
| 6 | `operator.safargo.in`| Bus Operator Desk | Operator profile, assigned booking requests, schedule management, availability response, genuine PNR entry. |
| 7 | `kisan.safargo.in` | Kisan Agricultural Portal | Farmer registration, crop listings (harvest date, quintals, rate), buyer inquiries, rural Mandi transport pickup. |
| 8 | `buyer.safargo.in` | Agri Mandi Buyer Desk | Buyer registration, APMC trader license, browse farmer crop listings, submit price offers and purchase inquiries. |
| 9 | `transport.safargo.in`| Kisan Logistics Desk | Transporter registration, vehicle details, available rural loads, trip status updates (Assigned → In-Transit → Delivered). |
| 10 | `pay.safargo.in` | Payment & Receipts | Reference-based payment lookup, verified transaction receipts, strict status separation, refund progress. |
| 11 | `help.safargo.in` | Customer Support | Comprehensive FAQs, official support tickets (`TKT-2026-XXXX`), priority status, resolution tracking. |
| 12 | `partner.safargo.in` | Business Partner Network | B2B travel partners, campaign tracking, volume metrics, and monthly settlements. |

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Routing:** Hostname-aware Subdomain Router (`PortalContext`).
- **Database & Auth:** Supabase PostgreSQL, Row Level Security (RLS) policies, version-controlled SQL migrations.
- **Testing:** Vitest automated test suite verifying booking workflows, agent commissions, idempotency, and subdomains.
- **Deployment:** Vercel-ready with `vercel.json` SPA wildcard rewrites and security headers.

---

## 4. Special Go Agent Program Rules

The Go Agent program is designed with strictly auditable financial logic:
1. **Configurable Settings (Admin Managed):**
   - **Monthly Target:** 150 eligible confirmed bookings.
   - **Fixed Monthly Salary:** ₹5,000 (subject to employment terms).
   - **Commission:** ₹19.34 per eligible confirmed booking.
   - **Referral Reward:** ₹100 upon referred agent completing 5 confirmed bookings.
2. **Commission Integrity:**
   - Commission is credited **strictly on genuine confirmed bookings**.
   - Pending, rejected, or cancelled requests receive **zero commission**.
   - Unique constraints prevent duplicate commission crediting for the same booking.
   - Fixed salary and per-booking commissions are maintained in separate auditable ledgers.

---

## 5. Local Development & Testing Instructions

### Prerequisites
- Node.js (v20+)
- npm (v10+)

### Setup
```bash
# 1. Navigate to the project directory
cd safargo

# 2. Install dependencies (if not already installed)
npm install --legacy-peer-deps

# 3. Run development server
npm run dev
```

### Testing Subdomains Locally
1. **Interactive Subdomain Bar:** A top bar is provided in development allowing instant one-click switching across all 12 subdomains without needing DNS adjustments.
2. **URL Query Parameter:** You can visit any portal directly via URL parameter:
   - `http://localhost:5173/?portal=www`
   - `http://localhost:5173/?portal=book`
   - `http://localhost:5173/?portal=agent`
   - `http://localhost:5173/?portal=go`
   - `http://localhost:5173/?portal=admin`
   - `http://localhost:5173/?portal=operator`
   - `http://localhost:5173/?portal=kisan`
   - `http://localhost:5173/?portal=buyer`
   - `http://localhost:5173/?portal=transport`
   - `http://localhost:5173/?portal=pay`
   - `http://localhost:5173/?portal=help`
   - `http://localhost:5173/?portal=partner`
3. **Local Subdomain Emulation (Hosts File):**
   Add the following to your `hosts` file (`C:\Windows\System32\drivers\etc\hosts`):
   ```
   127.0.0.1 book.localhost
   127.0.0.1 agent.localhost
   127.0.0.1 go.localhost
   127.0.0.1 admin.localhost
   ```

### Running Automated Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 6. Supabase Database Setup & Migrations

The database schema and Row Level Security policies are located at:
`supabase/migrations/20261017000001_safargo_initial_schema.sql`

To apply to your Supabase project:
1. Create a fresh project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Copy and run the entire SQL script from `20261017000001_safargo_initial_schema.sql`.
4. Copy your Project URL and Public Anon Key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 7. Vercel & Custom Domain DNS Instructions

### Vercel Deployment
1. Import the repository into Vercel.
2. Ensure Framework Preset is **Vite**.
3. Set the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy.

### Configuring All 12 Subdomains in DNS:
Add the following CNAME records pointing to `cname.vercel-dns.com`:
- `www.safargo.in` → `cname.vercel-dns.com`
- `book.safargo.in` → `cname.vercel-dns.com`
- `agent.safargo.in` → `cname.vercel-dns.com`
- `go.safargo.in` → `cname.vercel-dns.com`
- `admin.safargo.in` → `cname.vercel-dns.com`
- `operator.safargo.in` → `cname.vercel-dns.com`
- `kisan.safargo.in` → `cname.vercel-dns.com`
- `buyer.safargo.in` → `cname.vercel-dns.com`
- `transport.safargo.in` → `cname.vercel-dns.com`
- `pay.safargo.in` → `cname.vercel-dns.com`
- `help.safargo.in` → `cname.vercel-dns.com`
- `partner.safargo.in` → `cname.vercel-dns.com`

---

## 8. Audit & Security Verification

- **Role Simulation & RBAC:** Accessible via the top Subdomain Bar, allowing reviewers to verify behavior under every user persona (`admin`, `go_agent`, `agent`, `operator`, `customer`, `farmer`, `buyer`, `transporter`, `partner`).
- **Immutable Audit Logging:** Every booking creation, confirmation, rejection, status change, and business parameter update writes to the audit log.
- **Status Separation:** Prevents mixing booking status with payment or ticket status.
