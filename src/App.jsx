import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';

function App() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError('');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setConnectionError('Failed to connect to server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleJoinRoom = (room) => {
    setRoomId(room);
  };

  const handleLeaveRoom = () => {
    setRoomId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
          isConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Error Message */}
      {connectionError && (
        <div className="fixed top-16 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {connectionError}
        </div>
      )}

      {/* Main Content */}
      {!roomId ? (
        <RoomJoin onJoinRoom={handleJoinRoom} />
      ) : (
        <Whiteboard 
          socket={socket} 
          roomId={roomId} 
          onLeaveRoom={handleLeaveRoom}
          isConnected={isConnected}
        />
      )}
    </div>
  );
}

export default App;