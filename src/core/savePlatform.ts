/**
 * 存档导出平台抽象 —— Web/Electron 走浏览器下载,Capacitor 原生端写 Documents。
 *
 * 背景:SettingsView 原把导出/导入整体用 `!Capacitor.isNativePlatform()` 藏起,
 * 因为 Capacitor WebView 没有 DownloadListener,`saveAs` 触发的下载在安卓上
 * 根本没着落。但存档只存本地、无法备份,卸载/清数据即永久丢失 —— 导出能力
 * 恰恰是移动端最需要的一环。原生端改用 @capacitor/filesystem 写 Documents:
 * 卸载前把 .save 文件导出,重装后经设置页导入恢复。
 */
import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { saveAs } from 'file-saver'
import { exportSaveText } from './save'
import { useUiStore } from '@/stores/ui'

/** 本机存档导出:按平台落到可被用户取走的地方,成功返回提示,失败返回 null */
export async function exportSaveToDevice(): Promise<string | null> {
  const text = exportSaveText()
  if (Capacitor.isNativePlatform()) {
    try {
      // Documents 在部分 Android 上需运行时授权,先问一句,被拒就如实告知
      const perm = await Filesystem.requestPermissions()
      if (perm.publicStorage === 'denied') return 'Quyền lưu trữ bị từ chối, không thể xuất bản lưu'
      const stamp = new Date().toISOString().slice(0, 10)
      const file = `yunyin-xiuxian-${stamp}.save`
      await Filesystem.writeFile({
        path: `Export/${file}`,
        data: text,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      })
      useUiStore().toast(`Đã xuất ra「Tài liệu/Export/${file}」`, 'success')
      return null
    } catch {
      // 写盘失败(存储不可用/权限异常)明确告知,不静默
      useUiStore().toast('Xuất bản lưu thất bại, vui lòng kiểm tra dung lượng lưu trữ rồi thử lại', 'warn')
      return 'Xuất thất bại'
    }
  }
  /*
   * Web 端靠 `saveAs`(Blob + a[download]) + **剪贴板兜底**。
   *
   * 下载本身不是处处都通:受限 WebView、应用内浏览器(taptap 也是其一)里
   * a[download] 常被**静默吞掉** —— 不抛错、也没文件,旧实现于是像点了空气。
   * 故在挂下载之外,一律把存档文本写进剪贴板:无论下载成不成,玩家都拿得走。
   * 提示语把这条退路讲明,不再假装「已导出」。
   *
   * 成功语义:真落盘的下载才算数(返回 null → 记账「上次导出」);
   * 只有剪贴板时返回提示(不记账 —— 文本躺在剪贴板里不算持久备份)。
   */
  const file = `yunyin-xiuxian-${new Date().toISOString().slice(0, 10)}.save`

  // 剪贴板先行:写它要有用户手势 + secure context,导出按钮的单击正好给足。
  // 剪贴板不可用(非安全上下文/被禁)不影响下载那条路。
  let clipped = false
  try {
    await navigator.clipboard.writeText(text)
    clipped = true
  } catch {
    /* 剪贴板不可用,静默 —— 下载路还在 */
  }

  let downloaded = false
  try {
    saveAs(new Blob([text], { type: 'application/json' }), file)
    downloaded = true
  } catch {
    /* 下载被拦,看剪贴板 */
  }

  if (downloaded && clipped) {
    useUiStore().toast(`Đã xuất「${file}」 (văn bản bản lưu cũng đã được sao chép vào khay nhớ tạm để dự phòng)`, 'success')
    return null
  }
  if (downloaded) {
    useUiStore().toast(`Đã xuất「${file}」`, 'success')
    return null
  }
  if (clipped) {
    useUiStore().toast('Trình duyệt không thể tải xuống —— văn bản bản lưu đã được sao chép vào khay nhớ tạm, hãy tạo tệp mới dán vào và lưu thành đuôi .save là có thể nhập vào', 'warn')
    return 'Bản lưu đã sao chép vào khay nhớ tạm'
  }
  useUiStore().toast('Trình duyệt không thể tải xuống cũng như sao chép bản lưu, vui lòng đổi trình duyệt khác rồi thử lại', 'warn')
  return 'Trình duyệt không hỗ trợ xuất'
}
