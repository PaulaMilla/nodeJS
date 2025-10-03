const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviews.controller');

// POST /reviews - Crear una nueva reseña
router.post('/', createReview);

module.exports = router;
