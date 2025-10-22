
// Variables globales
let sanciones = [];
let personas = [];
const API_BASE = window.location.origin;

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 SISAE iniciado - Nueva versión integrada');
    console.log('🌐 API Base:', API_BASE);
    
    inicializarEventos();
    await cargarDatos();
    actualizarInterfaz();
    inicializarStatus();
});

// Inicializar eventos
function inicializarEventos() {
    // Eventos de filtros
    const busqueda = document.getElementById('busqueda');
    const filtroDeporte = document.getElementById('filtroDeporte');
    const filtroEstado = document.getElementById('filtroEstado');
    const limpiarFiltros = document.getElementById('limpiarFiltrosBtn');

    if (busqueda) busqueda.addEventListener('input', filtrarYMostrarSanciones);
    if (filtroDeporte) filtroDeporte.addEventListener('change', filtrarYMostrarSanciones);
    if (filtroEstado) filtroEstado.addEventListener('change', filtrarYMostrarSanciones);
    if (limpiarFiltros) limpiarFiltros.addEventListener('click', limpiarFiltrosSanciones);

    // Eventos de botones principales
    const nuevaSancionBtn = document.getElementById('nuevaSancionBtn');
    const nuevaPersonaBtn = document.getElementById('nuevaPersonaBtn');
    const exportarPdfBtn = document.getElementById('exportarPdfBtn');

    if (nuevaSancionBtn) nuevaSancionBtn.addEventListener('click', () => abrirModalSancionClub());
    if (nuevaPersonaBtn) nuevaPersonaBtn.addEventListener('click', () => abrirModalSancionPersonal());
    if (exportarPdfBtn) exportarPdfBtn.addEventListener('click', () => exportarEstadisticas());

    // Eventos de modales
    configurarEventosModales();
    
    // Llenar opciones de deportes
    llenarOpcionesDeportes();
}

// Configurar eventos de modales
function configurarEventosModales() {
    // Modal Sanción Club
    const modalClub = document.getElementById('modalSancionClub');
    const cerrarModalClub = document.getElementById('cerrarModalClub');
    const cancelarClub = document.getElementById('cancelarSancionClub');
    const formClub = document.getElementById('formSancionClub');

    if (cerrarModalClub) cerrarModalClub.addEventListener('click', () => cerrarModal('modalSancionClub'));
    if (cancelarClub) cancelarClub.addEventListener('click', () => cerrarModal('modalSancionClub'));
    if (formClub) formClub.addEventListener('submit', guardarSancionClub);

    // Modal Sanción Personal
    const modalPersonal = document.getElementById('modalSancionPersonal');
    const cerrarModalPersonal = document.getElementById('cerrarModalPersonal');
    const cancelarPersonal = document.getElementById('cancelarSancionPersonal');
    const formPersonal = document.getElementById('formSancionPersonal');

    if (cerrarModalPersonal) cerrarModalPersonal.addEventListener('click', () => cerrarModal('modalSancionPersonal'));
    if (cancelarPersonal) cancelarPersonal.addEventListener('click', () => cerrarModal('modalSancionPersonal'));
    if (formPersonal) formPersonal.addEventListener('submit', guardarSancionPersonal);

    // Cerrar modal al hacer clic fuera
    if (modalClub) {
        modalClub.addEventListener('click', (e) => {
            if (e.target === modalClub) cerrarModal('modalSancionClub');
        });
    }
    
    if (modalPersonal) {
        modalPersonal.addEventListener('click', (e) => {
            if (e.target === modalPersonal) cerrarModal('modalSancionPersonal');
        });
    }
}

// Cargar datos del servidor
async function cargarDatos() {
    try {
        console.log('🔄 Cargando datos del servidor...');
        
        // Cargar sanciones
        try {
            const responseSanciones = await fetch(`${API_BASE}/api/sanciones`);
            if (responseSanciones.ok) {
                const data = await responseSanciones.json();
                sanciones = Array.isArray(data.sanciones) ? data.sanciones : [];
                console.log(`✅ Sanciones cargadas: ${sanciones.length}`);
            } else {
                console.error('Error al cargar sanciones:', responseSanciones.status);
                sanciones = [];
            }
        } catch (error) {
            console.error('Error en fetch sanciones:', error);
            sanciones = [];
        }

        // Cargar personas (Tribuna Segura)
        try {
            const responsePersonas = await fetch(`${API_BASE}/api/personas`);
            if (responsePersonas.ok) {
                const data = await responsePersonas.json();
                personas = Array.isArray(data.personas) ? data.personas : [];
                console.log(`✅ Personas cargadas: ${personas.length}`);
            } else {
                console.error('Error al cargar personas:', responsePersonas.status);
                personas = [];
            }
        } catch (error) {
            console.error('Error en fetch personas:', error);
            personas = [];
        }

        actualizarStatus('online');
    } catch (error) {
        console.error('Error general cargando datos:', error);
        sanciones = [];
        personas = [];
        actualizarStatus('offline');
    }
}

// Actualizar interfaz completa
function actualizarInterfaz() {
    actualizarContadores();
    filtrarYMostrarSanciones();
}

// Actualizar contadores del dashboard
function actualizarContadores() {
    const totalSanciones = sanciones.length;
    const totalPersonas = personas.length;
    const totalActivas = [...sanciones, ...personas].filter(item => calcularEstado(item) === 'activa').length;
    const totalVencidas = [...sanciones, ...personas].filter(item => calcularEstado(item) === 'vencida').length;

    // Actualizar elementos
    const elemTotalSanciones = document.getElementById('totalSanciones');
    const elemTotalPersonas = document.getElementById('totalPersonas');
    const elemTotalActivas = document.getElementById('totalActivas');
    const elemTotalVencidas = document.getElementById('totalVencidas');

    if (elemTotalSanciones) elemTotalSanciones.textContent = totalSanciones;
    if (elemTotalPersonas) elemTotalPersonas.textContent = totalPersonas;
    if (elemTotalActivas) elemTotalActivas.textContent = totalActivas;
    if (elemTotalVencidas) elemTotalVencidas.textContent = totalVencidas;
}

// Filtrar y mostrar sanciones
function filtrarYMostrarSanciones() {
    const busqueda = document.getElementById('busqueda')?.value.toLowerCase() || '';
    const filtroDeporte = document.getElementById('filtroDeporte')?.value || '';
    const filtroEstado = document.getElementById('filtroEstado')?.value || '';

    // Combinar sanciones y personas
    const todasLasSanciones = [
        ...sanciones.map(s => ({...s, tipo: 'club'})),
        ...personas.map(p => ({...p, tipo: 'personal', nombreSancionado: p.nombrePersona}))
    ];

    // Aplicar filtros
    let sancionesFiltradas = todasLasSanciones.filter(item => {
        const matchBusqueda = !busqueda || 
            item.nombreSancionado?.toLowerCase().includes(busqueda) ||
            item.deporte?.toLowerCase().includes(busqueda) ||
            item.ubicacion?.toLowerCase().includes(busqueda);
        
        const matchDeporte = !filtroDeporte || item.deporte === filtroDeporte;
        const matchEstado = !filtroEstado || calcularEstado(item) === filtroEstado;
        
        return matchBusqueda && matchDeporte && matchEstado;
    });

    mostrarListaCompleta(sancionesFiltradas);
    actualizarContadorResultados(sancionesFiltradas.length);
}

// Mostrar lista completa de sanciones
function mostrarListaCompleta(sanciones) {
    const container = document.getElementById('todasSancionesList');
    if (!container) return;

    if (sanciones.length === 0) {
        container.innerHTML = `
            <div class="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20 text-center">
                <div class="text-gray-500">
                    <i class="fas fa-clipboard-list text-5xl mb-4"></i>
                    <p class="text-xl font-medium mb-2">No hay sanciones que mostrar</p>
                    <p class="text-sm">Use los botones de arriba para agregar nuevas sanciones</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = sanciones.map(sancion => `
        <div class="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                        <h3 class="text-lg font-bold text-gray-800">${sancion.nombreSancionado}</h3>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${sancion.tipo === 'club' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                            ${sancion.tipo === 'club' ? 'Club' : 'Personal'}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p class="text-gray-600"><i class="fas fa-futbol mr-2 text-blue-500"></i><strong>Deporte:</strong> ${sancion.deporte}</p>
                            ${sancion.ubicacion ? `<p class="text-gray-600"><i class="fas fa-map-marker-alt mr-2 text-red-500"></i><strong>Ubicación:</strong> ${sancion.ubicacion}</p>` : ''}
                            ${sancion.dniPersona ? `<p class="text-gray-600"><i class="fas fa-id-card mr-2 text-green-500"></i><strong>DNI:</strong> ${sancion.dniPersona}</p>` : ''}
                        </div>
                        <div>
                            <p class="text-gray-600"><i class="fas fa-calendar mr-2 text-blue-500"></i><strong>Inicio:</strong> ${formatearFecha(sancion.fechaInicio)}</p>
                            <p class="text-gray-600"><i class="fas fa-calendar-check mr-2 text-green-500"></i><strong>Fin:</strong> ${formatearFecha(sancion.fechaFin)}</p>
                        </div>
                        <div>
                            ${sancion.tipoSancion ? `<p class="text-gray-600"><i class="fas fa-gavel mr-2 text-orange-500"></i><strong>Tipo:</strong> ${sancion.tipoSancion}</p>` : ''}
                            ${sancion.edadPersona ? `<p class="text-gray-600"><i class="fas fa-birthday-cake mr-2 text-pink-500"></i><strong>Edad:</strong> ${sancion.edadPersona}</p>` : ''}
                            <p class="text-gray-600"><i class="fas fa-clock mr-2 text-gray-500"></i><strong>Días restantes:</strong> ${calcularDiasRestantes(sancion)}</p>
                        </div>
                    </div>
                    
                    ${sancion.observaciones ? `
                        <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-700"><i class="fas fa-sticky-note mr-2"></i>${sancion.observaciones}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="ml-4 flex flex-col items-end gap-2">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${calcularEstado(sancion) === 'activa' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${calcularEstado(sancion) === 'activa' ? 'Activa' : 'Vencida'}
                    </span>
                    <div class="flex gap-2">
                        <button onclick="editarSancion('${sancion.id}', '${sancion.tipo}')" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarSancion('${sancion.id}', '${sancion.tipo}')" class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Funciones de modales
function abrirModalSancionClub() {
    const modal = document.getElementById('modalSancionClub');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function abrirModalSancionPersonal() {
    const modal = document.getElementById('modalSancionPersonal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        // Limpiar formulario
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Guardar sanción de club
async function guardarSancionClub(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const sancionData = {
        nombreSancionado: formData.get('nombreSancionado'),
        deporte: formData.get('deporte'),
        ubicacion: formData.get('ubicacion'),
        tipoSancion: formData.get('tipoSancion'),
        fechaInicio: formData.get('fechaInicio'),
        fechaFin: formData.get('fechaFin'),
        observaciones: formData.get('observaciones') || ''
    };

    try {
        const response = await fetch(`${API_BASE}/api/sanciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sancionData)
        });

        if (response.ok) {
            console.log('✅ Sanción de club guardada');
            cerrarModal('modalSancionClub');
            await cargarDatos();
            actualizarInterfaz();
            mostrarNotificacion('Sanción de club guardada exitosamente', 'success');
        } else {
            throw new Error('Error al guardar sanción');
        }
    } catch (error) {
        console.error('Error guardando sanción:', error);
        mostrarNotificacion('Error al guardar la sanción', 'error');
    }
}

// Guardar sanción personal
async function guardarSancionPersonal(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const personaData = {
        nombrePersona: formData.get('nombrePersona'),
        dniPersona: formData.get('dniPersona') || '',
        edadPersona: formData.get('edadPersona') || '',
        deporte: formData.get('deporte'),
        fechaInicio: formData.get('fechaInicio'),
        fechaFin: formData.get('fechaFin'),
        observaciones: formData.get('observaciones') || ''
    };

    try {
        const response = await fetch(`${API_BASE}/api/personas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(personaData)
        });

        if (response.ok) {
            console.log('✅ Sanción personal guardada');
            cerrarModal('modalSancionPersonal');
            await cargarDatos();
            actualizarInterfaz();
            mostrarNotificacion('Sanción personal guardada exitosamente', 'success');
        } else {
            throw new Error('Error al guardar sanción personal');
        }
    } catch (error) {
        console.error('Error guardando sanción personal:', error);
        mostrarNotificacion('Error al guardar la sanción personal', 'error');
    }
}

// Funciones auxiliares
function calcularEstado(item) {
    const hoy = new Date();
    const fechaFin = new Date(item.fechaFin);
    return fechaFin >= hoy ? 'activa' : 'vencida';
}

function calcularDiasRestantes(item) {
    const hoy = new Date();
    const fechaFin = new Date(item.fechaFin);
    const diferencia = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
    return diferencia > 0 ? diferencia : 0;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-AR');
}

function llenarOpcionesDeportes() {
    const selectDeporte = document.getElementById('filtroDeporte');
    if (!selectDeporte) return;

    const deportes = [
        'Fútbol', 'Básquetbol', 'Voleibol', 'Tenis', 'Atletismo', 'Natación',
        'Rugby', 'Hockey', 'Handball', 'Golf', 'Pádel', 'Boxeo', 'Karate',
        'Taekwondo', 'Judo', 'Ciclismo', 'Gimnasia'
    ];

    deportes.forEach(deporte => {
        const option = document.createElement('option');
        option.value = deporte;
        option.textContent = deporte;
        selectDeporte.appendChild(option);
    });
}

function limpiarFiltrosSanciones() {
    const busqueda = document.getElementById('busqueda');
    const filtroDeporte = document.getElementById('filtroDeporte');
    const filtroEstado = document.getElementById('filtroEstado');
    
    if (busqueda) busqueda.value = '';
    if (filtroDeporte) filtroDeporte.value = '';
    if (filtroEstado) filtroEstado.value = '';
    
    filtrarYMostrarSanciones();
}

function actualizarContadorResultados(cantidad) {
    const contador = document.getElementById('contadorResultados');
    if (contador) {
        contador.textContent = `${cantidad} resultado${cantidad !== 1 ? 's' : ''}`;
    }
}

function inicializarStatus() {
    actualizarStatus('online');
}

function actualizarStatus(estado) {
    const statusElement = document.getElementById('status');
    const statusText = statusElement?.querySelector('.status-text');
    
    if (!statusElement) return;

    if (estado === 'online') {
        statusElement.className = 'hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30';
    } else {
        statusElement.className = 'hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-400/30';
    }
    
    if (statusText) {
        statusText.textContent = estado === 'online' ? 'Conectado' : 'Sin conexión';
        statusText.className = estado === 'online' ? 'status-text text-green-100 text-sm font-medium' : 'status-text text-red-100 text-sm font-medium';
    }
    
    statusElement.classList.remove('hidden');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    if (tipo === 'success') {
        notif.classList.add('bg-green-600');
    } else if (tipo === 'error') {
        notif.classList.add('bg-red-600');
    } else {
        notif.classList.add('bg-blue-600');
    }
    
    // Safe DOM construction to prevent XSS
    const container = document.createElement('div');
    container.className = 'flex items-center gap-2';
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${tipo === 'success' ? 'check' : tipo === 'error' ? 'exclamation-triangle' : 'info'}-circle`;
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = mensaje; // Safe: textContent auto-escapes
    
    container.appendChild(icon);
    container.appendChild(messageSpan);
    notif.appendChild(container);
    
    document.body.appendChild(notif);
    
    // Animar entrada
    setTimeout(() => {
        notif.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notif.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notif);
        }, 300);
    }, 3000);
}

// Funciones placeholder
function editarSancion(id, tipo) {
    mostrarNotificacion('Función de edición en desarrollo', 'info');
}

function eliminarSancion(id, tipo) {
    if (confirm('¿Está seguro de que desea eliminar esta sanción?')) {
        mostrarNotificacion('Función de eliminación en desarrollo', 'info');
    }
}

function exportarEstadisticas() {
    mostrarNotificacion('Exportación PDF en desarrollo', 'info');
}
