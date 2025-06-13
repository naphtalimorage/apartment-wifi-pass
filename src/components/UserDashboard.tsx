
import React, { useState, useEffect } from 'react';
import { Wifi, Timer, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentPlan?: {
    type: string;
    duration: string;
    price: number;
    expiresAt: Date;
  };
}

interface UserDashboardProps {
  user: User;
  onRenewPlan: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onRenewPlan }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (!user.currentPlan) return;

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(user.currentPlan!.expiresAt);
      const timeDiff = expiresAt.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining('Expired');
        setProgressPercentage(0);
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);

      // Calculate progress based on plan duration
      let totalDuration = 0;
      if (user.currentPlan!.duration === '2 hours') totalDuration = 2 * 60 * 60 * 1000;
      else if (user.currentPlan!.duration === '24 hours') totalDuration = 24 * 60 * 60 * 1000;
      else if (user.currentPlan!.duration === '7 days') totalDuration = 7 * 24 * 60 * 60 * 1000;

      const elapsed = totalDuration - timeDiff;
      const percentage = (elapsed / totalDuration) * 100;
      setProgressPercentage(Math.min(100, Math.max(0, percentage)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user.currentPlan]);

  const getStatusColor = () => {
    if (progressPercentage > 75) return 'text-destructive';
    if (progressPercentage > 50) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (progressPercentage > 75) return 'bg-destructive';
    if (progressPercentage > 50) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
          <Wifi className="h-8 w-8 text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">You're Connected!</h2>
        <p className="text-muted-foreground">Enjoy your high-speed internet access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Connection Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              Active Plan
            </CardTitle>
            <CardDescription>
              {user.currentPlan?.type} - Expires {user.currentPlan?.expiresAt.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time Remaining</span>
                <Badge variant="outline" className={getStatusColor()}>
                  {timeRemaining}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={progressPercentage} 
                  className="w-full h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Started</span>
                  <span>{progressPercentage.toFixed(1)}% used</span>
                  <span>Expires</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {user.currentPlan?.duration}
                </div>
                <div className="text-sm text-muted-foreground">Plan Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  Ksh {user.currentPlan?.price}
                </div>
                <div className="text-sm text-muted-foreground">Amount Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{user.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium text-sm">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{user.phone}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-success/10 rounded-lg">
              <div className="text-lg font-semibold text-success">Connected</div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-lg font-semibold text-primary">100 Mbps</div>
              <div className="text-sm text-muted-foreground">Speed</div>
            </div>
            <div className="p-4 bg-info/10 rounded-lg">
              <div className="text-lg font-semibold text-info">5ms</div>
              <div className="text-sm text-muted-foreground">Ping</div>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <div className="text-lg font-semibold text-accent">Unlimited</div>
              <div className="text-sm text-muted-foreground">Data</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRenewPlan} size="lg" className="h-12">
          <CreditCard className="h-5 w-5 mr-2" />
          Renew or Upgrade Plan
        </Button>
        
        <Button variant="outline" size="lg" className="h-12">
          <User className="h-5 w-5 mr-2" />
          Contact Support
        </Button>
      </div>
    </div>
  );
};

export default UserDashboard;
