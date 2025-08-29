
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, label }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full my-4">
      {label && <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-progressive-green h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-right text-gray-500 mt-1">Step {currentStep} of {totalSteps}</p>
    </div>
  );
};

export default ProgressBar;
