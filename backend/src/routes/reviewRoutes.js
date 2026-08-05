const express = require('express');
const { getAllReviews, deleteReview } = require('../controllers/reviewController');
const { createReview, getReviewByBooking } = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllReviews); // public
router.delete('/:id', authMiddleware, adminMiddleware, deleteReview);

module.exports = router;
