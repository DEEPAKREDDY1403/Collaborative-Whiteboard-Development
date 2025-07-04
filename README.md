# Real-time Collaborative Whiteboard Application

A full-featured collaborative whiteboard built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for real-time collaboration.

##  Features

- **Real-time Collaboration**: Multiple users can draw simultaneously with live synchronization
- **Live Cursor Tracking**: See other users' cursors moving in real-time
- **Room-based Sessions**: Join or create rooms using simple alphanumeric codes
- **Drawing Tools**: Adjustable stroke width and color selection
- **Canvas Persistence**: Drawing data is saved and restored when joining rooms
- **User Presence**: Display active user count in each room
- **Responsive Design**: Works on desktop and tablet devices

##  Technology Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Real-time Communication**: Socket.io
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

##  Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

##  Installation & Setup

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

##  How to Use

1. **Create a Room**: Click "Create New Room" to generate a random room code
2. **Join a Room**: Enter an existing room code and click "Join Room"
3. **Start Drawing**: Use the toolbar to select colors and adjust stroke width
4. **Collaborate**: Share your room code with others to collaborate in real-time
5. **Clear Canvas**: Use the clear button to reset the entire canvas

##  Project Structure

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

##  API Documentation

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

##  Architecture Overview

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
