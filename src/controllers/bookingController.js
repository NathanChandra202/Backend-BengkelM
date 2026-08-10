const prisma = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('paymentProof');

exports.createBooking = async (req, res) => {
  try {
    const { mouseName, issue, details } = req.body;
    const userId = req.user.userId;

    if (!mouseName || !issue) {
      return res.status(400).json({ error: 'mouseName and issue are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        mouseName,
        issue,
        details: details || '',
        status: 'PENDING',
        paymentStatus: 'UNPAID'
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: { select: { name: true, email: true, phone: true, address: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, address: true } },
        parts: {
          include: { stock: { select: { id: true, name: true, category: true } } },
          orderBy: { createdAt: 'asc' },
        },
      }
    });
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Users can only view their own bookings, admins can view any
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validTransitions = {
      'PENDING':             ['CHECKING'],
      'CHECKING':            ['WAITING_DP'],
      'WAITING_DP':          ['DP_REVIEW'],
      'DP_REVIEW':           ['IN_PROGRESS'],
      'IN_PROGRESS':         ['TESTING'],
      'TESTING':             ['WAITING_SETTLEMENT'],
      'WAITING_SETTLEMENT':  ['SETTLEMENT_REVIEW'],
      'SETTLEMENT_REVIEW':   ['COMPLETED'],
      'COMPLETED':           [],
    };

    const current = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
    if (!current) return res.status(404).json({ error: 'Booking not found' });

    const allowed = validTransitions[current.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Tidak bisa pindah dari ${current.status} ke ${status}` });
    }

    const booking = await prisma.booking.update({ where: { id }, data: { status } });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

exports.setBookingAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount } = req.body;

    const current = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
    if (!current) return res.status(404).json({ error: 'Booking not found' });

    // Generate unique 3-digit code (001–999)
    const uniqueCode = Math.floor(Math.random() * 999) + 1;

    // Determine which payment step to advance to
    let nextStatus;
    if (current.status === 'CHECKING') {
      nextStatus = 'WAITING_DP';
    } else if (current.status === 'TESTING') {
      nextStatus = 'WAITING_SETTLEMENT';
    } else {
      return res.status(400).json({ error: `Tidak bisa set harga di status ${current.status}. Harus di status CHECKING (untuk DP) atau TESTING (untuk pelunasan).` });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        totalAmount: parseFloat(totalAmount),
        uniqueCode,
        status: nextStatus,
      }
    });
    res.json(booking);
  } catch (error) {
    console.error("Error setting booking amount:", error);
    res.status(500).json({ error: 'Failed to set booking amount: ' + error.message });
  }
};

exports.uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const current = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
    if (!current) return res.status(404).json({ error: 'Booking not found' });

    const paymentProofUrl = `/uploads/${req.file.filename}`;

    // Determine which review state to advance to
    let nextStatus;
    let updateData;
    if (current.status === 'WAITING_DP') {
      nextStatus = 'DP_REVIEW';
      updateData = {
        paymentProofUrl,
        paymentStatus: 'PAID',
        status: nextStatus,
      };
    } else if (current.status === 'WAITING_SETTLEMENT') {
      nextStatus = 'SETTLEMENT_REVIEW';
      updateData = {
        settlementProofUrl: paymentProofUrl,
        status: nextStatus,
      };
    } else {
      return res.status(400).json({ error: 'Booking tidak dalam status menunggu pembayaran' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Payment proof uploaded', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload payment proof', details: error.message });
  }
};
