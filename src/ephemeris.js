import { SwissEphemeris } from "@swisseph/browser";
import { Planet } from "@swisseph/core";
import tzLookup from "tz-lookup";
import { DateTime } from "luxon";

// Singleton instance
let sweInstance = null;
let isInitialized = false;

// Zodiac signs in order (0° Aries = index 0)
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// -----------------------------
// Math helpers
// -----------------------------
function normalizeDeg(x) {
  return ((x % 360) + 360) % 360;
}

// Convert longitude (0-360°) to sign and degree
function longitudeToSign(longitude) {
  const normalized = normalizeDeg(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degree = Math.floor(normalized % 30);
  const minutes = Math.floor((normalized - Math.floor(normalized)) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minutes,
    totalDegrees: normalized,
  };
}

// Swiss Ephemeris house cusps are sometimes [0, cusp1..cusp12] (length 13)
// We want exactly 12 values: cusp1..cusp12
function sanitizeCusps(cuspsRaw) {
  if (!Array.isArray(cuspsRaw)) return [];

  // Typical SwissEph: cusps[0] unused (0), cusps[1..12] are valid
  if (cuspsRaw.length === 13 && Math.abs(cuspsRaw[0]) < 1e-9) {
    return cuspsRaw.slice(1).map(normalizeDeg);
  }

  // Some wrappers already give 12 cusps
  if (cuspsRaw.length === 12) {
    return cuspsRaw.map(normalizeDeg);
  }

  // Fallback: take the last 12
  return cuspsRaw.slice(-12).map(normalizeDeg);
}

// Determine which house a longitude falls in
function getHouseFromCusps(planetLongitude, cusps12) {
  const lon = normalizeDeg(planetLongitude);

  for (let i = 0; i < 12; i++) {
    const start = cusps12[i];
    const end = cusps12[(i + 1) % 12];

    // Wrap-around (e.g., start=350°, end=20°)
    if (end < start) {
      if (lon >= start || lon < end) return i + 1;
    } else {
      if (lon >= start && lon < end) return i + 1;
    }
  }
  return 1;
}

// -----------------------------
// Initialize Swiss Ephemeris
// -----------------------------
export async function initEphemeris() {
  if (isInitialized && sweInstance) return sweInstance;

  sweInstance = new SwissEphemeris();
  await sweInstance.init();
  isInitialized = true;
  return sweInstance;
}

// -----------------------------
// City database (now uses IANA timezones)
// -----------------------------
const CITY_DATABASE = {
  // North America
  "new york": { lat: 40.7128, lng: -74.0060, tz: "America/New_York", name: "New York, NY" },
  "los angeles": { lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles", name: "Los Angeles, CA" },
  "chicago": { lat: 41.8781, lng: -87.6298, tz: "America/Chicago", name: "Chicago, IL" },
  "houston": { lat: 29.7604, lng: -95.3698, tz: "America/Chicago", name: "Houston, TX" },
  "phoenix": { lat: 33.4484, lng: -112.0740, tz: "America/Phoenix", name: "Phoenix, AZ" }, // no DST
  "philadelphia": { lat: 39.9526, lng: -75.1652, tz: "America/New_York", name: "Philadelphia, PA" },
  "san francisco": { lat: 37.7749, lng: -122.4194, tz: "America/Los_Angeles", name: "San Francisco, CA" },
  "seattle": { lat: 47.6062, lng: -122.3321, tz: "America/Los_Angeles", name: "Seattle, WA" },
  "denver": { lat: 39.7392, lng: -104.9903, tz: "America/Denver", name: "Denver, CO" },
  "boston": { lat: 42.3601, lng: -71.0589, tz: "America/New_York", name: "Boston, MA" },
  "miami": { lat: 25.7617, lng: -80.1918, tz: "America/New_York", name: "Miami, FL" },

  // Canada
  "toronto": { lat: 43.6532, lng: -79.3832, tz: "America/Toronto", name: "Toronto, ON" },
  "montreal": { lat: 45.5017, lng: -73.5673, tz: "America/Toronto", name: "Montreal, QC" },
  "vancouver": { lat: 49.2827, lng: -123.1207, tz: "America/Vancouver", name: "Vancouver, BC" },
  "welland": { lat: 42.9923, lng: -79.2489, tz: "America/Toronto", name: "Welland, ON" },
  "niagara falls": { lat: 43.0896, lng: -79.0849, tz: "America/Toronto", name: "Niagara Falls, ON" },

  // Europe
  "london": { lat: 51.5074, lng: -0.1278, tz: "Europe/London", name: "London, UK" },
  "paris": { lat: 48.8566, lng: 2.3522, tz: "Europe/Paris", name: "Paris, France" },
  "berlin": { lat: 52.5200, lng: 13.4050, tz: "Europe/Berlin", name: "Berlin, Germany" },
  "rome": { lat: 41.9028, lng: 12.4964, tz: "Europe/Rome", name: "Rome, Italy" },
  "madrid": { lat: 40.4168, lng: -3.7038, tz: "Europe/Madrid", name: "Madrid, Spain" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, tz: "Europe/Amsterdam", name: "Amsterdam, Netherlands" },
  "dublin": { lat: 53.3498, lng: -6.2603, tz: "Europe/Dublin", name: "Dublin, Ireland" },
  "vienna": { lat: 48.2082, lng: 16.3738, tz: "Europe/Vienna", name: "Vienna, Austria" },

  // Asia/Pacific
  "tokyo": { lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo", name: "Tokyo, Japan" },
  "sydney": { lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney", name: "Sydney, Australia" },
  "singapore": { lat: 1.3521, lng: 103.8198, tz: "Asia/Singapore", name: "Singapore" },
  "hong kong": { lat: 22.3193, lng: 114.1694, tz: "Asia/Hong_Kong", name: "Hong Kong" },
  "mumbai": { lat: 19.0760, lng: 72.8777, tz: "Asia/Kolkata", name: "Mumbai, India" },
  "delhi": { lat: 28.6139, lng: 77.2090, tz: "Asia/Kolkata", name: "Delhi, India" },
  "seoul": { lat: 37.5665, lng: 126.9780, tz: "Asia/Seoul", name: "Seoul, South Korea" },

  // South America
  "sao paulo": { lat: -23.5505, lng: -46.6333, tz: "America/Sao_Paulo", name: "São Paulo, Brazil" },
  "rio de janeiro": { lat: -22.9068, lng: -43.1729, tz: "America/Sao_Paulo", name: "Rio de Janeiro, Brazil" },
  "buenos aires": { lat: -34.6037, lng: -58.3816, tz: "America/Argentina/Buenos_Aires", name: "Buenos Aires, Argentina" },
};

// -----------------------------
// Geocode location
// -----------------------------
export async function geocodeLocation(locationString) {
  const normalized = locationString.toLowerCase().trim();

  // Check DB first
  for (const [key, data] of Object.entries(CITY_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        latitude: data.lat,
        longitude: data.lng,
        timeZone: data.tz,
        name: data.name,
        source: "database",
      };
    }
  }

  // Fallback: OpenStreetMap Nominatim
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Natavium Astrology App" },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      // ✅ Accurate timezone from coordinates (not guessed)
      const timeZone = tzLookup(lat, lng);

      return {
        latitude: lat,
        longitude: lng,
        timeZone,
        name: result.display_name.split(",").slice(0, 2).join(","),
        source: "nominatim",
      };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }

  return null;
}

// -----------------------------
// DST-safe local -> UTC conversion
// -----------------------------
export function localToUTC_IANA({ year, month, day, hour, minute, timeZone }) {
  // Luxon handles DST transitions + month/year rollovers correctly
  const dt = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: timeZone }
  );

  // If invalid (rare: nonexistent time during DST spring-forward), shift forward safely
  if (!dt.isValid) {
    const shifted = DateTime.fromObject(
      { year, month, day, hour, minute },
      { zone: timeZone }
    ).plus({ hours: 1 });

    return shifted.toUTC().toJSDate();
  }

  return dt.toUTC().toJSDate();
}

// -----------------------------
// Core natal chart calculation (expects UTC Date)
// -----------------------------
export async function calculateNatalChart(birthDateUTC, latitude, longitude) {
  const swe = await initEphemeris();

  // Convert to Julian Day (using UTC Date)
  const jd = swe.dateToJulianDay(birthDateUTC);

  // Houses (Placidus)
  // Use string 'P' for Placidus house system
  const houses = swe.calculateHouses(jd, latitude, longitude, 'P');
  const cusps12 = sanitizeCusps(houses.cusps);

  // Planets
  const sunPos = swe.calculatePosition(jd, Planet.Sun);
  const moonPos = swe.calculatePosition(jd, Planet.Moon);
  const mercuryPos = swe.calculatePosition(jd, Planet.Mercury);
  const venusPos = swe.calculatePosition(jd, Planet.Venus);
  const marsPos = swe.calculatePosition(jd, Planet.Mars);
  const jupiterPos = swe.calculatePosition(jd, Planet.Jupiter);
  const saturnPos = swe.calculatePosition(jd, Planet.Saturn);
  const uranusPos = swe.calculatePosition(jd, Planet.Uranus);
  const neptunePos = swe.calculatePosition(jd, Planet.Neptune);
  const plutoPos = swe.calculatePosition(jd, Planet.Pluto);

  // Build chart result
  const chart = {
    sun: {
      ...longitudeToSign(sunPos.longitude),
      house: getHouseFromCusps(sunPos.longitude, cusps12),
      longitude: normalizeDeg(sunPos.longitude),
    },
    moon: {
      ...longitudeToSign(moonPos.longitude),
      house: getHouseFromCusps(moonPos.longitude, cusps12),
      longitude: normalizeDeg(moonPos.longitude),
    },
    rising: {
      ...longitudeToSign(houses.ascendant),
      longitude: normalizeDeg(houses.ascendant),
    },
    mercury: {
      ...longitudeToSign(mercuryPos.longitude),
      house: getHouseFromCusps(mercuryPos.longitude, cusps12),
      longitude: normalizeDeg(mercuryPos.longitude),
    },
    venus: {
      ...longitudeToSign(venusPos.longitude),
      house: getHouseFromCusps(venusPos.longitude, cusps12),
      longitude: normalizeDeg(venusPos.longitude),
    },
    mars: {
      ...longitudeToSign(marsPos.longitude),
      house: getHouseFromCusps(marsPos.longitude, cusps12),
      longitude: normalizeDeg(marsPos.longitude),
    },
    jupiter: {
      ...longitudeToSign(jupiterPos.longitude),
      house: getHouseFromCusps(jupiterPos.longitude, cusps12),
      longitude: normalizeDeg(jupiterPos.longitude),
    },
    saturn: {
      ...longitudeToSign(saturnPos.longitude),
      house: getHouseFromCusps(saturnPos.longitude, cusps12),
      longitude: normalizeDeg(saturnPos.longitude),
    },
    uranus: {
      ...longitudeToSign(uranusPos.longitude),
      house: getHouseFromCusps(uranusPos.longitude, cusps12),
      longitude: normalizeDeg(uranusPos.longitude),
    },
    neptune: {
      ...longitudeToSign(neptunePos.longitude),
      house: getHouseFromCusps(neptunePos.longitude, cusps12),
      longitude: normalizeDeg(neptunePos.longitude),
    },
    pluto: {
      ...longitudeToSign(plutoPos.longitude),
      house: getHouseFromCusps(plutoPos.longitude, cusps12),
      longitude: normalizeDeg(plutoPos.longitude),
    },

    houses: {
      cusps: cusps12, // ✅ always 12 items now
      ascendant: normalizeDeg(houses.ascendant),
      mc: normalizeDeg(houses.mc),
    },

    julianDay: jd,
  };

  return chart;
}

// -----------------------------
// Convenience function: local birth time + location string -> chart
// -----------------------------
export async function calculateNatalChartFromLocal({
  year,
  month,
  day,
  hour,
  minute,
  locationString,
}) {
  const location = await geocodeLocation(locationString);
  if (!location) {
    throw new Error("Could not resolve location.");
  }

  const birthDateUTC = localToUTC_IANA({
    year,
    month,
    day,
    hour,
    minute,
    timeZone: location.timeZone,
  });

  const chart = await calculateNatalChart(
    birthDateUTC,
    location.latitude,
    location.longitude
  );

  return {
    ...chart,
    meta: {
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      timeZone: location.timeZone,
      birthDateUTC: birthDateUTC.toISOString(),
      locationSource: location.source,
    },
  };
}
