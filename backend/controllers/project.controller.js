import { userModel } from '../models/user.model.js'
import { projectModel } from '../models/project.model.js'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import nodemailer from 'nodemailer'


config()

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

const getUserProjects = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token required' });
        }

        const secretKey = process.env.JWT_SECRET
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.userIdentifier;

        const projects = await projectModel.find({
            $or: [
                { userId }, // Projects where user is the creator
                { "collaborators.userId": userId } // Projects where user is a collaborator
            ]
        }).populate('collaborators.userId', 'fullname email'); // Populate collaborators' details

        res.json({ projects });

    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

const createProject = async (req, res) => {
    try {
        const { token, title, description } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create new project with minimal required fields
        const newProject = new projectModel({
            userId: user._id,
            name: title || 'Untitled Project',
            description: description || '',
            docType: 'article',
            status: 'inprogess',
            collaborators: []
        });

        // Save the project and handle any potential errors
        try {
            await newProject.save();
        } catch (saveError) {
            // If there's a duplicate key error, try with a different name
            if (saveError.code === 11000) {
                // Add a timestamp to make the name unique
                newProject.name = `${title || 'Untitled Project'} ${Date.now()}`;
                await newProject.save();
            } else {
                throw saveError;
            }
        }

        res.status(201).json({ 
            success: true,
            message: 'Project created successfully',
            project: {
                _id: newProject._id,
                title: newProject.name,
                description: newProject.description,
                createdAt: newProject.createdAt,
                category: newProject.status
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const fetchProjects = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const projects = await projectModel.find({
            $or: [
                { userId: user._id },
                { 'collaborators.user': userEmail }
            ]
        });

        const formattedProjects = projects.map(project => ({
            _id: project._id,
            title: project.name,
            description: project.description,
            createdAt: project.createdAt,
            status: project.status || 'todo'  // Ensure status is always defined
        }));

        res.status(200).json({ 
            success: true,
            projects: formattedProjects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addCollaborator = async (req, res) => {
    try {
        const { token, projectId, collaboratorEmail, role } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find project and verify ownership
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (!project.userId.equals(user._id)) {
            return res.status(403).json({ success: false, message: 'Only project owner can add collaborators' });
        }

        // Verify collaborator exists
        const collaborator = await userModel.findOne({ email: collaboratorEmail });
        if (!collaborator) {
            return res.status(404).json({ success: false, message: 'Collaborator email not found' });
        }

        console.log(collaboratorEmail)

        // Check if already a collaborator
        const existingCollaborator = project.collaborators.find(c => c.user === collaboratorEmail);
        if (existingCollaborator) {
            existingCollaborator.role = role;
        } else {
            project.collaborators.push({
                user: collaboratorEmail,
                role: role
            });
        }

        const mailOptions = {
            from: process.env.GMAIL_USERNAME,
            to: collaboratorEmail,
            subject: `LikhAI Collaboration Access.`,
            text: `You have been given collaboration access to a ${project.name} project.`,
            html: `<p>You have been given collaboration access to a ${project.name} project.`,
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ success: false, message: "Failed to send email for access." });
            } else {
              console.log("Email sent: " + info.response);
            }
          });

        await project.save();

   

        res.status(200).json({
            success: true,
            message: 'Collaborator added successfully',
            collaborators: project.collaborators
        });

    } catch (error) {
        console.error('Error adding collaborator:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const removeCollaborator = async (req, res) => {
    try {
        const { token, projectId, collaboratorEmail } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (!project.userId.equals(user._id)) {
            return res.status(403).json({ success: false, message: 'Only project owner can remove collaborators' });
        }

        project.collaborators = project.collaborators.filter(c => c.user !== collaboratorEmail);
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Collaborator removed successfully',
            collaborators: project.collaborators
        });

    } catch (error) {
        console.error('Error removing collaborator:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const updateProject = async (req, res) => {
    try {
        const { token, projectId, name, description } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if user is the owner or an editor
        const isOwner = project.userId.equals(user._id);
        const isEditor = project.collaborators.some(c => c.user === userEmail && c.role === 'editor');
        
        if (!isOwner && !isEditor) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
        }

        // Update project fields
        if (name) project.name = name;
        if (description) project.description = description;

        await project.save();

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project: {
                _id: project._id,
                title: project.name,
                description: project.description,
                createdAt: project.createdAt,
                category: project.status
            }
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { token, projectId } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if user is the project owner
        if (!project.userId.equals(user._id)) {
            return res.status(403).json({ success: false, message: 'Only project owner can delete the project' });
        }

        await projectModel.findByIdAndDelete(projectId);

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

export {
    getUserProjects,
    createProject,
    fetchProjects,
    addCollaborator,
    removeCollaborator,
    updateProject,
    deleteProject
}