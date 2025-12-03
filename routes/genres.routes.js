// routes/genres.routes.js
const express = require('express');
const router = express.Router();
// Importamos el nuevo controlador
const genresController = require('../controllers/genres.controller');

// Ruta para crear un nuevo género (POST)
// Endpoint: POST http://localhost:3000/genres
router.post('/', genresController.createGenre);

// Ruta para eliminar un género por ID (DELETE)
// Endpoint: DELETE http://localhost:3000/genres/5
router.delete('/:id', genresController.deleteGenre);

module.exports = router;