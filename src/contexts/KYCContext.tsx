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

interface KYCVerification {
  level: number;
  submissionDate: Date;
  verificationDate?: Date;
  documents: KYCDocument[];
  status: KYCStatus;
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
  kycStatus: KYCStatus;
  kycSubmission: KYCSubmission | null;
  documents: KYCDocument[];
  submitKYC: (submission: Omit<KYCSubmission, 'userId' | 'status' | 'submissionDate' | 'verificationDate'>) => void;
  uploadDocument: (documentType: KYCDocumentType, file: File) => Promise<void>;
  deleteDocument: (documentType: KYCDocumentType) => void;
  isUploading: boolean;
  isLoading: boolean;
  verification: KYCVerification | null;
  getVerificationStatus: () => KYCStatus;
  submitKYCVerification: (data: any, files: File[]) => Promise<void>;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [kycStatus, setKYCStatus] = useState<KYCStatus>('not_submitted');
  const [kycSubmission, setKYCSubmission] = useState<KYCSubmission | null>(null);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState<KYCVerification | null>(null);

  useEffect(() => {
    if (user) {
      const savedKYC = localStorage.getItem(`kyc-${user.id}`);
      if (savedKYC) {
        const parsedKYC = JSON.parse(savedKYC);
        setKYCSubmission(parsedKYC);
        setKYCStatus(parsedKYC.status);
        setDocuments(parsedKYC.documents || []);
        
        if (parsedKYC.status === 'verified') {
          setVerification({
            level: 1,
            submissionDate: new Date(parsedKYC.submissionDate),
            verificationDate: parsedKYC.verificationDate ? new Date(parsedKYC.verificationDate) : undefined,
            documents: parsedKYC.documents || [],
            status: parsedKYC.status,
            depositLimits: {
              daily: 50000,
              weekly: 200000,
              monthly: 500000
            },
            withdrawalLimits: {
              daily: 25000,
              weekly: 100000,
              monthly: 300000
            }
          });
        }
      }
    }
  }, [user]);

  const getVerificationStatus = (): KYCStatus => {
    return kycStatus;
  };

  const submitKYC = (submission: Omit<KYCSubmission, 'userId' | 'status' | 'submissionDate' | 'verificationDate'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit KYC",
        variant: "destructive"
      });
      return;
    }

    const fullSubmission: KYCSubmission = {
      ...submission,
      userId: user.id,
      status: 'pending',
      submissionDate: new Date(),
      documents: documents
    };

    setKYCSubmission(fullSubmission);
    setKYCStatus('pending');
    
    localStorage.setItem(`kyc-${user.id}`, JSON.stringify(fullSubmission));

    toast({
      title: "KYC Submitted",
      description: "Your verification documents have been submitted for review"
    });

    setTimeout(() => {
      const updatedSubmission = { 
        ...fullSubmission, 
        status: 'verified' as KYCStatus,
        verificationDate: new Date()
      };
      setKYCSubmission(updatedSubmission);
      setKYCStatus('verified');
      localStorage.setItem(`kyc-${user.id}`, JSON.stringify(updatedSubmission));
      
      setVerification({
        level: 1,
        submissionDate: updatedSubmission.submissionDate,
        verificationDate: updatedSubmission.verificationDate,
        documents: updatedSubmission.documents,
        status: updatedSubmission.status,
        depositLimits: {
          daily: 50000,
          weekly: 200000,
          monthly: 500000
        },
        withdrawalLimits: {
          daily: 25000,
          weekly: 100000,
          monthly: 300000
        }
      });
      
      toast({
        title: "KYC Verified",
        description: "Your identity has been successfully verified"
      });
    }, 30000);
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedDocuments = documents.filter(doc => doc.type !== documentType);
      
      const newDocument: KYCDocument = {
        type: documentType,
        fileName: file.name,
        uploadDate: new Date(),
        status: 'pending'
      };
      
      const newDocuments = [...updatedDocuments, newDocument];
      setDocuments(newDocuments);
      
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

  const submitKYCVerification = async (data: any, files: File[]): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit verification",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const uploadedDocuments: KYCDocument[] = files.map((file, index) => ({
        type: index === 0 ? 'idCard' : index === 1 ? 'addressProof' : 'selfie',
        fileName: file.name,
        uploadDate: new Date(),
        status: 'pending'
      }));
      
      const newSubmission: KYCSubmission = {
        userId: user.id,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth.toISOString(),
        address: typeof data.address === 'object' ? 
          `${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.zipCode}` : 
          data.address,
        country: typeof data.address === 'object' ? data.address.country : data.country,
        idNumber: data.idNumber || '',
        status: 'pending',
        submissionDate: new Date(),
        documents: uploadedDocuments
      };
      
      setKYCSubmission(newSubmission);
      setKYCStatus('pending');
      setDocuments(uploadedDocuments);
      
      localStorage.setItem(`kyc-${user.id}`, JSON.stringify(newSubmission));
      
      toast({
        title: "Verification Submitted",
        description: "Your documents have been submitted for review"
      });
      
      setTimeout(() => {
        const verifiedSubmission = {
          ...newSubmission,
          status: 'verified' as KYCStatus,
          verificationDate: new Date()
        };
        
        setKYCSubmission(verifiedSubmission);
        setKYCStatus('verified');
        
        const newVerification: KYCVerification = {
          level: 1,
          submissionDate: verifiedSubmission.submissionDate,
          verificationDate: verifiedSubmission.verificationDate,
          documents: verifiedSubmission.documents,
          status: verifiedSubmission.status,
          depositLimits: {
            daily: 50000,
            weekly: 200000,
            monthly: 500000
          },
          withdrawalLimits: {
            daily: 25000,
            weekly: 100000,
            monthly: 300000
          }
        };
        
        setVerification(newVerification);
        localStorage.setItem(`kyc-${user.id}`, JSON.stringify(verifiedSubmission));
        
        toast({
          title: "Verification Approved",
          description: "Your identity has been successfully verified"
        });
      }, 30000);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
        isUploading,
        isLoading,
        verification,
        getVerificationStatus,
        submitKYCVerification
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
