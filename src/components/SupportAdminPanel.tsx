
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define UserType for proper typing
interface UserType {
  id: string;
  username: string;
}

export default function SupportAdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(100);
  
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
  
  const handleAddFunds = async () => {
    if (!selectedUser || !amount) {
      toast({
        title: "Error",
        description: "Please select a user and enter an amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('admin_add_funds', {
        p_user_id: selectedUser,
        p_amount: amount
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Added ${amount} to user's wallet`
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "Error",
        description: "Failed to add funds to user's wallet",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Admin Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select User</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded-md"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
            />
          </div>
          
          <Button onClick={handleAddFunds}>Add Funds</Button>
        </div>
      </CardContent>
    </Card>
  );
}
