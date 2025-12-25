import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Layers, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { Credential } from '../types/credential';
import { getIPFSUrl } from '../utils/ipfs';
import { CredentialRecord } from '../utils/supabase';
import Credential3DCard from './Credential3DCard';

interface Credential3DShowcaseProps {
  credentials: Credential[];
  dbCredentials: CredentialRecord[];
  onShare: (credential: CredentialRecord) => void;
  onViewHistory: (credentialId: string) => void;
}

type ViewMode = 'grid' | 'stack' | 'focus';

export default function Credential3DShowcase({
  credentials,
  dbCredentials,
  onShare,
  onViewHistory
}: Credential3DShowcaseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleViewDocument = (ipfsHash: string) => {
    window.open(getIPFSUrl(ipfsHash), '_blank');
  };

  const handleCardClick = (index: number) => {
    if (viewMode === 'stack') {
      setFocusedIndex(index);
      setViewMode('focus');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.6));
  };

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  if (credentials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No credentials to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setViewMode('grid');
              setFocusedIndex(null);
              setZoom(1);
              setRotation(0);
            }}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setViewMode('stack');
              setFocusedIndex(null);
              setZoom(1);
              setRotation(0);
            }}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'stack'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Stack View"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 mr-2">Zoom</span>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <Minimize2 className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-mono text-gray-700 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Zoom In"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-2"
            title="Rotate View"
          >
            <RotateCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 3D Showcase Area */}
      <motion.div
        className="relative min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 overflow-hidden"
        style={{
          perspective: '2000px',
        }}
        animate={{ rotate: rotation }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Ambient Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <AnimatePresence mode="wait">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
            >
              {credentials.map((credential, index) => {
                const dbCred = dbCredentials.find(c => c.token_id === credential.tokenId);
                return (
                  <Credential3DCard
                    key={credential.tokenId}
                    credential={credential}
                    index={index}
                    totalCards={credentials.length}
                    onViewDocument={() => handleViewDocument(credential.ipfsHash)}
                    onShare={() => dbCred && onShare(dbCred)}
                    onViewHistory={() => dbCred && onViewHistory(dbCred.id)}
                    isStacked={false}
                  />
                );
              })}
            </motion.div>
          )}

          {/* Stack View */}
          {viewMode === 'stack' && (
            <motion.div
              key="stack"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex justify-center items-center min-h-[500px]"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
              }}
            >
              <div
                className="relative"
                style={{
                  transformStyle: 'preserve-3d',
                  width: '400px',
                  height: '450px',
                }}
              >
                {credentials.map((credential, index) => {
                  const dbCred = dbCredentials.find(c => c.token_id === credential.tokenId);
                  return (
                    <motion.div
                      key={credential.tokenId}
                      className="absolute inset-0 cursor-pointer"
                      style={{
                        transformStyle: 'preserve-3d',
                        zIndex: credentials.length - index,
                      }}
                      initial={{
                        y: index * -8,
                        z: -index * 20,
                        scale: 1 - (index * 0.05),
                      }}
                      whileHover={{
                        y: index * -12,
                        z: -index * 30,
                        scale: 1 - (index * 0.03),
                        transition: { duration: 0.3 }
                      }}
                      onClick={() => handleCardClick(index)}
                    >
                      <Credential3DCard
                        credential={credential}
                        index={index}
                        totalCards={credentials.length}
                        onViewDocument={() => handleViewDocument(credential.ipfsHash)}
                        onShare={() => dbCred && onShare(dbCred)}
                        onViewHistory={() => dbCred && onViewHistory(dbCred.id)}
                        isStacked={true}
                      />
                    </motion.div>
                  );
                })}
              </div>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
                  Hover over cards to expand • Click to focus
                </p>
              </div>
            </motion.div>
          )}

          {/* Focus View */}
          {viewMode === 'focus' && focusedIndex !== null && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 flex flex-col items-center justify-center min-h-[500px]"
            >
              <div className="max-w-md w-full">
                {(() => {
                  const credential = credentials[focusedIndex];
                  const dbCred = dbCredentials.find(c => c.token_id === credential.tokenId);
                  return (
                    <Credential3DCard
                      credential={credential}
                      index={0}
                      totalCards={1}
                      onViewDocument={() => handleViewDocument(credential.ipfsHash)}
                      onShare={() => dbCred && onShare(dbCred)}
                      onViewHistory={() => dbCred && onViewHistory(dbCred.id)}
                      isStacked={false}
                    />
                  );
                })()}
              </div>
              <div className="mt-6 flex items-center space-x-4">
                <button
                  onClick={() => setFocusedIndex(Math.max(0, focusedIndex - 1))}
                  disabled={focusedIndex === 0}
                  className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg">
                  {focusedIndex + 1} / {credentials.length}
                </span>
                <button
                  onClick={() => setFocusedIndex(Math.min(credentials.length - 1, focusedIndex + 1))}
                  disabled={focusedIndex === credentials.length - 1}
                  className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => {
                    setViewMode('stack');
                    setFocusedIndex(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Back to Stack
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Info Panel */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-gray-500">Total Credentials:</span>
              <span className="ml-2 font-semibold text-gray-900">{credentials.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Active:</span>
              <span className="ml-2 font-semibold text-green-600">
                {credentials.filter(c => !c.revoked).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Revoked:</span>
              <span className="ml-2 font-semibold text-red-600">
                {credentials.filter(c => c.revoked).length}
              </span>
            </div>
          </div>
          <div className="text-gray-500">
            {viewMode === 'grid' && 'Grid View'}
            {viewMode === 'stack' && 'Stack View'}
            {viewMode === 'focus' && 'Focus View'}
          </div>
        </div>
      </div>
    </div>
  );
}
