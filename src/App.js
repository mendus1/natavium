import React, { useState } from "react";
import { Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import { calculateNatalChartFromLocal } from "./ephemeris";
import {
  Sparkles,
  Lock,
  Share2,
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
} from "lucide-react";

export default function Natavium() {
  const [birthData, setBirthData] = useState({
    date: "",
    time: "",
    hour: "",
    minute: "",
    period: "AM",
    location: "",
  });
  const [calcError, setCalcError] = useState(null);
  const [chartResult, setChartResult] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const handleInputChange = (field, value) => {
    setBirthData((prev) => {
      const updated = { ...prev, [field]: value };
      // Update the combined time string when hour/minute/period changes
      if (field === "hour" || field === "minute" || field === "period") {
        const h = field === "hour" ? value : prev.hour;
        const m = field === "minute" ? value : prev.minute;
        const p = field === "period" ? value : prev.period;
        if (h && m) {
          updated.time = `${h}:${m} ${p}`;
        }
      }
      return updated;
    });
  };

  // Convert 12-hour time to 24-hour decimal format for Swiss Ephemeris
  // Swiss Ephemeris expects time as decimal hours (e.g., 14.5 for 2:30 PM)
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

    // Return as decimal hours for Swiss Ephemeris
    const decimalTime = hour24 + minute / 60;
    return {
      hour24,
      minute,
      decimalTime: parseFloat(decimalTime.toFixed(6)),
      formatted: `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    };
  };

  const calculateChart = async (navigate) => {
    navigate("/calculating");
    setCalcError(null);

    try {
      // Parse birth date
      const [year, month, day] = birthData.date.split("-").map(Number);

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

      console.log("Chart result:", chart);

      setChartResult(chart);
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
                    Unlike template-based apps, Natavium uses <strong>Claude AI</strong> to actually
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
                    Expand your understanding (available after natal chart purchase)
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold">Compatibility</h4>
                        <span className="text-xl font-bold text-purple-300">$2.99</span>
                      </div>
                      <p className="text-sm text-purple-200">
                        Compare your chart with partner or friend. Shows harmony and growth areas.
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

                    <div className="bg-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold">Solar Return</h4>
                        <span className="text-xl font-bold text-purple-300">$3.99</span>
                      </div>
                      <p className="text-sm text-purple-200">
                        Your year ahead forecast. Birthday prediction for coming year.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black">Natavium Plus</h3>
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
                Claude AI synthesizes your placements - real analysis, not templates.
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
        </div>
      </div>
    );
  }

  // =========================
  // Input Form
  // =========================
  function InputPage() {
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
              <input
                type="date"
                value={birthData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
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
                disabled={!birthData.date || !birthData.hour || !birthData.minute || !birthData.location}
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
  function PreviewPage() {
    const navigate = useNavigate();

    if (!chartResult) {
      return <Navigate to="/input" replace />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-2">Your Natal Chart</h1>
            <p className="text-xl text-purple-300">
              {birthData.date} • {birthData.time} • {birthData.location}
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
                {chartResult.sun.degree}° in {chartResult.sun.house}
                {houseSuffix(chartResult.sun.house)} house
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
              <Moon className="w-10 h-10 text-blue-300 mb-3" />
              <div className="text-2xl font-bold mb-1">{chartResult.moon.sign} Moon</div>
              <div className="text-sm text-purple-200">Emotional Core</div>
              <div className="text-xs text-purple-300 mt-2">
                {chartResult.moon.degree}° in {chartResult.moon.house}
                {houseSuffix(chartResult.moon.house)} house
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 border border-pink-500/30">
              <Star className="w-10 h-10 text-pink-300 mb-3" />
              <div className="text-2xl font-bold mb-1">{chartResult.rising.sign} Rising</div>
              <div className="text-sm text-purple-200">How Others See You</div>
              <div className="text-xs text-purple-300 mt-2">{chartResult.rising.degree}° Ascendant</div>
            </div>
          </div>

          {/* Preview text with paywall */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20">
            <h2 className="text-3xl font-bold mb-6">Your Cosmic Blueprint</h2>

            <p className="text-lg leading-relaxed mb-4">
              Your {chartResult.sun.sign} Sun reveals a core identity focused on stability, beauty,
              and building lasting value. You embody groundedness and commitment to what endures.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Combined with your {chartResult.moon.sign} Moon, your emotional world is characterized
              by analytical precision. You process feelings through analysis and find security in
              competence.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Your {chartResult.rising.sign} Rising shapes how others see you — nurturing, empathetic,
              protective. People instinctively feel safe with you...
            </p>

            <div className="relative mt-8">
              {/* Paywall overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/90 to-purple-900 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl pt-20">
                <div className="text-center p-6">
                  <Lock className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Unlock Complete Analysis</h3>

                  <ul className="text-left inline-block mb-6 space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-yellow-300 mr-2" />
                      <span>3000+ word AI reading</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-yellow-300 mr-2" />
                      <span>All 10 planets analyzed</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-yellow-300 mr-2" />
                      <span>2026 forecast included</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-yellow-300 mr-2" />
                      <span>Downloadable PDF</span>
                    </li>
                  </ul>

                  <div className="mb-4">
                    <div className="text-5xl font-black text-yellow-300 mb-1">$4.99</div>
                    <div className="text-purple-200 text-sm">One-time • Yours forever</div>
                  </div>

                  <button
                    onClick={() => navigate("/payment")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-3 rounded-full text-lg font-black hover:scale-105 transition-transform shadow-2xl"
                  >
                    Unlock Now
                  </button>
                </div>
              </div>

              {/* Blurred premium preview */}
              <div className="blur-sm select-none opacity-50">
                <h3 className="text-xl font-bold mb-3 mt-6">
                  Mercury in {chartResult.mercury.sign}
                </h3>
                <p className="mb-4">Your communication style is methodical and thorough...</p>

                <h3 className="text-xl font-bold mb-3">Venus in {chartResult.venus.sign}</h3>
                <p className="mb-4">In love, you need mental stimulation and variety...</p>

                <h3 className="text-xl font-bold mb-3">Mars in {chartResult.mars.sign}</h3>
                <p className="mb-4">Your drive is expressed protectively...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // Payment
  // =========================
  function PaymentPage() {
    const navigate = useNavigate();

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <Star className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Unlock Complete Chart</h2>
            <p className="text-purple-300">One-time • No subscription</p>
          </div>

          <div className="bg-purple-500/20 rounded-2xl p-6 mb-6 border border-purple-500/30">
            <div className="text-center mb-4">
              <div className="text-5xl font-black text-yellow-300">$4.99</div>
              <div className="text-sm text-purple-300">One-time purchase</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0" />
                <span>Complete 3000+ word analysis</span>
              </div>
              <div className="flex items-start">
                <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0" />
                <span>All planetary placements</span>
              </div>
              <div className="flex items-start">
                <Check className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0" />
                <span>Chart wheel + PDF</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handlePayment(navigate)}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-4 rounded-xl text-lg font-black hover:scale-105 transition-transform shadow-xl mb-4"
          >
            Complete Purchase
          </button>

          <button
            onClick={() => navigate("/preview")}
            className="w-full text-purple-300 hover:text-white transition-colors text-sm"
          >
            ← Back to preview
          </button>

          <p className="text-xs text-center text-purple-400 mt-6">🔒 Secure payment via Stripe</p>
        </div>
      </div>
    );
  }

  // =========================
  // Full Unlocked
  // =========================
  function ChartPage() {
    const navigate = useNavigate();

    if (!isPremium || !chartResult) {
      return <Navigate to="/preview" replace />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-2">Your Complete Natal Chart</h1>
            <p className="text-xl text-purple-300 mb-4">
              {birthData.date} • {birthData.time} • {birthData.location}
            </p>

            <div className="flex justify-center gap-4">
              <button className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 mb-8 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Your Cosmic Journey!</h2>
            <p className="text-green-200">Your complete analysis is unlocked.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-6">Your Cosmic Blueprint</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-yellow-300 mb-3">
                  ☀️ Sun in {chartResult.sun.sign}
                </h3>
                <p className="text-lg leading-relaxed">
                  Your {chartResult.sun.sign} Sun reveals core identity focused on stability and
                  building lasting value. Grounded, methodical approach to life.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-blue-300 mb-3">
                  🌙 Moon in {chartResult.moon.sign}
                </h3>
                <p className="text-lg leading-relaxed">
                  Your {chartResult.moon.sign} Moon governs emotional landscape through analysis and
                  competence.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-pink-300 mb-3">
                  ⬆️ {chartResult.rising.sign} Rising
                </h3>
                <p className="text-lg leading-relaxed">
                  Ascendant shapes perception — nurturing, empathetic, protective presence.
                </p>
              </div>

              <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-yellow-300 mb-4">🔮 2026 Forecast</h3>
                <p className="text-lg leading-relaxed">
                  Jupiter transiting your 1st house brings expansion and opportunity. Natural warmth
                  amplified.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold mb-6 text-center">Add More Services</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-bold mb-2">Compatibility</h4>
                <p className="text-purple-200 text-sm mb-4">Compare with partner - $2.99</p>
                <button className="w-full bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm font-semibold">
                  Add Service
                </button>
              </div>

              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-bold mb-2">Vedic Chart</h4>
                <p className="text-purple-200 text-sm mb-4">Eastern perspective - $2.99</p>
                <button className="w-full bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm font-semibold">
                  Add Service
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // Routes
  // =========================
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/input" element={<InputPage />} />
      <Route path="/calculating" element={<CalculatingPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/info/:page" element={<InfoPage />} />
      <Route path="/info" element={<InfoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
