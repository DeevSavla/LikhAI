import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    termscondition: { type: Boolean, required: true },
},{ timestamps: true });

export const userModel = mongoose.model('User', userSchema);
