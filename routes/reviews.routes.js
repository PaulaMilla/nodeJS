const express = require('express');
const router = express.Router();
const { createReview, updateReview } = require('../controllers/reviews.controller');

// POST /reviews - Crear una nueva reseña
router.post('/', createReview);

// PUT: Actualizar una review por ID
router.put('/:id', updateReview);

module.exports = router;
