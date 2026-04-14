import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgwglgasmdeocznthqka.supabase.co';
const supabaseAnonKey = 'sb_publishable_SbScH2QnyLTUS-_WuFJ-PA_qiVhzQbf';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      likes(user_id),
      comments(*, profiles(name, profilePic)),
      reposts(user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("SUPABASE ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Fetched", data.length, "posts.");
  }
}

testFetch();
