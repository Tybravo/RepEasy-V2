// src/app/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent, trackError } from "../utils/analytics";
import { decodeJwt, isJwt } from "../utils/jwt";
import { setEphemeral } from "../utils/session";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      trackEvent('auth_callback_received');
      const url = new URL(window.location.href);
      const idToken = url.searchParams.get('id_token') || url.searchParams.get('jwt') || '';
      if (idToken && isJwt(idToken)) {
        const decoded = decodeJwt(idToken);
        if (decoded) {
          const aud = decoded.payload?.aud;
          const iss = decoded.payload?.iss || '';
          const expectedAud = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
          const audOk = !expectedAud || (Array.isArray(aud) ? aud.includes(expectedAud) : aud === expectedAud);
          const issOk = typeof iss === 'string' && (iss.includes('accounts.google.com') || iss.includes('https://accounts.google.com'));
          trackEvent('jwt_received', { audOk, issOk });
          setEphemeral('oauth_id_token', idToken, 5 * 60 * 1000);
        }
      }
    } catch (e) {
      trackError('auth_callback_error', e);
    } finally {
      const redirectPath = sessionStorage.getItem('auth_redirect') || '/';
      sessionStorage.removeItem('auth_redirect');
      // Strip query params to avoid leaking tokens
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}

