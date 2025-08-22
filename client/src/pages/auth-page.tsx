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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          {/* Left side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-900">
                  SISAE
                </CardTitle>
                <CardDescription>
                  Sistema Integral de Sanciones y Estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      {...register("username")}
                      className={errors.username ? "border-red-500" : ""}
                      data-testid="input-username"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm" data-testid="error-username">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      {...register("password")}
                      className={errors.password ? "border-red-500" : ""}
                      data-testid="input-password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm" data-testid="error-password">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {isLoading || loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Hero Section */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">
              Sistema de Gestión de Sanciones Deportivas
            </h1>
            <p className="text-xl text-blue-700 mb-8">
              COSEDEPRO Córdoba - Plataforma integral para el control y seguimiento de sanciones deportivas
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-900">Gestión de Clubes</h3>
                <p className="text-sm text-blue-700">Control de sanciones institucionales</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-900">Tribuna Segura</h3>
                <p className="text-sm text-blue-700">Seguimiento de sanciones personales</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-900">Reportes PDF</h3>
                <p className="text-sm text-blue-700">Generación automática de informes</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-blue-900">Estadísticas</h3>
                <p className="text-sm text-blue-700">Análisis y métricas detalladas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}