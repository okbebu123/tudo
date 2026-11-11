import React from 'react';
import { ArrowLeft, Shield, FileText, Lock, Sparkles } from 'lucide-react';
import { navigateTo } from '../services/routerShim';

export const StaticInfoPage: React.FC<{ page: 'contact' | 'privacy' | 'terms' }> = ({ page }) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition cursor-pointer"
        >
          <ArrowLeft className="size-4 text-[#00e599]" />
          <span>Quay lại Trang Chủ Tủ Đồ AI</span>
        </button>

        {page === 'contact' && (
          <div className="rounded-3xl border border-[#00e599]/30 bg-[#0b1324]/90 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e599]/15 border border-[#00e599]/40 text-[#00e599] text-xs font-extrabold uppercase">
              <Sparkles className="size-3.5" />
              <span>Trung Tâm Hỗ Trợ Tủ Đồ AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Liên Hệ Cộng Đồng & Hỗ Trợ Kỹ Thuật — Tủ Đồ AI
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Toàn bộ công cụ AI Shotcraft, Motion Studio, Giải Phẫu Video, Stickman Director và kho
              2.800+ câu lệnh thực chiến trên <strong>Tủ Đồ AI</strong> hiện đã được mở khóa 100% để bạn
              sử dụng trực tiếp trên web.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] opacity-75 space-y-2 select-none">
                <Lock className="size-5 text-amber-400" />
                <div className="font-bold text-white text-sm">Kênh Zalo Hỗ Trợ</div>
                <div className="text-xs text-amber-400 font-semibold">Đang tạm khóa</div>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] opacity-75 space-y-2 select-none">
                <Lock className="size-5 text-amber-400" />
                <div className="font-bold text-white text-sm">Kênh Telegram / TeleBot</div>
                <div className="text-xs text-amber-400 font-semibold">Đang tạm khóa</div>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] opacity-75 space-y-2 select-none">
                <Lock className="size-5 text-amber-400" />
                <div className="font-bold text-white text-sm">Email Liên Hệ</div>
                <div className="text-xs text-amber-400 font-semibold">Đang tạm khóa</div>
              </div>
            </div>
          </div>
        )}

        {page === 'privacy' && (
          <div className="rounded-3xl border border-white/15 bg-[#0b1324]/90 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e599]/15 border border-[#00e599]/40 text-[#00e599] text-xs font-extrabold uppercase">
              <Shield className="size-3.5" />
              <span>Chính Sách Bảo Mật — Tủ Đồ AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Chính Sách Bảo Mật Thông Tin</h1>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>1. Bảo mật Gemini API Key & Dữ liệu cá nhân:</strong> Khi bạn sử dụng các công cụ
                trực tiếp trên trình duyệt (Shotcraft, Motion Studio, Giải Phẫu Video, Stickman Director),
                Gemini API Key và tệp video/hình ảnh của bạn được xử lý trực tiếp từ trình duyệt tới
                Google AI Studio và không lưu trữ trên máy chủ.
              </p>
              <p>
                <strong>2. Lưu trữ cục bộ (Local Storage):</strong> Danh sách các Prompt đã lưu (Saved) và
                các Prompt tùy chỉnh được lưu trực tiếp trên trình duyệt của bạn để phục vụ trải nghiệm
                cá nhân hóa.
              </p>
            </div>
          </div>
        )}

        {page === 'terms' && (
          <div className="rounded-3xl border border-white/15 bg-[#0b1324]/90 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-extrabold uppercase">
              <FileText className="size-3.5" />
              <span>Điều Khoản Sử Dụng — Tủ Đồ AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Điều Khoản Sử Dụng Kho Prompt & Skills — Tủ Đồ AI
            </h1>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>1. Quyền sử dụng miễn phí:</strong> Toàn bộ câu lệnh (Prompts), quy trình tạo
                video AI (Workflows) và mẫu kịch bản trên hệ thống <strong>Tủ Đồ AI</strong> được mở khóa
                100% để bạn phục vụ công việc sáng tạo nội dung, kinh doanh thương mại điện tử và xây dựng
                thương hiệu.
              </p>
              <p>
                <strong>2. Trách nhiệm nội dung:</strong> Người dùng tự chịu trách nhiệm về hình ảnh và
                video đầu ra khi sử dụng các công cụ AI theo quy định pháp luật hiện hành.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
