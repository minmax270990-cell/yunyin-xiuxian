/**
 * Pre-rebirth decision line. Must follow the same heritage table the
 * settlement dialog renders, not a second hand-written summary.
 */
import { HERITAGE, type HeritageMode } from '@/core/samsaraAudit'
import { MANUAL_REBIRTH_MIN_MAJOR } from '@/core/reincarnation'
import { REALMS } from '@/data/realms'

function row(id: string) {
  return HERITAGE.find(r => r.id === id)
}

/**
 * Một câu hiển thị trên nút tự hành binh giải.
 * Ký ức công pháp giữ lại, số tầng trở về tầng 1 (túc tuệ đỉnh giai giữ lại một môn mãn tầng).
 * Pháp bảo là ngoại vật, tan biến cùng thể xác.
 */
export function rebirthDecisionHint(): string {
  const keep = [row('daoFruit'), row('talents')].filter(r => r?.mode === 'full').map(r => r!.name)
  const artifacts = row('artifacts')
  const realm = REALMS[MANUAL_REBIRTH_MIN_MAJOR]?.name ?? ''
  const parts = [
    keep.length ? `Mang theo ${keep.join(' và ')}` : '',
    'Công pháp ghi nhớ môn loại, số tầng trở về tầng 1; túc tuệ đỉnh giai có thể giữ lại một môn mãn tầng',
    artifacts?.mode === 'reset' ? `${artifacts.name} tan biến cùng thể xác` : '',
    realm ? `${realm} cảnh mới có thể tự hành binh giải` : ''
  ].filter(Boolean)
  return `${parts.join('. ')}.`
}

/**
 * Danh sách giữ/bỏ khi chuyển thế —— lấy từng dòng từ cùng bảng HERITAGE (hộp thoại kết toán cũng đọc nó), giao diện không viết riêng một bản khác.
 * Binh giải là việc lớn không thể vãn hồi, một câu "tan biến cùng thể xác" không bao quát hết cả sổ sách: Linh mạch, động phủ, linh thạch,
 * nhận thức địch thủ…… Người chơi trước khi nhấn cần biết rõ từng thứ sẽ đi về đâu.
 */
export interface HeritageViewRow {
  id: string
  name: string
  mode: HeritageMode
  modeLabel: string
  cls: string
}

function modeMeta(mode: HeritageMode): { label: string; cls: string } {
  if (mode === 'full') return { label: 'Theo hồn giữ lại', cls: 'text-jade' }
  if (mode === 'partial') return { label: 'Giữ lại một phần', cls: 'text-gold-ink' }
  return { label: 'Về 0 làm lại', cls: 'text-ink-faint' }
}

export function heritageViewRows(): HeritageViewRow[] {
  return HERITAGE.map(r => {
    const m = modeMeta(r.mode)
    return { id: r.id, name: r.name, mode: r.mode, modeLabel: m.label, cls: m.cls }
  })
}
