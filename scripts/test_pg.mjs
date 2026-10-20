import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:Ankitiji8899@db.qkttyqjyfbifdatyaprv.supabase.co:5432/postgres';

console.log('Testing Postgres direct connection...');

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected successfully to Postgres database!');
    const res = await client.query('SELECT version();');
    console.log('Database version:', res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error('Postgres connection failed:', err.message);
  }
}

run();
