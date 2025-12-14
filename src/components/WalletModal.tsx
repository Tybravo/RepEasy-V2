import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useCurrentAccount, 
  useWallets, 
  useConnectWallet, 
  useDisconnectWallet, 
  useSuiClientContext
} from '@mysten/dapp-kit';
import { Loader2 } from 'lucide-react';
import { trackEvent, trackError } from '../utils/analytics';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const suiCtx = useSuiClientContext();
  
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  
  const filteredWallets = wallets.filter((w: any) => {
    const isGoogle =
      (w && typeof w.provider === 'string' && w.provider.toLowerCase() === 'google') ||
      (w && typeof w.name === 'string' && /google/i.test(w.name));
    const isRestrictedNetwork = suiCtx.network === 'testnet' || suiCtx.network === 'mainnet';
    return !(isRestrictedNetwork && isGoogle);
  });


  const copyAddress = () => {
    if (!currentAccount) return;
    navigator.clipboard.writeText(currentAccount.address);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 1500);
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (currentAccount && connectingWallet) {
      setJustConnected(true);
      setConnectingWallet(null);

      const timer = setTimeout(() => {
        setJustConnected(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentAccount, connectingWallet]);

  // Removed social login handlers to keep WalletModal focused on extensions

  const handleRegularWalletConnect = (wallet: any) => {
    setConnectingWallet(wallet.name);

    connect(
      { wallet },
      {
        onSuccess: () => {
          console.log('Wallet connected successfully');
          trackEvent('wallet_connect_success', { wallet: wallet.name });
        },
        onError: (error) => {
          console.error('Connection error:', error);
          setConnectingWallet(null);
          alert(`Failed to connect: ${error.message || 'Unknown error'}`);
          trackError('wallet_connect_error', error, { wallet: wallet.name });
        },
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
    setJustConnected(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl p-6 max-w-md w-full bg-linear-to-b from-[#0b1e34] to-[#030712] border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-shadow max-h-[85vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 border-b border-secondary-light/30 pb-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-cyan-400">
            {currentAccount ? 'Wallet Connected' : 'Connect Wallet'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto pr-1 custom-scrollbar scrollbar-hide flex-1 px-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Network</span>
              <span className="text-xs text-cyan-400 font-medium">{suiCtx.network}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['testnet', 'mainnet', 'localnet'].map((n) => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => suiCtx.selectNetwork(n as any)}
                  className={`px-3 py-2 rounded-lg text-sm border ${
                    suiCtx.network === n
                      ? 'bg-linear-to-r from-cyan-500 to-blue-500 text-white border-cyan-400/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border-white/10'
                  }`}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          {currentAccount ? (
            <>
              <AnimatePresence>
                {justConnected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-400 font-semibold">Successfully Connected!</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-secondary-light/10 border border-secondary-light/30 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white text-sm font-medium">Connected Wallet</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-400 text-xs font-semibold">Active</span>
                  </div>
                </div>
                
                <div className="bg-darkblue border border-cyan-500/20 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Wallet Address:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-mono text-sm break-all">
                      {currentAccount.address}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="ml-3 p-2 rounded hover:bg-darkblue-light transition-colors"
                      aria-label="Copy address"
                    >
                      {copiedFull ? (
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H8z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDisconnect}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-red-500/30 font-semibold flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Disconnect Wallet</span>
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-3">
              <p className="text-white mb-6 text-center">Select a wallet to connect to Repeasy</p>
              
              {/* Extension wallets */}

              {filteredWallets.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 mb-4">No wallets detected</p>
                  <p className="text-xs text-gray-500">Please install a Sui-compatible wallet extension</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {filteredWallets.map((wallet, index) => {
                    const isThisWalletConnecting = connectingWallet === wallet.name;
                    
                    return (
                      <motion.button
                        key={wallet.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full mb-3 px-4 py-3 rounded-lg bg-blue-500 text-white border border-blue-500/30 hover:bg-cyan-400 transition-colors flex items-center justify-center ${
                          isThisWalletConnecting 
                            ? 'opacity-80 cursor-wait' 
                            : ''
                        }`}
                        onClick={() => handleRegularWalletConnect(wallet)}
                        disabled={isThisWalletConnecting}
                      >
                        {isThisWalletConnecting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Connecting to {wallet.name}...
                          </>
                        ) : (
                          <>
                            {wallet.icon ? (
                              <img
                                src={wallet.icon}
                                alt={`${wallet.name} icon`}
                                width={20}
                                height={20}
                                className="mr-2 shrink-0 rounded"
                              />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            )}
                            <span className="truncate">Connect {wallet.name}</span>
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-400 text-center">
            By connecting your wallet, you agree to the VeriLens Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default WalletModal;
