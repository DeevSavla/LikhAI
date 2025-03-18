import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    collaborators: [  
        {
            user: {
                type: String,
                required: true,
            },
            role: {
                type: String,
                enum: ["editor", "viewer"],  
                required: true
            }
        }
    ],
    name: { type: String, required: true },
    docType: { 
        type: String, 
        required: true, 
        enum: ["script", "article", "marketing-material"],
        default: "article"
    },
    status: { 
        type: String, 
        required: true, 
        enum: ["inprogess", "todo", "underreview"],
        default: "todo"
    },
}, { timestamps: true });

// Clear all existing indexes and create only the necessary ones
projectSchema.index({}, { drop: true });
projectSchema.index({ userId: 1 });
projectSchema.index({ 'collaborators.user': 1 });

export const projectModel = mongoose.model('Project', projectSchema);
