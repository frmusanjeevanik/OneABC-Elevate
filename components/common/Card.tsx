
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cursorClass = onClick ? 'cursor-pointer' : '';
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-shadow hover:shadow-lg ${cursorClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
