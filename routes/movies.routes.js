const express = require('express');
const { createOrUpdateMovie, getAllMovies, getMovieById } = require('../controllers/movies.controller');

const router = express.Router();

// PUT /api/movies - Crear o actualizar serie/película
router.put('/', createOrUpdateMovie);

// GET /api/movies - Obtener todas las series/películas
router.get('/', getAllMovies);

// GET /api/movies/:id - Obtener serie/película por ID
router.get('/:id', getMovieById);

module.exports = router;