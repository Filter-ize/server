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

module.exports = {
    createEmployee,
    getEmployees,
    getEmployee,
    deleteEmployee,
    updateEmployee
};