
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardStats, Lead } from '../types';
import { fetchDashboardStats, updateLead } from '../services/leadsService';
import { Users, ArrowUpRight, RefreshCw, Megaphone, Layers, Briefcase } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg transition-colors duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-xl">
        <p className="text-gray-600 dark:text-gray-300 text-xs mb-1">{label}</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
          {payload[0].value} Leads
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleAIStatus = async (lead: Lead) => {
    try {
      const newStatus = !lead.status_ia; // Toggle boolean
      // Optimistic update only for the list view
      setStats(prev => {
        if (!prev) return null;
        const updatedRecent = prev.recentLeads.map(l => l.numero === lead.numero ? { ...l, status_ia: newStatus } : l);
        return {
          ...prev,
          recentLeads: updatedRecent
        };
      });
      
      await updateLead(lead.numero, { status_ia: newStatus });
    } catch (error) {
      console.error("Failed to toggle AI", error);
      loadData(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 animate-pulse">
        Carregando Dashboard...
      </div>
    );
  }

  if (!stats) return null;

  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={loadData}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 transition-colors shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPIs Updated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Leads Hoje" 
          value={stats.totalLeadsToday} 
          icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          color="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard 
          title="Leads do Anúncio" 
          value={stats.leadsFromAds} 
          icon={<Megaphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          color="bg-purple-50 dark:bg-purple-900/30"
        />
        <StatCard 
          title="Total de Leads" 
          value={stats.totalLeads} 
          icon={<Layers className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
          color="bg-gray-100 dark:bg-gray-700/50"
        />
        <StatCard 
          title="Em Fechamento" 
          value={stats.leadsInClosing} 
          icon={<Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
          color="bg-emerald-50 dark:bg-emerald-900/30"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Leads Last 7 Days */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Novos Leads (7 Dias)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.leadsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{fill: textColor, fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{fill: textColor, fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: gridColor, opacity: 0.4}} />
                <Bar 
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  activeBar={{fill: '#818cf8'}}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Pipeline Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-lg transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Distribuição do Pipeline</h2>
          <div className="h-64 w-full flex items-center justify-center">
            {stats.pipelineDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pipelineDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.pipelineDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ 
                       backgroundColor: theme === 'dark' ? '#111827' : '#ffffff', 
                       borderColor: theme === 'dark' ? '#374151' : '#e5e7eb', 
                       borderRadius: '8px', 
                       color: theme === 'dark' ? '#f3f4f6' : '#111827' 
                     }}
                     itemStyle={{ color: theme === 'dark' ? '#f3f4f6' : '#111827' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: textColor }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-sm">Sem dados de pipeline</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-lg transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leads Recentes</h2>
          <Link to="/leads" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1">
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Status IA</th>
                <th className="px-6 py-3">Pipeline</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentLeads.map((lead) => (
                <tr key={lead.numero} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.nome}</div>
                    <div className="text-xs text-gray-500">{lead.numero}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleAIStatus(lead)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        !lead.status_ia 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      }`}
                    >
                      {!lead.status_ia ? 'Ativa' : 'Pausada'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.pipeline} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
