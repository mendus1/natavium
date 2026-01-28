// api/utils/server-ephemeris.js
// Server-side chart calculation using the Node.js swisseph package.
// Mirrors the output of src/ephemeris.js (browser) so both produce the same JSON structure.
import swisseph from 'swisseph';
import tzLookup from 'tz-lookup';
import { DateTime } from 'luxon';

// ─── Zodiac helpers ───

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function normalizeDeg(x) {
  return ((x % 360) + 360) % 360;
}

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

function getHouseFromCusps(planetLongitude, cusps12) {
  const lon = normalizeDeg(planetLongitude);
  for (let i = 0; i < 12; i++) {
    const start = cusps12[i];
    const end = cusps12[(i + 1) % 12];
    if (end < start) {
      if (lon >= start || lon < end) return i + 1;
    } else {
      if (lon >= start && lon < end) return i + 1;
    }
  }
  return 1;
}

// ─── Promisified swisseph wrappers ───

function calcPlanet(jd, planet) {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(jd, planet, swisseph.SEFLG_SPEED, (result) => {
      if (result.error) return reject(new Error(result.error));
      resolve(result);
    });
  });
}

function calcHouses(jd, lat, lon) {
  return new Promise((resolve, reject) => {
    swisseph.swe_houses(jd, lat, lon, 'P', (result) => {
      if (result.error) return reject(new Error(result.error));
      resolve(result);
    });
  });
}

// ─── Geocoding (same as src/ephemeris.js) ───

const CITY_DATABASE = {
  "new york": { lat: 40.7128, lng: -74.0060, tz: "America/New_York", name: "New York, NY" },
  "los angeles": { lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles", name: "Los Angeles, CA" },
  "chicago": { lat: 41.8781, lng: -87.6298, tz: "America/Chicago", name: "Chicago, IL" },
  "houston": { lat: 29.7604, lng: -95.3698, tz: "America/Chicago", name: "Houston, TX" },
  "phoenix": { lat: 33.4484, lng: -112.0740, tz: "America/Phoenix", name: "Phoenix, AZ" },
  "philadelphia": { lat: 39.9526, lng: -75.1652, tz: "America/New_York", name: "Philadelphia, PA" },
  "san francisco": { lat: 37.7749, lng: -122.4194, tz: "America/Los_Angeles", name: "San Francisco, CA" },
  "seattle": { lat: 47.6062, lng: -122.3321, tz: "America/Los_Angeles", name: "Seattle, WA" },
  "denver": { lat: 39.7392, lng: -104.9903, tz: "America/Denver", name: "Denver, CO" },
  "boston": { lat: 42.3601, lng: -71.0589, tz: "America/New_York", name: "Boston, MA" },
  "miami": { lat: 25.7617, lng: -80.1918, tz: "America/New_York", name: "Miami, FL" },
  "toronto": { lat: 43.6532, lng: -79.3832, tz: "America/Toronto", name: "Toronto, ON" },
  "montreal": { lat: 45.5017, lng: -73.5673, tz: "America/Toronto", name: "Montreal, QC" },
  "vancouver": { lat: 49.2827, lng: -123.1207, tz: "America/Vancouver", name: "Vancouver, BC" },
  "welland": { lat: 42.9923, lng: -79.2489, tz: "America/Toronto", name: "Welland, ON" },
  "niagara falls": { lat: 43.0896, lng: -79.0849, tz: "America/Toronto", name: "Niagara Falls, ON" },
  "london": { lat: 51.5074, lng: -0.1278, tz: "Europe/London", name: "London, UK" },
  "paris": { lat: 48.8566, lng: 2.3522, tz: "Europe/Paris", name: "Paris, France" },
  "berlin": { lat: 52.5200, lng: 13.4050, tz: "Europe/Berlin", name: "Berlin, Germany" },
  "rome": { lat: 41.9028, lng: 12.4964, tz: "Europe/Rome", name: "Rome, Italy" },
  "madrid": { lat: 40.4168, lng: -3.7038, tz: "Europe/Madrid", name: "Madrid, Spain" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, tz: "Europe/Amsterdam", name: "Amsterdam, Netherlands" },
  "dublin": { lat: 53.3498, lng: -6.2603, tz: "Europe/Dublin", name: "Dublin, Ireland" },
  "vienna": { lat: 48.2082, lng: 16.3738, tz: "Europe/Vienna", name: "Vienna, Austria" },
  "tokyo": { lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo", name: "Tokyo, Japan" },
  "sydney": { lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney", name: "Sydney, Australia" },
  "singapore": { lat: 1.3521, lng: 103.8198, tz: "Asia/Singapore", name: "Singapore" },
  "hong kong": { lat: 22.3193, lng: 114.1694, tz: "Asia/Hong_Kong", name: "Hong Kong" },
  "mumbai": { lat: 19.0760, lng: 72.8777, tz: "Asia/Kolkata", name: "Mumbai, India" },
  "delhi": { lat: 28.6139, lng: 77.2090, tz: "Asia/Kolkata", name: "Delhi, India" },
  "seoul": { lat: 37.5665, lng: 126.9780, tz: "Asia/Seoul", name: "Seoul, South Korea" },
  "sao paulo": { lat: -23.5505, lng: -46.6333, tz: "America/Sao_Paulo", name: "São Paulo, Brazil" },
  "rio de janeiro": { lat: -22.9068, lng: -43.1729, tz: "America/Sao_Paulo", name: "Rio de Janeiro, Brazil" },
  "buenos aires": { lat: -34.6037, lng: -58.3816, tz: "America/Argentina/Buenos_Aires", name: "Buenos Aires, Argentina" },
};

async function geocodeLocation(locationString) {
  const normalized = locationString.toLowerCase().trim();

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
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Natavium Astrology App" },
  });
  const data = await response.json();

  if (Array.isArray(data) && data.length > 0) {
    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const timeZone = tzLookup(lat, lng);
    return {
      latitude: lat,
      longitude: lng,
      timeZone,
      name: result.display_name.split(",").slice(0, 2).join(","),
      source: "nominatim",
    };
  }

  return null;
}

// ─── DST-safe local → UTC ───

function localToUTC_IANA({ year, month, day, hour, minute, timeZone }) {
  const dt = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: timeZone }
  );

  if (!dt.isValid) {
    const shifted = DateTime.fromObject(
      { year, month, day, hour, minute },
      { zone: timeZone }
    ).plus({ hours: 1 });
    return shifted.toUTC().toJSDate();
  }

  return dt.toUTC().toJSDate();
}

// ─── Core calculation ───

async function calculateNatalChart(birthDateUTC, latitude, longitude) {
  // Convert JS Date → decimal hours → Julian Day
  const y = birthDateUTC.getUTCFullYear();
  const m = birthDateUTC.getUTCMonth() + 1;
  const d = birthDateUTC.getUTCDate();
  const h = birthDateUTC.getUTCHours()
    + birthDateUTC.getUTCMinutes() / 60
    + birthDateUTC.getUTCSeconds() / 3600;

  const jd = swisseph.swe_julday(y, m, d, h, swisseph.SE_GREG_CAL);

  // Houses (Placidus)
  const houses = await calcHouses(jd, latitude, longitude);
  const cusps12 = houses.house.map(normalizeDeg); // already 12 items, 0-indexed

  // Planets
  const [sunPos, moonPos, mercuryPos, venusPos, marsPos, jupiterPos, saturnPos, uranusPos, neptunePos, plutoPos] =
    await Promise.all([
      calcPlanet(jd, swisseph.SE_SUN),
      calcPlanet(jd, swisseph.SE_MOON),
      calcPlanet(jd, swisseph.SE_MERCURY),
      calcPlanet(jd, swisseph.SE_VENUS),
      calcPlanet(jd, swisseph.SE_MARS),
      calcPlanet(jd, swisseph.SE_JUPITER),
      calcPlanet(jd, swisseph.SE_SATURN),
      calcPlanet(jd, swisseph.SE_URANUS),
      calcPlanet(jd, swisseph.SE_NEPTUNE),
      calcPlanet(jd, swisseph.SE_PLUTO),
    ]);

  function buildPlanet(pos) {
    return {
      ...longitudeToSign(pos.longitude),
      house: getHouseFromCusps(pos.longitude, cusps12),
      longitude: normalizeDeg(pos.longitude),
    };
  }

  return {
    sun: buildPlanet(sunPos),
    moon: buildPlanet(moonPos),
    rising: {
      ...longitudeToSign(houses.ascendant),
      longitude: normalizeDeg(houses.ascendant),
    },
    mercury: buildPlanet(mercuryPos),
    venus: buildPlanet(venusPos),
    mars: buildPlanet(marsPos),
    jupiter: buildPlanet(jupiterPos),
    saturn: buildPlanet(saturnPos),
    uranus: buildPlanet(uranusPos),
    neptune: buildPlanet(neptunePos),
    pluto: buildPlanet(plutoPos),
    houses: {
      cusps: cusps12,
      ascendant: normalizeDeg(houses.ascendant),
      mc: normalizeDeg(houses.mc),
    },
    julianDay: jd,
  };
}

// ─── Public API (same signature as src/ephemeris.js) ───

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
