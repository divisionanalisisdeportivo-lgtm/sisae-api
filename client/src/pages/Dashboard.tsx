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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}