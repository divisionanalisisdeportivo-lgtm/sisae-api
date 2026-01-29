import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Users, FileText, BarChart3 } from "lucide-react";
import sisaeIcon from "@assets/sisae-icon.png_1755871496091.png";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen sisae-gradient-bg">
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Left side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-2xl border border-orange-200/50 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 w-20 h-20 sisae-icon-container rounded-xl flex items-center justify-center shadow-lg">
                  <img 
                    src={sisaeIcon}
                    alt="SISAE Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                  <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    SISAE
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Sistema de Sanciones y Estadísticas
                </CardDescription>
                <p className="text-xs text-gray-500 mt-1">COSEDEPRO Córdoba</p>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">Usuario</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      {...register("username")}
                      className={`h-12 border-2 ${errors.username ? "border-red-500" : "border-gray-200 focus:border-orange-400"} rounded-lg transition-colors`}
                      data-testid="input-username"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm flex items-center" data-testid="error-username">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      {...register("password")}
                      className={`h-12 border-2 ${errors.password ? "border-red-500" : "border-gray-200 focus:border-orange-400"} rounded-lg transition-colors`}
                      data-testid="input-password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm flex items-center" data-testid="error-password">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading || loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {isLoading || loginMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Hero Section */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Sistema de Sanciones y Estadísticas
            </h1>
            <p className="text-xl text-gray-200 mb-8 drop-shadow-md">
              COSEDEPRO Córdoba - Plataforma integral para el control y seguimiento de sanciones deportivas
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600 border-2 border-orange-300 flex items-center justify-center shadow-md mb-3">
                  <i className="fas fa-users text-lg"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Gestión de Clubes</h3>
                <p className="text-sm text-gray-600">Control de sanciones institucionales</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-600 border-2 border-yellow-300 flex items-center justify-center shadow-md mb-3">
                  <i className="fas fa-user-shield text-lg"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Tribuna Segura</h3>
                <p className="text-sm text-gray-600">Seguimiento de sanciones personales</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 text-red-600 border-2 border-red-300 flex items-center justify-center shadow-md mb-3">
                  <i className="fas fa-file-pdf text-lg"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Reportes PDF</h3>
                <p className="text-sm text-gray-600">Generación automática de informes</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 border-2 border-blue-300 flex items-center justify-center shadow-md mb-3">
                  <i className="fas fa-chart-bar text-lg"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Estadísticas</h3>
                <p className="text-sm text-gray-600">Análisis y métricas detalladas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}