
import React from 'react';
import { Wifi, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';

interface WifiHeaderProps {
  user: User | null;
  isAdmin: boolean;
  onAdminAccess: () => void;
  onLogout: () => void;
}

const WifiHeader = ({ user, isAdmin, onAdminAccess, onLogout }: WifiHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Wifi className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ApartmentWiFi</h1>
              <p className="text-sm text-muted-foreground">Premium Internet Access</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <Badge variant="outline" className="hidden sm:flex">
                {isAdmin ? 'Admin' : 'Authenticated'}
              </Badge>
            )}
            
            {!user && (
              <Button variant="ghost" size="sm" onClick={onAdminAccess}>
                Admin
              </Button>
            )}
            
            {user && !isAdmin && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default WifiHeader;
