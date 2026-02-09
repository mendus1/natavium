import { supabaseAdmin, getUserFromRequest } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { eventName, props = {}, sessionId = null } = req.body || {};

    if (!eventName || typeof eventName !== 'string') {
      return res.status(400).json({ error: 'Missing eventName' });
    }

    const user = await getUserFromRequest(req);

    const { error } = await supabaseAdmin
      .from('events')
      .insert({
        event_name: eventName,
        props,
        session_id: sessionId,
        user_id: user?.id || null,
      });

    if (error) {
      const msg = String(error?.message || '');
      if (msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('events')) {
        return res.status(200).json({ ok: true, stored: false });
      }
      return res.status(200).json({ ok: true, stored: false });
    }

    return res.status(200).json({ ok: true, stored: true });
  } catch (err) {
    return res.status(200).json({ ok: true, stored: false });
  }
}
