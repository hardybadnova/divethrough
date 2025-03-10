
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

// Define UserType for proper typing
interface UserType {
  id: string;
  username: string;
}

export default function SupportAdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  
  // Fetch all users for the admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username');
        
      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Could not load users",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        // Properly map the data to UserType objects
        const mappedUsers: UserType[] = data.map(user => ({
          id: user.id,
          username: user.username
        }));
        setUsers(mappedUsers);
      }
    };
    
    fetchUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          Admin Controls Disabled
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-betster-300 mb-4">Wallet and payment functionality has been removed from the application.</p>
        <div className="space-y-2">
          <p className="text-sm text-betster-400">Users in system: {users.length}</p>
        </div>
      </CardContent>
    </Card>
  );
}
