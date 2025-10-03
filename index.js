const express = require('express');
const { testConnection } = require('./config/database');
const moviesRoutes = require('./routes/movies.routes');

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear form data

// Rutas
app.use('/api/movies', moviesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API de Series y Películas funcionando! 🎬',
        endpoints: {
            'GET /api/movies': 'Obtener todas las series/películas',
            'GET /api/movies/:id': 'Obtener serie/película por ID',
            'PUT /api/movies': 'Crear o actualizar serie/película'
        }
    });
});

// Inicialización del servidor
app.listen(port, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    
    // Probar conexión a la base de datos
    await testConnection();
});

