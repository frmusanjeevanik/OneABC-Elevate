
import React, { useState, useEffect } from 'react';
import { JourneyStep, type ScreenProps, type LoanOffer } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { SparklesIcon } from './common/Icons';
import { useAppContext } from '../App';

const calculateEmi = (principal: number, annualRate: number, years: number): number => {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
};

const OfferCard = ({ offer, onSelect }: { offer: LoanOffer, onSelect: () => void }) => (
  <Card className="!p-0 overflow-hidden border-2 border-transparent hover:border-capital-red h-full flex flex-col">
    {offer.isPopular && (
      <div className="bg-warm-yellow text-yellow-900 px-4 py-1 text-sm font-bold flex items-center">
        <SparklesIcon className="w-4 h-4 mr-2" />
        Popular Choice
      </div>
    )}
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-gray-800">{offer.name}</h3>
                <p className="text-sm text-gray-500">{offer.collateral ? "With Collateral" : "Without Collateral"}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-capital-red">₹{offer.amount.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-600">Max Amount</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
                <p className="text-gray-500">Starting EMI</p>
                <p className="font-semibold text-gray-800">₹{offer.emi.toLocaleString('en-IN')}/month</p>
            </div>
            <div>
                <p className="text-gray-500">Tenure</p>
                <p className="font-semibold text-gray-800">Up to {offer.tenure} years</p>
            </div>
            <div>
                <p className="text-gray-500">Moratorium</p>
                <p className="font-semibold text-gray-800">{offer.moratorium}</p>
            </div>
            <div>
                <p className="text-gray-500">Interest Rate</p>
                <p className="font-semibold text-gray-800">{offer.interestRate}% p.a.</p>
            </div>
        </div>
        <div className="mt-4 bg-green-50 text-progressive-green p-3 rounded-md text-sm font-medium flex items-start">
           <SparklesIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
           <span>{offer.specialOffer}</span>
        </div>
      </div>
       <Button fullWidth className="mt-6" onClick={onSelect}>Choose This Offer</Button>
    </div>
  </Card>
);


const OfferDiscoveryScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { appState, setSelectedOffer } = useAppContext();
  const [filter, setFilter] = useState('all');

  const eligibleAmount = appState.eligibleAmount ?? 7500000;
  
  // State for custom loan
  const [customAmount, setCustomAmount] = useState(Math.min(eligibleAmount, 2500000));
  const [customTenure, setCustomTenure] = useState(10); // in years
  const [customEmi, setCustomEmi] = useState(0);

  const offers: LoanOffer[] = [
    { id: 1, name: 'Elevate Aspire', amount: appState.eligibleAmount ? Math.min(appState.eligibleAmount, 4000000) : 4000000, emi: 35000, tenure: 15, interestRate: '8.5', collateral: false, moratorium: 'Course + 1 year', specialOffer: 'Special concession for girl students!', isPopular: true },
    { id: 2, name: 'Elevate Secure', amount: appState.eligibleAmount ? Math.min(appState.eligibleAmount, 7500000) : 7500000, emi: 55000, tenure: 20, interestRate: '7.9', collateral: true, moratorium: 'Course + 6 months', specialOffer: 'Lowest interest rate guarantee.', isPopular: false },
  ];
  
  // Calculate EMI for custom loan
  useEffect(() => {
      const rate = 8.5; // Use a default rate for the calculator
      setCustomEmi(calculateEmi(customAmount, rate, customTenure));
  }, [customAmount, customTenure]);

  const filteredOffers = offers.filter(offer => {
    if (filter === 'collateral') return offer.collateral;
    if (filter === 'no-collateral') return !offer.collateral;
    return true;
  });
  
  const handleSelectOffer = (offer: LoanOffer) => {
    setSelectedOffer(offer);
    setJourneyStep(JourneyStep.ApplicationFlow);
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800">Your Personalized Offers</h2>
      <p className="text-gray-600 mt-2 mb-6">Explore our standard offers or customize a loan that fits you perfectly.</p>
      
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h3 className="text-xl font-bold text-gray-800">Customize Your Loan</h3>
            <div className="text-right">
                <p className="text-sm text-gray-500">Your Monthly EMI</p>
                <p className="text-3xl font-bold text-capital-red">₹{customEmi.toLocaleString('en-IN')}</p>
            </div>
        </div>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-baseline">
                    <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
                    <span className="text-lg font-semibold text-gray-800">₹{customAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                    type="range"
                    id="customAmount"
                    min="100000"
                    max={eligibleAmount}
                    step="50000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-capital-red"
                    aria-label="Loan Amount Slider"
                    aria-valuetext={`₹${customAmount.toLocaleString('en-IN')}`}
                />
            </div>
            <div>
                <div className="flex justify-between items-baseline">
                    <label htmlFor="customTenure" className="block text-sm font-medium text-gray-700">Tenure</label>
                    <span className="text-lg font-semibold text-gray-800">{customTenure} years</span>
                </div>
                <input
                    type="range"
                    id="customTenure"
                    min="5"
                    max="15"
                    step="1"
                    value={customTenure}
                    onChange={(e) => setCustomTenure(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-capital-red"
                    aria-label="Loan Tenure Slider"
                    aria-valuetext={`${customTenure} years`}
                />
            </div>
        </div>
      </Card>


      <div className="flex space-x-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === 'all' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-700'}`}>All</button>
        <button onClick={() => setFilter('no-collateral')} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === 'no-collateral' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-700'}`}>Without Collateral</button>
        <button onClick={() => setFilter('collateral')} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === 'collateral' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-700'}`}>With Collateral</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOffers.map(offer => (
          <OfferCard key={offer.id} offer={offer} onSelect={() => handleSelectOffer(offer)} />
        ))}
      </div>
      {goBack && <div className="mt-6"><Button fullWidth variant="secondary" onClick={goBack}>Back</Button></div>}
    </div>
  );
};

export default OfferDiscoveryScreen;