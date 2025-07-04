import React, { useRef, useEffect, useState, useCallback } from 'react';

const DrawingCanvas = ({ socket, roomId, currentTool, isConnected }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Set initial context properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    
    setContext(ctx);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for drawing events from other users
    socket.on('draw-start', (data) => {
      if (context) {
        context.beginPath();
        context.moveTo(data.x, data.y);
      }
    });

    socket.on('draw-move', (data) => {
      if (context) {
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = data.color;
        context.lineWidth = data.width;
        context.lineTo(data.x, data.y);
        context.stroke();
      }
    });

    socket.on('draw-end', () => {
      if (context) {
        context.beginPath();
      }
    });

    socket.on('canvas-cleared', () => {
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });

    // Load existing drawing data
    socket.on('drawing-data', (data) => {
      if (context && data.length > 0) {
        data.forEach(command => {
          if (command.type === 'stroke') {
            drawStroke(command.data);
          } else if (command.type === 'clear') {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        });
      }
    });

    return () => {
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('draw-end');
      socket.off('canvas-cleared');
      socket.off('drawing-data');
    };
  }, [socket, roomId, context]);

  const drawStroke = (strokeData) => {
    if (!context) return;
    
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = strokeData.color;
    context.lineWidth = strokeData.width;
    context.beginPath();
    
    strokeData.points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    
    context.stroke();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = useCallback((e) => {
    if (!context || !isConnected) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastPosition(pos);
    
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    
    // Emit drawing start event
    socket.emit('draw-start', {
      roomId,
      x: pos.x,
      y: pos.y,
      color: currentTool.color,
      width: currentTool.width
    });
  }, [context, socket, roomId, currentTool, isConnected]);

  const draw = useCallback((e) => {
    if (!isDrawing || !context || !isConnected) return;
    
    const pos = getMousePos(e);
    
    // Draw locally
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = currentTool.color;
    context.lineWidth = currentTool.width;
    context.lineTo(pos.x, pos.y);
    context.stroke();
    
    // Emit drawing move event
    socket.emit('draw-move', {
      roomId,
      x: pos.x,
      y: pos.y,
      color: currentTool.color,
      width: currentTool.width
    });
    
    setLastPosition(pos);
  }, [isDrawing, context, socket, roomId, currentTool, isConnected]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (context) {
      context.beginPath();
    }
    
    // Emit drawing end event
    socket.emit('draw-end', { roomId });
  }, [isDrawing, context, socket, roomId]);

  const handleMouseMove = useCallback((e) => {
    if (!socket || !roomId) return;
    
    const pos = getMousePos(e);
    
    // Emit cursor position (throttled)
    socket.emit('cursor-move', {
      roomId,
      x: pos.x,
      y: pos.y
    });
  }, [socket, roomId]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={(e) => {
          draw(e);
          handleMouseMove(e);
        }}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      
      {!isConnected && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to server...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;