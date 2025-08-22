import Header from "@/components/Header";
import DashboardCards from "@/components/DashboardCards";
import ActionButtons from "@/components/ActionButtons";
import FiltersSection from "@/components/FiltersSection";
import SanctionsList from "@/components/SanctionsList";
import ClubSanctionModal from "@/components/ClubSanctionModal";
import PersonalSanctionModal from "@/components/PersonalSanctionModal";
import { useState } from "react";

export default function Dashboard() {
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    sport: "",
    status: "",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 text-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <DashboardCards />
        <ActionButtons 
          onOpenClubModal={() => setIsClubModalOpen(true)}
          onOpenPersonalModal={() => setIsPersonalModalOpen(true)}
        />
        <FiltersSection filters={filters} onFiltersChange={setFilters} />
        <SanctionsList filters={filters} />
      </main>

      <ClubSanctionModal 
        isOpen={isClubModalOpen} 
        onClose={() => setIsClubModalOpen(false)} 
      />
      <PersonalSanctionModal 
        isOpen={isPersonalModalOpen} 
        onClose={() => setIsPersonalModalOpen(false)} 
      />
    </div>
  );
}
