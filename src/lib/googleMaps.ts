// ============================================================================
// SAFARGO GOOGLE MAPS PLATFORM INTEGRATION SERVICE
// Compliant with Google Maps Platform Terms of Service & Modern APIs
// Attribution: gmp_git_agentskills_v1
// ============================================================================

export interface LatLng {
  lat: number;
  lng: number;
}

// Comprehensive Coordinates Registry for Madhya Pradesh & Major Indian Routes
export const CITY_COORDINATES: Record<string, LatLng> = {
  // Madhya Pradesh Key Hubs
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'ujjain': { lat: 23.1765, lng: 75.7885 },
  'sagar': { lat: 23.8388, lng: 78.7378 },
  'dewas': { lat: 22.9676, lng: 76.0534 },
  'satna': { lat: 24.6005, lng: 80.8322 },
  'ratlam': { lat: 23.3315, lng: 75.0367 },
  'rewa': { lat: 24.5362, lng: 81.3037 },
  'singrauli': { lat: 24.1997, lng: 82.6645 },
  'burhanpur': { lat: 21.3148, lng: 76.2238 },
  'khandwa': { lat: 21.8314, lng: 76.3498 },
  'chhindwara': { lat: 22.0574, lng: 78.9382 },
  'guna': { lat: 24.6467, lng: 77.3117 },
  'shivpuri': { lat: 25.4243, lng: 77.6599 },
  'vidisha': { lat: 23.5251, lng: 77.8081 },
  'chhatarpur': { lat: 24.9164, lng: 79.5811 },
  'damoh': { lat: 23.8382, lng: 79.4422 },
  'mandsaur': { lat: 24.0722, lng: 75.0682 },
  'khargone': { lat: 21.8236, lng: 75.6139 },
  'neemuch': { lat: 24.4754, lng: 74.8722 },
  'pithampur': { lat: 22.6146, lng: 75.6917 },
  'hoshangabad': { lat: 22.7519, lng: 77.7289 },
  'narmadapuram': { lat: 22.7519, lng: 77.7289 },
  'itarsi': { lat: 22.6139, lng: 77.7608 },
  'sehore': { lat: 23.2030, lng: 77.0844 },
  'betul': { lat: 21.9014, lng: 77.9014 },
  'datia': { lat: 25.6687, lng: 78.4608 },
  'nagda': { lat: 23.4542, lng: 75.4143 },
  'omkareshwar': { lat: 22.2458, lng: 76.1517 },
  'maheshwar': { lat: 22.1764, lng: 75.5863 },
  'khajuraho': { lat: 24.8318, lng: 79.9199 },
  'orchha': { lat: 25.3512, lng: 78.6418 },
  'pachmarhi': { lat: 22.4674, lng: 78.4346 },

  // Connected Major Metros & States
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 }
};

/**
 * Get coordinates for any city name with case-insensitive and partial matching.
 */
export function getCityCoordinates(cityName: string): LatLng {
  if (!cityName) return { lat: 22.7196, lng: 75.8577 }; // default Indore
  const clean = cityName.trim().toLowerCase();

  if (CITY_COORDINATES[clean]) {
    return CITY_COORDINATES[clean];
  }

  // Substring match
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  // Fallback to central MP
  return { lat: 22.9734, lng: 78.6569 };
}

/**
 * Generate a direct Google Maps Directions URL (Opens in native Google Maps app or browser).
 * ToS Compliant & zero cost.
 */
export function getGoogleMapsDirectionsUrl(
  origin: string,
  destination: string,
  travelMode: 'driving' | 'transit' | 'walking' = 'driving'
): string {
  const o = encodeURIComponent(origin.trim());
  const d = encodeURIComponent(destination.trim());
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=${travelMode}`;
}

/**
 * Generate a direct Google Maps Search URL for boarding / dropping points.
 */
export function getGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

/**
 * Generate a Google Maps Embed Directions URL for responsive in-app iframe rendering.
 */
export function getGoogleMapsEmbedUrl(origin: string, destination: string, apiKey?: string): string {
  const o = encodeURIComponent(origin.trim());
  const d = encodeURIComponent(destination.trim());
  
  if (apiKey && apiKey.trim().length > 10) {
    return `https://www.google.com/maps/embed/v1/directions?key=${apiKey.trim()}&origin=${o}&destination=${d}&mode=driving`;
  }

  // Fallback embed query for rapid zero-config prototyping
  return `https://maps.google.com/maps?saddr=${o}&daddr=${d}&output=embed&z=7`;
}

/**
 * Retrieve the active Google Maps API Key from environment or local storage.
 */
export function getGoogleMapsApiKey(): string {
  const fromStorage = localStorage.getItem('safargo_gmaps_api_key');
  if (fromStorage && fromStorage.trim().length > 5) {
    return fromStorage.trim();
  }
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
}

/**
 * Store Google Maps API key in local storage.
 */
export function setStoredGoogleMapsApiKey(key: string): void {
  if (key && key.trim().length > 0) {
    localStorage.setItem('safargo_gmaps_api_key', key.trim());
  } else {
    localStorage.removeItem('safargo_gmaps_api_key');
  }
}

/**
 * Interpolate an intermediate live position along route based on progress percentage (0 - 100).
 */
export function calculateLivePosition(origin: LatLng, dest: LatLng, progressPct: number): LatLng {
  const factor = Math.max(0, Math.min(100, progressPct)) / 100;
  return {
    lat: Number((origin.lat + (dest.lat - origin.lat) * factor).toFixed(6)),
    lng: Number((origin.lng + (dest.lng - origin.lng) * factor).toFixed(6))
  };
}
