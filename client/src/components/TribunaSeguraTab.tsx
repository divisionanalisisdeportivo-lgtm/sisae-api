import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PersonalSanction } from "@shared/schema";

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
];

function isActive(sanction: PersonalSanction): boolean {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  return endDate >= today;
}
import PersonalSanctionModal from "./PersonalSanctionModal";

interface TribunaSeguraTabProps {
  filters: {
    search: string;
    sport: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function TribunaSeguraTab({ filters, onFiltersChange }: TribunaSeguraTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: personalSanctions = [], isLoading } = useQuery<PersonalSanction[]>({
    queryKey: ["/api/personal-sanctions"],
  });

  // Filter sanctions based on current filters
  const filteredSanctions = personalSanctions.filter((sanction) => {
    const matchesSearch = !filters.search || 
      sanction.nombrePersona.toLowerCase().includes(filters.search.toLowerCase()) ||
      sanction.dniPersona.includes(filters.search) ||
      sanction.deporte.toLowerCase().includes(filters.search.toLowerCase());
    
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

  const generateTribunaSeguraReport = () => {
    // Simulated PDF generation for Tribuna Segura
    const reportData = {
      title: "Reporte de Tribuna Segura",
      date: new Date().toLocaleDateString('es-AR'),
      totalSanctions: personalSanctions.length,
      activeSanctions: personalSanctions.filter(isActive).length,
      expiredSanctions: personalSanctions.filter(s => !isActive(s)).length,
      sanctions: filteredSanctions
    };

    // In a real implementation, you would use a PDF library like jsPDF
    console.log("Generando reporte PDF de Tribuna Segura:", reportData);
    
    alert(`Reporte de Tribuna Segura generado exitosamente:
    
    - Total de sanciones: ${reportData.totalSanctions}
    - Sanciones activas: ${reportData.activeSanctions} 
    - Sanciones vencidas: ${reportData.expiredSanctions}
    - Fecha: ${reportData.date}
    
    El archivo PDF se descargaría automáticamente.`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-4xl text-orange-500 mb-4"></i>
          <p className="text-gray-600">Cargando sanciones personales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mb-8">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="gov-button-accent flex items-center space-x-2 py-4 px-8"
          data-testid="button-new-personal-sanction"
        >
          <i className="fas fa-user-plus"></i>
          <span>Nueva Sanción Personal</span>
        </button>
        <button 
          onClick={generateTribunaSeguraReport}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-4 px-6 rounded-md transition-all duration-200 shadow-sm hover:shadow-md border border-red-800 flex items-center space-x-2"
          data-testid="button-export-tribuna"
        >
          <i className="fas fa-file-pdf"></i>
          <span>Generar Reporte PDF</span>
        </button>
      </div>

      {/* Filters */}
      <div className="gov-filter-section">
        <h3 className="gov-section-title">
          <i className="fas fa-filter mr-3" style={{color: 'var(--sisae-yellow)'}}></i>Filtros de Búsqueda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input 
              type="text" 
              placeholder="Buscar por nombre, DNI, deporte..." 
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
            <i className="fas fa-list mr-3" style={{color: 'var(--sisae-yellow)'}}></i>Registro Tribuna Segura - Sanciones Personales
          </h3>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 px-4 py-2 rounded-md border border-yellow-200">
            <span className="font-semibold" data-testid="results-count">
              {filteredSanctions.length} resultado{filteredSanctions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {filteredSanctions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <i className="fas fa-user-shield text-5xl mb-4"></i>
              <p className="text-xl font-medium mb-2">No hay sanciones personales</p>
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
                      <h3 className="text-lg font-bold text-gray-800">{sanction.nombrePersona}</h3>
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
                        <span className="font-medium text-gray-600">DNI:</span>
                        <p className="text-gray-800">{sanction.dniPersona}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Edad:</span>
                        <p className="text-gray-800">{sanction.edadPersona} años</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Deporte:</span>
                        <p className="text-gray-800">{sanction.deporte}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Departamento:</span>
                        <p className="text-gray-800">{(sanction as any).ubicacion || 'No especificado'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Motivo:</span>
                      <p className="text-gray-800 font-medium">{(sanction as any).motivoSancion || 'No especificado'}</p>
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

      <PersonalSanctionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}