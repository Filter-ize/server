const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware.js');
const {
    addDocumentsToCart,
    getAllCarts,
    getCartById,
    updateCart,
    deleteCart 
} = require('../controllers/documentCartController.js');

router.route('/').post(protect, addDocumentsToCart);
router.route('/').get(getAllCarts);
router.route('/:id').put(updateCart);
router.route('/:id').get(getCartById);
router.route('/:id').delete(deleteCart);

module.exports = router;