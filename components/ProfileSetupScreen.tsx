

import React, { useState, useMemo, useEffect } from 'react';
import { JourneyStep, type ScreenProps, type UserProfile } from '../types';
import Button from './common/Button';
import ProgressBar from './common/ProgressBar';
import { useAppContext } from '../App';

const institutes = [
    "Indian Institute of Technology Bombay", "Indian Institute of Science Bangalore", "Indian Institute of Technology Delhi", "Indian Institute of Technology Madras", "Indian Institute of Management Ahmedabad", "Indian School of Business", "Harvard University", "Stanford University", "Massachusetts Institute of Technology (MIT)"
];

const degreeLevels = ["Bachelor's", "Master's", "PhD", "Diploma", "Certificate", "Doctorate"];

// Validation functions
const validateName = (name: string) => /^[a-zA-Z\s]{2,}$/.test(name);
const validatePAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateMobile = (mobile: string) => /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));


const ProfileSetupScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { appState, setProfile } = useAppContext();
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(appState.profile);
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string | undefined>>>({});
  const [currentSubStep, setCurrentSubStep] = useState(1);
  const totalSubSteps = 3;

  // Institute Search state
  const [searchTerm, setSearchTerm] = useState(appState.profile.institute || '');
  const [showDropdown, setShowDropdown] = useState(false);


  const filteredInstitutes = useMemo(() => 
    institutes.filter(inst => 
      inst.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]
  );

  useEffect(() => {
     setSearchTerm(profileData.institute || '');
  }, [profileData.institute])

  const validateStep = (step: number) => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};
    switch (step) {
      case 1:
        if (!profileData.name || !validateName(profileData.name)) newErrors.name = "Please enter a valid full name.";
        if (!profileData.pan || !validatePAN(profileData.pan.toUpperCase())) newErrors.pan = "Must follow the format ABCDE1234F.";
        break;
      case 2:
        if (!profileData.email || !validateEmail(profileData.email)) newErrors.email = "Please enter a valid email (e.g., name@example.com).";
        if (!profileData.mobile || !validateMobile(profileData.mobile)) newErrors.mobile = "Must be a 10-digit number starting with 6, 7, 8, or 9.";
        break;
      case 3:
        if (!profileData.degreeLevel) newErrors.degreeLevel = "Please select your degree level.";
        if (!profileData.course || profileData.course.length < 3) newErrors.course = "Please enter a valid field of study.";
        if (!profileData.institute) newErrors.institute = "Please select or enter an institute.";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: keyof UserProfile, value: string) => {
    let hasError = false;
    let errorMessage = '';

    switch(field) {
        case 'name':
            if (!validateName(value)) { hasError = true; errorMessage = "Please enter a valid full name."; }
            break;
        case 'pan':
            if (!validatePAN(value.toUpperCase())) { hasError = true; errorMessage = "Must follow the format ABCDE1234F."; }
            break;
        case 'email':
            if (!validateEmail(value)) { hasError = true; errorMessage = "Please enter a valid email (e.g., name@example.com)."; }
            break;
        case 'mobile':
            if (!validateMobile(value)) { hasError = true; errorMessage = "Must be a 10-digit number starting with 6, 7, 8, or 9."; }
            break;
        case 'degreeLevel':
            if (!value) { hasError = true; errorMessage = "Please select your degree level."; }
            break;
        case 'course':
            if (!value || value.length < 3) { hasError = true; errorMessage = "Please enter a valid field of study."; }
            break;
        case 'institute':
            if (!value) { hasError = true; errorMessage = "Please select or enter an institute."; }
            break;
    }

    setErrors(prev => ({ ...prev, [field]: hasError ? errorMessage : undefined }));
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const field = id as keyof UserProfile;
    let finalValue = value;
    if (field === 'pan') {
        finalValue = value.toUpperCase();
    }
    setProfileData(prev => ({ ...prev, [field]: finalValue }));
    validateField(field, finalValue);
  };

  const handleInstituteSelect = (institute: string) => {
    setProfileData(prev => ({ ...prev, institute }));
    setSearchTerm(institute);
    setShowDropdown(false);
    validateField('institute', institute);
  };
  
  const handleInstituteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setProfileData(prev => ({ ...prev, institute: value }));
      validateField('institute', value);
  }

  const handleNext = () => {
    if (!validateStep(currentSubStep)) return;

    setProfile(profileData);
    if (currentSubStep < totalSubSteps) {
      setCurrentSubStep(currentSubStep + 1);
    } else {
      setJourneyStep(JourneyStep.EligibilityCheck);
    }
  };
  
  const handlePrevious = () => {
      if (currentSubStep > 1) {
          setCurrentSubStep(currentSubStep - 1);
      } else if (goBack) {
          goBack();
      }
  }

  const isNextDisabled = useMemo(() => {
    const fieldsForStep: (keyof UserProfile)[] = [];
    switch(currentSubStep) {
        case 1: fieldsForStep.push('name', 'pan'); break;
        case 2: fieldsForStep.push('email', 'mobile'); break;
        case 3: fieldsForStep.push('degreeLevel', 'course', 'institute'); break;
    }
    return fieldsForStep.some(field => !profileData[field] || !!errors[field]);
  }, [profileData, errors, currentSubStep]);

  const renderFormFields = () => {
    switch (currentSubStep) {
      case 1:
        return (
            <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Details</h2>
                <p className="text-gray-600 mb-6">Let's start with the basics. We'll try to auto-fill where we can!</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name (as per PAN)</label>
                        <input type="text" id="name" value={profileData.name || ''} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm`} />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="pan" className="block text-sm font-medium text-gray-700">PAN Number</label>
                        <input type="text" id="pan" value={profileData.pan || ''} onChange={handleChange} maxLength={10} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.pan ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm uppercase`} />
                         {errors.pan && <p className="text-xs text-red-600 mt-1">{errors.pan}</p>}
                    </div>
                </div>
            </>
        );
      case 2:
        return (
            <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Information</h2>
                <p className="text-gray-600 mb-6">How can we reach you?</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" id="email" value={profileData.email || ''} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm`} />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input type="tel" id="mobile" value={profileData.mobile || ''} onChange={handleChange} maxLength={10} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm`} />
                         {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
                    </div>
                </div>
            </>
        );
      case 3:
      default:
        return (
            <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Details</h2>
                <p className="text-gray-600 mb-6">Tell us about your dream course.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="degreeLevel" className="block text-sm font-medium text-gray-700">Degree Level</label>
                        <select id="degreeLevel" value={profileData.degreeLevel || ''} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.degreeLevel ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm`}>
                            <option value="" disabled>Select Degree</option>
                            {degreeLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                        {errors.degreeLevel && <p className="text-xs text-red-600 mt-1">{errors.degreeLevel}</p>}
                    </div>
                    <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700">Field of Study</label>
                        <input type="text" id="course" placeholder="e.g., Computer Science" value={profileData.course || ''} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.course ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm`} />
                        {errors.course && <p className="text-xs text-red-600 mt-1">{errors.course}</p>}
                    </div>
                     <div className="relative">
                        <label htmlFor="institute" className="block text-sm font-medium text-gray-700">Institute Name</label>
                        <input 
                            type="text" 
                            id="institute" 
                            placeholder="e.g., University of Tomorrow" 
                            value={searchTerm} 
                            onChange={handleInstituteChange}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // delay to allow click
                            autoComplete="off"
                            className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.institute ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-capital-red focus:border-capital-red sm:text-sm`} />
                        {showDropdown && filteredInstitutes.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {filteredInstitutes.map(inst => (
                                    <li key={inst} onMouseDown={() => handleInstituteSelect(inst)} className="px-3 py-2 cursor-pointer hover:bg-gray-100">
                                        {inst}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {errors.institute && <p className="text-xs text-red-600 mt-1">{errors.institute}</p>}
                    </div>
                </div>
            </>
        );
    }
  };


  return (
    <div className="animate-fade-in-up space-y-4">
      <ProgressBar currentStep={currentSubStep} totalSteps={totalSubSteps} label="Profile Setup" />
      <div className="min-h-[300px]">
          {renderFormFields()}
      </div>
      <div className="flex justify-between items-center pt-4">
         <Button variant="secondary" onClick={handlePrevious}>
            Back
        </Button>
        <Button onClick={handleNext} disabled={isNextDisabled}>
          {currentSubStep < totalSubSteps ? 'Next' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;