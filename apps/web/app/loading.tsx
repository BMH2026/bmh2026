import { Sunset } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-sand-white z-50 flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-20 h-20 bg-sunrise-yellow/20 rounded-full animate-pulse blur-xl absolute inset-0 m-auto" />
        <Sunset className="w-12 h-12 text-ocean-blue animate-bounce relative z-10" />
      </div>
      <p className="text-ocean-blue/60 font-medium tracking-wide lowercase text-sm">đang về đất liền...</p>
    </div>
  );
}
