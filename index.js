const express = require('express');
const app = express();
const reviewRoutes = require('./routes/reviews.routes');
//Puerto de escucha
const port = 3000;

//middleware para parsear JSON
app.use(express.json());

//Ruta PUT Review by ID
app.use('/reviews', reviewRoutes);

//Inicialización del server
app.listen(port, ()=>{
    console.log(`Servidor arriba master 🚀 escuchando en htttp://localhost:${port}`);
});

