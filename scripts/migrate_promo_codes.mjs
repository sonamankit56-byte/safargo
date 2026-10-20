import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.qkttyqjyfbifdatyaprv',
  password: 'Ankitiji8899',
  ssl: { rejectUnauthorized: false }
});

async function migratePromoCodes() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.safargo_promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      discount_type TEXT DEFAULT 'fixed',
      discount_value NUMERIC(10, 2) NOT NULL,
      min_booking_amount NUMERIC(10, 2) DEFAULT 0,
      service_type TEXT DEFAULT 'bus',
      valid_till TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      usage_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.safargo_promo_codes ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public open read for safargo_promo_codes" ON public.safargo_promo_codes;
    CREATE POLICY "Public open read for safargo_promo_codes" ON public.safargo_promo_codes FOR SELECT TO public USING (true);

    DROP POLICY IF EXISTS "Public open write for safargo_promo_codes" ON public.safargo_promo_codes;
    CREATE POLICY "Public open write for safargo_promo_codes" ON public.safargo_promo_codes FOR INSERT TO public WITH CHECK (true);

    DROP POLICY IF EXISTS "Public open update for safargo_promo_codes" ON public.safargo_promo_codes;
    CREATE POLICY "Public open update for safargo_promo_codes" ON public.safargo_promo_codes FOR UPDATE TO public USING (true);

    DROP POLICY IF EXISTS "Public open delete for safargo_promo_codes" ON public.safargo_promo_codes;
    CREATE POLICY "Public open delete for safargo_promo_codes" ON public.safargo_promo_codes FOR DELETE TO public USING (true);

    NOTIFY pgrst, 'reload schema';
  `);

  // Seed default promo codes
  await client.query(`
    INSERT INTO public.safargo_promo_codes (
      id, code, title, description, discount_type, discount_value, min_booking_amount, service_type, valid_till, status
    ) VALUES 
      ('promo-sfg-1', 'SAFARFIRST', 'Flat ₹150 OFF on First Booking', 'विशेष पहली बस बुकिंग पर ₹150 की सीधी छूट', 'fixed', 150, 400, 'bus', '31 Dec 2026', 'active'),
      ('promo-sfg-2', 'SAFARGO250', '₹250 FLAT OFF on AC Sleeper', 'सभी AC व वोल्वो बसों पर ₹250 की बचत', 'fixed', 250, 600, 'bus', '31 Dec 2026', 'active'),
      ('promo-sfg-3', 'HOTELSTAY50', 'Up to 50% OFF on Resort Stays', 'होटल बुकिंग पर 50% तक विशेष बचत', 'percentage', 50, 1000, 'hotel', '15 Nov 2026', 'active')
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log('✅ safargo_promo_codes table created and seeded in Supabase!');
  
  const res = await client.query('SELECT * FROM public.safargo_promo_codes;');
  console.table(res.rows);

  await client.end();
}

migratePromoCodes().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
