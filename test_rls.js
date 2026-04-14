import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgwglgasmdeocznthqka.supabase.co';
const supabaseAnonKey = 'sb_publishable_SbScH2QnyLTUS-_WuFJ-PA_qiVhzQbf';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  // Try to fetch comments
  const { data: comments, error: fetchError } = await supabase.from('comments').select('*').limit(1);
  if (fetchError) {
    console.log("Fetch error:", fetchError);
    return;
  }
  
  if (comments.length === 0) {
    console.log("No comments to test on.");
    return;
  }
  
  const testComment = comments[0];
  console.log("Trying to update comment:", testComment.id);
  
  // Try to update it using ANON key
  const { data: updateData, error: updateError } = await supabase
    .from('comments')
    .update({ content: testComment.content + ' ' })
    .eq('id', testComment.id)
    .select();
    
  console.log("Update Error:", updateError);
  console.log("Update Data:", updateData);
  
  // Checking if there are any RLS policies (from information_schema if accessible)
}

testRLS();
