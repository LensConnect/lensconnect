import { createClient } from "@supabase/supabase-js"

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("✅ Loaded Supabase URL:", supabaseUrl)

if (!supabaseUrl) throw new Error("supabaseUrl is required.")
if (!supabaseAnonKey) throw new Error("supabaseAnonKey is required.")

// ✅ Create Supabase client with auth session handling enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // Keeps the user logged in across reloads
    autoRefreshToken: true,      // Refreshes tokens automatically
    detectSessionInUrl: true,    // Handles OAuth redirects
  },
})