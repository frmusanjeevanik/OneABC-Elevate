
import React, { useState, useRef } from 'react';
import { JourneyStep, type ScreenProps, type Document as AppDocument } from '../types';
import Button from './common/Button';
import { UploadIcon, CheckCircleIcon } from './common/Icons';
import { useAppContext } from '../App';
import { extractInfoFromDocument, extractAadhaarInfoFromDocument, extractGenericInfoFromDocument } from '../services/geminiService';

const ApplicationFlowScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { appState, updateDocument, setProfile } = useAppContext();
  const { documents } = appState;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentlyUploadingId, setCurrentlyUploadingId] = useState<string | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
              const result = reader.result as string;
              // remove the data url prefix
              const base64 = result.split(',')[1];
              resolve(base64);
          };
          reader.onerror = error => reject(error);
      });
  };

  const startProgressSimulation = (docId: string) => {
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = window.setInterval(() => {
        const doc = appState.documents.find(d => d.id === docId);
        if (doc && doc.progress !== undefined && doc.progress < 95) {
            const increment = Math.random() * 10;
            const newProgress = Math.min(doc.progress + increment, 95);
            updateDocument(docId, { progress: newProgress });
        } else {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
    }, 200);
  };

  const stopProgressSimulation = () => {
      if(progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
      }
  }


  const handleFileSelect = (id: string) => {
    setCurrentlyUploadingId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const docId = currentlyUploadingId;
    
    if (file && docId) {
      // Client-side validation
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        updateDocument(docId, { status: 'error', error: 'Invalid file type. Please use JPG, PNG, or PDF.' });
        if(fileInputRef.current) fileInputRef.current.value = "";
        setCurrentlyUploadingId(null);
        return;
      }

      if (file.size > maxSize) {
        updateDocument(docId, { status: 'error', error: 'File is too large. Maximum size is 5MB.' });
        if(fileInputRef.current) fileInputRef.current.value = "";
        setCurrentlyUploadingId(null);
        return;
      }
      
      updateDocument(docId, { status: 'uploading', file, error: undefined, progress: 0, extractedData: undefined });
      startProgressSimulation(docId);
      
      try {
        const base64Image = await fileToBase64(file);
        let extractedData: Record<string, string> = {};

        switch (docId) {
            case 'pan': {
                const data = await extractInfoFromDocument(base64Image, file.type);
                setProfile({ name: data.name, pan: data.pan });
                extractedData = { "Name": data.name, "PAN": data.pan };
                break;
            }
            case 'aadhaar': {
                const data = await extractAadhaarInfoFromDocument(base64Image, file.type);
                extractedData = { "Name": data.name, "Aadhaar Number": data.aadhaar };
                break;
            }
            case 'admission':
            case 'marksheet': {
                const data = await extractGenericInfoFromDocument(base64Image, file.type);
                extractedData = { "Document Type": data.documentType, "Institute": data.institute };
                break;
            }
        }
        
        stopProgressSimulation();
        updateDocument(docId, { status: 'uploaded', progress: 100, extractedData });

      } catch(error: any) {
        console.error(error);
        stopProgressSimulation();
        const errorMessage = error.message || 'Could not read details. Please re-upload a clearer image.';
        updateDocument(docId, { status: 'error', error: errorMessage, progress: 0 });
      }
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setCurrentlyUploadingId(null);
  };


  const allDocsUploaded = documents.every(doc => doc.status === 'uploaded');

  // Define status-specific styles for better visual feedback
  const getStatusStyles = (status: AppDocument['status']) => {
    switch (status) {
      case 'uploading':
        return {
          container: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-700',
          progressBg: 'bg-blue-500',
        };
      case 'uploaded':
        return {
          container: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-progressive-green',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          textColor: 'text-capital-red',
          actionColor: 'text-capital-red',
        };
      case 'pending':
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-500',
          actionColor: 'text-gray-700',
        };
    }
  };


  return (
    <div className="animate-fade-in-up">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, application/pdf" />
      <h2 className="text-2xl font-bold text-gray-800">Complete Your Application</h2>
      <p className="text-gray-600 mt-2 mb-6">Just a few more steps. We'll guide you through it.</p>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Upload Documents</h3>
        {documents.map((doc: AppDocument) => {
            const styles = getStatusStyles(doc.status);
            return (
                <div key={doc.id} className={`${styles.container} p-4 rounded-lg flex items-center justify-between border transition-colors duration-300 ease-in-out`}>
                    <div className="flex-grow pr-4 overflow-hidden">
                      <p className="font-medium text-gray-800">{doc.name}</p>
                      
                      {/* Status specific content */}
                      {doc.status === 'uploading' && (
                          <div className="w-full mt-1">
                              <p className={`text-xs font-medium ${styles.textColor}`}>
                                  {`Analyzing... ${Math.round(doc.progress ?? 0)}%`}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                    className={`${styles.progressBg} h-2 rounded-full transition-all duration-300 ease-linear`}
                                    style={{ width: `${doc.progress ?? 0}%` }}
                                ></div>
                              </div>
                          </div>
                      )}

                      {doc.status === 'uploaded' && (
                          <>
                              <div className="flex items-center text-xs text-green-700 mt-1.5">
                                  <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                  <span className="font-semibold">Verified Details:</span>
                              </div>
                              {doc.extractedData && Object.keys(doc.extractedData).length > 0 ? (
                                  <div className="text-xs mt-1 space-y-0.5 pl-5">
                                      {Object.entries(doc.extractedData).map(([key, value]) => (
                                          <p key={key} className="text-gray-700 truncate">
                                              <span className="font-medium">{key}:</span> {value}
                                          </p>
                                      ))}
                                  </div>
                              ) : (
                                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{doc.file?.name}</p>
                              )}
                          </>
                      )}
                      
                      {doc.status === 'error' && (
                          <p className={`text-xs mt-1 ${styles.textColor}`}>{doc.error}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-20 text-right">
                        {(doc.status === 'pending' || doc.status === 'error') && (
                            <button onClick={() => handleFileSelect(doc.id)} className={`inline-flex items-center space-x-2 ${styles.actionColor} font-semibold text-sm`}>
                                <UploadIcon className="w-5 h-5" />
                                <span>{doc.status === 'error' ? 'Retry' : 'Upload'}</span>
                            </button>
                        )}
                        {doc.status === 'uploading' && (
                            <div className="flex justify-center items-center h-full">
                                <svg className={`animate-spin h-5 w-5 ${styles.textColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        {doc.status === 'uploaded' && <div className="flex justify-end"><CheckCircleIcon className={`w-6 h-6 ${styles.iconColor}`} /></div>}
                    </div>
                </div>
            )
        })}
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-gray-700">Digital Signature & eMandate</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">Once all documents are approved, you can complete the e-signature.</p>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-600">{allDocsUploaded ? "Ready for e-signature!" : "Pending document uploads"}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-4">
        {goBack && <Button variant="secondary" onClick={goBack}>Back</Button>}
        <Button fullWidth disabled={!allDocsUploaded} onClick={() => setJourneyStep(JourneyStep.SanctionApproval)}>
          Submit Application
        </Button>
      </div>
    </div>
  );
};

export default ApplicationFlowScreen;