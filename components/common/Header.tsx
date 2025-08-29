
import React from 'react';
import { LogoIcon, HomeIcon, ArrowLeftIcon } from './Icons';

interface HeaderProps {
  showBackButton?: boolean;
  goBack?: () => void;
  goHome?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, goBack, goHome }) => {
  return (
    <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between">
      <div className="flex-1">
        {showBackButton && (
          <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-2">
          <LogoIcon className="h-8 w-8 text-capital-red" />
          <div className="text-xl font-bold text-gray-800">
            <span className="font-light">OneABC</span>
            <span className="font-semibold text-capital-red"> Elevate</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-end">
        <button onClick={goHome} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go to homepage">
          <HomeIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;