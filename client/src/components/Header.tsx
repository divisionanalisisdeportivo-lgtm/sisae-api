import { useState, useEffect } from "react";
import sisaeIcon from "@assets/sisae-icon.png_1755871496091.png";

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
    <header className="sisae-gradient-bg shadow-xl sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-xl sisae-icon-container flex items-center justify-center shadow-lg">
              <img 
                src={sisaeIcon}
                alt="SISAE" 
                className="w-12 h-12 object-contain"
                data-testid="logo-icon"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight" data-testid="title-main">
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  SISAE
                </span>
              </h1>
              <p className="text-gray-300 text-sm font-medium" data-testid="subtitle">Sistema de Sanciones y Estadísticas</p>
              <p className="text-gray-400 text-xs">Provincia de Córdoba</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <div 
              id="status"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 backdrop-blur-sm ${
                isOnline 
                  ? 'bg-green-900/20 text-green-300 border-green-400/30' 
                  : 'bg-red-900/20 text-red-300 border-red-400/30'
              }`}
              data-testid="status-indicator"
            >
              <div className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
              } animate-pulse`}></div>
              <span className="text-sm font-semibold">
                {isOnline ? 'Sistema Activo' : 'Sin Conexión'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
