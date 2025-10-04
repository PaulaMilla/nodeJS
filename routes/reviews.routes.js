const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews.controller');

// PUT: Actualizar una review por ID
router.put('/:id', reviewController.updateReview);

module.exports = router;