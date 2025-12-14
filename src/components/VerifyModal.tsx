import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { CheckCircle, Circle, Upload, Shield, Award, AlertTriangle, Loader2, X } from 'lucide-react';
import { verifyDapp } from '../utils/sui';
import badgeImg from '@/assets/Repeasy_Badge.png';

// Interfaces
interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  domainUrl: string;
  twitterUsername: string;
  bannerBlobId: string;
  iconBlobId: string;
  descriptionBlobId: string;
  ownerAddress?: string;
}

const VerifyModal: React.FC<VerifyModalProps> = ({ 
  isOpen, 
  onClose, 
  name,
  domainUrl,
  twitterUsername,
  bannerBlobId,
  iconBlobId,
  descriptionBlobId
}) => {
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const handleVerification = async () => {
    if (!currentAccount) {
      setError('Please connect your wallet to continue verification');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Stage 1: Upload to Walrus (already completed - show confirmation)
      setStage(1);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Stage 2: Verify and mint NFT badge on blockchain
      setStage(2);
      const tx = await verifyDapp(
        name,
        domainUrl,
        twitterUsername,
        bannerBlobId,
        iconBlobId,
        descriptionBlobId,
      );
      
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Verification successful:', result);
            const maybeDigest = (result as any)?.digest as string | undefined;
            if (maybeDigest) {
              setDigest(maybeDigest);
            } else {
              setDigest(null);
            }
            
            // Stage 3: Transfer NFT badge to owner (handled by smart contract)
            setStage(3);
            setTimeout(() => {
              setLoading(false);
            }, 2000);
          },
          onError: (error) => {
            console.error('Verification failed:', error);
            setError('Verification failed. Please try again.');
            setLoading(false);
          }
        }
      );

    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleVerification();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const renderStageIcon = (stageNumber: number, currentStage: number) => {
    if (stageNumber < currentStage) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    } else if (stageNumber === currentStage) {
      return loading ? (
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      ) : (
        <Circle className="w-6 h-6 text-cyan-400" />
      );
    } else {
      return <Circle className="w-6 h-6 text-gray-500" />;
    }
  };

  const renderStage = () => {
    const stages = [
      { 
        number: 1, 
        title: 'Uploaded to Walrus Storage', 
        icon: <Upload className="w-4 h-4" />,
        description: 'Content successfully stored in decentralized storage'
      },
      { 
        number: 2, 
        title: 'Verifying & Minting NFT Badge', 
        icon: <Shield className="w-4 h-4" />,
        description: 'Registering on Sui blockchain and minting verification badge'
      },
      { 
        number: 3, 
        title: 'Transferring NFT to Owner', 
        icon: <Award className="w-4 h-4" />,
        description: 'Completing transfer to your wallet address'
      },
    ];

    return (
      <div className="space-y-4">
        {stages.map(({ number, title, icon, description }) => (
          <motion.div
            key={number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: number * 0.1 }}
            className={`flex items-start space-x-3 p-4 rounded-xl border ${
              number < stage 
                ? 'bg-green-500/10 border-green-500/30' 
                : number === stage
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            {renderStageIcon(number, stage)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {icon}
                <span className="text-sm font-semibold text-white">{title}</span>
              </div>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl p-6 max-w-md w-full bg-linear-to-b from-[#0b1e34] to-[#030712] border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-shadow max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-cyan-400/30 pb-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-cyan-400">Verification In Progress</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 custom-scrollbar scrollbar-hide flex-1">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-medium mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerification}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors border border-cyan-400/30 font-semibold"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : !loading && stage === 3 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Verification Complete!</h3>
              <p className="text-gray-400 text-sm mb-6">Your dApp has been successfully verified and the NFT badge has been transferred to your wallet.</p>
              
              {digest && (
                <div className="bg-darkblue border border-cyan-500/20 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-400 mb-2">Transaction Digest:</p>
                  <p className="text-cyan-300 font-mono text-xs break-all">{digest}</p>
                </div>
              )}
              
              <div className="mt-6 border-t border-cyan-400/30 pt-6">
                <p className="text-sm font-medium text-cyan-300 mb-4">Minted NFT Badge</p>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-block"
                >
                  <img
                    src={badgeImg}
                    alt="RepEasy Verification Badge"
                    className="w-32 h-32 rounded-xl border-2 border-cyan-400/50 shadow-lg"
                  />
                </motion.div>
                <p className="text-xs text-gray-400 mt-3">This badge represents your verified status on the Sui blockchain</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors border border-cyan-400/30 font-semibold"
              >
                Done
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {renderStage()}
              <div className="text-center pt-4">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-cyan-300">Processing verification...</p>
                <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default VerifyModal;