const express = require('express');
const { 
    updateDirector, 
    getAllDirectors, 
    getDirectorById, 
    getDirectorMovies 
} = require('../controllers/directors.controller');

const router = express.Router();

// PATCH /api/directors/:id - Actualizar datos específicos de un director
router.patch('/:id', updateDirector);

// GET /api/directors - Obtener todos los directores
router.get('/', getAllDirectors);

// GET /api/directors/:id - Obtener director por ID
router.get('/:id', getDirectorById);

// GET /api/directors/:id/movies - Obtener películas/series de un director
router.get('/:id/movies', getDirectorMovies);

module.exports = router;