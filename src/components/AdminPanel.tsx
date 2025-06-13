
import React, { useState } from 'react';
import { Users, CreditCard, Wifi, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminPanelProps {
  onBack: () => void;
}

// Mock data for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254700000001',
    plan: '1 Week',
    status: 'Active',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    paidAmount: 150
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+254700000002',
    plan: '1 Day',
    status: 'Active',
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    paidAmount: 20
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+254700000003',
    plan: '2 Hours',
    status: 'Expired',
    expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    paidAmount: 10
  }
];

const mockPayments = [
  {
    id: '1',
    user: 'John Doe',
    phone: '+254700000001',
    plan: '1 Week',
    amount: 150,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'Completed'
  },
  {
    id: '2',
    user: 'Jane Smith',
    phone: '+254700000002',
    plan: '1 Day',
    amount: 20,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'Completed'
  },
  {
    id: '3',
    user: 'Bob Wilson',
    phone: '+254700000003',
    plan: '2 Hours',
    amount: 10,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'Completed'
  }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users] = useState(mockUsers);
  const [payments] = useState(mockPayments);

  const activeUsers = users.filter(user => user.status === 'Active').length;
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const todayRevenue = payments
    .filter(payment => payment.date.toDateString() === new Date().toDateString())
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleDisconnectUser = (userId: string) => {
    console.log(`Disconnecting user ${userId}`);
    // In real implementation, this would call your backend API
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your WiFi network and users</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Portal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
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
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-2xl font-bold">Ksh {todayRevenue}</p>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-info" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Connected Users</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Connected Users</CardTitle>
              <CardDescription>
                Manage all users connected to your WiFi network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{user.plan}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Ksh {user.paidAmount}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {user.expiresAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {user.status === 'Active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnectUser(user.id)}
                        >
                          Disconnect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all M-Pesa transactions and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{payment.user}</h4>
                          <p className="text-sm text-muted-foreground">{payment.phone}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{payment.plan}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-success">Ksh {payment.amount}</p>
                          <Badge variant="outline" className="text-success">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Settings</CardTitle>
                <CardDescription>
                  Configure your WiFi network parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Network Status</h4>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                    <span className="text-sm">Online - All systems operational</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Wifi className="h-4 w-4 mr-2" />
                      Restart Network
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Disconnect All Users
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Configuration</CardTitle>
                <CardDescription>
                  Manage pricing and plan options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>2 Hours Plan</span>
                    <span className="font-medium">Ksh 10</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>1 Day Plan</span>
                    <span className="font-medium">Ksh 20</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>1 Week Plan</span>
                    <span className="font-medium">Ksh 150</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Pricing
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
