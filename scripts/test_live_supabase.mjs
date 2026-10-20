import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const SUPABASE_URL = 'https://qkttyqjyfbifdatyaprv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Wu_ywFMrhc91B5DncnRT7g_EOY_tyGQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket }
});

async function runLiveVerification() {
  console.log('--- Testing Live Supabase Connection ---');
  
  // 1. Query Agents
  const { data: agents, error: errAgents } = await supabase
    .from('safargo_agents')
    .select('id, full_name, email, role, is_approved');
  if (errAgents) throw errAgents;
  console.log(`✅ safargo_agents: found ${agents.length} agents:`);
  agents.forEach(a => console.log(`   - [${a.role}] ${a.full_name} (${a.email}) - Approved: ${a.is_approved}`));

  // 2. Query Fleet Buses
  const { data: buses, error: errBuses } = await supabase
    .from('safargo_fleet_buses')
    .select('id, operator_name, source_city, destination_city, fare');
  if (errBuses) throw errBuses;
  console.log(`✅ safargo_fleet_buses: found ${buses?.length || 0} buses in Supabase.`);

  // 3. Query Bookings
  const { data: bookings, error: errBookings } = await supabase
    .from('safargo_bookings')
    .select('id, pnr, booking_type, status, total_amount');
  if (errBookings) throw errBookings;
  console.log(`✅ safargo_bookings: found ${bookings?.length || 0} bookings in Supabase.`);

  // 4. Query Wallet Topups
  const { data: topups, error: errTopups } = await supabase
    .from('safargo_wallet_topups')
    .select('id, agent_name, utr, amount, status');
  if (errTopups) throw errTopups;
  console.log(`✅ safargo_wallet_topups: found ${topups?.length || 0} top-ups in Supabase.`);

  // 5. Query Support Tickets
  const { data: tickets, error: errTickets } = await supabase
    .from('safargo_support_tickets')
    .select('id, subject, category, status');
  if (errTickets) throw errTickets;
  console.log(`✅ safargo_support_tickets: found ${tickets?.length || 0} tickets in Supabase.`);

  // 6. Test an Upsert into safargo_app_config
  const { data: configData, error: errConfig } = await supabase
    .from('safargo_app_config')
    .upsert({
      key: 'system_health',
      value: { status: 'healthy', timestamp: new Date().toISOString(), connectedBy: 'Antigravity AI' },
      updated_at: new Date().toISOString()
    })
    .select();
  if (errConfig) throw errConfig;
  console.log('✅ safargo_app_config: successfully wrote and read system_health config:', configData);

  console.log('\n🎉 ALL REAL SUPABASE TABLES ARE 100% OPERATIONAL AND CONNECTED!');
}

runLiveVerification().catch(err => {
  console.error('❌ Supabase verification failed:', err);
  process.exit(1);
});
