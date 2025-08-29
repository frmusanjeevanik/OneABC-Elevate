
import React, { useState, useMemo } from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { useAppContext } from '../App';

const RepaymentPlanningScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { appState } = useAppContext();
  // Use the selected offer's amount, with a fallback for safety.
  const loanAmount = appState.selectedOffer?.amount ?? 4000000;
  const rate = parseFloat(appState.selectedOffer?.interestRate ?? "8.5");
  
  const [tenure, setTenure] = useState(appState.selectedOffer?.tenure ?? 10); // in years

  const emi = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = rate / (12 * 100);
    const months = tenure * 12;
    if (principal <= 0 || monthlyRate <= 0 || months <= 0) return 0;
    const emiValue = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emiValue);
  }, [loanAmount, rate, tenure]);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800">Plan Your Repayment</h2>
      <p className="text-gray-600 mt-2 mb-6">You're in control. Let's find a plan that works for you.</p>

      <Card>
        <div className="text-center">
            <p className="text-sm text-gray-500">Your Monthly EMI</p>
            <p className="text-4xl font-bold text-capital-red my-2">₹{emi.toLocaleString('en-IN')}</p>
        </div>
        
        <div className="mt-6">
            <label htmlFor="tenure-range" className="block text-sm font-medium text-gray-700">Repayment Tenure: <span className="font-bold">{tenure} years</span></label>
            <input 
                id="tenure-range"
                type="range" 
                min="5" 
                max="15" 
                step="1"
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-capital-red" 
            />
            <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>5 Yrs</span>
                <span>15 Yrs</span>
            </div>
        </div>
      </Card>
      
      <div className="mt-6 space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-progressive-green">Moratorium Period</h4>
          <p className="text-sm text-green-800">Your EMIs begin after your course ends + 1 year. No payments needed while you study!</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900">Prepayment Flexibility</h4>
          <p className="text-sm text-yellow-800">Pay off your loan faster with zero prepayment penalties. Save on interest!</p>
        </div>
      </div>
      
      <div className="mt-8 flex items-center space-x-4">
        {goBack && <Button variant="secondary" onClick={goBack}>Back</Button>}
        <Button fullWidth onClick={() => setJourneyStep(JourneyStep.Dashboard)}>
          Go to My Dashboard
        </Button>
      </div>
    </div>
  );
};

export default RepaymentPlanningScreen;
