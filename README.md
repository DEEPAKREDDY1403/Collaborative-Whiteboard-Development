# Real-time Collaborative Whiteboard Application

A full-featured collaborative whiteboard built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for real-time collaboration.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can draw simultaneously with live synchronization
- **Live Cursor Tracking**: See other users' cursors moving in real-time
- **Room-based Sessions**: Join or create rooms using simple alphanumeric codes
- **Drawing Tools**: Adjustable stroke width and color selection
- **Canvas Persistence**: Drawing data is saved and restored when joining rooms
- **User Presence**: Display active user count in each room
- **Responsive Design**: Works on desktop and tablet devices

## 🛠 Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Real-time Communication**: Socket.io
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd collaborative-whiteboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
mongod
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Application

You need to run both the frontend and backend servers. Open two terminal windows:

**Terminal 1 - Frontend (React + Vite):**
```bash
npm run dev
```
This starts the frontend development server on `http://localhost:3000`

**Terminal 2 - Backend (Node.js + Express):**
```bash
npm run server:dev
```
This starts the backend server on `http://localhost:3001`

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 🎯 How to Use

1. **Create a Room**: Click "Create New Room" to generate a random room code
2. **Join a Room**: Enter an existing room code and click "Join Room"
3. **Start Drawing**: Use the toolbar to select colors and adjust stroke width
4. **Collaborate**: Share your room code with others to collaborate in real-time
5. **Clear Canvas**: Use the clear button to reset the entire canvas

## 📁 Project Structure

```
collaborative-whiteboard/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── RoomJoin.jsx         # Room code input interface
│   │   ├── Whiteboard.jsx       # Main whiteboard container
│   │   ├── DrawingCanvas.jsx    # Canvas drawing logic
│   │   ├── Toolbar.jsx          # Drawing tools and controls
│   │   └── UserCursors.jsx      # Real-time cursor display
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── server/                       # Backend Node.js application
│   ├── models/
│   │   └── Room.js              # MongoDB room schema
│   ├── routes/
│   │   └── rooms.js             # REST API routes
│   ├── socket/
│   │   └── socketHandlers.js    # Socket.io event handlers
│   └── server.js                # Express server setup
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔌 API Documentation

### REST Endpoints

#### POST /api/rooms/join
Join or create a room.

**Request Body:**
```json
{
  "roomId": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "room": {
    "roomId": "ABC123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "activeUsers": 1
  }
}
```

#### GET /api/rooms/:roomId
Get room information and drawing data.

**Response:**
```json
{
  "success": true,
  "room": {
    "roomId": "ABC123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "activeUsers": 2,
    "drawingData": [...]
  }
}
```

### Socket Events

#### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join-room` | Join a specific room | `roomId: string` |
| `leave-room` | Leave current room | `roomId: string` |
| `cursor-move` | Update cursor position | `{ roomId, x, y }` |
| `draw-start` | Start drawing stroke | `{ roomId, x, y, color, width }` |
| `draw-move` | Continue drawing stroke | `{ roomId, x, y, color, width }` |
| `draw-end` | End drawing stroke | `{ roomId }` |
| `clear-canvas` | Clear entire canvas | `{ roomId }` |

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `user-joined` | User joined room | `{ users: string[], userId: string }` |
| `user-left` | User left room | `{ users: string[], userId: string }` |
| `cursor-update` | Other user's cursor moved | `{ userId, cursor: { x, y } }` |
| `draw-start` | Other user started drawing | `{ x, y, color, width }` |
| `draw-move` | Other user drawing data | `{ x, y, color, width }` |
| `draw-end` | Other user finished stroke | `{}` |
| `canvas-cleared` | Canvas was cleared | `{}` |
| `drawing-data` | Historical drawing data | `Array<DrawingCommand>` |

## 🏗 Architecture Overview

### High-Level System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Node.js API   │    │    MongoDB      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Drawing     │ │    │ │ Express     │ │    │ │ Room        │ │
│ │ Canvas      │ │◄──►│ │ REST API    │ │◄──►│ │ Collection  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │ Socket.io   │ │◄──►│ │ Socket.io   │ │    │                 │
│ │ Client      │ │    │ │ Server      │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

- **App.jsx**: Main application container, manages socket connection and routing
- **RoomJoin.jsx**: Handles room creation and joining logic
- **Whiteboard.jsx**: Main whiteboard interface, manages user presence and room state
- **DrawingCanvas.jsx**: Core drawing functionality and canvas event handling
- **Toolbar.jsx**: Drawing tools (color picker, stroke width, clear button)
- **UserCursors.jsx**: Displays real-time cursors of other users

### Data Flow

1. **Room Management**: Users join rooms via REST API, room state managed in MongoDB
2. **Real-time Events**: Drawing actions and cursor movements sent via Socket.io
3. **State Synchronization**: All clients receive real-time updates and maintain synchronized canvas state
4. **Persistence**: Drawing commands stored in MongoDB for room persistence

## 🚀 Deployment Guide

### Production Environment Setup

#### 1. Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/collaborative-whiteboard
CLIENT_URL=http://your-domain.com
```

#### 2. Build the Frontend

```bash
npm run build
```

#### 3. Production Dependencies

Install only production dependencies:

```bash
npm ci --only=production
```

#### 4. Process Management

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server/server.js --name "whiteboard-server"
pm2 startup
pm2 save
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "server/server.js"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/collaborative-whiteboard
    depends_on:
      - mongo
  
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Cloud Deployment Options

#### Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Add MongoDB Atlas addon: `heroku addons:create mongolab`
4. Deploy: `git push heroku main`

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `node server/server.js`
3. Add MongoDB database component

#### AWS EC2
1. Launch EC2 instance with Node.js
2. Install MongoDB or use AWS DocumentDB
3. Configure security groups for ports 80/443
4. Use nginx as reverse proxy
5. Set up SSL with Let's Encrypt

### Performance Optimization

#### Production Optimizations

1. **Enable Gzip Compression**:
```javascript
app.use(compression());
```

2. **Rate Limiting**:
```javascript
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

3. **MongoDB Indexing**:
```javascript
// Add indexes for better query performance
db.rooms.createIndex({ "roomId": 1 });
db.rooms.createIndex({ "lastActivity": 1 });
```

4. **Socket.io Scaling**:
```javascript
// Use Redis adapter for multiple server instances
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend with auto-reload
- `npm run lint` - Run ESLint

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading during development
2. **Debugging**: Use browser dev tools for frontend, Node.js debugger for backend
3. **Database**: Use MongoDB Compass for database visualization
4. **Socket Testing**: Use Socket.io client tester for debugging real-time events

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running on your system.

#### Socket Connection Failed
```
Error: Failed to connect to server
```
**Solution**: Ensure backend server is running on port 3001.

#### Canvas Not Responsive
**Solution**: Check browser console for JavaScript errors, ensure proper canvas sizing.

#### Drawing Not Syncing
**Solution**: Verify Socket.io connection status, check network connectivity.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation for integration help