import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model.js';
import { projectModel } from '../models/project.model.js';
import { documentModel } from '../models/document.model.js';
import { documentVersionModel } from '../models/documentVersion.model.js';

const createDocument = async (req, res) => {
    try {
        const { token, title, description, projectId, content } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If projectId is provided, verify user has access to the project
        if (projectId) {
            const project = await projectModel.findById(projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }

            const hasAccess = project.userId.equals(user._id) || 
                            project.collaborators.some(c => c.user === userEmail);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied to this project' });
            }
        }

        const newDocument = new documentModel({
            userId: user._id,
            projectId: projectId || null,
            title: title || 'Untitled Document',
            description: description || '',
            content: content || '',
            comments: [],
            currentVersion: 0  // Initialize currentVersion
        });

        await newDocument.save();

        // Create initial version
        const initialVersion = new documentVersionModel({
            documentId: newDocument._id,
            content: content || '',  // Use the content from request or empty string
            versionNumber: 1,  // Start from 1
            savedBy: user._id
        });
        await initialVersion.save();

        // Update document with initial version number
        newDocument.currentVersion = 1;
        await newDocument.save();

        res.status(201).json({
            success: true,
            message: 'Document created successfully',
            document: {
                _id: newDocument._id,
                title: newDocument.title,
                description: newDocument.description,
                content: newDocument.content,
                createdAt: newDocument.createdAt,
                projectId: newDocument.projectId
            }
        });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const getDocument = async (req, res) => {
    try {
        const { token, documentId } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const document = await documentModel.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Check if user has access to the document
        if (document.projectId) {
            const project = await projectModel.findById(document.projectId);
            const hasAccess = project.userId.equals(user._id) || 
                            project.collaborators.some(c => c.user === userEmail);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied to this document' });
            }
        } else if (!document.userId.equals(user._id)) {
            return res.status(403).json({ success: false, message: 'Access denied to this document' });
        }

        res.status(200).json({
            success: true,
            document: {
                _id: document._id,
                title: document.title,
                description: document.description,
                content: document.content,
                createdAt: document.createdAt,
                projectId: document.projectId,
                comments: document.comments
            }
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateDocument = async (req, res) => {
    try {
        const { token, documentId, title, description, content, createVersion = false } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const document = await documentModel.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Only create a new version if explicitly requested
        if (createVersion) {
            // Get latest version number
            const latestVersion = await documentVersionModel.findOne({ documentId })
                .sort({ versionNumber: -1 });
            
            const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
            
            // Save the current version to document versions
            const newVersion = new documentVersionModel({
                documentId: document._id,
                content: content || '',
                versionNumber: newVersionNumber,
                savedBy: user._id
            });
            await newVersion.save();
            
            // Update version number
            document.currentVersion = newVersionNumber;
        }

        // Update the document
        document.title = title || document.title;
        document.description = description || document.description;
        document.content = content || '';  // Ensure content is never undefined
        await document.save();

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            document: {
                _id: document._id,
                title: document.title,
                description: document.description,
                content: document.content,
                currentVersion: document.currentVersion
            }
        });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const getUserDocuments = async (req, res) => {
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

        // Get all projects where user is creator or collaborator
        const projects = await projectModel.find({
            $or: [
                { userId: user._id },
                { 'collaborators.user': userEmail }
            ]
        });

        const projectIds = projects.map(proj => proj._id);

        // Get all documents where user is creator or document belongs to accessible projects
        const documents = await documentModel.find({
            $or: [
                { userId: user._id },
                { projectId: { $in: projectIds } }
            ]
        });

        const formattedDocuments = documents.map(doc => ({
            _id: doc._id,
            title: doc.title,
            description: doc.description,
            createdAt: doc.createdAt,
            projectId: doc.projectId,
            version: doc.version
        }));

        res.status(200).json({
            success: true,
            documents: formattedDocuments
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addComment = async (req, res) => {
    try {
        const { token, documentId, text } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const document = await documentModel.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Check if user has access to the document
        if (document.projectId) {
            const project = await projectModel.findById(document.projectId);
            const hasAccess = project.userId.equals(user._id) || 
                            project.collaborators.some(c => c.user === userEmail);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied to this document' });
            }
        } else if (!document.userId.equals(user._id)) {
            return res.status(403).json({ success: false, message: 'Access denied to this document' });
        }

        const newComment = {
            userId: user._id,
            text,
            createdAt: new Date()
        };

        document.comments.push(newComment);
        await document.save();

        // Populate user details for the new comment
        const populatedDocument = await documentModel.findById(documentId)
            .populate('comments.userId', 'email');

        const formattedComment = populatedDocument.comments[populatedDocument.comments.length - 1];

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: {
                _id: formattedComment._id,
                text: formattedComment.text,
                createdAt: formattedComment.createdAt,
                user: {
                    _id: formattedComment.userId._id,
                    email: formattedComment.userId.email
                }
            }
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const getComments = async (req, res) => {
    try {
        const { token, documentId } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const document = await documentModel.findById(documentId)
            .populate('comments.userId', 'email');

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Check if user has access to the document
        if (document.projectId) {
            const project = await projectModel.findById(document.projectId);
            const hasAccess = project.userId.equals(user._id) || 
                            project.collaborators.some(c => c.user === userEmail);
            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'Access denied to this document' });
            }
        } else if (!document.userId.equals(user._id)) {
            return res.status(403).json({ success: false, message: 'Access denied to this document' });
        }

        const formattedComments = document.comments.map(comment => ({
            _id: comment._id,
            text: comment.text,
            createdAt: comment.createdAt,
            user: comment.userId ? {
                _id: comment.userId._id,
                email: comment.userId.email
            } : {
                _id: null,
                email: 'Unknown User'
            }
        }));

        res.status(200).json({
            success: true,
            comments: formattedComments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const getDocumentVersions = async (req, res) => {
    try {
        const { token, documentId } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get latest version number
        const latestVersion = await documentVersionModel.findOne({ documentId })
            .sort({ versionNumber: -1 });
        
        const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        const versions = await documentVersionModel.find({ documentId })
            .sort({ versionNumber: -1 })
            .populate('savedBy', 'email fullname');  // Ensure we populate both email and fullname

        res.status(200).json({
            success: true,
            versions: versions.map(v => ({
                versionNumber: v.versionNumber,
                content: v.content,
                savedBy: v.savedBy ? {
                    email: v.savedBy.email,
                    fullname: v.savedBy.fullname || v.savedBy.email.split('@')[0]
                } : {
                    email: 'Unknown User',
                    fullname: 'Unknown User'
                },
                createdAt: v.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching document versions:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const restoreVersion = async (req, res) => {
    try {
        const { token, documentId, versionNumber } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.userIdentifier;

        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const document = await documentModel.findById(documentId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const versionToRestore = await documentVersionModel.findOne({
            documentId,
            versionNumber
        });

        if (!versionToRestore) {
            return res.status(404).json({ success: false, message: 'Version not found' });
        }

        // Create new version with restored content
        const newVersionNumber = document.currentVersion + 1;
        const newVersion = new documentVersionModel({
            documentId: document._id,
            content: versionToRestore.content,
            versionNumber: newVersionNumber,
            savedBy: user._id
        });
        await newVersion.save();

        // Update current document
        document.content = versionToRestore.content;
        document.currentVersion = newVersionNumber;
        await document.save();

        res.status(200).json({
            success: true,
            message: 'Version restored successfully',
            document: {
                _id: document._id,
                title: document.title,
                description: document.description,
                content: document.content,
                currentVersion: document.currentVersion
            }
        });
    } catch (error) {
        console.error('Error restoring version:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

export {
    createDocument,
    getDocument,
    updateDocument,
    getUserDocuments,
    addComment,
    getComments,
    getDocumentVersions,
    restoreVersion
};