import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JourneyStep, type UserProfile } from '../types';
import Button from './common/Button';
import { UploadIcon, AiIcon, FileCheckIcon, FileXIcon, CheckCircleIcon } from './common/Icons';
import { useAppContext } from '../App';
import { identifyDocumentType, extractInfoFromDocument, extractAadhaarInfoFromDocument, extractGenericInfoFromDocument } from '../services/geminiService';

type ProcessStatus = 'queue' | 'identifying' | 'extracting' | 'success' | 'error';
interface ProcessFile {
  id: string;
  file: File;
  status: ProcessStatus;
  type?: string;
  extractedData?: any;
  error?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const getStatusIndicator = (file: ProcessFile) => {
    const statusMap: Record<ProcessStatus, React.ReactNode> = {
        queue: <div className="text-xs text-gray-500">Queued</div>,
        identifying: <div className="flex items-center text-xs text-blue-600"><AiIcon className="w-4 h-4 mr-1 animate-spin-slow" /> Identifying...</div>,
        extracting: <div className="flex items-center text-xs text-blue-600"><AiIcon className="w-4 h-4 mr-1 animate-pulse" /> Extracting...</div>,
        success: <div className="flex items-center text-xs text-progressive-green"><FileCheckIcon className="w-4 h-4 mr-1" /> Success</div>,
        error: <div className="flex items-center text-xs text-capital-red"><FileXIcon className="w-4 h-4 mr-1" /> Error</div>,
    };
    return statusMap[file.status];
}

const ApplicationFlowScreen: React.FC<ScreenProps> = ({ setJourneyStep, goBack }) => {
  const { setProfile } = useAppContext();
  const [files, setFiles] = useState<ProcessFile[]>([]);
  const [aggregatedProfile, setAggregatedProfile] = useState<Partial<UserProfile>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFileStatus = useCallback((id: string, updates: Partial<ProcessFile>) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  useEffect(() => {
    // This effect handles the sequential processing of files.
    // It uses the isProcessing state as a lock to ensure only one file is processed at a time.
    
    // Don't start a new process if one is already running
    if (isProcessing) return;

    const fileToProcess = files.find(f => f.status === 'queue');

    // If no more files are in the queue, we check if all processing is finished.
    if (!fileToProcess) {
        const isFinished = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');
        if (isFinished) {
            // All files are processed, update the main context profile
            setProfile(aggregatedProfile);
        }
        return;
    }

    const processFile = async () => {
        setIsProcessing(true); // Lock to prevent other files from being processed
        const { id, file } = fileToProcess;

        try {
            const base64 = await fileToBase64(file);

            updateFileStatus(id, { status: 'identifying' });
            const docType = await identifyDocumentType(base64, file.type);
            updateFileStatus(id, { type: docType });

            updateFileStatus(id, { status: 'extracting' });
            
            let extractedData: any = {};
            let partialProfile: Partial<UserProfile> = {};

            switch (docType) {
                case 'PAN': {
                    const panData = await extractInfoFromDocument(base64, file.type);
                    partialProfile = { name: panData.name, pan: panData.pan };
                    extractedData = { Name: panData.name, PAN: panData.pan };
                    break;
                }
                case 'AADHAAR': {
                    const aadhaarData = await extractAadhaarInfoFromDocument(base64, file.type);
                    partialProfile = { name: aadhaarData.name };
                    extractedData = { Name: aadhaarData.name, Aadhaar: aadhaarData.aadhaar };
                    break;
                }
                case 'ADMISSION':
                case 'MARKSHEET': {
                    const eduData = await extractGenericInfoFromDocument(base64, file.type);
                    partialProfile = { institute: eduData.institute };
                    extractedData = { Institute: eduData.institute, Type: eduData.documentType };
                    break;
                }
                default:
                    throw new Error('Document type not recognized for extraction.');
            }
            
            // Aggregate profile data with PAN priority
            setAggregatedProfile(prev => {
                const newProfile = { ...prev };
                // PAN data always overwrites existing data
                if (docType === 'PAN') {
                    if (partialProfile.name) newProfile.name = partialProfile.name;
                    if (partialProfile.pan) newProfile.pan = partialProfile.pan;
                } else { // Other documents only fill fields if they are currently empty
                    if (partialProfile.name && !newProfile.name) newProfile.name = partialProfile.name;
                    if (partialProfile.institute && !newProfile.institute) newProfile.institute = partialProfile.institute;
                }
                return newProfile;
            });
            
            updateFileStatus(id, { status: 'success', extractedData });

        } catch (error: any) {
            updateFileStatus(id, { status: 'error', error: error.message || 'Analysis failed.' });
        } finally {
            setIsProcessing(false); // Release the lock for the next file
        }
    };

    processFile();

  }, [files, isProcessing, aggregatedProfile, setProfile, updateFileStatus]);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles: ProcessFile[] = Array.from(selectedFiles).map(file => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      status: 'queue',
    }));
    // Add new files, preventing duplicates
    setFiles(prev => [...prev.filter(pf => !newFiles.some(nf => nf.id === pf.id)), ...newFiles]);
  };
  
  const onDrag = (e: React.DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(over);
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    onDrag(e, false);
    handleFileChange(e.dataTransfer.files);
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800">Smart Apply</h2>
      <p className="text-gray-600 mt-2 mb-6">Let our AI assist you. Upload your documents, and we'll pre-fill your application.</p>
      
      <div 
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${isDragOver ? 'border-capital-red bg-red-50' : 'border-gray-300 bg-gray-50'}`}
          onDragOver={e => onDrag(e, true)}
          onDragEnter={e => onDrag(e, true)}
          onDragLeave={e => onDrag(e, false)}
          onDrop={onDrop}
      >
        <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h4 className="mt-4 text-lg font-semibold text-gray-700">Drag & Drop Your Documents</h4>
        <p className="text-gray-500 mt-1">or</p>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="mt-2" disabled={isProcessing}>
          { isProcessing ? 'Processing...' : 'Browse Files' }
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => handleFileChange(e.target.files)}
          className="hidden"
          multiple
          accept="image/png, image/jpeg, application/pdf"
        />
        <p className="text-xs text-gray-400 mt-4">Supports: PAN, Aadhaar, Admission Letter, Marksheets (PDF, PNG, JPG)</p>
      </div>

      {files.length > 0 && (
          <div className="space-y-3 mt-6">
              {files.map(file => (
                  <div key={file.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                      <div className="flex-grow pr-4 overflow-hidden">
                          <p className="font-medium text-gray-800 truncate">{file.file.name}</p>
                          <p className="text-xs text-gray-500">{file.type || '...'}</p>
                          {file.status === 'error' && <p className="text-xs text-red-500 truncate">{file.error}</p>}
                          {file.status === 'success' && file.extractedData && (
                              <div className="text-xs text-gray-600 truncate">
                                  {Object.entries(file.extractedData).map(([k,v]) => `${k}: ${v}`).join(', ')}
                              </div>
                          )}
                      </div>
                      <div className="flex-shrink-0 w-28 text-right">{getStatusIndicator(file)}</div>
                  </div>
              ))}
          </div>
      )}
      
      {allDone && Object.keys(aggregatedProfile).length > 0 && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-lg text-green-800 flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2" /> AI Analysis Complete!</h3>
          <p className="text-green-700 mt-2">We've extracted the following information. Your profile has been updated.</p>
          <ul className="mt-4 space-y-2 text-sm">
              {Object.entries(aggregatedProfile).map(([key, value]) => (
                  <li key={key} className="flex">
                      <span className="font-semibold text-gray-700 w-24 capitalize">{key}:</span>
                      <span className="text-gray-800">{String(value)}</span>
                  </li>
              ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-center space-x-4">
        {goBack && <Button variant="secondary" onClick={goBack}>Back</Button>}
        <Button fullWidth disabled={!allDone} onClick={() => setJourneyStep(JourneyStep.SanctionApproval)}>
          Submit Application
        </Button>
      </div>
    </div>
  );
};

export default ApplicationFlowScreen;