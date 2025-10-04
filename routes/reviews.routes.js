const express = require('express');
const router = express.Router();
const { createReview, updateReview, getAllReviews, getReviewById, deleteReview } = require('../controllers/reviews.controller');

// POST /reviews - Crear una nueva reseña
router.post('/', createReview);

// PUT: Actualizar una review por ID
router.put('/:id', updateReview);

// GET /reviews/:id - Get review por id
router.get('/:id', getReviewById);

// GET /reviews - Get todas las reviews
router.get('/', getAllReviews);

//DELETE /reviews/:id - Borrar una review por id
router.delete('/:id', deleteReview);
module.exports = router;
