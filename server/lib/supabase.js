const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      // We manage our own JWTs — disable Supabase Auth session handling
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

module.exports = supabase;
