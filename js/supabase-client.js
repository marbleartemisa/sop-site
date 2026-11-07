
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://mqrxvthmmdspihkutoqd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "PEGA_AQUI_LA_PUBLISHABLE_KEY_QUE_ME_ENVIASTE";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

