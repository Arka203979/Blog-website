import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgwglgasmdeocznthqka.supabase.co';
const supabaseKey = 'sb_secret_TR8ccMY8SW8hzvFlUvvJTQ_P1DWZ7Kt';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}

check();
