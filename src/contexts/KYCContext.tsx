
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface KYCDocument {
  type: 'idCard' | 'passport' | 'driverLicense' | 'addressProof' | 'selfie';
  fileName: string;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface UserVerification {
  userId: string;
  status: VerificationStatus;
  level: 1 | 2 | 3; // Different levels of verification with different limits
  fullName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  documents: KYCDocument[];
  submissionDate?: Date;
  verificationDate?: Date;
  depositLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  withdrawalLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface KYCContextType {
  verification: UserVerification | null;
  isLoading: boolean;
  submitKYCVerification: (data: Partial<UserVerification>, documents: File[]) => Promise<void>;
  cancelVerification: () => Promise<void>;
  getVerificationStatus: () => VerificationStatus;
  uploadDocument: (type: KYCDocument['type'], file: File) => Promise<void>;
  removeDocument: (documentId: string) => Promise<void>;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load verification data from local storage or server
  useEffect(() => {
    if (user) {
      // In a real implementation, this would be a server call
      const savedVerification = localStorage.getItem(`betster-kyc-${user.id}`);
      
      if (savedVerification) {
        setVerification(JSON.parse(savedVerification));
      } else {
        // Initialize with default verification state
        const defaultVerification: UserVerification = {
          userId: user.id,
          status: 'unverified',
          level: 1,
          documents: [],
          depositLimits: {
            daily: 1000,
            weekly: 5000,
            monthly: 20000
          },
          withdrawalLimits: {
            daily: 1000,
            weekly: 5000,
            monthly: 20000
          }
        };
        setVerification(defaultVerification);
        localStorage.setItem(`betster-kyc-${user.id}`, JSON.stringify(defaultVerification));
      }
    } else {
      setVerification(null);
    }
  }, [user]);

  const submitKYCVerification = async (data: Partial<UserVerification>, documents: File[]) => {
    if (!user || !verification) return;
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate the data
      if (!data.fullName || !data.dateOfBirth || !data.nationality || !data.address) {
        throw new Error("Missing required verification information");
      }
      
      if (documents.length < 2) {
        throw new Error("At least 2 verification documents are required");
      }
      
      // In a real implementation, you would upload the documents to your server
      // and update the verification status based on the server response
      
      const updatedVerification: UserVerification = {
        ...verification,
        ...data,
        status: 'pending',
        submissionDate: new Date(),
        documents: [
          ...verification.documents,
          ...documents.map((file, index) => ({
            type: index === 0 ? 'idCard' : index === 1 ? 'addressProof' : 'selfie',
            fileName: file.name,
            uploadDate: new Date(),
            status: 'pending'
          }))
        ]
      };
      
      setVerification(updatedVerification);
      localStorage.setItem(`betster-kyc-${user.id}`, JSON.stringify(updatedVerification));
      
      toast({
        title: "Verification Submitted",
        description: "Your KYC verification has been submitted and is pending review.",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Something went wrong with your verification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelVerification = async () => {
    if (!user || !verification) return;
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verification.status !== 'pending') {
        throw new Error("You can only cancel pending verifications");
      }
      
      const updatedVerification: UserVerification = {
        ...verification,
        status: 'unverified',
      };
      
      setVerification(updatedVerification);
      localStorage.setItem(`betster-kyc-${user.id}`, JSON.stringify(updatedVerification));
      
      toast({
        title: "Verification Cancelled",
        description: "Your KYC verification request has been cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Something went wrong with cancelling your verification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationStatus = (): VerificationStatus => {
    return verification?.status || 'unverified';
  };

  const uploadDocument = async (type: KYCDocument['type'], file: File) => {
    if (!user || !verification) return;
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would upload the file to your server
      // and update the document status based on the server response
      
      const newDocument: KYCDocument = {
        type,
        fileName: file.name,
        uploadDate: new Date(),
        status: 'pending'
      };
      
      const updatedVerification: UserVerification = {
        ...verification,
        documents: [...verification.documents, newDocument]
      };
      
      setVerification(updatedVerification);
      localStorage.setItem(`betster-kyc-${user.id}`, JSON.stringify(updatedVerification));
      
      toast({
        title: "Document Uploaded",
        description: `Your ${type} document has been uploaded and is pending review.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong with your document upload.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeDocument = async (documentId: string) => {
    if (!user || !verification) return;
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would delete the document from your server
      
      const updatedVerification: UserVerification = {
        ...verification,
        documents: verification.documents.filter((doc, index) => index.toString() !== documentId)
      };
      
      setVerification(updatedVerification);
      localStorage.setItem(`betster-kyc-${user.id}`, JSON.stringify(updatedVerification));
      
      toast({
        title: "Document Removed",
        description: "Your document has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Removal Failed",
        description: error.message || "Something went wrong with removing your document.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KYCContext.Provider
      value={{
        verification,
        isLoading,
        submitKYCVerification,
        cancelVerification,
        getVerificationStatus,
        uploadDocument,
        removeDocument,
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
