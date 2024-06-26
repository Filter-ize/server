const path = require('path');
const asyncHandler = require('express-async-handler');
const DocumentCart = require('../models/documentsCart.js');
const Employee = require('../models/employeeModel.js');
const fs = require('fs');
const archiver = require('archiver');

const createDocumentsCart = asyncHandler(async (req, res) => {
    const { title, location, type, duration, documentPairs } = req.body;

    let userCart = new DocumentCart({
        user: req.user.id,
        title,
        location,
        type,
        duration,
        reached: 0
    });

    if (documentPairs) {
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

            userCart.documents.push({
                employee: pair.employeeId,
                employeeName: employee.name, // Asegúrate de que 'name' es el campo correcto
                document: document._id,
                documentTitle: document.title, // Asegúrate de que 'title' es el campo correcto
                documentFile: document.file, // Asegúrate de que 'fileUrl' es el campo correcto
                documentTotalTime: document.totalTime, // Asegúrate de que 'totalTime' es el campo correcto
            });
        }
    }

    await userCart.save();

    res.status(201).json(userCart);
});

const addDocumentsToCart = asyncHandler(async (req, res) => {
    const { employeeId, documentId } = req.body;

    let userCart = await DocumentCart.findById(req.params.id);

    // Verificar si el usuario autenticado es el propietario del carrito
    if (userCart.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('No autorizado');
    }

    if (!userCart) {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }

    const document = employee.documents.id(documentId);
    if (!document) {
        res.status(404);
        throw new Error('Documento no encontrado');
    }

    userCart.documents.push({
        employee: employeeId,
        employeeName: employee.name,
        document: document._id,
        documentTitle: document.title,
        documentFile: document.file,
        documentTotalTime: document.totalTime,
    });

    await userCart.save();

    res.status(200).json(userCart);
});

const removeDocumentFromCart = asyncHandler(async (req, res) => {
    const { employeeId, documentId } = req.body;

    let userCart = await DocumentCart.findById(req.params.id);

    if (!userCart) {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }    

    // Verificar si el usuario autenticado es el propietario del carrito
    if (userCart.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('No autorizado');
    }

    const index = userCart.documents.findIndex(doc => doc.employee.toString() === employeeId && doc.document.toString() === documentId);

    if (index === -1) {
        res.status(404);
        throw new Error('Documento no encontrado en el carrito');
    }

    userCart.documents.splice(index, 1);

    await userCart.save();

    res.status(200).json(userCart);
});

const updateCart = asyncHandler(async (req, res) => {
    const { title, location, type, duration, documentPairs } = req.body;

    let userCart = await DocumentCart.findById(req.params.id);

    // Verificar si el usuario autenticado es el propietario del carrito
    if (userCart.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('No autorizado');
    }

    if (!userCart) {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }

    if (title) userCart.title = title;
    if (location) userCart.location = location;
    if (type) userCart.type = type;
    if (duration) userCart.duration = duration;

    if (documentPairs) {
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

            userCart.documents.push({
                employee: pair.employeeId,
                employeeName: employee.name, // Asegúrate de que 'name' es el campo correcto
                document: document._id,
                documentTitle: document.title, // Asegúrate de que 'title' es el campo correcto
                documentFile: document.file, // Asegúrate de que 'fileUrl' es el campo correcto
                documentTotalTime: document.totalTime, // Asegúrate de que 'totalTime' es el campo correcto
            });
        }
    }

    await userCart.save();

    res.status(200).json(userCart);
});

const getAllCarts = asyncHandler(async (req, res) => {
    // Obtener solo los carritos del usuario autenticado
    const carts = await DocumentCart.find({ user: req.user.id }).populate('user');
    res.status(200).json(carts);
});


const getCartById = asyncHandler(async (req, res) => {
    const cart = await DocumentCart.findById(req.params.id).populate('user').populate('documents.document');
    if (cart) {
        // Verificar si el usuario autenticado es el propietario del carrito
        if (cart.user.toString() !== req.user.id) {
            res.status(403);
            throw new Error('No autorizado');
        }

        res.json(cart);
    } else {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }
});

const deleteCart = asyncHandler(async (req, res) => {
    const cart = await DocumentCart.findById(req.params.id);
    if (cart) {
        // Verificar si el usuario autenticado es el propietario del carrito
        if (cart.user.toString() !== req.user.id) {
            res.status(403);
            throw new Error('No autorizado');
        }

        await cart.deleteOne();
        res.json({ message: 'Carrito eliminado' });
    } else {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }
});

const downloadCartDocuments = asyncHandler(async (req, res) => {
    const cart = await DocumentCart.findById(req.params.id);
    if (cart) {
        // Verificar si el usuario autenticado es el propietario del carrito
        if (cart.user.toString() !== req.user.id) {
            res.status(403);
            throw new Error('No autorizado');
        }

        // Crear un archivo zip
        const archive = archiver('zip', {
            zlib: { level: 9 } // Nivel de compresión
        });

        // Enviar el archivo zip como respuesta
        res.attachment('documents.zip');
        archive.pipe(res);

        // Agregar todos los documentos al archivo zip
        for (let doc of cart.documents) {
            archive.append(doc.documentFile, { name: `${doc.documentTitle}.pdf` });
        }

        // Finalizar el archivo zip
        archive.finalize();
    } else {
        res.status(404);
        throw new Error('Carrito no encontrado');
    }
});

module.exports = {
    createDocumentsCart,
    addDocumentsToCart,
    getAllCarts,
    getCartById,
    updateCart,
    deleteCart,
    removeDocumentFromCart,
    downloadCartDocuments
}