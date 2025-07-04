import express from 'express';
import Room from '../models/Room.js';

const router = express.Router();

// Join or create room
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    let room = await Room.findOne({ roomId });
    
    if (!room) {
      // Create new room
      room = new Room({
        roomId,
        drawingData: []
      });
      await room.save();
    } else {
      // Update last activity
      room.lastActivity = new Date();
      await room.save();
    }

    res.json({ 
      success: true, 
      room: {
        roomId: room.roomId,
        createdAt: room.createdAt,
        activeUsers: room.activeUsers
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room info
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        createdAt: room.createdAt,
        activeUsers: room.activeUsers,
        drawingData: room.drawingData
      }
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

export default router;