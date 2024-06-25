const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware.js');
const {
    createDocumentsCart,
    addDocumentsToCart,
    getAllCarts,
    getCartById,
    updateCart,
    deleteCart,
    removeDocumentFromCart 
} = require('../controllers/documentCartController.js');

router.route('/').post(protect, createDocumentsCart);
router.route('/').get(protect, getAllCarts); // Agregar middleware protect
router.route('/:id').put(protect, updateCart);
router.route('/:id').get(protect, getCartById); // Agregar middleware protect
router.route('/:id/add').put(protect, addDocumentsToCart);
router.route('/:id').delete(protect, deleteCart);
router.route('/:id/remove').put(protect, removeDocumentFromCart);

module.exports = router;