/**
 * SafarGo High-Reliability Real-Time Cloud Sync Service
 * Powers instant cross-device and multi-tab live sync between Admin and Agent portals.
 * Uses ntfy.sh (open pub/sub with SSE) for multi-device sync,
 * combined with BroadcastChannel for zero-latency same-device tab sync.
 */

export type CloudSyncEvent =
  | {
      type: 'BOOKING_CREATED';
      booking: any;
      timestamp: number;
    }
  | {
      type: 'BOOKING_CONFIRMED';
      bookingId: string;
      booking: any;
      pnr?: string;
      agentId?: string;
      timestamp: number;
    }
  | {
      type: 'BOOKING_REJECTED';
      bookingId: string;
      reason: string;
      timestamp: number;
    }
  | {
      type: 'RECHARGE_REQUESTED';
      recharge: any;
      timestamp: number;
    }
  | {
      type: 'RECHARGE_APPROVED';
      rechargeId: string;
      recharge: any;
      agentId?: string;
      amount?: number;
      timestamp: number;
    }
  | {
      type: 'RECHARGE_REJECTED';
      rechargeId: string;
      reason: string;
      timestamp: number;
    }
  | {
      type: 'WALLET_ADJUSTED';
      agentId: string;
      amount: number;
      newBalance: number;
      timestamp: number;
    };

const SYNC_TOPIC = 'safargo_cloud_sync_v1';
const NTFY_URL = `https://ntfy.sh/${SYNC_TOPIC}`;
const BROADCAST_CHANNEL_NAME = 'safargo_live_sync';

// Local BroadcastChannel instance
let localChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    localChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {}
}

/**
 * Broadcast an event to ALL devices and tabs
 */
export async function broadcastCloudEvent(event: CloudSyncEvent): Promise<void> {
  // 1. Same-device multi-tab BroadcastChannel
  if (localChannel) {
    try {
      localChannel.postMessage(event);
    } catch (e) {
      console.warn('[Sync] BroadcastChannel post error:', e);
    }
  }

  // 2. Cross-device Cloud pub/sub via ntfy.sh
  try {
    const payload = JSON.stringify(event);
    await fetch(NTFY_URL, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'Title': 'SafarGo Live Event',
      },
    });
  } catch (err) {
    console.warn('[Sync] Cloud broadcast network notice:', err);
  }
}

/**
 * Subscribe to live cloud events across devices and tabs
 */
export function subscribeToCloudEvents(onEvent: (event: CloudSyncEvent) => void): () => void {
  let isSubscribed = true;

  // Track processed event IDs to avoid double-processing
  const processedEventKeys = new Set<string>();

  const handleIncomingEvent = (event: CloudSyncEvent) => {
    if (!event || !event.type) return;
    const key = `${event.type}_${(event as any).bookingId || (event as any).rechargeId || (event as any).agentId}_${event.timestamp}`;
    if (processedEventKeys.has(key)) return;
    processedEventKeys.add(key);

    // Keep set bounded
    if (processedEventKeys.size > 200) {
      const firstKey = processedEventKeys.values().next().value;
      if (firstKey) processedEventKeys.delete(firstKey);
    }

    onEvent(event);
  };

  // 1. Same-device multi-tab listener
  const handleBcMessage = (msgEvent: MessageEvent) => {
    if (!isSubscribed) return;
    if (msgEvent.data && typeof msgEvent.data === 'object') {
      handleIncomingEvent(msgEvent.data as CloudSyncEvent);
    }
  };

  if (localChannel) {
    localChannel.addEventListener('message', handleBcMessage);
  }

  // 2. Cross-device Server-Sent Events (SSE) listener
  let eventSource: EventSource | null = null;
  const connectSse = () => {
    if (!isSubscribed || typeof window === 'undefined') return;
    try {
      eventSource = new EventSource(`${NTFY_URL}/sse`);
      eventSource.onmessage = (e) => {
        if (!isSubscribed) return;
        try {
          const raw = JSON.parse(e.data);
          if (raw.event === 'message' && raw.message) {
            const parsedEvent = JSON.parse(raw.message);
            if (parsedEvent && parsedEvent.type) {
              handleIncomingEvent(parsedEvent as CloudSyncEvent);
            }
          }
        } catch {
          // heartbeat or non-json message, ignore
        }
      };
      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
          if (isSubscribed) setTimeout(connectSse, 4000);
        }
      };
    } catch (err) {
      console.warn('[Sync] SSE connection notice:', err);
    }
  };

  connectSse();

  // 3. Fallback Periodic Poller for mobile browsers in background
  let lastPollTime = Math.floor(Date.now() / 1000) - 15;
  const pollInterval = setInterval(async () => {
    if (!isSubscribed) return;
    try {
      const res = await fetch(`${NTFY_URL}/json?poll=1&since=${lastPollTime}`);
      if (res.ok) {
        lastPollTime = Math.floor(Date.now() / 1000);
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line) continue;
          try {
            const item = JSON.parse(line);
            if (item.event === 'message' && item.message) {
              const ev = JSON.parse(item.message);
              if (ev && ev.type) {
                handleIncomingEvent(ev as CloudSyncEvent);
              }
            }
          } catch {}
        }
      }
    } catch {}
  }, 3500);

  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    if (localChannel) {
      localChannel.removeEventListener('message', handleBcMessage);
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
