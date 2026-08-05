const prisma = require('../db');

// POST /bookings/:id/review — buat ulasan
exports.createReview = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating harus antara 1-5' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking tidak ditemukan' });
    if (booking.userId !== userId) return res.status(403).json({ error: 'Akses ditolak' });
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Ulasan hanya bisa diberikan untuk pesanan yang sudah selesai' });
    }

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) return res.status(400).json({ error: 'Ulasan sudah ada untuk pesanan ini' });

    const review = await prisma.review.create({
      data: { bookingId, userId, rating: parseInt(rating), comment },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat ulasan', details: error.message });
  }
};

// GET /reviews — semua ulasan (public)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, avatarUrl: true } },
        booking: { select: { mouseName: true, issue: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil ulasan' });
  }
};

// GET /bookings/:id/review — ulasan per booking
exports.getReviewByBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const review = await prisma.review.findUnique({
      where: { bookingId },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });
    if (!review) return res.status(404).json({ error: 'Ulasan tidak ditemukan' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil ulasan' });
  }
};

// DELETE /reviews/:id — hapus ulasan (admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Ulasan dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus ulasan' });
  }
};
