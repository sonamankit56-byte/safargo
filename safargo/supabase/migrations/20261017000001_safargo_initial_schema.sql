-- ====================================================================
-- SAFARGO PLATFORM: INITIAL POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- Brand Tagline: अब हर सफर होगा आसान
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'customer', 'agent', 'go_agent', 'admin', 'operator', 
        'farmer', 'buyer', 'transporter', 'partner', 'support'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'pending', 'awaiting_operator', 'confirmed', 'rejected',
        'cancellation_requested', 'cancelled', 'refund_pending', 'refunded'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE booking_channel AS ENUM ('customer_self', 'agent_assisted', 'partner');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('pending', 'eligible', 'paid', 'reversed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) when Supabase auth is active
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_verification', 'suspended')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AGENTS AND GO AGENT PROFILES
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('regular', 'go_agent')),
    referral_code TEXT UNIQUE NOT NULL,
    referred_by_code TEXT,
    kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    verification_notes TEXT,
    bank_account_number TEXT,
    bank_ifsc_code TEXT,
    bank_name TEXT,
    bank_account_holder TEXT,
    upi_id TEXT,
    total_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurable settings for Go Agent program (managed by authorized Admin)
CREATE TABLE IF NOT EXISTS public.go_agent_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monthly_target_bookings INTEGER NOT NULL DEFAULT 150,
    fixed_monthly_salary NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    commission_per_booking NUMERIC(10, 2) NOT NULL DEFAULT 19.34,
    referral_reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    referral_target_bookings INTEGER NOT NULL DEFAULT 5,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROUTES AND CONFIGURED SERVICES
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    distance_km INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    popular_rank INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_origin_dest UNIQUE (origin_city, destination_city)
);

CREATE TABLE IF NOT EXISTS public.configured_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    operator_name TEXT NOT NULL,
    operator_contact TEXT,
    bus_type TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration_text TEXT NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL,
    boarding_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    dropping_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    cancellation_policy TEXT NOT NULL DEFAULT 'Cancellation policy depends on operator terms. Minimum 12 hours advance notice required.',
    seating_capacity INTEGER NOT NULL DEFAULT 40,
    booking_method TEXT NOT NULL DEFAULT 'manual_assisted' CHECK (booking_method IN ('manual_assisted', 'api_connected')),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE NOT NULL, -- Format: SFG-YYYY-XXXXXX
    user_id UUID REFERENCES public.profiles(id),
    booking_channel booking_channel NOT NULL DEFAULT 'customer_self',
    agent_id UUID REFERENCES public.agents(id),
    service_id UUID NOT NULL REFERENCES public.configured_services(id),
    route_id UUID NOT NULL REFERENCES public.routes(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    bus_type TEXT NOT NULL,
    journey_date DATE NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    boarding_point TEXT NOT NULL,
    dropping_point TEXT NOT NULL,
    passengers_count INTEGER NOT NULL DEFAULT 1,
    total_fare NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    coupon_code TEXT,
    final_amount NUMERIC(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    operator_response TEXT DEFAULT 'pending' CHECK (operator_response IN ('pending', 'accepted', 'rejected')),
    operator_pnr TEXT, -- Genuine operator PNR entered upon verified confirmation
    internal_notes TEXT,
    rejection_reason TEXT,
    assistance_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assistance_target_minutes INTEGER NOT NULL DEFAULT 15,
    is_delayed BOOLEAN NOT NULL DEFAULT false,
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PASSENGERS
CREATE TABLE IF NOT EXISTS public.passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    seat_preference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. COMMISSION LEDGER
CREATE TABLE IF NOT EXISTS public.commission_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_ref TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    status commission_status NOT NULL DEFAULT 'pending',
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    CONSTRAINT unique_booking_commission UNIQUE (booking_id) -- Prevent duplicate commission per booking
);

-- 9. SALARY RECORDS
CREATE TABLE IF NOT EXISTS public.salary_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- e.g. "2026-10"
    fixed_salary NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    target_bookings INTEGER NOT NULL DEFAULT 150,
    achieved_bookings INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'approved', 'paid', 'not_eligible')),
    notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_agent_month_salary UNIQUE (agent_id, month_year)
);

-- 10. REFERRALS AND REWARDS
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    completed_bookings_count INTEGER NOT NULL DEFAULT 0,
    required_bookings_count INTEGER NOT NULL DEFAULT 5,
    reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'eligible', 'approved', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    CONSTRAINT unique_referral_pair UNIQUE (referrer_id, referee_id)
);

-- 11. OFFERS AND COUPONS
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_booking_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    eligible_channels JSONB NOT NULL DEFAULT '["customer_self", "agent_assisted", "partner"]'::jsonb,
    usage_limit_per_user INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_ref TEXT NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'manual_verification', 'upi')),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
    signature TEXT,
    idempotent_key TEXT UNIQUE NOT NULL,
    customer_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 13. REFUND REQUESTS
CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_ref TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    calculated_refund NUMERIC(10, 2) NOT NULL,
    deduction_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'under_review', 'approved', 'rejected', 'processed', 'failed')),
    refund_ref TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 14. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_ref TEXT UNIQUE NOT NULL, -- e.g. TKT-2026-XXXX
    user_id UUID REFERENCES public.profiles(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    booking_ref TEXT,
    category TEXT NOT NULL CHECK (category IN ('booking', 'payment', 'cancellation', 'agent', 'general', 'agriculture')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AGRICULTURAL MODULES (KISAN, BUYER, TRANSPORTER)
CREATE TABLE IF NOT EXISTS public.agricultural_farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    village TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    land_area_acres NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.agricultural_farmers(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT NOT NULL,
    quantity_quintals NUMERIC(10, 2) NOT NULL,
    expected_price_per_quintal NUMERIC(10, 2) NOT NULL,
    harvest_date DATE NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'negotiating', 'sold', 'withdrawn')),
    pickup_requirements TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agricultural_buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    gst_number TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.agricultural_buyers(id) ON DELETE CASCADE,
    offered_price_per_quintal NUMERIC(10, 2) NOT NULL,
    required_quantity_quintals NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transporters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transporter_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    capacity_tonnes NUMERIC(8, 2) NOT NULL,
    service_areas TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transport_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_type TEXT NOT NULL CHECK (requester_type IN ('farmer', 'buyer')),
    requester_name TEXT NOT NULL,
    requester_phone TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    weight_quintals NUMERIC(10, 2) NOT NULL,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    transporter_id UUID REFERENCES public.transporters(id),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'assigned', 'in_transit', 'delivered', 'cancelled')),
    fare_agreed NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check current role
CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS TEXT AS $$
    SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile, Admins can view and edit all
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = user_id OR public.current_user_role() = 'admin');

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id OR public.current_user_role() = 'admin');

-- Bookings: Customers view own bookings, Agents view assigned bookings, Admins view all
CREATE POLICY "Access permitted bookings" 
    ON public.bookings FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR public.current_user_role() = 'admin'
        OR (public.current_user_role() IN ('agent', 'go_agent') AND agent_id IN (
            SELECT id FROM public.agents WHERE profile_id IN (
                SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
        ))
    );

CREATE POLICY "Customers and agents can create bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admin can update bookings" 
    ON public.bookings FOR UPDATE 
    USING (public.current_user_role() = 'admin');

-- Commission: Agents can only view their own commission, Admin can view and manage all
CREATE POLICY "Agent can view own commission" 
    ON public.commission_ledger FOR SELECT 
    USING (
        public.current_user_role() = 'admin'
        OR agent_id IN (
            SELECT id FROM public.agents WHERE profile_id IN (
                SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Audit logs: Read-only for admins
CREATE POLICY "Admins can view audit logs" 
    ON public.audit_logs FOR SELECT 
    USING (public.current_user_role() = 'admin');
