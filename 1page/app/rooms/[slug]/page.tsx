export default function RoomCanonicalPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-4">
          Phòng {params.slug} (Canonical)
        </h1>
        <p className="text-neutral-600 mb-8">
          Đây là trang độc lập dành cho Crawler và gửi link trực tiếp. Chứa đầy đủ thông tin chi tiết, Policy, Gallery, và Schema JSON-LD.
        </p>
        <div className="aspect-video bg-neutral-100 rounded-[24px] mb-8 flex items-center justify-center">
          <span className="text-neutral-400">Hình ảnh Gallery lớn</span>
        </div>
        <div className="prose">
          <h3>Chi tiết phòng</h3>
          <p>Nội dung SEO dài...</p>
        </div>
      </div>
    </main>
  );
}
