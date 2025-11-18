
import { supabase } from '../supabaseClient';
import { Lead, PipelineStatus, DashboardStats, ChartDataPoint } from '../types';

export const fetchLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('temp_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
  return data as Lead[];
};

export const updateLead = async (numero: string, updates: Partial<Lead>): Promise<void> => {
  const { error } = await supabase
    .from('temp_leads')
    .update(updates)
    .eq('numero', numero);

  if (error) {
    console.error(`Error updating lead ${numero}:`, error);
    throw error;
  }
};

// Cores correspondentes ao Pipeline.tsx
const STATUS_COLORS: Record<string, string> = {
  'novo lead': '#3b82f6', // blue-500
  'em atendimento': '#f59e0b', // amber-500
  'qualificado': '#a855f7', // purple-500
  'proposta enviada': '#06b6d4', // cyan-500
  'fechado': '#10b981', // emerald-500
  'perdido': '#ef4444', // red-500
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('temp_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const leads = data as Lead[];

  const totalLeadsToday = leads.filter(l => l.created_at.startsWith(today)).length;
  const totalLeads = leads.length;
  const leadsFromAds = leads.filter(l => l.anuncio === true).length;
  const leadsInClosing = leads.filter(l => l.pipeline === 'proposta enviada').length;
  const recentLeads = leads.slice(0, 7);

  // 1. Calculate Leads Over Last 7 Days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const leadsOverTime: ChartDataPoint[] = last7Days.map(date => {
    // Format date dd/mm for display
    const [year, month, day] = date.split('-');
    const displayDate = `${day}/${month}`;
    
    return {
      name: displayDate,
      value: leads.filter(l => l.created_at.startsWith(date)).length
    };
  });

  // 2. Calculate Pipeline Distribution
  const pipelineCounts = leads.reduce((acc, lead) => {
    acc[lead.pipeline] = (acc[lead.pipeline] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pipelineDistribution: ChartDataPoint[] = Object.entries(pipelineCounts).map(([status, count]) => ({
    name: status.toUpperCase(),
    value: count,
    color: STATUS_COLORS[status] || '#6b7280'
  }));

  return {
    totalLeadsToday,
    totalLeads,
    leadsFromAds,
    leadsInClosing,
    recentLeads,
    leadsOverTime,
    pipelineDistribution
  };
};
