import { CATALOG_DB } from '../data/catalogDb';

export interface CustomPromptItem {
  id: string;
  kind: 'vip' | 'practical' | 'templates' | 'products';
  title: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  aiModel: string;
  aiModelLabel: string;
  thumbnailUrl: string;
  promptText: string;
  tips?: string;
  tags: string[];
  createdAt: string;
}

const CUSTOM_STORAGE_KEY = 'khoshare_custom_items_v1';

export function getCustomItems(): CustomPromptItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomItem(item: Omit<CustomPromptItem, 'id' | 'createdAt'>): CustomPromptItem {
  const list = getCustomItems();
  const newItem: CustomPromptItem = {
    ...item,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [newItem, ...list];
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('khoshare-catalog-updated'));
  }
  return newItem;
}

export function deleteCustomItem(id: string): void {
  const list = getCustomItems().filter((x) => x.id !== id);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('khoshare-catalog-updated'));
  }
}

export function getMergedCatalog() {
  const custom = getCustomItems();
  const customVip = custom
    .filter((c) => c.kind === 'vip')
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.id,
      description: c.description,
      categoryId: c.categorySlug,
      categoryName: c.categoryName || 'Bán hàng & TMĐT',
      categoryIcon: '✨',
      categorySlug: c.categorySlug || 'ban-hang',
      tags: c.tags?.length ? c.tags : ['custom', 'ai'],
      copyCount: 99,
      viewCount: 350,
      thumbnailUrl: c.thumbnailUrl || '/miushare-logo.svg',
      galleryImages: [c.thumbnailUrl || '/miushare-logo.svg'],
      promptType: 'image',
      aiModel: c.aiModel || 'gpt-image',
      aiModelLabel: c.aiModelLabel || 'GPT Image',
      createdAt: c.createdAt,
      promptPreview: c.promptText.slice(0, 95) + '...',
      promptLength: c.promptText.length,
      detectedVars: [],
      promptText: c.promptText,
    }));

  const customPractical = custom
    .filter((c) => c.kind === 'practical')
    .map((c, idx) => ({
      id: c.id,
      numericId: 900 + idx,
      slug: c.id,
      title: c.title,
      description: c.description,
      categorySlug: c.categorySlug || 'anh-san-pham',
      categoryName: c.categoryName || 'Ảnh sản phẩm',
      categoryIcon: '⚡',
      aiModel: c.aiModel || 'chatgpt',
      aiModelLabel: c.aiModelLabel || 'ChatGPT',
      promptType: 'text',
      tags: c.tags?.length ? c.tags : ['thực chiến'],
      thumbnailUrl: c.thumbnailUrl || '/miushare-logo.svg',
      hasRealPhoto: true,
      likesCount: 50,
      copyCount: 88,
      viewCount: 420,
      promptPreview: c.promptText.slice(0, 90) + '...',
      promptLength: c.promptText.length,
      detectedVars: [],
      hasTips: !!c.tips,
      promptText: c.promptText,
      tips: c.tips || '',
    }));

  return {
    vipItems: [...customVip, ...(CATALOG_DB.vipItems || [])],
    templates: [...(CATALOG_DB.templates || [])],
    practicalItems: [...customPractical, ...(CATALOG_DB.practicalItems || [])],
    products: [...(CATALOG_DB.products || [])],
    flowsByCode: CATALOG_DB.flowsByCode || {},
  };
}

export function queryCatalog(params: Record<string, any>) {
  const db = getMergedCatalog();
  const kind = String(params.kind || 'vip');
  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.max(1, Number(params.limit || 40));
  const q = String(params.q || '').trim().toLowerCase();

  if (kind === 'random') {
    const pools: Array<{ kind: string; item: any }> = [
      ...db.vipItems.map((item: any) => ({ kind: 'vip', item })),
      ...db.templates.map((item: any) => ({ kind: 'flow', item })),
      ...db.practicalItems.map((item: any) => ({ kind: 'practical', item })),
    ];
    const pick = pools[Math.floor(Math.random() * pools.length)] || { kind: 'vip', item: db.vipItems[0] };
    return pick;
  }

  if (kind === 'omni') {
    if (!q) return { total: 0, hits: [] };
    const hits: any[] = [];
    for (const v of db.vipItems) {
      if (v.title.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q) || v.categoryName?.toLowerCase().includes(q)) {
        hits.push({
          key: `vip-${v.id}`,
          kind: 'vip',
          vaultLabel: 'Prompt Ảnh VIP',
          vaultColor: '#00e599',
          title: v.title,
          thumb: v.thumbnailUrl || '/miushare-logo.svg',
          vipItem: v,
        });
      }
    }
    for (const t of db.templates) {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.summary?.toLowerCase().includes(q)) {
        hits.push({
          key: `flow-${t.code}`,
          kind: 'flow',
          vaultLabel: 'Mẫu Video AI',
          vaultColor: '#38bdf8',
          title: t.title,
          thumb: t.media_urls?.[0]?.thumbnail_url || '/miushare-logo.svg',
          templateItem: t,
        });
      }
    }
    for (const p of db.practicalItems) {
      if (p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q)) {
        hits.push({
          key: `prac-${p.id}`,
          kind: 'practical',
          vaultLabel: 'Prompt Thực Chiến',
          vaultColor: '#f59e0b',
          title: p.title,
          thumb: p.thumbnailUrl || '/miushare-logo.svg',
          practicalItem: p,
        });
      }
    }
    for (const prod of db.products) {
      if (prod.title.toLowerCase().includes(q) || prod.description?.toLowerCase().includes(q)) {
        hits.push({
          key: `prod-${prod.id}`,
          kind: 'product',
          vaultLabel: 'Tool & Chatbot',
          vaultColor: '#a855f7',
          title: prod.title,
          thumb: prod.image || '/miushare-logo.svg',
          productItem: prod,
        });
      }
    }
    return {
      total: hits.length,
      hits: hits.slice(0, 20),
    };
  }

  if (kind === 'vip') {
    let list = [...db.vipItems];
    const category = params.category && params.category !== 'all' ? String(params.category) : '';
    const model = params.model && params.model !== 'all' ? String(params.model) : '';
    const tag = params.tag ? String(params.tag).toLowerCase() : '';
    const sort = String(params.sort || 'popular');

    const modelCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = { all: list.length };
    let videoCount = 0;

    for (const item of list) {
      modelCounts[item.aiModel] = (modelCounts[item.aiModel] || 0) + 1;
      categoryCounts[item.categorySlug] = (categoryCounts[item.categorySlug] || 0) + 1;
      categoryCounts[item.categoryId] = (categoryCounts[item.categoryId] || 0) + 1;
      if (item.promptType === 'video') videoCount++;
    }

    if (category) {
      list = list.filter((x) => x.categorySlug === category || x.categoryId === category);
    }
    if (model) {
      if (model === 'video') {
        list = list.filter((x) => x.promptType === 'video');
      } else {
        list = list.filter((x) => x.aiModel === model);
      }
    }
    if (tag) {
      list = list.filter((x) => (x.tags || []).some((t: string) => t.toLowerCase() === tag));
    }
    if (q) {
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q) ||
          x.categoryName?.toLowerCase().includes(q) ||
          (x.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'new') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'copies') {
      list.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
    } else {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }

    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return {
      items: paged,
      total: list.length,
      hasMore: start + limit < list.length,
      facets: {
        totalAll: db.vipItems.length,
        modelCounts,
        categoryCounts,
        videoCount,
      },
    };
  }

  if (kind === 'templates') {
    let list = [...db.templates];
    const niche = params.niche ? String(params.niche) : '';
    const tool = params.tool ? String(params.tool) : '';

    const categoryCounts: Record<string, number> = { all: list.length };
    for (const item of list) {
      for (const d of item.dims || []) {
        if (d.dim_code === 'MO-1340' && d.dim_value_code) {
          const prefix = d.dim_value_code.slice(0, 9);
          categoryCounts[prefix] = (categoryCounts[prefix] || 0) + 1;
        }
      }
    }

    if (niche) {
      list = list.filter((x) =>
        (x.dims || []).some((d: any) => d.dim_value_code && d.dim_value_code.startsWith(niche))
      );
    }
    if (tool) {
      list = list.filter((x) =>
        (x.ai_tools || []).some((t: string) => t.toLowerCase() === tool.toLowerCase())
      );
    }
    if (q) {
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q) ||
          x.summary?.toLowerCase().includes(q)
      );
    }

    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return {
      items: paged,
      total: list.length,
      hasMore: start + limit < list.length,
      facets: {
        totalAll: db.templates.length,
        availableTools: ['ChatGPT', 'Flow', 'Gemini', 'PixVerse', 'VClip', 'Kling', 'Grok'],
        categoryCounts,
      },
    };
  }

  if (kind === 'practical') {
    let list = [...db.practicalItems];
    const category = params.category ? String(params.category) : '';
    const model = params.model ? String(params.model) : '';
    const sort = String(params.sort || 'default');

    const categoryCounts: Record<string, number> = { all: list.length };
    const modelCounts: Record<string, number> = { all: list.length };
    for (const item of list) {
      categoryCounts[item.categorySlug] = (categoryCounts[item.categorySlug] || 0) + 1;
      modelCounts[item.aiModel] = (modelCounts[item.aiModel] || 0) + 1;
    }

    if (category && category !== 'all') {
      list = list.filter((x) => x.categorySlug === category);
    }
    if (model && model !== 'all') {
      list = list.filter((x) => x.aiModel === model);
    }
    if (q) {
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q) ||
          x.categoryName?.toLowerCase().includes(q) ||
          (x.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'views') {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sort === 'copies') {
      list.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
    }

    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return {
      items: paged,
      total: list.length,
      hasMore: start + limit < list.length,
      facets: {
        totalAll: db.practicalItems.length,
        categoryCounts,
        modelCounts,
      },
    };
  }

  if (kind === 'products') {
    let list = [...db.products];
    if (params.ids) {
      const idSet = new Set(String(params.ids).split(',').map((s) => s.trim()).filter(Boolean));
      const matched = list.filter((x) => idSet.has(x.id));
      return { items: matched, total: matched.length, hasMore: false };
    }

    const mode = String(params.mode || 'catalog');
    if (mode === 'chatbot') {
      const industry = params.industry && params.industry !== 'all' ? String(params.industry) : '';
      const format = params.format && params.format !== 'all' ? String(params.format) : '';
      if (industry) {
        list = list.filter(
          (x) =>
            x.categoryId?.includes(industry) ||
            x.category?.toLowerCase().includes(industry) ||
            x.topicId?.includes(industry)
        );
      }
      if (format) {
        list = list.filter((x) => x.format === format);
      }
    } else {
      const productTypeId = params.productTypeId ? String(params.productTypeId) : '';
      const categoryId = params.categoryId ? String(params.categoryId) : '';
      const topicId = params.topicId ? String(params.topicId) : '';
      const format = params.format ? String(params.format) : '';
      if (productTypeId) list = list.filter((x) => x.productTypeId === productTypeId);
      if (categoryId) list = list.filter((x) => x.categoryId === categoryId);
      if (topicId) list = list.filter((x) => x.topicId === topicId);
      if (format) list = list.filter((x) => x.format === format);
    }

    if (q) {
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.description?.toLowerCase().includes(q) ||
          x.category?.toLowerCase().includes(q)
      );
    }

    const pvTopicCounts: Record<string, number> = {};
    for (const item of db.products) {
      if (item.topicId) {
        pvTopicCounts[item.topicId] = (pvTopicCounts[item.topicId] || 0) + 1;
      }
    }

    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return {
      items: paged,
      total: list.length,
      hasMore: start + limit < list.length,
      facets: {
        totalAll: db.products.length,
        availableFormats: ['9:16', '16:9'],
        pvAllCount: db.products.length,
        freePromptCount: db.products.length,
        pvTopicCounts,
        chatbotIndustryCounts: { all: db.products.length },
        chatbotPromptSubCount: db.products.length,
      },
    };
  }

  return { items: [], total: 0, hasMore: false };
}

export function getUnlockedVaultPayload(kind: string, id: string) {
  const db = getMergedCatalog();
  if (kind === 'vip') {
    const found = db.vipItems.find((x: any) => x.id === id || x.slug === id);
    const promptText =
      found?.promptText ||
      found?.promptPreview ||
      `Dựa vào hình ảnh tham chiếu tôi vừa tải lên, hãy tạo hình ảnh "${found?.title || id}" chuẩn studio 4K, giữ nguyên 100% đường nét khuôn mặt và chi tiết sản phẩm.`;
    return {
      kind: 'vip',
      id,
      promptText,
    };
  }

  if (kind === 'practical') {
    const found = db.practicalItems.find((x: any) => x.id === id || x.slug === id);
    const promptText =
      found?.promptText ||
      found?.promptPreview ||
      `Bạn là Chuyên gia AI Thực Chiến. Hãy thực hiện quy trình "${found?.title || id}" chi tiết từng bước, tối ưu chuyển đổi cho thị trường Việt Nam.`;
    return {
      kind: 'practical',
      id,
      promptText,
      tips:
        found?.tips ||
        'Điền đầy đủ các biến số cụ thể của sản phẩm/dịch vụ trước khi chạy câu lệnh để đạt hiệu quả cao nhất.',
    };
  }

  if (kind === 'flow') {
    const flowData = db.flowsByCode[id] || Object.values(db.flowsByCode)[0];
    return {
      kind: 'flow',
      id,
      primaryPrompt: flowData?.primaryPrompt || `Mục tiêu: Tạo video AI chuyên nghiệp (${id})`,
      flowData,
    };
  }

  if (kind === 'script' || kind === 'product') {
    const found = db.products.find((x: any) => x.id === id);
    return {
      kind: 'script',
      id,
      promptText:
        found?.promptText ||
        found?.description ||
        `[SYSTEM PROMPT — ${found?.title || id}]\nHãy đóng vai đạo diễn kịch bản video ngắn và tạo bảng phân cảnh chi tiết kèm câu lệnh tạo ảnh/video AI 4K.`,
    };
  }

  return {
    kind,
    id,
    promptText: `Câu lệnh AI đã mở khóa 100% cho mục: ${id}`,
  };
}
