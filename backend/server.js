import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import { connectDB } from './config/database.js'
import { signupController } from './controllers/signup.controller.js'
import { loginOtpController, loginPasswordController, verifyOtpController } from './controllers/login.controller.js'
import { createProject, fetchProjects, addCollaborator, removeCollaborator, updateProject, deleteProject } from './controllers/project.controller.js'
import { createDocument, getDocument, updateDocument, getUserDocuments, addComment, getComments, getDocumentVersions, restoreVersion } from './controllers/document.controller.js'
import { setupWebSocket } from './websocket.js'

config()

connectDB()

const app = express()
const server = createServer(app)

// Set up WebSocket server
setupWebSocket(server)

app.use(express.json())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','https://2fsnqvm4-8000.inc1.devtunnels.ms','https://hackniche-extra-endpoints.onrender.com','*','https://likhai.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT

app.post('/api/v1/signup', signupController)
app.post('/api/v1/login-with-otp', loginOtpController);
app.post('/api/v1/login-with-password', loginPasswordController)
app.post('/api/v1/verify-otp', verifyOtpController)

// Project routes
app.post("/api/v1/create-project", createProject);
app.post("/api/v1/fetch-projects", fetchProjects);
app.post("/api/v1/add-collaborator", addCollaborator);
app.post("/api/v1/remove-collaborator", removeCollaborator);
app.post("/api/v1/update-project", updateProject);
app.post("/api/v1/delete-project", deleteProject);

// Document routes
app.post('/api/v1/create-document', createDocument);
app.post('/api/v1/get-document', getDocument);
app.post('/api/v1/update-document', updateDocument);
app.post('/api/v1/get-user-documents', getUserDocuments);
app.post('/api/v1/add-comment', addComment);
app.post('/api/v1/get-comments', getComments);
app.post('/api/v1/get-document-versions', getDocumentVersions);
app.post('/api/v1/restore-version', restoreVersion);

server.listen(port, () => {
    console.log(`Server running in port ${port}.`)
})