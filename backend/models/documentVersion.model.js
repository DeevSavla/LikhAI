import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    versionNumber: {
        type: Number,
        required: true
    },
    savedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Create compound index for documentId and versionNumber
documentVersionSchema.index({ documentId: 1, versionNumber: 1 }, { unique: true });

export const documentVersionModel = mongoose.model('DocumentVersion', documentVersionSchema); 