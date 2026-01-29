import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BackupInfo {
  fileName: string;
  date: string;
  size: number;
  formattedDate: string;
  formattedSize: string;
}

interface BackupListResponse {
  success: boolean;
  backups: BackupInfo[];
}

export default function BackupManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  // Get list of backups
  const { data: backupList, isLoading: isLoadingBackups } = useQuery<BackupListResponse>({
    queryKey: ["/api/backup/list"],
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/backup/create").then(res => res.json()),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/backup/list"] });
      toast({
        title: "¡Respaldo creado!",
        description: response.message,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el respaldo",
        variant: "destructive",
      });
    },
  });

  // Get backup details query
  const { data: backupDetails } = useQuery({
    queryKey: ["/api/backup", selectedBackup],
    queryFn: async () => {
      if (selectedBackup) {
        const response = await apiRequest("GET", `/api/backup/${selectedBackup}`);
        return await response.json();
      }
      return null;
    },
    enabled: !!selectedBackup,
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: (fileName: string) => 
      apiRequest("POST", "/api/backup/restore", { fileName }).then(res => res.json()),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/club-sanctions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-sanctions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/backup/list"] });
      toast({
        title: "¡Respaldo restaurado!",
        description: response.message,
        variant: "default",
      });
      setSelectedBackup(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo restaurar el respaldo",
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleRestoreBackup = () => {
    if (selectedBackup) {
      const confirmRestore = confirm(
        "⚠️ ¿Estás seguro de que quieres restaurar este respaldo?\n\n" +
        "Esta acción:\n" +
        "• Creará un respaldo automático del estado actual\n" +
        "• Reemplazará todas las sanciones con los datos del respaldo seleccionado\n" +
        "• No se puede deshacer fácilmente\n\n" +
        "¿Continuar con la restauración?"
      );
      
      if (confirmRestore) {
        restoreBackupMutation.mutate(selectedBackup);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sistema de Respaldos</h2>
          <p className="text-gray-600 mt-2">Gestiona los respaldos de seguridad del sistema SISAE</p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={createBackupMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
          data-testid="button-create-backup"
        >
          {createBackupMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>Creando...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>Crear Respaldo
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-history text-blue-600"></i>
              Historial de Respaldos
            </CardTitle>
            <CardDescription>
              Los respaldos se crean automáticamente cada día a las 2:00 AM
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBackups ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin mr-2 text-gray-400"></i>
                <span className="text-gray-500">Cargando respaldos...</span>
              </div>
            ) : backupList?.backups && backupList.backups.length > 0 ? (
              <div className="space-y-3">
                {backupList.backups.map((backup) => (
                  <div
                    key={backup.fileName}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedBackup === backup.fileName
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBackup(backup.fileName)}
                    data-testid={`backup-item-${backup.fileName}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {backup.formattedDate}
                        </p>
                        <p className="text-sm text-gray-500">
                          {backup.fileName}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{backup.formattedSize}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-folder-open text-4xl mb-4"></i>
                <p>No hay respaldos disponibles</p>
                <p className="text-sm">Crea tu primer respaldo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-info-circle text-green-600"></i>
              Detalles del Respaldo
            </CardTitle>
            <CardDescription>
              Información detallada del respaldo seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedBackup && backupDetails ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Información General</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="font-medium">{new Date(backupDetails.timestamp).toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Versión:</span>
                      <p className="font-medium">{backupDetails.version}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-blue-600 font-medium">Sanciones Clubes</span>
                      <p className="text-2xl font-bold text-blue-800">{backupDetails.statistics.totalClubSanctions}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <span className="text-orange-600 font-medium">Sanciones Personales</span>
                      <p className="text-2xl font-bold text-orange-800">{backupDetails.statistics.totalPersonalSanctions}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="text-green-600 font-medium">Usuarios</span>
                      <p className="text-2xl font-bold text-green-800">{backupDetails.statistics.totalUsers}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <span className="text-purple-600 font-medium">Total Registros</span>
                      <p className="text-2xl font-bold text-purple-800">
                        {backupDetails.statistics.totalClubSanctions + backupDetails.statistics.totalPersonalSanctions}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-shield-alt text-yellow-600 mt-1"></i>
                    <div>
                      <p className="font-medium text-yellow-800">Respaldo Seguro</p>
                      <p className="text-sm text-yellow-700">
                        Este respaldo contiene todos los datos del sistema de forma segura. 
                        Las contraseñas están protegidas y no se incluyen en el archivo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Restore Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleRestoreBackup}
                    disabled={restoreBackupMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-restore-backup"
                  >
                    {restoreBackupMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>Restaurando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-undo mr-2"></i>Restaurar este Respaldo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    ⚠️ Esta acción reemplazará todos los datos actuales
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-hand-point-left text-4xl mb-4"></i>
                <p>Selecciona un respaldo</p>
                <p className="text-sm">para ver sus detalles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backup Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <i className="fas fa-info-circle"></i>
            Información del Sistema de Respaldos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🔄 Respaldos Automáticos</h4>
              <ul className="text-sm space-y-1">
                <li>• Se crean automáticamente todos los días a las 2:00 AM</li>
                <li>• Se mantienen los últimos 10 respaldos</li>
                <li>• Los respaldos antiguos se eliminan automáticamente</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🛡️ Seguridad</h4>
              <ul className="text-sm space-y-1">
                <li>• Las contraseñas no se incluyen en los respaldos</li>
                <li>• Todos los datos se almacenan de forma segura</li>
                <li>• Acceso restringido solo a administradores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}