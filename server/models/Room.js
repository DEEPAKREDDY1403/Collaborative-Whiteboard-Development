import mongoose from 'mongoose';

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['stroke', 'clear'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  drawingData: [drawingCommandSchema],
  activeUsers: {
    type: Number,
    default: 0
  }
});

// Clean up old rooms (older than 24 hours with no activity)
roomSchema.statics.cleanupOldRooms = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.deleteMany({ 
    lastActivity: { $lt: oneDayAgo },
    activeUsers: 0
  });
};

const Room = mongoose.model('Room', roomSchema);

export default Room;