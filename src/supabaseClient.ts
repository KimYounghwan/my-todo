import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvtxkzmcmgrgznblefdu.supabase.co';
const supabaseAnonKey = 'sb_publishable_qMqAk5ptwk9mKczuv83Xuw_fBU8JlpM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
