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
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`gov-tab ${
                activeTab === tab.id
                  ? 'gov-tab-active'
                  : 'gov-tab-inactive'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700'
              } transition-colors duration-200`}>
                <i className={`${tab.icon} text-lg`}></i>
              </div>
              <div className="text-left">
                <span className="font-semibold block">{tab.label}</span>
                <span className="text-xs opacity-70">
                  {tab.id === 'clubes' && 'Gestión de clubes'}
                  {tab.id === 'tribuna' && 'Sanciones personales'}
                  {tab.id === 'estadisticas' && 'Reportes y análisis'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}