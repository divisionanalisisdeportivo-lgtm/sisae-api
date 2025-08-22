import { useState, useEffect } from "react";
import sisaeIcon from "@assets/sisae-icon.png_1755871496091.png";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Shield, Settings } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Connection monitoring
    const checkConnection = async () => {
      try {
        // Only check connection if user is authenticated
        if (user) {
          const response = await fetch('/api/user', { credentials: 'include' });
          setIsOnline(response.ok);
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
          
          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="hidden md:flex">
              <div 
                id="status"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 backdrop-blur-sm ${
                  isOnline 
                    ? 'bg-green-900/20 text-green-300 border-green-400/30' 
                    : 'bg-red-900/20 text-red-300 border-red-400/30'
                }`}
                data-testid="status-indicator"
              >
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                } animate-pulse`}></div>
                <span className="text-xs font-medium">
                  {isOnline ? 'Activo' : 'Desconectado'}
                </span>
              </div>
            </div>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    data-testid="user-menu-trigger"
                  >
                    <div className="flex items-center space-x-2">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-blue-300" />
                      ) : (
                        <User className="h-4 w-4 text-gray-300" />
                      )}
                      <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-300">
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium" data-testid="user-menu-username">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role === 'admin' ? 'Administrador del sistema' : 'Usuario del sistema'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600" 
                    onClick={() => logoutMutation.mutate()}
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
