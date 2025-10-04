const express = require('express');
const { createOrUpdateMovie, getMovieById, getMovies, deleteMovie } = require('../controllers/movies.controller');

const router = express.Router();

// PUT /api/movies - Crear o actualizar serie/película
router.put('/', createOrUpdateMovie);

// GET /api/movies - Obtener todas las series/películas
router.get('/', getMovies);

// GET /api/movies/:id - Obtener serie/película por ID
router.get('/:id', getMovieById);

// DELETE /movies/:id - Eliminar una serie/película por ID
router.delete('/:id', deleteMovie);

module.exports = router;
