import React from 'react';
import { PipelineStatus } from '../types';

interface StatusBadgeProps {
  status: PipelineStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<PipelineStatus, string> = {
    'novo lead': 'bg-blue-900/50 text-blue-300 border-blue-800',
    'em atendimento': 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
    'qualificado': 'bg-purple-900/50 text-purple-300 border-purple-800',
    'proposta enviada': 'bg-indigo-900/50 text-indigo-300 border-indigo-800',
    'fechado': 'bg-green-900/50 text-green-300 border-green-800',
    'perdido': 'bg-red-900/50 text-red-300 border-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status] || 'bg-gray-800 text-gray-300'}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default StatusBadge;