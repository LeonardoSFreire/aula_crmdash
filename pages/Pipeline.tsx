import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Lead, PipelineStatus, PIPELINE_COLUMNS } from '../types';
import { fetchLeads, updateLead } from '../services/leadsService';
import { MoreHorizontal, Tag, RefreshCcw, Bot } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

// Configuração de cores para cada etapa do pipeline
const COLUMN_STYLES: Record<PipelineStatus, { borderTop: string, bg: string, text: string, shadow: string }> = {
  'novo lead': { 
    borderTop: 'border-t-blue-500', 
    bg: 'bg-blue-50 dark:bg-blue-500/5', 
    text: 'text-blue-600 dark:text-blue-400',
    shadow: 'shadow-blue-200/20 dark:shadow-blue-900/20'
  },
  'em atendimento': { 
    borderTop: 'border-t-amber-500', 
    bg: 'bg-amber-50 dark:bg-amber-500/5', 
    text: 'text-amber-600 dark:text-amber-400',
    shadow: 'shadow-amber-200/20 dark:shadow-amber-900/20'
  },
  'qualificado': { 
    borderTop: 'border-t-purple-500', 
    bg: 'bg-purple-50 dark:bg-purple-500/5', 
    text: 'text-purple-600 dark:text-purple-400',
    shadow: 'shadow-purple-200/20 dark:shadow-purple-900/20'
  },
  'proposta enviada': { 
    borderTop: 'border-t-cyan-500', 
    bg: 'bg-cyan-50 dark:bg-cyan-500/5', 
    text: 'text-cyan-600 dark:text-cyan-400',
    shadow: 'shadow-cyan-200/20 dark:shadow-cyan-900/20'
  },
  'fechado': { 
    borderTop: 'border-t-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-500/5', 
    text: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'shadow-emerald-200/20 dark:shadow-emerald-900/20'
  },
  'perdido': { 
    borderTop: 'border-t-red-500', 
    bg: 'bg-red-50 dark:bg-red-500/5', 
    text: 'text-red-600 dark:text-red-400',
    shadow: 'shadow-red-200/20 dark:shadow-red-900/20'
  },
};

const Pipeline: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as PipelineStatus;
    const leadNumero = draggableId;

    // Optimistic Update
    const updatedLeads = leads.map(l => 
      l.numero === leadNumero ? { ...l, pipeline: newStatus } : l
    );
    setLeads(updatedLeads);

    // API Call
    try {
      await updateLead(leadNumero, { pipeline: newStatus });
    } catch (error) {
      console.error("Failed to update pipeline status", error);
      loadLeads(); // Revert
    }
  };

  // Helper to get leads per column
  const getLeadsByStatus = (status: PipelineStatus) => {
    return leads.filter(l => l.pipeline === status);
  };

  if (loading && leads.length === 0) {
    return <div className="text-center mt-20 text-gray-500 dark:text-gray-400 animate-pulse">Carregando Pipeline...</div>;
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-3rem)] flex flex-col">
       {/* Header Responsivo */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline de Vendas</h1>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <ThemeToggle />
          <button 
            onClick={loadLeads}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 transition-colors shadow-sm"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Kanban Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full space-x-4 min-w-max px-1">
            {PIPELINE_COLUMNS.map(status => {
              const columnLeads = getLeadsByStatus(status);
              const styles = COLUMN_STYLES[status];

              return (
                <div 
                  key={status} 
                  className={`w-72 md:w-80 flex flex-col rounded-xl h-full max-h-full border-t-4 ${styles.borderTop} ${styles.bg} bg-opacity-50 backdrop-blur-sm border-x border-b border-gray-200 dark:border-gray-800/50 transition-colors duration-300`}
                >
                  {/* Header */}
                  <div className="p-4 flex items-center justify-between">
                    <h3 className={`font-bold uppercase text-xs tracking-wider ${styles.text}`}>
                      {status}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm`}>
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors custom-scrollbar ${
                          snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''
                        }`}
                      >
                        {columnLeads.map((lead, index) => (
                          <Draggable key={lead.numero} draggableId={lead.numero} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm group hover:border-indigo-300 dark:hover:border-gray-600 transition-all ${
                                  snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 rotate-2 z-50' : ''
                                }`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                {/* Status IA Robot Indicator - Absolute Top Right */}
                                <div className="absolute top-3 right-3" title={!lead.status_ia ? "IA Ativa" : "IA Pausada"}>
                                   <div className={`p-1.5 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-colors ${
                                     !lead.status_ia 
                                      ? 'text-green-500 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                      : 'text-red-500 dark:text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                                   }`}>
                                      <Bot size={14} strokeWidth={2.5} />
                                   </div>
                                </div>

                                <div className="flex flex-col pr-8">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1">{lead.nome}</h4>
                                  <span className="text-[10px] text-gray-500 font-mono tracking-wide mb-3">
                                    {lead.numero}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto items-center">
                                  {lead.anuncio && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium rounded border border-blue-200 dark:border-blue-500/20">
                                      <Tag className="w-3 h-3" /> Anúncio
                                    </span>
                                  )}
                                  
                                  {/* Display first valid tag from JSON */}
                                  {lead.qualificacao && typeof lead.qualificacao === 'object' && Object.keys(lead.qualificacao).length > 0 && (
                                     <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-[10px] rounded border border-gray-200 dark:border-gray-700">
                                       {Object.keys(lead.qualificacao)[0]}
                                     </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Pipeline;