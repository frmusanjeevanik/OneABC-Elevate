
import React, { useState } from 'react';
import { JourneyStep, type ScreenProps, type LoanOffer } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { SparklesIcon } from './common/Icons';
import { useAppContext } from '../App';

const OfferCard = ({ offer, onSelect }: { offer: LoanOffer, onSelect: () => void }) => (
  <Card className="mb-4 !p-0 overflow-hidden border-2 border-transparent hover:border-capital-red">
    {offer.isPopular && (
      <div className="bg-warm-yellow text-yellow-900 px-4 py-1 text-sm font-bold flex items-center">
        <SparklesIcon className="w-4 h-4 mr-2" />
        Popular Choice
      </div>
    )}
    <div className="p-6">
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
        <div className="mt-4 bg-green-50 text-progressive-green p-2 rounded-md text-xs font-medium">
           {offer.specialOffer}
        </div>
         <Button fullWidth className="mt-6" onClick={onSelect}>Choose This Offer</Button>
    </div>
  </Card>
);


const OfferDiscoveryScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { appState, setSelectedOffer } = useAppContext();
  const [filter, setFilter] = useState('all');

  const offers: LoanOffer[] = [
    { id: 1, name: 'Elevate Aspire', amount: appState.eligibleAmount ? Math.min(appState.eligibleAmount, 4000000) : 4000000, emi: 35000, tenure: 15, interestRate: '8.5', collateral: false, moratorium: 'Course + 1 year', specialOffer: 'Special concession for girl students!', isPopular: true },
    { id: 2, name: 'Elevate Secure', amount: appState.eligibleAmount ? Math.min(appState.eligibleAmount, 7500000) : 7500000, emi: 55000, tenure: 20, interestRate: '7.9', collateral: true, moratorium: 'Course + 6 months', specialOffer: 'Lowest interest rate guarantee.', isPopular: false },
  ];

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
      <p className="text-gray-600 mt-2 mb-6">Transparent and jargon-free, just for you.</p>

      <div className="flex space-x-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === 'all' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-700'}`}>All</button>
        <button onClick={() => setFilter('no-collateral')} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === 'no-collateral' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-700'}`}>Without Collateral</button>
        <button onClick={() => setFilter('collateral')} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === 'collateral' ? 'bg-capital-red text-white' : 'bg-gray-200 text-gray-700'}`}>With Collateral</button>
      </div>

      <div>
        {filteredOffers.map(offer => (
          <OfferCard key={offer.id} offer={offer} onSelect={() => handleSelectOffer(offer)} />
        ))}
      </div>
      {goBack && <div className="mt-4"><Button fullWidth variant="secondary" onClick={goBack}>Back</Button></div>}
    </div>
  );
};

export default OfferDiscoveryScreen;
