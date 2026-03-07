const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log("All buckets:", buckets ? buckets.map(b => b.name) : [], error);
}
checkBucket();
