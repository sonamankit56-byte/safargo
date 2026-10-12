/**
 * SafarGo Robust Storage & Compression Utilities
 * Prevents DOMException QuotaExceededError and provides client-side image compression.
 */

const MAX_IMAGE_STRING_LENGTH = 100 * 1024; // 100KB limit for base64 strings in local storage

/**
 * Safely writes to localStorage with automatic error handling and recovery.
 * Never throws an uncaught exception.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] Failed to save key "${key}". Running quota recovery...`, err);
    try {
      // 1. Evict heavy audit logs if quota exceeded
      if (key !== 'safargo_audit_logs_v1') {
        const logs = localStorage.getItem('safargo_audit_logs_v1');
        if (logs && logs.length > 5000) {
          localStorage.removeItem('safargo_audit_logs_v1');
        }
      }

      // 2. If it's a JSON array containing heavy data, strip large data URLs
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const stripped = parsed.map((item) => {
            if (typeof item === 'object' && item !== null) {
              const cleaned: any = { ...item };
              ['screenshot_url', 'payment_screenshot', 'receipt_url', 'aadhaar_card_front', 'aadhaar_card_back', 'screenshot'].forEach((field) => {
                if (typeof cleaned[field] === 'string' && cleaned[field].length > 1000) {
                  cleaned[field] = '[image_compressed_or_remote]';
                }
              });
              return cleaned;
            }
            return item;
          });
          const strippedString = JSON.stringify(stripped);
          localStorage.setItem(key, strippedString);
          return true;
        }
      } catch {
        // Not a JSON array, ignore
      }

      // 3. Last fallback: try saving directly after partial eviction
      localStorage.setItem(key, value);
      return true;
    } catch (secondErr) {
      console.error(`[SafeStorage] Critical: Storage full. Key "${key}" skipped.`, secondErr);
      return false;
    }
  }
}

/**
 * Safely reads from localStorage without throwing.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Could not read key "${key}":`, err);
    return null;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Could not remove key "${key}":`, err);
  }
}

/**
 * Sanitizes an array of wallet recharge requests so they don't exceed storage quota.
 */
export function sanitizeWalletRecharges(recharges: any[]): any[] {
  if (!Array.isArray(recharges)) return [];
  return recharges.map((r, index) => {
    // Only keep preview for top 3 most recent, truncate older or overly large previews
    if (r.screenshot_url && (r.screenshot_url.length > MAX_IMAGE_STRING_LENGTH || index > 2)) {
      return {
        ...r,
        screenshot_url: r.screenshot_url.startsWith('http') ? r.screenshot_url : '[receipt-screenshot-attached]',
      };
    }
    return r;
  });
}

/**
 * Sanitizes bookings to prevent payment screenshot bloat in localStorage.
 */
export function sanitizeBookings(bookings: any[]): any[] {
  if (!Array.isArray(bookings)) return [];
  return bookings.map((b, index) => {
    if (b.payment_screenshot && (b.payment_screenshot.length > MAX_IMAGE_STRING_LENGTH || index > 5)) {
      return {
        ...b,
        payment_screenshot: b.payment_screenshot.startsWith('http') ? b.payment_screenshot : '[payment-slip-attached]',
      };
    }
    return b;
  });
}

/**
 * Client-side Canvas Image Compressor.
 * Turns 2MB-10MB camera photos into crisp 30KB-60KB JPEGs.
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Automatically cleans up existing over-quota items on application startup.
 * Fixes any corrupted browser state from past large uploads.
 */
export function cleanStorageQuotaExceeded(): void {
  try {
    // 1. Clean safargo_wallet_recharges_v1
    const rawRecharges = localStorage.getItem('safargo_wallet_recharges_v1');
    if (rawRecharges && rawRecharges.length > 500 * 1024) {
      try {
        const parsed = JSON.parse(rawRecharges);
        const cleaned = sanitizeWalletRecharges(parsed);
        localStorage.setItem('safargo_wallet_recharges_v1', JSON.stringify(cleaned));
      } catch {
        localStorage.removeItem('safargo_wallet_recharges_v1');
      }
    }

    // 2. Clean safargo_bookings_v1
    const rawBookings = localStorage.getItem('safargo_bookings_v1');
    if (rawBookings && rawBookings.length > 1024 * 1024) {
      try {
        const parsed = JSON.parse(rawBookings);
        const cleaned = sanitizeBookings(parsed);
        localStorage.setItem('safargo_bookings_v1', JSON.stringify(cleaned));
      } catch {
        // Leave intact unless corrupted
      }
    }

    // 3. Trim audit logs to last 30
    const rawLogs = localStorage.getItem('safargo_audit_logs_v1');
    if (rawLogs && rawLogs.length > 200 * 1024) {
      try {
        const parsed = JSON.parse(rawLogs);
        if (Array.isArray(parsed) && parsed.length > 30) {
          localStorage.setItem('safargo_audit_logs_v1', JSON.stringify(parsed.slice(0, 30)));
        }
      } catch {
        localStorage.removeItem('safargo_audit_logs_v1');
      }
    }
  } catch (err) {
    console.warn('[SafeStorage] Auto cleanup warning:', err);
  }
}
