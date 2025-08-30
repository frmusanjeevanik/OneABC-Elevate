import React, { useState, createContext, useContext, ReactNode, useRef } from 'react';
import { JourneyStep, type AppState, type AppContextType, type Document, type LoanOffer, type UserProfile, type EligibilityDetails, ChatMessage } from './types';
import OnboardingScreen from './components/OnboardingScreen';
import ProfileSetupScreen from './components/ProfileSetupScreen';
import EligibilityCheckScreen from './components/EligibilityCheckScreen';
import OfferDiscoveryScreen from './components/OfferDiscoveryScreen';
import ApplicationFlowScreen from './components/ApplicationFlowScreen';
import SanctionApprovalScreen from './components/SanctionApprovalScreen';
import DisbursalExperienceScreen from './components/DisbursalExperienceScreen';
import RepaymentPlanningScreen from './components/RepaymentPlanningScreen';
import DashboardScreen from './components/DashboardScreen';
import Header from './components/common/Header';


const initialDocuments: Document[] = [
    { id: 'pan', name: 'PAN Card', status: 'pending' },
    { id: 'aadhaar', name: 'Aadhaar Card', status: 'pending' },
    { id: 'admission', name: 'Admission Letter', status: 'pending' },
    { id: 'marksheet', name: '12th Marksheet', status: 'pending' },
];

const initialState: AppState = {
  profile: {
    name: '',
    pan: '',
    email: '',
    mobile: '',
    degreeLevel: "Master's",
    course: 'Computer Science',
    institute: ''
  },
  eligibility: {
    courseFee: '',
    instituteTier: 'Tier 1 (IIT, IIM, ISB etc.)',
    parentIncome: '',
  },
  eligibleAmount: null,
  selectedOffer: null,
  documents: initialDocuments,
  chatHistory: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initialState);

  const setProfile = (profile: Partial<UserProfile>) => {
    setAppState(prev => ({ ...prev, profile: { ...prev.profile, ...profile } }));
  };
  
  const setEligibilityDetails = (details: Partial<EligibilityDetails>) => {
    setAppState(prev => ({ ...prev, eligibility: { ...prev.eligibility, ...details } }));
  };

  const setEligibleAmount = (amount: number | null) => {
    setAppState(prev => ({ ...prev, eligibleAmount: amount }));
  };

  const setSelectedOffer = (offer: LoanOffer | null) => {
    setAppState(prev => ({ ...prev, selectedOffer: offer }));
  };
  
  const updateDocument = (id: string, updates: Partial<Document>) => {
    setAppState(prev => {
        const docToUpdate = prev.documents.find(doc => doc.id === id);
        // Revoke old object URL if it exists and a new one is being provided or a new file is uploaded
        if (docToUpdate?.previewUrl && ('previewUrl' in updates || 'file' in updates)) {
            URL.revokeObjectURL(docToUpdate.previewUrl);
        }

        return {
            ...prev,
            documents: prev.documents.map(doc => doc.id === id ? {...doc, ...updates} : doc)
        };
    })
  };

  const setChatHistory = (history: ChatMessage[]) => {
    setAppState(prev => ({ ...prev, chatHistory: history }));
  };

  const reset = () => {
      // Also revoke all URLs on a full application reset to prevent memory leaks
      appState.documents.forEach(doc => {
          if (doc.previewUrl) {
              URL.revokeObjectURL(doc.previewUrl);
          }
      });
      setAppState(initialState);
  };

  return (
    <AppContext.Provider value={{ appState, setProfile, setEligibilityDetails, setEligibleAmount, setSelectedOffer, updateDocument, setChatHistory, reset }}>
      {children}
    </AppContext.Provider>
  );
};

const App: React.FC = () => {
  const [journeyStep, setJourneyStep] = useState<JourneyStep>(JourneyStep.Onboarding);
  const history = useRef<JourneyStep[]>([]);
  
  const setStep = (step: JourneyStep) => {
      history.current.push(journeyStep);
      setJourneyStep(step);
  };

  const goBack = () => {
      const prevStep = history.current.pop();
      if (prevStep !== undefined) {
          setJourneyStep(prevStep);
      } else {
          setJourneyStep(JourneyStep.Onboarding); // Fallback to a known state
      }
  };
  
  const goHome = () => {
      history.current = [];
      setJourneyStep(JourneyStep.Onboarding);
  };
  
  const renderScreen = () => {
    switch (journeyStep) {
      case JourneyStep.Onboarding:
        return <OnboardingScreen setJourneyStep={setStep} />;
      case JourneyStep.ProfileSetup:
        return <ProfileSetupScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.EligibilityCheck:
        return <EligibilityCheckScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.OfferDiscovery:
        return <OfferDiscoveryScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.ApplicationFlow:
        return <ApplicationFlowScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.SanctionApproval:
        return <SanctionApprovalScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.DisbursalExperience:
        return <DisbursalExperienceScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.RepaymentPlanning:
        return <RepaymentPlanningScreen setJourneyStep={setStep} goBack={goBack} />;
      case JourneyStep.Dashboard:
        return <DashboardScreen setJourneyStep={setStep} />;
      default:
        return <OnboardingScreen setJourneyStep={setStep} />;
    }
  };

  const showHeader = journeyStep !== JourneyStep.Onboarding;
  const showBackButton = journeyStep !== JourneyStep.Onboarding && journeyStep !== JourneyStep.Dashboard;

  return (
    <AppProvider>
        <div className="bg-gray-100 font-sans antialiased text-gray-900 min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-lg flex flex-col">
                {showHeader && <Header showBackButton={showBackButton} goBack={goBack} goHome={goHome} />}
                <main className="p-6 flex-grow flex flex-col">
                    {renderScreen()}
                </main>
            </div>
        </div>
    </AppProvider>
  );
};

export default App;