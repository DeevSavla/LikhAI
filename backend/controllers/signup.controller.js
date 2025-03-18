import bcrypt from 'bcrypt'
import { userModel } from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv';

config()

export const signupController = async (req, res) => {
    try {
        const { email, confirmPassword, termscondition } = req.body;

        if (!email || !confirmPassword || !termscondition) {
            return res.status(400).json({ message: 'All fields are required.', success: false });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

        const newUser = new userModel({
            email,
            password: hashedPassword,
            termscondition,
        });

        await newUser.save();

        const token = jwt.sign({ userIdentifier: newUser.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        return res.status(200).json({ message: 'User created successfully.', success: true, token });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Internal server error.', success: false });
    }
};

