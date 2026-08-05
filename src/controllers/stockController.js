const prisma = require('../db');

exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
};

exports.createStock = async (req, res) => {
  try {
    const { name, category, quantity, price } = req.body;
    const stock = await prisma.stock.create({
      data: { name, category, quantity, price }
    });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create stock' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, price } = req.body;
    const stock = await prisma.stock.update({
      where: { id },
      data: { name, category, quantity, price }
    });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.stock.delete({ where: { id } });
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stock' });
  }
};
