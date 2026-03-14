// This file is stubbed out after migration to MongoDB.
// Use api/client.js instead.
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => {},
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({
            limit: async () => ({ data: [], error: null })
        })
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null })
      }),
    }),
    upsert: async () => ({ error: null }),
    insert: async () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
};