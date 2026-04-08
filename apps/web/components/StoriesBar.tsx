'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { StoriesViewer } from './StoriesViewer';

export function StoriesBar() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const stories = [
    { id: 1, title: 'Bãi Robinson', image: 'https://picsum.photos/seed/robinson/100/100' },
    { id: 2, title: 'BBQ Tối', image: 'https://picsum.photos/seed/bbq/100/100' },
    { id: 3, title: 'Bình Minh', image: 'https://picsum.photos/seed/sunrise/100/100' },
    { id: 4, title: 'Câu Mực', image: 'https://picsum.photos/seed/squid/100/100' },
  ];

  const handleStoryClick = (index: number) => {
    setStartIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <>
      <div className="absolute top-24 left-0 right-0 z-40 overflow-x-auto no-scrollbar pl-[max(1rem,10vw)]">
        <div className="flex gap-4 w-max pr-4">
          {stories.map((story, idx) => (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              key={story.id} 
              onClick={() => handleStoryClick(idx)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full p-[2px] ring-2 ring-[#FEF7FF]/30 transition-all hover:ring-[#FEF7FF]/60 active:scale-90">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-black/20 relative">
                  <Image 
                    src={story.image} 
                    alt={story.title} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#FEF7FF] tracking-tight">{story.title}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <StoriesViewer 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
        initialStoryIndex={startIndex}
      />
    </>
  );
}
