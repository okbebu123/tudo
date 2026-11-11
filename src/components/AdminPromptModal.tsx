import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Download, Sparkles, Database } from 'lucide-react';
import {
  getCustomItems,
  saveCustomItem,
  deleteCustomItem,
  CustomPromptItem,
  getMergedCatalog,
} from '../services/catalogEngine';

export const AdminPromptManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CustomPromptItem[]>([]);
  const [kind, setKind] = useState<'vip' | 'practical'>('vip');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState('ban-hang');
  const [categoryName, setCategoryName] = useState('Bán hàng & TMĐT');
  const [aiModel, setAiModel] = useState('gpt-image');
  const [aiModelLabel, setAiModelLabel] = useState('ChatGPT / GPT Image');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [tips, setTips] = useState('');

  useEffect(() => {
    if (isOpen) {
      setItems(getCustomItems());
    }
  }, [isOpen]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) return;
    saveCustomItem({
      kind,
      title: title.trim(),
      description: description.trim() || title.trim(),
      categorySlug,
      categoryName,
      aiModel,
      aiModelLabel,
      thumbnailUrl: thumbnailUrl.trim() || '/miushare-logo.svg',
      promptText: promptText.trim(),
      tips: tips.trim(),
      tags: ['custom', 'ai'],
    });
    setItems(getCustomItems());
    setTitle('');
    setDescription('');
    setPromptText('');
    setTips('');
  };

  const handleDelete = (id: string) => {
    deleteCustomItem(id);
    setItems(getCustomItems());
  };

  const handleExportJson = () => {
    const db = getMergedCatalog();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khoshare-catalog-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Quản lý & Thêm Prompt/Skill Mới"
        className="fixed left-3 sm:left-5 bottom-4 z-40 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0b1324]/95 hover:bg-[#111e38] border border-[#00e599]/45 hover:border-[#00e599] text-[#00e599] text-xs font-extrabold shadow-[0_8px_24px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all cursor-pointer active:scale-95"
      >
        <Database className="size-3.5" />
        <span className="hidden sm:inline">Quản lý Kho Prompt</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#00e599]/35 bg-[#080e1c] p-5 sm:p-6 text-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#00e599]/15 border border-[#00e599]/40 flex items-center justify-center text-[#00e599]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Quản Lý & Thêm Prompt / Skill Tự Động
                  </h3>
                  <p className="text-xs text-slate-400">
                    Thêm câu lệnh mới vào Kho VIP hoặc Kho Thực Chiến & xuất JSON cho Cloudflare Pages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-200 cursor-pointer"
                >
                  <Download className="size-3.5 text-[#00e599]" />
                  <span>Xuất JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5 bg-[#0b1324] p-4 rounded-2xl border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Loại Kho
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as 'vip' | 'practical')}
                    className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white"
                  >
                    <option value="vip">Prompt Ảnh & Video VIP (/prompt-vip)</option>
                    <option value="practical">Prompt Thực Chiến (/kho-prompt-thuc-chien)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Danh mục
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => {
                      setCategorySlug(e.target.value);
                      setCategoryName(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white"
                  >
                    <option value="ban-hang">Bán hàng & TMĐT</option>
                    <option value="thoi-trang-lookbook">Thời trang & Lookbook</option>
                    <option value="portrait">Chân dung & Portrait</option>
                    <option value="anh-san-pham">Ảnh sản phẩm</option>
                    <option value="video-ban-hang">Video bán hàng</option>
                    <option value="content-social">Content & Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Model AI
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => {
                      setAiModel(e.target.value);
                      setAiModelLabel(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white"
                  >
                    <option value="gpt-image">ChatGPT / GPT Image</option>
                    <option value="nano-banana-pro">Nano Banana Pro</option>
                    <option value="chatgpt">ChatGPT</option>
                    <option value="other">Midjourney / Flux / Veo 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Tiêu đề Prompt *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Tạo ảnh lookbook sản phẩm..."
                    className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Link Ảnh Thumbnail (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://... (để trống dùng logo mặc định)"
                    className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Mô tả ngắn / Hướng dẫn
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hướng dẫn nhanh cách áp dụng prompt..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Nội dung Câu Lệnh (Full Prompt) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Nhập toàn bộ nội dung System Prompt / câu lệnh tạo ảnh tại đây..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-white/15 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00e599] hover:bg-[#15f4aa] text-[#041017] font-black text-xs cursor-pointer shadow-lg"
                >
                  <Plus className="size-4" />
                  <span>Lưu vào Kho Prompt</span>
                </button>
              </div>
            </form>

            {items.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Prompt bạn đã thêm ({items.length})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          [{item.kind.toUpperCase()}] {item.categoryName} • {item.aiModelLabel}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
