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

async function reseedAdmin() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  await client.query(`
    INSERT INTO public.safargo_agents (
      id, full_name, mobile, email, shop_name, business_type,
      city, address, pincode, pan_number, aadhaar_number,
      account_holder, account_number, ifsc, bank_name,
      settlement_upi_id, is_approved, is_suspended, role,
      applied_date, approved_date
    ) VALUES (
      'SFG-ADMIN-001',
      'Jia SafarGo (Super Admin)',
      '9811000001',
      'jia647155@gmail.com',
      'SafarGo Central Head Office',
      'admin',
      'Indore',
      'SafarGo HQ, Vijay Nagar, Indore',
      '452010',
      'ADMIN1234F',
      '999988887777',
      'SafarGo Super Admin',
      '999900001111',
      'SBIN0001234',
      'State Bank of India (SBI)',
      'jia647155@upi',
      true,
      false,
      'admin',
      '18 Oct 2026',
      '18 Oct 2026'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      role = 'admin',
      is_approved = true;
  `);

  console.log('✅ Super Admin jia647155@gmail.com is seeded in Supabase.');
  const res = await client.query(`SELECT id, full_name, email, mobile, role, is_approved FROM public.safargo_agents;`);
  console.table(res.rows);

  await client.end();
}

reseedAdmin().catch(console.error);
