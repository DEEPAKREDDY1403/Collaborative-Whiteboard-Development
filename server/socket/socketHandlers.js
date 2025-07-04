import Room from '../models/Room.js';

// Store active users and their cursors
const activeUsers = new Map();
const userCursors = new Map();

// Throttle cursor updates
const cursorUpdateThrottle = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log('User connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', async (roomId) => {
    try {
      // Leave previous room if any
      if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        await handleUserLeave(socket, socket.currentRoom, io);
      }

      // Join new room
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Update active users
      if (!activeUsers.has(roomId)) {
        activeUsers.set(roomId, new Set());
      }
      activeUsers.get(roomId).add(socket.id);

      // Update database
      await Room.findOneAndUpdate(
        { roomId },
        { 
          $inc: { activeUsers: 1 },
          lastActivity: new Date()
        },
        { upsert: true }
      );

      // Send current users list
      const users = Array.from(activeUsers.get(roomId) || []);
      io.to(roomId).emit('user-joined', {
        users,
        userId: socket.id
      });

      // Send existing drawing data
      const room = await Room.findOne({ roomId });
      if (room && room.drawingData.length > 0) {
        socket.emit('drawing-data', room.drawingData);
      }

      console.log(`User ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  // Handle leaving a room
  socket.on('leave-room', async (roomId) => {
    await handleUserLeave(socket, roomId, io);
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    const { roomId, x, y } = data;
    
    // Throttle cursor updates
    const now = Date.now();
    const lastUpdate = cursorUpdateThrottle.get(socket.id) || 0;
    
    if (now - lastUpdate < 16) { // ~60fps
      return;
    }
    
    cursorUpdateThrottle.set(socket.id, now);
    
    // Update cursor position
    userCursors.set(socket.id, { x, y });
    
    // Broadcast to others in room
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      cursor: { x, y }
    });
  });

  // Handle drawing start
  socket.on('draw-start', async (data) => {
    const { roomId, x, y, color, width } = data;
    
    // Broadcast to others in room
    socket.to(roomId).emit('draw-start', { x, y, color, width });
    
    // Update room activity
    await Room.findOneAndUpdate(
      { roomId },
      { lastActivity: new Date() }
    );
  });

  // Handle drawing move
  socket.on('draw-move', (data) => {
    const { roomId, x, y, color, width } = data;
    
    // Broadcast to others in room
    socket.to(roomId).emit('draw-move', { x, y, color, width });
  });

  // Handle drawing end
  socket.on('draw-end', async (data) => {
    const { roomId } = data;
    
    // Broadcast to others in room
    socket.to(roomId).emit('draw-end');
    
    // Save drawing data to database
    // Note: In a production app, you might want to batch these operations
    // or use a more efficient storage method for large drawings
  });

  // Handle canvas clear
  socket.on('clear-canvas', async (data) => {
    const { roomId } = data;
    
    try {
      // Clear drawing data in database
      await Room.findOneAndUpdate(
        { roomId },
        { 
          drawingData: [],
          lastActivity: new Date()
        }
      );
      
      // Broadcast to all users in room
      io.to(roomId).emit('canvas-cleared');
      
      console.log(`Canvas cleared in room ${roomId}`);
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.currentRoom) {
      await handleUserLeave(socket, socket.currentRoom, io);
    }
    
    // Clean up cursor data
    userCursors.delete(socket.id);
    cursorUpdateThrottle.delete(socket.id);
  });
};

const handleUserLeave = async (socket, roomId, io) => {
  try {
    // Remove from active users
    if (activeUsers.has(roomId)) {
      activeUsers.get(roomId).delete(socket.id);
      
      // Clean up empty room
      if (activeUsers.get(roomId).size === 0) {
        activeUsers.delete(roomId);
      }
    }

    // Update database
    await Room.findOneAndUpdate(
      { roomId },
      { 
        $inc: { activeUsers: -1 },
        lastActivity: new Date()
      }
    );

    // Notify remaining users
    const users = Array.from(activeUsers.get(roomId) || []);
    socket.to(roomId).emit('user-left', {
      users,
      userId: socket.id
    });

    socket.leave(roomId);
    socket.currentRoom = null;
    
    console.log(`User ${socket.id} left room ${roomId}`);
  } catch (error) {
    console.error('Error handling user leave:', error);
  }
};

// Clean up old rooms periodically
setInterval(async () => {
  try {
    await Room.cleanupOldRooms();
  } catch (error) {
    console.error('Error cleaning up old rooms:', error);
  }
}, 60 * 60 * 1000); // Every hour