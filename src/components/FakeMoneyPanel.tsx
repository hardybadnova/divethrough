
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FakeMoneyPanel = () => {
  return (
    <Card className="bg-betster-800/30 border-betster-700/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-white">Money Controls Disabled</CardTitle>
        <CardDescription className="text-betster-300">
          Payment functionality has been removed
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-betster-300">Wallet and payment features are no longer available.</p>
      </CardContent>
    </Card>
  );
};

export default FakeMoneyPanel;
