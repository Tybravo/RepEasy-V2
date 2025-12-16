"use client";

import { useSuiClientContext } from '@mysten/dapp-kit';
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki';
import { useEffect, useState } from 'react';

export function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    if (!isEnokiNetwork(network)) return;
    try {
      const redirectUrl = import.meta.env.VITE_GOOGLE_REDIRECT_URL || `${window.location.origin}/auth`;
      const { unregister } = registerEnokiWallets({
        apiKey: import.meta.env.VITE_ENOKI_PUBLIC_API_KEY!,
        providers: {
          google: {
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
            redirectUrl,
          },
        },
        client: client as any,
        network,
      });

      setRegistrationStatus('success');

      return () => {
        console.log('🔄 Unregistering Enoki wallets');
        unregister();
      };
    } catch (error) {
      console.error('❌ Enoki registration error:', error);
      setRegistrationStatus('error');
    }
  }, [client, network]);

  // Visual debug indicator (remove in production)
  if (import.meta.env.DEV) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '8px 12px',
        background: registrationStatus === 'success' ? '#10b981' :
          registrationStatus === 'error' ? '#ef4444' : '#f59e0b',
        color: 'white',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        Enoki: {registrationStatus}
      </div>
    );
  }

  return null;
}
