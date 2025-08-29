
import React, { useState, useEffect } from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import { CheckCircleIcon, DownloadIcon } from './common/Icons';

const SanctionApprovalScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsApproved(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in-up text-center flex flex-col items-center">
      {!isApproved ? (
        <>
          <div className="relative flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-progressive-green"></div>
            <p className="absolute text-gray-700 font-semibold">Processing...</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-8">Application Submitted!</h2>
          <p className="text-gray-600 mt-2">We're reviewing your details. This usually takes just a moment.</p>
          <p className="text-sm text-gray-500 mt-4">Estimated time to disbursal: 3-5 working days.</p>
        </>
      ) : (
        <>
          <CheckCircleIcon className="w-24 h-24 text-progressive-green mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Congratulations! Your Loan is Approved.</h2>
          <p className="text-gray-600 mt-2 mb-8">Your sanction letter is ready. You're one step closer to your dream university!</p>
          
          <div className="bg-green-50 border-l-4 border-progressive-green p-4 text-left w-full rounded-r-lg">
            <h4 className="font-bold text-green-800">Next Steps:</h4>
            <ul className="list-disc list-inside text-sm text-green-700 mt-2">
              <li>Download your sanction letter for your visa/admission process.</li>
              <li>Wait for disbursal confirmation. We'll notify you!</li>
            </ul>
          </div>

          <div className="w-full mt-8 space-y-4">
            <Button fullWidth onClick={() => alert("Downloading Sanction Letter...")} className="flex items-center justify-center space-x-2">
                <DownloadIcon className="w-5 h-5"/>
                <span>Download Sanction Letter</span>
            </Button>
            <div className="flex items-center space-x-4">
                {goBack && <Button fullWidth variant="secondary" onClick={goBack}>Back</Button>}
                <Button fullWidth variant="secondary" onClick={() => setJourneyStep(JourneyStep.DisbursalExperience)}>
                    Track Disbursal
                </Button>
            </div>
            <Button fullWidth variant="ghost" onClick={() => setJourneyStep(JourneyStep.Dashboard)}>
                Go to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SanctionApprovalScreen;