import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdwvxblucazuopjhsejg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkd3Z4Ymx1Y2F6dW9wamhzZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjQ5OTAsImV4cCI6MjA3NTUwMDk5MH0.EPMdiQLcro9aKUvBE2sQzUp8wg9M78VKd4-xwUNC98E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Re-export types from types directory
export type { 
  Category, 
  User, 
  System, 
  Review,
  CPUManufacturer,
  CPUModel,
  CPUListing,
  CPUReview,
  CPUFavorite,
  GPUListing
} from '@/types';
