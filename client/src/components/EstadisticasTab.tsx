import { useQuery } from "@tanstack/react-query";
import type { ClubSanction, PersonalSanction } from "@shared/schema";

function isActive(sanction: ClubSanction | PersonalSanction): boolean {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  return endDate >= today;
}

export default function EstadisticasTab() {
  const { data: clubSanctions = [] } = useQuery<ClubSanction[]>({
    queryKey: ["/api/club-sanctions"],
  });

  const { data: personalSanctions = [] } = useQuery<PersonalSanction[]>({
    queryKey: ["/api/personal-sanctions"],
  });

  const allSanctions = [...clubSanctions, ...personalSanctions];
  const activeSanctions = allSanctions.filter(isActive);
  const expiredSanctions = allSanctions.filter(s => !isActive(s));

  // Sports statistics
  const sportStats = clubSanctions.concat(personalSanctions).reduce((acc, sanction) => {
    const sport = sanction.deporte;
    if (!acc[sport]) {
      acc[sport] = { total: 0, active: 0, expired: 0 };
    }
    acc[sport].total++;
    if (isActive(sanction)) {
      acc[sport].active++;
    } else {
      acc[sport].expired++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; expired: number }>);

  const sortedSports = Object.entries(sportStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10); // Top 10 sports

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Sanciones</p>
              <p className="text-3xl font-bold text-gray-800">{allSanctions.length}</p>
            </div>
            <i className="fas fa-gavel text-blue-500 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sanciones Activas</p>
              <p className="text-3xl font-bold text-red-600">{activeSanctions.length}</p>
            </div>
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sanciones Vencidas</p>
              <p className="text-3xl font-bold text-green-600">{expiredSanctions.length}</p>
            </div>
            <i className="fas fa-check-circle text-green-500 text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Deportes Involucrados</p>
              <p className="text-3xl font-bold text-purple-600">{Object.keys(sportStats).length}</p>
            </div>
            <i className="fas fa-running text-purple-500 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            <i className="fas fa-users mr-2 text-blue-600"></i>Sanciones por Tipo
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <i className="fas fa-users text-blue-600"></i>
                <span className="font-medium text-gray-800">Sanciones de Clubes</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{clubSanctions.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center space-x-3">
                <i className="fas fa-user-shield text-orange-600"></i>
                <span className="font-medium text-gray-800">Tribuna Segura</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{personalSanctions.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            <i className="fas fa-chart-pie mr-2 text-green-600"></i>Estados de Sanciones
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center space-x-3">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
                <span className="font-medium text-gray-800">Activas</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{activeSanctions.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <i className="fas fa-check-circle text-green-600"></i>
                <span className="font-medium text-gray-800">Vencidas</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{expiredSanctions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Sports */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          <i className="fas fa-trophy mr-2 text-yellow-600"></i>Deportes con Más Sanciones
        </h3>
        <div className="space-y-4">
          {sortedSports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-bar text-4xl mb-4"></i>
              <p>No hay datos de deportes disponibles</p>
            </div>
          ) : (
            sortedSports.map(([sport, stats], index) => (
              <div key={sport} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{sport}</h4>
                    <p className="text-sm text-gray-600">
                      {stats.active} activas, {stats.expired} vencidas
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <i className="fas fa-download mr-2 text-gray-600"></i>Exportar Datos
        </h3>
        <div className="flex flex-wrap gap-4">
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
            onClick={() => alert('Función de exportar PDF próximamente')}
          >
            <i className="fas fa-file-pdf mr-2"></i>Exportar PDF
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
            onClick={() => alert('Función de exportar Excel próximamente')}
          >
            <i className="fas fa-file-excel mr-2"></i>Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}