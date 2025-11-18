import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 z-30 shadow-sm">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 text-lg font-bold text-gray-900 dark:text-white tracking-tight">LeadFlow AI</span>
      </div>

      {/* Sidebar com props para controle mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Overlay para fechar o menu no mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content - Ajustado padding top para mobile e margin left para desktop */}
      <main className="flex-1 pt-20 md:pt-8 p-4 md:p-8 md:ml-64 overflow-y-auto h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;