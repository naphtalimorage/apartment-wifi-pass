
import React, { useState } from 'react';
import { Users, CreditCard, Wifi, Timer, Shield, ShieldOff, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminData } from '@/hooks/useAdminData';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { toast } = useToast();
  const {
    activeSessions,
    userDevices,
    loading,
    error,
    blacklistUser,
    unblacklistUser,
    monitorSessions,
    refetch
  } = useAdminData();
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleBlacklistUser = async (userId: string, macAddress: string, userName: string) => {
    setActionLoading(userId);
    const result = await blacklistUser(userId, macAddress);
    setActionLoading(null);

    if (result.success) {
      toast({
        title: "User Blacklisted",
        description: `${userName} has been disconnected and blacklisted.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to blacklist user",
        variant: "destructive",
      });
    }
  };

  const handleUnblacklistUser = async (userId: string, macAddress: string, userName: string) => {
    setActionLoading(userId);
    const result = await unblacklistUser(userId, macAddress);
    setActionLoading(null);

    if (result.success) {
      toast({
        title: "User Unblacklisted",
        description: `${userName} has been removed from blacklist.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to unblacklist user",
        variant: "destructive",
      });
    }
  };

  const handleMonitorSessions = async () => {
    setActionLoading('monitor');
    const result = await monitorSessions();
    setActionLoading(null);

    if (result.success) {
      toast({
        title: "Session Monitor",
        description: "Expired sessions have been processed and users blacklisted.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to monitor sessions",
        variant: "destructive",
      });
    }
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const totalRevenue = activeSessions.reduce((sum, session) => sum + session.payments.amount_ksh, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-red-600 p-8">
          <p>{error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">WiFi Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your network and monitor user sessions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleMonitorSessions}
            disabled={actionLoading === 'monitor'}
          >
            <Play className="h-4 w-4 mr-2" />
            {actionLoading === 'monitor' ? 'Monitoring...' : 'Check Expired Sessions'}
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Portal
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{activeSessions.length}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-2xl font-bold">Ksh {totalRevenue}</p>
                <p className="text-sm text-muted-foreground">Active Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-info" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{userDevices.length}</p>
                <p className="text-sm text-muted-foreground">Registered Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {activeSessions.filter(s => new Date(s.end_time) <= new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expired Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Connected Users</CardTitle>
          <CardDescription>
            Real-time view of active internet sessions with manual controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active sessions found
              </p>
            ) : (
              activeSessions.map((session) => {
                const timeRemaining = formatTimeRemaining(session.end_time);
                const isExpired = new Date(session.end_time) <= new Date();
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{session.users.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{session.users.email}</p>
                          <p className="text-sm text-muted-foreground">{session.users.phone_number}</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={isExpired ? 'destructive' : 'default'}>
                            {timeRemaining}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{session.data_plans.name}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">MAC: {session.mac_address || 'Not set'}</p>
                          <p className="text-sm text-muted-foreground">IP: {session.ip_address || 'Not set'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Ksh {session.payments.amount_ksh}</p>
                          <p className="text-xs text-muted-foreground">
                            Data: {session.data_used_mb || 0} MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBlacklistUser(
                          session.user_id, 
                          session.mac_address, 
                          session.users.full_name
                        )}
                        disabled={!session.mac_address || actionLoading === session.user_id}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {actionLoading === session.user_id ? 'Processing...' : 'Blacklist'}
                      </Button>
                      {!session.mac_address && (
                        <Badge variant="outline" className="text-xs">
                          No MAC Address
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
