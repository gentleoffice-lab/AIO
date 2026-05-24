import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cinauvcuowykultivmpn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_30lKM6PZAeIkXgnuo08j9A_7eI1H645";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
