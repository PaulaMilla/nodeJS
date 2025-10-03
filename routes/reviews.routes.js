const express = require('express');
const router = express.Router();
const { getAllReviews, deleteReview} = require('../controllers/reviews.controller');

// GET all reviews
router.get('/', getAllReviews);

//DELETE review
router.delete('/:id', deleteReview);


module.exports = router;