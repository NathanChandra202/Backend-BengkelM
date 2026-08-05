const express = require('express');
const { getAllStocks, createStock, updateStock, deleteStock } = require('../controllers/stockController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllStocks);
router.post('/', authMiddleware, adminMiddleware, createStock);
router.put('/:id', authMiddleware, adminMiddleware, updateStock);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStock);

module.exports = router;
