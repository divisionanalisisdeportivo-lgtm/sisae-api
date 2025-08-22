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
    <header className="glassmorphism sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-gavel text-white text-xl" data-testid="logo-icon"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="title-main">SISAE</h1>
              <p className="text-blue-100 text-sm" data-testid="subtitle">Sistema Integral de Sanciones Deportivas</p>
            </div>
          </div>
          
          <div 
            id="status"
            className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-sm border ${
              isOnline 
                ? 'bg-green-500/20 border-green-400/30' 
                : 'bg-red-500/20 border-red-400/30'
            }`}
            data-testid="status-indicator"
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className={`text-sm font-medium ${
              isOnline ? 'text-green-100' : 'text-red-100'
            }`}>
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
