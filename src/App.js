import React, { useState, useEffect } from "react";
import html2canvas from 'html2canvas';
import { Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import { calculateNatalChartFromLocal } from "./ephemeris";
import "./App.css";
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
  DollarSign,
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
    price: 14.99,
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
    id: 'vedic_chart',
    label: 'Vedic',
    icon: Sun,
    requiresPurchase: true,
    priceIfLocked: 2.99,
    includedIn: ['ultimate'],
    description: 'Eastern sidereal astrology perspective with Nakshatra analysis.',
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center"
        >
          <X className="w-4 h-4 mr-2" />
          Close
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="flex gap-4 mb-8 border-b border-white/20 pb-4 overflow-x-auto">
            <button
              onClick={() => navigate("/info/systems")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                infoPage === "systems" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              Astrology Systems
            </button>

            <button
              onClick={() => navigate("/info/approach")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                infoPage === "approach" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              Our Approach
            </button>

            <button
              onClick={() => navigate("/info/services")}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                infoPage === "services" ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              Services & Pricing
            </button>
          </div>

          {infoPage === "systems" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black mb-6">Understanding Astrology Systems</h2>
                <p className="text-purple-200 mb-8">
                  Different astrological traditions offer unique perspectives on the same cosmic data.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-yellow-300 mb-3">
                    ⭐ Western (Tropical) Astrology
                  </h3>
                  <p className="text-purple-200 mb-3">
                    <strong>Most Popular System</strong> - Based on Earth's seasons. The zodiac begins
                    when the Sun enters 0° Aries at the Spring Equinox.
                  </p>
                  <p className="text-purple-200 mb-3">
                    <strong>Best for:</strong> Personality analysis, psychological insight,
                    understanding character traits and life purpose.
                  </p>
                  <p className="text-purple-200">
                    This is the system used in Western horoscopes. It focuses on who you ARE rather
                    than what will happen to you.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-yellow-300 mb-3">
                    🕉️ Vedic (Sidereal) Astrology
                  </h3>
                  <p className="text-purple-200 mb-3">
                    <strong>Ancient Indian System</strong> - Based on actual star positions. About
                    23-24° behind Western astrology.
                  </p>
                  <p className="text-purple-200 mb-3">
                    <strong>Key difference:</strong> Your Vedic Sun sign is often DIFFERENT from
                    Western!
                  </p>
                  <p className="text-purple-200">
                    <strong>Best for:</strong> Predictive astrology, timing life events,
                    understanding karma and destiny.
                  </p>
                </div>
              </div>

              <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold mb-3">Which System Should I Use?</h3>
                <p className="text-purple-200">
                  Start with <strong>Western (Tropical)</strong> - it's most accessible. Once you
                  understand your Western chart, explore Vedic for a different perspective.
                </p>
              </div>
            </div>
          )}

          {infoPage === "approach" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black mb-6">Our Scientific Approach</h2>
                <p className="text-purple-200 mb-8">
                  Transparency matters. Here's exactly how Natavium works.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">📐 Chart Calculations</h3>
                <p className="text-purple-200 mb-3">
                  We use the <strong>Swiss Ephemeris</strong> - the gold standard in astronomical
                  calculations. Planetary positions are accurate to the arc-second.
                </p>
                <p className="text-purple-200">
                  Your birth time and location are converted to precise coordinates, then we
                  calculate where each planet was at that exact moment.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">🤖 AI-Generated Readings</h3>
                <p className="text-purple-200 mb-3">
                  Unlike template-based apps, Natavium uses <strong>GPT-4</strong> to actually
                  analyze YOUR specific chart.
                </p>
                <p className="text-purple-200">
                  The AI considers how all your placements interact - synthesizing contradictions
                  and identifying patterns unique to YOUR combination.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">🔒 Privacy & Data</h3>
                <p className="text-purple-200 mb-3">
                  <strong>Your birth data is private.</strong> We never share or sell your
                  information. Data is encrypted and stored securely.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-3">
                  ⚖️ What Astrology Can and Cannot Do
                </h3>
                <p className="text-purple-200 mb-2">
                  <strong>Astrology CAN:</strong> Provide insight into personality patterns, life
                  themes, timing of opportunities, relationship dynamics.
                </p>
                <p className="text-purple-200 mb-2">
                  <strong>Astrology CANNOT:</strong> Predict specific events with certainty,
                  override free will, diagnose medical conditions.
                </p>
                <p className="text-purple-200">
                  Think of astrology as a map, not a mandate. It shows terrain, but YOU choose the
                  path.
                </p>
              </div>
            </div>
          )}

          {infoPage === "services" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black mb-6">Services & Pricing</h2>
                <p className="text-purple-200 mb-8">Build your cosmic toolkit at your own pace.</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 border-2 border-yellow-500/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-black text-yellow-300">Your Natal Chart</h3>
                  <div className="text-right">
                    <div className="text-4xl font-black text-yellow-300">$4.99</div>
                    <div className="text-sm text-purple-200">One-time</div>
                  </div>
                </div>

                <p className="text-purple-200 mb-6">Complete birth chart analysis</p>

                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Complete birth chart wheel</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>3000+ word AI analysis</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All 10 planetary placements</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>House positions & aspects</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>2026 forecast included</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Downloadable PDF</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4">Add-On Services</h3>
                <p className="text-purple-300 mb-6 text-sm">
                  Expand your understanding (available with or after natal chart purchase)
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Compatibility</h4>
                      <span className="text-xl font-bold text-purple-300">$3.99</span>
                    </div>
                    <p className="text-sm text-purple-200">
                      Compare your chart with partner or friend. Shows harmony and growth areas.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">House Deep Dive</h4>
                      <span className="text-xl font-bold text-purple-300">$2.99</span>
                    </div>
                    <p className="text-sm text-purple-200">
                      Detailed analysis of each house in your chart and what it means.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Solar Return</h4>
                      <span className="text-xl font-bold text-purple-300">$4.99</span>
                    </div>
                    <p className="text-sm text-purple-200">
                      Your year ahead forecast. Birthday prediction for coming year.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Vedic Chart</h4>
                      <span className="text-xl font-bold text-purple-300">$2.99</span>
                    </div>
                    <p className="text-sm text-purple-200">
                      Eastern astrology perspective. Often reveals different signs!
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold">Transit Report</h4>
                      <span className="text-xl font-bold text-purple-300">$1.99</span>
                    </div>
                    <p className="text-sm text-purple-200">
                      Current planetary movements affecting YOUR chart this month.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black">Natavium Plus (Coming Soon)</h3>
                    <p className="text-purple-300 text-sm">Optional subscription</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-purple-300">$2.99</div>
                    <div className="text-sm text-purple-200">/month</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-purple-300 mr-2" />
                    <span>Daily personalized horoscope</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-purple-300 mr-2" />
                    <span>Weekly transit updates</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-purple-300 mr-2" />
                    <span>Unlimited compatibility reports</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-purple-300 mr-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div />
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/info/services")}
              className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </button>

            <button
              onClick={() => navigate("/info/systems")}
              className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More
            </button>
          </div>
        </div>

        <div className="text-center pt-12 pb-8">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse mr-3" />
            <h1 className="text-6xl font-black">Natavium</h1>
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse ml-3" />
          </div>
          <p className="text-2xl text-purple-200 mb-2 font-semibold">Where AI Meets Astrology</p>
          <p className="text-lg text-purple-300">Real AI analysis of YOUR unique birth chart</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Star className="w-10 h-10 text-yellow-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">True Personalization</h3>
            <p className="text-purple-200 text-sm">
              Millions of combinations based on your exact birth moment.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Zap className="w-10 h-10 text-yellow-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
            <p className="text-purple-200 text-sm">
              GPT-4 synthesizes your placements - real analysis, not templates.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Heart className="w-10 h-10 text-yellow-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Own Forever</h3>
            <p className="text-purple-200 text-sm">$4.99 one-time. No subscription required.</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={() => navigate("/input")}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-5 rounded-full text-2xl font-black hover:scale-105 transition-transform shadow-2xl"
          >
            Discover Your Chart →
          </button>
          <p className="text-purple-300 mt-4 text-sm">Free preview • Full analysis $4.99</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Natavium?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-bold text-red-300 mb-2">❌ Other Apps:</div>
              <ul className="space-y-2 text-purple-200">
                <li>• $7-15/month subscriptions</li>
                <li>• Template-based readings</li>
                <li>• Generic sun-sign horoscopes</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-green-300 mb-2">✅ Natavium:</div>
              <ul className="space-y-2 text-purple-200">
                <li>• $4.99 one-time payment</li>
                <li>• Real AI synthesis</li>
                <li>• True personalization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer with legal links */}
        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-purple-300">
          <div className="flex justify-center gap-6 mb-4">
            <button
              onClick={() => navigate("/impressum")}
              className="hover:text-white transition-colors"
            >
              Impressum
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => navigate("/datenschutz")}
              className="hover:text-white transition-colors"
            >
              Datenschutz
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <SocialLinks iconClassName="w-4 h-4" />
          </div>
          <p className="text-purple-400">© {new Date().getFullYear()} Natavium. Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    </div>
  );
}

// =========================
// Input Form
// =========================
function InputPage({ birthData, handleInputChange, calculateChart, calcError }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black mb-2">Enter Your Birth Details</h2>
          <p className="text-purple-300">Exact time and location create your unique chart</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="mb-6">
            <label className="flex items-center text-lg font-semibold mb-3">
              <Calendar className="w-5 h-5 mr-2 text-yellow-300" />
              Birth Date
            </label>
            <div className="flex gap-3">
              <select
                value={birthData.birthMonth}
                onChange={(e) => handleInputChange("birthMonth", e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-purple-900">Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, i) => (
                  <option key={month} value={String(i + 1)} className="bg-purple-900">
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={birthData.birthDay}
                onChange={(e) => handleInputChange("birthDay", e.target.value)}
                className="w-24 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-purple-900">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)} className="bg-purple-900">
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                value={birthData.birthYear}
                onChange={(e) => handleInputChange("birthYear", e.target.value)}
                className="w-28 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-purple-900">Year</option>
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={String(year)} className="bg-purple-900">
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center text-lg font-semibold mb-3">
              <Clock className="w-5 h-5 mr-2 text-yellow-300" />
              Birth Time
            </label>
            <div className="flex gap-3">
              <select
                value={birthData.hour}
                onChange={(e) => handleInputChange("hour", e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-purple-900">Hour</option>
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h} className="bg-purple-900">
                    {h}
                  </option>
                ))}
              </select>
              <select
                value={birthData.minute}
                onChange={(e) => handleInputChange("minute", e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-purple-900">Min</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i} className="bg-purple-900">
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <div className="flex rounded-xl overflow-hidden border border-white/30">
                <button
                  type="button"
                  onClick={() => handleInputChange("period", "AM")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    birthData.period === "AM"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("period", "PM")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    birthData.period === "PM"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
            <p className="text-xs text-purple-300 mt-2">Check birth certificate for exact time</p>
          </div>

          <div className="mb-8">
            <label className="flex items-center text-lg font-semibold mb-3">
              <MapPin className="w-5 h-5 mr-2 text-yellow-300" />
              Birth Location
            </label>
            <input
              type="text"
              value={birthData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Welland, Ontario"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <p className="text-xs text-purple-300 mt-2">City name auto-detected • Timezone calculated automatically</p>

            {/* Quick city presets */}
            <div className="mt-3">
              <p className="text-xs text-purple-300 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {["New York", "Los Angeles", "Chicago", "London", "Toronto", "Sydney"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleInputChange("location", city)}
                    className="px-2 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {calcError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-sm text-red-200">
              ⚠️ Error: {calcError}
            </div>
          )}

          <div className="bg-purple-500/20 rounded-xl p-4 mb-6 text-sm text-purple-200">
            🔒 Your data is private and secure
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/30 font-semibold hover:bg-white/20 transition-colors"
            >
              ← Back
            </button>

            <button
              onClick={() => calculateChart(navigate)}
              disabled={!birthData.birthMonth || !birthData.birthDay || !birthData.birthYear || !birthData.hour || !birthData.minute || !birthData.location}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Chart ✨
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
          <p className="animate-pulse">✨ Generating AI insights...</p>
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
  { id: "vedic_chart", name: "Vedic Chart", price: 2.99, description: "Eastern astrology perspective" },
  { id: "transit_report", name: "Transit Report", price: 1.99, description: "Current planetary influences" },
];

function PreviewPage({ chartResult, birthData, selectedBundle, setSelectedBundle }) {
  const [showTooltip, setShowTooltip] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [teaser, setTeaser] = useState(null);
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [teaserError, setTeaserError] = useState(null);

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
          body: JSON.stringify({ chartResult }),
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2">Your Natal Chart</h1>
          <p className="text-xl text-purple-300">
            {displayDate} • {birthData.time} • {birthData.location}
          </p>
        </div>

        {/* Sun Sign Heading */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-yellow-300">
            ✨ You're a {chartResult.sun.sign}! ✨
          </h2>
        </div>

        {/* Professional Chart Wheel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          {(() => {
            // Zodiac data with glyphs and element colors
            const zodiacSigns = [
              { name: "Aries", glyph: "♈︎", element: "fire" },
              { name: "Taurus", glyph: "♉︎", element: "earth" },
              { name: "Gemini", glyph: "♊︎", element: "air" },
              { name: "Cancer", glyph: "♋︎", element: "water" },
              { name: "Leo", glyph: "♌︎", element: "fire" },
              { name: "Virgo", glyph: "♍︎", element: "earth" },
              { name: "Libra", glyph: "♎︎", element: "air" },
              { name: "Scorpio", glyph: "♏︎", element: "water" },
              { name: "Sagittarius", glyph: "♐︎", element: "fire" },
              { name: "Capricorn", glyph: "♑︎", element: "earth" },
              { name: "Aquarius", glyph: "♒︎", element: "air" },
              { name: "Pisces", glyph: "♓︎", element: "water" },
            ];

            const elementColors = {
              fire: "#ef4444",
              earth: "#22c55e",
              air: "#facc15",
              water: "#3b82f6",
            };

            const planetGlyphs = {
              sun: "☉",
              moon: "☽",
              mercury: "☿",
              venus: "♀",
              mars: "♂",
              jupiter: "♃",
              saturn: "♄",
            };

            // Find rising sign index to position it at 9 o'clock
            const risingIndex = zodiacSigns.findIndex(
              (s) => s.name === chartResult.rising.sign
            );

            // Calculate rotation offset so rising sign is at 9 o'clock (180°)
            // Each sign is 30°, starting from Aries at 0°
            const risingOffset = 180 - risingIndex * 30 - 15; // -15 centers the sign

            // Helper to get position on circle
            const getPosition = (angleDeg, radius) => {
              const angleRad = (angleDeg * Math.PI) / 180;
              return {
                x: 200 + radius * Math.cos(angleRad),
                y: 200 + radius * Math.sin(angleRad),
              };
            };

            // Calculate planet positions based on their sign and degree
            const getPlanetAngle = (sign, degree) => {
              const signIndex = zodiacSigns.findIndex((s) => s.name === sign);
              // Base angle for sign + degree within sign + rising offset
              return signIndex * 30 + degree + risingOffset;
            };

            const planets = [
              { key: "sun", ...chartResult.sun },
              { key: "moon", ...chartResult.moon },
              { key: "mercury", sign: chartResult.mercury.sign, degree: chartResult.mercury.degree || 8 },
              { key: "venus", sign: chartResult.venus.sign, degree: chartResult.venus.degree || 24 },
              { key: "mars", sign: chartResult.mars.sign, degree: chartResult.mars.degree || 12 },
            ];

            return (
              <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-4">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    {/* Glow filter for planets */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Gradient for center */}
                    <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                      <stop offset="100%" stopColor="rgba(30, 27, 75, 0.8)" />
                    </radialGradient>
                  </defs>

                  {/* Background circles */}
                  <circle cx="200" cy="200" r="195" fill="rgba(30, 27, 75, 0.6)" />
                  <circle cx="200" cy="200" r="195" fill="none" stroke="rgba(253, 224, 71, 0.4)" strokeWidth="2" />
                  <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="80" fill="url(#centerGradient)" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" />

                  {/* Zodiac sign segments */}
                  {zodiacSigns.map((sign, i) => {
                    const startAngle = i * 30 + risingOffset;
                    const midAngle = startAngle + 15;
                    const glyphPos = getPosition(midAngle, 177);

                    // Draw segment lines
                    const lineStart = getPosition(startAngle, 160);
                    const lineEnd = getPosition(startAngle, 195);

                    return (
                      <g key={sign.name}>
                        {/* Segment divider line */}
                        <line
                          x1={lineStart.x}
                          y1={lineStart.y}
                          x2={lineEnd.x}
                          y2={lineEnd.y}
                          stroke="rgba(253, 224, 71, 0.3)"
                          strokeWidth="1"
                        />
                        {/* Zodiac glyph */}
                        <text
                          x={glyphPos.x}
                          y={glyphPos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={elementColors[sign.element]}
                          fontSize="16"
                          fontWeight="bold"
                        >
                          {sign.glyph}
                        </text>
                      </g>
                    );
                  })}

                  {/* House numbers (1-12) */}
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
                        fill="rgba(167, 139, 250, 0.7)"
                        fontSize="11"
                        fontWeight="500"
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
                        stroke={isCardinal ? "rgba(253, 224, 71, 0.5)" : "rgba(167, 139, 250, 0.25)"}
                        strokeWidth={isCardinal ? "2" : "1"}
                      />
                    );
                  })}

                  {/* Ascendant marker (arrow at 9 o'clock) */}
                  <g>
                    <polygon
                      points="5,200 25,192 25,208"
                      fill="#facc15"
                      filter="url(#glow)"
                    />
                    <text
                      x="35"
                      y="200"
                      textAnchor="start"
                      dominantBaseline="central"
                      fill="#facc15"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ASC
                    </text>
                  </g>

                  {/* Planets positioned by degree */}
                  {planets.map((planet) => {
                    const angle = getPlanetAngle(planet.sign, planet.degree);
                    const pos = getPosition(angle, 100);
                    const signData = zodiacSigns.find((s) => s.name === planet.sign);
                    const color = signData ? elementColors[signData.element] : "#fff";

                    return (
                      <g key={planet.key} filter="url(#glow)">
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="14"
                          fill="rgba(30, 27, 75, 0.9)"
                          stroke={color}
                          strokeWidth="1.5"
                        />
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={color}
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {planetGlyphs[planet.key]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center decoration */}
                  <circle cx="200" cy="200" r="25" fill="rgba(139, 92, 246, 0.2)" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="1" />
                  <text
                    x="200"
                    y="200"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(253, 224, 71, 0.8)"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    ✦
                  </text>
                </svg>
              </div>
            );
          })()}

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs mb-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-purple-300">Fire</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-purple-300">Earth</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-purple-300">Air</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-purple-300">Water</span>
            </div>
          </div>

          <p className="text-center text-purple-300 italic text-sm">
            {chartResult.rising.sign} Rising • Planets positioned by degree
          </p>

          {/* Personalized Archetype */}
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

            const sunSign = chartResult.sun.sign;
            const moonSign = chartResult.moon.sign;
            const risingSign = chartResult.rising.sign;

            const moonElement = signElements[moonSign];

            // Get base archetype from sun sign
            const baseArchetypes = sunArchetypes[sunSign] || ["Cosmic Soul"];
            const baseArchetype = baseArchetypes[0];

            // Get moon modifier
            const moonMods = moonModifiers[moonElement] || ["Intuitive"];
            const moonMod = moonMods[0];

            // Combine into a unique archetype title
            // Format: "The [Moon Modifier] [Base Archetype Noun]"
            const baseWords = baseArchetype.split(" ");
            const archetypeNoun = baseWords[baseWords.length - 1]; // Get the noun (Builder, Leader, etc.)

            const archetype = `The ${moonMod} ${archetypeNoun}`;

            return (
              <div className="text-center mt-6 pt-6 border-t border-white/10">
                <p className="text-2xl font-semibold text-purple-200 italic">
                  "{archetype}"
                </p>
                <p className="text-xs text-purple-400 mt-2">
                  {sunSign} Sun • {moonSign} Moon • {risingSign} Rising
                </p>
              </div>
            );
          })()}
        </div>

        {/* Big Three */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
            <Sun className="w-10 h-10 text-yellow-300 mb-3" />
            <div className="text-2xl font-bold mb-1">{chartResult.sun.sign} Sun</div>
            <div className="text-sm text-purple-200">Core Identity</div>
            <div className="text-xs text-purple-300 mt-2">
              {chartResult.sun.degree}° {String(chartResult.sun.minutes || 0).padStart(2, '0')}' in {chartResult.sun.house}
              {houseSuffix(chartResult.sun.house)} house
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
            <Moon className="w-10 h-10 text-blue-300 mb-3" />
            <div className="text-2xl font-bold mb-1">{chartResult.moon.sign} Moon</div>
            <div className="text-sm text-purple-200">Emotional Core</div>
            <div className="text-xs text-purple-300 mt-2">
              {chartResult.moon.degree}° {String(chartResult.moon.minutes || 0).padStart(2, '0')}' in {chartResult.moon.house}
              {houseSuffix(chartResult.moon.house)} house
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 border border-pink-500/30">
            <Star className="w-10 h-10 text-pink-300 mb-3" />
            <div className="text-2xl font-bold mb-1">{chartResult.rising.sign} Rising</div>
            <div className="text-sm text-purple-200">How Others See You</div>
            <div className="text-xs text-purple-300 mt-2">{chartResult.rising.degree}° {String(chartResult.rising.minutes || 0).padStart(2, '0')}' Ascendant</div>
          </div>
        </div>

        {/* AI-Generated Teaser with paywall */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-6">Your Cosmic Blueprint</h2>

          {teaserLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-10 h-10 text-yellow-300 animate-spin mb-4" />
              <p className="text-purple-300">Analyzing your unique cosmic signature...</p>
            </div>
          ) : teaserError ? (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                Your {chartResult.sun.sign} Sun combined with {chartResult.moon.sign} Moon and {chartResult.rising.sign} Rising
                creates a unique cosmic blueprint that shapes your personality, emotions, and how others perceive you.
              </p>
              <p className="text-purple-300 text-sm">Full AI analysis available in paid packages below.</p>
            </div>
          ) : teaser ? (
            <div className="space-y-4">
              {teaser.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-lg leading-relaxed text-purple-100">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          <div className="relative mt-6">
            {/* Blurred premium preview */}
            <div className="blur-sm select-none opacity-50">
              <h3 className="text-xl font-bold mb-2">
                Mercury in {chartResult.mercury.sign}
              </h3>
              <p className="text-sm">Your communication style reveals hidden patterns...</p>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900 pointer-events-none" />
          </div>

          <div className="text-center mt-4">
            <Lock className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
            <p className="text-purple-200 text-sm">Select a package below to unlock your full reading</p>
          </div>
        </div>

        {/* Bundle Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Choose Your Package</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.values(BUNDLES).map((bundle) => {
              const IconComponent = bundle.icon;
              const isSelected = selectedBundle === bundle.id;
              const colorClasses = {
                yellow: {
                  border: isSelected ? "border-yellow-400" : "border-white/20",
                  bg: isSelected ? "bg-yellow-500/20" : "bg-white/5",
                  icon: "text-yellow-300",
                  price: "text-yellow-300",
                },
                purple: {
                  border: isSelected ? "border-purple-400" : "border-white/20",
                  bg: isSelected ? "bg-purple-500/20" : "bg-white/5",
                  icon: "text-purple-300",
                  price: "text-purple-300",
                },
                pink: {
                  border: isSelected ? "border-pink-400" : "border-white/20",
                  bg: isSelected ? "bg-pink-500/20" : "bg-white/5",
                  icon: "text-pink-300",
                  price: "text-pink-300",
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
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left ${colors.border} ${colors.bg} ${
                    isSelected ? "scale-105 shadow-xl" : "hover:bg-white/10"
                  }`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                        <Info className="w-5 h-5 animate-info-pulse" />
                      </button>

                      {showTooltip === bundle.id && (
                        <div className="absolute right-0 top-8 w-64 bg-gray-900 border border-white/20 rounded-xl p-4 shadow-xl z-20">
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
                  <p className="text-sm text-purple-300 mb-3">{bundle.description}</p>

                  <div className={`text-3xl font-black ${colors.price}`}>
                    ${bundle.price.toFixed(2)}
                  </div>
                  <p className="text-xs text-purple-400">One-time payment</p>

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
            <h2 className="text-2xl font-bold text-center mb-2">Customize Your Base Package</h2>
            <p className="text-center text-purple-300 text-sm mb-6">Add any services you want</p>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ADD_ONS.map((addOn) => {
                const isSelected = selectedAddOns.includes(addOn.id);
                return (
                  <button
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.id)}
                    className={`relative p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-purple-500/20 border-purple-400"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-purple-500 border-purple-500"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{addOn.name}</h4>
                    <p className="text-purple-300 text-xs font-bold">+${addOn.price.toFixed(2)}</p>
                  </button>
                );
              })}
              </div>

              {selectedAddOns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-purple-300 text-sm">
                    {selectedAddOns.length} add-on{selectedAddOns.length > 1 ? "s" : ""} selected
                  </span>
                  <span className="text-yellow-300 font-bold">
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
                  body: JSON.stringify({ bundle: selectedBundle, addOns: selectedAddOns, chartData: chartResult }),
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
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-4 rounded-full text-xl font-black hover:scale-105 transition-transform shadow-2xl"
          >
            Proceed to Payment — ${totalPrice.toFixed(2)}
          </button>
          <p className="text-purple-300 mt-3 text-sm">
            🔒 Secure checkout • Instant access • Yours forever
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
  }, [hasChartData, chartResult, selectedBundle, setIsPremium, navigate]);

  // If no chart data anywhere, redirect to input
  if (!hasChartData) {
    return <Navigate to="/input" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {generationStatus === 'starting' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-4xl font-black mb-4">Payment Successful!</h1>
            <p className="text-purple-300 text-lg">Preparing your personalized reading...</p>
          </>
        )}

        {generationStatus === 'generating' && (
          <>
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-4xl font-black mb-4">Creating Your Reading</h1>
            <p className="text-purple-300 text-lg mb-4">
              GPT is analyzing your unique cosmic blueprint...
            </p>

            {/* Live streaming preview */}
            {streamedText && (
              <div className="mt-4 bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto text-left">
                <p className="text-purple-200 text-sm whitespace-pre-wrap">
                  {streamedText.slice(0, 500)}{streamedText.length > 500 ? '...' : ''}
                </p>
              </div>
            )}
            <p className="text-purple-400 text-sm mt-4">
              {streamedText.length > 0 ? `${streamedText.length} characters generated...` : 'Starting generation...'}
            </p>

            {/* Social Media Links */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-purple-300 text-sm mb-3">Follow us on socials</p>
              <SocialLinks className="justify-center" iconClassName="w-5 h-5" />
            </div>
          </>
        )}

        {generationStatus === 'complete' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-4xl font-black mb-4">Your Reading is Ready!</h1>
            <p className="text-purple-300 text-lg">Taking you to your personalized analysis...</p>
          </>
        )}

        {generationStatus === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-4xl font-black mb-4">Generation Error</h1>
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/chart', { replace: true })}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Continue to Chart
            </button>
            <p className="text-purple-400 text-sm mt-4">
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
    yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", icon: "text-yellow-300", price: "text-yellow-300" },
    purple: { bg: "bg-purple-500/20", border: "border-purple-500/30", icon: "text-purple-300", price: "text-purple-300" },
    pink: { bg: "bg-pink-500/20", border: "border-pink-500/30", icon: "text-pink-300", price: "text-pink-300" },
  };
  const colors = colorClasses[bundle.color];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
        <div className="text-center mb-6">
          <IconComponent className={`w-16 h-16 ${colors.icon} mx-auto mb-4`} />
          <h2 className="text-3xl font-bold mb-2">Complete Your Purchase</h2>
          <p className="text-purple-300">One-time • No subscription</p>
        </div>

        {/* Order Summary */}
        <div className={`${colors.bg} rounded-2xl p-6 mb-6 border ${colors.border}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{bundle.name} Package</h3>
              <p className="text-sm text-purple-300">{bundle.description}</p>
            </div>
            <div className={`text-3xl font-black ${colors.price}`}>
              ${bundle.price.toFixed(2)}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <h4 className="text-sm font-semibold text-purple-200 mb-2">What's included:</h4>
            {bundle.features.filter(f => f.included).slice(0, 5).map((feature, idx) => (
              <div key={idx} className="flex items-start text-sm">
                <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-purple-100">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Order Total</span>
            <span className="text-2xl font-black text-white">${bundle.price.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => handlePayment(navigate)}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-4 rounded-xl text-lg font-black hover:scale-105 transition-transform shadow-xl mb-4"
        >
          Pay ${bundle.price.toFixed(2)} Now
        </button>

        <button
          onClick={() => navigate("/preview")}
          className="w-full text-purple-300 hover:text-white transition-colors text-sm"
        >
          ← Change package
        </button>

        <p className="text-xs text-center text-purple-400 mt-6">
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
  const isTabAccessible = (tabId) => {
    const tab = DASHBOARD_TABS.find(t => t.id === tabId);
    if (!tab) return false;
    if (tab.alwaysActive || !tab.requiresPurchase) return true;
    if (tab.comingSoon) return false; // Coming soon tabs are never accessible
    if (purchasedProducts.addOns.includes(tabId)) return true;
    if (tab.includedIn?.includes(purchasedProducts.bundle)) return true;
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

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chartResult,
          birthData,
          chartImage,
          analyses: analyses,
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

    setEmailStatus("sending");
    setEmailError("");

    try {
      const response = await fetch("/api/send-chart-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailAddress,
          chartResult,
          birthData,
          analyses: analyses,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Email Your Chart</h3>
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
                <p className="text-purple-300 text-sm mt-2">Check your inbox for your chart results.</p>
              </div>
            ) : (
              <>
                <p className="text-purple-300 text-sm mb-4">
                  We'll send your complete chart results including all planetary placements to your email.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    disabled={emailStatus === "sending"}
                  />
                  {emailError && (
                    <p className="text-red-400 text-sm mt-2">{emailError}</p>
                  )}
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={!emailAddress || emailStatus === "sending"}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
          <h1 className="text-5xl font-black mb-2">Your Complete Natal Chart</h1>
          <p className="text-xl text-purple-300 mb-4">
            {displayDate} • {birthData.time} • {birthData.location}
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Results
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfGenerating}
              className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm disabled:opacity-50"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
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
        <nav className="flex gap-1 overflow-x-auto bg-white/5 rounded-2xl p-2 mb-6 scrollbar-hide">
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
                    ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30'
                    : accessible
                      ? 'hover:bg-white/10 text-purple-200'
                      : 'text-purple-400 opacity-60 hover:opacity-80'
                }`}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TabIcon className="w-4 h-4" />
                )}
                <span>{tab.label}</span>
                {tab.comingSoon && (
                  <span className="text-[10px] bg-purple-500/30 px-1.5 py-0.5 rounded text-purple-200">Soon</span>
                )}
                {!accessible && !tab.comingSoon && <Lock className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </nav>

        {/* Upsell Modal */}
        {upsellTab && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
              {upsellTab.isComingSoon ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{upsellTab.label}</h3>
                    <p className="text-purple-300 mb-4">{upsellTab.description}</p>
                    <div className="bg-purple-500/20 rounded-xl p-4 mb-4">
                      <p className="text-yellow-300 font-semibold">Coming Soon!</p>
                      <p className="text-purple-300 text-sm mt-1">This feature is currently in development.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUpsellTab(null)}
                    className="w-full py-3 text-purple-300 hover:text-white transition-colors"
                  >
                    Got it
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-yellow-300" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
                    <p className="text-purple-300">Select the add-ons you'd like to unlock</p>
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
                              ? 'bg-yellow-500/20 border-yellow-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-yellow-500 border-yellow-500'
                              : 'border-white/30'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-gray-900" />}
                          </div>
                          <AddonIcon className={`w-5 h-5 ${isSelected ? 'text-yellow-300' : 'text-purple-300'}`} />
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{addon.label}</div>
                            <div className="text-xs text-purple-400">{addon.description?.slice(0, 50)}...</div>
                          </div>
                          <div className={`font-bold ${isSelected ? 'text-yellow-300' : 'text-purple-200'}`}>
                            ${addon.priceIfLocked?.toFixed(2)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Total and checkout */}
                  {selectedAddOns.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">{selectedAddOns.length} item{selectedAddOns.length > 1 ? 's' : ''} selected</span>
                        <span className="text-2xl font-bold text-yellow-300">
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
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:scale-105'
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
                    className="w-full py-3 text-purple-300 hover:text-white transition-colors"
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
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 mb-8 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Cosmic Journey!</h2>
              <p className="text-green-200">Your complete analysis is unlocked.</p>
              {chartResult.chartId && (
                <p className="text-green-300/70 text-xs mt-2">Chart ID: {chartResult.chartId}</p>
              )}
            </div>
          </>
        )}

        {/* Natal Chart Tab Content */}
        {activeTab === 'natal' && (
        <div className="space-y-8">
          {/* Chart Wheel */}
          <div id="natal-chart-container" className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-center mb-6">Your Natal Chart</h2>
            {(() => {
              const zodiacSigns = [
                { name: "Aries", glyph: "♈︎", element: "fire" },
                { name: "Taurus", glyph: "♉︎", element: "earth" },
                { name: "Gemini", glyph: "♊︎", element: "air" },
                { name: "Cancer", glyph: "♋︎", element: "water" },
                { name: "Leo", glyph: "♌︎", element: "fire" },
                { name: "Virgo", glyph: "♍︎", element: "earth" },
                { name: "Libra", glyph: "♎︎", element: "air" },
                { name: "Scorpio", glyph: "♏︎", element: "water" },
                { name: "Sagittarius", glyph: "♐︎", element: "fire" },
                { name: "Capricorn", glyph: "♑︎", element: "earth" },
                { name: "Aquarius", glyph: "♒︎", element: "air" },
                { name: "Pisces", glyph: "♓︎", element: "water" },
              ];
              const elementColors = { fire: "#ef4444", earth: "#22c55e", air: "#facc15", water: "#3b82f6" };
              const planetGlyphs = { sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄" };
              const risingIndex = zodiacSigns.findIndex((s) => s.name === chartResult.rising.sign);
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
                { key: "sun", ...chartResult.sun },
                { key: "moon", ...chartResult.moon },
                { key: "mercury", sign: chartResult.mercury.sign, degree: chartResult.mercury.degree || 8 },
                { key: "venus", sign: chartResult.venus.sign, degree: chartResult.venus.degree || 24 },
                { key: "mars", sign: chartResult.mars.sign, degree: chartResult.mars.degree || 12 },
              ];
              return (
                <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto mb-4">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      <filter id="glowChart" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <radialGradient id="centerGradientChart" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                        <stop offset="100%" stopColor="rgba(30, 27, 75, 0.8)" />
                      </radialGradient>
                    </defs>
                    <circle cx="200" cy="200" r="195" fill="rgba(30, 27, 75, 0.6)" />
                    <circle cx="200" cy="200" r="195" fill="none" stroke="rgba(253, 224, 71, 0.4)" strokeWidth="2" />
                    <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />
                    <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />
                    <circle cx="200" cy="200" r="80" fill="url(#centerGradientChart)" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" />
                    {zodiacSigns.map((sign, i) => {
                      const startAngle = i * 30 + risingOffset;
                      const midAngle = startAngle + 15;
                      const glyphPos = getPosition(midAngle, 177);
                      const lineStart = getPosition(startAngle, 160);
                      const lineEnd = getPosition(startAngle, 195);
                      return (
                        <g key={sign.name}>
                          <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                          <text x={glyphPos.x} y={glyphPos.y} textAnchor="middle" dominantBaseline="central" fill={elementColors[sign.element]} fontSize="16" fontWeight="bold">{sign.glyph}</text>
                        </g>
                      );
                    })}
                    {Array.from({ length: 12 }, (_, i) => {
                      const houseAngle = i * 30 + risingOffset + 15;
                      const housePos = getPosition(houseAngle, 140);
                      return <text key={`house-${i + 1}`} x={housePos.x} y={housePos.y} textAnchor="middle" dominantBaseline="central" fill="rgba(167, 139, 250, 0.7)" fontSize="11" fontWeight="500">{i + 1}</text>;
                    })}
                    {Array.from({ length: 12 }, (_, i) => {
                      const angle = i * 30 + risingOffset;
                      const innerPos = getPosition(angle, 80);
                      const outerPos = getPosition(angle, 120);
                      const isCardinal = i % 3 === 0;
                      return <line key={`cusp-${i}`} x1={innerPos.x} y1={innerPos.y} x2={outerPos.x} y2={outerPos.y} stroke={isCardinal ? "rgba(253, 224, 71, 0.5)" : "rgba(167, 139, 250, 0.25)"} strokeWidth={isCardinal ? "2" : "1"} />;
                    })}
                    <g><polygon points="5,200 25,192 25,208" fill="#facc15" filter="url(#glowChart)" /><text x="35" y="200" textAnchor="start" dominantBaseline="central" fill="#facc15" fontSize="10" fontWeight="bold">ASC</text></g>
                    {planets.map((planet) => {
                      const angle = getPlanetAngle(planet.sign, planet.degree);
                      const pos = getPosition(angle, 100);
                      const signData = zodiacSigns.find((s) => s.name === planet.sign);
                      const color = signData ? elementColors[signData.element] : "#fff";
                      return (
                        <g key={planet.key} filter="url(#glowChart)">
                          <circle cx={pos.x} cy={pos.y} r="14" fill="rgba(30, 27, 75, 0.9)" stroke={color} strokeWidth="1.5" />
                          <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill={color} fontSize="14" fontWeight="bold">{planetGlyphs[planet.key]}</text>
                        </g>
                      );
                    })}
                    <circle cx="200" cy="200" r="25" fill="rgba(139, 92, 246, 0.2)" stroke="rgba(236, 72, 153, 0.5)" strokeWidth="1" />
                    <text x="200" y="200" textAnchor="middle" dominantBaseline="central" fill="rgba(253, 224, 71, 0.8)" fontSize="10" fontWeight="bold">✦</text>
                  </svg>
                </div>
              );
            })()}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-purple-300">Fire</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-purple-300">Earth</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span><span className="text-purple-300">Air</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-purple-300">Water</span></div>
            </div>
          </div>

          {/* Big Three Summary (Compact) */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold mb-4">Your Big Three</h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-yellow-300">☉ {chartResult.sun.sign} Sun</h3>
                  <span className="text-sm text-purple-300">{chartResult.sun.degree}° {String(chartResult.sun.minutes || 0).padStart(2, '0')}' • {chartResult.sun.house}{houseSuffix(chartResult.sun.house)} house</span>
                </div>
                <p className="text-sm text-purple-200 mt-1">Core Identity</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-blue-300">☽ {chartResult.moon.sign} Moon</h3>
                  <span className="text-sm text-purple-300">{chartResult.moon.degree}° {String(chartResult.moon.minutes || 0).padStart(2, '0')}' • {chartResult.moon.house}{houseSuffix(chartResult.moon.house)} house</span>
                </div>
                <p className="text-sm text-purple-200 mt-1">Emotional Core</p>
              </div>
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-pink-300">↑ {chartResult.rising.sign} Rising</h3>
                  <span className="text-sm text-purple-300">{chartResult.rising.degree}° {String(chartResult.rising.minutes || 0).padStart(2, '0')}' Ascendant</span>
                </div>
                <p className="text-sm text-purple-200 mt-1">How Others See You</p>
              </div>
            </div>
          </div>

          {/* Planetary Placements */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Planetary Placements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Mercury", glyph: "☿", data: chartResult.mercury, desc: "Communication" },
                { name: "Venus", glyph: "♀", data: chartResult.venus, desc: "Love & Beauty" },
                { name: "Mars", glyph: "♂", data: chartResult.mars, desc: "Drive & Action" },
                { name: "Jupiter", glyph: "♃", data: chartResult.jupiter, desc: "Growth & Luck" },
                { name: "Saturn", glyph: "♄", data: chartResult.saturn, desc: "Structure" },
                { name: "Uranus", glyph: "♅", data: chartResult.uranus, desc: "Innovation" },
                { name: "Neptune", glyph: "♆", data: chartResult.neptune, desc: "Dreams" },
                { name: "Pluto", glyph: "♇", data: chartResult.pluto, desc: "Transformation" },
              ].map((planet) => (
                <div key={planet.name} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{planet.glyph}</span>
                    <span className="font-semibold">{planet.name}</span>
                  </div>
                  <p className="text-yellow-300 font-bold">{planet.data?.sign || "—"}</p>
                  <p className="text-purple-300 text-xs">{planet.data?.degree ?? "—"}° {String(planet.data?.minutes || 0).padStart(2, '0')}' • {planet.data?.house ? `${planet.data.house}${houseSuffix(planet.data.house)} house` : "—"}</p>
                  <p className="text-purple-400 text-xs mt-1">{planet.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Full Analysis */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-300">
                <Sparkles className="w-6 h-6 inline mr-2" />
                Your Personalized Reading
              </h2>
              {purchasedProducts.bundle && (
                <span className="text-xs text-purple-400">
                  {purchasedProducts.bundle.charAt(0).toUpperCase() + purchasedProducts.bundle.slice(1)} Package
                </span>
              )}
            </div>

            {analysisLoading || generatingTab === 'natal' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-yellow-300 animate-spin mb-4" />
                <p className="text-purple-300">Generating your reading...</p>
              </div>
            ) : currentAnalysis?.content ? (
              <div className="prose prose-invert max-w-none">
                {/* Simple markdown-like rendering */}
                {currentAnalysis.content.split('\n').map((line, idx) => {
                  // H2 headers (## Chapter title)
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={idx} className="text-xl font-bold text-yellow-300 mt-6 mb-3">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  // H3 headers (### Section title)
                  if (line.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="text-lg font-semibold text-purple-200 mt-4 mb-2">
                        {line.replace('### ', '')}
                      </h4>
                    );
                  }
                  // H4 headers (#### Subsection title)
                  if (line.startsWith('#### ')) {
                    return (
                      <h5 key={idx} className="text-base font-medium text-purple-300 mt-3 mb-1">
                        {line.replace('#### ', '')}
                      </h5>
                    );
                  }
                  // Bold text replacement and bullet points
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <p key={idx} className="text-purple-100 ml-4 mb-1">
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
                    <p key={idx} className="text-purple-100 leading-relaxed mb-3">
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-purple-300 mb-4">Your personalized AI reading hasn't been generated yet.</p>
                <button
                  onClick={() => generateAnalysisForTab('natal')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  Generate My Reading
                </button>
              </div>
            )}

            {currentAnalysis?.content && (
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <p className="text-purple-400 text-xs">
                  Generated {currentAnalysis.generatedAt ? new Date(currentAnalysis.generatedAt).toLocaleDateString() : 'recently'}
                </p>
                <button
                  onClick={regenerateAnalysis}
                  disabled={analysisLoading || generatingTab}
                  className="text-purple-300 hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
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
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-yellow-300">
                  <Sparkles className="w-6 h-6 inline mr-2" />
                  {DASHBOARD_TABS.find(t => t.id === activeTab)?.label} Analysis
                </h2>
              </div>

              {generatingTab === activeTab ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-yellow-300 animate-spin mb-4" />
                  <p className="text-purple-300">Generating your {DASHBOARD_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} analysis...</p>
                  {currentAnalysis?.content && (
                    <div className="mt-6 w-full prose prose-invert max-w-none opacity-70">
                      {currentAnalysis.content.split('\n').slice(0, 10).map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return <h3 key={idx} className="text-xl font-bold text-yellow-300 mt-4 mb-2">{line.replace('## ', '')}</h3>;
                        }
                        if (line.startsWith('### ')) {
                          return <h4 key={idx} className="text-lg font-semibold text-purple-200 mt-3 mb-1">{line.replace('### ', '')}</h4>;
                        }
                        if (line.startsWith('#### ')) {
                          return <h5 key={idx} className="text-base font-medium text-purple-300 mt-2 mb-1">{line.replace('#### ', '')}</h5>;
                        }
                        if (line.trim() === '') return <div key={idx} className="h-2" />;
                        return <p key={idx} className="text-purple-100 leading-relaxed mb-2">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      })}
                    </div>
                  )}
                </div>
              ) : currentAnalysis?.content ? (
                <div className="prose prose-invert max-w-none">
                  {currentAnalysis.content.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="text-xl font-bold text-yellow-300 mt-6 mb-3">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="text-lg font-semibold text-purple-200 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h5 key={idx} className="text-base font-medium text-purple-300 mt-3 mb-1">{line.replace('#### ', '')}</h5>;
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <p key={idx} className="text-purple-100 ml-4 mb-1">• {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                    }
                    if (line.trim() === '') return <div key={idx} className="h-2" />;
                    return <p key={idx} className="text-purple-100 leading-relaxed mb-3">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-purple-300 mb-4">Your {DASHBOARD_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} analysis hasn't been generated yet.</p>
                  <button
                    onClick={() => generateAnalysisForTab(activeTab)}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    Generate Analysis
                  </button>
                </div>
              )}

              {currentAnalysis?.content && !generatingTab && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <p className="text-purple-400 text-xs">
                    Generated {currentAnalysis.generatedAt ? new Date(currentAnalysis.generatedAt).toLocaleDateString() : 'recently'}
                  </p>
                  <button
                    onClick={regenerateAnalysis}
                    disabled={analysisLoading || generatingTab}
                    className="text-purple-300 hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
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
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30 mt-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Explore More</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {DASHBOARD_TABS.filter(tab => tab.id !== 'natal' && !isTabAccessible(tab.id) && !tab.comingSoon).slice(0, 3).map(tab => {
              const TabIcon = tab.icon;
              return (
                <div key={tab.id} className="bg-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TabIcon className="w-5 h-5 text-yellow-300" />
                    <h4 className="text-xl font-bold">{tab.label}</h4>
                  </div>
                  <p className="text-purple-200 text-sm mb-4">{tab.description?.slice(0, 60)}...</p>
                  <button
                    onClick={() => {
                      setSelectedAddOns([tab.id]);
                      setUpsellTab(tab);
                    }}
                    className="w-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg hover:from-yellow-400/30 hover:to-orange-500/30 transition-colors text-sm font-semibold text-yellow-300"
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
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
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
              className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
            >
              Calculate New Chart
            </button>
          </div>

          {/* Social Media & Copyright */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-center mb-4">
              <SocialLinks iconClassName="w-4 h-4" />
            </div>
            <p className="text-center text-sm text-purple-400">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center"
        >
          <X className="w-4 h-4 mr-2" />
          Zurück
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h1 className="text-3xl font-black mb-8">Impressum</h1>

          <div className="space-y-6 text-purple-200">
            <section>
              <h2 className="text-xl font-bold text-white mb-2">Angaben gemäß § 5 TMG</h2>
              <p>xxxx (Vor- und Nachname / Firmenname)</p>
              <p>xxxx (Straße und Hausnummer)</p>
              <p>xxxx (PLZ und Ort)</p>
              <p>xxxx (Land)</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">Kontakt</h2>
              <p>Telefon: xxxx</p>
              <p>E-Mail: xxxx</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">Umsatzsteuer-ID</h2>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
              <p>xxxx</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p>xxxx (Name)</p>
              <p>xxxx (Anschrift)</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="mt-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center"
        >
          <X className="w-4 h-4 mr-2" />
          Zurück
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h1 className="text-3xl font-black mb-8">Datenschutzerklärung</h1>

          <div className="space-y-6 text-purple-200">
            <section>
              <h2 className="text-xl font-bold text-white mb-2">1. Datenschutz auf einen Blick</h2>
              <h3 className="text-lg font-semibold text-white mt-4 mb-2">Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
                Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
                denen Sie persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">2. Verantwortliche Stelle</h2>
              <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
              <p className="mt-2">xxxx (Name)</p>
              <p>xxxx (Straße und Hausnummer)</p>
              <p>xxxx (PLZ und Ort)</p>
              <p>Telefon: xxxx</p>
              <p>E-Mail: xxxx</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">3. Datenerfassung auf dieser Website</h2>

              <h3 className="text-lg font-semibold text-white mt-4 mb-2">Welche Daten werden erfasst?</h3>
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

              <h3 className="text-lg font-semibold text-white mt-4 mb-2">Zweck der Datenverarbeitung</h3>
              <p>
                Ihre Daten werden ausschließlich zur Erstellung und Lieferung Ihres personalisierten
                Horoskops sowie zur Abwicklung der Zahlung verwendet.
              </p>

              <h3 className="text-lg font-semibold text-white mt-4 mb-2">Rechtsgrundlage</h3>
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">4. Speicherdauer</h2>
              <p>
                Ihre Daten werden nur so lange gespeichert, wie es für die Erfüllung des Vertragszwecks
                erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">5. Ihre Rechte</h2>
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
              <h2 className="text-xl font-bold text-white mb-2">6. Zahlungsdienstleister</h2>
              <p>
                Für die Abwicklung von Zahlungen nutzen wir den Dienst Stripe. Stripe verarbeitet Ihre
                Zahlungsdaten gemäß deren eigener Datenschutzerklärung:{" "}
                <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">
                  https://stripe.com/de/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">7. Hosting</h2>
              <p>
                Diese Website wird bei xxxx (Hosting-Anbieter) gehostet. Der Hoster erhebt in sog.
                Logfiles folgende Daten, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit der
                Anfrage, Zeitzonendifferenz zur Greenwich Mean Time, Inhalt der Anforderung, HTTP-Statuscode,
                übertragene Datenmenge, Website, von der die Anforderung kommt, und Informationen zu Browser
                und Betriebssystem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">8. Cookies</h2>
              <p>
                Diese Website verwendet technisch notwendige Cookies, um die Funktionsfähigkeit der
                Website zu gewährleisten. Diese Cookies werden nur für die Dauer Ihrer Sitzung gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-2">9. Beschwerderecht</h2>
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

  const calculateChart = async (navigate) => {
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

      console.log("Chart result:", chart);
      console.log("Chart ID:", chartId);

      setChartResult({ ...chart, chartId });
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
  );
}
