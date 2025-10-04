const express = require('express');
const app = express();
const reviewRoutes = require('./routes/reviews.routes');
const usuarioRoutes = require('./routes/users.routes');
//Puerto de escucha
const port = 3000;

//middleware para parsear JSON
app.use(express.json());

//Ruta PUT Review by ID
app.use('/reviews', reviewRoutes);
//Ruta PATCH contraseña usuario
app.use('/usuarios', usuarioRoutes);
//Ruta POST registrar usuario


//Inicialización del server
app.listen(port, ()=>{
    console.log(`Servidor arriba master 🚀 escuchando en htttp://localhost:${port}`);
});

