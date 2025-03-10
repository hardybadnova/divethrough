
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { CompetitionsTabs } from '@/components/competitions/CompetitionsTabs';
import { CurrentCompetitionStatus } from '@/components/competitions/CurrentCompetitionStatus';

const CompetitionsPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Competitions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <CompetitionsTabs />
          </div>
          
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-2">Your Competitions</h2>
            <CurrentCompetitionStatus />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompetitionsPage;
