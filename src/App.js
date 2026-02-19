import React, { useState, useEffect, createContext, useContext } from "react";
import html2canvas from 'html2canvas';
import { Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import { calculateNatalChartFromLocal } from "./ephemeris";
import BrandStar from "./components/BrandStar";
import ReportsPage from "./ReportsPage";
import { supabase } from "./supabaseClient";
import LogoBlue from "./LogoBlue.png";
import {
  Sparkles,
  Lock,
  Star,
  Moon,
  Sun,
  Zap,
  Heart,
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  Check,
  X,
  Info,
  Gift,
  Crown,
  Mail,
  Loader2,
  Home,
  TrendingUp,
  Cake,
  ShoppingCart,
} from "lucide-react";
import "./App.css";
import "./theme-cosmic.css";
import "./theme-tokens.css";

function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem('natavium_sessionId');
    if (existing) return existing;
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem('natavium_sessionId', id);
    return id;
  } catch {
    return null;
  }
}

// =========================
// Ongoing (Coming Soon)
// =========================
function OngoingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#69D2FF]" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold gold-gradient-text">Ongoing Reports</h1>
              <p className="t-text-muted text-sm">Coming Soon — weekly guidance tied to your natal chart.</p>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-[#12142A]/80 border border-white/10 hover:bg-[#12142A] hover:border-white/20 transition-all text-sm"
          >
            Back
          </button>
        </div>

        <div className="card-solid rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold gold-gradient-text">Weekly Astro Weather</h2>
              <p className="t-text-muted mt-2">
                A weekly forecast tailored to your chart: themes, best days, watch-outs, and where to focus.
              </p>
            </div>
            <span className="text-xs bg-[#69D2FF]/20 px-2 py-1 rounded text-[#69D2FF] border border-[#69D2FF]/20">Coming Soon</span>
          </div>

          <div className="mt-6 bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold mb-2">Sample (preview)</div>
            <div className="space-y-2 text-sm t-text-muted">
              <p><span className="text-white/90 font-semibold">Theme:</span> Understand Your Star Power.</p>
              <p><span className="text-white/90 font-semibold">Best days:</span> Midweek for decisions, weekend for connection.</p>
              <p><span className="text-white/90 font-semibold">Watch-outs:</span> Overcommitting or reading too much into signals.</p>
            </div>

            <button
              onClick={async () => {
                await logEvent('coming_soon_interest_clicked', { product: 'weekly_astro_weather', surface: 'ongoing_page', action: 'i_want_this_weekly' });
              }}
              className="mt-5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              I want this weekly
            </button>
          </div>
        </div>

        <div className="card-solid rounded-2xl p-6">
          <div className="text-sm t-text-muted">
            You’ll be able to subscribe soon. For now, you can still purchase one-off deep dives from your chart.
          </div>
        </div>
      </div>
    </div>
  );
}

async function logEvent(eventName, props = {}) {
  try {
    const sessionId = getOrCreateSessionId();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    await fetch('/api/log-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        eventName,
        props,
        sessionId,
      }),
    });
  } catch {
    // ignore
  }
}

// Theme Context for global theme switching
const ThemeContext = createContext({
  theme: 'theme-original',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Custom Instagram icon (lucide deprecated it)
const InstagramIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Custom TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

// Custom X/Twitter icon
const XIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Social Links Component
const SocialLinks = ({ className = "", iconClassName = "w-5 h-5" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <a
      href="https://x.com/Natavium"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 hover:text-yellow-300 transition-all duration-200"
      aria-label="Follow us on X"
    >
      <XIcon className={iconClassName} />
    </a>
    <a
      href="https://instagram.com/natavium"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 hover:text-yellow-300 transition-all duration-200"
      aria-label="Follow us on Instagram"
    >
      <InstagramIcon className={iconClassName} />
    </a>
    <a
      href="https://tiktok.com/@natavium"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 hover:text-yellow-300 transition-all duration-200"
      aria-label="Follow us on TikTok"
    >
      <TikTokIcon className={iconClassName} />
    </a>
  </div>
);

// =========================
// Service Definitions (individually purchasable)
// =========================
const SERVICES = [
  { id: "natal", name: "Natal Chart Analysis", price: 4.99, description: "A snapshot of the sky at your birth that maps the positions of the planets, signs, and houses to describe your core personality, motivations, and life themes. The foundation.", icon: Star },
  { id: "house_deep_dive", name: "House Deep Dive", price: 2.99, description: "A focused reading of the 12 houses in your chart, showing where key life areas (like relationships, career, home, and health) are emphasized and shape your experiences and patterns.", icon: Home },
  { id: "solar_return", name: "Solar Return", price: 4.99, description: "A forecast for your year ahead timed to the moment the Sun returns to its exact birth position.", icon: Cake },
  { id: "transit_report", name: "Transit Report", price: 1.99, description: "A timing-focused forecast that tracks current planetary movements, important celestial events, and how they interact with your natal chart. Periods of change, growth, or pressure are highlighted and suggestions made on how to deal with them.", icon: TrendingUp },
  { id: "compatibility", name: "Compatibility ×1", price: 3.99, description: "Known as synastry, this compares two people's charts to explore emotional, romantic, and communication dynamics. It identifies strengths, friction points, and what helps the relationship thrive.", icon: Heart },
  { id: "compatibility_3x", name: "Compatibility ×3", price: 9.99, description: "3 compatibility comparisons. Compare your chart with up to three different people.", icon: Heart },
];

// Bundle Definitions (discount packages)
// =========================
const BUNDLES = {
  essential: {
    id: "essential",
    name: "Essential",
    price: 9.99,
    description: "Natal Chart + House Deep Dive + Solar Return",
    icon: Gift,
    color: "purple",
    includes: ["natal", "house_deep_dive", "solar_return"],
    essentialIncludes: false,
    services: [
      { name: "Natal Chart Analysis", description: "A snapshot of the sky at your birth that maps the positions of the planets, signs, and houses to describe your core personality, motivations, and life themes. The foundation." },
      { name: "House Deep Dive", description: "A focused reading of the 12 houses in your chart, showing where key life areas (like relationships, career, home, and health) are emphasized and shape your experiences and patterns." },
      { name: "Solar Return Analysis", description: "A forecast for your year ahead timed to the moment the Sun returns to its exact birth position." }
    ],
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    price: 12.99,
    description: "Everything in Essential + Compatibility + Transit Report",
    icon: Crown,
    color: "pink",
    essentialIncludes: true,
    includes: ["natal", "house_deep_dive", "solar_return", "transit_report", "compatibility"],
    services: [
      { name: "Compatibility ×1", description: "Known as synastry, this compares two people's charts to explore emotional, romantic, and communication dynamics. It identifies strengths, friction points, and what helps the relationship thrive." },
      { name: "Transit Report", description: "A timing-focused forecast that tracks current planetary movements, important celestial events, and how they interact with your natal chart. Periods of change, growth, or pressure are highlighted and suggestions made on how to deal with them." },
      { name: "", description: "" }
    ],
  },
};

// =========================
// Dashboard Tab Configuration
// =========================
// Bundle contents:
// - Base: Natal only
// - Essential: Natal + House Deep Dive + Solar Return
// - Ultimate: Essential + Vedic + Transit + Compatibility
const DASHBOARD_TABS = [
  {
    id: 'natal',
    label: 'Natal Chart',
    icon: Star,
    requiresPurchase: true,
    priceIfLocked: 4.99,
    includedIn: ['base', 'essential', 'ultimate'],
    description: 'A snapshot of the sky at your birth that maps the positions of the planets, signs, and houses to describe your core personality, motivations, and life themes.',
  },
  {
    id: 'house_deep_dive',
    label: 'Deep Dive',
    icon: Home,
    requiresPurchase: true,
    priceIfLocked: 2.99,
    includedIn: ['essential', 'ultimate'],
    description: 'Detailed analysis of each of your 12 houses - career, relationships, finances, and more.',
  },
  {
    id: 'solar_return',
    label: 'Solar Return',
    icon: Cake,
    requiresPurchase: true,
    priceIfLocked: 4.99,
    includedIn: ['essential', 'ultimate'],
    description: 'Your year-ahead forecast based on your upcoming birthday chart.',
  },
  {
    id: 'transit_report',
    label: 'Transits',
    icon: TrendingUp,
    requiresPurchase: true,
    priceIfLocked: 1.99,
    includedIn: ['ultimate'],
    description: 'Current planetary movements affecting your chart - 3-month forecast included.',
  },
  {
    id: 'compatibility',
    label: 'Compatibility',
    icon: Heart,
    requiresPurchase: true,
    priceIfLocked: 3.99,
    includedIn: ['ultimate'],
    description: 'Compare your chart with a partner or friend to discover harmony and growth areas.',
  },
];

// =========================
// Helper Functions
// =========================
// eslint-disable-next-line no-unused-vars
const houseSuffix = (n) => {
  const num = Number(n);
  if (num % 100 >= 11 && num % 100 <= 13) return "th";
  switch (num % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatBirthDate = (birthMonth, birthDay, birthYear) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const m = parseInt(birthMonth, 10);
  if (m && birthDay && birthYear) {
    return `${months[m - 1]} ${birthDay}, ${birthYear}`;
  }
  return "";
};

// =========================
// Learn More Page - Grid of topic tiles with sidebar
// =========================
function LearnMorePage() {
  const navigate = useNavigate();
  const { topic } = useParams();
  const [selectedTopic, setSelectedTopic] = useState(topic || null);

  const topics = [
    {
      id: "natal-chart",
      title: "Natal Chart",
      description: "What a natal chart is and how to read it",
      icon: Star,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Understanding Your Natal Chart</h2>
            <p className="t-text-muted">
              Your natal chart is a cosmic snapshot of the sky at your birth moment.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">The Chart Wheel</h3>
            <p className="t-text-muted">
              A circular map divided into 12 houses and 12 zodiac signs. Planets are placed according to their positions at your birth, showing how cosmic energies manifest in your life.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Key Components</h3>
            <p className="t-text-muted">
              Planets represent different drives and energies. Signs show how those energies express. Houses indicate where in life they manifest. Aspects reveal how planets interact.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Reading Your Chart</h3>
            <p className="t-text-muted">
              Start with your Sun, Moon, and Rising (the &quot;Big Three&quot;). Then explore house placements and aspects. Look for patterns and repeating themes that tell your unique story.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "foundations",
      title: "Foundations",
      description: "The basics of astrology and how charts work",
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Astrology Foundations</h2>
            <p className="t-text-muted">
              Understanding the fundamental building blocks of astrology.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">What is a Birth Chart?</h3>
            <p className="t-text-muted">
              A birth chart (or natal chart) is a snapshot of the sky at the exact moment you were born. 
              It maps where all the planets were in relation to Earth, creating a unique cosmic fingerprint.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">The Zodiac Wheel</h3>
            <p className="t-text-muted">
              The zodiac is a 360° circle divided into 12 signs, each representing 30° of sky. 
              Each sign has its own characteristics, elements, and ruling planets.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "big-three",
      title: "Big Three and Angles",
      description: "Sun, Moon, Rising and the four chart angles",
      icon: Star,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">The Big Three</h2>
            <p className="t-text-muted">
              Your Sun, Moon, and Rising signs form the core of your astrological identity.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Sun Sign</h3>
            <p className="t-text-muted">
              Represents your core identity, ego, and conscious self. This is what most people know as their "sign."
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#69D2FF] mb-3">Moon Sign</h3>
            <p className="t-text-muted">
              Represents your emotional nature, instincts, and subconscious patterns. 
              It shows how you process feelings and what you need for emotional security.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Rising Sign (Ascendant)</h3>
            <p className="t-text-muted">
              The mask you wear and how others perceive you. It represents your approach to life and first impressions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "planets-signs",
      title: "Planets in Signs",
      description: "How each planet expresses through the zodiac",
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Planets in Signs</h2>
            <p className="t-text-muted">
              Each planet has a unique expression through every zodiac sign.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Personal Planets</h3>
            <p className="t-text-muted">
              The Sun, Moon, Mercury, Venus, and Mars move quickly through the zodiac and represent 
              your personal drives, communication style, relationships, and actions.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Social & Outer Planets</h3>
            <p className="t-text-muted">
              Jupiter, Saturn, Uranus, Neptune, and Pluto move slower and represent generational themes, 
              life lessons, and transformative forces.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "planets-houses",
      title: "Planets in Houses",
      description: "Where planetary energy manifests in your life",
      icon: Home,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Planets in Houses</h2>
            <p className="t-text-muted">
              The 12 houses represent different areas of life where planetary energy manifests.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Angular Houses (1, 4, 7, 10)</h3>
            <p className="t-text-muted">
              These are the most active houses, representing self, home, relationships, and career. 
              Planets here have strong, visible influence.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Succedent & Cadent Houses</h3>
            <p className="t-text-muted">
              Succedent houses (2, 5, 8, 11) relate to resources and values. 
              Cadent houses (3, 6, 9, 12) relate to learning, service, and spirituality.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "aspects",
      title: "Aspects",
      description: "The conversations between planets in your chart",
      icon: Heart,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Aspects</h2>
            <p className="t-text-muted">
              Aspects are the angles between planets, showing how they interact and influence each other.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Major Aspects</h3>
            <p className="t-text-muted">
              Conjunction (0°), Sextile (60°), Square (90°), Trine (120°), and Opposition (180°). 
              These are the most significant planetary relationships.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Harmonious vs Challenging</h3>
            <p className="t-text-muted">
              Trines and sextiles show easy flow and natural talents. Squares and oppositions 
              show tension that drives growth and mastery.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "synthesis",
      title: "Synthesis & Chart Stories",
      description: "Putting it all together into a coherent narrative",
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Chart Synthesis</h2>
            <p className="t-text-muted">
              True astrological skill lies in weaving all chart elements into a meaningful story.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Chart Patterns</h3>
            <p className="t-text-muted">
              Look for geometric patterns like T-squares, Grand Trines, and Stellia. 
              These reveal major life themes and repeating patterns.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Element & Mode Balance</h3>
            <p className="t-text-muted">
              Check the balance of fire, earth, air, and water elements. 
              Also note the balance of cardinal, fixed, and mutable modes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "systems",
      title: "Systems and Traditions",
      description: "Tropical, Sidereal, and other astrological approaches",
      icon: Crown,
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-6">Understanding Astrology Systems</h2>
            <p className="t-text-muted mb-8">
              Different astrological traditions offer unique perspectives on the same cosmic data.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                Astrology At A Glance
              </h3>
              <p className="t-text-muted mb-3">
                <strong className="text-white">Astrology captures the sky at a specific moment, such as your birth, in a chart wheel.</strong>
              </p>
              <p className="t-text-muted">
                This wheel divides the sky in two main ways: zodiac signs, which are 12 equal 30° slices along the apparent path of the sun, and houses, which are 12 slices based on your local horizon and meridian at the birth time and location. Houses can shift rapidly throughout the day. Planets, including the Sun and Moon, are placed in the chart according to their measured positions.
              </p>
              <p className="t-text-muted">
                Astrological interpretations stem from patterns like the signs planets occupy, the houses they fall into, and the angles between planets, known as aspects. For quick clarity, signs relate to the sun's path, while houses pertain to your local sky at that moment.
              </p>
            </div>
            <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                Sun-Sign Astrology
              </h3>
              <p className="t-text-muted mb-3">
                <strong className="text-white">This is the kind of general astrology you find in magazines.</strong>
              </p>
              <p className="t-text-muted">
                Sun-sign astrology is the simplified style presented as daily horoscopes. It focuses exclusively on the Sun's sign at your birth.
              </p>
              <p className="t-text-muted">
                Elements like the Moon, rising sign, houses, and aspects are not considered. This leads to very broad and general interpretations.
              </p>
            </div>
            <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                Natal-Chart Astrology
              </h3>
              <p className="t-text-muted mb-3">
                <strong className="text-white">This is the basis of most personalized astrology systems.</strong>
              </p>
              <p className="t-text-muted">
                Unlike Sun-sign astrology natal-chart astrology (which Natavium specializes in) is based on a specific person's birth date/time and location.
              </p>
              <p className="t-text-muted">
                Positions of the Sun, Moon, planets, key chart points, houses, and aspects are determined for specific birth times and places.
                This means analyses are more targeted. Natavium computes placements using Swiss Ephemeris (which itself uses NASA data).
                Natal-charts are the basis of both Tropical and Sidereal astrological systems.
              </p>
            </div>

            <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                Western (Tropical) Astrology
              </h3>
              <p className="t-text-muted mb-3">
                <strong className="text-white">This system (which Natavium offers) is the most popular.</strong>
              </p>
              <p className="t-text-muted">
                This Systems anchors the zodiac at 0° Aries, defined by the March equinox or vernal point, making the system season-based as signs are measured from this equinox.
              </p>
              <p className="t-text-muted">
                The 1st house begins at the Ascendant, the eastern horizon at birth, rather than at 0° Aries—houses and signs are distinct layers.
                Similarly, you're considered an Aries if the Sun is in the tropical sign of Aries, not because it's in the 1st house.
              </p>
            </div>

            <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                Western (Sidereal) Astrology
              </h3>
              <p className="t-text-muted mb-3">
                <strong className="text-white">This system (which Natavium offers) anchors the zodiac to the fixed stars instead of the equinox.</strong>
              </p>
              <p className="t-text-muted">
                Western sidereal astrology uses the same planets and 360° circle as tropical but accounts for Earth's axial precession. This results in a gradual
                drift between tropical and sidereal systems over centuries. The offset, called the ayanamsa, allows conversion between them.
              </p>
              <p className="t-text-muted">
                Importantly, sidereal shifts the sign labels and degrees, not the houses. This means your "sign" may differ from more popular tropical Western astrology. Some say sidereal is more accurate. Other that it is simply a different reference system.
              </p>
            </div>

            <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-[#69D2FF] mb-3">
                Vedic (Jyotish) Sidereal Astrology
              </h3>
              <p className="t-text-muted mb-3">
                <strong className="text-white">This is a traditional Indian system with a unique interpretative framwework.</strong>
              </p>
              <p className="t-text-muted">
                Jyotish employs a sidereal zodiac aligned with the stars rather than the tropical equinox-based system. It commonly uses the Lahiri ayanamsa for its offset calculations.
              </p>
              <p className="t-text-muted">
                Beyond core elements shared with Western systems, it incorporates nakshatras (lunar mansions) and dashas (planetary timing periods), which are less central in modern Western astrology.
                The system offer predictive astrology, timing life events, and understanding karma and destiny. Natavium will soon offer Jyotish Astrology
              </p>
            </div>
          </div>

          <div className="bg-[#D6B35A]/10 rounded-xl p-6 border border-[#D6B35A]/30">
            <h3 className="text-xl font-bold mb-3">Which System Should I Use?</h3>
            <p className="t-text-muted">
              We suggest start with <strong className="text-white">Western (Tropical)</strong> - it's most accessible and your sign will likely match what you've always thought it was. If you're looking for
              something new, perhaps <strong className="text-white">Western (Sidereal)</strong>. You may even get a new sign! Vedic analyses will be available soon.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "forecasting",
      title: "Forecasting Basics",
      description: "Transits, progressions, and predictive techniques",
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Forecasting Basics</h2>
            <p className="t-text-muted">
              Learn how astrologers predict timing and future trends.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Transits</h3>
            <p className="t-text-muted">
              Current planetary positions as they move through the sky and aspect your natal chart. 
              Transits trigger events and shifts in different life areas.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Solar Returns</h3>
            <p className="t-text-muted">
              The chart cast for the moment the Sun returns to its exact birth position each year. 
              This reveals themes for your coming year.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Progressions</h3>
            <p className="t-text-muted">
              A symbolic timing technique where each day after birth represents a year of life. 
              Progressions show your internal evolution.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "examples",
      title: "Example Charts",
      description: "Famous charts analyzed for learning",
      icon: Crown,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-4">Example Charts</h2>
            <p className="t-text-muted">
              Study famous charts to see astrology in action.
            </p>
          </div>
          <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Coming Soon</h3>
            <p className="t-text-muted">
              We're curating a collection of fascinating charts from history, 
              entertainment, and public life to illustrate astrological principles.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleTopicClick = (topicId) => {
    setSelectedTopic(topicId);
    navigate(`/learn/${topicId}`, { replace: true });
  };

  const handleCloseSidebar = () => {
    setSelectedTopic(null);
    navigate('/learn', { replace: true });
  };

  const selectedTopicData = topics.find(t => t.id === selectedTopic);

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold gold-gradient-text mb-2">
              Learn Astrology
            </h1>
            <p className="t-text-muted text-lg">
              Master the language of the stars
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </button>
        </div>

        {/* Main content area with optional sidebar */}
        <div className="flex gap-6">
          {/* Topic Grid - takes full width when no topic selected, or shrinks when sidebar open */}
          <div className={`transition-all duration-300 ${selectedTopic ? 'w-1/3' : 'w-full'}`}>
            <div className={`grid gap-4 ${selectedTopic ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {topics.map((topic) => {
                const IconComponent = topic.icon;
                const isSelected = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className={`card-solid rounded-2xl p-6 text-left transition-all hover:scale-[1.02] ${
                      isSelected 
                        ? 'ring-2 ring-[#D6B35A] bg-[#D6B35A]/10' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#D6B35A]/20' : 'bg-white/10'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${isSelected ? 'text-[#D6B35A]' : 'icon-gold'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-semibold t-text-primary mb-1">
                          {topic.title}
                        </h3>
                        <p className="text-sm t-text-muted leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar - shows when topic selected */}
          {selectedTopic && selectedTopicData && (
            <div className="w-2/3">
              <div className="card-solid rounded-2xl p-8 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <button
                  onClick={handleCloseSidebar}
                  className="mb-6 px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Back to Topics
                </button>
                {selectedTopicData.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function InfoPage() {
  const navigate = useNavigate();
  const { page } = useParams();
  const infoPage = page || "systems";

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center"
        >
          <X className="w-4 h-4 mr-2" />
          Close
        </button>

        <div className="card-solid rounded-2xl p-8">
          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
            <button
              onClick={() => navigate("/info/systems")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                infoPage === "systems" ? "bg-[#D6B35A]/20 text-[#D6B35A]" : "hover:bg-white/10"
              }`}
            >
              Astrology Systems
            </button>

            <button
              onClick={() => navigate("/info/approach")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                infoPage === "approach" ? "bg-[#D6B35A]/20 text-[#D6B35A]" : "hover:bg-white/10"
              }`}
            >
              Our Approach
            </button>

            <button
              onClick={() => navigate("/info/services")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                infoPage === "services" ? "bg-[#D6B35A]/20 text-[#D6B35A]" : "hover:bg-white/10"
              }`}
            >
              Services & Pricing
            </button>
          </div>

          {infoPage === "systems" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-6">Understanding Astrology Systems</h2>
                <p className="t-text-muted mb-8">
                  Different astrological traditions offer unique perspectives on the same cosmic data.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                    Astrology At A Glance
                  </h3>
                  <p className="t-text-muted mb-3">
                    <strong className="text-white">Astrology captures the sky at a specific moment, such as your birth, in a chart wheel.</strong> 
                  </p>
                  <p className="t-text-muted">
                    This wheel divides the sky in two main ways: zodiac signs, which are 12 equal 30° slices along the apparent path of the sun, and houses, which are 12 slices based on your local horizon and meridian at the birth time and location. Houses can shift rapidly throughout the day. Planets, including the Sun and Moon, are placed in the chart according to their measured positions.
                  </p>
                  <p className="t-text-muted">
                    Astrological interpretations stem from patterns like the signs planets occupy, the houses they fall into, and the angles between planets, known as aspects. For quick clarity, signs relate to the sun’s path, while houses pertain to your local sky at that moment. 
                  </p>
                </div>
                <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                    Sun-Sign Astrology
                  </h3>
                  <p className="t-text-muted mb-3">
                    <strong className="text-white">This is the kind of general astrology you find in magazines.</strong>
                  </p>
                  <p className="t-text-muted">
                    Sun-sign astrology is the simplified style presented as daily horoscopes. It focuses exclusively on the Sun's sign at your birth.
                  </p>
                  <p className="t-text-muted">
                    Elements like the Moon, rising sign, houses, and aspects are not considered. This leads to very broad and general interpretations.
                  </p>
                </div>
                <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                    Natal-Chart Astrology
                  </h3>
                  <p className="t-text-muted mb-3">
                    <strong className="text-white">This is the basis of most personalized astrology systems.</strong>
                  </p>
                  <p className="t-text-muted">
                    Unlike Sun-sign astrology natal-chart astrology (which Natavium specializes in) is based on a specific person's birth date/time and location.
                  </p>
                  <p className="t-text-muted">
                    Positions of the Sun, Moon, planets, key chart points, houses, and aspects are determined for specific birth times and places. 
                    This means analyses are more targeted. Natavium computes placements using Swiss Ephemeris (which itself uses NASA data).
                    Natal-charts are the basis of both Tropical and Sidereal astrological systems.
                  </p>
                </div>

                                <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                    Western (Tropical) Astrology
                  </h3>
                  <p className="t-text-muted mb-3">
                    <strong className="text-white">This system (which Natavium offers) is the most popular.</strong>
                  </p>
                  <p className="t-text-muted">
                    This Systems anchors the zodiac at 0° Aries, defined by the March equinox or vernal point, making the system season-based as signs are measured from this equinox.
                  </p>
                  <p className="t-text-muted">
                    The 1st house begins at the Ascendant, the eastern horizon at birth, rather than at 0° Aries—houses and signs are distinct layers.
                    Similarly, you're considered an Aries if the Sun is in the tropical sign of Aries, not because it's in the 1st house.
                  </p>
                </div>

                                <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-[#D6B35A] mb-3">
                    Western (Sidereal) Astrology
                  </h3>
                  <p className="t-text-muted mb-3">
                    <strong className="text-white">This system (which Natavium offers) anchors the zodiac to the fixed stars instead of the equinox.</strong>
                  </p>
                  <p className="t-text-muted">
                    Western sidereal astrology uses the same planets and 360° circle as tropical but accounts for Earth's axial precession. This results in a gradual 
                    drift between tropical and sidereal systems over centuries. The offset, called the ayanamsa, allows conversion between them.
                  </p>
                  <p className="t-text-muted">
                    Importantly, sidereal shifts the sign labels and degrees, not the houses. This means your "sign" may differ from more popular tropical Western astrology. Some say sidereal is more accurate. Other that it is simply a different reference system.
                  </p>
                </div>

                <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-[#69D2FF] mb-3">
                    Vedic (Jyotish) Sidereal Astrology
                  </h3>
                  <p className="t-text-muted mb-3">
                    <strong className="text-white">This is a traditional Indian system with a unique interpretative framwework.</strong>
                  </p>
                  <p className="t-text-muted">
                    Jyotish employs a sidereal zodiac aligned with the stars rather than the tropical equinox-based system. It commonly uses the Lahiri ayanamsa for its offset calculations.
                  </p>
                  <p className="t-text-muted">
                    Beyond core elements shared with Western systems, it incorporates nakshatras (lunar mansions) and dashas (planetary timing periods), which are less central in modern Western astrology. 
                    The system offer predictive astrology, timing life events, and understanding karma and destiny. Natavium will soon offer Jyotish Astrology
                  </p>
                </div>
              </div>

              <div className="bg-[#D6B35A]/10 rounded-xl p-6 border border-[#D6B35A]/30">
                <h3 className="text-xl font-bold mb-3">Which System Should I Use?</h3>
                <p className="t-text-muted">
                  We suggest start with <strong className="text-white">Western (Tropical)</strong> - it's most accessible and your sign will likely match what you've always thought it was. If you're looking for
                  something new, perhaps <strong className="text-white">Western (Sidereal)</strong>. You may even get a new sign! Vedic analyses will be available soon.
                </p>
              </div>
            </div>
          )}

          {infoPage === "approach" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-6">Our Scientific Approach</h2>
                <p className="t-text-muted mb-8">
                  Transparency matters. Here's exactly how Natavium works.
                </p>
              </div>

              <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Chart Calculations</h3>
                <p className="t-text-muted mb-3">
                  We use the <strong className="text-white">Swiss Ephemeris</strong> - which are based on NASA data and the gold standard in astronomical
                  calculations. Planetary positions are accurate to the arc-second.
                </p>
                <p className="t-text-muted">
                  Your birth time and location are converted to precise coordinates for the system you chose, then we
                  calculate where each planet was at that exact moment. For Western Sidereal analysis we use the Fagan-Bradley Ayanamsa.
                  When Vedic charts are introduced the Lahiri Ayanamsa will be used.
                </p>
              </div>

              <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-[#D6B35A] mb-3">AI-Generated Readings</h3>
                <p className="t-text-muted mb-3">
                  Unlike template-based apps, Natavium uses <strong className="text-white">powerful AI models</strong> to actually
                  analyze YOUR specific chart.
                </p>
                <p className="t-text-muted">
                  The AI considers, within the chosen system, how all your placements interact - synthesizing contradictions
                  and identifying patterns unique to YOUR combination.
                </p>
              </div>

              <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-[#D6B35A] mb-3">Privacy & Data</h3>
                <p className="t-text-muted mb-3">
                  <strong className="text-white">Your birth data is private.</strong> We never share or sell your
                  information. Data is encrypted and stored securely.
                </p>
              </div>

              <div className="bg-[#12142A]/60 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-[#D6B35A] mb-3">
                  What Astrology Can and Cannot Do
                </h3>
                <p className="t-text-muted mb-2">
                  <strong className="text-white">Astrology CAN:</strong> Provide insight into personality patterns, life
                  themes, timing of opportunities, relationship dynamics.
                </p>
                <p className="t-text-muted mb-2">
                  <strong className="text-white">Astrology CANNOT:</strong> Predict specific events with certainty,
                  override free will, diagnose medical conditions.
                </p>
                <p className="t-text-muted">
                  Think of astrology as a map, not a mandate. It shows terrain, but YOU choose the
                  path.
                </p>
              </div>
            </div>
          )}

          {infoPage === "services" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-6">Services & Pricing</h2>
                <p className="t-text-muted mb-8">Build your cosmic toolkit at your own pace.</p>
              </div>

              <div className="bg-[#D6B35A]/10 rounded-2xl p-8 border border-[#D6B35A]/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold gold-gradient-text">Your Natal Chart</h3>
                  <div className="text-right">
                    <div className="text-4xl font-bold gold-gradient-text">$4.99</div>
                    <div className="text-sm t-text-muted">One-time</div>
                  </div>
                </div>

                <p className="t-text-muted mb-6">Complete birth chart analysis</p>

                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-[#D6B35A] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Complete birth chart wheel</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-[#D6B35A] mr-2 flex-shrink-0 mt-0.5" />
                    <span>3000+ word AI analysis</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-[#D6B35A] mr-2 flex-shrink-0 mt-0.5" />
                    <span>All 10 planetary placements</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-[#D6B35A] mr-2 flex-shrink-0 mt-0.5" />
                    <span>House positions & aspects</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-[#D6B35A] mr-2 flex-shrink-0 mt-0.5" />
                    <span>2026 forecast included</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-[#D6B35A] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Downloadable PDF</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Add-On Services</h3>
                <p className="t-text-muted mb-6 text-sm">
                  Expand your understanding (available with or after natal chart purchase)
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#12142A]/60 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Compatibility</h4>
                      <span className="text-xl font-bold text-[#69D2FF]">$3.99</span>
                    </div>
                    <p className="text-sm t-text-muted">
                      Compare your chart with partner or friend. Shows harmony and growth areas.
                    </p>
                  </div>

                  <div className="bg-[#12142A]/60 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">House Deep Dive</h4>
                      <span className="text-xl font-bold text-[#69D2FF]">$2.99</span>
                    </div>
                    <p className="text-sm t-text-muted">
                      Detailed analysis of each house in your chart and what it means.
                    </p>
                  </div>

                  <div className="bg-[#12142A]/60 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Solar Return</h4>
                      <span className="text-xl font-bold text-[#69D2FF]">$4.99</span>
                    </div>
                    <p className="text-sm t-text-muted">
                      Your year ahead forecast. Birthday prediction for coming year.
                    </p>
                  </div>

                  <div className="bg-[#12142A]/60 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Vedic Chart</h4>
                      <span className="text-xl font-bold text-[#69D2FF]">$2.99</span>
                    </div>
                    <p className="text-sm t-text-muted">
                      Eastern astrology perspective. Often reveals different signs!
                    </p>
                  </div>

                  <div className="bg-[#12142A]/60 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Transit Report</h4>
                      <span className="text-xl font-bold text-[#69D2FF]">$1.99</span>
                    </div>
                    <p className="text-sm t-text-muted">
                      Current planetary movements affecting YOUR chart this month.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#69D2FF]/10 rounded-2xl p-6 border border-[#69D2FF]/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Natavium Plus (Coming Soon)</h3>
                    <p className="t-text-muted text-sm">Optional subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#69D2FF]">$2.99</div>
                    <div className="text-sm t-text-muted">/month</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-[#69D2FF] mr-2" />
                    <span>Daily personalized horoscope</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-[#69D2FF] mr-2" />
                    <span>Weekly transit updates</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-[#69D2FF] mr-2" />
                    <span>Unlimited compatibility reports</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-[#69D2FF] mr-2" />
                    <span>All chart systems</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="text-xs t-text-muted">
                    Explore a sample to see what this will feel like.
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await logEvent('coming_soon_view_sample_clicked', { product: 'natavium_plus', surface: 'services_pricing' });
                      navigate('/ongoing');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
                  >
                    View sample
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================
// Landing
// =========================
function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [useNewDesign, setUseNewDesign] = useState(false);

  // Get theme label for display
  const getThemeLabel = () => {
    if (theme === 'theme-daylight') return '☀️';
    if (theme === 'theme-v2') return '🌙';
    return '🌅';
  };

  // theme-original now uses the new landing page design
  if (theme === 'theme-original') {
    return <LandingPageNew navigate={navigate} theme={theme} toggleTheme={toggleTheme} getThemeLabel={getThemeLabel} setUseNewDesign={setUseNewDesign} />;
  }

  // If using new design toggle, render the WIP version
  if (useNewDesign) {
    return <LandingPageNew navigate={navigate} theme={theme} toggleTheme={toggleTheme} getThemeLabel={getThemeLabel} setUseNewDesign={setUseNewDesign} />;
  }

  // Original landing page design (for theme-v2 and theme-daylight)
  return <LandingPageOriginal navigate={navigate} theme={theme} toggleTheme={toggleTheme} getThemeLabel={getThemeLabel} setUseNewDesign={setUseNewDesign} />;
}

// Original Landing Page Design
function LandingPageOriginal({ navigate, theme, toggleTheme, getThemeLabel, setUseNewDesign }) {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <img src={LogoBlue} alt="Natavium Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain" />
            <h1 className="text-4xl md:text-5xl font-serif">Natavium</h1>
          </div>
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setUseNewDesign(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              title="Switch to new design"
            >
              Try New Design
            </button>
            <button
              onClick={toggleTheme}
              className="text-2xl"
              title="Toggle theme"
            >
              {getThemeLabel()}
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="t-text-primary hover:opacity-70 transition-opacity"
            >
              Reports
            </button>
            <button
              onClick={() => navigate("/learn")}
              className="t-text-primary hover:opacity-70 transition-opacity"
            >
              Learn
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero-vignette text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
            Your Cosmic Blueprint,
            <br />
            <span className="gold-gradient-text">Decoded by AI</span>
          </h2>
          <p className="text-xl t-text-muted mb-8 max-w-2xl mx-auto">
            Discover the profound insights hidden in your birth chart. Get personalized astrological guidance powered by advanced AI.
          </p>
          <button
            onClick={() => navigate("/input")}
            className="gold-gradient-btn px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Journey
          </button>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="card-illuminated p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-2xl font-serif mb-3">Birth Chart Analysis</h3>
            <p className="t-text-muted">
              Your complete cosmic blueprint decoded with AI-powered insights about your personality, strengths, and life path.
            </p>
          </div>
          <div className="card-illuminated p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-4">💕</div>
            <h3 className="text-2xl font-serif mb-3">Relationship Insights</h3>
            <p className="t-text-muted">
              Understand compatibility patterns and navigate your connections with cosmic wisdom about love and partnership.
            </p>
          </div>
          <div className="card-illuminated p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-4">🌈</div>
            <h3 className="text-2xl font-serif mb-3">Timing & Transits</h3>
            <p className="t-text-muted">
              Know when to act, when to wait, and what cosmic energies are influencing your journey right now.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center t-text-muted text-sm pt-12 border-t t-border">
          <div className="flex justify-center gap-8 mb-4">
            <button onClick={() => navigate("/impressum")} className="hover:opacity-70 transition-opacity">
              Impressum
            </button>
            <button onClick={() => navigate("/datenschutz")} className="hover:opacity-70 transition-opacity">
              Datenschutz
            </button>
          </div>
          <p>© 2024 Natavium. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

// New Landing Page Design (WIP)
function LandingPageNew({ navigate, theme, toggleTheme, getThemeLabel, setUseNewDesign }) {
  const [cometActive, setCometActive] = React.useState(false);
  const [cometTrajectory, setCometTrajectory] = React.useState(0);

  // Rotation angles for each trajectory
  // Base: tail points left (180°), head points right (0°)
  // Flip right-moving trajectories by 180° so head leads
  const trajectoryRotations = {
    0: 45,     // Top-left to bottom-right (was -135, flip: -135+180 = 45)
    1: 135,    // Top-right to bottom-left (left-moving, correct)
    2: 30,     // Left to right-lower (was -150, flip: -150+180 = 30)
    3: 150,    // Right to left-lower (left-moving, correct)
    4: 60,     // Top-center to bottom-right (was -120, flip: -120+180 = 60)
    5: 120     // Top-right to bottom-left (left-moving, correct)
  };

  React.useEffect(() => {
    const triggerComet = () => {
      // Random trajectory (0-5 for different angles)
      setCometTrajectory(Math.floor(Math.random() * 6));
      setCometActive(true);
      
      // Reset after animation completes (6.5 seconds)
      setTimeout(() => {
        setCometActive(false);
      }, 6500);
    };

    // Trigger first comet after random delay
    const initialDelay = Math.random() * 1000 + 1000; // 5-10 seconds
    const initialTimer = setTimeout(triggerComet, initialDelay);

    // Set up recurring comets
    const interval = setInterval(() => {
      const delay = Math.random() * 5000 + 5000; // 5-10 seconds
      setTimeout(triggerComet, delay);
    }, 9000); // Check every 9 seconds (within the 5-10 second range)

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden"  style={{ 
      background: '#ffffff',
      backgroundColor: '#faf8f4',
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,119,101,0.05) 2px, rgba(139,119,101,0.05) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,119,101,0.05) 2px, rgba(139,119,101,0.05) 4px),
        radial-gradient(ellipse at 30% 50%, rgba(222,184,135,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(210,180,140,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 20%, rgba(245,222,179,0.1) 0%, transparent 40%)
      `
    }}>
        {/* Green gradient overlay on parchment texture - top right corner */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(65, 177, 91, 0.08) 2px, rgba(65, 177, 91, 0.08) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(198, 183, 135, 0.44) 2px, rgba(198, 183, 135, 0.08) 4px),
            radial-gradient(circle at 100% 0%, rgba(3, 248, 60, 0.12) 0%, transparent 35%)
          `
        }}></div>
       

        {/* Golden Morning Sun Orb - Top Left Corner - DOUBLED SIZE */}
        <div className="absolute -top-64 -left-64 w-[768px] h-[768px] pointer-events-none z-0">
          <div className="relative w-full h-full">
            {/* Main sun orb with gradient - doubled */}
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-amber-200/40 via-yellow-100/30 to-transparent blur-3xl"></div>
            <div className="absolute inset-16 rounded-full bg-gradient-radial from-amber-300/30 via-yellow-200/20 to-transparent blur-2xl"></div>
            <div className="absolute inset-32 rounded-full bg-gradient-radial from-yellow-200/40 via-amber-100/25 to-transparent blur-xl"></div>
            
            {/* Soft glow effect */}
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(252, 211, 77, 0.12) 40%, transparent 70%)'
            }}></div>
          </div>
        </div>

        {/* Faint Astrological Chart - Right Side - Spinning Slowly - Aligned with Hero */}
        <div className="absolute -right-64 top-[380px] w-[600px] h-[600px] pointer-events-none z-0 opacity-[0.55]">
          <div className="relative w-full h-full animate-spin-very-slow">
            {/* Outer circle */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
              {/* Main circle */}
              <circle cx="300" cy="300" r="280" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400" />
              
              {/* Inner circles */}
              <circle cx="300" cy="300" r="240" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              <circle cx="300" cy="300" r="200" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              <circle cx="300" cy="300" r="160" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              <circle cx="300" cy="300" r="120" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              
              {/* 12 house divisions - radial lines */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const x1 = 300 + 120 * Math.cos(angle);
                const y1 = 300 + 120 * Math.sin(angle);
                const x2 = 300 + 280 * Math.cos(angle);
                const y2 = 300 + 280 * Math.sin(angle);
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
                );
              })}
              
              {/* Zodiac symbols positions (small dots) */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 + 15) * Math.PI / 180;
                const x = 300 + 260 * Math.cos(angle);
                const y = 300 + 260 * Math.sin(angle);
                return (
                  <circle key={`dot-${i}`} cx={x} cy={y} r="2" fill="currentColor" className="text-gray-400" />
                );
              })}
              
              {/* Aspect lines (connecting random points for authenticity) */}
              <line x1="300" y1="180" x2="380" y2="300" stroke="currentColor" strokeWidth="0.3" className="text-gray-300" strokeDasharray="2,2" />
              <line x1="220" y1="300" x2="300" y2="420" stroke="currentColor" strokeWidth="0.3" className="text-gray-300" strokeDasharray="2,2" />
              <line x1="380" y1="300" x2="300" y2="420" stroke="currentColor" strokeWidth="0.3" className="text-gray-300" strokeDasharray="2,2" />
              
              {/* Center point */}
              <circle cx="300" cy="300" r="3" fill="currentColor" className="text-gray-400" />
            </svg>
          </div>
        </div>

        {/* Decorative Circles - Scattered in blank areas */}
        
        {/* Circle 1 - Small 3D Spinning Sphere - Upper right */}
        <div className="absolute right-[12%] top-[8%] w-[120px] h-[120px] pointer-events-none z-0 opacity-[0.65]">
          <div className="relative w-full h-full animate-spin-very-slow">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Radial gradient for shading */}
                <radialGradient id="sphereShading1" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="rgba(8, 153, 25, 0.4)" />
                  <stop offset="50%" stopColor="rgba(8, 153, 8, 0.25)" />
                  <stop offset="100%" stopColor="rgba(8, 153, 8, 0.15)" />
                </radialGradient>
              </defs>
              
              {/* Shaded sphere background */}
              <circle cx="60" cy="60" r="50" fill="url(#sphereShading1)" />
              
              {/* Outer sphere outline */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              
              {/* Latitude lines */}
              <ellipse cx="60" cy="60" rx="50" ry="12" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-800" />
              <ellipse cx="60" cy="60" rx="50" ry="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-800" />
              <ellipse cx="60" cy="60" rx="50" ry="38" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-800" />
              
              {/* Longitude lines */}
              <ellipse cx="60" cy="60" rx="12" ry="50" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-800" />
              <ellipse cx="60" cy="60" rx="25" ry="50" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-800" />
              <ellipse cx="60" cy="60" rx="38" ry="50" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-800" />
              
              {/* Center meridian */}
              <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="0.5" className="text-gray-800" />
              
              {/* Equator */}
              <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-gray-800" />
            </svg>
          </div>
        </div>

        {/* Circle 2 - 3D Spinning Sphere - Left side upper */}
        <div className="absolute left-[12%] top-[18%] w-[200px] h-[200px] pointer-events-none z-0 opacity-[0.85]">
          <div className="relative w-full h-full animate-spin-very-slow">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Radial gradient for shading */}
                <radialGradient id="sphereShading2" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="rgba(159, 13, 152, 0.19)" />
                  <stop offset="50%" stopColor="rgba(156, 13, 152, 0.15)" />
                  <stop offset="100%" stopColor="rgba(156, 13, 152, 0.05)" />
                </radialGradient>
              </defs>
              
              {/* Shaded sphere background */}
              <circle cx="100" cy="100" r="85" fill="url(#sphereShading2)" />
              
              {/* Outer sphere outline */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" opacity="0.0"/>
              
              {/* Latitude lines (horizontal ellipses) */}
              <ellipse cx="100" cy="100" rx="85" ry="20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-black-400" opacity="0.0"/>
              <ellipse cx="100" cy="100" rx="85" ry="40" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-black-400" opacity="0.0"/>
              <ellipse cx="100" cy="100" rx="85" ry="60" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-black-400" opacity="0.0"/>
              <ellipse cx="100" cy="100" rx="85" ry="85" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-black-400" opacity="0.0"/>
              
              {/* Longitude lines (vertical ellipses with rotation) */}
              <ellipse cx="100" cy="100" rx="20" ry="85" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              <ellipse cx="100" cy="100" rx="40" ry="85" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              <ellipse cx="100" cy="100" rx="60" ry="85" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              <ellipse cx="100" cy="100" rx="85" ry="85" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              
              {/* Center meridian (vertical line) */}
              <line x1="100" y1="15" x2="100" y2="185" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
              
              {/* Equator (horizontal line) */}
              <line x1="15" y1="100" x2="185" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            </svg>
          </div>
        </div>

        {/* Circle 3 - Lower left */}
        <div className="absolute left-[27%] bottom-[23%] w-[200px] h-[200px] pointer-events-none z-0 opacity-[0.85]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="93" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-400" />
          </svg>
        </div>

        {/* Circle 4 - Right side middle */}
        <div className="absolute right-[15%] top-[45%] w-[200px] h-[200px] pointer-events-none z-0 opacity-[0.35]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="93" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-400" />
          </svg>
        </div>

        {/* Circle 5 - Lower right */}
        <div className="absolute right-[5%] bottom-[15%] w-[200px] h-[200px] pointer-events-none z-0 opacity-[0.35]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="93" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-400" />
          </svg>
        </div>

        {/* Ivy Image 1 - Upper right - HIDDEN */}
        <div className="absolute right-[12%] top-[1%] w-[300px] h-[300px] pointer-events-none z-0 opacity-[0.0]" style={{ transform: 'rotate(320deg)' }}>
          <img 
            src="/ivy.png" 
            alt="" 
            className="w-full h-full object-contain" 
            style={{ 
              filter: 'sepia(100%) saturate(300%) hue-rotate(70deg) brightness(0.9)',
              mixBlendMode: 'multiply'
            }}
          />
        </div>

        {/* Ivy Image 2 - Lower left, mirror reflected */}
        <div className="absolute left-[8%] bottom-[63%] w-[300px] h-[300px] pointer-events-none z-0 opacity-[0.0]" style={{ transform: 'rotate(160deg) scaleX(-1)' }}>
          <img 
            src="/ivy2.png" 
            alt="" 
            className="w-full h-full object-contain" 
            style={{ 
              filter: 'sepia(100%) saturate(300%) hue-rotate(70deg) brightness(0.9)',
              mixBlendMode: 'multiply'
            }}
          />
        </div>


        {/* Animated Comet - Streaks across screen */}
        {cometActive && (
          <div 
            className={`absolute pointer-events-none z-5 opacity-30 comet-trajectory-${cometTrajectory}`}
            style={{ willChange: 'transform' }}
          >
            <div style={{ 
              transform: `rotate(${trajectoryRotations[cometTrajectory]}deg)`,
              transformOrigin: 'center'
            }}>
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Comet head - at center, pointing right */}
                <circle cx="50" cy="50" r="4" fill="rgba(30, 56, 225, 0.4)" stroke="rgba(115, 118, 138, 0.5)" strokeWidth="0.1" />
                
                {/* Comet tail - straight lines pointing left from center */}
                {/* Main tail lines - progressively longer and fainter */}
                <line x1="46" y1="50" x2="40" y2="50" stroke="rgba(30, 65, 225, 0.7)" strokeWidth="3" strokeLinecap="round" />
                <line x1="46" y1="50" x2="30" y2="50" stroke="rgba(30, 65, 225, 0.5)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="46" y1="50" x2="20" y2="50" stroke="rgba(30, 65, 225, 0.35)" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="46" y1="50" x2="10" y2="50" stroke="rgba(30, 65, 225, 0.22)" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="46" y1="50" x2="0" y2="50" stroke="rgba(30, 65, 225, 0.12)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="46" y1="50" x2="-10" y2="50" stroke="rgba(30, 65, 225, 0.06)" strokeWidth="1.3" strokeLinecap="round" />
                
                {/* Wispy side trails for depth - slight vertical offset */}
                <line x1="46" y1="50" x2="15" y2="48" stroke="rgba(30, 65, 225, 0.25)" strokeWidth="0.8" strokeLinecap="round" />
                <line x1="46" y1="50" x2="15" y2="52" stroke="rgba(30, 65, 225, 0.25)" strokeWidth="0.8" strokeLinecap="round" />
                <line x1="46" y1="50" x2="5" y2="47" stroke="rgba(30, 65, 225, 0.15)" strokeWidth="0.5" strokeLinecap="round" />
                <line x1="46" y1="50" x2="5" y2="53" stroke="rgba(30, 65, 225, 0.15)" strokeWidth="0.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}

        {/* Orbital Arc - Partial orbit path around hero */}
        <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Curved orbital path - elliptical orbit section around hero text (mirrored) */}
            {/* Adjust the translateX value (currently 0) to move the arc left (negative) or right (positive) */}
            <g transform="translate(-350, 0)">
              <path 
                d="M 1040 25 Q 1285 50, 1340 150 Q 1390 250, 1290 400 Q 1140 600, 890 750 Q 640 850, 440 900"
                fill="none" 
                stroke="rgba(0, 0, 0, 0.15)" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Minimalist header - Co-Star inspired */}
        <header className="relative z-20 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={LogoBlue} alt="Natavium" className="w-12 h-12 md:w-14 md:h-14" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.15em] uppercase text-gray-900">natavium</h1>
          </div>
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate("/reports")}
              className="text-sm font-light tracking-wide text-gray-600 hover:text-gray-900 transition-colors uppercase"
            >
              reports
            </button>
            <button
              onClick={() => navigate("/learn")}
              className="text-sm font-light tracking-wide text-gray-600 hover:text-gray-900 transition-colors uppercase"
            >
              learn
            </button>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Theme Selector */}
            <button
              onClick={toggleTheme}
              className="text-2xl ml-4 pl-4 border-l border-gray-200 hover:opacity-70 transition-opacity"
              title="Toggle theme"
            >
              {getThemeLabel()}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Chani inspired ethereal minimalism */}
      <section className="relative z-10 px-6 md:px-12 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Main headline - bold and direct like Co-Star */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight text-gray-900">
            understand
            <br />
            <span className="font-normal">you</span>
            <br />
            
          </h2>

          {/* Subtext - approachable like Aliza Kelly */}
          <p className="text-lg md:text-xl font-light text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Thousands of years of astrological wisdom, simplified for your daily journey.

          </p>

          {/* CTA - clean and modern */}
          <div className="pt-8">
            <button
              onClick={() => navigate("/input")}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full text-base font-light tracking-wide hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              get your chart
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          
        </div>
      </section>

      {/* Features - Minimal cards with cosmic touches */}
      <section className="relative z-10 px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="group space-y-3 p-6 rounded-xl border border-gray-300 bg-white/30 backdrop-blur-sm hover:border-gray-300/50 hover:bg-white/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-full border border-gray-200 bg-white/50 flex items-center justify-center text-xl text-gray-600">
                ☽
              </div>
              <h3 className="text-lg font-light tracking-wide text-gray-900">natal chart</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Your cosmic DNA decoded. Understand your sun, moon, rising, and all planetary placements.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group space-y-3 p-6 rounded-xl border border-gray-300 bg-white/30 backdrop-blur-sm hover:border-gray-300/50 hover:bg-white/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-full border border-gray-200 bg-white/50 flex items-center justify-center text-xl text-gray-600">
                ♡
              </div>
              <h3 className="text-lg font-light tracking-wide text-gray-900">relationships</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Navigate love and connection with cosmic clarity. Understand compatibility and patterns.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group space-y-3 p-6 rounded-xl border border-gray-300 bg-white/30 backdrop-blur-sm hover:border-gray-300/50 hover:bg-white/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-full border border-gray-200 bg-white/50 flex items-center justify-center text-xl text-gray-600">
                ✧
              </div>
              <h3 className="text-lg font-light tracking-wide text-gray-900">transits</h3>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                Know when to move and when to wait. Track cosmic weather in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer - Ultra minimal */}
      <footer className="relative z-10 px-6 md:px-12 py-12 border-t border-gray-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-light tracking-wide text-gray-400 uppercase">© 2024 natavium</span>
          </div>
          <div className="flex gap-8">
            <button onClick={() => navigate("/impressum")} className="text-xs font-light tracking-wide text-gray-500 hover:text-gray-700 transition-colors uppercase">
              impressum
            </button>
            <button onClick={() => navigate("/datenschutz")} className="text-xs font-light tracking-wide text-gray-500 hover:text-gray-700 transition-colors uppercase">
              privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =========================
// Input Form
// =========================
function InputPage({ birthData, handleInputChange, calculateChart, calcError }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Get theme label for display
  const getThemeLabel = () => {
    if (theme === 'theme-daylight') return '☀️';
    if (theme === 'theme-v2') return '🌙';
    return '🌅';
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] relative overflow-hidden">
      {/* Background pattern matching LandingPageNew */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,119,101,0.05) 2px, rgba(139,119,101,0.05) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,119,101,0.05) 2px, rgba(139,119,101,0.05) 4px),
          radial-gradient(ellipse at 30% 50%, rgba(222,184,135,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(210,180,140,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 20%, rgba(245,222,179,0.1) 0%, transparent 40%)
        `
      }}></div>

      {/* Minimalist header - matching LandingPageNew */}
      <header className="relative z-20 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
            <img src={LogoBlue} alt="Natavium" className="w-12 h-12 md:w-14 md:h-14" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.15em] uppercase text-gray-900">natavium</h1>
          </div>
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate("/")}
              className="text-sm font-light tracking-wide text-gray-600 hover:text-gray-900 transition-colors uppercase"
            >
              home
            </button>
            {/* Theme Selector */}
            <button
              onClick={toggleTheme}
              className="text-2xl ml-4 pl-4 border-l border-gray-200 hover:opacity-70 transition-opacity"
              title="Toggle theme"
            >
              {getThemeLabel()}
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 md:px-12 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-3">Enter Your Birth Details</h2>
            <p className="text-base font-light text-gray-500">Everything begins with your natal chart. Enter your details now to see yours</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-300 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  Who is this chart for?
                </label>
                <select
                  value={birthData.subjectRelationship || 'self'}
                  onChange={(e) => handleInputChange('subjectRelationship', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-gray-400 font-light"
                >
                  <option value="self">Self</option>
                  <option value="partner">Partner</option>
                  <option value="child">Child</option>
                  <option value="friend">Friend</option>
                  <option value="client">Client</option>
                  <option value="other">Other</option>
                </select>
                <p className="text-xs font-light text-gray-400 mt-2">Shown in your saved reports and headings</p>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  Initials (2–3 letters)
                </label>
                <input
                  value={birthData.subjectInitials || ''}
                  onChange={(e) => handleInputChange('subjectInitials', e.target.value)}
                  placeholder="AB"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light"
                />
                <p className="text-xs font-light text-gray-400 mt-2">Use initials only (no full names)</p>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Birth date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={birthData.birthMonth}
                    onChange={(e) => handleInputChange("birthMonth", e.target.value)}
                    placeholder="MM"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light text-center"
                  />
                  <input
                    value={birthData.birthDay}
                    onChange={(e) => handleInputChange("birthDay", e.target.value)}
                    placeholder="DD"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light text-center"
                  />
                  <input
                    value={birthData.birthYear}
                    onChange={(e) => handleInputChange("birthYear", e.target.value)}
                    placeholder="YYYY"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light text-center"
                  />
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Birth time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={birthData.hour}
                    onChange={(e) => handleInputChange("hour", e.target.value)}
                    placeholder="HH"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light text-center"
                  />
                  <input
                    value={birthData.minute}
                    onChange={(e) => handleInputChange("minute", e.target.value)}
                    placeholder="MM"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light text-center"
                  />
                  <select
                    value={birthData.period}
                    onChange={(e) => handleInputChange("period", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-gray-400 font-light"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <p className="text-xs font-light text-gray-400 mt-2">Check birth certificate. Use noon if time is unknown.</p>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 md:col-span-2">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Birth location
                </label>
                <input
                  type="text"
                  value={birthData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 font-light"
                />
                <p className="text-xs font-light text-gray-400 mt-2">City name auto-detected • Timezone calculated automatically</p>

                <div className="mt-3">
                  <p className="text-xs font-light text-gray-400 mb-2">Quick select:</p>
                  <div className="flex flex-wrap gap-2">
                    {["New York", "Los Angeles", "Chicago", "London", "Toronto", "Sydney"].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleInputChange("location", city)}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors font-light text-gray-600"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  Focus
                </label>
                <select
                  value={birthData.focus || 'standard'}
                  onChange={(e) => handleInputChange('focus', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-gray-400 font-light"
                >
                  <option value="standard">Standard</option>
                  <option value="career">Career & Money</option>
                  <option value="love">Love & Relationships</option>
                  <option value="growth">Self & Growth</option>
                </select>
                <p className="text-xs font-light text-gray-400 mt-2">Your selection here will be emphasized a little more</p>
              </div>

              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60">
                <label className="flex items-center text-sm font-light text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={birthData.tone || 'classic'}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:border-gray-400 font-light"
                >
                  <option value="classic">Classic</option>
                  <option value="coach">Coach</option>
                  <option value="witty">Witty</option>
                </select>
                <p className="text-xs font-light text-gray-400 mt-2">This changes the 'vibe' of your analysis</p>
              </div>
            </div>

            {calcError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-600 font-light">
                ⚠️ Error: {calcError}
              </div>
            )}

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4 mb-6 text-sm text-amber-700 font-light">
              🔒 Your data is private and secure
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => calculateChart(navigate, 'tropical')}
                disabled={!birthData.birthMonth || !birthData.birthDay || !birthData.birthYear || !birthData.hour || !birthData.minute || !birthData.location}
                className="flex-1 bg-gray-900 text-white rounded-xl py-4 text-base font-light tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Tropical Chart
              </button>

              <button
                onClick={() => calculateChart(navigate, 'sidereal')}
                disabled={!birthData.birthMonth || !birthData.birthDay || !birthData.birthYear || !birthData.hour || !birthData.minute || !birthData.location}
                className="flex-1 bg-gray-900 text-white rounded-xl py-4 text-base font-light tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Sidereal Chart
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs font-light tracking-wide text-gray-400 uppercase">© 2024 natavium</span>
          <div className="flex gap-8">
            <button onClick={() => navigate("/impressum")} className="text-xs font-light tracking-wide text-gray-500 hover:text-gray-700 transition-colors uppercase">
              impressum
            </button>
            <button onClick={() => navigate("/datenschutz")} className="text-xs font-light tracking-wide text-gray-500 hover:text-gray-700 transition-colors uppercase">
              privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =========================
// Calculating
// =========================
function CalculatingPage() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#D6B35A] mx-auto" />
          <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 icon-gold animate-pulse" />
        </div>
        <h2 className="font-serif text-3xl font-bold mb-4 gold-gradient-text">Calculating Your Cosmic Blueprint...</h2>
        <div className="space-y-2 t-text-muted">
          <p className="animate-pulse">⚡ Computing planetary positions...</p>
          <p className="animate-pulse">🌙 Analyzing house placements...</p>
          <p className="animate-pulse flex items-center justify-center gap-1"><BrandStar className="w-4 h-4" /> Generating AI insights...</p>
        </div>
      </div>
    </div>
  );
}

// =========================
// Preview (Paywall)
// =========================
function PreviewPage({ chartResult, birthData, selectedBundle, setSelectedBundle }) {
  const [showTooltip, setShowTooltip] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [teaser, setTeaser] = useState(null);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [teaserError, setTeaserError] = useState("");
  const [transitTeaser, setTransitTeaser] = useState(null);
  const [transitTeaserLoading, setTransitTeaserLoading] = useState(false);
  const [transitTeaserError, setTransitTeaserError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Get theme label for display
  const getThemeLabel = () => {
    if (theme === 'theme-daylight') return '☀️';
    if (theme === 'theme-v2') return '🌙';
    return '🌅';
  };

  const zodiacType = chartResult?.zodiacType || 'tropical';
  const activeChart = chartResult?.tropical ? chartResult[zodiacType] : chartResult;
  // eslint-disable-next-line no-unused-vars
  const zodiacLabel = zodiacType === 'sidereal' ? 'Sidereal' : 'Tropical';

  // ... (rest of the code remains the same)
  // Fetch AI teaser on mount
  useEffect(() => {
    if (!chartResult) return;

    const fetchTeaser = async () => {
      setTeaserLoading(true);
      setTeaserError(null);

      try {
        const response = await fetch('/api/generate-teaser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chartResult, zodiacSystem: zodiacType }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate teaser');
        }

        const data = await response.json();
        setTeaser(data.teaser);
        // Store teaser for ChartPage to display when natal is locked
        if (data.teaser) localStorage.setItem('natavium_natalTeaser', data.teaser);
      } catch (error) {
        console.error('Teaser fetch error:', error);
        setTeaserError(error.message);
      } finally {
        setTeaserLoading(false);
      }
    };

    fetchTeaser();
    // zodiacType is derived from chartResult.zodiacType, so chartResult covers it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartResult]);

  // Fetch transit teaser on mount
  useEffect(() => {
    if (!chartResult) return;

    const fetchTransitTeaser = async () => {
      setTransitTeaserLoading(true);
      setTransitTeaserError(null);

      try {
        const response = await fetch('/api/generate-teaser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chartResult, zodiacSystem: zodiacType, type: 'transit' }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate transit teaser');
        }

        const data = await response.json();
        setTransitTeaser(data.teaser);
      } catch (error) {
        console.error('Transit teaser fetch error:', error);
        setTransitTeaserError(error.message);
      } finally {
        setTransitTeaserLoading(false);
      }
    };

    fetchTransitTeaser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartResult]);

  if (!chartResult) {
    return <Navigate to="/input" replace />;
  }

  const displayDate = formatBirthDate(birthData.birthMonth, birthData.birthDay, birthData.birthYear);
  const currentBundle = selectedBundle ? BUNDLES[selectedBundle] : null;

  // Calculate total price: bundle price OR sum of individual services
  const servicesTotal = selectedServices.reduce((sum, id) => {
    const svc = SERVICES.find(s => s.id === id);
    return sum + (svc ? svc.price : 0);
  }, 0);
  const totalPrice = currentBundle ? currentBundle.price : servicesTotal;
  const hasSelection = currentBundle || selectedServices.length > 0;

  // Toggle service selection (compatibility packs are mutually exclusive)
  const COMPAT_IDS = ['compatibility', 'compatibility_3x'];
  const toggleService = (serviceId) => {
    // Deselect any bundle when picking individual services
    if (selectedBundle) setSelectedBundle(null);
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      // If selecting a compatibility pack, deselect the other one
      const base = COMPAT_IDS.includes(serviceId)
        ? prev.filter(id => !COMPAT_IDS.includes(id))
        : prev;
      return [...base, serviceId];
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] relative overflow-hidden">
      {/* Background pattern matching LandingPageNew */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,119,101,0.05) 2px, rgba(139,119,101,0.05) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,119,101,0.05) 2px, rgba(139,119,101,0.05) 4px),
          radial-gradient(ellipse at 30% 50%, rgba(222,184,135,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(210,180,140,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 20%, rgba(245,222,179,0.1) 0%, transparent 40%)
        `
      }}></div>

      {/* Minimalist header - matching LandingPageNew */}
      <header className="relative z-20 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
            <img src={LogoBlue} alt="Natavium" className="w-12 h-12 md:w-14 md:h-14" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.15em] uppercase text-gray-900">natavium</h1>
          </div>
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate("/")}
              className="text-sm font-light tracking-wide text-gray-600 hover:text-gray-900 transition-colors uppercase"
            >
              home
            </button>
            {/* Theme Selector */}
            <button
              onClick={toggleTheme}
              className="text-2xl ml-4 pl-4 border-l border-gray-200 hover:opacity-70 transition-opacity"
              title="Toggle theme"
            >
              {getThemeLabel()}
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-12 py-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
              {birthData.subjectInitials 
                ? `Natavium Preview for ${birthData.subjectInitials.toUpperCase()}` 
                : `Natavium Preview`}
            </h1>
            <p className="text-lg font-light text-gray-500">
              {displayDate} • {birthData.time} • {birthData.location}
            </p>
          </div>

        {/* Sun Sign Heading - now inside wheel box */}
        {/* Removed - moved inside wheel box */}

        {/* Big Three - Above chart wheel */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-white/80 via-white/50 to-gray-100/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-300 relative overflow-hidden">
            <div className="relative z-10">
              <Sun className="w-8 h-8 text-amber-500 mb-2 mx-auto" />
              <div className="text-xl font-light text-gray-900 mb-0.5">{activeChart.sun.sign} Sun</div>
              <div className="text-xs text-gray-500">Core Identity</div>
              <div className="text-xs text-gray-400 mt-1">
                {activeChart.sun.degree}° {String(activeChart.sun.minutes || 0).padStart(2, '0')}' • House {activeChart.sun.house}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/80 via-white/50 to-gray-100/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-300 relative overflow-hidden">
            <div className="relative z-10">
              <Moon className="w-8 h-8 text-amber-500 mb-2 mx-auto" />
              <div className="text-xl font-light text-gray-900 mb-0.5">{activeChart.moon.sign} Moon</div>
              <div className="text-xs text-gray-500">Emotional Core</div>
              <div className="text-xs text-gray-400 mt-1">
                {activeChart.moon.degree}° {String(activeChart.moon.minutes || 0).padStart(2, '0')}' • House {activeChart.moon.house}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/80 via-white/50 to-gray-100/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-300 relative overflow-hidden">
            <div className="relative z-10">
              <Star className="w-8 h-8 text-amber-500 mb-2 mx-auto" />
              <div className="text-xl font-light text-gray-900 mb-0.5">{activeChart.rising.sign} Rising</div>
              <div className="text-xs text-gray-500">How Others See You</div>
              <div className="text-xs text-gray-400 mt-1">{activeChart.rising.degree}° {String(activeChart.rising.minutes || 0).padStart(2, '0')}' Ascendant</div>
            </div>
          </div>
        </div>

        {/* Premium Chart Wheel - Left aligned on desktop with Cosmic Blueprint on right */}
        <div className="md:grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-300">
          {/* Personalized Archetype - above wheel */}
          {(() => {
            // Sun sign base archetypes
            const sunArchetypes = {
              Aries: ["Bold Pioneer", "Fearless Warrior", "Dynamic Leader"],
              Taurus: ["Grounded Builder", "Patient Cultivator", "Steadfast Creator"],
              Gemini: ["Curious Messenger", "Witty Explorer", "Clever Connector"],
              Cancer: ["Nurturing Protector", "Intuitive Guardian", "Emotional Anchor"],
              Leo: ["Radiant Leader", "Generous Star", "Confident Creator"],
              Virgo: ["Precise Perfectionist", "Helpful Analyst", "Practical Healer"],
              Libra: ["Harmonious Diplomat", "Aesthetic Peacemaker", "Balanced Judge"],
              Scorpio: ["Intense Transformer", "Magnetic Detective", "Powerful Phoenix"],
              Sagittarius: ["Adventurous Philosopher", "Optimistic Explorer", "Free Spirit"],
              Capricorn: ["Ambitious Achiever", "Disciplined Climber", "Wise Authority"],
              Aquarius: ["Visionary Rebel", "Independent Innovator", "Humanitarian Genius"],
              Pisces: ["Dreamy Mystic", "Compassionate Artist", "Intuitive Empath"],
            };

            // Element mappings
            const signElements = {
              Aries: "fire", Leo: "fire", Sagittarius: "fire",
              Taurus: "earth", Virgo: "earth", Capricorn: "earth",
              Gemini: "air", Libra: "air", Aquarius: "air",
              Cancer: "water", Scorpio: "water", Pisces: "water",
            };

            // Moon element modifiers
            const moonModifiers = {
              fire: ["Passionate", "Bold", "Fiery"],
              earth: ["Grounded", "Practical", "Steady"],
              air: ["Intellectual", "Social", "Thoughtful"],
              water: ["Sensitive", "Intuitive", "Deep"],
            };

            const sunSign = activeChart.sun.sign;
            const moonSign = activeChart.moon.sign;
            const risingSign = activeChart.rising.sign;

            const moonElement = signElements[moonSign];

            // Get base archetype from sun sign
            const baseArchetypes = sunArchetypes[sunSign] || ["Cosmic Soul"];
            const baseArchetype = baseArchetypes[0];

            // Get moon modifier
            const moonMods = moonModifiers[moonElement] || ["Intuitive"];
            const moonMod = moonMods[0];

            // Combine into a unique archetype title
            const baseWords = baseArchetype.split(" ");
            const archetypeNoun = baseWords[baseWords.length - 1];

            const archetype = `The ${moonMod} ${archetypeNoun}`;

            return (
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <p className="text-2xl font-light text-gray-900">
                  {sunSign} — <span className="italic text-gray-600">"{archetype}"</span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {moonSign} Moon • {risingSign} Rising
                </p>
              </div>
            );
          })()}

          {(() => {
            // SVG Path definitions for zodiac signs (scaled for 14px viewBox centered at 0,0)
            const zodiacPaths = {
              Aries: "M-5,6 L0,-6 L5,6 M-4,2 L0,-4 L4,2",
              Taurus: "M-5,4 A5,5 0 1,1 5,4 M-6,4 L-6,6 M6,4 L6,6",
              Gemini: "M-4,-6 L-4,6 M4,-6 L4,6 M-4,-4 L4,-4 M-4,4 L4,4",
              Cancer: "M-5,0 A4,4 0 0,1 0,-4 A4,4 0 0,0 5,0 M5,0 A4,4 0 0,1 0,4 A4,4 0 0,0 -5,0",
              Leo: "M-4,4 A4,4 0 1,1 0,0 M0,0 Q4,-4 4,2 Q4,6 0,6",
              Virgo: "M-5,-5 L-5,5 M-5,0 L0,-5 L0,5 M0,0 L5,-5 L5,2 Q5,6 2,6 L4,4",
              Libra: "M-6,4 L6,4 M-4,0 L4,0 M0,0 L0,-5 A4,4 0 0,1 4,-5",
              Scorpio: "M-5,-5 L-5,5 M-5,0 L0,-5 L0,5 M0,0 L5,-5 L5,5 L7,3",
              Sagittarius: "M-5,5 L5,-5 M2,-5 L5,-5 L5,-2 M-3,1 L3,-5",
              Capricorn: "M-5,-4 Q-2,-6 0,-2 L0,4 Q0,6 3,6 A3,3 0 1,0 5,2",
              Aquarius: "M-6,-2 L-3,2 L0,-2 L3,2 L6,-2 M-6,2 L-3,6 L0,2 L3,6 L6,2",
              Pisces: "M-2,-6 A4,6 0 0,0 -2,6 M2,-6 A4,6 0 0,1 2,6 M-4,0 L4,0",
            };

            // SVG Path definitions for planets
            const planetPaths = {
              sun: "M0,0 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0 M0,-1.5 L0,1.5 M-1.5,0 L1.5,0",
              moon: "M2,-5 A5,5 0 1,0 2,5 A4,4 0 1,1 2,-5",
              mercury: "M0,-5 A3,3 0 1,1 0,1 M0,1 L0,5 M-2,3 L2,3 M-2,-6 A2,2 0 1,1 2,-6",
              venus: "M0,-5 A4,4 0 1,1 0,3 M0,3 L0,6 M-2,5 L2,5",
              mars: "M-3,3 A5,5 0 1,1 3,-3 M1,-3 L5,-5 L3,-1",
              jupiter: "M-4,0 L4,0 M2,-5 L2,5 M-4,5 A5,5 0 0,1 -4,-2",
              saturn: "M-3,-5 L-3,0 A3,3 0 0,0 3,0 L3,5 M-1,-5 L-5,-5 M0,2 L-4,2",
            };

            const zodiacSigns = [
              { name: "Aries", element: "fire" },
              { name: "Taurus", element: "earth" },
              { name: "Gemini", element: "air" },
              { name: "Cancer", element: "water" },
              { name: "Leo", element: "fire" },
              { name: "Virgo", element: "earth" },
              { name: "Libra", element: "air" },
              { name: "Scorpio", element: "water" },
              { name: "Sagittarius", element: "fire" },
              { name: "Capricorn", element: "earth" },
              { name: "Aquarius", element: "air" },
              { name: "Pisces", element: "water" },
            ];

            const elementColors = {
              fire: "#ff6b6b",
              earth: "#4ade80",
              air: "#fde047",
              water: "#60a5fa"
            };

            const risingIndex = zodiacSigns.findIndex((s) => s.name === activeChart.rising.sign);
            const risingOffset = 180 - risingIndex * 30 - 15;

            const getPosition = (angleDeg, radius) => {
              const angleRad = (angleDeg * Math.PI) / 180;
              return { x: 200 + radius * Math.cos(angleRad), y: 200 + radius * Math.sin(angleRad) };
            };

            const getPlanetAngle = (sign, degree) => {
              const signIndex = zodiacSigns.findIndex((s) => s.name === sign);
              return signIndex * 30 + degree + risingOffset;
            };

            const planets = [
              { key: "sun", ...activeChart.sun },
              { key: "moon", ...activeChart.moon },
              { key: "mercury", sign: activeChart.mercury.sign, degree: activeChart.mercury.degree || 8 },
              { key: "venus", sign: activeChart.venus.sign, degree: activeChart.venus.degree || 24 },
              { key: "mars", sign: activeChart.mars.sign, degree: activeChart.mars.degree || 12 },
              { key: "jupiter", sign: activeChart.jupiter?.sign, degree: activeChart.jupiter?.degree || 15 },
              { key: "saturn", sign: activeChart.saturn?.sign, degree: activeChart.saturn?.degree || 20 },
            ];

            return (
              <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-4">
                <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    {/* Gold Glow Filter */}
                    <filter id="goldGlowPreview" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="3" result="blur1" />
                      <feColorMatrix in="blur1" type="matrix" values="1 0.8 0 0 0  0.9 0.7 0 0 0  0 0 0.2 0 0  0 0 0 1 0" result="goldBlur" />
                      <feMerge>
                        <feMergeNode in="goldBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Planet Marker Glow */}
                    <filter id="planetGlowPreview" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="blur3" />
                      <feMerge>
                        <feMergeNode in="blur3" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Background Radial Gradient */}
                    <radialGradient id="wheelBackgroundPreview" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" style={{ stopColor: '#0f0a1e', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#1a1035', stopOpacity: 1 }} />
                      <stop offset="85%" style={{ stopColor: '#2d1f5c', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#3d2a7a', stopOpacity: 1 }} />
                    </radialGradient>

                    {/* Gold Ring Gradient */}
                    <linearGradient id="goldRingPreview" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                    </linearGradient>

                    {/* Purple Ring Gradient */}
                    <linearGradient id="purpleRingPreview" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0.8 }} />
                    </linearGradient>

                    {/* Center Gradient */}
                    <radialGradient id="centerGlowPreview" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.4 }} />
                      <stop offset="70%" style={{ stopColor: '#581c87', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#1e1b4b', stopOpacity: 0.9 }} />
                    </radialGradient>
                  </defs>

                  {/* Background circle with depth gradient */}
                  <circle cx="200" cy="200" r="198" fill="url(#wheelBackgroundPreview)" />

                  {/* Outer decorative ring */}
                  <circle cx="200" cy="200" r="196" fill="none" stroke="url(#goldRingPreview)" strokeWidth="3" style={{ filter: 'url(#goldGlowPreview)' }} />
                  <circle cx="200" cy="200" r="192" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />

                  {/* Zodiac band outer edge */}
                  <circle cx="200" cy="200" r="160" fill="none" stroke="url(#purpleRingPreview)" strokeWidth="1.5" />

                  {/* House circle */}
                  <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />

                  {/* Inner planet zone */}
                  <circle cx="200" cy="200" r="80" fill="url(#centerGlowPreview)" stroke="url(#purpleRingPreview)" strokeWidth="1.5" />

                  {/* Zodiac sign dividers and glyphs */}
                  {zodiacSigns.map((sign, i) => {
                    const startAngle = i * 30 + risingOffset;
                    const midAngle = startAngle + 15;
                    const glyphPos = getPosition(midAngle, 176);
                    const lineStart = getPosition(startAngle, 160);
                    const lineEnd = getPosition(startAngle, 192);
                    const rotation = midAngle + 90;

                    return (
                      <g key={sign.name}>
                        <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="url(#goldRingPreview)" strokeWidth="1" style={{ opacity: 0.6 }} />
                        <g transform={`translate(${glyphPos.x}, ${glyphPos.y}) rotate(${rotation}) scale(0.9)`}>
                          <path d={zodiacPaths[sign.name]} fill="none" stroke={elementColors[sign.element]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#planetGlowPreview)' }} />
                        </g>
                      </g>
                    );
                  })}

                  {/* House numbers */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const houseAngle = i * 30 + risingOffset + 15;
                    const housePos = getPosition(houseAngle, 140);
                    return (
                      <text key={`house-${i + 1}`} x={housePos.x} y={housePos.y} textAnchor="middle" dominantBaseline="central" fill="rgba(167, 139, 250, 0.8)" style={{ fontSize: '11px', fontWeight: '600', fontFamily: 'system-ui, sans-serif' }}>{i + 1}</text>
                    );
                  })}

                  {/* House cusp lines */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const angle = i * 30 + risingOffset;
                    const innerPos = getPosition(angle, 80);
                    const outerPos = getPosition(angle, 120);
                    const isCardinal = i % 3 === 0;
                    return (
                      <line key={`cusp-${i}`} x1={innerPos.x} y1={innerPos.y} x2={outerPos.x} y2={outerPos.y} stroke={isCardinal ? "url(#goldRingPreview)" : "rgba(167, 139, 250, 0.35)"} strokeWidth={isCardinal ? "2" : "1"} style={isCardinal ? { filter: 'url(#goldGlowPreview)' } : {}} />
                    );
                  })}

                  {/* ASC/DESC axis */}
                  {(() => {
                    const ascPos = getPosition(180, 195);
                    const descPos = getPosition(0, 195);
                    return <line x1={ascPos.x} y1={ascPos.y} x2={descPos.x} y2={descPos.y} stroke="url(#goldRingPreview)" strokeWidth="2" style={{ filter: 'url(#goldGlowPreview)', opacity: 0.7 }} />;
                  })()}

                  {/* MC/IC axis */}
                  {(() => {
                    const mcPos = getPosition(270, 195);
                    const icPos = getPosition(90, 195);
                    return <line x1={mcPos.x} y1={mcPos.y} x2={icPos.x} y2={icPos.y} stroke="url(#purpleRingPreview)" strokeWidth="1.5" style={{ opacity: 0.5 }} />;
                  })()}

                  {/* Ascendant arrow marker */}
                  <g style={{ filter: 'url(#goldGlowPreview)' }}>
                    <polygon points="2,200 24,191 24,209" fill="url(#goldRingPreview)" />
                    <text x="32" y="200" textAnchor="start" dominantBaseline="central" fill="#fde047" style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}>ASC</text>
                  </g>

                  {/* Planet markers */}
                  {planets.filter(p => p.sign).map((planet) => {
                    const angle = getPlanetAngle(planet.sign, planet.degree);
                    const pos = getPosition(angle, 100);
                    const signData = zodiacSigns.find((s) => s.name === planet.sign);
                    const color = signData ? elementColors[signData.element] : "#fde047";

                    return (
                      <g key={planet.key} style={{ filter: 'url(#planetGlowPreview)' }}>
                        <circle cx={pos.x} cy={pos.y} r="15" fill="rgba(15, 10, 30, 0.95)" stroke={color} strokeWidth="2" />
                        <g transform={`translate(${pos.x}, ${pos.y}) scale(0.85)`}>
                          <path d={planetPaths[planet.key]} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                      </g>
                    );
                  })}

                  {/* Center star decoration */}
                  <circle cx="200" cy="200" r="25" fill="url(#centerGlowPreview)" stroke="url(#purpleRingPreview)" strokeWidth="1.5" />
                  <g transform="translate(200, 200) scale(0.8)" style={{ filter: 'url(#goldGlowPreview)' }}>
                    <path d="M0,-10 L2,-3 L10,-3 L3,2 L5,10 L0,5 L-5,10 L-3,2 L-10,-3 L-2,-3 Z" fill="url(#goldRingPreview)" style={{ opacity: 0.9 }} />
                  </g>
                </svg>
              </div>
            );
          })()}

          {/* Legend - centered */}
          <div className="flex flex-wrap justify-center gap-4 text-xs mb-3 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #ff6b6b, #f97316)' }}></span><span className="text-gray-500">Fire</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}></span><span className="text-gray-500">Earth</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)' }}></span><span className="text-gray-500">Air</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}></span><span className="text-gray-500">Water</span></div>
          </div>

          <p className="text-center text-gray-500 italic text-sm">
            {activeChart.rising.sign} Rising • Planets positioned by degree
          </p>
        </div>

        {/* Cosmic Blueprint - beside chart box */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col border border-gray-300">
          <h2 className="text-2xl font-light text-gray-900 mb-4 text-center">Natal Chart Analysis</h2>

          {teaserLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-gray-500 text-sm font-light">Analyzing your unique cosmic signature...</p>
            </div>
          ) : teaserError ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-gray-700 font-light">
                Your {activeChart.sun.sign} Sun combined with {activeChart.moon.sign} Moon and {activeChart.rising.sign} Rising
                creates a unique cosmic blueprint that shapes your personality, emotions, and how others perceive you.
              </p>
              <p className="text-gray-400 text-xs font-light">Full AI analysis available in paid packages below.</p>
            </div>
          ) : teaser ? (
            <div className="space-y-3">
              {teaser.split('\n\n').slice(0, 2).map((paragraph, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-gray-700 font-light">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          <div className="relative mt-4">
            {/* Blurred premium preview */}
            <div className="blur-sm select-none opacity-50">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Mercury in {activeChart.mercury.sign}
              </h3>
              <p className="text-xs text-gray-600">Your communication style reveals hidden patterns...</p>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none" />
          </div>

          <div className="text-center mt-4">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-xs font-light">Select a package below to unlock your full analysis</p>
          </div>
        </div>
      </div>

        {/* Transit Report Preview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-300 mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Transit Report Preview</h2>

          {transitTeaserLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-gray-500 text-sm font-light">Scanning current planetary transits...</p>
            </div>
          ) : transitTeaserError ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-gray-700 font-light">
                Current planetary movements are creating significant shifts in your chart. Saturn, Jupiter, and the outer planets
                are activating key areas of your life right now.
              </p>
              <p className="text-gray-400 text-xs font-light">Full transit analysis available below.</p>
            </div>
          ) : transitTeaser ? (
            <div className="space-y-3">
              {transitTeaser.split('\n\n').slice(0, 2).map((paragraph, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-gray-700 font-light">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          <div className="relative mt-4">
            <div className="blur-sm select-none opacity-50">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                Saturn Transit to your {activeChart.sun.sign} Sun
              </h3>
              <p className="text-xs text-gray-600">Major restructuring themes are emerging in your life...</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none" />
          </div>

          <div className="text-center mt-4">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-light">Select the Transit Report below to unlock your full forecast</p>
          </div>
        </div>

      {/* Services description */}
      <div className="w-full px-4 mt-8">
        <p className="text-lg leading-relaxed text-gray-900 text-center mb-12 max-w-4xl mx-auto font-light">
          Select individual services or save with a bundle package.
        </p>
      </div>

      {/* Individual Services Selection */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-2">Select Services</h2>
          <p className="text-center text-gray-500 text-sm mb-8 font-light">Pick any combination you want</p>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.map((service) => {
                const isSelected = !selectedBundle && selectedServices.includes(service.id);
                const isIncludedInBundle = selectedBundle && BUNDLES[selectedBundle]?.includes?.includes(service.id);
                const ServiceIcon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`relative p-3 rounded-xl border transition-all text-left hover:scale-[1.02] ${
                      isSelected
                        ? "bg-gray-100 border-gray-400"
                        : isIncludedInBundle
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 pr-2">
                        <ServiceIcon className={`w-5 h-5 flex-shrink-0 ${
                          service.id === 'natal-basic' || service.id === 'natal-full' || service.id === 'personality-deep' 
                            ? 'text-amber-500' 
                            : service.id === 'compat-1' || service.id === 'compat-2'
                            ? 'text-rose-400'
                            : service.id === 'transit-report'
                            ? 'text-blue-400'
                            : 'text-gray-600'
                        }`} />
                        <h4 className="text-lg font-light text-gray-900 leading-none">{service.name}</h4>
                      </div>
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(showTooltip === `svc-${service.id}` ? null : `svc-${service.id}`);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </button>
                        {showTooltip === `svc-${service.id}` && (
                          <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-xl p-4 shadow-xl z-20">
                            <p className="text-sm text-gray-700 font-light">{service.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-gray-900 border-gray-900"
                            : isIncludedInBundle
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {(isSelected || isIncludedInBundle) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className="text-gray-900 text-base font-light">${service.price.toFixed(2)}</p>
                    </div>
                    {isIncludedInBundle && (
                      <p className="text-green-600 text-xs mt-1 text-right font-light">Included in {BUNDLES[selectedBundle]?.name}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedServices.length > 0 && !selectedBundle && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-gray-500 text-sm font-light">
                  {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                </span>
                <span className="text-gray-900 font-light">
                  ${servicesTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

      {/* Bundle Packages */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-2">Or Save With a Bundle</h2>
          <p className="text-center text-gray-500 text-sm mb-8 font-light">Discount packages that include multiple services</p>

          <div className="grid md:grid-cols-2 gap-4 items-start">
            {Object.values(BUNDLES).map((bundle) => {
              const IconComponent = bundle.icon;
              const isSelected = selectedBundle === bundle.id;

              return (
                <button
                  key={bundle.id}
                  onClick={() => {
                    setSelectedBundle(isSelected ? null : bundle.id);
                    setSelectedServices([]);
                  }}
                  className={`bg-white/60 backdrop-blur-sm relative rounded-2xl border transition-all text-left p-6 border-gray-300 hover:bg-white/80 ${
                    isSelected ? "scale-105 shadow-lg border-gray-400" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4 w-full">
                    <IconComponent className={`w-8 h-8 ${bundle.id === 'ultimate' ? 'text-amber-500' : 'text-gray-600'}`} />
                    <h3 className="text-4xl font-light text-gray-900">{bundle.name}</h3>
                    <div className="text-3xl font-light text-gray-900">
                      ${bundle.price.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    {!bundle.essentialIncludes ? (
                      <div className="text-sm text-gray-400 text-left leading-none mb-2">&nbsp;</div>
                    ) : (
                      <div className="text-sm text-gray-400 text-left leading-none mb-2">Essential +</div>
                    )}
                    {bundle.services.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-light">{service.name}</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTooltip(showTooltip === `${bundle.id}-${idx}` ? null : `${bundle.id}-${idx}`);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Info className="w-4 h-4 text-gray-400" />
                          </button>
                          {showTooltip === `${bundle.id}-${idx}` && (
                            <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-xl p-4 shadow-xl z-20">
                              <p className="text-sm text-gray-700 font-light">{service.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 text-center mb-3 font-light">One-time payment</p>

                  {bundle.popular && (
                    <div className="bg-gray-900 text-white text-xs font-light px-3 py-1 rounded-full text-center">
                      MOST POPULAR
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Proceed to Payment Button */}
        <div className="text-center mb-8">
          <button
            disabled={!hasSelection}
            onClick={async () => {
              try {
                const res = await fetch("/api/create-checkout-session", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bundle: selectedBundle || null,
                    services: selectedBundle ? [] : selectedServices,
                    chartData: chartResult,
                    birthData: birthData,
                    zodiacSystem: zodiacType,
                  }),
                });

                const data = await res.json();

                if (!res.ok) {
                  console.error("Checkout session error:", data);
                  alert(data?.error || "Payment setup failed. Try again.");
                  return;
                }

                // Store orderId for later retrieval in ChartPage
                if (data.orderId) {
                  localStorage.setItem('natavium_orderId', data.orderId);
                }

                // Store claim token for later access and claiming
                if (data.claimToken) {
                  localStorage.setItem('natavium_claimToken', data.claimToken);
                }

                // Store purchased products info for SuccessPage
                localStorage.setItem('natavium_purchasedProducts', JSON.stringify({
                  bundle: selectedBundle || null,
                  services: selectedBundle ? [] : selectedServices,
                }));

                window.location.href = data.url;
              } catch (err) {
                console.error(err);
                alert("Network error. Please try again.");
              }
            }}
            className={`bg-gray-900 text-white rounded-xl py-4 px-8 text-base font-light tracking-wide hover:bg-gray-800 transition-colors shadow-lg ${!hasSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {hasSelection ? `Proceed to Payment — $${totalPrice.toFixed(2)}` : 'Select services or a bundle'}
          </button>
          <p className="text-gray-500 mt-3 text-sm font-light">
            Secure checkout • Instant access • Yours forever
          </p>
        </div>

      </div>
    </main>
    </div>
  );
}

// =========================
// Success (after Stripe payment)
// =========================
function SuccessPage({ setIsPremium, chartResult, selectedBundle }) {
  const navigate = useNavigate();

  // Check if we have chart data (from props or localStorage)
  const hasChartData = chartResult || localStorage.getItem("natavium_chartResult");

  // Store session, merge purchasedProducts, set premium, and redirect to /chart
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      localStorage.setItem('natavium_sessionId', sessionId);
    }

    // Merge bundle info into purchasedProducts without clobbering the services
    // array that was saved during checkout in PreviewPage
    try {
      const existing = JSON.parse(localStorage.getItem('natavium_purchasedProducts') || '{}');
      existing.bundle = selectedBundle || existing.bundle || null;
      if (!existing.addOns) existing.addOns = [];
      localStorage.setItem('natavium_purchasedProducts', JSON.stringify(existing));
    } catch {
      localStorage.setItem('natavium_purchasedProducts', JSON.stringify({
        bundle: selectedBundle || null,
        addOns: [],
      }));
    }

    // Payment successful - unlock premium content
    setIsPremium(true);

    // Redirect to chart page — generation happens there
    const timer = setTimeout(() => navigate('/chart', { replace: true }), 1200);
    return () => clearTimeout(timer);
  }, [selectedBundle, setIsPremium, navigate]);

  // If no chart data anywhere, redirect to input
  if (!hasChartData) {
    return <Navigate to="/input" replace />;
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="font-serif text-4xl font-semibold gold-gradient-text mb-4">Payment Successful!</h1>
        <p className="t-text-muted text-lg">Taking you to your dashboard...</p>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="t-text-muted text-sm mb-3">Follow us on socials</p>
          <SocialLinks className="justify-center" iconClassName="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// =========================
// Payment
// =========================
function PaymentPage({ handlePayment, selectedBundle }) {
  const navigate = useNavigate();
  const bundle = BUNDLES[selectedBundle];
  const IconComponent = bundle.icon;

  const colorClasses = {
    yellow: { bg: "bg-[#D6B35A]/10", border: "border-[#D6B35A]/30", icon: "text-[#D6B35A]", price: "text-[#D6B35A]" },
    purple: { bg: "bg-[#69D2FF]/10", border: "border-[#69D2FF]/30", icon: "text-[#69D2FF]", price: "text-[#69D2FF]" },
    pink: { bg: "bg-white/5", border: "border-white/10", icon: "text-white", price: "text-white" },
  };
  const colors = colorClasses[bundle.color];

  return (
    <div className="min-h-screen text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full card-solid rounded-2xl p-8">
        <div className="text-center mb-6">
          <IconComponent className={`w-16 h-16 ${colors.icon} mx-auto mb-4`} />
          <h2 className="font-serif text-3xl font-semibold mb-2 gold-gradient-text">Complete Your Purchase</h2>
          <p className="t-text-muted">One-time • No subscription</p>
        </div>

        {/* Order Summary */}
        <div className={`${colors.bg} rounded-2xl p-6 mb-6 border ${colors.border}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-semibold">{bundle.name} Package</h3>
              <p className="text-sm t-text-muted">{bundle.description}</p>
            </div>
            <div className={`text-3xl font-bold ${colors.price}`}>
              ${bundle.price.toFixed(2)}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <h4 className="text-sm font-semibold t-text-muted mb-2">What's included:</h4>
            {bundle.features.filter(f => f.included).slice(0, 5).map((feature, idx) => (
              <div key={idx} className="flex items-start text-sm">
                <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="t-text-muted">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="t-text-muted">Order Total</span>
            <span className="text-2xl font-bold text-[#D6B35A]">${bundle.price.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => handlePayment(navigate)}
          className="w-full gold-gradient-btn px-6 py-4 rounded-xl text-lg font-bold shadow-xl mb-4"
        >
          Pay ${bundle.price.toFixed(2)} Now
        </button>

        <button
          onClick={() => navigate("/preview")}
          className="w-full t-text-muted hover:text-white transition-colors text-sm"
        >
          ← Change package
        </button>

        <p className="text-xs text-center t-text-muted mt-6">
          🔒 Secure payment via Stripe • Instant access after payment
        </p>
      </div>
    </div>
  );
}

// =========================
// Full Unlocked
// =========================
function ChartPage({ chartResult, birthData, isPremium, selectedBundle }) {
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle"); // idle, sending, success, error
  const [emailError, setEmailError] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [compatPartnerBirthData, setCompatPartnerBirthData] = useState({
    relationshipType: 'romantic',
    subjectRelationship: "partner",
    subjectInitials: "",
    birthMonth: "",
    birthDay: "",
    birthYear: "",
    hour: "",
    minute: "",
    period: "AM",
    location: "",
    tone: "classic",
  });
  const [compatibilityFetching, setCompatibilityFetching] = useState(false);
  const [compatibilityGenerating, setCompatibilityGenerating] = useState(false);
  const [compatibilityShowForm, setCompatibilityShowForm] = useState(false);
  const [compatibilityError, setCompatibilityError] = useState("");
  const [compatibilityReport, setCompatibilityReport] = useState(null);
  const [compatibilityRunsRemaining, setCompatibilityRunsRemaining] = useState(null);
  const [compatibilityComparisons, setCompatibilityComparisons] = useState([]);
  const [selectedCompatibilityComparisonId, setSelectedCompatibilityComparisonId] = useState('');

  // Get the active chart based on selected zodiac system
  // Supports both old flat format and new { tropical, sidereal, meta } format
  const zodiacType = chartResult?.zodiacType || 'tropical';
  const activeChart = chartResult?.tropical ? chartResult[zodiacType] : chartResult;
  // eslint-disable-next-line no-unused-vars
  const zodiacLabel = zodiacType === 'sidereal' ? 'Sidereal' : 'Tropical';

  // Tab and dashboard state - default to first purchased product
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = localStorage.getItem('natavium_purchasedProducts');
      if (!stored) return 'natal';
      const products = JSON.parse(stored);
      const baseBundle = products.bundle?.replace(/^(tropical|sidereal)_/, '');
      const addOns = (products.addOns || []).map(a => a.replace(/^(tropical|sidereal)_/, ''));
      const services = products.services || [];
      // Find first tab that is purchased
      for (const tab of DASHBOARD_TABS) {
        if (!tab.requiresPurchase) continue;
        if (tab.comingSoon) continue;
        if (tab.includedIn?.includes(baseBundle)) return tab.id;
        if (addOns.includes(tab.id)) return tab.id;
        if (tab.id === 'compatibility' && (addOns.includes('compatibility_3x') || services.includes('compatibility_3x'))) return tab.id;
        if (services.includes(tab.id)) return tab.id;
      }
      return 'natal';
    } catch { return 'natal'; }
  });
  const [analyses, setAnalyses] = useState(() => {
    try {
      const stored = localStorage.getItem('natavium_analyses');
      if (stored) return JSON.parse(stored);
      const legacy = localStorage.getItem('natavium_analysis');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const migrated = { natal: parsed };
        localStorage.setItem('natavium_analyses', JSON.stringify(migrated));
        return migrated;
      }
    } catch { /* ignore */ }
    return {};
  });
  const [generatingTab, setGeneratingTab] = useState(null);
  const [upsellTab, setUpsellTab] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState(() => {
    const saved = localStorage.getItem('natavium_purchasedProducts');
    return saved ? JSON.parse(saved) : { bundle: selectedBundle || 'essential', addOns: [] };
  });

  // Analyses are initialized synchronously from localStorage in useState above.
  // This flag tracks whether we've also checked Supabase for saved analyses.
  const [analysesLoaded, setAnalysesLoaded] = useState(false);

  // Silent claim on login so users rarely need to press "Claim purchases" manually.
  useEffect(() => {
    let cancelled = false;

    async function claimIfLoggedIn() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) return;

        await fetch('/api/claim-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action: 'claim-email' }),
        });

        const orderId = localStorage.getItem('natavium_orderId');
        if (orderId) {
          const res = await fetch('/api/claim-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ orderId }),
          });
          if (res.ok && !cancelled) {
            localStorage.removeItem('natavium_claimToken');
          }
        }
      } catch {
        // ignore
      }
    }

    // Run once on mount and on auth changes.
    claimIfLoggedIn();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      claimIfLoggedIn();
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch order data to get purchased products AND saved analyses (if orderId is in localStorage)
  useEffect(() => {
    const fetchOrderData = async () => {
      const orderId = localStorage.getItem('natavium_orderId');
      if (!orderId) {
        setAnalysesLoaded(true);
        return;
      }

      try {
        const claimToken = localStorage.getItem('natavium_claimToken');
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const res = await fetch(`/api/orders?id=${orderId}`, {
          headers: {
            ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          }
        });
        if (res.ok) {
          const data = await res.json();
          const products = {
            bundle: data.productType,
            addOns: data.purchasedAddons || [],
          };
          setPurchasedProducts(products);
          localStorage.setItem('natavium_purchasedProducts', JSON.stringify(products));

          // Load saved analyses from Supabase and merge into state
          if (data.analyses && Object.keys(data.analyses).length > 0) {
            const zodiacSystem = data.zodiacSystem || zodiacType || 'tropical';
            const normalized = {};
            Object.entries(data.analyses).forEach(([key, value]) => {
              // Strip zodiac prefix (e.g. 'sidereal_natal' -> 'natal')
              const unprefixed = key.startsWith(`${zodiacSystem}_`)
                ? key.slice(`${zodiacSystem}_`.length)
                : key;
              normalized[unprefixed] = value;
            });
            // Merge: Supabase analyses fill in any gaps not already in state
            setAnalyses(prev => {
              const merged = { ...normalized, ...prev };
              // But prefer Supabase data for keys that are in Supabase but empty locally
              Object.keys(normalized).forEach(key => {
                if (!prev[key]?.content && normalized[key]?.content) {
                  merged[key] = normalized[key];
                }
              });
              localStorage.setItem('natavium_analyses', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch order data:', err);
      } finally {
        setAnalysesLoaded(true);
      }
    };

    const refetchOrderDataWithRetry = async (attempt = 0) => {
      await fetchOrderData();
      try {
        const stored = localStorage.getItem('natavium_purchasedProducts');
        const parsed = stored ? JSON.parse(stored) : null;
        const addOns = parsed?.addOns || [];
        if (Array.isArray(addOns) && addOns.length > 0) return;
      } catch {
        // ignore
      }

      if (attempt >= 4) return;
      const delayMs = 1200 + attempt * 1500;
      setTimeout(() => refetchOrderDataWithRetry(attempt + 1), delayMs);
    };
    fetchOrderData();

    // Check for add-on purchase success and clean up URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('addon_success') === 'true') {
      // Clear the URL param
      window.history.replaceState({}, '', window.location.pathname);

      // Silently claim any paid orders for this email (if logged in), then refresh entitlements.
      (async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;
          if (accessToken) {
            await fetch('/api/claim-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ action: 'claim-email' }),
            });
          }
        } catch {
          // ignore
        }

        // Re-fetch order data to get updated add-ons (small delay for webhook to process)
        refetchOrderDataWithRetry(0);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if a tab is accessible
  // Handles both prefixed (tropical_natal) and unprefixed (natal) purchased add-ons
  // Also checks services array (set during checkout, before webhook fires)
  const isTabAccessible = (tabId) => {
    const tab = DASHBOARD_TABS.find(t => t.id === tabId);
    if (!tab) return false;
    if (!tab.requiresPurchase) return true;
    if (tab.comingSoon) return false;
    // Check add-ons from order (set by webhook via purchased_addons)
    const addOns = purchasedProducts.addOns || [];
    if (addOns.includes(tabId) ||
        addOns.includes(`tropical_${tabId}`) ||
        addOns.includes(`sidereal_${tabId}`)) return true;
    // compatibility_3x grants access to the compatibility tab
    if (tabId === 'compatibility' && (
        addOns.includes('compatibility_3x') ||
        addOns.includes('tropical_compatibility_3x') ||
        addOns.includes('sidereal_compatibility_3x'))) return true;
    // Check bundle inclusion: strip zodiac prefix from stored bundle for matching
    const baseBundle = purchasedProducts.bundle?.replace(/^(tropical|sidereal)_/, '');
    if (tab.includedIn?.includes(baseBundle)) return true;
    // Check services array (set during checkout in PreviewPage, available before webhook)
    const services = purchasedProducts.services || [];
    if (services.includes(tabId)) return true;
    // compatibility_3x service grants compatibility tab access
    if (tabId === 'compatibility' && services.includes('compatibility_3x')) return true;
    return false;
  };

  // Generate analysis for a specific tab
  const generateAnalysisForTab = async (tabId) => {
    if (analyses[tabId]?.content || generatingTab) return;

    setGeneratingTab(tabId);

    try {
      const response = await fetch('/api/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartResult,
          analysisType: tabId,
          productType: purchasedProducts.bundle || 'essential',
          birthData,
          zodiacSystem: zodiacType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        // Update state progressively for live streaming
        // Capture current value in block-scoped variable to avoid no-loop-func warning
        const currentText = fullText;
        setAnalyses(prev => ({
          ...prev,
          [tabId]: { content: currentText, generatedAt: new Date().toISOString() }
        }));
      }

      // Save to localStorage
      const updatedAnalyses = {
        ...analyses,
        [tabId]: { content: fullText, generatedAt: new Date().toISOString() }
      };
      localStorage.setItem('natavium_analyses', JSON.stringify(updatedAnalyses));

      // === START NEW DATABASE SAVE ===
      try {
        const storedOrderId = localStorage.getItem('natavium_orderId'); 
        
        if (storedOrderId) {
          console.log(`Saving ${tabId} analysis to database...`);
          // Save in background
          const claimToken = localStorage.getItem('natavium_claimToken');
          (async () => {
            const { data } = await supabase.auth.getSession();
            const accessToken = data?.session?.access_token;
            fetch('/api/save-analysis', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({
                orderId: storedOrderId,
                analysisType: tabId, // <--- Using the variable from your function
                content: fullText
              })
            });
          })();
        }
      } catch (err) {
        console.error("Background save failed:", err);
      }
      // === END NEW DATABASE SAVE ===

    } catch (error) {
      console.error(`Failed to generate ${tabId} analysis:`, error);
    } finally {
      setGeneratingTab(null);
    }
  };

  // Auto-generate natal analysis once Supabase data is loaded, if purchased but not yet generated
  useEffect(() => {
    if (!analysesLoaded) return;
    if (isTabAccessible('natal') && !analyses.natal?.content && !generatingTab) {
      generateAnalysisForTab('natal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysesLoaded]);

  // Auto-generate the initially active tab's analysis (for non-natal, non-compatibility tabs)
  useEffect(() => {
    if (!analysesLoaded) return;
    if (activeTab && activeTab !== 'natal' && activeTab !== 'compatibility') {
      if (isTabAccessible(activeTab) && !analyses[activeTab]?.content && !generatingTab) {
        generateAnalysisForTab(activeTab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysesLoaded]);

  // Handle tab click
  const handleTabClick = (tab) => {
    if (tab.comingSoon) {
      setUpsellTab({ ...tab, isComingSoon: true });
      return;
    }
    if (isTabAccessible(tab.id)) {
      setActiveTab(tab.id);
      // Generate analysis if not already present
      if (!analyses[tab.id]?.content && tab.id !== 'compatibility') {
        generateAnalysisForTab(tab.id);
      }
    } else if (tab.id === 'natal') {
      // Natal tab is always selectable - shows preview content when locked
      setActiveTab(tab.id);
    } else {
      // Pre-select the clicked add-on and open modal
      setSelectedAddOns([tab.id]);
      setUpsellTab(tab);
    }
  };

  useEffect(() => {
    if (activeTab !== 'compatibility') return;
    if (compatibilityGenerating) return;

    const orderId = localStorage.getItem('natavium_orderId');
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      setCompatibilityReport(null);
      setCompatibilityError('No order found. Please open your purchased report (or complete a purchase) before generating compatibility.');
      return;
    }

    setCompatibilityError("");

    (async () => {
      try {
        setCompatibilityFetching(true);
        const claimToken = localStorage.getItem('natavium_claimToken');
        const { data } = await supabase.auth.getSession();
        const accessToken = data?.session?.access_token;

        const res = await fetch(`/api/compatibility?orderId=${encodeURIComponent(orderId)}`, {
          headers: {
            'X-Order-Id': String(orderId),
            ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          }
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to load compatibility report');
        }

        if (Number.isFinite(payload?.runsRemaining)) {
          setCompatibilityRunsRemaining(payload.runsRemaining);
        }
        if (Array.isArray(payload?.comparisons)) {
          setCompatibilityComparisons(payload.comparisons);
          setSelectedCompatibilityComparisonId((prev) => {
            if (prev && payload.comparisons.some(c => c?.id === prev)) return prev;
            const mostRecentId = payload.comparisons[payload.comparisons.length - 1]?.id;
            return mostRecentId || '';
          });
        }

        setCompatibilityReport(payload?.report || null);

        if (payload?.report?.analysis) {
          setAnalyses(prev => ({
            ...prev,
            compatibility: payload.report.analysis,
          }));

          try {
            const stored = localStorage.getItem('natavium_analyses');
            const parsed = stored ? JSON.parse(stored) : {};
            const next = { ...parsed, compatibility: payload.report.analysis };
            localStorage.setItem('natavium_analyses', JSON.stringify(next));
          } catch {
            // ignore localStorage write errors
          }
        }
      } catch (e) {
        setCompatibilityError(e.message || 'Failed to load compatibility report');
      } finally {
        setCompatibilityFetching(false);
      }
    })();
  }, [activeTab, compatibilityGenerating]);

  useEffect(() => {
    if (activeTab !== 'compatibility') return;

    if (!selectedCompatibilityComparisonId) {
      return;
    }

    const found = compatibilityComparisons.find((c) => c?.id === selectedCompatibilityComparisonId);
    if (!found?.analysis) return;

    setCompatibilityError('');
    setCompatibilityReport({
      order_id: localStorage.getItem('natavium_orderId') || null,
      zodiac_system: found?.zodiacSystem || null,
      partner_birth_data: found?.partnerBirthData || null,
      analysis: found.analysis,
    });
    setCompatibilityShowForm(false);
    setAnalyses(prev => ({
      ...prev,
      compatibility: found.analysis,
    }));
  }, [activeTab, selectedCompatibilityComparisonId, compatibilityComparisons]);

  const handlePurchaseCompatibilityRuns = async (pack) => {
    const orderId = localStorage.getItem('natavium_orderId');
    if (!orderId) {
      alert('No order found. Please complete your initial purchase first.');
      return;
    }

    const addOnId = pack === '3x' ? 'compatibility_3x' : 'compatibility';
    setCheckoutLoading(true);
    try {
      const claimToken = localStorage.getItem('natavium_claimToken');
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch('/api/create-addon-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          addOns: [addOnId],
        }),
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to start checkout');
      }

      if (responseData?.url) {
        window.location.href = responseData.url;
      } else {
        throw new Error('Checkout URL missing');
      }
    } catch (err) {
      alert(err?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleGenerateCompatibility = async ({ forceNew = false } = {}) => {
    const orderId = localStorage.getItem('natavium_orderId');
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      setCompatibilityError('No order found. Please complete a purchase first.');
      return;
    }

    if (forceNew && !compatibilityShowForm) {
      setCompatibilityError('');
      setCompatibilityShowForm(true);
      return;
    }

    if (!forceNew && (compatibilityReport?.analysis?.content || analyses?.compatibility?.content)) {
      setCompatibilityError('Compatibility report already exists for this order.');
      return;
    }

    if (Number.isFinite(compatibilityRunsRemaining) && compatibilityRunsRemaining <= 0) {
      setCompatibilityError('You’re out of compatibility comparisons for this order.');
      return;
    }

    if (compatibilityGenerating) return;

    setCompatibilityError("");
    setCompatibilityGenerating(true);

    try {
      const m = parseInt(compatPartnerBirthData.birthMonth, 10);
      const d = parseInt(compatPartnerBirthData.birthDay, 10);
      const y = parseInt(compatPartnerBirthData.birthYear, 10);
      const h12 = parseInt(compatPartnerBirthData.hour, 10);
      const min = parseInt(compatPartnerBirthData.minute, 10);

      if (!m || !d || !y || !h12 || isNaN(min) || !compatPartnerBirthData.location) {
        throw new Error('Please fill out all partner birth fields.');
      }

      let hour24 = h12;
      if (compatPartnerBirthData.period === 'AM') {
        hour24 = h12 === 12 ? 0 : h12;
      } else {
        hour24 = h12 === 12 ? 12 : h12 + 12;
      }

      const partnerChartData = await calculateNatalChartFromLocal({
        year: y,
        month: m,
        day: d,
        hour: hour24,
        minute: min,
        locationString: compatPartnerBirthData.location,
      });

      const claimToken = localStorage.getItem('natavium_claimToken');
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;

      const label = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Order-Id': String(orderId),
          ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          partnerBirthData: compatPartnerBirthData,
          partnerChartData,
          label,
          relationshipType: compatPartnerBirthData?.relationshipType,
          tone: compatPartnerBirthData?.tone || birthData?.tone || 'classic',
        })
      });

      if (!res.ok) {
        if (res.status === 402) {
          throw new Error('No compatibility runs remaining for this order.');
        }

        if (res.status === 409) {
          const refetch = await fetch(`/api/compatibility?orderId=${encodeURIComponent(orderId)}`, {
            headers: {
              'X-Order-Id': String(orderId),
              ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            }
          });

          const payload = await refetch.json().catch(() => ({}));
          if (!refetch.ok) {
            throw new Error(payload?.error || 'Failed to load compatibility report');
          }

          setCompatibilityReport(payload?.report || null);
          if (payload?.report?.analysis) {
            setAnalyses(prev => ({
              ...prev,
              compatibility: payload.report.analysis,
            }));
            try {
              const stored = localStorage.getItem('natavium_analyses');
              const parsed = stored ? JSON.parse(stored) : {};
              const next = { ...parsed, compatibility: payload.report.analysis };
              localStorage.setItem('natavium_analyses', JSON.stringify(next));
            } catch {
              // ignore localStorage write errors
            }
          }

          return;
        }

        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to generate compatibility report');
      }

      const reader = res.body?.getReader?.();
      if (!reader) {
        throw new Error('Streaming not supported');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });

        const analysis = { content: fullText };
        setAnalyses(prev => ({
          ...prev,
          compatibility: analysis,
        }));
        setCompatibilityReport({ analysis });
      }

      fullText += decoder.decode();
      const finalAnalysis = {
        content: fullText,
        generatedAt: new Date().toISOString(),
      };

      setAnalyses(prev => ({
        ...prev,
        compatibility: finalAnalysis,
      }));
      setCompatibilityReport({ analysis: finalAnalysis });

      try {
        const stored = localStorage.getItem('natavium_analyses');
        const parsed = stored ? JSON.parse(stored) : {};
        const next = { ...parsed, compatibility: finalAnalysis };
        localStorage.setItem('natavium_analyses', JSON.stringify(next));
      } catch {
        // ignore localStorage write errors
      }

      setCompatibilityShowForm(false);

      // Refresh runs/comparisons from server after generation finishes.
      try {
        const refetch = await fetch(`/api/compatibility?orderId=${encodeURIComponent(orderId)}`, {
          headers: {
            'X-Order-Id': String(orderId),
            ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          }
        });
        const payload = await refetch.json().catch(() => ({}));
        if (refetch.ok) {
          if (Number.isFinite(payload?.runsRemaining)) {
            setCompatibilityRunsRemaining(payload.runsRemaining);
          }
          if (Array.isArray(payload?.comparisons)) {
            setCompatibilityComparisons(payload.comparisons);
            const mostRecentId = payload.comparisons[payload.comparisons.length - 1]?.id;
            setSelectedCompatibilityComparisonId(mostRecentId || '');
          }
        }
      } catch {
        // ignore
      }
    } catch (e) {
      setCompatibilityError(e.message || 'Failed to generate compatibility report');
    } finally {
      setCompatibilityGenerating(false);
    }
  };

  // Get all locked (purchasable) add-ons
  const getLockedAddOns = () => {
    return DASHBOARD_TABS.filter(tab =>
      tab.requiresPurchase &&
      !tab.comingSoon &&
      !isTabAccessible(tab.id)
    );
  };

  // Toggle add-on selection
  const toggleAddOnSelection = (addOnId) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  // Calculate total price for selected add-ons
  const calculateTotal = () => {
    return selectedAddOns.reduce((total, addOnId) => {
      const tab = DASHBOARD_TABS.find(t => t.id === addOnId);
      return total + (tab?.priceIfLocked || 0);
    }, 0);
  };

  // Handle add-on checkout
  const handleAddOnCheckout = async () => {
    if (!selectedAddOns.length) return;

    const orderId = localStorage.getItem('natavium_orderId');
    if (!orderId) {
      alert('No order found. Please complete your initial purchase first.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const claimToken = localStorage.getItem('natavium_claimToken');
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch('/api/create-addon-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          orderId,
          addOns: selectedAddOns,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Checkout failed');
      }

      // Redirect to Stripe
      window.location.href = responseData.url;
    } catch (error) {
      console.error('Add-on checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Function to regenerate analysis for the active tab
  // eslint-disable-next-line no-unused-vars
  const regenerateAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const response = await fetch('/api/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartResult,
          birthData,
          analysisType: activeTab,
          productType: purchasedProducts.bundle || 'essential',
          zodiacSystem: zodiacType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate analysis');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        // Capture current value in block-scoped variable to avoid no-loop-func warning
        const currentText = fullText;
        setAnalyses(prev => ({
          ...prev,
          [activeTab]: { content: currentText, generatedAt: new Date().toISOString() }
        }));
      }

      // Save to localStorage
      const updatedAnalyses = {
        ...analyses,
        [activeTab]: { content: fullText, generatedAt: new Date().toISOString() }
      };
      localStorage.setItem('natavium_analyses', JSON.stringify(updatedAnalyses));

      // === START NEW DATABASE SAVE ===
      try {
        const storedOrderId = localStorage.getItem('natavium_orderId'); 
        
        if (storedOrderId) {
          console.log(`Saving regenerated ${activeTab} analysis to database...`);
          // Save in background
          const claimToken = localStorage.getItem('natavium_claimToken');
          (async () => {
            const { data } = await supabase.auth.getSession();
            const accessToken = data?.session?.access_token;
            fetch('/api/save-analysis', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(claimToken ? { 'X-Claim-Token': claimToken } : {}),
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({
                orderId: storedOrderId,
                analysisType: activeTab, // <--- Using the 'activeTab' variable
                content: fullText
              })
            });
          })();
        }
      } catch (err) {
        console.error("Background save failed:", err);
      }
      // === END NEW DATABASE SAVE ===

    } catch (error) {
      console.error('Regeneration error:', error);
      alert('Failed to regenerate analysis. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Get the current analysis for the active tab
  const currentAnalysis = analyses[activeTab];

  if (!isPremium || !chartResult) {
    return <Navigate to="/preview" replace />;
  }

  const displayDate = formatBirthDate(birthData.birthMonth, birthData.birthDay, birthData.birthYear);

  // PDF Generation Handler (Server-side via Puppeteer) - available for future use
  // eslint-disable-next-line no-unused-vars
  const handleDownloadPDF = async () => {
    if (pdfGenerating) return;

    // Get orderId from localStorage
    const orderId = localStorage.getItem('natavium_orderId');
    if (!orderId) {
      alert("No order found. Please complete a purchase first.");
      return;
    }

    setPdfGenerating(true);
    try {
      // --- START NEW IMAGE CAPTURE LOGIC ---
      let chartImage = null;
      const chartElement = document.getElementById("natal-chart-container");

      if (chartElement) {
        // Capture the chart div as an image
        const canvas = await html2canvas(chartElement, {
          scale: 2, // Makes text sharper
          backgroundColor: null, // Transparent background
          logging: false
        });
        chartImage = canvas.toDataURL("image/png");
      }
      // --- END NEW IMAGE CAPTURE LOGIC ---

      // Server will fetch order data and ensure all purchased analyses are generated
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem('natavium_claimToken')
            ? { 'X-Claim-Token': localStorage.getItem('natavium_claimToken') }
            : {}),
        },
        body: JSON.stringify({
          orderId,
          chartImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const data = await response.json();
      
      // Convert Base64 back to binary for download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename || "natal-chart.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfGenerating(false);
    }
  };

  // Email Handler
  const handleSendEmail = async () => {
    if (!emailAddress || emailStatus === "sending") return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Get orderId from localStorage
    const orderId = localStorage.getItem('natavium_orderId');
    if (!orderId) {
      setEmailError("No order found. Please complete a purchase first.");
      return;
    }

    setEmailStatus("sending");
    setEmailError("");

    try {
      // Server will fetch order data and ensure all purchased analyses are generated
      const response = await fetch("/api/send-chart-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem('natavium_claimToken')
            ? { 'X-Claim-Token': localStorage.getItem('natavium_claimToken') }
            : {}),
        },
        body: JSON.stringify({
          orderId,
          email: emailAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setEmailStatus("success");
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus("idle");
        setEmailAddress("");
      }, 2000);
    } catch (error) {
      console.error("Email send error:", error);
      setEmailError(error.message || "Failed to send email. Please try again.");
      setEmailStatus("error");
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card-solid rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Email Your Chart</h3>
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailStatus("idle");
                setEmailError("");
              }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {emailStatus === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg font-semibold text-green-400">Email Sent!</p>
              <p className="t-text-muted text-sm mt-2">Check your inbox for your chart results.</p>
            </div>
          ) : (
            <>
              <p className="t-text-muted text-sm mb-4">
                We'll send your complete chart results including all planetary placements to your email.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D6B35A] focus:border-transparent"
                  disabled={emailStatus === "sending"}
                />
                {emailError && (
                  <p className="text-red-400 text-sm mt-2">{emailError}</p>
                )}
              </div>

              <button
                onClick={handleSendEmail}
                disabled={!emailAddress || emailStatus === "sending"}
                className="w-full gold-gradient-btn px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {emailStatus === "sending" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send to Email
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with My Reports button in upper right */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold gold-gradient-text mb-2">
              Astrological Analyses for {birthData.subjectInitials?.toUpperCase() || 'You'}
            </h1>
            <p className="text-lg t-text-muted">
              {displayDate} • {birthData.time} • {birthData.location}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SocialLinks iconClassName="w-4 h-4" />
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-[#12142A] hover:border-white/20 transition-all text-sm"
            >
              <Star className="w-4 h-4 mr-2 icon-gold" strokeWidth={1} />
              My Reports
            </button>
          </div>
        </div>

        {/* Product Bar - Services available and access status */}
        <div className="card-solid rounded-2xl p-4 mb-6">
          <h2 className="font-serif text-2xl font-semibold gold-gradient-text text-center mb-4">Welcome to Your Cosmic Journey!</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {DASHBOARD_TABS.map((tab) => {
              const accessible = isTabAccessible(tab.id);
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              const isGenerating = generatingTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                    isActive
                      ? 'bg-[#D6B35A]/20 border-[#D6B35A]/50'
                      : accessible
                        ? 'bg-[#D6B35A]/10 border-[#D6B35A]/30 hover:bg-[#D6B35A]/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-60'
                  }`}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D6B35A]" />
                  ) : (
                    <TabIcon className={`w-4 h-4 ${accessible ? 'text-[#D6B35A]' : 't-text-muted'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tab.label}</div>
                    {tab.comingSoon ? (
                      <div className="text-[10px] text-[#69D2FF]">Soon</div>
                    ) : (
                      <div className={`text-xs ${accessible ? 'text-green-400' : 't-text-muted'}`}>
                        {accessible ? '✓ Available' : '🔒 Locked'}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upsell Modal */}
        {upsellTab && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-solid rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              {upsellTab.isComingSoon ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#69D2FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-[#69D2FF]" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold mb-2">{upsellTab.label}</h3>
                    <p className="t-text-muted mb-4">{upsellTab.description}</p>
                    <div className="bg-[#69D2FF]/10 rounded-xl p-4 mb-4 border border-[#69D2FF]/20">
                      <p className="text-[#D6B35A] font-semibold">Coming Soon!</p>
                      <p className="t-text-muted text-sm mt-1">This feature is currently in development.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUpsellTab(null)}
                    className="w-full py-3 t-text-muted hover:text-white transition-colors"
                  >
                    Got it
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#D6B35A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-[#D6B35A]" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold mb-2">Unlock Premium Features</h3>
                    <p className="t-text-muted">Select the add-ons you'd like to unlock</p>
                  </div>

                  {/* Add-on selection list */}
                  <div className="space-y-3 mb-6">
                    {getLockedAddOns().map(addon => {
                      const AddonIcon = addon.icon;
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddOnSelection(addon.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-[#D6B35A]/20 border-[#D6B35A]/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#D6B35A] border-[#D6B35A]'
                              : 'border-white/30'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-[#12142A]" />}
                          </div>
                          <AddonIcon className={`w-5 h-5 ${isSelected ? 'text-[#D6B35A]' : 't-text-muted'}`} />
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{addon.label}</div>
                            <div className="text-xs t-text-muted">{addon.description?.slice(0, 50)}...</div>
                          </div>
                          <div className={`font-bold ${isSelected ? 'text-[#D6B35A]' : 't-text-muted'}`}>
                            ${addon.priceIfLocked?.toFixed(2)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Total and checkout */}
                  {selectedAddOns.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-4 mb-4 border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="t-text-muted">{selectedAddOns.length} item{selectedAddOns.length > 1 ? 's' : ''} selected</span>
                        <span className="text-2xl font-bold text-[#D6B35A]">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddOnCheckout}
                    disabled={selectedAddOns.length === 0 || checkoutLoading}
                    className={`w-full py-4 rounded-xl font-bold transition-all mb-3 ${
                      selectedAddOns.length > 0 && !checkoutLoading
                        ? 'gold-gradient-btn'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting...
                      </span>
                    ) : selectedAddOns.length > 0 ? (
                      `Checkout - $${calculateTotal().toFixed(2)}`
                    ) : (
                      'Select items to continue'
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setUpsellTab(null);
                      setSelectedAddOns([]);
                    }}
                    className="w-full py-3 t-text-muted hover:text-white transition-colors"
                  >
                    Maybe later
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Chart content - shown on Natal tab */}
        {activeTab === 'natal' && (
        <div className="space-y-8">
          {/* Chart Wheel + Mobile Mockup Grid */}
          <div className="grid md:grid-cols-5 gap-6">
            {/* Premium Chart Wheel - takes 3/5 width */}
            <div id="natal-chart-container" className="card-solid rounded-2xl p-6 md:col-span-3">
              {/* Personalized Archetype - above wheel */}
              {(() => {
                // Sun sign base archetypes
                const sunArchetypes = {
                  Aries: ["Bold Pioneer", "Fearless Warrior", "Dynamic Leader"],
                  Taurus: ["Grounded Builder", "Patient Cultivator", "Steadfast Creator"],
                  Gemini: ["Curious Messenger", "Witty Explorer", "Clever Connector"],
                  Cancer: ["Nurturing Protector", "Intuitive Guardian", "Emotional Anchor"],
                  Leo: ["Radiant Leader", "Generous Star", "Confident Creator"],
                  Virgo: ["Precise Perfectionist", "Helpful Analyst", "Practical Healer"],
                  Libra: ["Harmonious Diplomat", "Aesthetic Peacemaker", "Balanced Judge"],
                  Scorpio: ["Intense Transformer", "Magnetic Detective", "Powerful Phoenix"],
                  Sagittarius: ["Adventurous Philosopher", "Optimistic Explorer", "Free Spirit"],
                  Capricorn: ["Ambitious Achiever", "Disciplined Climber", "Wise Authority"],
                  Aquarius: ["Visionary Rebel", "Independent Innovator", "Humanitarian Genius"],
                  Pisces: ["Dreamy Mystic", "Compassionate Artist", "Intuitive Empath"],
                };

                // Element mappings
                const signElements = {
                  Aries: "fire", Leo: "fire", Sagittarius: "fire",
                  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
                  Gemini: "air", Libra: "air", Aquarius: "air",
                  Cancer: "water", Scorpio: "water", Pisces: "water",
                };

                // Moon element modifiers
                const moonModifiers = {
                  fire: ["Passionate", "Bold", "Fiery"],
                  earth: ["Grounded", "Practical", "Steady"],
                  air: ["Intellectual", "Social", "Thoughtful"],
                  water: ["Sensitive", "Intuitive", "Deep"],
                };

                const sunSign = activeChart.sun.sign;
                const moonSign = activeChart.moon.sign;
                const risingSign = activeChart.rising.sign;

                const moonElement = signElements[moonSign];

                // Get base archetype from sun sign
                const baseArchetypes = sunArchetypes[sunSign] || ["Cosmic Soul"];
                const baseArchetype = baseArchetypes[0];

                // Get moon modifier
                const moonMods = moonModifiers[moonElement] || ["Intuitive"];
                const moonMod = moonMods[0];

                // Combine into a unique archetype title
                const baseWords = baseArchetype.split(" ");
                const archetypeNoun = baseWords[baseWords.length - 1];

                const archetype = `The ${moonMod} ${archetypeNoun}`;

                return (
                  <div className="text-center mb-6 pb-6 border-b border-white/10">
                    <p className="font-serif text-2xl font-semibold gold-gradient-text">
                      {sunSign} — <span className="italic">"{archetype}"</span>
                    </p>
                    <p className="text-xs t-text-muted mt-2">
                      {moonSign} Moon • {risingSign} Rising
                    </p>
                  </div>
                );
              })()}

              {/* Chart Wheel */}
            {(() => {
              // SVG Path definitions for zodiac signs (scaled for 14px viewBox centered at 0,0)
              const zodiacPaths = {
                Aries: "M-5,6 L0,-6 L5,6 M-4,2 L0,-4 L4,2", // Ram horns
                Taurus: "M-5,4 A5,5 0 1,1 5,4 M-6,4 L-6,6 M6,4 L6,6", // Bull circle with horns
                Gemini: "M-4,-6 L-4,6 M4,-6 L4,6 M-4,-4 L4,-4 M-4,4 L4,4", // Pillars
                Cancer: "M-5,0 A4,4 0 0,1 0,-4 A4,4 0 0,0 5,0 M5,0 A4,4 0 0,1 0,4 A4,4 0 0,0 -5,0", // 69 shape
                Leo: "M-4,4 A4,4 0 1,1 0,0 M0,0 Q4,-4 4,2 Q4,6 0,6", // Lion loop
                Virgo: "M-5,-5 L-5,5 M-5,0 L0,-5 L0,5 M0,0 L5,-5 L5,2 Q5,6 2,6 L4,4", // M with tail
                Libra: "M-6,4 L6,4 M-4,0 L4,0 M0,0 L0,-5 A4,4 0 0,1 4,-5", // Scales
                Scorpio: "M-5,-5 L-5,5 M-5,0 L0,-5 L0,5 M0,0 L5,-5 L5,5 L7,3", // M with arrow
                Sagittarius: "M-5,5 L5,-5 M2,-5 L5,-5 L5,-2 M-3,1 L3,-5", // Arrow
                Capricorn: "M-5,-4 Q-2,-6 0,-2 L0,4 Q0,6 3,6 A3,3 0 1,0 5,2", // Sea-goat
                Aquarius: "M-6,-2 L-3,2 L0,-2 L3,2 L6,-2 M-6,2 L-3,6 L0,2 L3,6 L6,2", // Waves
                Pisces: "M-2,-6 A4,6 0 0,0 -2,6 M2,-6 A4,6 0 0,1 2,6 M-4,0 L4,0", // Two curves
              };

              // SVG Path definitions for planets (scaled for 12px viewBox centered at 0,0)
              const planetPaths = {
                sun: "M0,0 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0 M0,-1.5 L0,1.5 M-1.5,0 L1.5,0", // Circle with cross
                moon: "M2,-5 A5,5 0 1,0 2,5 A4,4 0 1,1 2,-5", // Crescent
                mercury: "M0,-5 A3,3 0 1,1 0,1 M0,1 L0,5 M-2,3 L2,3 M-2,-6 A2,2 0 1,1 2,-6", // Winged circle
                venus: "M0,-5 A4,4 0 1,1 0,3 M0,3 L0,6 M-2,5 L2,5", // Circle with cross below
                mars: "M-3,3 A5,5 0 1,1 3,-3 M1,-3 L5,-5 L3,-1", // Circle with arrow
                jupiter: "M-4,0 L4,0 M2,-5 L2,5 M-4,5 A5,5 0 0,1 -4,-2", // Jupiter symbol (4-shape)
                saturn: "M-3,-5 L-3,0 A3,3 0 0,0 3,0 L3,5 M-1,-5 L-5,-5 M0,2 L-4,2", // Saturn h-shape
                uranus: "M0,-5 L0,2 M-4,2 L4,2 M0,2 L0,5 A3,3 0 1,1 0,5 M-3,-3 L0,-5 L3,-3", // Uranus
                neptune: "M0,-2 A3,3 0 1,1 0,4 M0,4 L0,6 M-2,5 L2,5 M-3,-4 A5,2 0 0,1 3,-4", // Trident
                pluto: "M0,-2 A3,3 0 1,1 0,4 M0,4 L0,6 M-2,5 L2,5 M-3,-4 A5,2 0 0,1 3,-4", // Pluto symbol
              };

              const zodiacSigns = [
                { name: "Aries", element: "fire" },
                { name: "Taurus", element: "earth" },
                { name: "Gemini", element: "air" },
                { name: "Cancer", element: "water" },
                { name: "Leo", element: "fire" },
                { name: "Virgo", element: "earth" },
                { name: "Libra", element: "air" },
                { name: "Scorpio", element: "water" },
                { name: "Sagittarius", element: "fire" },
                { name: "Capricorn", element: "earth" },
                { name: "Aquarius", element: "air" },
                { name: "Pisces", element: "water" },
              ];

              // Premium element colors with gradient IDs
              const elementColors = {
                fire: "#ff6b6b",
                earth: "#4ade80",
                air: "#fde047",
                water: "#60a5fa"
              };

              const risingIndex = zodiacSigns.findIndex((s) => s.name === activeChart.rising.sign);
              const risingOffset = 180 - risingIndex * 30 - 15;

              const getPosition = (angleDeg, radius) => {
                const angleRad = (angleDeg * Math.PI) / 180;
                return { x: 200 + radius * Math.cos(angleRad), y: 200 + radius * Math.sin(angleRad) };
              };

              const getPlanetAngle = (sign, degree) => {
                const signIndex = zodiacSigns.findIndex((s) => s.name === sign);
                return signIndex * 30 + degree + risingOffset;
              };

              // All planets including outer planets
              const planets = [
                { key: "sun", ...activeChart.sun },
                { key: "moon", ...activeChart.moon },
                { key: "mercury", sign: activeChart.mercury.sign, degree: activeChart.mercury.degree || 8 },
                { key: "venus", sign: activeChart.venus.sign, degree: activeChart.venus.degree || 24 },
                { key: "mars", sign: activeChart.mars.sign, degree: activeChart.mars.degree || 12 },
                { key: "jupiter", sign: activeChart.jupiter?.sign, degree: activeChart.jupiter?.degree || 15 },
                { key: "saturn", sign: activeChart.saturn?.sign, degree: activeChart.saturn?.degree || 20 },
              ];

              return (
                <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-4">
                  <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      {/* Gold Glow Filter */}
                      <filter id="goldGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="3" result="blur1" />
                        <feColorMatrix in="blur1" type="matrix" values="1 0.8 0 0 0  0.9 0.7 0 0 0  0 0 0.2 0 0  0 0 0 1 0" result="goldBlur" />
                        <feMerge>
                          <feMergeNode in="goldBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Purple Glow Filter */}
                      <filter id="purpleGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="2" result="blur2" />
                        <feColorMatrix in="blur2" type="matrix" values="0.6 0 0.8 0 0  0.3 0 0.6 0 0  0.8 0 1 0 0  0 0 0 0.8 0" result="purpleBlur" />
                        <feMerge>
                          <feMergeNode in="purpleBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Planet Marker Glow */}
                      <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur3" />
                        <feMerge>
                          <feMergeNode in="blur3" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Background Radial Gradient - Dark center to lighter rim */}
                      <radialGradient id="wheelBackground" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#0f0a1e', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#1a1035', stopOpacity: 1 }} />
                        <stop offset="85%" style={{ stopColor: '#2d1f5c', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#3d2a7a', stopOpacity: 1 }} />
                      </radialGradient>

                      {/* Gold Ring Gradient */}
                      <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                      </linearGradient>

                      {/* Purple Ring Gradient */}
                      <linearGradient id="purpleRing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.8 }} />
                        <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0.8 }} />
                      </linearGradient>

                      {/* Center Gradient */}
                      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.4 }} />
                        <stop offset="70%" style={{ stopColor: '#581c87', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#1e1b4b', stopOpacity: 0.9 }} />
                      </radialGradient>

                      {/* Fire Element Gradient */}
                      <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                      </linearGradient>

                      {/* Earth Element Gradient */}
                      <linearGradient id="earthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                      </linearGradient>

                      {/* Air Element Gradient */}
                      <linearGradient id="airGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#facc15', stopOpacity: 1 }} />
                      </linearGradient>

                      {/* Water Element Gradient */}
                      <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>

                    {/* Background circle with depth gradient */}
                    <circle cx="200" cy="200" r="198" fill="url(#wheelBackground)" />

                    {/* Outer decorative ring */}
                    <circle cx="200" cy="200" r="196" fill="none" stroke="url(#goldRing)" strokeWidth="3" style={{ filter: 'url(#goldGlow)' }} />
                    <circle cx="200" cy="200" r="192" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />

                    {/* Zodiac band outer edge */}
                    <circle cx="200" cy="200" r="160" fill="none" stroke="url(#purpleRing)" strokeWidth="1.5" />

                    {/* House circle */}
                    <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(167, 139, 250, 0.4)" strokeWidth="1" />

                    {/* Inner planet zone */}
                    <circle cx="200" cy="200" r="80" fill="url(#centerGlow)" stroke="url(#purpleRing)" strokeWidth="1.5" />

                    {/* Zodiac sign dividers and glyphs */}
                    {zodiacSigns.map((sign, i) => {
                      const startAngle = i * 30 + risingOffset;
                      const midAngle = startAngle + 15;
                      const glyphPos = getPosition(midAngle, 176);
                      const lineStart = getPosition(startAngle, 160);
                      const lineEnd = getPosition(startAngle, 192);
                      const rotation = midAngle + 90;

                      return (
                        <g key={sign.name}>
                          {/* Divider line */}
                          <line
                            x1={lineStart.x}
                            y1={lineStart.y}
                            x2={lineEnd.x}
                            y2={lineEnd.y}
                            stroke="url(#goldRing)"
                            strokeWidth="1"
                            style={{ opacity: 0.6 }}
                          />
                          {/* Zodiac glyph as SVG path */}
                          <g transform={`translate(${glyphPos.x}, ${glyphPos.y}) rotate(${rotation}) scale(0.9)`}>
                            <path
                              d={zodiacPaths[sign.name]}
                              fill="none"
                              stroke={elementColors[sign.element]}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ filter: 'url(#planetGlow)' }}
                            />
                          </g>
                        </g>
                      );
                    })}

                    {/* House numbers */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const houseAngle = i * 30 + risingOffset + 15;
                      const housePos = getPosition(houseAngle, 140);
                      return (
                        <text
                          key={`house-${i + 1}`}
                          x={housePos.x}
                          y={housePos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="rgba(167, 139, 250, 0.8)"
                          style={{ fontSize: '11px', fontWeight: '600', fontFamily: 'system-ui, sans-serif' }}
                        >
                          {i + 1}
                        </text>
                      );
                    })}

                    {/* House cusp lines */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const angle = i * 30 + risingOffset;
                      const innerPos = getPosition(angle, 80);
                      const outerPos = getPosition(angle, 120);
                      const isCardinal = i % 3 === 0;
                      return (
                        <line
                          key={`cusp-${i}`}
                          x1={innerPos.x}
                          y1={innerPos.y}
                          x2={outerPos.x}
                          y2={outerPos.y}
                          stroke={isCardinal ? "url(#goldRing)" : "rgba(167, 139, 250, 0.35)"}
                          strokeWidth={isCardinal ? "2" : "1"}
                          style={isCardinal ? { filter: 'url(#goldGlow)' } : {}}
                        />
                      );
                    })}

                    {/* Ascendant/Descendant axis (thicker) */}
                    {(() => {
                      const ascPos = getPosition(180, 195);
                      const descPos = getPosition(0, 195);
                      return (
                        <line
                          x1={ascPos.x}
                          y1={ascPos.y}
                          x2={descPos.x}
                          y2={descPos.y}
                          stroke="url(#goldRing)"
                          strokeWidth="2"
                          style={{ filter: 'url(#goldGlow)', opacity: 0.7 }}
                        />
                      );
                    })()}

                    {/* MC/IC axis */}
                    {(() => {
                      const mcPos = getPosition(270, 195);
                      const icPos = getPosition(90, 195);
                      return (
                        <line
                          x1={mcPos.x}
                          y1={mcPos.y}
                          x2={icPos.x}
                          y2={icPos.y}
                          stroke="url(#purpleRing)"
                          strokeWidth="1.5"
                          style={{ opacity: 0.5 }}
                        />
                      );
                    })()}

                    {/* Ascendant arrow marker */}
                    <g style={{ filter: 'url(#goldGlow)' }}>
                      <polygon
                        points="2,200 24,191 24,209"
                        fill="url(#goldRing)"
                      />
                      <text
                        x="32"
                        y="200"
                        textAnchor="start"
                        dominantBaseline="central"
                        fill="#fde047"
                        style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif' }}
                      >
                        ASC
                      </text>
                    </g>

                    {/* Planet markers */}
                    {planets.filter(p => p.sign).map((planet) => {
                      const angle = getPlanetAngle(planet.sign, planet.degree);
                      const pos = getPosition(angle, 100);
                      const signData = zodiacSigns.find((s) => s.name === planet.sign);
                      const color = signData ? elementColors[signData.element] : "#fde047";

                      return (
                        <g key={planet.key} style={{ filter: 'url(#planetGlow)' }}>
                          {/* Planet background circle */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="15"
                            fill="rgba(15, 10, 30, 0.95)"
                            stroke={color}
                            strokeWidth="2"
                          />
                          {/* Planet glyph as SVG path */}
                          <g transform={`translate(${pos.x}, ${pos.y}) scale(0.85)`}>
                            <path
                              d={planetPaths[planet.key]}
                              fill="none"
                              stroke={color}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      );
                    })}

                    {/* Center star decoration */}
                    <circle cx="200" cy="200" r="25" fill="url(#centerGlow)" stroke="url(#purpleRing)" strokeWidth="1.5" />
                    <g transform="translate(200, 200) scale(0.8)" style={{ filter: 'url(#goldGlow)' }}>
                      {/* 8-pointed star */}
                      <path
                        d="M0,-10 L2,-3 L10,-3 L3,2 L5,10 L0,5 L-5,10 L-3,2 L-10,-3 L-2,-3 Z"
                        fill="url(#goldRing)"
                        style={{ opacity: 0.9 }}
                      />
                    </g>
                  </svg>
                </div>
              );
            })()}

              {/* Legend - centered */}
              <div className="flex flex-wrap justify-center gap-4 text-xs mb-3 mt-2">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #ff6b6b, #f97316)' }}></span><span className="t-text-muted">Fire</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}></span><span className="t-text-muted">Earth</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)' }}></span><span className="t-text-muted">Air</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}></span><span className="t-text-muted">Water</span></div>
              </div>

              <p className="text-center t-text-muted italic text-sm">
                {activeChart.rising.sign} Rising • Planets positioned by degree
              </p>

              {/* Chart ID */}
              {chartResult.chartId && (
                <p className="text-center t-text-muted text-xs mt-2">Chart ID: {chartResult.chartId}</p>
              )}
            </div>
            {/* Mobile Phone Mockup - takes 2/5 width, same height as chart */}
            <div className="md:col-span-2 flex items-center justify-center">
              <div className="relative w-[280px] h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] border-4 border-gray-700 shadow-2xl p-3">
                {/* Phone notch */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full z-10"></div>
                {/* Phone screen */}
                <div className="w-full h-full bg-gradient-to-b from-[#1a1b3a] to-[#0f0a1e] rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-[#D6B35A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-[#D6B35A]" />
                    </div>
                    <p className="text-white/60 text-sm">Mobile App</p>
                    <p className="text-white/40 text-xs mt-1">Coming Soon</p>
                  </div>
                </div>
                {/* Phone buttons */}
                <div className="absolute right-[-6px] top-24 w-1.5 h-8 bg-gray-700 rounded-l"></div>
                <div className="absolute right-[-6px] top-36 w-1.5 h-12 bg-gray-700 rounded-l"></div>
                <div className="absolute left-[-6px] top-28 w-1.5 h-16 bg-gray-700 rounded-r"></div>
              </div>
            </div>
          </div>

          {/* Big Three Summary - Matching PreviewPage Style */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="card-preview rounded-xl p-4 text-center">
              <Sun className="w-8 h-8 icon-gold mb-2 mx-auto" />
              <div className="text-xl font-bold mb-0.5">{activeChart.sun.sign} Sun</div>
              <div className="text-xs t-text-muted">Core Identity</div>
              <div className="text-xs t-text-muted mt-1">
                {activeChart.sun.degree}° {String(activeChart.sun.minutes || 0).padStart(2, '0')}' • House {activeChart.sun.house}
              </div>
            </div>

            <div className="card-preview rounded-xl p-4 text-center">
              <Moon className="w-8 h-8 text-[#69D2FF] mb-2 mx-auto" />
              <div className="text-xl font-bold mb-0.5">{activeChart.moon.sign} Moon</div>
              <div className="text-xs t-text-muted">Emotional Core</div>
              <div className="text-xs t-text-muted mt-1">
                {activeChart.moon.degree}° {String(activeChart.moon.minutes || 0).padStart(2, '0')}' • House {activeChart.moon.house}
              </div>
            </div>

            <div className="card-preview rounded-xl p-4 text-center">
              <Star className="w-8 h-8 icon-gold mb-2 mx-auto" />
              <div className="text-xl font-bold mb-0.5">{activeChart.rising.sign} Rising</div>
              <div className="text-xs t-text-muted">How Others See You</div>
              <div className="text-xs t-text-muted mt-1">{activeChart.rising.degree}° {String(activeChart.rising.minutes || 0).padStart(2, '0')}' Ascendant</div>
            </div>
          </div>

          {/* Planetary Placements - Tightened to match Big Three style */}
          <div className="card-solid rounded-2xl p-6">
            <h2 className="font-serif text-xl font-semibold mb-4 gold-gradient-text">Planetary Placements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Mercury", icon: null, glyph: "☿", color: "text-orange-400", data: activeChart.mercury, desc: "Communication" },
                { name: "Venus", icon: null, glyph: "♀", color: "text-green-400", data: activeChart.venus, desc: "Love & Beauty" },
                { name: "Mars", icon: null, glyph: "♂", color: "text-red-500", data: activeChart.mars, desc: "Drive & Action" },
                { name: "Jupiter", icon: null, glyph: "♃", color: "text-blue-400", data: activeChart.jupiter, desc: "Growth & Luck" },
                { name: "Saturn", icon: null, glyph: "♄", color: "text-slate-400", data: activeChart.saturn, desc: "Structure" },
                { name: "Uranus", icon: null, glyph: "♅", color: "text-cyan-400", data: activeChart.uranus, desc: "Innovation" },
                { name: "Neptune", icon: null, glyph: "♆", color: "text-indigo-400", data: activeChart.neptune, desc: "Dreams" },
                { name: "Pluto", icon: null, glyph: "♇", color: "text-rose-500", data: activeChart.pluto, desc: "Transformation" },
              ].map((planet) => (
                <div key={planet.name} className="bg-white/5 rounded-lg p-3 border border-white/5 text-center">
                  {planet.icon ? (
                    <planet.icon className={`w-5 h-5 ${planet.color} mb-1 mx-auto`} />
                  ) : (
                    <div className={`text-lg mb-0.5 ${planet.color}`}>{planet.glyph}</div>
                  )}
                  <div className={`font-semibold text-sm ${planet.color}`}>{planet.name}</div>
                  <p className="text-[#D6B35A] font-bold text-sm">{planet.data?.sign || "—"}</p>
                  <p className="t-text-muted text-xs">{planet.data?.degree ?? "—"}° {String(planet.data?.minutes || 0).padStart(2, '0')}'</p>
                  <p className="t-text-muted text-xs">{planet.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Full Analysis */}
          <div className="card-solid rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold gold-gradient-text">
                <Sparkles className="w-6 h-6 inline mr-2 icon-gold" />
                {isTabAccessible('natal') ? 'Your Personalized Reading' : 'Natal Chart Analysis Preview'}
              </h2>
              {isTabAccessible('natal') && purchasedProducts.bundle && (
                <span className="text-xs t-text-muted">
                  {purchasedProducts.bundle.charAt(0).toUpperCase() + purchasedProducts.bundle.slice(1)} Package
                </span>
              )}
              {!isTabAccessible('natal') && (
                <span className="flex items-center gap-1 text-xs text-[#D6B35A]">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>

            {!isTabAccessible('natal') ? (
              <div>
                <div className="relative">
                  <div className="text-white/80 leading-relaxed whitespace-pre-line">
                    {localStorage.getItem('natavium_natalTeaser') || 'Your personalized natal chart preview will appear here.'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#12142A]" />
                </div>
                <div className="text-center mt-6 pt-4 border-t border-white/10">
                  <Lock className="w-6 h-6 icon-gold mx-auto mb-2" />
                  <p className="t-text-muted text-sm mb-4">Purchase the Natal Chart Analysis to unlock your full personalized reading</p>
                  <button
                    onClick={() => navigate('/preview')}
                    className="gold-gradient-btn px-6 py-3 rounded-xl font-bold"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            ) : analysisLoading || generatingTab === 'natal' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-[#D6B35A] animate-spin mb-4" />
                <p className="t-text-muted">Generating your reading...</p>
              </div>
            ) : currentAnalysis?.content ? (
              <div className="prose prose-invert max-w-none">
                {/* Simple markdown-like rendering */}
                {currentAnalysis.content.split('\n').map((line, idx) => {
                  // H2 headers (## Chapter title)
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={idx} className="text-xl font-semibold text-[#D6B35A] mt-6 mb-3">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  // H3 headers (### Section title)
                  if (line.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-lg font-semibold text-white/90 mt-4 mb-2">
                        {line.replace('### ', '')}
                      </h4>
                    );
                  }
                  // H4 headers (#### Subsection title)
                  if (line.startsWith('#### ')) {
                    return (
                      <h5 key={idx} className="text-base font-medium t-text-muted mt-3 mb-1">
                        {line.replace('#### ', '')}
                      </h5>
                    );
                  }
                  // Bold text replacement and bullet points
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <p key={idx} className="text-white/80 ml-4 mb-1">
                        • {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    );
                  }
                  // Empty lines
                  if (line.trim() === '') {
                    return <div key={idx} className="h-2" />;
                  }
                  // Regular paragraphs
                  return (
                    <p key={idx} className="text-white/80 leading-relaxed mb-3">
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="t-text-muted mb-4">Your personalized AI reading hasn't been generated yet.</p>
                <button
                  onClick={() => generateAnalysisForTab('natal')}
                  className="gold-gradient-btn px-6 py-3 rounded-xl font-bold"
                >
                  Generate My Reading
                </button>
              </div>
            )}

            {currentAnalysis?.content && (
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <p className="t-text-muted text-xs">
                  Generated {currentAnalysis.generatedAt ? new Date(currentAnalysis.generatedAt).toLocaleDateString() : 'recently'}
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Other Tab Content - Reusable Analysis Display */}
        {activeTab !== 'natal' && activeTab !== 'compatibility' && (
          <div className="space-y-8">
            <div className="card-solid rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold gold-gradient-text">
                  <Sparkles className="w-6 h-6 inline mr-2 icon-gold" />
                  {DASHBOARD_TABS.find(t => t.id === activeTab)?.label} Analysis
                </h2>
              </div>

              {generatingTab === activeTab && !currentAnalysis?.content ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-[#D6B35A] animate-spin mb-4" />
                  <p className="t-text-muted">Generating your {DASHBOARD_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} analysis...</p>
                </div>
              ) : currentAnalysis?.content ? (
                <div>
                  {generatingTab === activeTab && (
                    <div className="flex items-center gap-3 t-text-muted mb-6">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating…
                    </div>
                  )}
                <div className="prose prose-invert max-w-none">
                  {currentAnalysis.content.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="text-xl font-semibold text-[#D6B35A] mt-6 mb-3">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="text-lg font-semibold text-white/90 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h5 key={idx} className="text-base font-medium t-text-muted mt-3 mb-1">{line.replace('#### ', '')}</h5>;
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <p key={idx} className="text-white/80 ml-4 mb-1">• {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                    }
                    if (line.trim() === '') return <div key={idx} className="h-2" />;
                    return <p key={idx} className="text-white/80 leading-relaxed mb-3">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                  })}
                </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="t-text-muted mb-4">Your {DASHBOARD_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} analysis hasn't been generated yet.</p>
                  <button
                    onClick={() => generateAnalysisForTab(activeTab)}
                    className="gold-gradient-btn px-6 py-3 rounded-xl font-bold"
                  >
                    Generate Analysis
                  </button>
                </div>
              )}

              {currentAnalysis?.content && !generatingTab && activeTab !== 'compatibility' && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <p className="t-text-muted text-xs">
                    Generated {currentAnalysis.generatedAt ? new Date(currentAnalysis.generatedAt).toLocaleDateString() : 'recently'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compatibility' && (
          <div className="space-y-8">
            <div className="card-solid rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold gold-gradient-text">
                  <Sparkles className="w-6 h-6 inline mr-2 icon-gold" />
                  Compatibility Analysis
                </h2>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-xs t-text-muted">
                    Runs left:{' '}
                    <span className="text-white/90 font-semibold">
                      {Number.isFinite(compatibilityRunsRemaining) ? compatibilityRunsRemaining : '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePurchaseCompatibilityRuns('1x')}
                    disabled={checkoutLoading}
                    className="text-xs font-semibold t-text-muted hover:text-white underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    +1 run
                  </button>
                  <button
                    onClick={() => handlePurchaseCompatibilityRuns('3x')}
                    disabled={checkoutLoading}
                    className="text-xs font-semibold t-text-muted hover:text-white underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    +3 runs
                  </button>
                  <button
                    onClick={() => handleGenerateCompatibility({ forceNew: true })}
                    disabled={
                      compatibilityGenerating ||
                      (Number.isFinite(compatibilityRunsRemaining) && compatibilityRunsRemaining <= 0)
                    }
                    className="px-3 py-2 rounded-lg bg-[#D6B35A]/10 border border-[#D6B35A]/30 hover:bg-[#D6B35A]/20 transition-colors text-xs font-semibold text-[#D6B35A] disabled:opacity-50"
                  >
                    New comparison
                  </button>
                </div>
              </div>

              {Array.isArray(compatibilityComparisons) && compatibilityComparisons.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                  <label className="block text-sm font-medium mb-2">View comparison</label>
                  <select
                    value={selectedCompatibilityComparisonId}
                    onChange={(e) => setSelectedCompatibilityComparisonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white focus:outline-none"
                  >
                    {compatibilityComparisons
                      .slice()
                      .reverse()
                      .map((c) => (
                        <option key={c?.id} value={c?.id}>
                          {(birthData?.subjectInitials || birthData?.subjectRelationship || c?.partnerBirthData?.subjectInitials || c?.partnerBirthData?.subjectRelationship)
                            ? `${(birthData?.subjectInitials || birthData?.subjectRelationship || 'A').toUpperCase()} × ${(c?.partnerBirthData?.subjectInitials || c?.partnerBirthData?.subjectRelationship || 'B').toUpperCase()}`
                            : (c?.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Comparison')}
                          {c?.createdAt ? ` • ${new Date(c.createdAt).toLocaleDateString()}` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {compatibilityError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-sm mb-4">
                  {compatibilityError}
                </div>
              )}

              {compatibilityFetching && !compatibilityReport?.analysis?.content && !compatibilityShowForm ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-[#D6B35A] animate-spin mb-4" />
                  <p className="t-text-muted">Loading compatibility…</p>
                </div>
              ) : compatibilityShowForm || !compatibilityReport?.analysis?.content ? (
                <div>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <p className="t-text-muted">
                      Enter the birth details of the other person to generate your compatibility report.
                    </p>
                    {compatibilityShowForm && (
                      <button
                        onClick={() => setCompatibilityShowForm(false)}
                        className="text-xs font-semibold t-text-muted hover:text-white underline-offset-4 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/15 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium mb-2">Who is this for?</label>
                      <select
                        value={compatPartnerBirthData.subjectRelationship}
                        onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, subjectRelationship: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white focus:outline-none"
                      >
                        <option value="partner">Partner</option>
                        <option value="friend">Friend</option>
                        <option value="client">Client</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="bg-white/15 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium mb-2">Relationship type</label>
                      <select
                        value={compatPartnerBirthData.relationshipType}
                        onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, relationshipType: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white focus:outline-none"
                      >
                        <option value="romantic">Romantic / dating</option>
                        <option value="friends">Friends</option>
                        <option value="family">Family</option>
                        <option value="coworker">Coworkers</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="bg-white/15 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium mb-2">Initials (2–3 letters)</label>
                      <input
                        value={compatPartnerBirthData.subjectInitials}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const cleaned = String(raw || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                          setCompatPartnerBirthData(prev => ({ ...prev, subjectInitials: cleaned }));
                        }}
                        placeholder="CD"
                        className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                      />
                    </div>

                    <div className="bg-white/15 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium mb-2">Birth date</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          value={compatPartnerBirthData.birthMonth}
                          onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, birthMonth: e.target.value }))}
                          placeholder="MM"
                          className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                        />
                        <input
                          value={compatPartnerBirthData.birthDay}
                          onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, birthDay: e.target.value }))}
                          placeholder="DD"
                          className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                        />
                        <input
                          value={compatPartnerBirthData.birthYear}
                          onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, birthYear: e.target.value }))}
                          placeholder="YYYY"
                          className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-white/15 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium mb-2">Birth time</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          value={compatPartnerBirthData.hour}
                          onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, hour: e.target.value }))}
                          placeholder="HH"
                          className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                        />
                        <input
                          value={compatPartnerBirthData.minute}
                          onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, minute: e.target.value }))}
                          placeholder="MM"
                          className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                        />
                        <select
                          value={compatPartnerBirthData.period}
                          onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, period: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white focus:outline-none"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Birth location</label>
                      <input
                        value={compatPartnerBirthData.location}
                        onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                        className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none"
                      />
                    </div>

                    <div className="bg-white/15 rounded-xl p-4 border border-white/10 md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Tone</label>
                      <select
                        value={compatPartnerBirthData.tone || 'classic'}
                        onChange={(e) => setCompatPartnerBirthData(prev => ({ ...prev, tone: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#12142A]/80 border border-white/10 text-white focus:outline-none"
                      >
                        <option value="classic">Classic</option>
                        <option value="coach">Coach</option>
                        <option value="witty">Witty</option>
                      </select>
                      <p className="text-xs t-text-muted mt-2">This changes the 'vibe' of your analysis</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => handleGenerateCompatibility({ forceNew: true })}
                      disabled={
                        compatibilityGenerating ||
                        (Number.isFinite(compatibilityRunsRemaining) && compatibilityRunsRemaining <= 0)
                      }
                      className="gold-gradient-btn px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {compatibilityGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Compatibility
                        </>
                      )}
                    </button>
                    {Number.isFinite(compatibilityRunsRemaining) && compatibilityRunsRemaining <= 0 && (
                      <div className="mt-3">
                        <p className="t-text-muted text-sm">
                          You’re out of comparisons for this order. Purchase more to generate another.
                        </p>
                      </div>
                    )}
                    <p className="t-text-muted text-xs mt-3">
                      We don’t require names. Your input is used only to compute the charts.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {compatibilityGenerating && (
                    <div className="flex items-center gap-3 t-text-muted mb-6">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating…
                    </div>
                  )}
                <div className="prose prose-invert max-w-none">
                  {compatibilityReport.analysis.content.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return (
                        <h3 key={idx} className="text-xl font-semibold text-[#D6B35A] mt-6 mb-3">
                          {line.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="text-lg font-semibold text-white/90 mt-4 mb-2">
                          {line.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (line.startsWith('#### ')) {
                      return (
                        <h5 key={idx} className="text-base font-medium t-text-muted mt-3 mb-1">
                          {line.replace('#### ', '')}
                        </h5>
                      );
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <p key={idx} className="text-white/80 ml-4 mb-1">
                          • {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
                        </p>
                      );
                    }
                    if (line.trim() === '') return <div key={idx} className="h-2" />;
                    return (
                      <p key={idx} className="text-white/80 leading-relaxed mb-3">
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                    );
                  })}
                </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="card-solid rounded-2xl p-8 mt-8">
          <h3 className="font-serif text-2xl font-semibold mb-6 text-center gold-gradient-text">Explore More</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {DASHBOARD_TABS.filter(tab => tab.id !== 'natal' && !isTabAccessible(tab.id) && !tab.comingSoon).slice(0, 3).map(tab => {
              const TabIcon = tab.icon;
              return (
                <div key={tab.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TabIcon className="w-5 h-5 text-[#D6B35A]" />
                    <h4 className="text-xl font-semibold">{tab.label}</h4>
                  </div>
                  <p className="t-text-muted text-sm mb-4">{tab.description?.slice(0, 60)}...</p>
                  <button
                    onClick={() => {
                      setSelectedAddOns([tab.id]);
                      setUpsellTab(tab);
                    }}
                    className="w-full bg-[#D6B35A]/10 border border-[#D6B35A]/30 px-4 py-2 rounded-lg hover:bg-[#D6B35A]/20 transition-colors text-sm font-semibold text-[#D6B35A]"
                  >
                    Unlock - ${tab.priceIfLocked?.toFixed(2)}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl bg-[#12142A]/80 border border-white/10 hover:bg-[#12142A] hover:border-white/20 transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("natavium_birthData");
                localStorage.removeItem("natavium_chartResult");
                localStorage.removeItem("natavium_isPremium");
                localStorage.removeItem("natavium_analyses");
                localStorage.removeItem("natavium_analysis");
                localStorage.removeItem("natavium_purchasedProducts");
                navigate("/input");
              }}
              className="px-6 py-3 rounded-xl bg-[#69D2FF]/10 border border-[#69D2FF]/30 hover:bg-[#69D2FF]/20 transition-colors text-[#69D2FF]"
            >
              Calculate New Chart
            </button>
          </div>

          {/* Social Media & Copyright */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-center mb-4">
              <SocialLinks iconClassName="w-4 h-4" />
            </div>
            <p className="text-center text-sm t-text-muted">
              © {new Date().getFullYear()} Natavium. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// Main App Component
// =========================
// =========================
// Impressum (Legal Notice) - German Law Compliance
// =========================
function ImpressumPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-[#12142A] hover:border-white/20 transition-all flex items-center t-text-muted hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Zurück
        </button>

        <div className="card-solid rounded-2xl p-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold gold-gradient-text mb-8">Impressum</h1>

          <div className="space-y-6 t-text-muted">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Angaben gemäß § 5 TMG</h2>
              <p>xxxx (Vor- und Nachname / Firmenname)</p>
              <p>xxxx (Straße und Hausnummer)</p>
              <p>xxxx (PLZ und Ort)</p>
              <p>xxxx (Land)</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Kontakt</h2>
              <p>Telefon: xxxx</p>
              <p>E-Mail: xxxx</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Umsatzsteuer-ID</h2>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
              <p>xxxx</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p>xxxx (Name)</p>
              <p>xxxx (Anschrift)</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#D6B35A] hover:text-[#E5C878] hover:underline transition-colors">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="mt-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// Datenschutzerklärung (Privacy Policy) - GDPR Compliance
// =========================
function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-[#12142A] hover:border-white/20 transition-all flex items-center t-text-muted hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Zurück
        </button>

        <div className="card-solid rounded-2xl p-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold gold-gradient-text mb-8">Datenschutzerklärung</h1>

          <div className="space-y-6 t-text-muted">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-lg font-medium text-white/90 mt-4 mb-2">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
                Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
                denen Sie persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Verantwortliche Stelle</h2>
              <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
              <p className="mt-2">xxxx (Name)</p>
              <p>xxxx (Straße und Hausnummer)</p>
              <p>xxxx (PLZ und Ort)</p>
              <p>Telefon: xxxx</p>
              <p>E-Mail: xxxx</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Datenerfassung auf dieser Website</h2>

              <h3 className="text-lg font-medium text-white/90 mt-4 mb-2">Welche Daten werden erfasst?</h3>
              <p>
                Wir erheben und verarbeiten folgende personenbezogene Daten, die Sie uns freiwillig zur
                Verfügung stellen:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Geburtsdatum und -uhrzeit (für die Horoskop-Berechnung)</li>
                <li>Geburtsort (für die Horoskop-Berechnung)</li>
                <li>E-Mail-Adresse (für die Zustellung Ihres Horoskops)</li>
                <li>Zahlungsinformationen (werden durch unseren Zahlungsdienstleister verarbeitet)</li>
              </ul>

              <h3 className="text-lg font-medium text-white/90 mt-4 mb-2">Zweck der Datenverarbeitung</h3>
              <p>
                Ihre Daten werden ausschließlich zur Erstellung und Lieferung Ihres personalisierten
                Horoskops sowie zur Abwicklung der Zahlung verwendet.
              </p>

              <h3 className="text-lg font-medium text-white/90 mt-4 mb-2">Rechtsgrundlage</h3>
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Speicherdauer</h2>
              <p>
                Ihre Daten werden nur so lange gespeichert, wie es für die Erfüllung des Vertragszwecks
                erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Ihre Rechte</h2>
              <p>Sie haben jederzeit das Recht:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Auskunft über Ihre gespeicherten Daten zu erhalten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
                <li>Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO)</li>
                <li>Ihre Einwilligung jederzeit zu widerrufen (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Zahlungsdienstleister</h2>
              <p>
                Für die Abwicklung von Zahlungen nutzen wir den Dienst Stripe. Stripe verarbeitet Ihre
                Zahlungsdaten gemäß deren eigener Datenschutzerklärung:{" "}
                <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-[#D6B35A] hover:text-[#E5C878] hover:underline transition-colors">
                  https://stripe.com/de/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">7. Hosting</h2>
              <p>
                Diese Website wird bei xxxx (Hosting-Anbieter) gehostet. Der Hoster erhebt in sog.
                Logfiles folgende Daten, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit der
                Anfrage, Zeitzonendifferenz zur Greenwich Mean Time, Inhalt der Anforderung, HTTP-Statuscode,
                übertragene Datenmenge, Website, von der die Anforderung kommt, und Informationen zu Browser
                und Betriebssystem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">8. Cookies</h2>
              <p>
                Diese Website verwendet technisch notwendige Cookies, um die Funktionsfähigkeit der
                Website zu gewährleisten. Diese Cookies werden nur für die Dauer Ihrer Sitzung gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">9. Beschwerderecht</h2>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
                Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Natavium() {
  // Theme state - persist to localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("natavium_theme");
    return saved || 'theme-daylight'; // default to daylight theme
  });

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("natavium_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'theme-original') return 'theme-v2';
      if (prev === 'theme-v2') return 'theme-daylight';
      return 'theme-original';
    });
  };

  // Load initial state from localStorage
  const [birthData, setBirthData] = useState(() => {
    const saved = localStorage.getItem("natavium_birthData");
    return saved ? JSON.parse(saved) : {
      date: "",
      subjectRelationship: "self",
      subjectInitials: "",
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      time: "",
      hour: "",
      minute: "",
      period: "AM",
      location: "",
      focus: "standard",
      tone: "classic",
    };
  });
  const [calcError, setCalcError] = useState(null);
  const [chartResult, setChartResult] = useState(() => {
    const saved = localStorage.getItem("natavium_chartResult");
    return saved ? JSON.parse(saved) : null;
  });
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem("natavium_isPremium") === "true";
  });
  const [selectedBundle, setSelectedBundle] = useState(null); // no bundle selected by default - services are primary
  const [selectedZodiacSystem, setSelectedZodiacSystem] = useState(() => {
    return localStorage.getItem("natavium_zodiacSystem") || "tropical";
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("natavium_birthData", JSON.stringify(birthData));
  }, [birthData]);

  useEffect(() => {
    if (chartResult) {
      localStorage.setItem("natavium_chartResult", JSON.stringify(chartResult));
    }
  }, [chartResult]);

  useEffect(() => {
    localStorage.setItem("natavium_isPremium", isPremium.toString());
  }, [isPremium]);

  useEffect(() => {
    localStorage.setItem("natavium_zodiacSystem", selectedZodiacSystem);
  }, [selectedZodiacSystem]);

  const handleInputChange = (field, value) => {
    setBirthData((prev) => {
      let nextValue = value;
      if (field === 'subjectInitials') {
        nextValue = String(value || '')
          .toUpperCase()
          .replace(/[^A-Z]/g, '')
          .slice(0, 3);
      }

      const updated = { ...prev, [field]: nextValue };
      // Update the combined time string when hour/minute/period changes
      if (field === "hour" || field === "minute" || field === "period") {
        const h = field === "hour" ? value : prev.hour;
        const m = field === "minute" ? value : prev.minute;
        const p = field === "period" ? value : prev.period;
        if (h && m) {
          updated.time = `${h}:${String(m).padStart(2, "0")} ${p}`;
        }
      }
      // Update the combined date string when month/day/year changes
      if (field === "birthMonth" || field === "birthDay" || field === "birthYear") {
        const month = field === "birthMonth" ? value : prev.birthMonth;
        const day = field === "birthDay" ? value : prev.birthDay;
        const year = field === "birthYear" ? value : prev.birthYear;
        if (month && day && year) {
          updated.date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }
      return updated;
    });
  };

  // Convert 12-hour time to 24-hour decimal format for Swiss Ephemeris
  const getTime24Hour = () => {
    const hour = parseInt(birthData.hour, 10);
    const minute = parseInt(birthData.minute, 10);
    const period = birthData.period;

    if (isNaN(hour) || isNaN(minute)) return null;

    let hour24 = hour;
    if (period === "AM") {
      hour24 = hour === 12 ? 0 : hour; // 12 AM = 0, 1-11 AM = 1-11
    } else {
      hour24 = hour === 12 ? 12 : hour + 12; // 12 PM = 12, 1-11 PM = 13-23
    }

    return {
      hour24,
      minute,
    };
  };

  const calculateChart = async (navigate, zodiac = 'tropical') => {
    navigate("/calculating");
    setCalcError(null);

    try {
      // Parse birth date from individual fields
      const year = parseInt(birthData.birthYear, 10);
      const month = parseInt(birthData.birthMonth, 10);
      const day = parseInt(birthData.birthDay, 10);

      // Get time in 24-hour format
      const timeData = getTime24Hour();
      if (!timeData) {
        throw new Error("Invalid time");
      }

      // Calculate chart using the simplified API (handles geocoding + timezone)
      // This now returns { tropical, sidereal, meta } format
      const chart = await calculateNatalChartFromLocal({
        year,
        month,
        day,
        hour: timeData.hour24,
        minute: timeData.minute,
        locationString: birthData.location,
      });

      // Generate unique chart ID
      const chartId = `NAT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      console.log("Chart result (dual format):", chart);
      console.log("Chart ID:", chartId);
      console.log("Selected zodiac system:", zodiac);

      // Update the selected zodiac system state
      setSelectedZodiacSystem(zodiac);

      // Store chart with chartId and selected zodiac type
      // chart already has { tropical, sidereal, meta } structure
      setChartResult({ ...chart, chartId, zodiacType: zodiac });
      navigate("/preview", { replace: true });
    } catch (error) {
      console.error("Chart calculation error:", error);
      setCalcError(error.message);
      navigate("/input", { replace: true });
    }
  };

  const handlePayment = (navigate) => {
    setIsPremium(true);
    navigate("/chart", { replace: true });
  };

  // =========================
  // Routes
  // =========================
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={theme}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ongoing" element={<OngoingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/input" element={
            <InputPage
              birthData={birthData}
              handleInputChange={handleInputChange}
              calculateChart={calculateChart}
              calcError={calcError}
            />
          } />
          <Route path="/calculating" element={<CalculatingPage />} />
          <Route path="/preview" element={
            <PreviewPage
              chartResult={chartResult}
              birthData={birthData}
              selectedBundle={selectedBundle}
              setSelectedBundle={setSelectedBundle}
            />
          } />
          <Route path="/payment" element={
            <PaymentPage
              handlePayment={handlePayment}
              selectedBundle={selectedBundle}
            />
          } />
          <Route path="/success" element={
            <SuccessPage
              setIsPremium={setIsPremium}
              chartResult={chartResult}
              selectedBundle={selectedBundle}
            />
          } />
          <Route path="/chart" element={
            <ChartPage
              chartResult={chartResult}
              birthData={birthData}
              isPremium={isPremium}
              selectedBundle={selectedBundle}
            />
          } />
          <Route path="/info/:page" element={<InfoPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/learn/:topic" element={<LearnMorePage />} />
          <Route path="/learn" element={<LearnMorePage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  );
}
