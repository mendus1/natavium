import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Download, ExternalLink, Loader2, LogOut, Mail, Star } from 'lucide-react';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [email, setEmail] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [claimingOrders, setClaimingOrders] = useState(false);

  const [pdfOrderId, setPdfOrderId] = useState(null);
  const [openOrderId, setOpenOrderId] = useState(null);

  const accessToken = useMemo(() => session?.access_token || null, [session]);

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

  async function logEvent(eventName, props = {}) {
    try {
      const sessionId = getOrCreateSessionId();

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

  function handleBack() {
    // Prefer true browser back navigation so we return to /chart when coming from an analysis.
    // If there is no usable history entry, fall back to /chart if we have an order/chart cached.
    const hasCachedChart = !!localStorage.getItem('natavium_chartResult');
    const hasCachedOrder = !!localStorage.getItem('natavium_orderId');

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (hasCachedChart || hasCachedOrder) {
      navigate('/chart');
      return;
    }

    navigate('/');
  }

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.slice(1));
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      setLoginMessage(errorDescription || 'Sign-in link is invalid or has expired. Please request a new link.');
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  async function openReport(orderId) {
    if (!orderId || openOrderId) return;
    setOpenOrderId(orderId);

    // Clear cached report state up-front so we never show a previous order while loading a new one.
    // We also set orderId immediately so subsequent calls (like /chart fetching) align to this selection.
    localStorage.setItem('natavium_orderId', String(orderId));
    localStorage.removeItem('natavium_analyses');
    localStorage.removeItem('natavium_analysis');
    localStorage.removeItem('natavium_chartResult');
    localStorage.removeItem('natavium_purchasedProducts');

    try {
      const res = await apiFetch(`/api/get-order?id=${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load report');
      }

      if (data?.chartData) {
        const zodiacSystem = data?.zodiacSystem || data?.chartData?.zodiacType || 'tropical';
        const chartToStore = {
          ...(data.chartData || {}),
          zodiacType: zodiacSystem,
        };
        localStorage.setItem('natavium_chartResult', JSON.stringify(chartToStore));

        const nextBirthData = chartToStore?.meta?.birthData;
        if (nextBirthData && typeof nextBirthData === 'object') {
          localStorage.setItem('natavium_birthData', JSON.stringify(nextBirthData));
        }
      }

      if (data?.analyses) {
        const zodiacSystem = data?.zodiacSystem || data?.chartData?.zodiacType || 'tropical';
        const normalized = {};
        Object.entries(data.analyses || {}).forEach(([key, value]) => {
          if (key.startsWith(`${zodiacSystem}_`)) {
            normalized[key.slice(`${zodiacSystem}_`.length)] = value;
          }
        });
        const analysesToStore = Object.keys(normalized).length > 0 ? normalized : (data.analyses || {});
        localStorage.setItem('natavium_analyses', JSON.stringify(analysesToStore));

        // Clear legacy single-analysis cache to avoid cross-order bleed
        localStorage.removeItem('natavium_analysis');
      } else {
        // Ensure we overwrite any prior order's analyses even if this order has none.
        localStorage.setItem('natavium_analyses', JSON.stringify({}));
        localStorage.removeItem('natavium_analysis');
      }

      if (data?.purchasedAddons || data?.productType) {
        const purchasedProducts = {
          bundle: data.productType,
          addOns: data.purchasedAddons || [],
        };
        localStorage.setItem('natavium_purchasedProducts', JSON.stringify(purchasedProducts));
      }

      // Force a full reload so App state (chartResult/birthData) rehydrates from localStorage.
      // Without a reload, /chart can continue rendering the previous order's in-memory state.
      window.location.replace('/chart');
    } finally {
      setOpenOrderId(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session || null);
      setLoadingSession(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function sendMagicLink() {
    if (!email) return;

    setSendingLink(true);
    setLoginMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/reports`,
        },
      });

      if (error) {
        setLoginMessage(error.message);
      } else {
        setLoginMessage('Check your email for a sign-in link.');
      }
    } finally {
      setSendingLink(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOrders([]);

    localStorage.removeItem('natavium_orderId');
    localStorage.removeItem('natavium_claimToken');
    localStorage.removeItem('natavium_sessionId');
  }

  async function apiFetch(path, init = {}) {
    const headers = {
      ...(init.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    return fetch(path, {
      ...init,
      headers,
    });
  }

  async function claimAllEmailOrders() {
    if (!accessToken) return;
    if (claimingOrders) return;

    setClaimingOrders(true);
    try {
      const res = await apiFetch('/api/claim-email-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        // Once an order is bound to a Supabase user, we no longer need the claim token on this device.
        localStorage.removeItem('natavium_claimToken');
      }
    } finally {
      setClaimingOrders(false);
    }
  }

  async function claimMostRecentPurchaseIfPresent() {
    const orderId = localStorage.getItem('natavium_orderId');

    if (!orderId) return;

    // Intentionally do NOT use claimToken for auto-claim.
    // Using claimToken here can accidentally bind an order to the wrong signed-in user on shared devices.
    const res = await apiFetch('/api/claim-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (res.ok) {
      // Once an order is bound to a Supabase user, we no longer need the claim token on this device.
      localStorage.removeItem('natavium_claimToken');
    }
  }

  async function loadOrders() {
    setLoadingOrders(true);
    setOrdersError('');

    try {
      const res = await apiFetch('/api/list-orders');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOrdersError(data?.error || 'Failed to load orders');
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e) {
      setOrdersError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    if (loadingSession) return;
    if (!accessToken) return;

    (async () => {
      await claimAllEmailOrders();
      await claimMostRecentPurchaseIfPresent();
      await loadOrders();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSession, accessToken]);

  async function downloadPdf(orderId) {
    if (!orderId || pdfOrderId) return;

    setPdfOrderId(orderId);

    try {
      const res = await apiFetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to generate PDF');
      }

      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename || 'natavium-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setPdfOrderId(null);
    }
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen text-white p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 t-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Star className="w-5 h-5 icon-gold" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold gold-gradient-text">My Reports</h1>
              <p className="t-text-muted text-sm">Access your saved purchases across devices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-[#12142A]/80 border border-white/10 hover:bg-[#12142A] hover:border-white/20 transition-all text-sm"
            >
              Back
            </button>
            {accessToken && (
              <button
                onClick={async () => {
                  await claimAllEmailOrders();
                  await loadOrders();
                }}
                disabled={claimingOrders || loadingOrders}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm disabled:opacity-50"
              >
                {claimingOrders ? 'Claiming…' : 'Claim purchases'}
              </button>
            )}
            {accessToken && (
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            )}
          </div>
        </div>

        {!accessToken ? (
          <div className="card-solid rounded-2xl p-6 max-w-lg">
            <h2 className="text-xl font-semibold mb-2">Sign in to view your reports</h2>
            <p className="t-text-muted text-sm mb-4">
              We’ll email you a secure magic link. No password.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-[#12142A]/80 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D6B35A] focus:border-transparent"
                disabled={sendingLink}
              />
              <button
                onClick={sendMagicLink}
                disabled={!email || sendingLink}
                className="gold-gradient-btn px-5 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send link
              </button>
            </div>

            {loginMessage && (
              <div className="mt-4 text-sm t-text-muted">{loginMessage}</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card-solid rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm t-text-muted">Ongoing Reports</div>
                  <h3 className="text-xl font-semibold mt-1">Weekly Astro Weather</h3>
                  <p className="t-text-muted text-sm mt-2">A weekly forecast tailored to your natal chart. Coming Soon.</p>
                </div>
                <span className="text-xs bg-[#69D2FF]/20 px-2 py-1 rounded text-[#69D2FF] border border-[#69D2FF]/20">Coming Soon</span>
              </div>
              <button
                onClick={async () => {
                  await logEvent('ongoing_teaser_clicked', { surface: 'reports', product: 'weekly_astro_weather' });
                  navigate('/ongoing');
                }}
                className="mt-4 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
              >
                View sample
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your purchases</h2>
              <button
                onClick={loadOrders}
                disabled={loadingOrders}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm disabled:opacity-50"
              >
                {loadingOrders ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {ordersError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-sm">
                {ordersError}
              </div>
            )}

            {loadingOrders ? (
              <div className="card-solid rounded-2xl p-6 t-text-muted flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your reports…
              </div>
            ) : orders.length === 0 ? (
              <div className="card-solid rounded-2xl p-6">
                <p className="t-text-muted">No purchases found yet.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 gold-gradient-btn px-5 py-3 rounded-xl font-bold"
                >
                  Create a chart
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((o) => (
                  <div key={o.id} className="card-solid rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm t-text-muted">Order</div>
                        <div className="font-mono text-xs text-white/70 break-all">{o.id}</div>
                        {o.created_at && (
                          <div className="mt-2 text-sm">
                            <span className="t-text-muted">Purchased:</span>{' '}
                            <span className="text-white/90">
                              {new Date(o.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <div className="mt-3 text-sm">
                          <span className="t-text-muted">Package:</span>{' '}
                          <span className="text-white/90">{o.product_type}</span>
                        </div>

                        {(() => {
                          const birthData = o?.chart_data?.meta?.birthData;
                          const relationship = birthData?.subjectRelationship;
                          const initials = birthData?.subjectInitials;
                          if (!relationship && !initials) return null;
                          return (
                            <div className="mt-2 text-sm">
                              <span className="t-text-muted">Subject:</span>{' '}
                              <span className="text-white/90">
                                {(relationship || 'self').toUpperCase()}{initials ? ` • ${initials}` : ''}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-xs px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-200">
                        {o.payment_status}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => openReport(o.id)}
                        disabled={openOrderId === o.id}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {openOrderId === o.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Opening…
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 icon-gold" />
                            Open report
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => downloadPdf(o.id)}
                        disabled={pdfOrderId === o.id}
                        className="flex-1 px-4 py-2 rounded-xl bg-[#12142A]/80 border border-white/10 hover:bg-[#12142A] hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {pdfOrderId === o.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 icon-gold" />
                            Download PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
