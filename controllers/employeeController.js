const asyncHandler = require('express-async-handler');
const Employee = require('../models/employeeModel');
const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dlsyupxsl',
    api_key: '662921365278215',
    api_secret: 'pzK--0Yt0QaaHJx6MNWO-Ga0Kyo'
});

//Create a new employee
const createEmployee = asyncHandler(async (req, res) => {
    const { name, email, profession, specialization, description } = req.body;

    //validation
    if (!name || !email || !profession || !specialization || !description) {
        res.status(400);
        throw new Error('Por favor llene todos los campos');
    }

    //Handle Image Upload
    let fileData = {};
    if (req.file) {
        //Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Filterize app',
                resource_type: 'image',
            });
        } catch (error) {
            res.status(500);
            throw new Error('Error al subir la imagendasd' + error);
        }

        fileData = {
            fileName: req.file.originalname,
            filepath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };
    }

    //Create employee
    const employee = await Employee.create({
        user: req.user._id,
        name,
        email,
        profession,
        specialization,
        description,
        image: fileData.filepath,
    });

    res.status(201).json(employee);
})


//Get all Employees
const getEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json(employees);
});

//Get single Employee
const getEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    //if employee is not found
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }
    res.status(200).json(employee);
});

//Delete Employee
const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    //if employee is not found
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }
    await employee.deleteOne();
    res.status(200).json({ message: 'Empleado eliminado' });
});

//Update Employee
const updateEmployee = asyncHandler(async (req, res) => {
    const { name, email, profession, specialization, description } = req.body;
    const { id } = req.params;

    const employee = await Employee.findById(id);

    //If employee doesn't exists
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    //Handle Image Upload
    let fileData = {};
    if (req.file) {
        //Save image to cloudinary
        let uploadFile;
        try {
            uploadFile = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Filterise app',
                resource_type: 'image',
            });
        } catch (error) {
            res.status(500);
            throw new Error('Error al subir la imagen');
        }

        fileData = {
            fileName: req.file.originalname,
            filepath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        }
    }

    //Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
        { _id: id },
        {
            name,
            email,
            profession,
            specialization,
            description,
            image: Object.keys(fileData).length === 0 ? employee?.image : fileData,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json(updatedEmployee);
});

//Add a document to an employee
const addDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, specialty, startDate, endDate } = req.body;
    const employee = await Employee.findById(id);

    // If employee doesn't exists
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    // Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    // Handle Document Upload
    let documentData = {
        title,
        specialty,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
    };

    if (req.file) {
        // Save document to cloudinary
        let uploadedDocument;
        try {
            uploadedDocument = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Filterize app',
                resource_type: 'image',
            });
            documentData.fileUrl = uploadedDocument.secure_url;
        } catch (error) {
            res.status(500);
            throw new Error('Error al subir el documento');
        }
    }

    // Add document to employee's documents
    employee.documents.push(documentData);
    await employee.save();
    res.status(201).json(employee);
});

//Update a document of an employee
const updateDocument = asyncHandler(async (req, res) => {
    const { employeeId, documentId } = req.params;
    const employee = await Employee.findById(employeeId);

    //If employee doesn't exists
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    //Find the document
    const document = employee.documents.id(documentId);
    if (!document) {
        res.status(404);
        throw new Error('Documento no encontrado');
    }

    //Handle Document Upload if a new file is provided
    let documentData = {};
    if (req.file) {
        //Save document to cloudinary
        let uploadedDocument;
        try {
            uploadedDocument = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Filterize app',
                resource_type: 'auto', // auto will allow for non-image files
            });
            documentData.fileUrl = uploadedDocument.secure_url;
        } catch (error) {
            res.status(500);
            throw new Error('Error al subir el documento');
        }
    }

     // Extract updated fields from req.body
     const { title, specialty, startDate, endDate } = req.body;
     if (title) documentData.title = title;
     if (specialty) documentData.specialty = specialty;
     if (startDate) documentData.startDate = new Date(startDate);
     if (endDate) documentData.endDate = new Date(endDate);

 //Update document fields
 document.set(documentData);
 await employee.save();

 res.status(200).json(employee);
});

//Delete a document of an employee
const deleteDocument = asyncHandler(async (req, res) => {
    const { employeeId, documentId } = req.params;
    const employee = await Employee.findById(employeeId);

    //If employee doesn't exists
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    //Find the document
    const document = employee.documents.id(documentId);
    if (!document) {
        res.status(404);
        throw new Error('Documento no encontrado');
    }

    //Delete document
    document.deleteOne();
    await employee.save();

    res.status(200).json({ message: 'Documento eliminado' });
});

//Get all documents of an employee
const getDocuments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    //If employee doesn't exists
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    //Return the documents
    res.status(200).json(employee.documents);
});

const getDocument = asyncHandler(async (req, res) => {
    const { employeeId, documentId } = req.params;
    const employee = await Employee.findById(employeeId);

    //If employee doesn't exists
    if (!employee) {
        res.status(404);
        throw new Error('Empleado no encontrado');
    }
    //Match employee to its user
    if (employee.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Usuario no autorizado');
    }

    //Find the document
    const document = employee.documents.id(documentId);
    if (!document) {
        res.status(404);
        throw new Error('Documento no encontrado');
    }

    //Return the document
    res.status(200).json(document);
});

module.exports = {
    createEmployee,
    getEmployees,
    getEmployee,
    deleteEmployee,
    updateEmployee,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    getDocument
};