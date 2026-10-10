-- ==============================================================================
-- SafarGo Production Database Schema & Security Policies (Supabase PostgreSQL)
-- Migration: 20261010000000_safargo_schema.sql
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'customer')),
    full_name TEXT NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email TEXT,
    city TEXT,
    district TEXT,
    address TEXT,
    shop_name TEXT,
    agent_status VARCHAR(30) NOT NULL DEFAULT 'pending_approval' CHECK (agent_status IN ('pending_approval', 'approved', 'rejected', 'suspended')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    referral_code TEXT,
    referred_by_code TEXT,
    referred_by_id TEXT,
    password TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.admin_settings (key, value, description)
VALUES 
    ('commission_rate', '19.34'::jsonb, 'Standard agent commission per eligible confirmed booking (₹)'),
    ('monthly_target', '150'::jsonb, 'Monthly confirmed booking target for agent fixed salary'),
    ('monthly_salary', '5000'::jsonb, 'Proposed monthly fixed salary for agents (₹)'),
    ('support_whatsapp', '"919876543210"'::jsonb, 'SafarGo centralized WhatsApp support number'),
    ('cancellation_reversal_policy', '"reverse_commission"'::jsonb, 'Policy when confirmed booking is cancelled')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = NOW();

-- 3. Bus Trips (Manual Inventory) Table
CREATE TABLE IF NOT EXISTS public.bus_trips (
    id TEXT PRIMARY KEY,
    operator_name TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    journey_date DATE NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    bus_type TEXT NOT NULL,
    seater_fare NUMERIC(10,2) DEFAULT 0,
    sleeper_fare NUMERIC(10,2) DEFAULT 0,
    available_seater INT DEFAULT 0,
    available_sleeper INT DEFAULT 0,
    boarding_points TEXT[] DEFAULT '{}',
    drop_points TEXT[] DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT,
    agent_mobile TEXT,
    idempotency_key TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    passenger_count INT NOT NULL DEFAULT 1 CHECK (passenger_count >= 1 AND passenger_count <= 10),
    passenger_details JSONB DEFAULT '[]'::jsonb,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    journey_date DATE NOT NULL,
    departure_time_pref TEXT,
    operator_preference TEXT,
    seat_category TEXT NOT NULL,
    seat_count INT NOT NULL DEFAULT 1 CHECK (seat_count >= 1),
    boarding_point TEXT NOT NULL,
    drop_point TEXT NOT NULL,
    estimated_fare NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_estimated_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    agent_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    status TEXT NOT NULL DEFAULT 'booking_request' CHECK (status IN (
        'booking_request',
        'awaiting_operator_confirmation',
        'confirmed',
        'rejected',
        'expired',
        'cancellation_requested',
        'cancelled'
    )),
    actual_fare NUMERIC(10,2),
    confirmed_seats TEXT,
    actual_operator TEXT,
    actual_boarding_point TEXT,
    actual_drop_point TEXT,
    ticket_pnr TEXT,
    ticket_doc_url TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    cancellation_reason TEXT,
    refund_status TEXT DEFAULT 'none' CHECK (refund_status IN (
        'none',
        'requested',
        'under_review',
        'approved',
        'processing',
        'completed',
        'rejected'
    )),
    refund_amount NUMERIC(10,2) DEFAULT 0,
    confirmed_by TEXT REFERENCES public.profiles(id),
    confirmed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Commission Ledger Table
CREATE TABLE IF NOT EXISTS public.commission_ledger (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    booking_code TEXT,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'credited' CHECK (status IN ('credited', 'reversed', 'paid')),
    reversal_ref_id TEXT REFERENCES public.commission_ledger(id),
    notes TEXT,
    entry_type TEXT DEFAULT 'booking_commission',
    referred_agent_id TEXT REFERENCES public.profiles(id),
    referred_agent_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Salary Records Table
CREATE TABLE IF NOT EXISTS public.salary_records (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT,
    agent_mobile TEXT,
    month_year VARCHAR(7) NOT NULL,
    target_bookings INT NOT NULL DEFAULT 150,
    confirmed_bookings INT NOT NULL DEFAULT 0,
    target_met BOOLEAN NOT NULL DEFAULT false,
    base_salary NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
    payable_salary NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'approved', 'paid')),
    approved_by TEXT REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    paid_by TEXT REFERENCES public.profiles(id),
    paid_at TIMESTAMPTZ,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_agent_salary_month UNIQUE (agent_id, month_year)
);

-- 7. Payout Requests Table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    agent_mobile VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payout_method VARCHAR(30) NOT NULL CHECK (payout_method IN ('upi', 'bank_transfer')),
    upi_id TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    bank_name TEXT,
    account_holder_name TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_reference TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT REFERENCES public.profiles(id),
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON public.bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_commission_agent_id ON public.commission_ledger(agent_id);
CREATE INDEX IF NOT EXISTS idx_salary_agent_month ON public.salary_records(agent_id, month_year);
CREATE INDEX IF NOT EXISTS idx_payout_agent_id ON public.payout_requests(agent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Transparent RLS policies allowing seamless client integration
DROP POLICY IF EXISTS "Profiles: Allow all access" ON public.profiles;
CREATE POLICY "Profiles: Allow all access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Settings: Allow all access" ON public.admin_settings;
CREATE POLICY "Settings: Allow all access" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bus Trips: Allow all access" ON public.bus_trips;
CREATE POLICY "Bus Trips: Allow all access" ON public.bus_trips FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings: Allow all access" ON public.bookings;
CREATE POLICY "Bookings: Allow all access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Commission: Allow all access" ON public.commission_ledger;
CREATE POLICY "Commission: Allow all access" ON public.commission_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Salary: Allow all access" ON public.salary_records;
CREATE POLICY "Salary: Allow all access" ON public.salary_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Payout: Allow all access" ON public.payout_requests;
CREATE POLICY "Payout: Allow all access" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Audit: Allow all access" ON public.audit_logs;
CREATE POLICY "Audit: Allow all access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Seed Super Admin Profile
INSERT INTO public.profiles (
    id, role, full_name, mobile, email, city, district, address, shop_name, agent_status, referral_code, password, created_at, updated_at
) VALUES (
    'usr-admin-01',
    'admin',
    'Jia Super Admin',
    '+91 98765 43210',
    'jia647155@gmail.com',
    'Jaipur',
    'Jaipur',
    'SafarGo Central Operations Command Center, MI Road',
    'SafarGo Headquarters',
    'approved',
    'SFG-HQ-ADMIN',
    'Jia@2233',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = 'admin',
    agent_status = 'approved';

-- Seed Initial Bus Routes Inventory
INSERT INTO public.bus_trips (
    id, operator_name, source, destination, journey_date, departure_time, arrival_time, bus_type,
    seater_fare, sleeper_fare, available_seater, available_sleeper, boarding_points, drop_points, is_active
) VALUES 
(
    'trip-001',
    'Mahalaxmi Travels Premium',
    'Delhi',
    'Jaipur',
    CURRENT_DATE + INTERVAL '1 day',
    '21:30',
    '03:45',
    'AC Sleeper / Seater 2+1',
    450.00,
    750.00,
    14,
    8,
    ARRAY['ISBT Kashmiri Gate', 'Dhaula Kuan', 'Mahipalpur', 'IFFCO Chowk Gurgaon'],
    ARRAY['Sindhi Camp', 'Transport Nagar', 'Narayan Singh Circle'],
    true
),
(
    'trip-002',
    'Shree Karni Kripa Express',
    'Jaipur',
    'Jodhpur',
    CURRENT_DATE + INTERVAL '1 day',
    '22:00',
    '05:30',
    'Bharat Benz AC Sleeper 2+1',
    500.00,
    850.00,
    10,
    12,
    ARRAY['Sindhi Camp Platform 3', '200 Ft Bypass Ajmer Road'],
    ARRAY['Paota Circle', 'Railway Station Jodhpur'],
    true
),
(
    'trip-003',
    'Rishabh Travels Multi-Axle',
    'Delhi',
    'Udaipur',
    CURRENT_DATE + INTERVAL '1 day',
    '19:00',
    '07:15',
    'Volvo 9600 Multi-Axle Semi-Sleeper',
    800.00,
    1250.00,
    18,
    6,
    ARRAY['Kashmiri Gate Metro Gate 1', 'Dhaula Kuan', 'IFFCO Chowk'],
    ARRAY['Udiapole', 'Retic Circle'],
    true
)
ON CONFLICT (id) DO NOTHING;

-- 9. Wallet Balance & Prepaid Advance Booking System
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0;

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'safargo_qr';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_verification';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_utr TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

CREATE TABLE IF NOT EXISTS public.wallet_recharge_requests (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_name TEXT,
    agent_mobile TEXT,
    amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'upi_qr',
    utr_number TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    type TEXT NOT NULL,
    booking_id TEXT,
    booking_code TEXT,
    recharge_id TEXT,
    description TEXT,
    balance_after NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wallet_recharge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
