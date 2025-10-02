const express = require('express');
const app = express();
//Puerto de escucha
const port = 3000;

//Inicialización del server
app.listen(port, ()=>{
    console.log(`Servidor arriba master 🚀 escuchando en htttp://localhost:${port}`);
});

