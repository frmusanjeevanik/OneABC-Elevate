
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105";
  
  const variantClasses = {
    primary: 'bg-capital-red text-white hover:bg-red-700 focus:ring-capital-red',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    ghost: 'bg-transparent text-capital-red hover:bg-red-50 focus:ring-capital-red',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
