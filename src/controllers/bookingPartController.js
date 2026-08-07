const prisma = require('../db');

// GET /bookings/:id/parts — list semua sparepart di booking ini
exports.getBookingParts = async (req, res) => {
  try {
    const { id } = req.params;
    const parts = await prisma.bookingPart.findMany({
      where: { bookingId: id },
      include: { stock: { select: { id: true, name: true, category: true, price: true, quantity: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data sparepart' });
  }
};

// POST /bookings/:id/parts — tambah sparepart ke booking
exports.addBookingPart = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'stockId dan quantity wajib diisi' });
    }

    // Cek booking ada
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking tidak ditemukan' });

    // Lock sparepart setelah TESTING selesai (WAITING_SETTLEMENT ke atas)
    const lockedStatuses = ['WAITING_SETTLEMENT', 'SETTLEMENT_REVIEW', 'COMPLETED'];
    if (lockedStatuses.includes(booking.status)) {
      return res.status(400).json({ error: 'Sparepart tidak bisa ditambahkan setelah Testing & QC selesai' });
    }

    // Cek stok tersedia
    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) return res.status(404).json({ error: 'Stok tidak ditemukan' });
    if (stock.quantity < quantity) {
      return res.status(400).json({ error: `Stok tidak cukup. Tersedia: ${stock.quantity}` });
    }

    // Cek apakah sparepart ini sudah ada di booking (update quantity)
    const existing = await prisma.bookingPart.findFirst({
      where: { bookingId, stockId },
    });

    let part;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (stock.quantity < quantity) {
        return res.status(400).json({ error: `Stok tidak cukup. Tersedia: ${stock.quantity}` });
      }
      part = await prisma.bookingPart.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { stock: true },
      });
    } else {
      part = await prisma.bookingPart.create({
        data: {
          bookingId,
          stockId,
          quantity,
          priceEach: stock.price,
        },
        include: { stock: true },
      });
    }

    // Kurangi stok
    await prisma.stock.update({
      where: { id: stockId },
      data: { quantity: { decrement: quantity } },
    });

    // Rekalkukasi totalAmount dari semua parts
    const allParts = await prisma.bookingPart.findMany({ where: { bookingId } });
    const partsTotal = allParts.reduce((sum, p) => sum + p.priceEach * p.quantity, 0);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { totalAmount: partsTotal },
    });

    res.status(201).json(part);
  } catch (error) {
    console.error('Error adding booking part:', error);
    res.status(500).json({ error: 'Gagal menambahkan sparepart', details: error.message });
  }
};

// DELETE /bookings/:id/parts/:partId — hapus sparepart dari booking
exports.removeBookingPart = async (req, res) => {
  try {
    const { id: bookingId, partId } = req.params;

    const part = await prisma.bookingPart.findUnique({
      where: { id: partId },
      include: { stock: true },
    });

    if (!part || part.bookingId !== bookingId) {
      return res.status(404).json({ error: 'Sparepart tidak ditemukan' });
    }

    // Kembalikan stok
    await prisma.stock.update({
      where: { id: part.stockId },
      data: { quantity: { increment: part.quantity } },
    });

    await prisma.bookingPart.delete({ where: { id: partId } });

    // Rekalkukasi totalAmount
    const allParts = await prisma.bookingPart.findMany({ where: { bookingId } });
    const partsTotal = allParts.reduce((sum, p) => sum + p.priceEach * p.quantity, 0);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { totalAmount: partsTotal > 0 ? partsTotal : null },
    });

    res.json({ message: 'Sparepart dihapus dan stok dikembalikan' });
  } catch (error) {
    console.error('Error removing booking part:', error);
    res.status(500).json({ error: 'Gagal menghapus sparepart' });
  }
};
