import { DiningMenu } from '@/components/DiningMenu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Single-page layout — h-[100dvh], no vertical scroll on the page shell.
// DiningMenu content scrolls internally within the flex-1 overflow-y-auto area.
export default function DiningPage() {
  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden">
      {/* Sticky Header */}
      <div className="shrink-0 glass px-8 py-4 pt-safe-top flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text-primary">ăn uống</h1>
        <LanguageSwitcher />
      </div>

      {/* Scrollable content — pb accounts for nav bar height + safe area */}
      <div className="flex-1 overflow-y-auto pb-[84px]">
        <DiningMenu />

        {/* Brand footer line */}
        <p className="text-[0.6875rem] font-sans text-text-secondary/40 text-center py-3 px-4">
          Website được tạo bởi Vân Đồn Solutions ©
        </p>
      </div>
    </div>
  );
}
