const express = require('express');
const { getStoreInfo, updateStoreInfo } = require('../controllers/storeController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getStoreInfo);
router.put('/', authMiddleware, adminMiddleware, updateStoreInfo);

module.exports = router;
