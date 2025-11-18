import { createClient } from '@supabase/supabase-js';

// Função segura para pegar variáveis de ambiente ou usar fallback
const getEnvVar = (key: string, fallback: string) => {
  try {
    // Tenta pegar do Vite (import.meta.env)
    if (import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignora erro se import.meta não existir
  }
  return fallback;
};

// Usa as variáveis da Vercel se existirem, senão usa as credenciais diretas como backup
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://cxcbvdeyyzkiyqtfpdri.supabase.co');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Y2J2ZGV5eXpraXlxdGZwZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDYzMTIsImV4cCI6MjA1NjkyMjMxMn0.ILaPh7mk0UJhJCuJUTtSsZsYFRm_d38DJ6yDZdUA_Xs');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL ou Anon Key não encontradas.');
}

export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY
);