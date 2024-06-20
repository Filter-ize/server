const asyncHandler = require('express-async-handler');
const DocumentCart = require('../models/documentsCart.js');
const Employee = require('../models/employeeModel.js');

const addDocumentsToCart = asyncHandler(async (req, res) => {
    const { documentPairs } = req.body;

    let userCart = await DocumentCart.findOne({ user: req.user.id });
    if (!userCart) {
        // Si no se encuentra un carrito, crea uno nuevo
        userCart = new DocumentCart({ user: req.user.id });
    }

    for (let pair of documentPairs) {
        const employee = await Employee.findById(pair.employeeId);
        if (!employee) {
            res.status(404);
            throw new Error('Empleado no encontrado');
        }

        const document = employee.documents.id(pair.documentId);
        if (!document) {
            res.status(404);
            throw new Error('Documento no encontrado');
        }

        // Empuja un objeto que contiene el employeeId y el documentId
        userCart.documents.push({ employee: pair.employeeId, document: document._id });
    }

    await userCart.save();

    res.status(200).json(userCart);
});

const getAllCarts = asyncHandler(async (req, res) => {
    const carts = await DocumentCart.find({}).populate('user');
    console.log(carts)
    res.status(200).json(carts);
});

const updateCart = asyncHandler(async (req, res) => {
    const { documentPairs } = req.body;

    let userCart = await DocumentCart.findOne({ user: req.user.id });
    if (!userCart) {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }

    userCart.documents = []; // Limpiar los documentos existentes

    for (let pair of documentPairs) {
        const employee = await Employee.findById(pair.employeeId);
        if (!employee) {
            res.status(404);
            throw new Error('Empleado no encontrado');
        }

        const document = employee.documents.id(pair.documentId);
        if (!document) {
            res.status(404);
            throw new Error('Documento no encontrado');
        }

        // Empuja un objeto que contiene el employeeId y el documentId
        userCart.documents.push({ employee: pair.employeeId, document: document._id });
    }

    await userCart.save();

    res.status(200).json(userCart);
});

const getCartById = asyncHandler(async (req, res) => {
    const cart = await DocumentCart.findById(req.params.id).populate('user').populate('documents.document');
    if (cart) {
        res.json(cart);
    } else {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }
});
const deleteCart = asyncHandler(async (req, res) => {
    const cart = await DocumentCart.findById(req.params.id);
    if (cart) {
        await cart.remove();
        res.json({ message: 'Carrito eliminado' });
    } else {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }
});

module.exports = {
    addDocumentsToCart,
    getAllCarts,
    updateCart,
    getCartById,
    deleteCart
}