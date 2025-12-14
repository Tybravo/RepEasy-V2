import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { trackEvent, trackError } from '../utils/analytics';
import { walrusBlobUrl } from '../utils/walrus';
import { CLOCK_OBJECT_ID, DAPP_REGISTRY_ID, REPEASY_PACKAGE_ID } from '../config/repeasy';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  domainUrl: string;
  twitterUsername: string;
  bannerBlobId: string;
  iconBlobId: string;
  descriptionBlobId: string;
}

export default function VerifyModal(props: VerifyModalProps) {
  const {
    isOpen,
    onClose,
    name,
    domainUrl,
    twitterUsername,
    bannerBlobId,
    iconBlobId,
    descriptionBlobId,
  } = props;
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [step, setStep] = useState<'idle' | 'precheck' | 'building' | 'signing' | 'fetching' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  const [badgeId, setBadgeId] = useState<string | null>(null);

  const canRun = useMemo(() => !!account && !!REPEASY_PACKAGE_ID && !!DAPP_REGISTRY_ID, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const runVerification = async () => {
    try {
      setError(null);
      setStep('precheck');
      if (!account) throw new Error('Connect wallet to continue');
      if (!canRun) throw new Error('Set package and registry IDs in config');

      const inspect = new Transaction();
      const isNameTarget = `${REPEASY_PACKAGE_ID}::repeasy_verify::is_dapp_verified`;
      const isDomainTarget = `${REPEASY_PACKAGE_ID}::repeasy_verify::is_domain_registered`;
      inspect.moveCall({
        target: isNameTarget,
        arguments: [inspect.object(DAPP_REGISTRY_ID), inspect.pure.string(name)],
      });
      inspect.moveCall({
        target: isDomainTarget,
        arguments: [inspect.object(DAPP_REGISTRY_ID), inspect.pure.string(domainUrl)],
      });
      const preview = await client.devInspectTransactionBlock({
        sender: account.address,
        transactionBlock: inspect,
      });
      const nameRet = preview.results?.[0]?.returnValues?.[0]?.[0] as Uint8Array | undefined;
      const domainRet = preview.results?.[1]?.returnValues?.[0]?.[0] as Uint8Array | undefined;
      const nameExists = !!nameRet && nameRet[0] === 1;
      const domainExists = !!domainRet && domainRet[0] === 1;
      if (nameExists || domainExists) {
        throw new Error('Already verified by Repeasy (on-chain)');
      }

      setStep('building');
      const tx = new Transaction();
      const target = `${REPEASY_PACKAGE_ID}::repeasy_verify::verify_dapp`;
      const args = [
        tx.object(DAPP_REGISTRY_ID),
        tx.pure.string(name),
        tx.pure.string(domainUrl),
        tx.pure.string(twitterUsername),
        tx.pure.string(bannerBlobId),
        tx.pure.string(iconBlobId),
        tx.pure.string(descriptionBlobId),
        tx.object(CLOCK_OBJECT_ID),
      ];
      tx.moveCall({ target, arguments: args });

      setStep('signing');
      const res = await signAndExecute({
        transaction: tx,
      });
      setDigest(res.digest);
      trackEvent('verify_tx_success', { digest: res.digest });

      setStep('fetching');
      const full = await client.getTransactionBlock({
        digest: res.digest,
        options: { showObjectChanges: true, showEffects: true },
      });
      const created = (full.objectChanges || []).filter(
        (c: any) =>
          c.type === 'created' &&
          typeof c.objectType === 'string' &&
          c.objectType.endsWith('::repeasy_verify::VerificationBadge')
      );
      if (created.length > 0) {
        const id = (created[0] as any).objectId;
        setBadgeId(id);
      }

      setStep('done');
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(msg);
      setStep('idle');
      trackError('verify_tx_error', e, { name, domainUrl });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep('idle');
      setError(null);
      setDigest(null);
      setBadgeId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl p-6 max-w-2xl w-full bg-linear-to-b from-[#0b1e34] to-[#030712] border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] max-h-[85vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 border-b border-secondary-light/30 pb-4">
          <h3 className="text-xl font-semibold text-cyan-400">Verify dApp</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Name</p>
              <p className="text-white">{name}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Domain</p>
              <p className="text-white break-all">{domainUrl}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Twitter</p>
              <p className="text-white">{twitterUsername}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Blob IDs</p>
              <p className="text-cyan-300 text-xs">banner: {bannerBlobId}</p>
              <p className="text-cyan-300 text-xs">icon: {iconBlobId}</p>
              <p className="text-cyan-300 text-xs">description: {descriptionBlobId}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">Workflow</p>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg border ${step === 'precheck' ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                Pre-check duplicates and inputs
              </div>
              <div className={`p-3 rounded-lg border ${step === 'building' ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                Build transaction
              </div>
              <div className={`p-3 rounded-lg border ${step === 'signing' ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                Sign and execute
              </div>
              <div className={`p-3 rounded-lg border ${step === 'fetching' ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                Fetch results
              </div>
              <div className={`p-3 rounded-lg border ${step === 'done' ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                Completed
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'done' && (
            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Transaction Digest</p>
                <p className="text-white break-all">{digest}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Minted Badge</p>
                {badgeId ? (
                  <p className="text-cyan-300 text-sm break-all">Object ID: {badgeId}</p>
                ) : (
                  <p className="text-gray-400 text-sm">Badge created; details available in transaction</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <img className="w-full h-32 object-cover rounded-lg border border-white/10" src={walrusBlobUrl(bannerBlobId)} alt="Banner" />
                <img className="w-full h-32 object-cover rounded-lg border border-white/10" src={walrusBlobUrl(iconBlobId)} alt="Icon" />
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Data</p>
                  <a className="text-cyan-300 text-xs break-all" href={walrusBlobUrl(descriptionBlobId)} target="_blank" rel="noreferrer">
                    {walrusBlobUrl(descriptionBlobId)}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runVerification}
            disabled={step !== 'idle'}
            className="flex-1 bg-blue-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg border border-blue-500/30"
          >
            Verify
          </motion.button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-gray-300">
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
