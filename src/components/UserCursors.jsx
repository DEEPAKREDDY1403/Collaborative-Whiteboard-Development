import React from 'react';
import { MousePointer } from 'lucide-react';

const UserCursors = ({ cursors }) => {
  const colors = [
    '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', 
    '#F97316', '#06B6D4', '#F59E0B', '#EC4899'
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(cursors).map(([userId, cursor], index) => (
        <div
          key={userId}
          className="absolute transform -translate-x-1 -translate-y-1 transition-all duration-75 ease-out"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            zIndex: 1000
          }}
        >
          <div className="relative">
            <MousePointer 
              className="w-5 h-5 drop-shadow-lg"
              style={{ 
                color: colors[index % colors.length],
                fill: colors[index % colors.length]
              }}
            />
            <div 
              className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white font-medium shadow-lg whitespace-nowrap"
              style={{ backgroundColor: colors[index % colors.length] }}
            >
              User {userId.slice(-4)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCursors;