import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.qkttyqjyfbifdatyaprv:Ankitiji8899@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Connecting to PostgreSQL to run migration...');
  await client.connect();

  const sql = `
  -- 1. SafarGo Agents Table
  CREATE TABLE IF NOT EXISTS public.safargo_agents (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL,
    shop_name TEXT,
    business_type TEXT,
    city TEXT,
    address TEXT,
    pincode TEXT,
    pan_number TEXT,
    aadhaar_number TEXT,
    gstin TEXT,
    account_holder TEXT,
    account_number TEXT,
    ifsc TEXT,
    bank_name TEXT,
    settlement_upi_id TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    suspend_reason TEXT,
    applied_date TEXT,
    approved_date TEXT,
    role TEXT DEFAULT 'agent',
    profile_photo TEXT,
    is_photo_locked BOOLEAN DEFAULT FALSE,
    password TEXT,
    approval_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 2. SafarGo Travel Bookings Table
  CREATE TABLE IF NOT EXISTS public.safargo_bookings (
    id TEXT PRIMARY KEY,
    booking_type TEXT DEFAULT 'bus',
    pnr TEXT UNIQUE NOT NULL,
    booking_date TEXT NOT NULL,
    travel_date TEXT NOT NULL,
    status TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    utr TEXT,
    is_agent_booking BOOLEAN DEFAULT FALSE,
    agent_commission_amount NUMERIC(10, 2) DEFAULT 0,
    agent_id TEXT,
    agent_email TEXT,
    verified_by_admin BOOLEAN DEFAULT FALSE,
    verified_at TEXT,
    rejection_reason TEXT,
    passenger_details JSONB,
    bus_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 3. SafarGo Wallet Top-Up Requests Table
  CREATE TABLE IF NOT EXISTS public.safargo_wallet_topups (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    shop_name TEXT,
    mobile TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    utr TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending_audit',
    rejection_reason TEXT,
    is_flagged_fake BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 4. SafarGo Support Tickets Table
  CREATE TABLE IF NOT EXISTS public.safargo_support_tickets (
    id TEXT PRIMARY KEY,
    booking_pnr TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    resolution_note TEXT,
    user_mobile TEXT NOT NULL,
    user_name TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 5. SafarGo Referrals Table
  CREATE TABLE IF NOT EXISTS public.safargo_referrals (
    id TEXT PRIMARY KEY,
    referrer_agent_id TEXT NOT NULL,
    referred_name TEXT NOT NULL,
    referred_shop TEXT,
    referred_mobile TEXT NOT NULL,
    date TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_reward_paid BOOLEAN DEFAULT FALSE,
    completed_bookings INTEGER DEFAULT 0,
    completion_reward_paid BOOLEAN DEFAULT FALSE,
    total_earned NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 6. SafarGo Fleet Buses Table
  CREATE TABLE IF NOT EXISTS public.safargo_fleet_buses (
    id TEXT PRIMARY KEY,
    operator_name TEXT NOT NULL,
    bus_type TEXT NOT NULL,
    source_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration TEXT NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    original_fare NUMERIC(10, 2),
    discount_percent INTEGER,
    rating NUMERIC(3, 1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 100,
    is_primo BOOLEAN DEFAULT FALSE,
    has_live_tracking BOOLEAN DEFAULT TRUE,
    available_seats INTEGER DEFAULT 36,
    amenities JSONB,
    boarding_points JSONB,
    dropping_points JSONB,
    seats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 7. SafarGo App Config Table (e.g. Admin QR Code)
  CREATE TABLE IF NOT EXISTS public.safargo_app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 8. GRANT Permissions to anon & authenticated Supabase Roles
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

  -- 9. Enable Row Level Security and Open Access Policies for Public Client Apps
  ALTER TABLE public.safargo_agents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.safargo_bookings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.safargo_wallet_topups ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.safargo_support_tickets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.safargo_referrals ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.safargo_fleet_buses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.safargo_app_config ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Allow public all access on safargo_agents" ON public.safargo_agents;
  CREATE POLICY "Allow public all access on safargo_agents" ON public.safargo_agents FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow public all access on safargo_bookings" ON public.safargo_bookings;
  CREATE POLICY "Allow public all access on safargo_bookings" ON public.safargo_bookings FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow public all access on safargo_wallet_topups" ON public.safargo_wallet_topups;
  CREATE POLICY "Allow public all access on safargo_wallet_topups" ON public.safargo_wallet_topups FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow public all access on safargo_support_tickets" ON public.safargo_support_tickets;
  CREATE POLICY "Allow public all access on safargo_support_tickets" ON public.safargo_support_tickets FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow public all access on safargo_referrals" ON public.safargo_referrals;
  CREATE POLICY "Allow public all access on safargo_referrals" ON public.safargo_referrals FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow public all access on safargo_fleet_buses" ON public.safargo_fleet_buses;
  CREATE POLICY "Allow public all access on safargo_fleet_buses" ON public.safargo_fleet_buses FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow public all access on safargo_app_config" ON public.safargo_app_config;
  CREATE POLICY "Allow public all access on safargo_app_config" ON public.safargo_app_config FOR ALL USING (true) WITH CHECK (true);

  -- 10. Force PostgREST schema cache reload
  NOTIFY pgrst, 'reload schema';
  `;

  console.log('Executing DDL SQL script...');
  await client.query(sql);
  console.log('✅ Migration executed successfully!');

  // Seed super admin
  console.log('Seeding Super Admin...');
  await client.query(`
    INSERT INTO public.safargo_agents (
      id, full_name, mobile, email, shop_name, business_type, city, address, pincode,
      pan_number, aadhaar_number, account_holder, account_number, ifsc, bank_name,
      settlement_upi_id, is_approved, is_suspended, role, password
    ) VALUES (
      'SFG-ADMIN-001', 'Jia SafarGo (Super Admin)', '9876543210', 'jia647155@gmail.com',
      'SafarGo Central Head Office', 'admin', 'Indore', 'SafarGo HQ, Vijay Nagar, Indore', '452010',
      'ADMIN1234F', '999988887777', 'SafarGo Super Admin', '999900001111', 'SBIN0001234',
      'State Bank of India (SBI)', 'jia647155@upi', TRUE, FALSE, 'admin', 'admin@safargo2026'
    )
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, is_approved = TRUE;
  `);

  console.log('Seeding Demo Agent (Rajesh Verma)...');
  await client.query(`
    INSERT INTO public.safargo_agents (
      id, full_name, mobile, email, shop_name, business_type, city, address, pincode,
      pan_number, aadhaar_number, account_holder, account_number, ifsc, bank_name,
      settlement_upi_id, is_approved, is_suspended, role, password, applied_date, approved_date
    ) VALUES (
      'SFG-AGENT-2026-9041', 'Rajesh Verma', '9876543210', 'rajesh.agent@safargo.com',
      'Verma CSC & Travel Point', 'csc_center', 'Indore', 'Shop 4, Annapurna Road, Indore', '452009',
      'ABCDE1234F', '987654321098', 'Rajesh Verma', '987654321012', 'SBIN0004910',
      'State Bank of India', '9876543210@upi', TRUE, FALSE, 'agent', 'safargo@agent2026', '12 Oct 2026', '12 Oct 2026'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('Reloading schema cache...');
  await client.query("NOTIFY pgrst, 'reload schema';");

  await client.end();
  console.log('🎉 SUPABASE DATABASE SCHEMA & SEED COMPLETE!');
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
