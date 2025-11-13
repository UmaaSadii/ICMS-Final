import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, Phone, Building, Lightbulb, Check, X } from 'lucide-react';

interface HODRequest {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  phone: string;
  department_name: string;
  designation: string;
  experience_years: number;
  specialization: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const HODRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<HODRequest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/admin/hod-requests/');
      const data = await response.json();
      setRequests(data.requests);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    const reason = action === 'reject' ? prompt('Rejection reason (optional):') : undefined;
    try {
      const response = await fetch(`/api/register/admin/hod-requests/${requestId}/action/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      if (response.ok) {
        await loadRequests();
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  useEffect(() => {
    loadRequests();
    
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://${window.location.host}/ws/hod-requests/`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'get_requests' }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'requests_update') {
        setRequests(data.data.requests);
        setStats(data.data.stats);
      }
    };
    
    // Fallback polling
    const interval = setInterval(loadRequests, 60000);
    
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HOD Registration Requests</h1>
          <Button onClick={loadRequests} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg">{request.name}</CardTitle>
                <p className="text-sm text-gray-600">{request.designation}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {request.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {request.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  {request.department_name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {request.specialization}
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={() => handleAction(request.id, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleAction(request.id, 'reject')}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HODRequestsManager;