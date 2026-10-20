import pkg from 'pg';
const { Client } = pkg;

const poolers = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-east-2.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com'
];

async function tryPooler(host) {
  const connectionString = `postgresql://postgres.qkttyqjyfbifdatyaprv:Ankitiji8899@${host}:6543/postgres`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 4000
  });

  try {
    await client.connect();
    console.log(`🎉 SUCCESS! Connected to pooler host: ${host}`);
    const res = await client.query('SELECT current_database(), version();');
    console.log('Result:', res.rows[0]);
    await client.end();
    return host;
  } catch (err) {
    console.log(`Failed on ${host}: ${err.message}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  for (const p of poolers) {
    const res = await tryPooler(p);
    if (res) {
      console.log(`Active pooler found: ${res}`);
      break;
    }
  }
}

main();
