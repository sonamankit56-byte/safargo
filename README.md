# SafarGo (सफ़ारगो) - Rural & Semi-Urban Bus Booking & Agent Network Platform

> **"अब हर सफर होगा आसान"**  
> Empowering rural Village Level Entrepreneurs (VLEs), CSC kiosk operators, and local shopkeepers with zero-inventory manual bus ticketing, live 15-minute verification deadlines, transparent commission wallets, and Supabase PostgreSQL cloud sync.

---

## 🌟 Key Features

### 1. Agent Network & Ticket Booking
- **Manual Booking Requests:** Agents submit customer travel requirements (source, destination, date, seats, bus type preference).
- **15-Minute Operational Deadline:** Strict 15-minute confirmation countdown timer with audible warning alerts.
- **WhatsApp Integration:** 1-click formatted booking message generator sent directly to SafarGo Central Support Desk.
- **Instant Commission Ledger:** ₹19.34 credited per eligible confirmed booking.
- **Monthly Fixed Salary Target:** ₹5,000 monthly fixed salary tracking for achieving 150 confirmed bookings/month.
- **Commission Wallet & Payout Requests:** Agents can request withdrawals via UPI or Bank Transfer.
- **Refer & Earn Program:** ₹50 referral cash bonus awarded when referred agent completes 5 confirmed bookings.

### 2. Admin Operations Command Center
- **Operator Verification & PNR Issuance:** Admin verifies seats with private bus operators, updates PNR, boarding/drop points, and uploads ticket docs.
- **Agent KYC & Approval Workflow:** Review pending agent applications, verify village/CSC location, and approve or suspend IDs.
- **Payout Management:** Review agent withdrawal requests, record bank UTR payment references, and approve payouts.
- **Dynamic Platform Announcements:** Broadcast urgent notices, festival offers, or system alerts across the network.
- **Custom Functionality Builder:** Dynamically add new service modules (Tatkal, Parcel Booking, Train Inquiry) directly from settings without writing code.
- **Live Database Status:** Real-time indicator for Supabase PostgreSQL cloud connectivity.

### 3. Dual-Engine Architecture (Cloud DB + Offline Fallback)
- **Supabase PostgreSQL:** Seamless integration with real PostgreSQL database, Row-Level Security (RLS), and automated tables.
- **Zero-Downtime Fallback:** Seamless fallback to browser LocalStorage when cloud credentials are unconfigured, ensuring zero downtime or blank screens.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Icons:** Lucide React
- **Testing:** Vitest (33 automated unit tests)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **State Management:** React Context API (`AuthContext`, `DataContext`, `ToastContext`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/safargo.git
cd safargo

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available at `http://localhost:5173` or `http://localhost:3000`.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a free account and new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of [`supabase/migrations/20261010000000_safargo_schema.sql`](supabase/migrations/20261010000000_safargo_schema.sql) and click **Run**.
4. Copy your **Project URL** and **anon public key** from **Project Settings > API**.
5. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Running Automated Tests

```bash
npm run test
```

All 33 unit tests verify:
- Secure role isolation (Admin, Approved Agent, Pending Agent)
- 15-minute deadline auto-expiration
- Atomic ₹19.34 commission calculation & reversal logic
- Target-based ₹5,000 monthly salary tracking
- Payout balance validation & UTR recording
- Database dual-engine fallback safety

---

## 🔒 Security & Roles

- **Super Admin:** Primary administrative access for operations and payouts (`jia647155@gmail.com`).
- **Agents:** Restricted to submitting booking requests, viewing own commissions, and requesting wallet payouts.
- **Pending Registration Notice:** New agent registrations require administrative verification before live booking access is granted.

---

## 📄 License

Proprietary - SafarGo Technologies. All rights reserved.
