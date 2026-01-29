import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClubSanction, PersonalSanction } from "@/types/sanctions";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface Filters {
  search: string;
  sport: string;
  status: string;
}

interface SanctionsListProps {
  filters: Filters;
}

type CombinedSanction = (ClubSanction & { type: 'club' }) | (PersonalSanction & { type: 'personal' });

function isActive(sanction: ClubSanction | PersonalSanction): boolean {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  return endDate >= today;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR');
}

function getDaysRemaining(sanction: ClubSanction | PersonalSanction): number {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export default function SanctionsList({ filters }: SanctionsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clubSanctions = [], isLoading: clubLoading } = useQuery<ClubSanction[]>({
    queryKey: ["/api/club-sanctions"],
  });

  const { data: personalSanctions = [], isLoading: personalLoading } = useQuery<PersonalSanction[]>({
    queryKey: ["/api/personal-sanctions"],
  });

  const deleteClubMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/club-sanctions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/club-sanctions"] });
      toast({ title: "Sanción eliminada", description: "La sanción de club fue eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar la sanción", variant: "destructive" });
    },
  });

  const deletePersonalMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/personal-sanctions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-sanctions"] });
      toast({ title: "Sanción eliminada", description: "La sanción personal fue eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar la sanción", variant: "destructive" });
    },
  });

  const combinedSanctions: CombinedSanction[] = useMemo(() => {
    const clubData = clubSanctions.map(s => ({ ...s, type: 'club' as const }));
    const personalData = personalSanctions.map(s => ({ ...s, type: 'personal' as const }));
    return [...clubData, ...personalData];
  }, [clubSanctions, personalSanctions]);

  const filteredSanctions = useMemo(() => {
    return combinedSanctions.filter(sanction => {
      const searchMatch = !filters.search || 
        (sanction.type === 'club' ? sanction.nombreSancionado : sanction.nombrePersona)
          .toLowerCase().includes(filters.search.toLowerCase()) ||
        sanction.deporte.toLowerCase().includes(filters.search.toLowerCase()) ||
        (sanction.type === 'club' && sanction.ubicacion?.toLowerCase().includes(filters.search.toLowerCase()));

      const sportMatch = !filters.sport || sanction.deporte === filters.sport;
      
      const statusMatch = !filters.status || 
        (filters.status === 'activa' && isActive(sanction)) ||
        (filters.status === 'vencida' && !isActive(sanction));

      return searchMatch && sportMatch && statusMatch;
    });
  }, [combinedSanctions, filters]);

  const handleDelete = (id: string, type: 'club' | 'personal') => {
    if (confirm('¿Está seguro de que desea eliminar esta sanción?')) {
      if (type === 'club') {
        deleteClubMutation.mutate(id);
      } else {
        deletePersonalMutation.mutate(id);
      }
    }
  };

  const handleEdit = (id: string, type: 'club' | 'personal') => {
    toast({
      title: "Función en desarrollo",
      description: "La edición de sanciones estará disponible próximamente",
    });
  };

  if (clubLoading || personalLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando sanciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          <i className="fas fa-list mr-2 text-blue-600"></i>Todas las Sanciones
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium" data-testid="results-count">
            {filteredSanctions.length} resultado{filteredSanctions.length !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/club-sanctions"] });
              queryClient.invalidateQueries({ queryKey: ["/api/personal-sanctions"] });
            }}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            data-testid="button-refresh"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      
      {filteredSanctions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <div className="text-gray-500">
            <i className="fas fa-clipboard-list text-5xl mb-4"></i>
            <p className="text-xl font-medium mb-2">No hay sanciones que mostrar</p>
            <p className="text-sm">Use los filtros o agregue nuevas sanciones</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4" data-testid="sanctions-list">
          {filteredSanctions.map((sanction) => (
            <div 
              key={`${sanction.type}-${sanction.id}`}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300"
              data-testid={`sanction-card-${sanction.id}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                      {sanction.type === 'club' ? sanction.nombreSancionado : sanction.nombrePersona}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sanction.type === 'club' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {sanction.type === 'club' ? 'Club' : 'Personal'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <i className="fas fa-futbol mr-2 text-blue-500"></i>
                        <strong>Deporte:</strong> {sanction.deporte}
                      </p>
                      {sanction.type === 'club' && sanction.ubicacion && (
                        <p className="text-gray-600">
                          <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                          <strong>Ubicación:</strong> {sanction.ubicacion}
                        </p>
                      )}
                      {sanction.type === 'personal' && (
                        <p className="text-gray-600">
                          <i className="fas fa-id-card mr-2 text-green-500"></i>
                          <strong>DNI:</strong> {sanction.dniPersona}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <i className="fas fa-calendar mr-2 text-blue-500"></i>
                        <strong>Inicio:</strong> {formatDate(sanction.fechaInicio)}
                      </p>
                      <p className="text-gray-600">
                        <i className="fas fa-calendar-check mr-2 text-green-500"></i>
                        <strong>Fin:</strong> {formatDate(sanction.fechaFin)}
                      </p>
                    </div>
                    <div>
                      {sanction.type === 'club' && sanction.tipoSancion && (
                        <p className="text-gray-600">
                          <i className="fas fa-gavel mr-2 text-orange-500"></i>
                          <strong>Tipo:</strong> {sanction.tipoSancion}
                        </p>
                      )}
                      {sanction.type === 'personal' && (
                        <p className="text-gray-600">
                          <i className="fas fa-birthday-cake mr-2 text-pink-500"></i>
                          <strong>Edad:</strong> {sanction.edadPersona}
                        </p>
                      )}
                      <p className="text-gray-600">
                        <i className="fas fa-clock mr-2 text-gray-500"></i>
                        <strong>Días restantes:</strong> {getDaysRemaining(sanction)}
                      </p>
                    </div>
                  </div>
                  
                  {sanction.observaciones && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <i className="fas fa-sticky-note mr-2"></i>
                        {sanction.observaciones}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isActive(sanction) 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isActive(sanction) ? 'Activa' : 'Vencida'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(sanction.id, sanction.type)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                      title="Editar"
                      data-testid={`button-edit-${sanction.id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(sanction.id, sanction.type)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                      title="Eliminar"
                      data-testid={`button-delete-${sanction.id}`}
                      disabled={deleteClubMutation.isPending || deletePersonalMutation.isPending}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
