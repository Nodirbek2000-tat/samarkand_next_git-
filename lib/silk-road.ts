export const SAMARKAND = { name: "Samarqand", lat: 39.6542, lon: 66.9597 };

/** Historic Great Silk Road cities linked to Samarkand. */
export const CITIES = [
  { name: "Buxoro", lat: 39.7747, lon: 64.4286 },
  { name: "Qashqar", lat: 39.4704, lon: 75.9898 },
  { name: "Sian", lat: 34.3416, lon: 108.9398 },
  { name: "Marv", lat: 37.6633, lon: 62.1917 },
  { name: "Dehli", lat: 28.6139, lon: 77.209 },
  { name: "Tabriz", lat: 38.0962, lon: 46.2738 },
  { name: "Bag‘dod", lat: 33.3152, lon: 44.3661 },
  { name: "Damashq", lat: 33.5138, lon: 36.2765 },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
  { name: "Venetsiya", lat: 45.4408, lon: 12.3155 },
];

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}
