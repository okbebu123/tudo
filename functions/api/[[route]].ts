import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { queryCatalog, getUnlockedVaultPayload } from '../../src/services/catalogEngine';

const app = new Hono().basePath('/api');

app.get('/catalog', (c) => {
  const query = c.req.query();
  const data = queryCatalog(query);
  return c.json(data);
});

app.get('/vault/status', (c) => {
  return c.json({
    ok: true,
    status: {
      date: new Date().toISOString().slice(0, 10),
      used: 0,
      limit: 9999,
      baseLimit: 9999,
      bonusLimit: 9999,
      maxLimit: 9999,
      remaining: 9999,
      botUnlocked: true,
      challenge: 'LOCAL_UNLOCKED',
      claimedKeys: [],
      actionToken: 'edge_unlimited_token',
      turnstileRequired: false,
    },
  });
});

app.post('/vault/claim', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const kind = body.kind || 'vip';
  const id = body.id || '';
  const payload = getUnlockedVaultPayload(kind, id);
  return c.json({
    allowed: true,
    payload,
    status: {
      used: 0,
      remaining: 9999,
      limit: 9999,
      botUnlocked: true,
      challenge: 'LOCAL_UNLOCKED',
    },
  });
});

app.get('/vault/flow/:code', (c) => {
  const code = c.req.param('code');
  const payload = getUnlockedVaultPayload('flow', code);
  return c.json({
    ok: true,
    unlocked: true,
    flow: payload.flowData,
    status: {
      used: 0,
      remaining: 9999,
      limit: 9999,
      botUnlocked: true,
      challenge: 'LOCAL_UNLOCKED',
    },
  });
});

app.post('/analytics/track', (c) => {
  return c.json({ ok: true });
});

app.get('/images/placeholder', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none">
    <rect width="600" height="800" fill="#070B14"/>
    <circle cx="300" cy="360" r="90" fill="#00E599" fill-opacity="0.12"/>
    <path d="M265 385V335L290 365L300 350L310 365L335 335V385" stroke="#00E599" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="300" y="460" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="18" font-weight="bold">TỦ ĐỒ AI PREVIEW</text>
  </svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});

export const onRequest = handle(app);
