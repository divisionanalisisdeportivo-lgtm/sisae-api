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
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="gov-heading-2 text-slate-800 mb-2">
                  {activeTab === 'clubes' && 'Gestión de Sanciones - Clubes Deportivos'}
                  {activeTab === 'tribuna' && 'Programa Tribuna Segura - Sanciones Personales'}
                  {activeTab === 'estadisticas' && 'Estadísticas y Reportes del Sistema'}
                </h2>
                <p className="gov-text-small text-slate-600">
                  {activeTab === 'clubes' && 'Administración y seguimiento de sanciones aplicadas a clubes deportivos de la provincia'}
                  {activeTab === 'tribuna' && 'Control y gestión de sanciones individuales bajo el programa Tribuna Segura'}
                  {activeTab === 'estadisticas' && 'Análisis estadístico y generación de reportes ejecutivos del sistema SISAE'}
                </p>
              </div>
              <div className="hidden md:block">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                  activeTab === 'clubes' ? 'bg-blue-100 text-blue-600' :
                  activeTab === 'tribuna' ? 'bg-orange-100 text-orange-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <i className={`${
                    activeTab === 'clubes' ? 'fas fa-users' :
                    activeTab === 'tribuna' ? 'fas fa-user-shield' :
                    'fas fa-chart-bar'
                  } text-2xl`}></i>
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