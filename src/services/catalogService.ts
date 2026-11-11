import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { queryCatalog } from './catalogEngine';

export async function fetchCatalogApi(
  params: Record<string, any>,
  _options?: { signal?: AbortSignal; bypassCache?: boolean }
) {
  return queryCatalog(params);
}

export function useServerPaginatedCatalog(
  kind: string,
  filterObj: Record<string, any> = {},
  limit = 40
) {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [facets, setFacets] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef<boolean>(false);

  const filterKey = useMemo(
    () =>
      JSON.stringify(
        Object.entries(filterObj)
          .filter(([, v]) => v != null && v !== '')
          .sort(([a], [b]) => a.localeCompare(b))
      ),
    [filterObj]
  );

  const normalizedFilters = useMemo(() => Object.fromEntries(JSON.parse(filterKey)), [filterKey]);

  useEffect(() => {
    const onCustomUpdate = () => setRefreshTick((t) => t + 1);
    window.addEventListener('khoshare-catalog-updated', onCustomUpdate);
    return () => window.removeEventListener('khoshare-catalog-updated', onCustomUpdate);
  }, []);

  useEffect(() => {
    setLoading(true);
    const res: any = queryCatalog({ kind, ...normalizedFilters, page: 1, limit });
    if (res) {
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPage(1);
      setHasMore(!!res.hasMore);
      if (res.facets) setFacets(res.facets);
    }
    setLoading(false);
  }, [kind, normalizedFilters, limit, refreshTick]);

  const loadNextPage = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    const res: any = queryCatalog({ kind, ...normalizedFilters, page: nextPage, limit });
    if (res && Array.isArray(res.items)) {
      setItems((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(!!res.hasMore);
      setTotal(res.total ?? total);
    }
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [kind, normalizedFilters, page, limit, loading, hasMore, total]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: '650px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadNextPage]);

  return {
    items,
    total,
    facets,
    loading,
    loadingMore,
    hasMore,
    loadNextPage,
    sentinelRef,
  };
}
