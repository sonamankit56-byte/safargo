// Google Identity Services (GIS) & Real Google OAuth Authentication Service
// Seamlessly connects with Google Identity APIs, Google One-Tap, and verified Google profile extraction

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verifiedEmail: boolean;
}

export const GOOGLE_CLIENT_ID_DEFAULT = '748690492368-tc4o23rk7oim12go4qhdhi5jub6tj7l0.apps.googleusercontent.com';

export const getGoogleClientId = (): string => {
  return (
    ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) ||
    localStorage.getItem('safargo_google_client_id') ||
    GOOGLE_CLIENT_ID_DEFAULT
  );
};

export const hasValidGoogleClientId = (): boolean => {
  const id = getGoogleClientId();
  return Boolean(
    id &&
    id.trim().length > 20 &&
    id.includes('.apps.googleusercontent.com')
  );
};

export const saveGoogleClientId = (clientId: string) => {
  try {
    localStorage.setItem('safargo_google_client_id', clientId.trim());
  } catch {}
};

/**
 * Parses JWT token from Google Identity Services credential response
 */
export const parseGoogleJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT:', e);
    return null;
  }
};

/**
 * Initializes Google Identity Services (GSI) if available on window
 */
export const initGoogleIdentityServices = (
  onSuccess: (profile: GoogleUserProfile) => void
) => {
  if (typeof window === 'undefined') return;

  if (!hasValidGoogleClientId()) {
    return;
  }

  const clientId = getGoogleClientId();
  const google = (window as any).google;

  if (google?.accounts?.id) {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            const payload = parseGoogleJwt(response.credential);
            if (payload) {
              onSuccess({
                id: payload.sub || `g-${Date.now()}`,
                email: payload.email,
                name: payload.name || payload.given_name || payload.email.split('@')[0],
                picture: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email}`,
                verifiedEmail: payload.email_verified ?? true
              });
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });
    } catch (err) {
      console.warn('Google Identity Services init notice:', err);
    }
  }
};

/**
 * Renders official Google Sign-In button into a DOM container element
 */
export const renderGoogleSignInButton = (
  element: HTMLElement,
  onSuccess: (profile: GoogleUserProfile) => void,
  options?: { theme?: 'outline' | 'filled_blue' | 'filled_black'; text?: 'signin_with' | 'signup_with' | 'continue_with' }
) => {
  if (typeof window === 'undefined' || !element) return;
  if (!hasValidGoogleClientId()) return;

  initGoogleIdentityServices(onSuccess);

  const google = (window as any).google;
  if (google?.accounts?.id) {
    try {
      google.accounts.id.renderButton(element, {
        theme: options?.theme || 'outline',
        size: 'large',
        type: 'standard',
        text: options?.text || 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 320
      });
    } catch (err) {
      console.warn('renderGoogleSignInButton notice:', err);
    }
  }
};

/**
 * Triggers real Google OAuth2 popup to sign in with user's genuine Google account
 */
export const triggerRealGoogleOAuth = (
  onSuccess: (profile: GoogleUserProfile) => void,
  onError?: (err: any) => void
) => {
  if (typeof window === 'undefined') return;

  // Prevent 401 error if Google Cloud Client ID is not registered
  if (!hasValidGoogleClientId()) {
    if (onError) onError(new Error('CLIENT_ID_NOT_CONFIGURED'));
    return;
  }

  const clientId = getGoogleClientId();
  const google = (window as any).google;

  if (google?.accounts?.oauth2) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.warn('Google OAuth error:', tokenResponse);
            if (onError) onError(tokenResponse.error);
            return;
          }
          if (tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const info = await res.json();
              if (info.email) {
                onSuccess({
                  id: info.sub || `g-${Date.now()}`,
                  email: info.email,
                  name: info.name || info.given_name || info.email.split('@')[0],
                  picture: info.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${info.email}`,
                  verifiedEmail: info.email_verified ?? true
                });
                return;
              }
            } catch (fetchErr) {
              console.error('Failed to fetch userinfo from Google:', fetchErr);
            }
          }
        }
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (e) {
      console.warn('OAuth2 client init failed, falling back:', e);
    }
  }

  // Fallback to Google ID One-Tap prompt
  if (google?.accounts?.id) {
    try {
      initGoogleIdentityServices(onSuccess);
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.info('GSI One-Tap prompt notice:', notification);
        }
      });
      return;
    } catch (err) {
      console.warn('GSI prompt error:', err);
    }
  }

  if (onError) onError(new Error('Google Identity Services not ready'));
};
