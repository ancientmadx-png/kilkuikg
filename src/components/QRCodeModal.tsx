import { X, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Credential } from '../types/credential';

interface QRCodeModalProps {
  credential: Credential;
  onClose: () => void;
}

export default function QRCodeModal({ credential, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const verificationUrl = `${window.location.origin}?verify=${credential.tokenId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Share Credential</h3>

        <div className="bg-gray-50 rounded-lg p-6 mb-4 flex justify-center">
          <QRCodeSVG value={verificationUrl} size={200} level="H" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 font-mono"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Credential Details:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>Degree: {credential.degree}</li>
            <li>Institution: {credential.institution}</li>
            <li>Token ID: {credential.tokenId}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
