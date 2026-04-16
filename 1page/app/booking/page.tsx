import Link from "next/link";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-sm p-6 border border-neutral-200">
        <h1 className="text-3xl font-serif font-semibold text-neutral-900 mb-6">
          Binh Minh Homestay - Live Quote
        </h1>
        
        {/* Invoice Items Area */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Phòng Lưu Trú</p>
              <Link 
                href="/rooms/deluxe" 
                className="text-lg font-medium text-blue-600 hover:underline"
              >
                Chọn Hạng Phòng
              </Link>
            </div>
            <div className="text-right">
              <p className="font-semibold text-neutral-900">0 đ</p>
            </div>
          </div>
        </div>

        {/* Sticky Total Bar Simulation */}
        <div className="mt-auto pt-6 border-t border-neutral-200 sticky bottom-0 bg-white">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Tạm tính</span>
            <span className="text-2xl font-bold text-neutral-900">0 đ</span>
          </div>
          <button className="w-full mt-4 bg-black text-white rounded-full py-4 font-medium hover:bg-neutral-800 transition">
            Xác nhận Đặt Phòng
          </button>
        </div>
      </div>
    </main>
  );
}
