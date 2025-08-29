
import React from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import { LogoIcon } from './common/Icons';

const EducationIllustration = () => (
  <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="rounded-xl shadow-lg mb-8 w-full max-w-xs h-auto" aria-label="Illustration of graduation cap and books">
    <rect width="300" height="200" fill="#F9FAFB"/>
    <circle cx="230" cy="70" r="45" fill="#FFD65C" opacity="0.8"/>
    <path d="M40 155 h140 v15 H40z" fill="#9CA3AF" rx="2"/>
    <path d="M45 140 h130 v15 H45z" fill="#6B7280" rx="2"/>
    <path d="M50 125 h120 v15 H50z" fill="#4B5563" rx="2"/>
    <path d="M55 110 L115 90 L175 110 L115 130 Z" fill="#374151"/>
    <path d="M110 90 L120 90 L120 80 L110 80 Z" fill="#FFD65C"/>
  </svg>
);

const OnboardingScreen: React.FC<ScreenProps> = ({ setJourneyStep }) => {
  return (
    <div className="flex flex-col h-full animate-fade-in text-center justify-between">
      {/* Top section for logo and brand name */}
      <div className="pt-10">
        <div className="flex justify-center items-center space-x-3">
          <LogoIcon className="h-16 w-16 text-capital-red" />
          <div className="text-3xl font-bold text-gray-800">
            <span className="font-light">OneABC</span>
            <span className="font-semibold text-capital-red"> Elevate</span>
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="flex flex-col items-center">
        <EducationIllustration />
      
        <h1 className="text-3xl font-bold text-gray-800">Your Future Awaits</h1>
        <p className="text-lg text-gray-600 mt-2">Secure your education with a partner you can trust.</p>
      </div>

      {/* Action buttons */}
      <div className="pb-6">
        <div className="w-full max-w-xs mx-auto space-y-4">
            <Button 
              fullWidth 
              onClick={() => setJourneyStep(JourneyStep.ProfileSetup)}
            >
              Start New Application
            </Button>
            <Button 
              fullWidth 
              variant="secondary"
              onClick={() => setJourneyStep(JourneyStep.ProfileSetup)}
            >
              Existing User Login
            </Button>
        </div>
        <p className="text-xs text-gray-500 pt-4 w-full max-w-xs mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
