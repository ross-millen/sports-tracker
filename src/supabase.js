import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fyirrmigvjdaftpfegpi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aXJybWlndmpkYWZ0cGZlZ3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTMyODQsImV4cCI6MjA5MDcyOTI4NH0.X7YzfROYYX1m7psyeN7niru2WjJckICJXSBAKRH-c0I'

export const supabase = createClient(supabaseUrl, supabaseKey)