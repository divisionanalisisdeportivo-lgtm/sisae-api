import { useQuery } from "@tanstack/react-query";
import { ClubSanction, PersonalSanction } from "@/types/sanctions";

function isActive(sanction: ClubSanction | PersonalSanction): boolean {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  return endDate >= today;
}

export default function DashboardCards() {
  const { data: clubSanctions = [] } = useQuery<ClubSanction[]>({
    queryKey: ["/api/club-sanctions"],
  });

  const { data: personalSanctions = [] } = useQuery<PersonalSanction[]>({
    queryKey: ["/api/personal-sanctions"],
  });

  const allSanctions = [...clubSanctions, ...personalSanctions];
  const activeSanctions = allSanctions.filter(isActive);
  const expiredSanctions = allSanctions.filter(s => !isActive(s));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="glassmorphism-card p-6 hover:bg-white/15 transition-all duration-300 shadow-lg" data-testid="card-club-sanctions">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Sanciones Clubes</p>
            <p className="text-3xl font-bold text-white" data-testid="count-club-sanctions">{clubSanctions.length}</p>
          </div>
          <i className="fas fa-users text-blue-300 text-2xl"></i>
        </div>
      </div>
      
      <div className="glassmorphism-card p-6 hover:bg-white/15 transition-all duration-300 shadow-lg" data-testid="card-personal-sanctions">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Sanciones Personales</p>
            <p className="text-3xl font-bold text-white" data-testid="count-personal-sanctions">{personalSanctions.length}</p>
          </div>
          <i className="fas fa-user text-blue-300 text-2xl"></i>
        </div>
      </div>
      
      <div className="glassmorphism-card p-6 hover:bg-white/15 transition-all duration-300 shadow-lg" data-testid="card-active-sanctions">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Activas</p>
            <p className="text-3xl font-bold text-green-400" data-testid="count-active-sanctions">{activeSanctions.length}</p>
          </div>
          <i className="fas fa-exclamation-triangle text-green-400 text-2xl"></i>
        </div>
      </div>
      
      <div className="glassmorphism-card p-6 hover:bg-white/15 transition-all duration-300 shadow-lg" data-testid="card-expired-sanctions">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Vencidas</p>
            <p className="text-3xl font-bold text-gray-400" data-testid="count-expired-sanctions">{expiredSanctions.length}</p>
          </div>
          <i className="fas fa-check-circle text-gray-400 text-2xl"></i>
        </div>
      </div>
    </div>
  );
}
