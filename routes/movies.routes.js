const express = require('express');
const { createMovie } = require('../controllers/movies.controller');

const router = express.Router();


// POST /api/movies - Crear una serie/película
router.get('/', createMovie);

module.exports = router;