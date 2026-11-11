import { queryCatalog, getUnlockedVaultPayload } from './catalogEngine';

let interceptorInstalled = false;

export function installClientApiInterceptor() {
  if (interceptorInstalled || typeof window === 'undefined') return;
  interceptorInstalled = true;

  const origFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    try {
      const parsed = new URL(urlStr, window.location.origin);
      if (parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/')) {
        if (parsed.pathname === '/api/analytics/track') {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (parsed.pathname === '/api/vault/status') {
          return new Response(
            JSON.stringify({
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
                actionToken: 'local_unlimited',
                turnstileRequired: false,
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (parsed.pathname.startsWith('/api/vault/flow/')) {
          const code = decodeURIComponent(parsed.pathname.replace('/api/vault/flow/', ''));
          const payload = getUnlockedVaultPayload('flow', code);
          return new Response(
            JSON.stringify({
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
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (parsed.pathname === '/api/vault/claim') {
          const bodyText = typeof init?.body === 'string' ? init.body : '{}';
          const body = JSON.parse(bodyText || '{}');
          const payload = getUnlockedVaultPayload(body.kind || 'vip', body.id || '');
          return new Response(
            JSON.stringify({
              allowed: true,
              payload,
              status: {
                used: 0,
                remaining: 9999,
                limit: 9999,
                botUnlocked: true,
                challenge: 'LOCAL_UNLOCKED',
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (parsed.pathname === '/api/catalog') {
          const params = Object.fromEntries(parsed.searchParams.entries());
          const data = queryCatalog(params);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch {
      // fall through
    }

    return origFetch(input, init);
  };
}
