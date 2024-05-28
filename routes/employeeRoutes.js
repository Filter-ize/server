const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware.js');
const {
    createEmployee, 
    getEmployees, 
    getEmployee, 
    deleteEmployee, 
    updateEmployee
} = require('../controllers/employeeController.js');
const { upload } = require('../utils/fileUpload.js');

router.post('/', protect, upload.single('image'), createEmployee);
router.patch('/:id', protect, upload.single('image'), updateEmployee);
router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployee);
router.delete('/:id', protect, deleteEmployee);

module.exports = router;