
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Your Profile</h1>
        
        <Card className="bg-black/50 border-betster-700/40 text-white">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-betster-500">
                <AvatarFallback className="bg-betster-800 text-betster-100 text-xl">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
                {user?.photoURL && <AvatarImage src={user.photoURL} />}
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user?.username || "Player"}</CardTitle>
                <CardDescription className="text-betster-300">{user?.email || ""}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30">
                <h3 className="text-lg font-medium text-betster-100">Wallet Balance</h3>
                <p className="text-2xl font-bold text-white">₹{user?.wallet || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-betster-800/30 border border-betster-700/30">
                <h3 className="text-lg font-medium text-betster-100">Account Status</h3>
                <p className="text-lg font-medium text-green-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
