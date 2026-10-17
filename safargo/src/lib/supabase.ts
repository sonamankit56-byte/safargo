import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fvajmpzfompwhghqcgwp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_c7izXStkVZ1bTwpxW3MNYQ_SdeDN59L';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('mock.supabase.co')
  );
};

class DummyWS {
  constructor() {}
  send() {}
  close() {}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  },
  ...(typeof window === 'undefined' && !(globalThis as any).WebSocket
    ? {
        realtime: {
          transport: DummyWS as any,
        },
      }
    : {}),
});

export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  projectUrl: string;
  error?: string;
}> {
  try {
    const { error } = await supabase.from('bookings').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { connected: false, projectUrl: supabaseUrl, error: error.message };
    }
    return { connected: true, projectUrl: supabaseUrl };
  } catch (err: any) {
    return { connected: false, projectUrl: supabaseUrl, error: err?.message || 'Connection failed' };
  }
}
