import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.21.0/+esm';

async function initSupabase() {
  const SUPABASE_URL = 'https://whwkeouhmenvcbjwgbqq.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod2tlb3VobWVudmNiandnYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4Mjc3OTg5MywiZXhwIjoxOTk4MzU1ODkzfQ.kcp9RCb5ItbzXlfPPZq-ZyufQQJcgVnaLyIq8_vsSUA';

  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

let supabaseClient = await initSupabase();

// const { data, error } = await supabaseClient
//     .from('Events')
//     .insert([
//       { Name: "battle"},
//     ]);
//   console.log(data, error);