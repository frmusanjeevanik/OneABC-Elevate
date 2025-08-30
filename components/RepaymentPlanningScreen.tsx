import React, { useState, useMemo, useEffect } from 'react';
import { JourneyStep, type ScreenProps } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { useAppContext } from '../App';

interface PaymentPlan {
  id: 'balanced' | 'saver' | 'flexible';
  name: string;
  description: string;
  emi: number;
  totalInterest: number;
}

const RepaymentPlanningScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { appState } = useAppContext();
  const loanAmount = appState.selectedOffer?.amount ?? 4000000;
  const rate = parseFloat(appState.selectedOffer?.interestRate ?? "8.5");
  
  const tenureOptions = [5, 7, 10, 12, 15];
  const initialTenureFromOffer = appState.selectedOffer?.tenure;
  const defaultTenure = 10;
  const initialTenure = initialTenureFromOffer && tenureOptions.includes(initialTenureFromOffer) 
    ? initialTenureFromOffer 
    : defaultTenure;

  const [tenure, setTenure] = useState(initialTenure);
  const [selectedPlanId, setSelectedPlanId] = useState<PaymentPlan['id']>('balanced');
  const [displayEmi, setDisplayEmi] = useState(0);

  const paymentPlans: PaymentPlan[] = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = rate / (12 * 100);
    const originalMonths = tenure * 12;
    if (principal <= 0 || monthlyRate <= 0 || originalMonths <= 0) return [];
    
    // 1. Balanced Plan (Standard EMI)
    const balancedEmi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, originalMonths)) / (Math.pow(1 + monthlyRate, originalMonths) - 1));
    const balancedTotalInterest = Math.round((balancedEmi * originalMonths) - principal);

    // 2. Saver Plan (Accelerated Payment)
    const saverEmi = Math.round(balancedEmi * 1.15); // 15% higher payment
    const saverMonths = -Math.log(1 - (principal * monthlyRate) / saverEmi) / Math.log(1 + monthlyRate);
    const saverTotalInterest = Math.round((saverEmi * saverMonths) - principal);

    // 3. Flexible Plan (Lower Payment)
    const flexibleEmi = Math.round(balancedEmi * 0.90); // 10% lower payment
    const flexibleMonths = -Math.log(1 - (principal * monthlyRate) / flexibleEmi) / Math.log(1 + monthlyRate);
    const flexibleTotalInterest = Math.round((flexibleEmi * flexibleMonths) - principal);
    
    return [
      { id: 'balanced', name: 'Balanced Plan', description: 'Standard EMI for a steady repayment.', emi: balancedEmi, totalInterest: balancedTotalInterest },
      { id: 'saver', name: 'Saver Plan', description: 'Pay more monthly to save on total interest.', emi: saverEmi, totalInterest: saverTotalInterest },
      { id: 'flexible', name: 'Flexible Plan', description: 'Lower EMI for more monthly flexibility.', emi: flexibleEmi, totalInterest: flexibleTotalInterest },
    ];
  }, [loanAmount, rate, tenure]);

  const maxInterest = useMemo(() => {
    if (paymentPlans.length === 0) return 1;
    return Math.max(...paymentPlans.map(p => p.totalInterest));
  }, [paymentPlans]);

  useEffect(() => {
    const selectedPlan = paymentPlans.find(p => p.id === selectedPlanId);
    if (selectedPlan) {
      setDisplayEmi(selectedPlan.emi);
    } else if (paymentPlans.length > 0) {
      // Fallback to balanced if selected plan disappears
      setDisplayEmi(paymentPlans[0].emi);
      setSelectedPlanId('balanced');
    }
  }, [selectedPlanId, paymentPlans]);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800">Plan Your Repayment</h2>
      <p className="text-gray-600 mt-2 mb-6">You're in control. Let's find a plan that works for you.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: EMI Calculator & Options */}
        <div className="space-y-6">
            <Card>
              <div className="text-center">
                  <p className="text-sm text-gray-500">Your Monthly EMI</p>
                  <p className="text-4xl font-bold text-capital-red my-2">₹{displayEmi.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="mt-6">
                <label htmlFor="tenure" className="block text-sm font-medium text-gray-700">Repayment Tenure</label>
                <select
                    id="tenure"
                    value={tenure}
                    onChange={(e) => setTenure(parseInt(e.target.value, 10))}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm"
                >
                    {tenureOptions.map(option => (
                        <option key={option} value={option}>{option} years</option>
                    ))}
                </select>
              </div>
            </Card>

            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Choose Your Payment Plan</h3>
                <div className="space-y-3">
                    {paymentPlans.map(plan => (
                        <div key={plan.id} onClick={() => setSelectedPlanId(plan.id)}
                           className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlanId === plan.id ? 'border-capital-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                           <div className="flex justify-between items-center">
                                <h4 className="font-bold">{plan.name}</h4>
                                {plan.id === 'balanced' && (
                                    <span className="text-xs font-semibold bg-green-100 text-progressive-green px-2 py-0.5 rounded-full">Recommended</span>
                                )}
                           </div>
                           <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                           <div className="flex justify-between items-end mt-2">
                                <p className="text-lg font-semibold text-gray-800">₹{plan.emi.toLocaleString('en-IN')}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                                <div>
                                    <p className="text-xs text-gray-500 text-right">Total Interest</p>
                                    <p className="text-sm font-medium text-gray-600">₹{plan.totalInterest.toLocaleString('en-IN')}</p>
                                </div>
                           </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
        
        {/* Right: Info Boxes & Chart */}
        <div className="space-y-6">
            <Card>
                <h3 className="font-bold text-gray-800 mb-4">Total Interest Comparison</h3>
                <div className="flex items-end justify-around h-48 space-x-4 pt-4" aria-label="Bar chart comparing total interest for each plan">
                {paymentPlans.map(plan => (
                    <div key={plan.id} className="flex flex-col items-center flex-1">
                    <div className="text-xs font-semibold text-gray-600 mb-1">₹{plan.totalInterest.toLocaleString('en-IN')}</div>
                    <div 
                        role="progressbar"
                        aria-valuenow={plan.totalInterest}
                        aria-valuemin={0}
                        aria-valuemax={maxInterest}
                        aria-label={`${plan.name} total interest`}
                        className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                        plan.id === 'saver' ? 'bg-progressive-green' : plan.id === 'flexible' ? 'bg-warm-yellow' : 'bg-capital-red/80'
                        }`}
                        style={{ height: `${(plan.totalInterest / maxInterest) * 100}%`}}
                    ></div>
                    <div className="text-sm font-medium text-gray-700 mt-2 text-center">{plan.name}</div>
                    </div>
                ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">The 'Saver Plan' helps you pay the least amount of interest over the life of the loan.</p>
            </Card>

            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-progressive-green">Moratorium Period</h4>
                <p className="text-sm text-green-800">Your EMIs begin after your course ends + 1 year. No payments needed while you study!</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900">Prepayment Flexibility</h4>
                <p className="text-sm text-yellow-800">Pay off your loan faster with zero prepayment penalties. Save on interest!</p>
            </div>
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