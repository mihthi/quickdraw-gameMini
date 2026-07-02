import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkprzrtwbshgfhwxsdqz.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHJ6cnR3YnNoZ2Zod3hzZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNjg1MDksImV4cCI6MjA5Nzk0NDUwOX0.0SNmY74u2rnpHEC223F1ZIpZpnf3Umt3DBruxCPt7A0';

export const supabase = createClient(supabaseUrl, supabaseKey);