const mongoose = require('mongoose');

const documentCartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    documents: [
        {
            employee: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Employee',
            },
            document: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Document',
            },
        },
    ],
});

const DocumentCart = mongoose.model('DocumentCart', documentCartSchema);
module.exports = DocumentCart;