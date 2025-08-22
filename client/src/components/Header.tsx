import { useState, useEffect } from "react";

export default function Header() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate connection monitoring
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/club-sanctions');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg sticky top-0 z-50 border-b border-slate-600">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center shadow-md">
              <i className="fas fa-gavel text-slate-700 text-2xl" data-testid="logo-icon"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="title-main">SISAE</h1>
              <p className="text-slate-300 text-sm font-medium" data-testid="subtitle">Sistema de Sanciones y Estadísticas</p>
              <p className="text-slate-400 text-xs">Provincia de Córdoba</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right text-slate-300">
              <p className="text-sm font-medium">Ministerio de Deportes</p>
              <p className="text-xs text-slate-400">Gobierno de Córdoba</p>
            </div>
            
            <div 
              id="status"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                isOnline 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
              data-testid="status-indicator"
            >
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {isOnline ? 'Sistema Activo' : 'Sin Conexión'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
