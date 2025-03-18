import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { userModel } from './models/user.model.js';
import { documentModel } from './models/document.model.js';
import url from 'url';

// Store active connections for each document
const documentConnections = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    try {
      // Parse URL to get document ID and token
      const { pathname, query } = url.parse(req.url, true);
      const documentId = pathname.split('/')[2];
      const { token } = query;

      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      // Verify token and get user
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userEmail = decoded.userIdentifier;
      const user = await userModel.findOne({ email: userEmail });

      if (!user) {
        ws.close(1008, 'User not found');
        return;
      }

      // Verify document access
      const document = await documentModel.findById(documentId);
      if (!document) {
        ws.close(1008, 'Document not found');
        return;
      }

      // Store connection info
      if (!documentConnections.has(documentId)) {
        documentConnections.set(documentId, new Map());
      }
      const connections = documentConnections.get(documentId);
      connections.set(ws, {
        userId: user._id,
        userEmail: userEmail
      });

      // Broadcast active users update
      broadcastActiveUsers(documentId);

      // Handle messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          
          // Handle different message types
          switch (message.type) {
            case 'content_update':
              // Use findOneAndUpdate instead of direct save
              await documentModel.findOneAndUpdate(
                { _id: documentId },
                { content: message.content },
                { new: true }
              );
              // Broadcast to other users
              broadcastToOthers(documentId, ws, {
                type: 'content_update',
                content: message.content
              });
              break;

            case 'title_update':
              // Use findOneAndUpdate for title updates too
              await documentModel.findOneAndUpdate(
                { _id: documentId },
                { title: message.title },
                { new: true }
              );
              // Broadcast to other users
              broadcastToOthers(documentId, ws, {
                type: 'title_update',
                title: message.title
              });
              break;
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        const connections = documentConnections.get(documentId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            documentConnections.delete(documentId);
          } else {
            broadcastActiveUsers(documentId);
          }
        }
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });
}

function broadcastToOthers(documentId, sender, message) {
  const connections = documentConnections.get(documentId);
  if (!connections) return;

  connections.forEach((userInfo, ws) => {
    if (ws !== sender && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function broadcastActiveUsers(documentId) {
  const connections = documentConnections.get(documentId);
  if (!connections) return;

  const activeUsers = Array.from(connections.values()).map(info => ({
    email: info.userEmail
  }));

  const message = {
    type: 'active_users',
    users: activeUsers
  };

  connections.forEach((_, ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
} 