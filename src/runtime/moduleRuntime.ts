import * as React from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as routerShim from '../services/routerShim';
import * as catalogService from '../services/catalogService';
import * as vaultService from '../services/vaultService';
import { UnlockedPromptBox } from '../components/UnlockedPromptBox';

type FactoryEntry = {
  fn: (helper: any, mod: any, exports: any) => void;
  groupIds: number[];
};

const factories = new Map<number, FactoryEntry>();
const cache = new Map<number, any>();
const overrides = new Map<number, any>();

// Register React & JSX Runtime
const reactModule: any = { ...React, default: React };
overrides.set(71645, reactModule);
overrides.set(43476, {
  jsx: (ReactJSXRuntime as any).jsx,
  jsxs: (ReactJSXRuntime as any).jsxs,
  Fragment: React.Fragment,
});
overrides.set(47167, { default: { env: {} }, env: {} });

// Register Router & Next.js Component Shims
overrides.set(18566, {
  usePathname: routerShim.usePathname,
  useSearchParams: routerShim.useSearchParams,
  useRouter: routerShim.useRouter,
  useParams: routerShim.useParams,
});
overrides.set(22016, {
  default: routerShim.NextLinkShim,
  useLinkStatus: () => ({ pending: false }),
});
overrides.set(57688, {
  default: routerShim.NextImageShim,
});

// Register Local + Edge Catalog & Unlimited Vault Overrides
overrides.set(90270, {
  fetchCatalogApi: catalogService.fetchCatalogApi,
  useServerPaginatedCatalog: catalogService.useServerPaginatedCatalog,
});
overrides.set(18915, {
  ...vaultService,
});
overrides.set(25880, {
  RedactedPromptBox: UnlockedPromptBox,
});
// Hide TeleBot banner & Zalo floating button
overrides.set(42083, {
  PostCopyTeleBotBanner: () => null,
});
overrides.set(6375, {
  ZaloFloatingButton: () => null,
});
overrides.set(34016, {
  DailyQuotaModal: () => null,
});

export function requireTurbopackModule(id: number): any {
  if (overrides.has(id)) {
    return overrides.get(id);
  }
  if (cache.has(id)) {
    return cache.get(id);
  }
  const entry = factories.get(id);
  if (!entry) {
    console.warn(`[moduleRuntime] Missing module ID: ${id}`);
    return {};
  }

  const { fn, groupIds } = entry;
  for (const gid of groupIds) {
    if (!cache.has(gid)) {
      cache.set(gid, {});
    }
  }
  const primaryMod = { exports: cache.get(id) };

  const helper = {
    i(depId: number) {
      return requireTurbopackModule(depId);
    },
    r(depId: number) {
      return requireTurbopackModule(depId);
    },
    s(pairs: any[], targetId?: number) {
      const targetObj =
        targetId !== undefined
          ? cache.get(targetId) ||
            (() => {
              const o = {};
              cache.set(targetId, o);
              return o;
            })()
          : primaryMod.exports;

      for (let i = 0; i < pairs.length; i += 3) {
        const name = pairs[i];
        const flag = pairs[i + 1];
        const getterOrVal = pairs[i + 2];
        if (flag === 1 && typeof getterOrVal === 'function') {
          Object.defineProperty(targetObj, name, {
            enumerable: true,
            configurable: true,
            get: getterOrVal,
          });
        } else {
          targetObj[name] = getterOrVal;
        }
      }

      if (targetId === undefined) {
        for (const gid of groupIds) {
          cache.set(gid, targetObj);
        }
      }
    },
  };

  fn(helper, primaryMod, primaryMod.exports);

  if (primaryMod.exports !== cache.get(id)) {
    if (
      typeof primaryMod.exports === 'object' &&
      primaryMod.exports !== null &&
      !('default' in primaryMod.exports)
    ) {
      primaryMod.exports.default = primaryMod.exports;
    }
    cache.set(id, primaryMod.exports);
  }

  return overrides.get(id) || cache.get(id);
}

let bundlesLoadedPromise: Promise<void> | null = null;

export function loadApplicationBundles(): Promise<void> {
  if (bundlesLoadedPromise) return bundlesLoadedPromise;

  (globalThis as any).TURBOPACK = {
    push(arr: any[]) {
      let pendingIds: number[] = [];
      for (let i = 1; i < arr.length; i++) {
        const item = arr[i];
        if (typeof item === 'number') {
          pendingIds.push(item);
        } else if (typeof item === 'function') {
          const ids = [...pendingIds];
          pendingIds = [];
          for (const id of ids) {
            factories.set(id, { fn: item, groupIds: ids });
          }
        } else if (typeof item === 'object' && item !== null) {
          pendingIds = [];
        }
      }
    },
  };

  const version = 'tudoai2';
  const chunkFiles = [
    `/bundles/2corl6wyj4669.js?v=${version}`,
    `/bundles/01xbni-dud9wb.js?v=${version}`,
    `/bundles/1pup0ovlcnfgx.js?v=${version}`,
    `/bundles/0r4ierfx5rpbu.js?v=${version}`,
    `/bundles/22u7wrxhhs4bs.js?v=${version}`,
    `/bundles/1tzgyb1aytsxt.js?v=${version}`,
  ];

  bundlesLoadedPromise = Promise.all(
    chunkFiles.map((url) =>
      fetch(url)
        .then((r) => r.text())
        .then((code) => {
          new Function(code)();
        })
    )
  ).then(() => {});

  return bundlesLoadedPromise;
}
