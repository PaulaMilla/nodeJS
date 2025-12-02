const express = require('express');
const { testConnection } = require('./config/database');
const app = express();
const port = 3000;
// Probar conexión a la base de datos
//await testConnection();
const moviesRoutes = require('./routes/movies.routes')
const reviewRoutes = require('./routes/reviews.routes');
const usuarioRoutes = require('./routes/users.routes');
const directorsRoutes = require('./routes/directors.routes');
const actorsRoutes = require('./routes/actors.routes');

// Middleware
app.use(express.urlencoded({ extended: true })); // Para parsear form data
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API de Series, Películas y Directores funcionando! 🎬',
        endpoints: {
            movies: {
                'GET /api/movies': 'Obtener todas las series/películas',
                'GET /api/movies/:id': 'Obtener serie/película por ID',
                'PUT /api/movies': 'Crear o actualizar serie/película'
            },
            directors: {
                'GET /api/directors': 'Obtener todos los directores',
                'GET /api/directors/:id': 'Obtener director por ID',
                'PATCH /api/directors/:id': 'Actualizar datos específicos de un director',
                'GET /api/directors/:id/movies': 'Obtener películas/series de un director'
            }
        }
    });
});



//Rutas de movies
app.use('/movies', moviesRoutes);

//Rutas de reviews
app.use('/reviews', reviewRoutes);

//Ruta PATCH contraseña usuario
app.use('/usuarios', usuarioRoutes);

// Rutas
app.use('/directors', directorsRoutes);

// Rutas de actores
app.use('/actors', actorsRoutes);


//Inicialización del server
app.listen(port, ()=>{
    console.log(`Servidor arriba master 🚀 escuchando en http://localhost:${port}`);
});

