const prisma = require('../db');

// GET /store — ambil info toko
exports.getStoreInfo = async (req, res) => {
  try {
    let store = await prisma.storeInfo.findUnique({ where: { id: 'main' } });
    if (!store) {
      store = await prisma.storeInfo.create({
        data: {
          id: 'main',
          name: 'Bengkel Mouse',
          address: '',
          phone: '',
          whatsapp: '',
          receiverName: '',
        },
      });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil info toko' });
  }
};

// PUT /store — update info toko (admin)
exports.updateStoreInfo = async (req, res) => {
  try {
    const { name, address, phone, whatsapp, receiverName } = req.body;
    const store = await prisma.storeInfo.upsert({
      where: { id: 'main' },
      update: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(receiverName !== undefined && { receiverName }),
      },
      create: {
        id: 'main',
        name: name || 'Bengkel Mouse',
        address: address || '',
        phone: phone || '',
        whatsapp: whatsapp || '',
        receiverName: receiverName || '',
      },
    });
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Gagal update info toko' });
  }
};
