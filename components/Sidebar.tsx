import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Kanban, Table, Zap, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <>
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 h-16 md:h-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">LeadFlow AI</span>
          </div>
          
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose} 
            className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink to="/" end className={navClass} onClick={onClose}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/pipeline" className={navClass} onClick={onClose}>
            <Kanban className="w-5 h-5" />
            <span>Pipeline</span>
          </NavLink>
          <NavLink to="/leads" className={navClass} onClick={onClose}>
            <Table className="w-5 h-5" />
            <span>Gerenciar Leads</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
            v1.0.0 &bull; Admin Panel
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;