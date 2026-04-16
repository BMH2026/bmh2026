import ModalShell from "@/components/ModalShell";

export default function InterceptedRoomModal({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <ModalShell>
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">
          Phòng {params.slug} (Intercepted)
        </h2>
        <p className="text-neutral-600 mb-6">
          Đây là nội dung được Render thẳng vào Popup Modal khi click từ trang Invoice/Booking, giữ nguyên context nền.
        </p>
        <button className="bg-black text-white px-6 py-3 rounded-full font-medium w-full">
          Ghi nhận Chọn Phòng
        </button>
      </div>
    </ModalShell>
  );
}
