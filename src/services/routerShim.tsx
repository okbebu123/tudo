import React, { useState, useEffect, useMemo } from 'react';

const listeners = new Set<() => void>();
let historyPatched = false;

function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      // ignore
    }
  }
}

export function initHistoryInterceptor() {
  if (historyPatched || typeof window === 'undefined') return;
  historyPatched = true;

  const origPushState = window.history.pushState.bind(window.history);
  const origReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function (...args) {
    const res = origPushState(...args);
    notifyListeners();
    return res;
  };

  window.history.replaceState = function (...args) {
    const res = origReplaceState(...args);
    notifyListeners();
    return res;
  };

  window.addEventListener('popstate', () => {
    notifyListeners();
  });
}

export function navigateTo(href: string) {
  if (typeof window === 'undefined') return;
  window.history.pushState(null, '', href);
  notifyListeners();
}

export function usePathname(): string {
  initHistoryInterceptor();
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  useEffect(() => {
    const update = () => setPathname(window.location.pathname || '/');
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return pathname;
}

export function useSearchParams(): URLSearchParams {
  initHistoryInterceptor();
  const [search, setSearch] = useState(() =>
    typeof window !== 'undefined' ? window.location.search || '' : ''
  );

  useEffect(() => {
    const update = () => setSearch(window.location.search || '');
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useRouter() {
  return useMemo(
    () => ({
      push: (href: string) => navigateTo(href),
      replace: (href: string) => {
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', href);
        }
      },
      back: () => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      },
      forward: () => {
        if (typeof window !== 'undefined') {
          window.history.forward();
        }
      },
      refresh: () => notifyListeners(),
      prefetch: async () => {},
    }),
    []
  );
}

export function useParams() {
  return {};
}

export const NextLinkShim = React.forwardRef<HTMLAnchorElement, any>(function NextLinkShim(
  { href, onClick, children, prefetch: _prefetch, scroll: _scroll, replace: _replace, ...rest },
  ref
) {
  const resolvedHref = typeof href === 'string' ? href : href?.pathname || '/';
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey &&
      resolvedHref.startsWith('/') &&
      !rest.target
    ) {
      e.preventDefault();
      navigateTo(resolvedHref);
    }
  };
  return (
    <a ref={ref} href={resolvedHref} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
});

export const NextImageShim = React.forwardRef<HTMLImageElement, any>(function NextImageShim(
  { src, alt = '', width, height, fill, priority: _priority, quality: _quality, unoptimized: _unoptimized, style, onError, ...rest },
  ref
) {
  let resolvedSrc = typeof src === 'string' ? src : src?.src || '/miushare-logo.svg';
  if (
    resolvedSrc.startsWith('/tools/') ||
    resolvedSrc.startsWith('/thumbs/') ||
    resolvedSrc.startsWith('/uploads/')
  ) {
    resolvedSrc = `https://miushare.com${resolvedSrc}`;
  }
  const mergedStyle = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : style;
  return (
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      style={mergedStyle}
      onError={(e) => {
        if (onError) onError(e);
        if (e.currentTarget.src && !e.currentTarget.src.endsWith('/miushare-logo.svg')) {
          e.currentTarget.src = '/miushare-logo.svg';
        }
      }}
      {...rest}
    />
  );
});
