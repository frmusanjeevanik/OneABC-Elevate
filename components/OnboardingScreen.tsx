import React from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import { LogoIcon } from './common/Icons';
import Card from './common/Card';

const EducationIllustration = () => (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg h-auto" aria-label="Abstract illustration of shapes representing growth and education">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#FFD65C', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#FBBF24', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#C7222A', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#EF4444', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <g transform="translate(200, 150)">
            {/* Background shapes */}
            <circle cx="0" cy="0" r="140" fill="#F3F4F6" />
            <path className="animate-float-slow" d="M -100 -80 Q -50 -120 0 -80 T 100 -80" stroke="#E5E7EB" strokeWidth="2" fill="none" />

            {/* Main floating elements */}
            <g className="animate-float-fast" style={{animationDelay: '0.5s'}}>
                <rect x="-100" y="-20" width="80" height="80" rx="20" fill="url(#grad2)" transform="rotate(-30, -60, 20)" />
            </g>
            <g className="animate-float-slow">
                <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
            </g>
            <g className="animate-float-fast">
                <path d="M 60 -80 L 100 -40 L 60 0 Z" fill="#70B865" />
            </g>

            {/* Decorative dots */}
            <circle cx="-120" cy="50" r="5" fill="#9CA3AF" className="animate-float-slow" style={{animationDelay: '0.2s'}} />
            <circle cx="110" cy="20" r="8" fill="#9CA3AF" className="animate-float-fast" style={{animationDelay: '0.8s'}} />
            <circle cx="-20" cy="100" r="6" fill="#9CA3AF" className="animate-float-slow" style={{animationDelay: '0.4s'}} />
        </g>
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
        <div className="my-8">
            <EducationIllustration />
        </div>
      </div>

      {/* Right Column: Call to Action */}
      <div className="md:w-1/2 flex flex-col justify-center items-center md:items-start">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center md:text-left">Your Future Awaits</h1>
        <p className="text-lg text-gray-600 mt-2 mb-8 text-center md:text-left">Secure your education with a partner you can trust.</p>
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
              onClick={() => setJourneyStep(JourneyStep.Dashboard)}
            >
              Existing User Login
            </Button>
        </div>
        <p className="text-xs text-gray-500 pt-4 w-full max-w-sm text-center md:text-left">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
         <div className="w-full max-w-sm mt-8">
            <Card className="!p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center space-x-3">
                    <img src="https://i.pravatar.cc/48?u=student-testimonial-priya" alt="Priya" className="w-12 h-12 rounded-full"/>
                    <div>
                        <p className="text-sm italic text-gray-700">"The process was incredibly smooth. OneABC Elevate helped me get into my dream university abroad!"</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1 text-right">- Priya, studying at MIT</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;