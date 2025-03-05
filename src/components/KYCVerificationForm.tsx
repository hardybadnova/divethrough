
import React, { useState } from 'react';
import { useKYC } from '@/contexts/KYCContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Info } from 'lucide-react';

const KYCVerificationForm = () => {
  const { user } = useAuth();
  const { verification, isLoading, submitKYCVerification, getVerificationStatus } = useKYC();
  
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [nationality, setNationality] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [openCalendar, setOpenCalendar] = useState(false);

  const verificationStatus = getVerificationStatus();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG or PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setDocuments(prev => {
        const newDocs = [...prev];
        if (type === 'idCard') newDocs[0] = file;
        else if (type === 'addressProof') newDocs[1] = file;
        else if (type === 'selfie') newDocs[2] = file;
        return newDocs;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateOfBirth) {
      toast({
        title: "Missing Date of Birth",
        description: "Please select your date of birth",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is at least 18 years old
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      toast({
        title: "Age Restriction",
        description: "You must be at least 18 years old to use this platform",
        variant: "destructive",
      });
      return;
    }
    
    // Check if all required documents are uploaded
    if (documents.length < 2 || !documents[0] || !documents[1]) {
      toast({
        title: "Missing Documents",
        description: "Please upload both ID and address proof documents",
        variant: "destructive",
      });
      return;
    }
    
    await submitKYCVerification({
      fullName,
      dateOfBirth,
      nationality,
      address: {
        street,
        city,
        state,
        country,
        zipCode,
      }
    }, documents);
  };

  if (verificationStatus === 'pending') {
    return (
      <div className="space-y-4 p-4 rounded-xl premium-glass">
        <Alert className="bg-amber-500/20 border-amber-500/40">
          <Info className="h-4 w-4" />
          <AlertTitle>Verification in Progress</AlertTitle>
          <AlertDescription>
            Your KYC verification is currently being reviewed. This process typically takes 24-48 hours.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-betster-300">
          <p>Submitted on: {verification?.submissionDate ? format(new Date(verification.submissionDate), 'PPP') : 'N/A'}</p>
          <p>Documents: {verification?.documents.length || 0} uploaded</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <div className="space-y-4 p-4 rounded-xl premium-glass">
        <Alert className="bg-green-500/20 border-green-500/40">
          <Info className="h-4 w-4" />
          <AlertTitle>Verification Complete</AlertTitle>
          <AlertDescription>
            Your account is fully verified. You now have access to all features.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-betster-300">
          <p>Verified on: {verification?.verificationDate ? format(new Date(verification.verificationDate), 'PPP') : 'N/A'}</p>
          <p>Verification level: {verification?.level || 1}</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="space-y-4 p-4 rounded-xl premium-glass">
        <Alert className="bg-red-500/20 border-red-500/40">
          <Info className="h-4 w-4" />
          <AlertTitle>Verification Rejected</AlertTitle>
          <AlertDescription>
            Your KYC verification was rejected. Please review the feedback and resubmit.
          </AlertDescription>
        </Alert>
        
        <div className="p-3 bg-black/30 rounded-lg text-sm text-betster-300 mt-2">
          <p className="font-medium mb-1">Rejection reason:</p>
          <p>The provided documents were unclear or did not match the submitted information. Please ensure that all documents are clearly visible and match your submitted details.</p>
        </div>
        
        <Button
          className="w-full mt-4"
          onClick={() => {
            // Reset verification status to allow resubmission
            if (verification) {
              const updatedVerification = { ...verification, status: 'unverified' };
              localStorage.setItem(`betster-kyc-${user?.id}`, JSON.stringify(updatedVerification));
              window.location.reload();
            }
          }}
        >
          Resubmit Verification
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 rounded-xl premium-glass">
      <h2 className="text-xl font-bold tracking-tight text-gradient">KYC Verification</h2>
      <p className="text-sm text-betster-300">
        To comply with regulations and protect our users, we need to verify your identity. 
        This information will be kept secure and confidential.
      </p>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="font-medium">Personal Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (as on ID document)</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Enter your full legal name"
            className="bg-black/50 border-betster-700/50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-black/50 border-betster-700/50"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, 'PPP') : "Select your date of birth"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={(date) => {
                  setDateOfBirth(date);
                  setOpenCalendar(false);
                }}
                disabled={(date) => {
                  // Disable future dates and dates more than 100 years ago
                  const today = new Date();
                  const hundredYearsAgo = new Date();
                  hundredYearsAgo.setFullYear(today.getFullYear() - 100);
                  return date > today || date < hundredYearsAgo;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            required
            placeholder="Enter your nationality"
            className="bg-black/50 border-betster-700/50"
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="font-medium">Address Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
            placeholder="Enter your street address"
            className="bg-black/50 border-betster-700/50"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="City"
              className="bg-black/50 border-betster-700/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              placeholder="State/Province"
              className="bg-black/50 border-betster-700/50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              placeholder="Country"
              className="bg-black/50 border-betster-700/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zipCode">Postal/Zip Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              placeholder="Postal/Zip Code"
              className="bg-black/50 border-betster-700/50"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="font-medium">Verification Documents</h3>
        <p className="text-sm text-betster-300">
          Please upload clear photos or scanned copies of the following documents.
          All documents must be valid and not expired.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label className="block mb-2" htmlFor="idCard">ID Card / Passport / Driver's License (Required)</Label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <Input
                  id="idCard"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'idCard')}
                  className="hidden"
                />
                <Label 
                  htmlFor="idCard" 
                  className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-betster-700/50 rounded-md cursor-pointer hover:bg-betster-900/30"
                >
                  <Upload className="h-4 w-4" />
                  <span>{documents[0]?.name || "Upload ID Document"}</span>
                </Label>
              </div>
              {documents[0] && (
                <span className="text-xs text-green-400 whitespace-nowrap">File selected</span>
              )}
            </div>
            <p className="text-xs text-betster-400 mt-1">JPG, PNG or PDF, max 5MB</p>
          </div>
          
          <div>
            <Label className="block mb-2" htmlFor="addressProof">Proof of Address (Required)</Label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <Input
                  id="addressProof"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'addressProof')}
                  className="hidden"
                />
                <Label 
                  htmlFor="addressProof" 
                  className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-betster-700/50 rounded-md cursor-pointer hover:bg-betster-900/30"
                >
                  <Upload className="h-4 w-4" />
                  <span>{documents[1]?.name || "Upload Proof of Address"}</span>
                </Label>
              </div>
              {documents[1] && (
                <span className="text-xs text-green-400 whitespace-nowrap">File selected</span>
              )}
            </div>
            <p className="text-xs text-betster-400 mt-1">Utility bill, bank statement, etc. (not older than 3 months)</p>
          </div>
          
          <div>
            <Label className="block mb-2" htmlFor="selfie">Selfie with ID (Optional)</Label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <Input
                  id="selfie"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  className="hidden"
                />
                <Label 
                  htmlFor="selfie" 
                  className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-betster-700/50 rounded-md cursor-pointer hover:bg-betster-900/30"
                >
                  <Upload className="h-4 w-4" />
                  <span>{documents[2]?.name || "Upload Selfie with ID"}</span>
                </Label>
              </div>
              {documents[2] && (
                <span className="text-xs text-green-400 whitespace-nowrap">File selected</span>
              )}
            </div>
            <p className="text-xs text-betster-400 mt-1">A photo of yourself holding your ID document</p>
          </div>
        </div>
      </div>
      
      <Alert className="bg-amber-500/10 border-amber-500/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          By submitting this form, you confirm that all information provided is accurate and authentic. 
          Providing false information may result in account termination.
        </AlertDescription>
      </Alert>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Verification"}
      </Button>
    </form>
  );
};

export default KYCVerificationForm;
