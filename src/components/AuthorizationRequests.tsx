import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { getContract } from '../utils/blockchain';

interface AuthRequest {
  id: string;
  institution_name: string;
  wallet_address: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AuthorizationRequests() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [selectedRequest, setSelectedRequest] = useState<AuthRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('institution_authorization_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setError(null);
    setSuccess(null);

    try {
      const request = requests.find(r => r.id === id);
      if (!request) throw new Error('Request not found');
      if (!window.ethereum) throw new Error('MetaMask not installed');

      const contract = await getContract();
      const tx = await contract.authorizeInstitution(request.wallet_address);
      await tx.wait();

      const { error: dbError } = await supabase
        .from('institution_authorization_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (dbError) throw dbError;

      setSuccess(`Institution ${request.institution_name} authorized successfully`);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Authorization failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('institution_authorization_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string, address: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 border-green-600/40';
      case 'rejected':
        return 'bg-red-500/10 border-red-600/40';
      default:
        return 'bg-yellow-500/10 border-yellow-600/40';
    }
  };

  const filteredRequests =
    filterStatus === 'all'
      ? requests
      : requests.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-600/40 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-400">Error</h4>
            <p className="text-sm text-[#BFBFBF] mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <XCircle className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="bg-green-500/10 border border-green-600/40 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-400">Success</h4>
            <p className="text-sm text-[#BFBFBF] mt-1">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)}>
            <XCircle className="w-5 h-5 text-green-400" />
          </button>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          Institution Authorization Requests
        </h2>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setSelectedRequest(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-[#FFC700] text-black'
                  : 'bg-[#0A0A0A] border border-[#2A2A2A] text-[#BFBFBF] hover:bg-[#1A1A1A]'
              }`}
            >
              {status.toUpperCase()}
              <span className="ml-2 text-xs">
                {status === 'all'
                  ? requests.length
                  : requests.filter(r => r.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-center text-[#BFBFBF] py-12">Loading requests…</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-[#BFBFBF] py-12">
            No {filterStatus !== 'all' ? filterStatus : ''} requests found
          </p>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <div
                key={request.id}
                className={`border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedRequest?.id === request.id
                    ? getStatusColor(request.status)
                    : 'border-[#2A2A2A] hover:border-[#FFC700]'
                }`}
                onClick={() => {
                  setSelectedRequest(request);
                  setAdminNotes(request.admin_notes);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="text-lg font-semibold text-white">
                        {request.institution_name}
                      </h3>
                    </div>

                    <p className="text-sm text-[#BFBFBF] mb-2">
                      {request.email} • {request.phone}
                    </p>

                    <p className="text-sm text-[#BFBFBF] mb-3">
                      {request.description}
                    </p>

                    {/* WALLET */}
                    <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 mb-3">
                      <p className="text-xs text-[#BFBFBF] mb-1">
                        Wallet Address
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-white font-mono break-all flex-1">
                          {request.wallet_address}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(request.wallet_address, request.wallet_address);
                          }}
                          className="p-2 rounded-lg hover:bg-[#1A1A1A]"
                        >
                          <Copy className="w-4 h-4 text-[#FFC700]" />
                        </button>
                      </div>
                      {copiedAddress === request.wallet_address && (
                        <p className="text-xs text-green-400 mt-1">Copied</p>
                      )}
                    </div>

                    <p className="text-xs text-[#BFBFBF]">
                      Submitted: {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* DETAILS */}
                {selectedRequest?.id === request.id && (
                  <div className="mt-6 pt-6 border-t border-[#2A2A2A] space-y-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#BFBFBF]">
                      <MessageSquare className="w-4 h-4" />
                      Admin Notes
                    </label>

                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      rows={3}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A]
                        rounded-lg px-4 py-2 text-sm text-white resize-none
                        focus:outline-none focus:border-[#FFC700]"
                    />

                    {request.status === 'pending' && (
                      <>
                        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3">
                          <p className="text-xs text-[#BFBFBF]">
                            Approving will trigger MetaMask and authorize on-chain
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(request.id);
                            }}
                            disabled={processingId === request.id}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg
                              hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingId === request.id
                              ? 'Authorizing...'
                              : 'Approve & Authorize'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(request.id);
                            }}
                            disabled={processingId === request.id}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg
                              hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingId === request.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
