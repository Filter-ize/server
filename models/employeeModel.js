const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Por favor agregue un nombre'],
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    profession: {
        type: String,
        required: [true, 'Por favor agregue una profesión'],
        trim: true,
    },
    specialization: {
        type: String,
        required: [true, 'Por favor agregue una especialidad'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Por favor agregue una descripción'],
        default: '',
        trim: true,
    },
    image: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;