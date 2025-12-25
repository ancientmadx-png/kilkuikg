import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FileText, Building2, Calendar, Shield, ExternalLink, Share2, History } from 'lucide-react';
import { Credential } from '../types/credential';

interface Credential3DCardProps {
  credential: Credential;
  index: number;
  totalCards: number;
  onViewDocument: () => void;
  onShare: () => void;
  onViewHistory: () => void;
  isStacked?: boolean;
}

export default function Credential3DCard({
  credential,
  index,
  totalCards,
  onViewDocument,
  onShare,
  onViewHistory,
  isStacked = false
}: Credential3DCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isStacked) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stackOffset = isStacked ? {
    y: index * -8,
    z: -index * 20,
    scale: 1 - (index * 0.05),
    opacity: 1 - (index * 0.15)
  } : {};

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      style={{
        perspective: '1000px',
        ...stackOffset
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-[400px] cursor-pointer"
        style={{
          rotateX: isStacked ? 0 : rotateX,
          rotateY: isStacked ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        onClick={() => !isStacked && setIsFlipped(!isFlipped)}
      >
        {/* Front Face */}
        <motion.div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Holographic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.03) 2px,
                    rgba(255, 255, 255, 0.03) 4px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(255, 255, 255, 0.03) 2px,
                    rgba(255, 255, 255, 0.03) 4px
                  )
                `
              }}
            />
          </div>

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2
            }}
          />

          {/* Security Pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <pattern id="security-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
                <path d="M 5 5 L 15 15 M 15 5 L 5 15" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#security-pattern)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between text-white">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FileText className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">
                      Verified Credential
                    </div>
                    <div className="text-sm font-mono opacity-60">
                      #{credential.tokenId}
                    </div>
                  </div>
                </div>
                {credential.revoked ? (
                  <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                    REVOKED
                  </div>
                ) : (
                  <motion.div
                    className="p-2 bg-green-400/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-5 h-5 text-green-300" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold leading-tight line-clamp-2">
                  {credential.degree}
                </h3>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 opacity-80" />
                  <span className="text-lg font-medium line-clamp-1">
                    {credential.institution}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 opacity-80">
                  <Calendar className="w-4 h-4" />
                  <span>Issued: {formatDate(credential.issueDate)}</span>
                </div>
              </div>

              {/* Holographic Security Strip */}
              <div className="h-12 relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 opacity-40">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700 opacity-50 uppercase tracking-widest">
                    Blockchain Verified
                  </span>
                </div>
              </div>

              <div className="text-xs text-center opacity-60">
                Click to flip • Hover to rotate
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Face */}
        <motion.div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Security Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="back-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="white" />
                  <path d="M 0 0 L 40 40 M 40 0 L 0 40" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#back-pattern)" />
            </svg>
          </div>

          <div className="relative h-full p-8 flex flex-col justify-between text-white">
            <div>
              <h4 className="text-xl font-bold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-400" />
                Credential Details
              </h4>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">Token ID</div>
                  <div className="text-sm font-mono">{credential.tokenId}</div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">IPFS Hash</div>
                  <div className="text-sm font-mono break-all">
                    {credential.ipfsHash.slice(0, 20)}...{credential.ipfsHash.slice(-10)}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">Student Address</div>
                  <div className="text-sm font-mono break-all">
                    {credential.student.slice(0, 10)}...{credential.student.slice(-8)}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-gray-400 mb-1">Status</div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${credential.revoked ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                    <div className="text-sm font-semibold">
                      {credential.revoked ? 'Revoked' : 'Active & Verified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDocument();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Document
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  className="py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center justify-center text-sm"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewHistory();
                  }}
                  className="py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center text-sm"
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
