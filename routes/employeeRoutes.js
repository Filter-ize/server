const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware.js');
const {
    createEmployee,
    getEmployees,
    getEmployee,
    deleteEmployee,
    updateEmployee,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    getDocument,
    downloadDocument
} = require('../controllers/employeeController.js');
const { upload } = require('../utils/fileUpload.js');

// Configuración de multer para cargar archivos en memoria
const multer = require('multer');
const uploadPdf = multer({ storage: multer.memoryStorage() });

router.post('/', protect, upload.single('image'), createEmployee);
router.patch('/:id', protect, upload.single('image'), updateEmployee);
router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployee);
router.delete('/:id', protect, deleteEmployee);
// Manejo de documentos
router.route('/:id/documents').post(protect, uploadPdf.single('file'), addDocument);
router.route('/:employeeId/documents/:documentId').put(protect, uploadPdf.single('file'), updateDocument);
router.route('/:employeeId/documents/:documentId').delete(protect, deleteDocument);
router.route('/:id/documents').get(protect, getDocuments);
router.route('/:employeeId/documents/:documentId').get(protect, getDocument);
router.get('/:employeeId/documents/:documentId/download', protect, downloadDocument);

module.exports = router;