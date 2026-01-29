interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
}

export default function TabNavigation({ activeTab, onTabChange, userRole }: TabNavigationProps) {
  const baseTabs = [
    { id: 'clubes', label: 'Clubes', icon: 'fas fa-users' },
    { id: 'tribuna', label: 'Tribuna Segura', icon: 'fas fa-user-shield' },
    { id: 'estadisticas', label: 'Estadísticas', icon: 'fas fa-chart-bar' }
  ];
  
  // Add admin tabs if user is admin
  const tabs = userRole === 'admin' 
    ? [...baseTabs, 
       { id: 'administrar', label: 'Administrar', icon: 'fas fa-cog' },
       { id: 'respaldos', label: 'Respaldos', icon: 'fas fa-save' }
      ]
    : baseTabs;

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
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600 border-2 border-orange-300' 
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50 hover:text-orange-500 hover:border-orange-200'
              } transition-all duration-200`}>
                <i className={`${tab.icon} text-lg`}></i>
              </div>
              <div className="text-left ml-2">
                <span className="font-semibold block text-base">{tab.label}</span>
                <span className="text-xs opacity-70">
                  {tab.id === 'clubes' && 'Gestión de clubes'}
                  {tab.id === 'tribuna' && 'Sanciones personales'}
                  {tab.id === 'estadisticas' && 'Reportes y análisis'}
                  {tab.id === 'administrar' && 'Usuarios y permisos'}
                  {tab.id === 'respaldos' && 'Seguridad de datos'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}