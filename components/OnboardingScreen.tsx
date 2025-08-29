import React from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import { LogoIcon } from './common/Icons';

const EducationIllustration = () => (
  <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="rounded-xl shadow-lg my-8 w-full max-w-sm h-auto" aria-label="Illustration of graduation cap and books">
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
    <div className="flex flex-col md:flex-row h-full animate-fade-in items-center p-6 md:p-12 md:gap-12">
      {/* Left Column: Branding & Illustration */}
      <div className="md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left">
        <div className="flex items-center space-x-3">
          <LogoIcon className="h-12 w-12 text-capital-red" />
          <div className="text-3xl font-bold text-gray-800">
            <span className="font-light">OneABC</span>
            <span className="font-semibold text-capital-red"> Elevate</span>
          </div>
        </div>
        <EducationIllustration />
      </div>

      {/* Right Column: Call to Action */}
      <div className="md:w-1/2 flex flex-col justify-center items-center md:items-start">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center md:text-left">Your Future Awaits</h1>
        <p className="text-xs text-gray-600 mt-2 mb-8 text-center md:text-left">Secure your education with a partner you can trust.</p>
        <div className="w-full max-w-sm space-y-4">
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
        <p className="text-xs text-gray-500 pt-4 w-full max-w-sm text-center md:text-left">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;