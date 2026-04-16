"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";

export default function ModalShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleDismiss = (e: MouseEvent) => {
    // Nếu click ra ngoài vùng trắng (vào backdrop), thì tắt modal
    if (e.target === e.currentTarget) {
      router.back();
    }
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
