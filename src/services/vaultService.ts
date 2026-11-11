import { getUnlockedVaultPayload } from './catalogEngine';

export const DAILY_FREE_COPY_LIMIT = 9999;
export const DAILY_BOT_BONUS_LIMIT = 9999;
export const DAILY_MAX_COPY_LIMIT = 9999;
export const ZALO_URL = '#locked';

const UNLIMITED_STATUS = {
  usedToday: 0,
  remaining: 9999,
  limit: 9999,
  baseLimit: 9999,
  bonusLimit: 9999,
  maxLimit: 9999,
  unlockedToday: true,
  exhaustedAllToday: false,
  challenge: 'LOCAL_UNLOCKED',
  claimedKeys: [] as string[],
  actionToken: 'local_token_unlimited',
  turnstileRequired: false,
};

export function getDailyQuotaStatus() {
  return UNLIMITED_STATUS;
}

export function applyServerStatus(_status?: any) {
  return UNLIMITED_STATUS;
}

export async function buildVaultSecurityHeaders() {
  return {
    'X-Vault-FP': 'local-unlimited-fp',
  };
}

export async function syncVaultStatusFromServer() {
  return UNLIMITED_STATUS;
}

export function isResourceClaimedToday(_kind: string, _id: string) {
  return true;
}

export function getCachedClaimPayload(kind: string, id: string) {
  return getUnlockedVaultPayload(kind, id);
}

export async function claimVaultResource(kind: string, id: string, _source = 'vault_claim') {
  const payload = getUnlockedVaultPayload(kind, id);
  return {
    allowed: true,
    payload,
    status: UNLIMITED_STATUS,
  };
}

export function unsealVaultObject(sealed: any, _salt?: string, _challenge?: string) {
  return sealed || null;
}

export async function verifyBotUnlockCodeOnServer(_code: string) {
  return {
    ok: true,
    message: 'Đã mở khóa không giới hạn toàn bộ Kho Prompt & Skills!',
    status: UNLIMITED_STATUS,
  };
}

export function openDailyQuotaModal(_reason?: string, _msg?: string, _source?: string) {
  // No-op: quota lock is completely disabled
}

export function getTeleBotUrl(_startParam = 'gift_welcome') {
  return '#locked';
}

export function getTeleBotQrUrl(_startParam = 'gift_welcome', _size = 200) {
  return '/miushare-logo.svg';
}

export function openTeleBot(_startParam = 'gift_welcome', _target = '_blank') {
  // Locked: do not open external Telegram URL
}

export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}
