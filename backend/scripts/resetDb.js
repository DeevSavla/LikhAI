import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const resetDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        
        // Drop all collections
        const collections = await mongoose.connection.db.collections();
        
        for (let collection of collections) {
            await collection.drop();
        }
        
        console.log('Successfully reset database');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase(); 