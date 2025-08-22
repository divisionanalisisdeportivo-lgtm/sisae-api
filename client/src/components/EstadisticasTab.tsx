import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { ClubSanction, PersonalSanction } from "@shared/schema";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function isActive(sanction: ClubSanction | PersonalSanction): boolean {
  const today = new Date();
  const endDate = new Date(sanction.fechaFin);
  return endDate >= today;
}

export default function EstadisticasTab() {
  const { data: clubSanctions = [], isLoading: isLoadingClub, isError: isErrorClub } = useQuery<ClubSanction[]>({
    queryKey: ["/api/club-sanctions"],
    retry: 3,
    retryDelay: 1000,
  });

  const { data: personalSanctions = [], isLoading: isLoadingPersonal, isError: isErrorPersonal } = useQuery<PersonalSanction[]>({
    queryKey: ["/api/personal-sanctions"],
    retry: 3,
    retryDelay: 1000,
  });

  if (isErrorClub || isErrorPersonal) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar las estadísticas</h3>
        <p className="text-gray-600 mb-4">No se pudieron cargar los datos. Por favor, intenta nuevamente.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar página
        </button>
      </div>
    );
  }

  const isLoading = isLoadingClub || isLoadingPersonal;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  const generateStatisticsReport = () => {
    const totalSanctions = clubSanctions.length + personalSanctions.length;
    const activeSanctions = [...clubSanctions.filter(isActive), ...personalSanctions.filter(isActive)];
    
    const reportData = {
      title: "Reporte General de Estadísticas SISAE",
      date: new Date().toLocaleDateString('es-AR'),
      totalSanctions: totalSanctions,
      clubSanctions: clubSanctions.length,
      personalSanctions: personalSanctions.length,
      activeSanctions: activeSanctions.length,
      expiredSanctions: totalSanctions - activeSanctions.length
    };

    console.log("Generando reporte general PDF:", reportData);
    
    // Generate PDF with jsPDF
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(18);
    pdf.setTextColor(220, 38, 38); // Red color
    pdf.text('SISAE - Sistema Integral de Sanciones y Estadísticas', 20, 20);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Reporte General de Estadísticas', 20, 35);
    
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${reportData.date}`, 20, 45);
    
    // Statistics summary
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('ESTADISTICAS GENERALES', 20, 65);
    
    pdf.setFontSize(12);
    pdf.text(`Total de sanciones: ${reportData.totalSanctions}`, 20, 80);
    pdf.text(`Sanciones de clubes: ${reportData.clubSanctions}`, 20, 90);
    pdf.text(`Sanciones personales: ${reportData.personalSanctions}`, 20, 100);
    pdf.text(`Sanciones activas: ${reportData.activeSanctions}`, 20, 110);
    pdf.text(`Sanciones vencidas: ${reportData.expiredSanctions}`, 20, 120);
    
    // Add summary text
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    let currentY = 140;
    
    const summaryText = [
      'RESUMEN EJECUTIVO:',
      '',
      `El sistema SISAE cuenta actualmente con ${reportData.totalSanctions} sanciones registradas.`,
      `De estas, ${reportData.clubSanctions} corresponden a sanciones aplicadas a clubes deportivos`,
      `y ${reportData.personalSanctions} son sanciones individuales del programa Tribuna Segura.`,
      '',
      `Estado actual: ${reportData.activeSanctions} sanciones se encuentran vigentes y`,
      `${reportData.expiredSanctions} sanciones han sido cumplidas y estan vencidas.`,
      '',
      'Este reporte refleja la actividad sancionatoria de COSEDEPRO Cordoba',
      'en el marco del Sistema Integral de Sanciones y Estadisticas.'
    ];
    
    summaryText.forEach((line, index) => {
      if (line === 'RESUMEN EJECUTIVO:') {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
      }
      pdf.text(line, 20, currentY + (index * 12));
    });
    
    currentY += summaryText.length * 12 + 20;
    
    // Club sanctions table
    if (clubSanctions.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('SANCIONES DE CLUBES', 20, currentY);
      
      const clubTableData = clubSanctions.map(sanction => [
        `C-${String(sanction.numeroCarga).padStart(3, '0')}`,
        sanction.nombreSancionado,
        sanction.deporte,
        sanction.ubicacion,
        sanction.tipoSancion,
        sanction.fechaInicio,
        sanction.fechaFin,
        isActive(sanction) ? 'Activa' : 'Vencida'
      ]);
      
      autoTable(pdf, {
        head: [['No', 'Club', 'Deporte', 'Departamento', 'Tipo', 'Inicio', 'Fin', 'Estado']],
        body: clubTableData,
        startY: currentY + 10,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        margin: { left: 10, right: 10 },
      });
      currentY = (pdf as any).lastAutoTable.finalY + 20;
    }
    
    // Personal sanctions table
    if (personalSanctions.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('SANCIONES PERSONALES - TRIBUNA SEGURA', 20, currentY);
      
      const personalTableData = personalSanctions.map(sanction => [
        `TS-${String(sanction.numeroCarga).padStart(3, '0')}`,
        sanction.nombrePersona,
        sanction.dniPersona,
        sanction.deporte,
        sanction.ubicacion,
        sanction.fechaInicio,
        sanction.fechaFin,
        isActive(sanction) ? 'Activa' : 'Vencida'
      ]);
      
      autoTable(pdf, {
        head: [['No', 'Persona', 'DNI', 'Deporte', 'Departamento', 'Inicio', 'Fin', 'Estado']],
        body: personalTableData,
        startY: currentY + 10,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        margin: { left: 10, right: 10 },
      });
      currentY = (pdf as any).lastAutoTable.finalY + 20;
    }
    
    // Add visual statistics representation
    if (reportData.totalSanctions > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('REPRESENTACION GRAFICA', 20, currentY);
      
      // Simple bar representation using text
      const maxBarWidth = 100;
      const totalSanctions = reportData.totalSanctions;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      // Club sanctions bar
      const clubBarWidth = totalSanctions > 0 ? (reportData.clubSanctions / totalSanctions) * maxBarWidth : 0;
      pdf.text('Sanciones de Clubes:', 20, currentY + 20);
      pdf.setFillColor(220, 38, 38);
      if (clubBarWidth > 0) {
        pdf.rect(20, currentY + 25, clubBarWidth, 8, 'F');
      }
      pdf.text(`${reportData.clubSanctions} (${totalSanctions > 0 ? Math.round((reportData.clubSanctions/totalSanctions)*100) : 0}%)`, clubBarWidth + 25, currentY + 31);
      
      // Personal sanctions bar  
      const personalBarWidth = totalSanctions > 0 ? (reportData.personalSanctions / totalSanctions) * maxBarWidth : 0;
      pdf.text('Sanciones Personales:', 20, currentY + 45);
      pdf.setFillColor(139, 69, 19);
      if (personalBarWidth > 0) {
        pdf.rect(20, currentY + 50, personalBarWidth, 8, 'F');
      }
      pdf.text(`${reportData.personalSanctions} (${totalSanctions > 0 ? Math.round((reportData.personalSanctions/totalSanctions)*100) : 0}%)`, personalBarWidth + 25, currentY + 56);
      
      // Active vs Expired
      pdf.text('Estado de Sanciones:', 20, currentY + 75);
      const activeBarWidth = totalSanctions > 0 ? (reportData.activeSanctions / totalSanctions) * maxBarWidth : 0;
      pdf.setFillColor(34, 197, 94);
      if (activeBarWidth > 0) {
        pdf.rect(20, currentY + 80, activeBarWidth, 8, 'F');
      }
      pdf.text(`Activas: ${reportData.activeSanctions}`, 25, currentY + 86);
      
      const expiredBarWidth = totalSanctions > 0 ? (reportData.expiredSanctions / totalSanctions) * maxBarWidth : 0;
      pdf.setFillColor(156, 163, 175);
      if (expiredBarWidth > 0) {
        pdf.rect(20, currentY + 95, expiredBarWidth, 8, 'F');
      }
      pdf.text(`Vencidas: ${reportData.expiredSanctions}`, 25, currentY + 101);
      
      currentY += 120;
    }
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text('COSEDEPRO Cordoba - Sistema SISAE', 20, currentY);
    pdf.text(`Generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`, 20, currentY + 10);
    pdf.text('Confidencial - Solo para uso interno de COSEDEPRO', 20, currentY + 20);
    
    // Download PDF
    const fileName = `Reporte_General_SISAE_${new Date().getFullYear()}_${(new Date().getMonth() + 1).toString().padStart(2, '0')}.pdf`;
    pdf.save(fileName);
  };


  const activeSanctions = [...clubSanctions.filter(isActive), ...personalSanctions.filter(isActive)];
  const expiredSanctions = [...clubSanctions.filter(s => !isActive(s)), ...personalSanctions.filter(s => !isActive(s))];
  const totalSanctions = clubSanctions.length + personalSanctions.length;

  // Sports statistics  
  const allSanctionsForStats = [
    ...clubSanctions.map(s => ({ ...s, type: 'club' as const })),
    ...personalSanctions.map(s => ({ ...s, type: 'personal' as const }))
  ];
  
  const sportStats = allSanctionsForStats.reduce((acc, sanction) => {
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

  // Data for charts
  const sportsChartData = sortedSports.map(([sport, stats]) => ({
    deporte: sport,
    clubes: clubSanctions.filter(s => s.deporte === sport).length,
    personales: personalSanctions.filter(s => s.deporte === sport).length,
    activas: stats.active,
    vencidas: stats.expired,
    total: stats.total
  }));

  const pieChartData = [
    { name: 'Sanciones de Clubes', value: clubSanctions.length, color: '#3B82F6' },
    { name: 'Sanciones Personales', value: personalSanctions.length, color: '#F59E0B' }
  ];

  const statusChartData = [
    { name: 'Activas', value: activeSanctions.length, color: '#EF4444' },
    { name: 'Vencidas', value: expiredSanctions.length, color: '#10B981' }
  ];

  const COLORS = {
    blue: '#3B82F6',
    orange: '#F59E0B',
    red: '#EF4444',
    green: '#10B981',
    purple: '#8B5CF6',
    yellow: '#F59E0B'
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mb-8">
        <button 
          onClick={generateStatisticsReport}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-4 px-6 rounded-md transition-all duration-200 shadow-sm hover:shadow-md border border-red-800 flex items-center space-x-2"
          data-testid="button-stats-pdf"
        >
          <i className="fas fa-file-pdf"></i>
          <span>Reporte General PDF</span>
        </button>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="gov-stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="gov-text-small text-slate-600 font-medium">Total de Sanciones</p>
              <p className="text-3xl font-bold text-slate-800">{totalSanctions}</p>
              <p className="gov-text-small text-slate-500 mt-1">Registros activos</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-gavel text-blue-600 text-xl"></i>
            </div>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sports Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            <i className="fas fa-chart-bar mr-2 text-blue-600"></i>Sanciones por Deporte
          </h3>
          {sportsChartData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-bar text-4xl mb-4"></i>
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sportsChartData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="deporte" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clubes" fill={COLORS.blue} name="Clubes" />
                <Bar dataKey="personales" fill={COLORS.orange} name="Personales" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Type Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            <i className="fas fa-chart-pie mr-2 text-green-600"></i>Distribución por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status and Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            <i className="fas fa-chart-donut mr-2 text-red-600"></i>Estado de Sanciones
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Active vs Expired by Sport */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            <i className="fas fa-chart-area mr-2 text-purple-600"></i>Activas vs Vencidas por Deporte
          </h3>
          {sportsChartData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-area text-4xl mb-4"></i>
              <p>No hay datos disponibles</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sportsChartData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="deporte" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="activas" stackId="1" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.6} name="Activas" />
                <Area type="monotone" dataKey="vencidas" stackId="1" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.6} name="Vencidas" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Sports Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          <i className="fas fa-trophy mr-2 text-yellow-600"></i>Ranking de Deportes
        </h3>
        <div className="space-y-4">
          {sortedSports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-bar text-4xl mb-4"></i>
              <p>No hay datos de deportes disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ranking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deporte</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clubes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personales</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSports.map(([sport, stats], index) => (
                    <tr key={sport} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{sport}</td>
                      <td className="px-4 py-4 whitespace-nowrap font-bold text-lg text-gray-900">{stats.total}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-blue-600 font-medium">
                        {clubSanctions.filter(s => s.deporte === sport).length}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-orange-600 font-medium">
                        {personalSanctions.filter(s => s.deporte === sport).length}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-red-600 font-medium">{stats.active}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-green-600 font-medium">{stats.expired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
    </div>
  );
}