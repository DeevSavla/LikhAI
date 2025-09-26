# LikhAI - AI-Powered Screenplay Writing Platform

## Overview

LikhAI revolutionizes screenplay writing by combining traditional writing tools with cutting-edge AI technology. The platform offers real-time collaboration, intelligent writing assistance, plagiarism detection, and comprehensive script analysis to help writers create compelling screenplays.

**Live Demo**: [https://likh-ai.vercel.app](https://likh-ai.vercel.app)

### Key Highlights
- **Real-time Collaboration**: Multiple users can work on the same document simultaneously
- **AI-Powered Analysis**: Advanced script analysis with character insights and narrative direction
- **Voice Integration**: Speech-to-text and text-to-speech capabilities
- **Plagiarism Detection**: Built-in plagiarism checking using Copyleaks API
- **Version Control**: Document versioning and restoration capabilities
- **Modern UI/UX**: Beautiful, responsive interface with dark mode support

## Core Features

### Advanced Text Editor
- **Rich Text Editing**: Powered by TinyMCE with comprehensive formatting options
- **Auto-save**: Automatic document saving with manual save options
- **Export Options**: Export documents in multiple formats (PDF, DOC, EPUB)
- **Real-time Collaboration**: Live editing with multiple users
- **Version History**: Track and restore previous document versions

### AI-Powered Tools
- **Writing Style Analysis**: Analyze sentence structure, vocabulary diversity, and punctuation patterns
- **Scene Generation**: AI-generated scene suggestions and content
- **Character Analysis**: Automatic character detection and emotion analysis
- **Narrative Direction**: AI-powered story development suggestions
- **Readability Scoring**: Comprehensive readability assessment

### Voice Features
- **Speech-to-Text**: Voice input for hands-free writing
- **Text-to-Speech**: Audio playback of written content
- **Real-time Transcription**: Live voice-to-text conversion

### Quality Assurance
- **Plagiarism Detection**: Comprehensive plagiarism checking with detailed reports
- **Scene-by-Scene Analysis**: Individual scene assessment and feedback
- **Source Matching**: Detailed source attribution and match percentages

### Collaboration Features
- **Real-time Editing**: Multiple users editing simultaneously
- **Active User Tracking**: See who's currently working on the document
- **Comment System**: Add comments and feedback to documents
- **Project Management**: Organize documents into projects with team collaboration

## Project Structure

### Frontend
```
src/
├── components/           # Reusable UI components
│   ├── LikhAIEditor.jsx     # Main text editor component
│   ├── AIHelperSidebar.jsx  # AI writing assistance panel
│   ├── AIAnalysisSidebar.jsx # Script analysis panel
│   ├── CommentSidebar.jsx   # Comments and feedback system
│   ├── Navbar.jsx           # Navigation component
│   ├── Footer.jsx           # Footer component
│   └── ProtectedRoute.jsx   # Authentication guard
├── pages/               # Application pages
│   ├── Home.jsx            # Landing page
│   ├── Dashboard.jsx       # User dashboard
│   ├── Editor.jsx          # Main editor page
│   ├── ProjectDetails.jsx  # Project management
│   ├── Login.jsx           # Authentication
│   ├── Signup.jsx          # User registration
│   └── ...                 # Additional pages
├── contexts/            # React context providers
│   ├── AuthContext.jsx     # Authentication state
│   ├── ProjectContext.jsx  # Project management state
│   └── ThemeContext.jsx    # Theme and UI state
└── utils/               # Utility functions
    └── baseUrl.js          # API configuration
```

### Backend 
```
backend/
├── controllers/         # Request handlers
│   ├── document.controller.js  # Document CRUD operations
│   ├── project.controller.js   # Project management
│   ├── login.controller.js     # Authentication
│   └── signup.controller.js    # User registration
├── models/              # Database models
│   ├── user.model.js         # User schema
│   ├── document.model.js     # Document schema
│   ├── project.model.js      # Project schema
│   └── documentVersion.model.js # Version control
├── config/              # Configuration files
│   └── database.js          # MongoDB connection
├── websocket.js         # Real-time collaboration
├── server.js           # Main server file
└── scripts/            # Utility scripts
    └── resetDb.js          # Database reset utility
```

### AI Service
The AI service is deployed separately and provides:
- **Script Analysis**: Character detection, emotion analysis, narrative direction
- **Style Analysis**: Writing style assessment and metrics
- **Scene Generation**: AI-powered content generation
- **Readability Scoring**: Text complexity and readability analysis

## Technologies Used

### Frontend Technologies
- **React 18.2.0**: Modern React with hooks and functional components
- **Vite 5.1.4**: Fast build tool and development server
- **React Router DOM 6.22.1**: Client-side routing
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 12.4.10**: Animation library for smooth transitions
- **TinyMCE React 6.0.0**: Rich text editor component
- **Axios 1.8.2**: HTTP client for API requests
- **Heroicons**: Beautiful SVG icons
- **Lodash 4.17.21**: Utility library for data manipulation

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js 4.21.2**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **WebSocket (ws 8.18.1)**: Real-time communication
- **JWT (jsonwebtoken 9.0.2)**: Authentication tokens
- **bcrypt 5.1.1**: Password hashing
- **CORS 2.8.5**: Cross-origin resource sharing
- **Nodemailer 6.10.0**: Email functionality
- **dotenv 16.4.7**: Environment variable management

### AI Service Technologies
- **Python**: AI service backend
- **FastAPI**: Modern Python web framework for APIs
- **Natural Language Processing**: Text analysis and processing
- **Machine Learning Models**: Character detection and analysis
- **External APIs**: Copyleaks for plagiarism detection

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **Nodemon**: Development server with auto-restart

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LikhAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WS_BASE_URL=ws://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/likhai
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### AI Service Setup

The AI service is deployed separately and provides the following endpoints:

1. **Script Analysis**
   ```bash
   POST /analyze
   ```
   - Analyzes script content for characters, emotions, and narrative direction

2. **Style Analysis**
   ```bash
   POST /analyze-style
   ```
   - Provides writing style metrics and analysis

3. **Scene Generation**
   ```bash
   GET /generate-scene
   ```
   - Generates AI-powered scene content

4. **Statistics**
   ```bash
   GET /stats
   ```
   - Returns character and content statistics

5. **Readability Score**
   ```bash
   GET /readability
   ```
   - Calculates document readability metrics

### Database Setup

1. **MongoDB Configuration**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your backend `.env` file
   - The application will automatically create necessary collections

2. **Reset Database (Optional)**
   ```bash
   cd backend
   node scripts/resetDb.js
   ```

### Production Deployment

1. **Frontend Build**
   ```bash
   npm run build
   ```

2. **Backend Production**
   ```bash
   cd backend
   npm start
   ```

3. **Environment Variables**
   Ensure all production environment variables are properly configured:
   - Database connection strings
   - JWT secrets
   - Email credentials
   - API endpoints

## Configuration

### API Endpoints
- **Frontend**: `https://likh-ai.vercel.app`
- **Backend**: `https://likhai.onrender.com`
- **AI Service**: `https://hackniche-extra-endpoints.onrender.com`

## Features in Detail

### Real-time Collaboration
- WebSocket-based real-time editing
- Active user tracking and display
- Conflict resolution for simultaneous edits
- Automatic reconnection on connection loss

### AI Integration
- **Writing Style Analysis**: Sentence length, vocabulary diversity, punctuation patterns
- **Character Analysis**: Automatic character detection and emotion tracking
- **Scene Generation**: AI-powered content suggestions
- **Narrative Direction**: Story development recommendations
- **Readability Assessment**: Comprehensive text complexity analysis

### Voice Features
- **Speech Recognition**: Browser-based speech-to-text
- **Text-to-Speech**: Audio playback of written content
- **Real-time Transcription**: Live voice input processing

### Quality Assurance
- **Plagiarism Detection**: Integration with Copyleaks API
- **Scene-by-Scene Analysis**: Individual scene assessment
- **Source Attribution**: Detailed match reporting
- **Risk Assessment**: Plagiarism risk scoring

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All contributors and team members who have helped build Safar