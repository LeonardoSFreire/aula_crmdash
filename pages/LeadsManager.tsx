import React, { useEffect, useState, memo, useCallback } from 'react';
import { Lead, PIPELINE_COLUMNS, PipelineStatus } from '../types';
import { fetchLeads, updateLead } from '../services/leadsService';
import { Search, Check, X, FileJson, RefreshCw } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

// -- JSON Modal Component --
const JsonModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl transition-colors duration-300" onClick={e => e.stopPropagation()}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-850 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes da Qualificação</h3>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-4 overflow-auto font-mono text-sm text-green-600 dark:text-green-400 bg-gray-50 dark:bg-[#0d1117]">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  </div>
);

// -- Memoized Row for Performance --
interface LeadRowProps {
  lead: Lead;
  onUpdate: (numero: string, field: keyof Lead, value: any) => Promise<void>;
  onViewJson: (data: any) => void;
}

const LeadRow = memo(({ lead, onUpdate, onViewJson }: LeadRowProps) => {
  const [name, setName] = useState(lead.nome);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state if prop changes externally
  useEffect(() => {
    setName(lead.nome);
  }, [lead.nome]);

  const handleBlurName = async () => {
    if (name !== lead.nome) {
      setIsSaving(true);
      await onUpdate(lead.numero, 'nome', name);
      setIsSaving(false);
    }
  };

  const handlePipelineChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsSaving(true);
    await onUpdate(lead.numero, 'pipeline', e.target.value as PipelineStatus);
    setIsSaving(false);
  };

  const toggleStatusIA = async () => {
    setIsSaving(true);
    await onUpdate(lead.numero, 'status_ia', !lead.status_ia);
    setIsSaving(false);
  };

  const toggleAnuncio = async () => {
    setIsSaving(true);
    await onUpdate(lead.numero, 'anuncio', !lead.anuncio);
    setIsSaving(false);
  };

  const borderColor = isSaving ? 'border-indigo-500' : 'border-transparent';

  return (
    <tr className="group hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
      {/* Numero (Fixed) */}
      <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-500 font-mono whitespace-nowrap border-r border-gray-200 dark:border-gray-800">
        {lead.numero}
      </td>

      {/* Nome (Editable Text) */}
      <td className="px-0 py-0 border-r border-gray-200 dark:border-gray-800 relative min-w-[150px]">
         <input 
           type="text"
           value={name}
           onChange={(e) => setName(e.target.value)}
           onBlur={handleBlurName}
           className={`w-full h-full px-4 py-3 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/50 transition-all ${name !== lead.nome ? 'text-yellow-600 dark:text-yellow-300' : ''}`}
         />
         {isSaving && <div className="absolute right-2 top-3 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
      </td>

      {/* Data */}
      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap border-r border-gray-200 dark:border-gray-800">
        {new Date(lead.created_at).toLocaleDateString('pt-BR')} <span className="text-xs text-gray-400 dark:text-gray-600">{new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit'})}</span>
      </td>

      {/* Status IA (Toggle) */}
      <td className="px-4 py-2 text-center border-r border-gray-200 dark:border-gray-800 whitespace-nowrap">
        <button 
          onClick={toggleStatusIA}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!lead.status_ia ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-700'}`}
        >
          <span className="sr-only">Use setting</span>
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!lead.status_ia ? 'translate-x-4' : 'translate-x-0'}`}
          />
        </button>
        <span className="ml-2 text-xs text-gray-500">{!lead.status_ia ? 'Ativa' : 'Pausada'}</span>
      </td>

      {/* Pipeline (Select) */}
      <td className="px-2 py-1 border-r border-gray-200 dark:border-gray-800 min-w-[140px]">
        <select 
          value={lead.pipeline}
          onChange={handlePipelineChange}
          className={`block w-full py-1.5 px-2 text-xs rounded border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 cursor-pointer`}
        >
          {PIPELINE_COLUMNS.map(status => (
            <option key={status} value={status}>{status.toUpperCase()}</option>
          ))}
        </select>
      </td>

      {/* Anuncio (Checkbox) */}
      <td className="px-4 py-2 text-center border-r border-gray-200 dark:border-gray-800">
        <input 
          type="checkbox" 
          checked={lead.anuncio} 
          onChange={toggleAnuncio}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800"
        />
      </td>

      {/* Qualificacao (JSON view) */}
      <td className="px-4 py-2 text-left whitespace-nowrap">
        <button 
          onClick={() => onViewJson(lead.qualificacao)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded transition-colors border border-indigo-200 dark:border-indigo-900/50"
        >
          <FileJson className="w-3 h-3" />
          Ver JSON
        </button>
      </td>
    </tr>
  );
});

// -- Main Page Component --
const LeadsManager: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [jsonModalData, setJsonModalData] = useState<any | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Optimistic Update Function passed to row
  const handleRowUpdate = useCallback(async (numero: string, field: keyof Lead, value: any) => {
    // Optimistic update UI
    setLeads(prev => prev.map(l => l.numero === numero ? { ...l, [field]: value } : l));
    
    try {
      await updateLead(numero, { [field]: value });
      // Optional: Show toast here
    } catch (error) {
      console.error("Save failed", error);
      // Revert needed in production apps, simpler here to reload
      loadLeads();
    }
  }, []);

  const filteredLeads = leads.filter(l => 
    l.nome.toLowerCase().includes(filter.toLowerCase()) || 
    l.numero.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {jsonModalData && <JsonModal data={jsonModalData} onClose={() => setJsonModalData(null)} />}

      {/* Header & Search Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciador de Leads</h1>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar por Nome ou Número..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-300"
            />
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
             <ThemeToggle />
             <button 
               onClick={loadLeads}
               className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 transition-colors shadow-sm"
             >
               <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300">
        <div className="overflow-auto flex-1 w-full">
          <table className="w-full border-collapse min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-850 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 shadow-sm transition-colors duration-300">
              <tr>
                <th className="px-4 py-3 text-left w-32 border-b border-r border-gray-200 dark:border-gray-800">Número</th>
                <th className="px-4 py-3 text-left border-b border-r border-gray-200 dark:border-gray-800">Nome</th>
                <th className="px-4 py-3 text-left w-40 border-b border-r border-gray-200 dark:border-gray-800">Data</th>
                <th className="px-4 py-3 text-center w-32 border-b border-r border-gray-200 dark:border-gray-800">Status IA</th>
                <th className="px-4 py-3 text-left w-48 border-b border-r border-gray-200 dark:border-gray-800">Pipeline</th>
                <th className="px-4 py-3 text-center w-24 border-b border-r border-gray-200 dark:border-gray-800">Anúncio</th>
                <th className="px-4 py-3 text-left w-32 border-b border-gray-200 dark:border-gray-800">Qualificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Carregando dados...</td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <LeadRow 
                    key={lead.numero} 
                    lead={lead} 
                    onUpdate={handleRowUpdate} 
                    onViewJson={setJsonModalData}
                  />
                ))
              )}
              {!loading && filteredLeads.length === 0 && (
                 <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Nenhum lead encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 flex justify-between transition-colors duration-300">
          <span>Total: {filteredLeads.length} registros</span>
          <span>Live Edit Ativo</span>
        </div>
      </div>
    </div>
  );
};

export default LeadsManager;