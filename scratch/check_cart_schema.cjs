const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// .env 파일에서 설정 로드
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.replace(/['";]/g, '').trim();
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.replace(/['";]/g, '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCartSchema() {
  console.log('--- Cart Table Sample Data ---');
  const { data, error } = await supabase.from('cart').select('*').limit(1);
  
  if (error) {
    console.error('Error fetching cart data:', error);
  } else {
    console.log('Sample Row:', data && data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No data in cart table');
    if (data && data[0]) {
      console.log('Fields:', Object.keys(data[0]));
    }
  }

  console.log('\n--- Cart Summary ---');
  const { count, error: countError } = await supabase.from('cart').select('*', { count: 'exact', head: true });
  if (countError) {
    console.error('Error fetching count:', countError);
  } else {
    console.log('Total Rows in Cart:', count);
  }
}

checkCartSchema();
