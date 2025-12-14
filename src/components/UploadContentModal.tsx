import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount } from '@mysten/dapp-kit';
import projects from '../data/giverep_projects.json';
import { storeToWalrus } from '../utils/walrus';
import { trackEvent, trackError } from '../utils/analytics';

type UploadedRefs = {
  bannerBlobId: string;
  iconBlobId: string;
  descriptionBlobId: string;
  name: string;
  domainUrl: string;
  twitterUsername: string;
};

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (res: UploadedRefs) => void;
}

export default function UploadContentModal({
  isOpen,
  onClose,
  onUploaded,
}: UploadContentModalProps) {
  const account = useCurrentAccount();
  const [name, setName] = useState('');
  const [domainUrl, setDomainUrl] = useState('');
  const [twitter, setTwitter] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDuplicateLocal = useMemo(() => {
    const lower = (s: string) => s.trim().toLowerCase();
    const byName = projects.some((p: any) => lower(p.name) === lower(name));
    const byTwitter = projects.some(
      (p: any) => lower(p.twitterUsername || '') === lower(twitter.replace(/^@/, ''))
    );
    const byDomain =
      domainUrl &&
      projects.some((p: any) => {
        const href: string = p.href || '';
        try {
          const h = new URL(href);
          const d = new URL(domainUrl);
          return h.hostname.toLowerCase() === d.hostname.toLowerCase();
        } catch {
          return false;
        }
      });
    return byName || byTwitter || byDomain;
  }, [name, twitter, domainUrl]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isDuplicateLocal) {
      setError('This dApp appears already verified in local dataset.');
    } else {
      setError(null);
    }
  }, [isDuplicateLocal]);

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!account) throw new Error('Connect wallet to continue');
      if (!name || !domainUrl || !twitter) throw new Error('Fill all fields');
      if (!bannerFile || !iconFile) throw new Error('Select banner and icon files');
      if (isDuplicateLocal) throw new Error('Already verified by Repeasy (local)');

      const meta = {
        name,
        domain_url: domainUrl,
        twitter_username: twitter.replace(/^@/, ''),
        owner_address: account.address,
      };

      const [banner, icon, description] = await Promise.all([
        storeToWalrus(bannerFile),
        storeToWalrus(iconFile),
        storeToWalrus(JSON.stringify(meta)),
      ]);

      const result: UploadedRefs = {
        bannerBlobId: banner.blob_id,
        iconBlobId: icon.blob_id,
        descriptionBlobId: description.blob_id,
        name,
        domainUrl,
        twitterUsername: meta.twitter_username,
      };

      trackEvent('walrus_upload_success', {
        bannerBlobId: result.bannerBlobId,
        iconBlobId: result.iconBlobId,
        descriptionBlobId: result.descriptionBlobId,
      });
      onUploaded(result);
      onClose();
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(msg);
      trackError('walrus_upload_fail', e, { name, domainUrl, twitter });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl p-6 max-w-2xl w-full bg-linear-to-b from-[#0b1e34] to-[#030712] border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-shadow max-h-[85vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 border-b border-secondary-light/30 pb-4">
          <h3 className="text-xl font-semibold text-cyan-400">Upload dApp Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-2 md:px-3 flex-1 space-y-3">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 mt-3">
            <label className="block text-sm text-gray-300">Name</label>
            <div className="rounded-2xl bg-white/10 backdrop-blur-lg px-3 py-2 border border-white/10 shadow-inner focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-400 text-sm"
                placeholder="My dApp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Domain URL</label>
            <div className="rounded-2xl bg-white/10 backdrop-blur-lg px-3 py-2 border border-white/10 shadow-inner focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-400 text-sm"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Twitter Username</label>
            <div className="rounded-2xl bg-white/10 backdrop-blur-lg px-3 py-2 border border-white/10 shadow-inner focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-400 text-sm"
                placeholder="@handle"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Banner Image</label>
            <input
              id="banner-file"
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="banner-file"
              className="flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-lg px-4 py-6 border border-white/10 shadow-inner hover:bg-white/15 transition-colors cursor-pointer text-center"
            >
              <span className="text-xs text-gray-300">
                {bannerFile ? `Selected: ${bannerFile.name}` : 'Click to select banner image'}
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Icon Image</label>
            <input
              id="icon-file"
              type="file"
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="icon-file"
              className="flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-lg px-4 py-6 border border-white/10 shadow-inner hover:bg-white/15 transition-colors cursor-pointer text-center"
            >
              <span className="text-xs text-gray-300">
                {iconFile ? `Selected: ${iconFile.name}` : 'Click to select icon image'}
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg border border-blue-500/30"
          >
            {loading ? 'Uploading…' : 'Upload to Walrus'}
          </motion.button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-gray-300">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
