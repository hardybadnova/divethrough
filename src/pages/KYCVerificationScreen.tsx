
import React from 'react';
import AppLayout from '@/components/AppLayout';
import KYCVerificationForm from '@/components/KYCVerificationForm';
import { useAuth } from '@/contexts/AuthContext';
import { useKYC } from '@/contexts/KYCContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Shield, User, FileCheck, Lock } from 'lucide-react';

const KYCVerificationScreen = () => {
  const { user } = useAuth();
  const { verification, getVerificationStatus, kycStatus } = useKYC();
  
  const verificationStatus = getVerificationStatus();

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gradient">Account Verification</h1>
            <p className="text-betster-300">
              Complete your KYC verification to unlock all platform features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="premium-glass rounded-xl p-4 space-y-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-betster-800 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-betster-300" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-betster-400">Account level: {verification?.level || 1}</p>
                  </div>
                </div>
                
                <div className="flex items-center mt-2">
                  <div 
                    className={`h-3 w-3 rounded-full mr-2 ${
                      verificationStatus === 'verified' ? 'bg-green-500' : 
                      verificationStatus === 'pending' ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`} 
                  />
                  <span className="text-sm">
                    {verificationStatus === 'verified' ? 'Verified' : 
                     verificationStatus === 'pending' ? 'Pending Review' : 
                     verificationStatus === 'rejected' ? 'Rejected' : 
                     'Not Verified'}
                  </span>
                </div>
              </div>
              
              <div className="premium-glass rounded-xl p-4 space-y-4">
                <h3 className="font-medium">Why Verify?</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-betster-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Account Security</p>
                      <p className="text-sm text-betster-400">Protects you against fraud and identity theft</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileCheck className="h-5 w-5 text-betster-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Higher Limits</p>
                      <p className="text-sm text-betster-400">Access to increased deposit and withdrawal limits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Lock className="h-5 w-5 text-betster-400 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Legal Compliance</p>
                      <p className="text-sm text-betster-400">Helps us comply with regulatory requirements</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {verificationStatus === 'verified' && verification && (
                <div className="premium-glass rounded-xl p-4 space-y-4">
                  <h3 className="font-medium">Transaction Limits</h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Daily Deposit:</div>
                      <div className="font-medium text-right">₹{verification.depositLimits.daily.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Weekly Deposit:</div>
                      <div className="font-medium text-right">₹{verification.depositLimits.weekly.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Monthly Deposit:</div>
                      <div className="font-medium text-right">₹{verification.depositLimits.monthly.toLocaleString()}</div>
                    </div>
                    <div className="border-t border-betster-700/40 my-2"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Daily Withdrawal:</div>
                      <div className="font-medium text-right">₹{verification.withdrawalLimits.daily.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Weekly Withdrawal:</div>
                      <div className="font-medium text-right">₹{verification.withdrawalLimits.weekly.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Monthly Withdrawal:</div>
                      <div className="font-medium text-right">₹{verification.withdrawalLimits.monthly.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2" disabled>
                    Request Limit Increase
                  </Button>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              {!user ? (
                <Alert className="bg-red-500/20 border-red-500/40">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Login Required</AlertTitle>
                  <AlertDescription>
                    Please log in to access the verification process.
                  </AlertDescription>
                </Alert>
              ) : (
                <KYCVerificationForm />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default KYCVerificationScreen;
