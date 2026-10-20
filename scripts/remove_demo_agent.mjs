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

async function removeDemoAgentFromDb() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  // Delete demo agent Rajesh Verma and any demo bookings/topups
  const delAgents = await client.query(`
    DELETE FROM public.safargo_agents 
    WHERE id = 'SFG-AGENT-2026-9041' 
       OR email = 'rajesh.agent@safargo.com' 
       OR mobile = '9876543210' 
       OR full_name ILIKE '%Rajesh Verma%';
  `);
  console.log(`Deleted ${delAgents.rowCount} demo agent rows.`);

  const delBookings = await client.query(`
    DELETE FROM public.safargo_bookings 
    WHERE id LIKE '%demo%' OR pnr LIKE '%demo%';
  `);
  console.log(`Deleted ${delBookings.rowCount} demo booking rows.`);

  // Verify remaining agents
  const res = await client.query(`SELECT id, full_name, email, role, is_approved FROM public.safargo_agents;`);
  console.log('Remaining agents in Supabase:');
  console.table(res.rows);

  await client.end();
}

removeDemoAgentFromDb().catch(err => {
  console.error('Error removing demo agent:', err);
  process.exit(1);
});
