import React, { useState, useEffect, createContext, useContext } from "react";
import html2canvas from 'html2canvas';
import { Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import { calculateNatalChartFromLocal } from "./ephemeris";
import BrandStar from "./components/BrandStar";
import LogoRed from "./LogoRed.png";
import {
  Sparkles,
  Lock,
  Download,
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
// Bundle Definitions
// =========================
const BUNDLES = {
  base: {
    id: "base",
    name: "Base",
    price: 4.99,
    description: "Core natal chart analysis",
    icon: Star,
    color: "yellow",
    features: [
      { text: "Complete birth chart wheel", included: true },
      { text: "Big Three analysis (Sun, Moon, Rising)", included: true },
      { text: "All 10 planetary placements", included: true },
      { text: "House positions explained", included: true },
      { text: "PDF + Email Delivery", included: true },
      { text: "2026 transit forecast", included: false },
      { text: "AI-generated reading", included: false },
    ],
  },
  essential: {
    id: "essential",
    name: "Essential",
    price: 9.99,
    description: "Full analysis + yearly forecast",
    icon: Gift,
    color: "purple",
    popular: true,
    features: [
      { text: "Everything in Base", included: true },
      { text: "3000+ word AI-generated reading", included: true },
      { text: "2026 transit forecast", included: true },
      { text: "Key life themes & patterns", included: true },
      { text: "Strengths & challenges breakdown", included: true },
      { text: "PDF + Email Delivery", included: true },
    ],
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    price: 12.99,
    description: "Everything + compatibility & transits",
    icon: Crown,
    color: "pink",
    features: [
      { text: "Everything in Essential", included: true },
      { text: "1 free compatibility reading ($3.99 value)", included: true },
      { text: "Monthly transit updates for 3 months", included: true },
      { text: "Vedic chart comparison", included: true },
      { text: "Priority support", included: true },
      { text: "PDF + Email Delivery", included: true },
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
    alwaysActive: true,
    requiresPurchase: false,
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
    comingSoon: true,
    description: 'Compare your chart with a partner or friend to discover harmony and growth areas.',
  },
];

// =========================
// Helper Functions
// =========================
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
// Info / Documentation Pages
// =========================
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

  return (
    <div className="min-h-screen px-6 py-6">
      {/* Header with Logo/Title on left, Nav on right */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src={LogoRed} alt="Natavium Logo" className="w-11 h-11 mr-3 object-contain" />
          <h1 className="font-serif text-5xl md:text-6xl font-semibold gold-gradient-text leading-none pt-3">Natavium</h1>
        </div>  
        <nav className="flex gap-4">
          <button
            onClick={() => navigate("/info/systems")}
            className="t-btn-secondary text-sm"
          >
            <BookOpen className="w-4 h-4 mr-2 icon-gold" strokeWidth={1} />
            Learn More
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-vignette max-w-5xl mx-auto text-center pt-8 pb-6 md:pt-14 md:pb-10 px-4">
        {/* Big hero headline (dominates page) */}
          <h2 className="font-serif text-5xl md:text-7xl font-semibold t-text-primary leading-tight tracking-tight mb-6 text-center">
            Clarity for your next move
          </h2>

        {/* Tagline (slightly smaller, still prominent) */}
          <p className="text-xl md:text-2xl t-text-muted mb-4 text-center">
            AI-powered astrology from your full birth chart.
          </p>

        {/* Supporting line (smaller + softer so it doesn't compete) */}
          <p className="text-base md:text-lg t-text-muted mb-8 text-center">
            Timing for career, relationships, and personal growth—based on what's happening now.
          </p>

  <button
    onClick={() => navigate("/input")}
    className="gold-gradient-btn gold-gradient-btn-lg"
  >
    Discover Your Chart
  </button>

  <p className="t-text-muted mt-8 text-sm tracking-wide">
    Free preview • Full analysis from $4.99
  </p>
</section>

      {/* Sample Preview (hidden for now) */}
      <div className="hidden mt-12 mb-14">
        <div className="card-solid max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: text */}
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs tracking-wide"
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text)"
                      }}>
                  Sample Preview
                </span>
                <span className="text-sm t-text-muted">
                  The next 5 days &bull; Personalized to you
                </span>
              </div>

              <h3 className="font-serif text-2xl md:text-3xl font-semibold t-text-primary mb-3">
                Your timing at a glance
              </h3>

              <p className="t-text-muted text-base md:text-lg leading-relaxed mb-5 max-w-2xl">
                A short, clear preview of what&rsquo;s active right now in your chart&mdash;where momentum is building,
                what to prioritize, and what to handle gently.
              </p>

              {/* Key transit chips */}
              <div className="flex flex-wrap gap-2">
                {["Key themes", "Pressure points", "Momentum windows", "Communication", "Rest & reset"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                    style={{
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.02)",
                      color: "rgba(242,243,255,0.80)"
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: mini signal + CTA */}
            <div className="shrink-0 md:w-64">
              <div
                className="rounded-xl p-4"
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.02)"
                }}
              >
                <div className="text-xs tracking-wide t-text-muted mb-2">
                  Today&rsquo;s signal
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="font-serif text-xl t-text-primary">Steady</div>
                  <div className="text-sm" style={{ color: "rgba(214,179,90,0.95)" }}>
                    &#9679;&#9679;&#9679;&#9675;&#9675;
                  </div>
                </div>

                <p className="text-sm t-text-muted leading-relaxed mb-4">
                  Good for planning, clarifying, and small wins. Avoid forcing outcomes.
                </p>

                <button
                  onClick={() => navigate("/input")}
                  className="gold-gradient-btn w-full"
                >
                  Get My Preview &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    {/* Feature Cards */}
      <section className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mt-2 mb-12">
        <div className="card-solid text-center py-8 px-6">
          <Star className="w-8 h-8 icon-gold mx-auto mb-4" strokeWidth={1} />
          <h3 className="font-serif text-2xl md:text-[1.65rem] mb-2 t-text-primary">Personalized Birth Chart</h3>
          <p className="t-text-muted text-sm leading-relaxed">
            Built from exact planetary positions at your birth—so it’s about you, not just your Sun sign.
          </p>
        </div>

        <div className="card-solid text-center py-8 px-6">
          <Zap className="w-8 h-8 icon-gold mx-auto mb-4" strokeWidth={1} />
          <h3 className="font-serif text-2xl md:text-[1.65rem] mb-2 t-text-primary">Powerful AI</h3>
          <p className="t-text-muted text-sm leading-relaxed">
            The latest AI models analyse your planetary placements + transits into a coherent story. No templates.
          </p>
        </div>

        <div className="card-solid text-center py-8 px-6">
          <Heart className="w-8 h-8 icon-gold mx-auto mb-4" strokeWidth={1} />
          <h3 className="font-serif text-2xl md:text-[1.65rem] mb-2 t-text-primary">One-Time Unlocks</h3>
          <p className="t-text-muted text-sm leading-relaxed">
            Subscriptions are not required. Pay for exactly what you want. 
          </p>
        </div>
      </section>

      {/* Comparison - Premium Table Style */}
      <section className="max-w-3xl mx-auto mb-12">
        <h2 className="font-serif text-3xl text-center mb-8 t-text-primary">Why Natavium?</h2>
        <div className="comparison-table">
          <div className="comparison-row comparison-header">
            <div className="comparison-cell"></div>
            <div className="comparison-cell text-center t-text-muted">Other Apps</div>
            <div className="comparison-cell text-center gold-gradient-text font-semibold">Natavium</div>
          </div>
          <div className="comparison-row">
            <div className="comparison-cell t-text-muted">Pricing</div>
            <div className="comparison-cell text-center t-text-muted">$7-15/month</div>
            <div className="comparison-cell text-center t-text-primary font-medium">$4.99 once</div>
          </div>
          <div className="comparison-row">
            <div className="comparison-cell t-text-muted">Analysis</div>
            <div className="comparison-cell text-center t-text-muted">Templates</div>
            <div className="comparison-cell text-center t-text-primary font-medium">Real AI synthesis</div>
          </div>
          <div className="comparison-row">
            <div className="comparison-cell t-text-muted">Personalization</div>
            <div className="comparison-cell text-center t-text-muted">Generic horoscopes</div>
            <div className="comparison-cell text-center t-text-primary font-medium">Your exact chart</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto pt-8 pb-4 text-center border-t border-white/10">
        <div className="flex justify-center gap-8 mb-4">
          <button onClick={() => navigate("/impressum")} className="text-sm t-text-muted hover:text-[#D6B35A] transition-colors">
            Impressum
          </button>
          <button onClick={() => navigate("/datenschutz")} className="text-sm t-text-muted hover:text-[#D6B35A] transition-colors">
            Datenschutz
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <SocialLinks iconClassName="w-4 h-4" />
        </div>
        <p className="t-text-subtle text-xs tracking-wide">
          © {new Date().getFullYear()} Natavium. Alle Rechte vorbehalten.
        </p>
      </footer>
    </div>
  );
}

// =========================
// Input Form
// =========================
function InputPage({ birthData, handleInputChange, calculateChart, calcError }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold gold-gradient-text mb-3">Enter Your Birth Details</h2>
          <p className="text-base t-text-muted">Exact time and location create your unique chart</p>
        </div>

        <div className="card-solid rounded-2xl p-8">
          <div className="mb-6">
            <label className="flex items-center text-base font-semibold mb-3 t-text-primary">
              <Calendar className="w-5 h-5 mr-2 icon-gold" />
              Birth Date
            </label>
            <div className="flex gap-3">
              <select
                value={birthData.birthMonth}
                onChange={(e) => handleInputChange("birthMonth", e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#12142A] border border-white/10 text-white focus:outline-none focus:border-[#69D2FF] focus:ring-1 focus:ring-[#69D2FF]/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#12142A]">Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, i) => (
                  <option key={month} value={String(i + 1)} className="bg-[#12142A]">
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={birthData.birthDay}
                onChange={(e) => handleInputChange("birthDay", e.target.value)}
                className="w-24 px-4 py-3 rounded-lg bg-[#12142A] border border-white/10 text-white focus:outline-none focus:border-[#69D2FF] focus:ring-1 focus:ring-[#69D2FF]/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#12142A]">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)} className="bg-[#12142A]">
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                value={birthData.birthYear}
                onChange={(e) => handleInputChange("birthYear", e.target.value)}
                className="w-28 px-4 py-3 rounded-lg bg-[#12142A] border border-white/10 text-white focus:outline-none focus:border-[#69D2FF] focus:ring-1 focus:ring-[#69D2FF]/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#12142A]">Year</option>
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={String(year)} className="bg-[#12142A]">
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center text-base font-semibold mb-3 t-text-primary">
              <Clock className="w-5 h-5 mr-2 icon-gold" />
              Birth Time
            </label>
            <div className="flex gap-3">
              <select
                value={birthData.hour}
                onChange={(e) => handleInputChange("hour", e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#12142A] border border-white/10 text-white focus:outline-none focus:border-[#69D2FF] focus:ring-1 focus:ring-[#69D2FF]/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#12142A]">Hour</option>
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h} className="bg-[#12142A]">
                    {h}
                  </option>
                ))}
              </select>
              <select
                value={birthData.minute}
                onChange={(e) => handleInputChange("minute", e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#12142A] border border-white/10 text-white focus:outline-none focus:border-[#69D2FF] focus:ring-1 focus:ring-[#69D2FF]/30 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#12142A]">Min</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i} className="bg-[#12142A]">
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() => handleInputChange("period", "AM")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    birthData.period === "AM"
                      ? "bg-[#D6B35A] text-[#070812]"
                      : "bg-[#12142A] text-white hover:bg-[#171A35]"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("period", "PM")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    birthData.period === "PM"
                      ? "bg-[#D6B35A] text-[#070812]"
                      : "bg-[#12142A] text-white hover:bg-[#171A35]"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
            <p className="text-xs t-text-muted mt-2">Check birth certificate for exact time</p>
          </div>

          <div className="mb-8">
            <label className="flex items-center text-base font-semibold mb-3 t-text-primary">
              <MapPin className="w-5 h-5 mr-2 icon-gold" />
              Birth Location
            </label>
            <input
              type="text"
              value={birthData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Welland, Ontario"
              className="w-full px-4 py-3 rounded-lg bg-[#12142A] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#69D2FF] focus:ring-1 focus:ring-[#69D2FF]/30"
            />
            <p className="text-xs t-text-muted mt-2">City name auto-detected • Timezone calculated automatically</p>

            {/* Quick city presets */}
            <div className="mt-3">
              <p className="text-xs t-text-muted mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {["New York", "Los Angeles", "Chicago", "London", "Toronto", "Sydney"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleInputChange("location", city)}
                    className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {calcError && (
            <div className="bg-red-500/15 border border-red-500/40 rounded-lg p-4 mb-6 text-sm text-red-300">
              ⚠️ Error: {calcError}
            </div>
          )}

          <div className="bg-[#69D2FF]/10 border border-[#69D2FF]/20 rounded-lg p-4 mb-6 text-sm text-[#69D2FF]">
            🔒 Your data is private and secure
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => calculateChart(navigate, 'tropical')}
              disabled={!birthData.birthMonth || !birthData.birthDay || !birthData.birthYear || !birthData.hour || !birthData.minute || !birthData.location}
              className="flex-1 gold-gradient-btn rounded-xl py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Calculate Tropical Chart
            </button>

            <button
              onClick={() => calculateChart(navigate, 'sidereal')}
              disabled={!birthData.birthMonth || !birthData.birthDay || !birthData.birthYear || !birthData.hour || !birthData.minute || !birthData.location}
              className="flex-1 gold-gradient-btn rounded-xl py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Calculate Sidereal Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// Calculating
// =========================
function CalculatingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-yellow-400 mx-auto" />
          <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-yellow-300 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Calculating Your Cosmic Blueprint...</h2>
        <div className="space-y-2 text-purple-300">
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
// Add-on services definition
const ADD_ONS = [
  { id: "compatibility", name: "Compatibility", price: 3.99, description: "Compare charts with a partner" },
  { id: "house_deep_dive", name: "House Deep Dive", price: 2.99, description: "Detailed house analysis" },
  { id: "solar_return", name: "Solar Return", price: 4.99, description: "Your year ahead forecast" },
  { id: "transit_report", name: "Transit Report", price: 1.99, description: "Current planetary influences" },
];

function PreviewPage({ chartResult, birthData, selectedBundle, setSelectedBundle }) {
  const [showTooltip, setShowTooltip] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [teaser, setTeaser] = useState(null);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [teaserError, setTeaserError] = useState(null);

  // Get the active chart based on selected zodiac system
  // Supports both old flat format and new { tropical, sidereal, meta } format
  const zodiacType = chartResult?.zodiacType || 'tropical';
  const activeChart = chartResult?.tropical ? chartResult[zodiacType] : chartResult;
  const zodiacLabel = zodiacType === 'sidereal' ? 'Sidereal' : 'Tropical';

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

  if (!chartResult) {
    return <Navigate to="/input" replace />;
  }

  const displayDate = formatBirthDate(birthData.birthMonth, birthData.birthDay, birthData.birthYear);
  const currentBundle = BUNDLES[selectedBundle];

  // Calculate total price including add-ons
  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addOn = ADD_ONS.find(a => a.id === id);
    return sum + (addOn ? addOn.price : 0);
  }, 0);
  const totalPrice = currentBundle.price + addOnsTotal;

  // Toggle add-on selection
  const toggleAddOn = (addOnId) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  return (
    <div className="min-h-screen text-white p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold gold-gradient-text mb-2">Your Natal Chart</h1>
          <p className="text-lg t-text-muted">
            {displayDate} • {birthData.time} • {birthData.location}
          </p>
        </div>

        {/* Sun Sign Heading */}
        <div className="text-center mb-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold gold-gradient-text flex items-center justify-center gap-2">
            <BrandStar className="w-8 h-8 icon-gold" /> You're a {activeChart.sun.sign}! <BrandStar className="w-8 h-8 icon-gold" />
          </h2>
          <p className="text-sm t-text-muted mt-1">({zodiacLabel} Zodiac)</p>
        </div>

        {/* Premium Chart Wheel */}
        <div className="card-solid rounded-2xl p-8 mb-8">
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
                <p className="font-serif text-2xl font-semibold gold-gradient-text italic">
                  "{archetype}"
                </p>
                <p className="text-xs t-text-muted mt-2">
                  {sunSign} Sun • {moonSign} Moon • {risingSign} Rising
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

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs mb-3 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #ff6b6b, #f97316)' }}></span><span className="t-text-muted">Fire</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}></span><span className="t-text-muted">Earth</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)' }}></span><span className="t-text-muted">Air</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}></span><span className="t-text-muted">Water</span></div>
          </div>

          <p className="text-center t-text-muted italic text-sm">
            {activeChart.rising.sign} Rising • Planets positioned by degree
          </p>
        </div>

        {/* Big Three */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card-solid rounded-2xl p-6 text-center">
            <Sun className="w-10 h-10 icon-gold mb-3 mx-auto" />
            <div className="text-2xl font-bold mb-1">{activeChart.sun.sign} Sun</div>
            <div className="text-sm t-text-muted">Core Identity</div>
            <div className="text-xs t-text-muted mt-2">
              {activeChart.sun.degree}° {String(activeChart.sun.minutes || 0).padStart(2, '0')}' in {activeChart.sun.house}
              {houseSuffix(activeChart.sun.house)} house
            </div>
          </div>

          <div className="card-solid rounded-2xl p-6 text-center">
            <Moon className="w-10 h-10 text-[#69D2FF] mb-3 mx-auto" />
            <div className="text-2xl font-bold mb-1">{activeChart.moon.sign} Moon</div>
            <div className="text-sm t-text-muted">Emotional Core</div>
            <div className="text-xs t-text-muted mt-2">
              {activeChart.moon.degree}° {String(activeChart.moon.minutes || 0).padStart(2, '0')}' in {activeChart.moon.house}
              {houseSuffix(activeChart.moon.house)} house
            </div>
          </div>

          <div className="card-solid rounded-2xl p-6 text-center">
            <Star className="w-10 h-10 icon-gold mb-3 mx-auto" />
            <div className="text-2xl font-bold mb-1">{activeChart.rising.sign} Rising</div>
            <div className="text-sm t-text-muted">How Others See You</div>
            <div className="text-xs t-text-muted mt-2">{activeChart.rising.degree}° {String(activeChart.rising.minutes || 0).padStart(2, '0')}' Ascendant</div>
          </div>
        </div>

        {/* AI-Generated Teaser with paywall */}
        <div className="card-solid rounded-2xl p-8 mb-8">
          <h2 className="font-serif text-3xl font-semibold gold-gradient-text mb-6">Your Cosmic Blueprint</h2>

          {teaserLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-10 h-10 icon-gold animate-spin mb-4" />
              <p className="t-text-muted">Analyzing your unique cosmic signature...</p>
            </div>
          ) : teaserError ? (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                Your {activeChart.sun.sign} Sun combined with {activeChart.moon.sign} Moon and {activeChart.rising.sign} Rising
                creates a unique cosmic blueprint that shapes your personality, emotions, and how others perceive you.
              </p>
              <p className="t-text-muted text-sm">Full AI analysis available in paid packages below.</p>
            </div>
          ) : teaser ? (
            <div className="space-y-4">
              {teaser.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-lg leading-relaxed text-white/90">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          <div className="relative mt-6">
            {/* Blurred premium preview */}
            <div className="blur-sm select-none opacity-50">
              <h3 className="text-xl font-bold mb-2">
                Mercury in {activeChart.mercury.sign}
              </h3>
              <p className="text-sm">Your communication style reveals hidden patterns...</p>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#12142A] pointer-events-none" />
          </div>

          <div className="text-center mt-4">
            <Lock className="w-8 h-8 icon-gold mx-auto mb-2" />
            <p className="t-text-muted text-sm">Select a package below to unlock your full reading</p>
          </div>
        </div>

        {/* Bundle Selection */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold gold-gradient-text text-center mb-6">Choose Your Package</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.values(BUNDLES).map((bundle) => {
              const IconComponent = bundle.icon;
              const isSelected = selectedBundle === bundle.id;
              const colorClasses = {
                yellow: {
                  border: isSelected ? "border-[#D6B35A]" : "border-white/10",
                  bg: isSelected ? "bg-[#D6B35A]/15" : "bg-[#12142A]/80",
                  icon: "icon-gold",
                  price: "gold-gradient-text",
                },
                purple: {
                  border: isSelected ? "border-[#69D2FF]" : "border-white/10",
                  bg: isSelected ? "bg-[#69D2FF]/15" : "bg-[#12142A]/80",
                  icon: "text-[#69D2FF]",
                  price: "text-[#69D2FF]",
                },
                pink: {
                  border: isSelected ? "border-[#D6B35A]" : "border-white/10",
                  bg: isSelected ? "bg-[#D6B35A]/10" : "bg-[#12142A]/80",
                  icon: "icon-gold",
                  price: "gold-gradient-text",
                },
              };
              const colors = colorClasses[bundle.color];

              return (
                <button
                  key={bundle.id}
                  onClick={() => {
                    setSelectedBundle(bundle.id);
                    // Clear add-ons when switching to non-base package
                    if (bundle.id !== "base") {
                      setSelectedAddOns([]);
                    }
                  }}
                  className={`relative p-6 rounded-2xl border transition-all text-left backdrop-blur-sm ${colors.border} ${colors.bg} ${
                    isSelected ? "scale-105 shadow-lg" : "hover:bg-white/10"
                  }`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 gold-gradient-btn text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className={`w-8 h-8 ${colors.icon}`} />
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTooltip(showTooltip === bundle.id ? null : bundle.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Info className="w-5 h-5 t-text-muted animate-info-pulse" />
                      </button>

                      {showTooltip === bundle.id && (
                        <div className="absolute right-0 top-8 w-64 bg-[#12142A] border border-white/15 rounded-xl p-4 shadow-xl z-20">
                          <h4 className="font-bold mb-2">{bundle.name} includes:</h4>
                          <ul className="space-y-1 text-xs">
                            {bundle.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                {feature.included ? (
                                  <Check className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <X className="w-3 h-3 text-gray-500 mr-1 mt-0.5 flex-shrink-0" />
                                )}
                                <span className={feature.included ? "text-white" : "text-gray-500"}>
                                  {feature.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1">{bundle.name}</h3>
                  <p className="text-sm t-text-muted mb-3">{bundle.description}</p>

                  <div className={`text-3xl font-black ${colors.price}`}>
                    ${bundle.price.toFixed(2)}
                  </div>
                  <p className="text-xs t-text-muted">One-time payment</p>

                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add-On Customization Section - Only show for Base package */}
        {selectedBundle === "base" && (
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold gold-gradient-text text-center mb-2">Customize Your Base Package</h2>
            <p className="text-center t-text-muted text-sm mb-6">Add any services you want</p>

            <div className="card-solid rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ADD_ONS.map((addOn) => {
                const isSelected = selectedAddOns.includes(addOn.id);
                return (
                  <button
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.id)}
                    className={`relative p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-[#D6B35A]/15 border-[#D6B35A]"
                        : "bg-[#12142A]/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#D6B35A] border-[#D6B35A]"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#12142A]" />}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{addOn.name}</h4>
                    <p className="text-[#D6B35A] text-xs font-bold">+${addOn.price.toFixed(2)}</p>
                  </button>
                );
              })}
              </div>

              {selectedAddOns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="t-text-muted text-sm">
                    {selectedAddOns.length} add-on{selectedAddOns.length > 1 ? "s" : ""} selected
                  </span>
                  <span className="text-[#D6B35A] font-bold">
                    +${addOnsTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proceed to Payment Button */}
        <div className="text-center">
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/create-checkout-session", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    bundle: selectedBundle,
                    addOns: selectedAddOns,
                    chartData: chartResult,
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

                window.location.href = data.url;
              } catch (err) {
                console.error(err);
                alert("Network error. Please try again.");
              }
            }}
            className="gold-gradient-btn gold-gradient-btn-lg hover:scale-105 transition-transform shadow-2xl"
          >
            Proceed to Payment — ${totalPrice.toFixed(2)}
          </button>
          <p className="t-text-muted mt-3 text-sm">
            Secure checkout • Instant access • Yours forever
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================
// Success (after Stripe payment)
// =========================
function SuccessPage({ setIsPremium, chartResult, selectedBundle }) {
  const navigate = useNavigate();
  const [generationStatus, setGenerationStatus] = useState('starting'); // starting, generating, complete, error
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState(null);
  const zodiacType = chartResult?.zodiacType || 'tropical';

  // Check if we have chart data (from props or localStorage)
  const hasChartData = chartResult || localStorage.getItem("natavium_chartResult");

  // Extract session_id from URL params and store orderId
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      // Store session ID for potential order lookup
      localStorage.setItem('natavium_sessionId', sessionId);
    }

    // Store purchased products info
    const purchasedProducts = {
      bundle: selectedBundle || 'essential',
      addOns: [], // Add-ons will be fetched from order when ChartPage loads
    };
    localStorage.setItem('natavium_purchasedProducts', JSON.stringify(purchasedProducts));
  }, [selectedBundle]);

  useEffect(() => {
    if (!hasChartData) return;

    // Payment successful - unlock premium content
    setIsPremium(true);

    const generateReport = async () => {
      setGenerationStatus('generating');
      setStreamedText('');

      try {
        const response = await fetch('/api/generate-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chartResult,
            productType: selectedBundle || 'essential',
            analysisType: 'natal',
            zodiacSystem: zodiacType,
          }),
        });

        if (!response.ok) {
          // Handle error responses
          let errorMessage = 'Failed to generate report';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            if (response.status === 504) {
              errorMessage = 'Request timed out. Please try again.';
            } else {
              errorMessage = `Server error (${response.status}). Please try again.`;
            }
          }
          throw new Error(errorMessage);
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamedText(fullText);
        }

        // Store the analysis in localStorage using the new multi-analysis format
        const analysisData = {
          content: fullText,
          generatedAt: new Date().toISOString(),
        };
        localStorage.setItem('natavium_analyses', JSON.stringify({
          natal: analysisData,
        }));
        // Also store in legacy format for backwards compatibility
        localStorage.setItem('natavium_analysis', JSON.stringify({
          ...analysisData,
          productType: selectedBundle || 'essential',
        }));

        try {
          // Retrieve the Order ID (saved during checkout)
          const storedOrderId = localStorage.getItem('natavium_orderId'); 
          
          if (storedOrderId) {
            console.log("Saving natal analysis to database...");
            // No await needed here - let it run in background so UI doesn't freeze
            fetch('/api/save-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: storedOrderId,
                analysisType: 'natal', // This specific block handles the 'natal' section
                content: fullText
              })
            });
          }
        } catch (err) {
          console.error("Background save failed:", err);
        }

        setGenerationStatus('complete');

        // Redirect to chart page after brief success display
        setTimeout(() => {
          navigate('/chart', { replace: true });
        }, 1500);

      } catch (err) {
        console.error('Report generation error:', err);
        setError(err.message);
        setGenerationStatus('error');
      }
    };

    // Small delay before starting generation
    const timer = setTimeout(generateReport, 500);
    return () => clearTimeout(timer);
    // zodiacType is derived from chartResult.zodiacType, so chartResult covers it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChartData, chartResult, selectedBundle, setIsPremium, navigate]);

  // If no chart data anywhere, redirect to input
  if (!hasChartData) {
    return <Navigate to="/input" replace />;
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {generationStatus === 'starting' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="font-serif text-4xl font-semibold gold-gradient-text mb-4">Payment Successful!</h1>
            <p className="t-text-muted text-lg">Preparing your personalized reading...</p>
          </>
        )}

        {generationStatus === 'generating' && (
          <>
            <div className="w-20 h-20 bg-[#D6B35A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#D6B35A] animate-pulse" />
            </div>
            <h1 className="font-serif text-4xl font-semibold gold-gradient-text mb-4">Creating Your Reading</h1>
            <p className="t-text-muted text-lg mb-4">
              GPT is analyzing your unique cosmic blueprint...
            </p>

            {/* Live streaming preview */}
            {streamedText && (
              <div className="mt-4 bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto text-left border border-white/10">
                <p className="text-white/70 text-sm whitespace-pre-wrap">
                  {streamedText.slice(0, 500)}{streamedText.length > 500 ? '...' : ''}
                </p>
              </div>
            )}
            <p className="t-text-muted text-sm mt-4">
              {streamedText.length > 0 ? `${streamedText.length} characters generated...` : 'Starting generation...'}
            </p>

            {/* Social Media Links */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="t-text-muted text-sm mb-3">Follow us on socials</p>
              <SocialLinks className="justify-center" iconClassName="w-5 h-5" />
            </div>
          </>
        )}

        {generationStatus === 'complete' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="font-serif text-4xl font-semibold gold-gradient-text mb-4">Your Reading is Ready!</h1>
            <p className="t-text-muted text-lg">Taking you to your personalized analysis...</p>
          </>
        )}

        {generationStatus === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-serif text-4xl font-semibold mb-4">Generation Error</h1>
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/chart', { replace: true })}
              className="gold-gradient-btn px-6 py-3 rounded-xl font-bold"
            >
              Continue to Chart
            </button>
            <p className="t-text-muted text-sm mt-4">
              Don't worry - you can regenerate your reading from the chart page.
            </p>
          </>
        )}
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
              <h3 className="text-xl font-semibold">{bundle.name} Package</h3>
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
                <span className="text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="t-text-muted">Order Total</span>
            <span className="text-2xl font-bold text-white">${bundle.price.toFixed(2)}</span>
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

  // Get the active chart based on selected zodiac system
  // Supports both old flat format and new { tropical, sidereal, meta } format
  const zodiacType = chartResult?.zodiacType || 'tropical';
  const activeChart = chartResult?.tropical ? chartResult[zodiacType] : chartResult;
  const zodiacLabel = zodiacType === 'sidereal' ? 'Sidereal' : 'Tropical';

  // Tab and dashboard state
  const [activeTab, setActiveTab] = useState('natal');
  const [analyses, setAnalyses] = useState({});
  const [generatingTab, setGeneratingTab] = useState(null);
  const [upsellTab, setUpsellTab] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState(() => {
    const saved = localStorage.getItem('natavium_purchasedProducts');
    return saved ? JSON.parse(saved) : { bundle: selectedBundle || 'essential', addOns: [] };
  });

  // Load analyses from localStorage on mount
  useEffect(() => {
    const storedAnalyses = localStorage.getItem('natavium_analyses');
    if (storedAnalyses) {
      try {
        const parsed = JSON.parse(storedAnalyses);
        setAnalyses(parsed);
      } catch (e) {
        console.error('Failed to parse stored analyses:', e);
      }
    }
    // Also check for legacy single analysis
    const legacyAnalysis = localStorage.getItem('natavium_analysis');
    if (legacyAnalysis && !storedAnalyses) {
      try {
        const parsed = JSON.parse(legacyAnalysis);
        setAnalyses({ natal: parsed });
        // Migrate to new format
        localStorage.setItem('natavium_analyses', JSON.stringify({ natal: parsed }));
      } catch (e) {
        console.error('Failed to parse legacy analysis:', e);
      }
    }
  }, []);

  // Fetch order data to get purchased products (if orderId is in localStorage)
  useEffect(() => {
    const fetchOrderData = async () => {
      const orderId = localStorage.getItem('natavium_orderId');
      if (!orderId) return;

      try {
        const res = await fetch(`/api/get-order?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          const products = {
            bundle: data.productType,
            addOns: data.purchasedAddons || [],
          };
          setPurchasedProducts(products);
          localStorage.setItem('natavium_purchasedProducts', JSON.stringify(products));
        }
      } catch (err) {
        console.error('Failed to fetch order data:', err);
      }
    };
    fetchOrderData();

    // Check for add-on purchase success and clean up URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('addon_success') === 'true') {
      // Clear the URL param
      window.history.replaceState({}, '', window.location.pathname);
      // Re-fetch order data to get updated add-ons (small delay for webhook to process)
      setTimeout(fetchOrderData, 1500);
    }
  }, []);

  // Check if a tab is accessible
  // Handles both prefixed (tropical_natal) and unprefixed (natal) purchased add-ons
  const isTabAccessible = (tabId) => {
    const tab = DASHBOARD_TABS.find(t => t.id === tabId);
    if (!tab) return false;
    if (tab.alwaysActive || !tab.requiresPurchase) return true;
    if (tab.comingSoon) return false; // Coming soon tabs are never accessible
    // Check add-ons: match unprefixed tab ID against both prefixed and unprefixed stored IDs
    if (purchasedProducts.addOns.includes(tabId) ||
        purchasedProducts.addOns.includes(`tropical_${tabId}`) ||
        purchasedProducts.addOns.includes(`sidereal_${tabId}`)) return true;
    // Check bundle inclusion: strip zodiac prefix from stored bundle for matching
    const baseBundle = purchasedProducts.bundle?.replace(/^(tropical|sidereal)_/, '');
    if (tab.includedIn?.includes(baseBundle)) return true;
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
          fetch('/api/save-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: storedOrderId,
              analysisType: tabId, // <--- Using the variable from your function
              content: fullText
            })
          });
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

  // Handle tab click
  const handleTabClick = (tab) => {
    if (tab.comingSoon) {
      setUpsellTab({ ...tab, isComingSoon: true });
      return;
    }
    if (isTabAccessible(tab.id)) {
      setActiveTab(tab.id);
      // Generate analysis if not already present
      if (!analyses[tab.id]?.content && tab.id !== 'natal') {
        generateAnalysisForTab(tab.id);
      }
    } else {
      // Pre-select the clicked add-on and open modal
      setSelectedAddOns([tab.id]);
      setUpsellTab(tab);
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
      const response = await fetch('/api/create-addon-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          addOns: selectedAddOns,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error('Add-on checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Function to regenerate analysis for the active tab
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
          fetch('/api/save-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: storedOrderId,
              analysisType: activeTab, // <--- Using the 'activeTab' variable
              content: fullText
            })
          });
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

  // PDF Generation Handler (Server-side via Puppeteer)
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold gold-gradient-text mb-2">Your Complete {zodiacLabel} Chart</h1>
          <p className="text-lg t-text-muted mb-4">
            {displayDate} • {birthData.time} • {birthData.location}
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-[#12142A] hover:border-white/20 transition-all text-sm"
            >
              <Mail className="w-4 h-4 mr-2 icon-gold" />
              Email Results
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              className="flex items-center px-4 py-2 bg-[#12142A]/80 border border-white/10 rounded-lg hover:bg-[#12142A] hover:border-white/20 transition-all text-sm disabled:opacity-50"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2 icon-gold" />
                  Download PDF
                </>
              )}
            </button>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center mt-4">
            <SocialLinks iconClassName="w-4 h-4" />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 overflow-x-auto bg-[#12142A]/60 rounded-2xl p-2 mb-6 scrollbar-hide border border-white/10">
          {DASHBOARD_TABS.map((tab) => {
            const accessible = isTabAccessible(tab.id);
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            const isGenerating = generatingTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold
                  whitespace-nowrap transition-all min-w-fit ${
                  isActive
                    ? 'bg-[#D6B35A]/20 text-[#D6B35A] border border-[#D6B35A]/30'
                    : accessible
                      ? 'hover:bg-white/10 t-text-muted hover:text-white'
                      : 't-text-muted opacity-60 hover:opacity-80'
                }`}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TabIcon className="w-4 h-4" />
                )}
                <span>{tab.label}</span>
                {tab.comingSoon && (
                  <span className="text-[10px] bg-[#69D2FF]/20 px-1.5 py-0.5 rounded text-[#69D2FF]">Soon</span>
                )}
                {!accessible && !tab.comingSoon && <Lock className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </nav>

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
                    <h3 className="text-2xl font-semibold mb-2">{upsellTab.label}</h3>
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
                    <h3 className="text-2xl font-semibold mb-2">Unlock Premium Features</h3>
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
          <>
            <div className="bg-[#D6B35A]/10 border border-[#D6B35A]/30 rounded-2xl p-6 mb-8 text-center">
              <div className="text-4xl mb-2">✨</div>
              <h2 className="text-2xl font-semibold mb-2 gold-gradient-text">Welcome to Your Cosmic Journey!</h2>
              <p className="t-text-muted">Your complete analysis is unlocked.</p>
              {chartResult.chartId && (
                <p className="t-text-muted text-xs mt-2">Chart ID: {chartResult.chartId}</p>
              )}
            </div>
          </>
        )}

        {/* Natal Chart Tab Content */}
        {activeTab === 'natal' && (
        <div className="space-y-8">
          {/* Premium Chart Wheel */}
          <div id="natal-chart-container" className="card-solid rounded-2xl p-8">
            <h2 className="font-serif text-2xl font-semibold text-center mb-6 gold-gradient-text">Your Natal Chart</h2>
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
                neptune: "M0,-5 L0,5 M-3,5 L3,5 M-4,-2 A4,3 0 0,1 4,-2 M0,-5 L0,-2", // Trident
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
            <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #ff6b6b, #f97316)' }}></span><span className="t-text-muted">Fire</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}></span><span className="t-text-muted">Earth</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #fde047, #facc15)' }}></span><span className="t-text-muted">Air</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}></span><span className="t-text-muted">Water</span></div>
            </div>
          </div>

          {/* Big Three Summary (Compact) */}
          <div className="card-solid rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Big Three</h2>
            <div className="space-y-3">
              <div className="bg-[#D6B35A]/10 rounded-xl p-4 border border-[#D6B35A]/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#D6B35A]">☉ {activeChart.sun.sign} Sun</h3>
                  <span className="text-sm t-text-muted">{activeChart.sun.degree}° {String(activeChart.sun.minutes || 0).padStart(2, '0')}' • {activeChart.sun.house}{houseSuffix(activeChart.sun.house)} house</span>
                </div>
                <p className="text-sm t-text-muted mt-1">Core Identity</p>
              </div>
              <div className="bg-[#69D2FF]/10 rounded-xl p-4 border border-[#69D2FF]/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#69D2FF]">☽ {activeChart.moon.sign} Moon</h3>
                  <span className="text-sm t-text-muted">{activeChart.moon.degree}° {String(activeChart.moon.minutes || 0).padStart(2, '0')}' • {activeChart.moon.house}{houseSuffix(activeChart.moon.house)} house</span>
                </div>
                <p className="text-sm t-text-muted mt-1">Emotional Core</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">↑ {activeChart.rising.sign} Rising</h3>
                  <span className="text-sm t-text-muted">{activeChart.rising.degree}° {String(activeChart.rising.minutes || 0).padStart(2, '0')}' Ascendant</span>
                </div>
                <p className="text-sm t-text-muted mt-1">How Others See You</p>
              </div>
            </div>
          </div>

          {/* Planetary Placements */}
          <div className="card-solid rounded-2xl p-8">
            <h2 className="font-serif text-2xl font-semibold mb-6 gold-gradient-text">Planetary Placements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Mercury", glyph: "☿", data: activeChart.mercury, desc: "Communication" },
                { name: "Venus", glyph: "♀", data: activeChart.venus, desc: "Love & Beauty" },
                { name: "Mars", glyph: "♂", data: activeChart.mars, desc: "Drive & Action" },
                { name: "Jupiter", glyph: "♃", data: activeChart.jupiter, desc: "Growth & Luck" },
                { name: "Saturn", glyph: "♄", data: activeChart.saturn, desc: "Structure" },
                { name: "Uranus", glyph: "♅", data: activeChart.uranus, desc: "Innovation" },
                { name: "Neptune", glyph: "♆", data: activeChart.neptune, desc: "Dreams" },
                { name: "Pluto", glyph: "♇", data: activeChart.pluto, desc: "Transformation" },
              ].map((planet) => (
                <div key={planet.name} className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{planet.glyph}</span>
                    <span className="font-semibold">{planet.name}</span>
                  </div>
                  <p className="text-[#D6B35A] font-bold">{planet.data?.sign || "—"}</p>
                  <p className="t-text-muted text-xs">{planet.data?.degree ?? "—"}° {String(planet.data?.minutes || 0).padStart(2, '0')}' • {planet.data?.house ? `${planet.data.house}${houseSuffix(planet.data.house)} house` : "—"}</p>
                  <p className="t-text-muted text-xs mt-1">{planet.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Full Analysis */}
          <div className="card-solid rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold gold-gradient-text">
                <Sparkles className="w-6 h-6 inline mr-2 icon-gold" />
                Your Personalized Reading
              </h2>
              {purchasedProducts.bundle && (
                <span className="text-xs t-text-muted">
                  {purchasedProducts.bundle.charAt(0).toUpperCase() + purchasedProducts.bundle.slice(1)} Package
                </span>
              )}
            </div>

            {analysisLoading || generatingTab === 'natal' ? (
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
                <button
                  onClick={regenerateAnalysis}
                  disabled={analysisLoading || generatingTab}
                  className="t-text-muted hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Other Tab Content - Reusable Analysis Display */}
        {activeTab !== 'natal' && (
          <div className="space-y-8">
            <div className="card-solid rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold gold-gradient-text">
                  <Sparkles className="w-6 h-6 inline mr-2 icon-gold" />
                  {DASHBOARD_TABS.find(t => t.id === activeTab)?.label} Analysis
                </h2>
              </div>

              {generatingTab === activeTab ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-[#D6B35A] animate-spin mb-4" />
                  <p className="t-text-muted">Generating your {DASHBOARD_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} analysis...</p>
                  {currentAnalysis?.content && (
                    <div className="mt-6 w-full prose prose-invert max-w-none opacity-70">
                      {currentAnalysis.content.split('\n').slice(0, 10).map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return <h3 key={idx} className="text-xl font-semibold text-[#D6B35A] mt-4 mb-2">{line.replace('## ', '')}</h3>;
                        }
                        if (line.startsWith('### ')) {
                          return <h4 key={idx} className="text-lg font-semibold text-white/90 mt-3 mb-1">{line.replace('### ', '')}</h4>;
                        }
                        if (line.startsWith('#### ')) {
                          return <h5 key={idx} className="text-base font-medium t-text-muted mt-2 mb-1">{line.replace('#### ', '')}</h5>;
                        }
                        if (line.trim() === '') return <div key={idx} className="h-2" />;
                        return <p key={idx} className="text-white/80 leading-relaxed mb-2">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      })}
                    </div>
                  )}
                </div>
              ) : currentAnalysis?.content ? (
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

              {currentAnalysis?.content && !generatingTab && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <p className="t-text-muted text-xs">
                    Generated {currentAnalysis.generatedAt ? new Date(currentAnalysis.generatedAt).toLocaleDateString() : 'recently'}
                  </p>
                  <button
                    onClick={regenerateAnalysis}
                    disabled={analysisLoading || generatingTab}
                    className="t-text-muted hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </button>
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
    return saved || 'theme-v2'; // default to V2 dark cosmic theme
  });

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("natavium_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'theme-original' ? 'theme-v2' : 'theme-original');
  };

  // Load initial state from localStorage
  const [birthData, setBirthData] = useState(() => {
    const saved = localStorage.getItem("natavium_birthData");
    return saved ? JSON.parse(saved) : {
      date: "",
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      time: "",
      hour: "",
      minute: "",
      period: "AM",
      location: "",
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
  const [selectedBundle, setSelectedBundle] = useState("essential"); // default to most popular
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
      const updated = { ...prev, [field]: value };
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
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  );
}
