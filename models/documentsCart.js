const mongoose = require('mongoose');

const documentCartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    reached: {
        type: Number,
        required: [false, 0],
    },
    documents: [
        {
            employee: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Employee',
            },
            employeeName: {
                type: String,
                required: true,
            },
            document: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Document',
            },
            documentTitle: {
                type: String,
                required: true,
            },
            documentFileUrl: {
                type: String,
                required: true,
            },
            documentTotalTime: {
                type: Number,
                required: true,
            },
        },
    ],
});

documentCartSchema.pre('save', function(next) {
    this.reached = this.documents.reduce((total, document) => {
      return total + document.documentTotalTime;
    }, 0);
    next();
  });

const DocumentCart = mongoose.model('DocumentCart', documentCartSchema);
module.exports = DocumentCart;