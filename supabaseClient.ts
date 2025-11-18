import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxcbvdeyyzkiyqtfpdri.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Y2J2ZGV5eXpraXlxdGZwZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDYzMTIsImV4cCI6MjA1NjkyMjMxMn0.ILaPh7mk0UJhJCuJUTtSsZsYFRm_d38DJ6yDZdUA_Xs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);