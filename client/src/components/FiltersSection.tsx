interface Filters {
  search: string;
  sport: string;
  status: string;
}

interface FiltersSectionProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const SPORTS = [
  'Fútbol', 'Básquetbol', 'Voleibol', 'Rugby', 'Hockey', 'Tenis', 
  'Natación', 'Atletismo', 'Boxeo', 'Karate', 'Judo', 'Taekwondo', 
  'Paddle', 'Golf', 'Ciclismo', 'Gimnasia', 'Handball'
];

export default function FiltersSection({ filters, onFiltersChange }: FiltersSectionProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: "", sport: "", status: "" });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">
        <i className="fas fa-filter mr-2"></i>Filtros
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Buscar</label>
          <input 
            type="text" 
            placeholder="Nombre, deporte, ubicación..." 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/80 text-gray-800 placeholder-gray-500"
            data-testid="input-search-filter"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Deporte</label>
          <select 
            value={filters.sport}
            onChange={(e) => handleFilterChange('sport', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/80 text-gray-800"
            data-testid="select-sport-filter"
          >
            <option value="">Todos los deportes</option>
            {SPORTS.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">Estado</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/80 text-gray-800"
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
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            data-testid="button-clear-filters"
          >
            <i className="fas fa-broom mr-2"></i>Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
