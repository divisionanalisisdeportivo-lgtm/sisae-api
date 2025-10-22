
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'sanciones.json');

// Middleware
app.use(cors({
    origin: true,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Inicializar base de datos si no existe
async function initDB() {
    try {
        await fs.access(DB_FILE);
        console.log('✅ Base de datos existente encontrada.');
    } catch (error) {
        const initialData = {
            sanciones: [],
            metadata: {
                version: "1.0",
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            }
        };
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Base de datos inicializada');
    }
}

// Leer datos
async function readData() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return parsed;
    } catch (error) {
        console.error('Error leyendo datos:', error);
        return { 
            sanciones: [], 
            metadata: { 
                version: "1.0", 
                createdAt: new Date().toISOString(), 
                lastUpdated: new Date().toISOString() 
            } 
        };
    }
}

// Escribir datos
async function writeData(data) {
    try {
        data.metadata = data.metadata || {};
        data.metadata.lastUpdated = new Date().toISOString();
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Datos guardados correctamente');
        return true;
    } catch (error) {
        console.error('Error escribiendo datos:', error);
        throw error;
    }
}

// Whitelist de campos permitidos para evitar inyección de propiedades
function pickAllowedFields(body, allowedFields) {
    const filtered = {};
    for (const field of allowedFields) {
        if (field in body) {
            filtered[field] = body[field];
        }
    }
    return filtered;
}

// Rutas API
app.get('/api/ping', (req, res) => {
    res.json({
        message: 'SISAE Server Online',
        timestamp: new Date().toISOString(),
        port: PORT,
        host: '0.0.0.0'
    });
});

app.get('/api/sanciones', async (req, res) => {
    try {
        const data = await readData();
        const sanciones = Array.isArray(data.sanciones) ? data.sanciones : [];
        console.log(`📊 Sanciones consultadas: ${sanciones.length}`);
        res.json({ sanciones });
    } catch (error) {
        console.error('Error en GET /api/sanciones:', error);
        res.status(500).json({ error: 'Error al leer sanciones' });
    }
});

app.get('/api/personas', async (req, res) => {
    try {
        const data = await readData();
        const personas = Array.isArray(data.personas) ? data.personas : [];
        console.log(`📊 Personas consultadas: ${personas.length}`);
        res.json({ personas });
    } catch (error) {
        console.error('Error en GET /api/personas:', error);
        res.status(500).json({ error: 'Error al leer personas' });
    }
});

app.post('/api/sanciones', async (req, res) => {
    try {
        const data = await readData();
        const allowedFields = ['numeroCarga', 'nombreSancionado', 'deporte', 'ubicacion', 
                               'tipoSancion', 'motivoSancion', 'fechaInicio', 'fechaFin', 
                               'observaciones', 'actaPdf'];
        const nuevaSancion = {
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            ...pickAllowedFields(req.body, allowedFields),
            fechaCreacion: new Date().toISOString()
        };

        if (!Array.isArray(data.sanciones)) {
            data.sanciones = [];
        }
        
        data.sanciones.push(nuevaSancion);
        await writeData(data);

        console.log('✅ Nueva sanción agregada:', nuevaSancion.id);
        res.json(nuevaSancion);
    } catch (error) {
        console.error('Error en POST /api/sanciones:', error);
        res.status(500).json({ error: 'Error al crear sanción' });
    }
});

app.put('/api/sanciones/:id', async (req, res) => {
    try {
        const data = await readData();
        
        if (!Array.isArray(data.sanciones)) {
            return res.status(404).json({ error: 'Base de datos vacía' });
        }
        
        const index = data.sanciones.findIndex(s => s.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Sanción no encontrada' });
        }

        const allowedFields = ['numeroCarga', 'nombreSancionado', 'deporte', 'ubicacion', 
                               'tipoSancion', 'motivoSancion', 'fechaInicio', 'fechaFin', 
                               'observaciones', 'actaPdf'];
        data.sanciones[index] = {
            ...data.sanciones[index],
            ...pickAllowedFields(req.body, allowedFields),
            fechaModificacion: new Date().toISOString()
        };

        await writeData(data);
        console.log('✅ Sanción actualizada:', req.params.id);
        res.json(data.sanciones[index]);
    } catch (error) {
        console.error('Error en PUT /api/sanciones/:id:', error);
        res.status(500).json({ error: 'Error al actualizar sanción' });
    }
});

app.delete('/api/sanciones/:id', async (req, res) => {
    try {
        const data = await readData();
        
        if (!Array.isArray(data.sanciones)) {
            return res.status(404).json({ error: 'Base de datos vacía' });
        }
        
        const index = data.sanciones.findIndex(s => s.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Sanción no encontrada' });
        }

        data.sanciones.splice(index, 1);
        await writeData(data);

        console.log('✅ Sanción eliminada:', req.params.id);
        res.json({ message: 'Sanción eliminada correctamente' });
    } catch (error) {
        console.error('Error en DELETE /api/sanciones/:id:', error);
        res.status(500).json({ error: 'Error al eliminar sanción' });
    }
});

app.post('/api/personas', async (req, res) => {
    try {
        const data = await readData();
        const allowedFields = ['numeroCarga', 'nombrePersona', 'dniPersona', 'edadPersona', 
                               'deporte', 'ubicacion', 'motivoSancion', 'fechaInicio', 'fechaFin', 
                               'observaciones', 'actaPdf', 'reportadaEnPdf'];
        const nuevaPersona = {
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            ...pickAllowedFields(req.body, allowedFields),
            fechaCreacion: new Date().toISOString()
        };

        if (!Array.isArray(data.personas)) {
            data.personas = [];
        }
        
        data.personas.push(nuevaPersona);
        await writeData(data);

        console.log('✅ Nueva sanción personal agregada:', nuevaPersona.id);
        res.json(nuevaPersona);
    } catch (error) {
        console.error('Error en POST /api/personas:', error);
        res.status(500).json({ error: 'Error al crear sanción personal' });
    }
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
    });
});

// Inicializar y arrancar servidor
async function start() {
    try {
        await initDB();
        const data = await readData();
        const sancionesCount = Array.isArray(data.sanciones) ? data.sanciones.length : 0;
        console.log(`📊 Base de datos inicializada - Sanciones: ${sancionesCount}`);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor SISAE ejecutándose en puerto ${PORT}`);
            console.log('✅ Servidor listo y funcionando');
        });
    } catch (error) {
        console.error('Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor SISAE...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Cerrando servidor SISAE...');
    process.exit(0);
});

start().catch(console.error);
