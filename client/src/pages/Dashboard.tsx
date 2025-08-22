import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import ClubesTab from "@/components/ClubesTab";
import TribunaSeguraTab from "@/components/TribunaSeguraTab";
import EstadisticasTab from "@/components/EstadisticasTab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('clubes');
  const [filters, setFilters] = useState({
    search: "",
    sport: "",
    status: "",
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'clubes':
        return <ClubesTab filters={filters} onFiltersChange={setFilters} />;
      case 'tribuna':
        return <TribunaSeguraTab filters={filters} onFiltersChange={setFilters} />;
      case 'estadisticas':
        return <EstadisticasTab />;
      default:
        return <ClubesTab filters={filters} onFiltersChange={setFilters} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeTab === 'clubes' && 'Gestión de Sanciones - Clubes Deportivos'}
                  {activeTab === 'tribuna' && 'Programa Tribuna Segura - Sanciones Personales'}
                  {activeTab === 'estadisticas' && 'Estadísticas y Reportes del Sistema'}
                </h2>
                <p className="text-sm text-gray-600 max-w-2xl">
                  {activeTab === 'clubes' && 'Sanciones aplicadas por COSEDEPRO Córdoba'}
                  {activeTab === 'tribuna' && 'Control y gestión de sanciones individuales bajo el programa Tribuna Segura'}
                  {activeTab === 'estadisticas' && 'Análisis estadístico y generación de reportes ejecutivos del sistema SISAE'}
                </p>
              </div>
              <div className="hidden md:block">
                <div className={`w-18 h-18 rounded-xl flex items-center justify-center shadow-lg ${
                  activeTab === 'clubes' ? 'bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600 border-2 border-orange-300' :
                  activeTab === 'tribuna' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-600 border-2 border-yellow-300' :
                  'bg-gradient-to-br from-red-100 to-orange-100 text-red-600 border-2 border-red-300'
                }`}>
                  <i className={`${
                    activeTab === 'clubes' ? 'fas fa-users' :
                    activeTab === 'tribuna' ? 'fas fa-user-shield' :
                    'fas fa-chart-bar'
                  } text-3xl`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {renderTabContent()}
      </main>
    </div>
  );
}