const express = require('express');
const app = express();
const moviesRoutes = require('./routes/movies.routes')
const reviewRoutes = require('./routes/reviews.routes');
//Puerto de escucha
const port = 3000;

//middleware para parsear JSON
app.use(express.json());

//Rutas de movies
app.use('/movies', moviesRoutes);

//Rutas de reviews
app.use('/reviews', reviewRoutes);


//Inicialización del server
app.listen(port, ()=>{
    console.log(`Servidor arriba master 🚀 escuchando en http://localhost:${port}`);
});

