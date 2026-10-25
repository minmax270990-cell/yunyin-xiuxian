<template>
  <BaseModal :open="open" title="Chính Sách Quyền Riêng Tư" top @close="emit('close')">
    <div class="space-y-3 text-[12px] leading-relaxed">
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">I. Giới Thiệu</h4>
        <p class="text-ink-faint">《Thiên Đạo》 là một trò chơi web thuần ngoại tuyến (offline). Chúng tôi tôn trọng và bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách trò chơi xử lý dữ liệu của bạn.</p>
      </section>
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">II. Thu Thập Dữ Liệu</h4>
        <p class="mb-1 text-ink-faint">Trò chơi chỉ lưu trữ cục bộ trong trình duyệt của bạn các dữ liệu sau:</p>
        <ul class="ml-3 list-disc space-y-0.5 text-ink-faint">
          <li>Tiến trình trò chơi (nhân vật, cảnh giới, trang bị, thành tựu, v.v.)</li>
          <li>Cài đặt trò chơi (âm lượng, hiệu ứng động, tốc độ chiến báo, v.v.)</li>
        </ul>
      </section>
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">III. Lưu Trữ Dữ Liệu</h4>
        <p class="text-ink-faint">
          Toàn bộ dữ liệu chỉ được lưu trữ trong localStorage của trình duyệt, không bao giờ tải lên bất kỳ máy chủ nào. Xóa bộ nhớ đệm trình duyệt sẽ làm mất bản lưu, vui lòng định kỳ xuất bản sao lưu trong mục Cài Đặt.
        </p>
      </section>
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">IV. Trò Chơi Hoàn Toàn Ngoại Tuyến</h4>
        <p class="text-ink-faint">
          Mọi nội dung trò chơi đều vận hành hoàn toàn trên máy cục bộ, không giao tiếp với bất kỳ máy chủ game nào, không tải lên bản lưu. Khi ngắt mạng, ngoại trừ tập lệnh thống kê truy cập không thể tải, mọi tính năng đều hoạt động bình thường.
        </p>
      </section>
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">V. Thống Kê Lưu Lượng Bên Thứ Ba</h4>
        <p class="mb-1 text-ink-faint">
          Trang web sử dụng thống kê 51.LA để nắm bắt nguồn và lượng truy cập. Dịch vụ chỉ ghi nhận hành vi truy cập cơ bản:
        </p>
        <ul class="ml-3 list-disc space-y-0.5 text-ink-faint">
          <li>Nguồn truy cập, đường dẫn trang, thời gian truy cập</li>
          <li>Địa chỉ IP và khu vực địa lý ước tính tương ứng</li>
          <li>Thông tin thiết bị như trình duyệt, hệ điều hành, độ phân giải</li>
        </ul>
        <p class="mt-1 text-ink-faint">
          <span class="text-ink">Hoàn toàn không chứa bất kỳ dữ liệu trò chơi nào</span> — Đạo hiệu, cảnh giới, trang bị, bản lưu đều không nằm trong đó. Trò chơi không tích hợp quảng cáo hay SDK thông báo đẩy.
        </p>
      </section>
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">VI. Kiểm Soát Dữ Liệu</h4>
        <p class="mb-1 text-ink-faint">Bạn có toàn quyền kiểm soát dữ liệu của chính mình:</p>
        <ul class="ml-3 list-disc space-y-0.5 text-ink-faint">
          <li>Bất cứ lúc nào cũng có thể xuất tệp bản lưu trong Cài Đặt</li>
          <li>Bất cứ lúc nào cũng có thể nhập lại bản lưu đã xuất trước đó</li>
          <li>Bất cứ lúc nào cũng có thể xóa sạch toàn bộ dữ liệu trong Cài Đặt</li>
        </ul>
      </section>
      <section>
        <h4 class="mb-0.5 font-kai text-[13px] text-ink">VII. Liên Hệ</h4>
        <p class="text-ink-faint">
          Nếu có thắc mắc hoặc góp ý, có thể phản hồi qua
          <a
            href="https://github.com/setube/yunyin-xiuxian/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block py-1.5 text-azure"
          >
            GitHub Issues
          </a>.
        </p>
      </section>
    </div>
    <template #footer>
      <button class="btn-seal w-full" @click="emit('close')">Đã Hiểu</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import BaseModal from '@/components/common/BaseModal.vue'

  defineProps<{ open: boolean }>()

  const emit = defineEmits<{ close: [] }>()
</script>
