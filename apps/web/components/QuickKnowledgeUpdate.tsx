'use client';

import { useState } from 'react';
import { Send, Zap, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function QuickKnowledgeUpdate() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ message: string; extracted: any } | null>(null);

  const handleUpdate = async () => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/extract-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        setResult({ message: data.message, extracted: data.extracted });
        setText('');
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface rounded-card p-6 shadow-soft border border-glass-border">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" strokeWidth={2} />
        <h2 className="font-heading font-bold text-text-primary text-lg">Cập nhật nhanh kiến thức</h2>
      </div>

      <p className="text-xs text-text-secondary mb-4 leading-relaxed">
        Dán nội dung từ Zalo hoặc văn bản bất kỳ về lịch tàu, giá vé... AI sẽ tự động bóc tách và cập nhật lên hệ thống.
      </p>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dán nội dung tại đây... (VD: Lịch tàu Havaco hôm nay 14:00 đi Minh Châu, giá vé 250k...)"
          className="w-full h-32 bg-bg-primary border-none rounded-input p-4 text-sm text-text-primary placeholder:text-text-secondary/40 outline-none resize-none shadow-inner"
        />
        
        <button
          onClick={handleUpdate}
          disabled={isProcessing || !text.trim()}
          className={`absolute bottom-3 right-3 px-4 py-2 rounded-button flex items-center gap-2 text-sm font-bold transition-all ${
            isProcessing || !text.trim()
              ? 'bg-text-secondary/20 text-text-secondary cursor-not-allowed'
              : 'bg-text-primary text-bg-primary hover:bg-accent active:scale-95'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Cập nhật <Send className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-accent/10 rounded-card border border-accent/20 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-text-primary">{result.message}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.extracted.vessels.map((v: any, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-accent/20 text-accent rounded-full font-medium">
                    🚢 {v.departure} {v.operator}
                  </span>
                ))}
                {result.extracted.pricing.map((p: any, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-text-primary/10 text-text-primary rounded-full font-medium">
                    💰 {p.label}: {p.value}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
