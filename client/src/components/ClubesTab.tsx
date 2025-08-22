import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ClubSanction } from "@shared/schema";

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

  const { data: clubSanctions = [], isLoading } = useQuery<ClubSanction[]>({
    queryKey: ["/api/club-sanctions"],
  });

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
      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Sanciones Clubes</p>
            <p className="text-3xl font-bold text-gray-800" data-testid="count-club-sanctions">{clubSanctions.length}</p>
          </div>
          <i className="fas fa-users text-blue-500 text-3xl"></i>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-md"
          data-testid="button-new-club-sanction"
        >
          <i className="fas fa-plus mr-2"></i>Nueva Sanción Club
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <i className="fas fa-filter mr-2 text-blue-600"></i>Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input 
              type="text" 
              placeholder="Nombre, deporte, ubicación..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="input-search-filter"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deporte</label>
            <select 
              value={filters.sport}
              onChange={(e) => handleFilterChange('sport', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
              data-testid="button-clear-filters"
            >
              <i className="fas fa-broom mr-2"></i>Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Sanctions List */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            <i className="fas fa-list mr-2 text-blue-600"></i>Sanciones de Clubes
          </h3>
          <span className="text-gray-600 font-medium" data-testid="results-count">
            {filteredSanctions.length} resultado{filteredSanctions.length !== 1 ? 's' : ''}
          </span>
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
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300"
                data-testid={`sanction-card-${sanction.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{sanction.nombreSancionado}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isActive(sanction) 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {isActive(sanction) ? 'Activa' : 'Vencida'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Deporte:</span>
                        <p className="text-gray-800">{sanction.deporte}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Ubicación:</span>
                        <p className="text-gray-800">{sanction.ubicacion}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <p className="text-gray-800">{sanction.tipoSancion}</p>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClubSanctionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}