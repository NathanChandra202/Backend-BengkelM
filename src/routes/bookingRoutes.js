const express = require('express');
const { 
  createBooking, 
  getAllBookings, 
  getUserBookings, 
  getBookingById, 
  updateBookingStatus,
  setBookingAmount,
  uploadPaymentProof, 
  uploadMiddleware,
  createPublicReservation,
  getPublicBookingById
} = require('../controllers/bookingController');
const {
  getBookingParts,
  addBookingPart,
  removeBookingPart,
} = require('../controllers/bookingPartController');
const {
  createReview,
  getReviewByBooking,
} = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes for website reservations & tracking
router.post('/public', createPublicReservation);
router.get('/public/:id', getPublicBookingById);

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, adminMiddleware, getAllBookings);
router.get('/my', authMiddleware, getUserBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/status', authMiddleware, adminMiddleware, updateBookingStatus);
router.put('/:id/amount', authMiddleware, adminMiddleware, setBookingAmount);
router.post('/:id/payment', authMiddleware, uploadMiddleware, uploadPaymentProof);

// Sparepart routes
router.get('/:id/parts', authMiddleware, adminMiddleware, getBookingParts);
router.post('/:id/parts', authMiddleware, adminMiddleware, addBookingPart);
router.delete('/:id/parts/:partId', authMiddleware, adminMiddleware, removeBookingPart);

// Review routes
router.post('/:id/review', authMiddleware, createReview);
router.get('/:id/review', authMiddleware, getReviewByBooking);

module.exports = router;
