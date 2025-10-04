const express = require('express');
const { createOrUpdateMovie, getAllMovies, getMovieById, getMovies, deleteMovie } = require('../controllers/movies.controller');

const router = express.Router();

// PUT /api/movies - Crear o actualizar serie/película
router.put('/', createOrUpdateMovie);

// GET /api/movies - Obtener todas las series/películas
router.get('/', getAllMovies);

// GET /api/movies/:id - Obtener serie/película por ID
router.get('/:id', getMovieById);

// GET /movies - Obtener todas las series y películas
router.get('/', getMovies);

// DELETE /movies/:id - Eliminar una serie/película por ID
router.delete('/:id', deleteMovie);

module.exports = router;
