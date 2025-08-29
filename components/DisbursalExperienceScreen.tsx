
import React, { useState, useEffect } from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import { CheckCircleIcon } from './common/Icons';

const DisbursalExperienceScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const [status, setStatus] = useState(1);
  const statuses = [
    "Your loan is under process",
    "Loan Sanctioned",
    "Funds being transferred",
    "Disbursed to University",
  ];

  useEffect(() => {
    if (status < statuses.length) {
      const timer = setTimeout(() => {
        setStatus(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, statuses.length]);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Loan Disbursal Status</h2>
      
      <div className="space-y-8 p-4">
        {statuses.map((text, index) => (
          <div key={index} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < status ? 'bg-progressive-green text-white' : 'bg-gray-200 text-gray-500'}`}>
                {index < status ? <CheckCircleIcon className="w-5 h-5"/> : index + 1}
              </div>
              {index < statuses.length - 1 && (
                <div className={`w-0.5 h-16 mt-2 ${index < status -1 ? 'bg-progressive-green' : 'bg-gray-200'}`}></div>
              )}
            </div>
            <div>
              <p className={`font-semibold ${index < status ? 'text-gray-800' : 'text-gray-500'}`}>{text}</p>
              <p className="text-sm text-gray-500">
                {index === 0 && 'We have received your request.'}
                {index === 1 && 'Your loan agreement is finalized.'}
                {index === 2 && 'Payment is being processed.'}
                {index === 3 && 'The funds are with your institute.'}
              </p>
              {status === index + 1 && index < statuses.length -1 && <div className="text-xs text-blue-600 mt-1 animate-pulse">In Progress...</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {status === statuses.length ? (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-progressive-green">Disbursal Complete!</p>
            <p className="text-sm text-green-700 mt-1">We wish you the very best on your educational journey.</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <Button fullWidth onClick={() => setJourneyStep(JourneyStep.RepaymentPlanning)}>
                    Plan Your Repayment
                </Button>
                <Button fullWidth variant="secondary" onClick={() => setJourneyStep(JourneyStep.Dashboard)}>
                    Go to Dashboard
                </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="font-semibold text-yellow-800">Transparency is Key</p>
            <p className="text-sm text-yellow-700 mt-1">We'll keep you updated via Email, SMS, and WhatsApp.</p>
          </div>
        )}
      </div>

      {goBack && (
        <div className="mt-4">
            <Button fullWidth variant="secondary" onClick={goBack}>Back</Button>
        </div>
      )}
    </div>
  );
};

export default DisbursalExperienceScreen;