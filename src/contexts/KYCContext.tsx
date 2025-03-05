
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

type KYCStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';
type KYCDocumentType = "idCard" | "passport" | "driverLicense" | "addressProof" | "selfie";

interface KYCDocument {
  type: KYCDocumentType;
  fileName: string;
  uploadDate: Date;
  status: string;
}

interface KYCSubmission {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  country: string;
  idNumber: string;
  documents: KYCDocument[];
  status: KYCStatus;
  submissionDate: Date;
  verificationDate?: Date;
}

interface KYCContextType {
  kycStatus: KYCStatus;
  kycSubmission: KYCSubmission | null;
  documents: KYCDocument[];
  submitKYC: (submission: Omit<KYCSubmission, 'userId' | 'status' | 'submissionDate' | 'verificationDate'>) => void;
  uploadDocument: (documentType: KYCDocumentType, file: File) => Promise<void>;
  deleteDocument: (documentType: KYCDocumentType) => void;
  isUploading: boolean;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [kycStatus, setKYCStatus] = useState<KYCStatus>('not_submitted');
  const [kycSubmission, setKYCSubmission] = useState<KYCSubmission | null>(null);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load KYC status from localStorage when user logs in
  useEffect(() => {
    if (user) {
      const savedKYC = localStorage.getItem(`kyc-${user.id}`);
      if (savedKYC) {
        const parsedKYC = JSON.parse(savedKYC);
        setKYCSubmission(parsedKYC);
        setKYCStatus(parsedKYC.status);
        setDocuments(parsedKYC.documents || []);
      }
    }
  }, [user]);

  const submitKYC = (submission: Omit<KYCSubmission, 'userId' | 'status' | 'submissionDate' | 'verificationDate'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit KYC",
        variant: "destructive"
      });
      return;
    }

    // Create full submission with metadata
    const fullSubmission: KYCSubmission = {
      ...submission,
      userId: user.id,
      status: 'pending',
      submissionDate: new Date(),
      documents: documents
    };

    // In a real app, we would send this to an API
    // For now, we'll simulate storing it locally
    setKYCSubmission(fullSubmission);
    setKYCStatus('pending');
    
    // Store in localStorage for persistence
    localStorage.setItem(`kyc-${user.id}`, JSON.stringify(fullSubmission));

    toast({
      title: "KYC Submitted",
      description: "Your verification documents have been submitted for review"
    });

    // Simulate verification process (would be done on the backend in a real app)
    setTimeout(() => {
      const updatedSubmission = { 
        ...fullSubmission, 
        status: 'verified',
        verificationDate: new Date()
      };
      setKYCSubmission(updatedSubmission);
      setKYCStatus('verified');
      localStorage.setItem(`kyc-${user.id}`, JSON.stringify(updatedSubmission));
      
      toast({
        title: "KYC Verified",
        description: "Your identity has been successfully verified"
      });
    }, 30000); // 30 seconds for demo purposes
  };

  const uploadDocument = async (documentType: KYCDocumentType, file: File): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload documents",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // In a real app, we would upload to a storage service like Firebase Storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Remove any existing document of the same type
      const updatedDocuments = documents.filter(doc => doc.type !== documentType);
      
      // Add the new document
      const newDocument: KYCDocument = {
        type: documentType,
        fileName: file.name,
        uploadDate: new Date(),
        status: 'pending'
      };
      
      const newDocuments = [...updatedDocuments, newDocument];
      setDocuments(newDocuments);
      
      // If we have an existing submission, update it
      if (kycSubmission) {
        const updatedSubmission = {
          ...kycSubmission,
          documents: newDocuments
        };
        setKYCSubmission(updatedSubmission);
        localStorage.setItem(`kyc-${user.id}`, JSON.stringify(updatedSubmission));
      }

      toast({
        title: "Document Uploaded",
        description: `${file.name} has been successfully uploaded`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = (documentType: KYCDocumentType) => {
    if (!user) return;
    
    const updatedDocuments = documents.filter(doc => doc.type !== documentType);
    setDocuments(updatedDocuments);
    
    // If we have an existing submission, update it
    if (kycSubmission) {
      const updatedSubmission = {
        ...kycSubmission,
        documents: updatedDocuments
      };
      setKYCSubmission(updatedSubmission);
      localStorage.setItem(`kyc-${user.id}`, JSON.stringify(updatedSubmission));
    }

    toast({
      title: "Document Deleted",
      description: "The document has been removed"
    });
  };

  return (
    <KYCContext.Provider
      value={{
        kycStatus,
        kycSubmission,
        documents,
        submitKYC,
        uploadDocument,
        deleteDocument,
        isUploading
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};
