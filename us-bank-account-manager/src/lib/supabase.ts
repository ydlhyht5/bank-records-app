import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thimrvudniivsvfilbzt.supabase.co';
const supabaseKey = 'sb_publishable_tvDR8ffx38NKm9_ysIn6EQ_RAo--c4r';

export const supabase = createClient(supabaseUrl, supabaseKey);
