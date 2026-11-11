import React, { useMemo } from 'react';
import { Check, Copy, Sparkles, Unlock } from 'lucide-react';
import { getUnlockedVaultPayload } from '../services/catalogEngine';

export interface UnlockedPromptBoxProps {
  previewText?: string;
  seedKey?: string;
  isClaimed?: boolean;
  copied?: boolean;
  claiming?: boolean;
  remainingQuota?: number;
  unlockedToday?: boolean;
  filledVarsCount?: number;
  onCopy?: () => void;
  onOpenQuotaModal?: () => void;
}

export const UnlockedPromptBox: React.FC<UnlockedPromptBoxProps> = ({
  previewText = '',
  seedKey = 'vault',
  copied = false,
  claiming = false,
  filledVarsCount = 0,
  onCopy,
}) => {
  const fullPromptText = useMemo(() => {
    const parts = String(seedKey || '').split(':');
    const kind = parts[0];
    const id = parts[1];
    const stepCode = parts[2];

    if (kind === 'flow' && id) {
      const payload = getUnlockedVaultPayload('flow', id);
      if (stepCode && payload.flowData?.steps) {
        const step = payload.flowData.steps.find((s: any) => s.code === stepCode);
        const stepPrompt = step?.video_prompt || step?.pri_full || step?.pri_rendered;
        if (stepPrompt) return stepPrompt;
      }
      if (payload.primaryPrompt) return payload.primaryPrompt;
    } else if ((kind === 'vip' || kind === 'practical' || kind === 'script') && id) {
      const payload = getUnlockedVaultPayload(kind, id);
      if (payload?.promptText) return payload.promptText;
    }

    return previewText || 'System Prompt đã được mở khóa toàn bộ.';
  }, [seedKey, previewText]);

  return (
    <div className="relative overflow-hidden bg-[#050912] rounded-xl">
      <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#070d1b]/95 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00e599]">
          <Unlock className="size-3.5 shrink-0" />
          <span>Đã mở khóa 100% Toàn Bộ Câu Lệnh Gốc (Không Giới Hạn Quota)</span>
        </span>
        {filledVarsCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#00e599]/15 border border-[#00e599]/30 text-[10px] font-bold text-[#6ee7b7]">
            Đã gắn {filledVarsCount} biến riêng
          </span>
        )}
      </div>

      <div className="p-4 space-y-3.5">
        <div className="rounded-xl border border-white/10 bg-[#080f1e] p-3.5 max-h-[260px] overflow-y-auto select-text">
          <pre className="font-mono text-xs sm:text-[13px] text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
            {fullPromptText}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="size-3.5 text-[#00e599] shrink-0" />
            <span>Bạn có thể bôi đen sao chép trực tiếp hoặc bấm nút 1-Click bên cạnh</span>
          </div>

          <button
            type="button"
            disabled={claiming}
            onClick={onCopy}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-[13px] transition-all cursor-pointer active:scale-95 ${
              copied
                ? 'bg-[#00e599] text-[#041017] shadow-[0_0_20px_rgba(0,229,153,0.45)]'
                : 'bg-gradient-to-r from-[#00e599] via-[#10b981] to-emerald-400 text-[#041017] hover:brightness-110 shadow-[0_6px_20px_rgba(0,229,153,0.3)]'
            }`}
          >
            {copied ? (
              <>
                <Check className="size-4 stroke-[2.75]" />
                <span>Đã sao chép trọn bộ vào Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Sao chép trọn bộ Prompt (1-Click)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
