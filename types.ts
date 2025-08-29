import type { Dispatch, SetStateAction } from 'react';

export enum JourneyStep {
  Onboarding,
  ProfileSetup,
  EligibilityCheck,
  OfferDiscovery,
  ApplicationFlow,
  SanctionApproval,
  DisbursalExperience,
  RepaymentPlanning,
  Dashboard,
}

export interface ScreenProps {
  setJourneyStep: (step: JourneyStep) => void;
  goBack?: () => void;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface UserProfile {
  name: string;
  pan: string;
  email: string;
  mobile: string;
  degreeLevel: string;
  course: string;
  institute: string;
}

export interface EligibilityDetails {
  courseFee: number | string;
  instituteTier: string;
  parentIncome: number | string;
}

export interface LoanOffer {
  id: number;
  name: string;
  amount: number;
  emi: number;
  tenure: number;
  interestRate: string;
  collateral: boolean;
  moratorium: string;
  specialOffer: string;
  isPopular: boolean;
}

export interface Document {
  id: string;
  name: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  file?: File;
  error?: string;
  progress?: number;
  extractedData?: Record<string, string>;
}

export interface AppState {
  profile: Partial<UserProfile>;
  eligibility: Partial<EligibilityDetails>;
  eligibleAmount: number | null;
  selectedOffer: LoanOffer | null;
  documents: Document[];
}

export interface AppContextType {
  appState: AppState;
  setProfile: (profile: Partial<UserProfile>) => void;
  setEligibilityDetails: (details: Partial<EligibilityDetails>) => void;
  setEligibleAmount: (amount: number | null) => void;
  setSelectedOffer: (offer: LoanOffer | null) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  reset: () => void;
}