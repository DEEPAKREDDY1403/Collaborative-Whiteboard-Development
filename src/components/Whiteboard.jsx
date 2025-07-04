import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';

const Whiteboard = ({ socket, roomId, onLeaveRoom, isConnected }) => {
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [currentTool, setCurrentTool] = useState({
    color: '#000000',
    width: 2
  });

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit('join-room', roomId);

    // Listen for user updates
    socket.on('user-joined', (data) => {
      setUsers(data.users);
    });

    socket.on('user-left', (data) => {
      setUsers(data.users);
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    });

    socket.on('cursor-update', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: data.cursor
      }));
    });

    return () => {
      socket.emit('leave-room', roomId);
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-update');
    };
  }, [socket, roomId]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
    onLeaveRoom();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Room</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Room: {roomId}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Toolbar */}
        <Toolbar 
          currentTool={currentTool} 
          onToolChange={setCurrentTool}
          socket={socket}
          roomId={roomId}
        />

        {/* Canvas Container */}
        <div className="flex-1 relative bg-white">
          <DrawingCanvas
            socket={socket}
            roomId={roomId}
            currentTool={currentTool}
            isConnected={isConnected}
          />
          <UserCursors cursors={cursors} />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;