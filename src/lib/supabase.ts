import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://fvajmpzfompwhghqcgwp.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_c7izXStkVZ1bTwpxW3MNYQ_SdeDN59L';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
      },
      ...(typeof window === 'undefined' && !globalThis.WebSocket
        ? {
            realtime: {
              transport: class DummyWS {
                constructor() {}
                send() {}
                close() {}
              } as any,
            },
          }
        : {}),
    })
  : null;
