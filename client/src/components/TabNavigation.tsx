interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'clubes', label: 'Clubes', icon: 'fas fa-users' },
    { id: 'tribuna', label: 'Tribuna Segura', icon: 'fas fa-user-shield' },
    { id: 'estadisticas', label: 'Estadísticas', icon: 'fas fa-chart-bar' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex justify-center space-x-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-3 py-5 px-4 border-b-3 font-semibold text-base transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-gray-50'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <i className={`${tab.icon} text-xl`}></i>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}