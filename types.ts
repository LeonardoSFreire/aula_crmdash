
export interface Lead {
  numero: string;
  nome: string;
  created_at: string;
  status_ia: boolean; // FALSE = Ativa, TRUE = Pausada
  pipeline: PipelineStatus;
  anuncio: boolean;
  qualificacao: Record<string, any> | null;
}

export type PipelineStatus = 
  | 'novo lead'
  | 'em atendimento'
  | 'qualificado'
  | 'proposta enviada'
  | 'fechado'
  | 'perdido';

export const PIPELINE_COLUMNS: PipelineStatus[] = [
  'novo lead',
  'em atendimento',
  'qualificado',
  'proposta enviada',
  'fechado',
  'perdido'
];

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardStats {
  totalLeadsToday: number;
  totalLeads: number;
  leadsFromAds: number;
  leadsInClosing: number;
  recentLeads: Lead[];
  leadsOverTime: ChartDataPoint[];
  pipelineDistribution: ChartDataPoint[];
}
