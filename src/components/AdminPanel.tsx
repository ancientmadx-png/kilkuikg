import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck
} from 'lucide-react';
import { connectWallet, switchToSepolia } from '../utils/blockchain';
import { ethers } from 'ethers';
import contractData from '../contracts/AcademicCredentials.json';
import AuthorizationRequests from './AuthorizationRequests';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'authorize' | 'requests'>('requests');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [authStatus, setAuthStatus] =
    useState<{ address: string; authorized: boolean } | null>(null);

  /* ================= WALLET INIT ================= */
  useEffect(() => {
    initWallet();
  }, []);

  const initWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      await switchToSepolia();
      await checkIfOwner(address);
    }
  };

  const checkIfOwner = async (address: string) => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractData.contractAddress,
        contractData.abi,
        provider
      );

      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    } catch (err) {
      console.error('Owner check failed', err);
    }
  };

  /* ================= AUTHORIZE ================= */
  const authorizeInstitution = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      if (!institutionAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid Ethereum address');
      }

      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractData.contractAddress,
        contractData.abi,
        signer
      );

      const tx = await contract.authorizeInstitution(institutionAddress);
      await tx.wait();

      setSuccess(`Institution ${institutionAddress} has been authorized successfully`);
      setInstitutionAddress('');
    } catch (err: any) {
      setError(err.message || 'Authorization failed');
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECK AUTH ================= */
  const checkAuthorization = async () => {
    setCheckingAuth(true);
    setAuthStatus(null);
    setError(null);

    try {
      if (!institutionAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid Ethereum address');
      }

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const contract = new ethers.Contract(
        contractData.contractAddress,
        contractData.abi,
        provider
      );

      const authorized = await contract.authorizedInstitutions(institutionAddress);
      setAuthStatus({ address: institutionAddress, authorized });
    } catch (err: any) {
      setError(err.message || 'Authorization check failed');
    } finally {
      setCheckingAuth(false);
    }
  };

  const authorizeSelf = () => {
    if (walletAddress) setInstitutionAddress(walletAddress);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 text-white">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-xl p-8">

        {/* ================= HEADER ================= */}
        <div className="flex items-center mb-8">
          <Shield className="w-8 h-8 text-[#FFC700] mr-3" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-6 border-b border-[#2A2A2A] mb-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 font-semibold transition ${
              activeTab === 'requests'
                ? 'border-b-2 border-[#FFC700] text-[#FFC700]'
                : 'text-[#BFBFBF] hover:text-white'
            }`}
          >
            Authorization Requests
          </button>

          <button
            onClick={() => setActiveTab('authorize')}
            className={`pb-3 font-semibold transition ${
              activeTab === 'authorize'
                ? 'border-b-2 border-[#FFC700] text-[#FFC700]'
                : 'text-[#BFBFBF] hover:text-white'
            }`}
          >
            Manual Authorization
          </button>
        </div>

        {/* ================= REQUESTS ================= */}
        {activeTab === 'requests' && <AuthorizationRequests />}

        {/* ================= AUTHORIZE ================= */}
        {activeTab === 'authorize' && (
          <div>

            {/* OWNER WARNING */}
            {!isOwner && walletAddress && (
              <div className="mb-6 p-4 rounded-lg border border-yellow-600 bg-yellow-500/10">
                <p className="text-sm text-yellow-300">
                  <strong>Warning:</strong> You are not the contract owner.
                </p>
                <p className="text-xs text-yellow-400 mt-2 font-mono">
                  Connected Address: {walletAddress}
                </p>
              </div>
            )}

            {/* OWNER CONFIRM */}
            {isOwner && (
              <div className="mb-6 p-4 rounded-lg border border-green-600 bg-green-500/10 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm text-green-400">
                  You are the contract owner and can authorize institutions.
                </p>
              </div>
            )}

            {/* SUCCESS / ERROR */}
            {success && (
              <div className="mb-6 p-4 rounded-lg border border-green-600 bg-green-500/10">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 rounded-lg border border-red-600 bg-red-500/10">
                {error}
              </div>
            )}

            {/* INPUT */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#BFBFBF] mb-2">
                  Institution Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    value={institutionAddress}
                    onChange={e => setInstitutionAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A]
                      rounded-lg px-4 py-2 text-sm font-mono
                      focus:outline-none focus:border-[#FFC700]"
                  />
                  <button
                    onClick={authorizeSelf}
                    disabled={!walletAddress}
                    className="px-4 py-2 rounded-lg bg-[#1A1A1A]
                      border border-[#2A2A2A] hover:bg-[#222222]
                      disabled:opacity-50"
                  >
                    <UserCheck className="inline w-4 h-4 mr-2 text-[#FFC700]" />
                    Use My Address
                  </button>
                </div>
                <p className="text-xs text-[#BFBFBF] mt-1">
                  Enter the Ethereum address of the institution
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={authorizeInstitution}
                  disabled={loading || !isOwner || !institutionAddress}
                  className="flex-1 bg-[#FFC700] text-black font-bold py-3 rounded-lg
                    hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="mx-auto animate-spin" />
                  ) : (
                    'Authorize Institution'
                  )}
                </button>

                <button
                  onClick={checkAuthorization}
                  disabled={checkingAuth || !institutionAddress}
                  className="px-6 py-3 rounded-lg bg-[#1A1A1A]
                    border border-[#2A2A2A] hover:bg-[#222222]"
                >
                  {checkingAuth ? 'Checking...' : 'Check Status'}
                </button>
              </div>

              {/* AUTH STATUS */}
              {authStatus && (
                <div
                  className={`p-4 rounded-lg border ${
                    authStatus.authorized
                      ? 'border-green-600 bg-green-500/10'
                      : 'border-red-600 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center">
                    {authStatus.authorized ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <div>
                      <p className="font-medium">
                        {authStatus.authorized
                          ? 'Institution is Authorized'
                          : 'Institution is NOT Authorized'}
                      </p>
                      <p className="text-xs text-[#BFBFBF] font-mono">
                        {authStatus.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK GUIDE */}
            <div className="mt-8 p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A]">
              <h3 className="text-sm font-semibold text-[#FFC700] mb-2">
                Quick Setup Guide
              </h3>
              <ol className="text-sm text-[#BFBFBF] space-y-1 list-decimal list-inside">
                <li>Connect using the contract owner wallet</li>
                <li>Enter or use your institution address</li>
                <li>Authorize and confirm in MetaMask</li>
                <li>Authorized institutions can issue credentials</li>
              </ol>
            </div>

            {/* CONTRACT INFO */}
            <div className="mt-6 p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A]">
              <h3 className="text-sm font-semibold text-white mb-2">
                Contract Information
              </h3>
              <p className="text-xs text-[#BFBFBF] font-mono">
                Contract: {contractData.contractAddress}
              </p>
              <p className="text-xs text-[#BFBFBF] font-mono mt-2">
                Wallet: {walletAddress || 'Not connected'}
              </p>
              <p className="text-xs text-[#BFBFBF] mt-2">
                Status: {isOwner ? 'Contract Owner ✓' : 'Not Owner'}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
