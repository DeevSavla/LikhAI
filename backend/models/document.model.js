import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    projectId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false, // Allow standalone documents
    },
    title: { 
        type: String, 
        required: true,
        default: 'Untitled Document'
    },
    description: { 
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    comments: [  
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',  
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    currentVersion: {
        type: Number,
        default: 0,
        required: true
    }
}, { timestamps: true });

export const documentModel = mongoose.model('Document', documentSchema);
