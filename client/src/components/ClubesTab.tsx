import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClubSanction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
];

function isActive(sanction: ClubSanction): boolean {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  return endDate >= today;
}
import ClubSanctionModal from "./ClubSanctionModal";

interface ClubesTabProps {
  filters: {
    search: string;
    sport: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function ClubesTab({ filters, onFiltersChange }: ClubesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSanction, setEditingSanction] = useState<ClubSanction | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clubSanctions = [], isLoading, error, isError } = useQuery<ClubSanction[]>({
    queryKey: ["/api/club-sanctions"],
    retry: 3,
    retryDelay: 1000,
  });

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar las sanciones</h3>
        <p className="text-gray-600 mb-4">No se pudieron cargar los datos. Por favor, intenta nuevamente.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar página
        </button>
      </div>
    );
  }

  // Filter sanctions based on current filters
  const filteredSanctions = clubSanctions.filter((sanction) => {
    const matchesSearch = !filters.search || 
      sanction.nombreSancionado.toLowerCase().includes(filters.search.toLowerCase()) ||
      sanction.deporte.toLowerCase().includes(filters.search.toLowerCase()) ||
      sanction.ubicacion.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSport = !filters.sport || sanction.deporte === filters.sport;
    
    const matchesStatus = !filters.status || 
      (filters.status === 'activa' && isActive(sanction)) ||
      (filters.status === 'vencida' && !isActive(sanction));
    
    return matchesSearch && matchesSport && matchesStatus;
  });

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: "", sport: "", status: "" });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/club-sanctions/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/club-sanctions"] });
      toast({
        title: "Sanción eliminada",
        description: "La sanción fue eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la sanción",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (sanction: ClubSanction) => {
    if (confirm(`¿Está seguro de eliminar la sanción ${sanction.numeroCarga} del club ${sanction.nombreSancionado}?`)) {
      deleteMutation.mutate(sanction.id);
    }
  };

  const handleEdit = (sanction: ClubSanction) => {
    setEditingSanction(sanction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSanction(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando sanciones de clubes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end mb-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="gov-button-primary flex items-center space-x-2 py-4 px-8"
          data-testid="button-new-club-sanction"
        >
          <i className="fas fa-plus"></i>
          <span>Nueva Sanción de Club</span>
        </button>
      </div>

      {/* Filters */}
      <div className="gov-filter-section">
        <h3 className="gov-section-title">
          <i className="fas fa-filter mr-3" style={{color: 'var(--sisae-orange-primary)'}}></i>Filtros de Búsqueda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input 
              type="text" 
              placeholder="Buscar por nombre, deporte, ubicación..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="gov-input"
              data-testid="input-search-filter"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deporte</label>
            <select 
              value={filters.sport}
              onChange={(e) => handleFilterChange('sport', e.target.value)}
              className="gov-input"
              data-testid="select-sport-filter"
            >
              <option value="">Todos los deportes</option>
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="gov-input"
              data-testid="select-status-filter"
            >
              <option value="">Todos</option>
              <option value="activa">Activas</option>
              <option value="vencida">Vencidas</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="w-full gov-button-secondary py-3 px-4"
              data-testid="button-clear-filters"
            >
              <i className="fas fa-broom mr-2"></i>Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Sanctions List */}
      <div className="gov-results-section">
        <div className="flex items-center justify-between mb-6">
          <h3 className="gov-section-title">
            <i className="fas fa-list mr-3" style={{color: 'var(--sisae-orange-primary)'}}></i>Registro de Sanciones - Clubes Deportivos
          </h3>
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700 px-4 py-2 rounded-md border border-orange-200">
            <span className="font-semibold" data-testid="results-count">
              {filteredSanctions.length} resultado{filteredSanctions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {filteredSanctions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <i className="fas fa-users text-5xl mb-4"></i>
              <p className="text-xl font-medium mb-2">No hay sanciones de clubes</p>
              <p className="text-sm">Use los filtros o agregue nuevas sanciones</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSanctions.map((sanction) => (
              <div 
                key={sanction.id}
                className={`bg-gradient-to-r ${isActive(sanction) ? 'from-red-50 to-orange-50 border-red-200' : 'from-green-50 to-emerald-50 border-green-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-all duration-300`}
                data-testid={`sanction-card-${sanction.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">C-{String((sanction as any).numeroCarga || '---').padStart(3, '0')}</span>
                      <h3 className="text-lg font-bold text-gray-800">{sanction.nombreSancionado}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isActive(sanction) 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {isActive(sanction) ? 'Activa' : 'Vencida'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Deporte:</span>
                        <p className="text-gray-800">{sanction.deporte}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Departamento:</span>
                        <p className="text-gray-800">{sanction.ubicacion}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tipo de Sanción:</span>
                        <p className="text-gray-800">{sanction.tipoSancion}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Motivos:</span>
                        <div className="text-gray-800">
                          {Array.isArray(sanction.motivoSancion) && sanction.motivoSancion.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sanction.motivoSancion.map((motivo, index) => (
                                <span key={index} className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  {motivo}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No especificado</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <span className="font-medium text-gray-600">Período:</span>
                        <p className="text-gray-800">{sanction.fechaInicio} - {sanction.fechaFin}</p>
                      </div>
                      {sanction.observaciones && (
                        <div>
                          <span className="font-medium text-gray-600">Observaciones:</span>
                          <p className="text-gray-800">{sanction.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(sanction)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                      title="Editar sanción"
                    >
                      <i className="fas fa-edit"></i>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sanction)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                      title="Eliminar sanción"
                      disabled={deleteMutation.isPending}
                    >
                      <i className={`fas ${deleteMutation.isPending ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                      {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClubSanctionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        editingSanction={editingSanction}
      />
    </div>
  );
}