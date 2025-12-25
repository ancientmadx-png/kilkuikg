import { useState } from 'react';
import { Share2, Copy, Link as LinkIcon, CheckCircle, Clock } from 'lucide-react';
import { createShareToken } from '../utils/supabase';

interface CredentialSharingProps {
  credentialId: string;
  credentialTitle: string;
}

export default function CredentialSharing({ credentialId, credentialTitle }: CredentialSharingProps) {
  const [sharedWith, setSharedWith] = useState('');
  const [expiresIn, setExpiresIn] = useState('24');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    if (!sharedWith.trim()) {
      alert('Please enter the recipient name or organization');
      return;
    }

    setLoading(true);
    const token = await createShareToken(credentialId, sharedWith, parseInt(expiresIn));

    if (token) {
      setShareToken(token);
      setSharedWith('');
    } else {
      alert('Failed to create share link');
    }
    setLoading(false);
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}?verify=true&token=${token}`;
  };

  const handleCopyLink = () => {
    if (shareToken) {
      navigator.clipboard.writeText(getShareUrl(shareToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Share2 className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Share Credential</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Create a secure, time-limited link to share "{credentialTitle}" with universities or employers.
        </p>

        {!shareToken ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with
              </label>
              <input
                type="text"
                value={sharedWith}
                onChange={(e) => setSharedWith(e.target.value)}
                placeholder="University name or employer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link expires in
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
                <option value="168">1 week</option>
                <option value="720">30 days</option>
              </select>
            </div>

            <button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Generate Share Link
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Share link created successfully!
                </span>
              </div>
              <div className="flex items-center text-xs text-green-700 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                <span>Expires in {expiresIn} hour{parseInt(expiresIn) !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Share URL</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={getShareUrl(shareToken)}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded font-mono text-gray-600"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShareToken(null)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Create Another Link
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Privacy & Security</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Links are time-limited and automatically expire</li>
          <li>• Access is tracked and logged in the audit trail</li>
          <li>• Recipients can view but not modify credentials</li>
          <li>• You can create multiple share links for different recipients</li>
        </ul>
      </div>
    </div>
  );
}
