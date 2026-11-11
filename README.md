# KhoShare AI — Clone 1-1 Miushare (React + Vite + Tailwind CSS + Cloudflare Pages/Workers)

Dự án clone 1-1 giao diện và toàn bộ tính năng của **Miushare** (`miushare.com`), được tối ưu hóa để chạy và deploy trực tiếp lên **Cloudflare Pages / Cloudflare Workers**.

## ✨ Tính năng nổi bật

1. **Giao diện & Trải nghiệm 1-1 (Dark Neon Studio)**:
   - Trang chủ (`/`) với Hero Phone Showcase, tìm kiếm Omni-Search toàn kho, Marquee Video AI.
   - **4 Studio AI Tương Tác Trực Tiếp**:
     - `/shotcraft`: **AI Shotcraft TVC 1-Click** — Biến ảnh sản phẩm & web thành TVC 3D & dự án CapCut.
     - `/motion-studio`: **AI Motion Studio 1-Click** — Dựng video Motion Graphics 60fps.
     - `/giai-phau-video`: **AI Video X-Ray & Remake 1-Click** — Giải phẫu & nhân bản video triệu view.
     - `/stickman-director`: **Stickman Video Director 1-Click** — Gõ text ra kịch bản & prompt hoạt hình người que.
   - **4 Kho Dữ Liệu Prompt & Skills**:
     - `/prompt-vip`: Kho Prompt Tạo Ảnh AI, Lookbook & Chân Dung.
     - `/mau-video-ai`: Kho System Prompt & Quy Trình Video AI (Veo 3, Kling, Flow) kèm trình phát HLS/MP4.
     - `/kho-prompt-thuc-chien`: Kho Prompt AI Bán Hàng, TMĐT & Content Đa Ngành.
     - `/chatbotprompt`: Kho Trợ Lý Chatbot AI & Prompt Video Shot theo ngành.

2. **Mở khóa 100% — Không giới hạn Quota / TeleBot**:
   - Đã loại bỏ hoàn toàn cơ chế khóa Quota 10 lượt/ngày và yêu cầu nhập mã TeleBot (`vaultService.ts`).
   - Thay thế hộp làm mờ (`RedactedPromptBox`) bằng **`UnlockedPromptBox.tsx`** hiển thị trực tiếp 100% câu lệnh gốc trên màn hình và hỗ trợ sao chép 1-Click.

3. **Quản lý Kho Prompt Cục Bộ & Xuất JSON**:
   - Nút **"Quản lý Kho Prompt"** ở góc trái dưới màn hình cho phép bạn thêm nhanh Prompt/Skill mới và xuất toàn bộ dữ liệu ra file JSON.

---

## 🚀 Hướng dẫn chạy ở máy Local

```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy server phát triển (Vite Dev Server)
npm run dev
```

Mở trình duyệt tại `http://localhost:5188`.

---

## ☁️ Hướng dẫn Deploy lên Cloudflare Pages / Workers

Dự án đã được cấu hình sẵn `wrangler.toml`, `public/_redirects`, `public/_routes.json` và Cloudflare Pages Function tại `functions/api/[[route]].ts` (sử dụng **Hono**).

### Cách 1: Deploy bằng lệnh CLI (Nhanh nhất)
```bash
# Build ra thư mục dist và đẩy lên Cloudflare Pages
npm run pages:deploy
```

### Cách 2: Kết nối GitHub với Cloudflare Pages Dashboard
1. Đẩy mã nguồn trong `d:\khoshare_ai` lên GitHub.
2. Vào **Cloudflare Dashboard** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Thiết lập thông số Build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Nhấn **Save and Deploy**.
