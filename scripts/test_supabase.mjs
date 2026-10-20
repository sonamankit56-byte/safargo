import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://qkttyqjyfbifdatyaprv.supabase.co';
const supabaseKey = 'sb_publishable_Wu_ywFMrhc91B5DncnRT7g_EOY_tyGQ';

console.log('Testing Supabase Client Query on tables...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

async function main() {
  const { data, error } = await supabase.from('safargo_agents').select('*');
  console.log('Agents query response:', { count: data?.length, error });
  if (data && data.length > 0) {
    console.log('Sample agent retrieved from Supabase:', {
      id: data[0].id,
      name: data[0].full_name,
      email: data[0].email,
      role: data[0].role
    });
  }
}

main();
