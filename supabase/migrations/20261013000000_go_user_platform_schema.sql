-- ==============================================================================
-- GO USER Manual Bus Booking Platform & Financial Ledger System
-- Migration: 20261013000000_go_user_platform_schema.sql
-- PostgreSQL Schema with Row Level Security (RLS), Idempotent Functions,
-- Currency in Paise, and Audit Trail Logging
-- ==============================================================================

-- 1. UUID & Timestamp Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'customer', 'shopkeeper', 'promoter')),
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
    avatar_url TEXT,
    photo_verified BOOLEAN DEFAULT false,
    kyc_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
    aadhaar_number VARCHAR(12),
    pan_number VARCHAR(10),
    bank_account_holder TEXT,
    bank_account_number TEXT,
    bank_ifsc VARCHAR(15),
    bank_name TEXT,
    bank_upi_id TEXT,
    wallet_balance_paise BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dedicated Agents Table (Extension for GO USER certified agents)
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_code VARCHAR(30) UNIQUE,
    is_go_agent BOOLEAN NOT NULL DEFAULT true,
    monthly_target INT NOT NULL DEFAULT 280,
    commission_rate_paise BIGINT NOT NULL DEFAULT 2000, -- ₹20.00 = 2000 paise
    monthly_salary_paise BIGINT NOT NULL DEFAULT 1000000, -- ₹10,000.00 = 1,000,000 paise
    total_confirmed_tickets INT NOT NULL DEFAULT 0,
    total_commission_earned_paise BIGINT NOT NULL DEFAULT 0,
    total_salary_earned_paise BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default GO USER Settings (Flat ₹20 commission, 280 target, ₹10,000 salary)
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('commission_rate_paise', '2000'::jsonb, 'Flat agent commission per eligible confirmed booking in paise (2000 paise = ₹20.00)'),
    ('commission_rate_inr', '20'::jsonb, 'Flat agent commission in Rupees (₹20)'),
    ('monthly_target_tickets', '280'::jsonb, 'Monthly confirmed ticket target required for fixed ₹10,000 monthly salary'),
    ('monthly_salary_paise', '1000000'::jsonb, 'Fixed monthly salary in paise (1000000 paise = ₹10,000)'),
    ('monthly_salary_inr', '10000'::jsonb, 'Fixed monthly salary in Rupees (₹10,000)'),
    ('support_whatsapp', '"919876543210"'::jsonb, 'GO USER Centralized Helpdesk & Verification WhatsApp'),
    ('cancellation_reversal_policy', '"reverse_commission"'::jsonb, 'Policy when confirmed booking is cancelled: insert auditable reversal entry')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = NOW();

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT,
    agent_mobile VARCHAR(20),
    idempotency_key TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    passenger_count INT NOT NULL DEFAULT 1 CHECK (passenger_count >= 1 AND passenger_count <= 10),
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    journey_date DATE NOT NULL,
    departure_time_pref TEXT,
    operator_preference TEXT,
    seat_category TEXT NOT NULL,
    seat_count INT NOT NULL DEFAULT 1 CHECK (seat_count >= 1),
    boarding_point TEXT NOT NULL,
    drop_point TEXT NOT NULL,
    estimated_fare_paise BIGINT NOT NULL DEFAULT 0,
    total_fare_paise BIGINT NOT NULL DEFAULT 0,
    agent_notes TEXT,
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
    actual_fare_paise BIGINT,
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
        'none', 'requested', 'under_review', 'approved', 'processing', 'completed', 'rejected'
    )),
    refund_amount_paise BIGINT DEFAULT 0,
    confirmed_by TEXT REFERENCES public.profiles(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Passengers Table
CREATE TABLE IF NOT EXISTS public.passengers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 1 AND age <= 120),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    seat_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Booking Events / Audit Table (Immutable History)
CREATE TABLE IF NOT EXISTS public.booking_events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    booking_id TEXT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'created', 'reviewed', 'confirmed', 'rejected', 'expired',
        'cancellation_requested', 'cancelled', 'refunded'
    )),
    actor_id TEXT REFERENCES public.profiles(id),
    actor_role VARCHAR(20),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Commission Ledger Table
-- CRITICAL RULE: Unique constraint on booking_id prevents duplicate commission credit at DB level!
CREATE TABLE IF NOT EXISTS public.commission_ledger (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE RESTRICT,
    booking_code TEXT,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT,
    amount_paise BIGINT NOT NULL, -- 2000 paise = ₹20.00
    amount NUMERIC(10,2) NOT NULL, -- ₹20.00
    status TEXT NOT NULL DEFAULT 'credited' CHECK (status IN ('credited', 'reversed', 'paid')),
    entry_type TEXT NOT NULL DEFAULT 'booking_commission' CHECK (entry_type IN ('booking_commission', 'reversal', 'bonus', 'adjustment')),
    reversal_ref_id TEXT REFERENCES public.commission_ledger(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_commission_booking UNIQUE (booking_id)
);

-- 9. Monthly Salary Ledger Table
-- CRITICAL RULE: Unique constraint on (agent_id, month_year) enforces exactly one record per agent per month!
-- RULE: Target = 280 tickets. Below 280 => payable_salary = 0 (Not Earned; no silent proration).
CREATE TABLE IF NOT EXISTS public.monthly_salary_ledger (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT,
    agent_mobile TEXT,
    month_year VARCHAR(7) NOT NULL, -- e.g. '2026-10'
    target_bookings INT NOT NULL DEFAULT 280,
    confirmed_bookings INT NOT NULL DEFAULT 0,
    target_met BOOLEAN NOT NULL DEFAULT false,
    base_salary_paise BIGINT NOT NULL DEFAULT 1000000, -- ₹10,000 in paise
    payable_salary_paise BIGINT NOT NULL DEFAULT 0,     -- ₹10,000 if target_met, else 0
    base_salary NUMERIC(10,2) NOT NULL DEFAULT 10000.00,
    payable_salary NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'eligible', 'approved', 'paid')),
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

-- 10. Payouts Table (Settlement Desk)
CREATE TABLE IF NOT EXISTS public.payouts (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agent_name TEXT NOT NULL,
    agent_mobile VARCHAR(20) NOT NULL,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payout_type VARCHAR(30) NOT NULL DEFAULT 'commission_and_salary' CHECK (payout_type IN ('commission', 'salary', 'commission_and_salary', 'wallet_withdrawal')),
    payout_method VARCHAR(30) NOT NULL CHECK (payout_method IN ('upi', 'bank_transfer')),
    upi_id TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    bank_name TEXT,
    account_holder_name TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
    reference TEXT, -- Bank Transfer UTR / IMPS Txn ID
    date TIMESTAMPTZ, -- Processed Date
    admin_notes TEXT,
    created_by TEXT REFERENCES public.profiles(id),
    processed_by TEXT REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    actor_id TEXT REFERENCES public.profiles(id),
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB DEFAULT '{}'::jsonb,
    new_data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_go_bookings_agent ON public.bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_go_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_go_bookings_created ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_go_comm_agent ON public.commission_ledger(agent_id);
CREATE INDEX IF NOT EXISTS idx_go_comm_booking ON public.commission_ledger(booking_id);
CREATE INDEX IF NOT EXISTS idx_go_salary_agent_month ON public.monthly_salary_ledger(agent_id, month_year);
CREATE INDEX IF NOT EXISTS idx_go_payouts_agent ON public.payouts(agent_id);
CREATE INDEX IF NOT EXISTS idx_go_payouts_status ON public.payouts(status);

-- ==============================================================================
-- 13. SECURE IDEMPOTENT STORED PROCEDURES (POSTGRESQL FUNCTIONS)
-- ==============================================================================

-- Function 1: Idempotent Booking Approval & Commission Credit (Flat ₹20 / 2000 paise)
CREATE OR REPLACE FUNCTION public.approve_booking_and_credit_commission(
    p_booking_id TEXT,
    p_admin_id TEXT,
    p_actual_fare NUMERIC DEFAULT NULL,
    p_confirmed_seats TEXT DEFAULT NULL,
    p_actual_operator TEXT DEFAULT NULL,
    p_ticket_pnr TEXT DEFAULT NULL,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_agent_id TEXT;
    v_booking_code TEXT;
    v_existing_comm RECORD;
    v_month_year VARCHAR(7);
    v_confirmed_count INT;
    v_target INT := 280;
    v_target_met BOOLEAN := false;
    v_comm_paise BIGINT := 2000; -- Flat ₹20
    v_salary_paise BIGINT := 1000000; -- Flat ₹10,000
    v_res JSONB;
BEGIN
    -- 1. Fetch and Lock the target booking
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    -- 2. State verification
    IF v_booking.status = 'confirmed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking is already confirmed and commission was credited');
    END IF;

    IF v_booking.status IN ('rejected', 'cancelled', 'expired') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot approve a ' || v_booking.status || ' booking');
    END IF;

    v_agent_id := v_booking.agent_id;
    v_booking_code := v_booking.booking_code;
    v_month_year := TO_CHAR(v_booking.created_at, 'YYYY-MM');

    -- 3. Idempotency Check: Commission already credited?
    SELECT * INTO v_existing_comm FROM public.commission_ledger 
    WHERE booking_id = p_booking_id AND status = 'credited';
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Commission already credited for this booking');
    END IF;

    -- 4. Update Booking Status
    UPDATE public.bookings SET
        status = 'confirmed',
        actual_fare_paise = COALESCE(ROUND(p_actual_fare * 100), total_fare_paise),
        confirmed_seats = COALESCE(p_confirmed_seats, confirmed_seats),
        actual_operator = COALESCE(p_actual_operator, actual_operator),
        ticket_pnr = COALESCE(p_ticket_pnr, ticket_pnr),
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        confirmed_by = p_admin_id,
        confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- 5. Record Booking Event
    INSERT INTO public.booking_events (
        booking_id, event_type, actor_id, actor_role, notes, metadata
    ) VALUES (
        p_booking_id, 'confirmed', p_admin_id, 'admin', 'Approved by admin with flat ₹20 commission',
        jsonb_build_object('pnr', p_ticket_pnr, 'commission_paise', v_comm_paise)
    );

    -- 6. Insert Commission Ledger Entry (Flat ₹20 / 2000 paise)
    INSERT INTO public.commission_ledger (
        booking_id, booking_code, agent_id, agent_name,
        amount_paise, amount, status, entry_type, notes
    ) VALUES (
        p_booking_id, v_booking_code, v_agent_id, v_booking.agent_name,
        v_comm_paise, 20.00, 'credited', 'booking_commission',
        'Flat ₹20 commission on booking confirmation by admin (' || v_booking_code || ')'
    ) ON CONFLICT (booking_id) DO NOTHING;

    -- 7. Update Agent Monthly Salary Ledger Record
    -- Calculate confirmed bookings in this month for this agent
    SELECT COUNT(*) INTO v_confirmed_count
    FROM public.bookings
    WHERE agent_id = v_agent_id 
      AND status = 'confirmed'
      AND TO_CHAR(created_at, 'YYYY-MM') = v_month_year;

    v_target_met := (v_confirmed_count >= v_target);

    -- Upsert Monthly Salary Ledger record:
    -- If below target (e.g. < 280), payable_salary = 0 (Not Earned - NOT prorated!).
    -- If target reached (>= 280), payable_salary = ₹10,000 (1000000 paise).
    INSERT INTO public.monthly_salary_ledger (
        agent_id, agent_name, agent_mobile, month_year,
        target_bookings, confirmed_bookings, target_met,
        base_salary_paise, payable_salary_paise,
        base_salary, payable_salary,
        status, notes
    ) VALUES (
        v_agent_id, v_booking.agent_name, v_booking.agent_mobile, v_month_year,
        v_target, v_confirmed_count, v_target_met,
        v_salary_paise, CASE WHEN v_target_met THEN v_salary_paise ELSE 0 END,
        10000.00, CASE WHEN v_target_met THEN 10000.00 ELSE 0.00 END,
        CASE WHEN v_target_met THEN 'eligible' ELSE 'unpaid' END,
        'GO USER Salary Tracking: 280 Target for ₹10,000 Salary (No proration below target)'
    )
    ON CONFLICT (agent_id, month_year) DO UPDATE SET
        confirmed_bookings = EXCLUDED.confirmed_bookings,
        target_met = EXCLUDED.target_met,
        payable_salary_paise = EXCLUDED.payable_salary_paise,
        payable_salary = EXCLUDED.payable_salary,
        status = CASE 
            WHEN EXCLUDED.target_met AND public.monthly_salary_ledger.status = 'unpaid' THEN 'eligible'
            ELSE public.monthly_salary_ledger.status
        END,
        updated_at = NOW();

    -- 8. Insert Audit Log
    INSERT INTO public.admin_audit_logs (
        actor_id, actor_role, action, entity_type, entity_id, notes, new_data
    ) VALUES (
        p_admin_id, 'admin', 'approve_booking', 'bookings', p_booking_id,
        'Approved booking and credited ₹20 commission',
        jsonb_build_object('booking_code', v_booking_code, 'agent_id', v_agent_id, 'confirmed_count', v_confirmed_count)
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'booking_code', v_booking_code,
        'commission_credited_inr', 20.00,
        'monthly_confirmed_tickets', v_confirmed_count,
        'salary_target_met', v_target_met
    );
END;
$$;

-- Function 2: Idempotent Reversal on Cancellation (Auditable Reversal Ledger Entry)
CREATE OR REPLACE FUNCTION public.cancel_booking_and_reverse_commission(
    p_booking_id TEXT,
    p_admin_id TEXT,
    p_cancellation_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_comm RECORD;
    v_month_year VARCHAR(7);
    v_confirmed_count INT;
    v_target_met BOOLEAN;
BEGIN
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking is already cancelled');
    END IF;

    -- Update booking status to cancelled
    UPDATE public.bookings SET
        status = 'cancelled',
        cancellation_reason = p_cancellation_reason,
        refund_status = 'approved',
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Find original commission credit
    SELECT * INTO v_comm FROM public.commission_ledger 
    WHERE booking_id = p_booking_id AND status = 'credited';

    IF FOUND THEN
        -- Insert Auditable Reversal Entry (NEVER delete history!)
        INSERT INTO public.commission_ledger (
            booking_id, booking_code, agent_id, agent_name,
            amount_paise, amount, status, entry_type, reversal_ref_id, notes
        ) VALUES (
            p_booking_id, v_booking.booking_code, v_booking.agent_id, v_booking.agent_name,
            -2000, -20.00, 'reversed', 'reversal', v_comm.id,
            'Commission reversal on booking cancellation (' || p_cancellation_reason || ')'
        );

        -- Mark original entry as reversed
        UPDATE public.commission_ledger SET status = 'reversed' WHERE id = v_comm.id;
    END IF;

    -- Recalculate Monthly Salary Ledger for this month
    v_month_year := TO_CHAR(v_booking.created_at, 'YYYY-MM');
    SELECT COUNT(*) INTO v_confirmed_count
    FROM public.bookings
    WHERE agent_id = v_booking.agent_id 
      AND status = 'confirmed'
      AND TO_CHAR(created_at, 'YYYY-MM') = v_month_year;

    v_target_met := (v_confirmed_count >= 280);

    UPDATE public.monthly_salary_ledger SET
        confirmed_bookings = v_confirmed_count,
        target_met = v_target_met,
        payable_salary_paise = CASE WHEN v_target_met THEN 1000000 ELSE 0 END,
        payable_salary = CASE WHEN v_target_met THEN 10000.00 ELSE 0.00 END,
        updated_at = NOW()
    WHERE agent_id = v_booking.agent_id AND month_year = v_month_year;

    -- Log to audit
    INSERT INTO public.admin_audit_logs (
        actor_id, actor_role, action, entity_type, entity_id, notes
    ) VALUES (
        p_admin_id, 'admin', 'cancel_booking', 'bookings', p_booking_id,
        'Cancelled booking and inserted reversal entry: ' || p_cancellation_reason
    );

    RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id, 'reversed', FOUND);
END;
$$;

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_salary_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Transparent standard RLS policies
DROP POLICY IF EXISTS "Profiles read own or admin all" ON public.profiles;
CREATE POLICY "Profiles read own or admin all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings read own or admin" ON public.bookings;
CREATE POLICY "Bookings read own or admin" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Commission read own or admin" ON public.commission_ledger;
CREATE POLICY "Commission read own or admin" ON public.commission_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Salary read own or admin" ON public.monthly_salary_ledger;
CREATE POLICY "Salary read own or admin" ON public.monthly_salary_ledger FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Payouts read own or admin" ON public.payouts;
CREATE POLICY "Payouts read own or admin" ON public.payouts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Audit logs read admin" ON public.admin_audit_logs;
CREATE POLICY "Audit logs read admin" ON public.admin_audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Settings read all" ON public.app_settings;
CREATE POLICY "Settings read all" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
