
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from '@/components/AppLayout';
import SupportAdminPanel from '@/components/SupportAdminPanel';

const AdminDashboard = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>
        
        <Tabs defaultValue="support" className="w-full">
          <TabsList className="bg-betster-800/50 border border-betster-700/50">
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="support" className="mt-4">
            <SupportAdminPanel />
          </TabsContent>
          
          <TabsContent value="users" className="mt-4">
            <div className="bg-betster-800/30 p-6 rounded-lg border border-betster-700/40">
              <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
              <p className="text-betster-300">User management functionality coming soon.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4">
            <div className="bg-betster-800/30 p-6 rounded-lg border border-betster-700/40">
              <h2 className="text-xl font-semibold mb-4 text-white">Analytics Dashboard</h2>
              <p className="text-betster-300">Analytics features coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
