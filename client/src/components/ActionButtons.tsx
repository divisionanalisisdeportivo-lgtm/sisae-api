import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  onOpenClubModal: () => void;
  onOpenPersonalModal: () => void;
}

export default function ActionButtons({ onOpenClubModal, onOpenPersonalModal }: ActionButtonsProps) {
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Exportación PDF",
      description: "Funcionalidad de exportación en desarrollo",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <button 
        onClick={onOpenClubModal}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        data-testid="button-new-club-sanction"
      >
        <i className="fas fa-plus mr-2"></i>Nueva Sanción Club
      </button>
      
      <button 
        onClick={onOpenPersonalModal}
        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        data-testid="button-new-personal-sanction"
      >
        <i className="fas fa-user-plus mr-2"></i>Nueva Sanción Personal
      </button>
      
      <button 
        onClick={handleExportPDF}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        data-testid="button-export-pdf"
      >
        <i className="fas fa-file-pdf mr-2"></i>Exportar PDF
      </button>
    </div>
  );
}
