import React from 'react';
import { Palette, Minus, Plus, RotateCcw } from 'lucide-react';

const Toolbar = ({ currentTool, onToolChange, socket, roomId }) => {
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F97316' },
  ];

  const handleColorChange = (color) => {
    onToolChange({ ...currentTool, color });
  };

  const handleWidthChange = (width) => {
    onToolChange({ ...currentTool, width: Math.max(1, Math.min(20, width)) });
  };

  const handleClearCanvas = () => {
    if (socket && roomId) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6">
      {/* Color Palette */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <Palette className="w-5 h-5 text-gray-600" />
        </div>
        <div className="space-y-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                currentTool.color === color.value 
                  ? 'border-gray-400 ring-2 ring-blue-500 ring-offset-2' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-3">
        <div className="text-center">
          <span className="text-xs text-gray-600">Width</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => handleWidthChange(currentTool.width + 1)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Increase width"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <div 
              className="bg-gray-800 rounded-full"
              style={{ 
                width: `${Math.max(2, currentTool.width)}px`, 
                height: `${Math.max(2, currentTool.width)}px` 
              }}
            />
          </div>
          
          <button
            onClick={() => handleWidthChange(currentTool.width - 1)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Decrease width"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="text-center">
          <span className="text-xs text-gray-500">{currentTool.width}px</span>
        </div>
      </div>

      {/* Clear Canvas */}
      <div className="flex-1 flex items-end">
        <button
          onClick={handleClearCanvas}
          className="w-12 h-12 rounded-full bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center group"
          title="Clear canvas"
        >
          <RotateCcw className="w-5 h-5 text-red-600 group-hover:text-red-700" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;