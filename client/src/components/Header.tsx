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
    <header className="bg-blue-600 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <i className="fas fa-gavel text-blue-600 text-xl" data-testid="logo-icon"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="title-main">SISAE</h1>
              <p className="text-blue-100 text-sm" data-testid="subtitle">Sistema Integral de Sanciones Deportivas</p>
            </div>
          </div>
          
          <div 
            id="status"
            className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
              isOnline 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
            data-testid="status-indicator"
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
