const mongoose = require('mongoose');
const { format } = require('date-fns');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    specialty: {
        type: String,
        required: true,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: false,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
}, {
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true }
});

documentSchema.virtual('totalTime').get(function() {
    if (this.startDate && this.endDate) {
        const diff = this.endDate.getTime() - this.startDate.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)); // difference in days rounded up
    }
    return null;
});

documentSchema.virtual('formattedStartDate').get(function() {
    return this.startDate ? format(this.startDate, 'dd/MM/yy') : '';
});

documentSchema.virtual('formattedEndDate').get(function() {
    return this.endDate ? format(this.endDate, 'dd/MM/yy') : '';
});
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
    documents: [documentSchema],
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;