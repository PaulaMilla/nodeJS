const express = require('express');
const router = express.Router();
const { getMovies, deleteMovie } = require('../controllers/movies.controller');

// GET /movies - Obtener todas las series y películas
router.get('/', getMovies);

// DELETE /movies/:id - Eliminar una serie/película por ID
router.delete('/:id', deleteMovie);

module.exports = router;
