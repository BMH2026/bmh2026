'use client';

import { useState } from 'react';
import Markdown from 'react-markdown';
import { User } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Home, Ship, Info, Tent, Map, Car, Utensils, Check, Calendar, Sun, Moon, ArrowRight, BedDouble, AlertCircle, Users } from 'lucide-react';
import { QuickActionModal } from './QuickActionModal';

// Lightweight mapped icons for general AI usage
const iconMap: Record<string, React.ElementType> = {
  Home, Ship, Info, Tent, Map, Car, Utensils, Check, Calendar, Sun, Moon, ArrowRight
};

const getIcon = (name: string) => {
  // AI might send names with different cases or with 'Icon' trailing
  const normalized = name.replace(/Icon$/, '').trim();
  const IconCmp = iconMap[normalized] || iconMap[normalized.charAt(0).toUpperCase() + normalized.slice(1)] || Check;
  return <IconCmp className="w-5 h-5" strokeWidth={1.5} />;
};

// Type an toàn cho choice
interface OptionChoice {
  icon: string;
  label: string;
  value: string;
}

// Type an toàn cho tool invocation args của show_options
interface ShowOptionsArgs {
  question: string;
  choices: OptionChoice[];
}

// Type an toàn cho show_room_details
interface ShowRoomDetailsArgs {
  roomName: string;
  priceWeekday: string;
  priceWeekend: string;
  capacity: string;
  amenities: string[];
  warnings: string[];
}

// Type an toàn cho show_service_card
interface ShowServiceCardArgs {
  title: string;
  price: string;
  icon: string;
  description: string;
  highlights: string[];
  warnings: string[];
}

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  toolInvocations?: Array<{
    toolName: string;
    state: string;
    args?: Record<string, unknown>;
  }>;
  onOptionClick?: (value: string) => void;
}

function OptionPills({
  args,
  onOptionClick,
}: {
  args: ShowOptionsArgs;
  onOptionClick: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {args.question && (
        <p className="text-sm text-text-primary/80 font-medium mb-1">
          {args.question}
        </p>
      )}
      <AnimatePresence>
        {(args.choices ?? []).map((choice, i) => (
          <motion.button
            key={choice.value + i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 220, damping: 26 }}
            onClick={() => onOptionClick(choice.label)}
            className="relative overflow-hidden flex items-center gap-3 w-full px-5 py-4 rounded-[24px] bg-bg-secondary/50 border border-text-primary/10 text-left text-base font-medium text-text-primary transition-all after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
          >
            {choice.icon ? (
               <span className="text-text-primary/70 shrink-0 flex items-center justify-center">
                 {getIcon(choice.icon)}
               </span>
            ) : null}
            <span className="leading-snug">{choice.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

function RoomDetailCard({ args }: { args: ShowRoomDetailsArgs }) {
  return (
    <div className="mt-3 w-full bg-bg-secondary rounded-[28px] overflow-hidden border border-text-primary/10 flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-text-primary/5 px-5 py-4 border-b border-text-primary/5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-bg-primary flex items-center justify-center text-accent shrink-0">
          <BedDouble className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-text-primary leading-tight font-serif mt-0.5">{args.roomName}</h3>
          <p className="text-xs text-text-primary/60 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" strokeWidth={2} />
            {args.capacity}
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-2 gap-[1px] bg-text-primary/10">
        <div className="bg-bg-secondary p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[0.6875rem] uppercase tracking-wider text-text-primary/50 font-bold mb-1">Ngày thường</span>
          <span className="text-sm font-bold text-accent">{args.priceWeekday}</span>
        </div>
        <div className="bg-bg-secondary p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[0.6875rem] uppercase tracking-wider text-text-primary/50 font-bold mb-1">Cuối tuần/Lễ</span>
          <span className="text-sm font-bold text-accent">{args.priceWeekend}</span>
        </div>
      </div>

      {/* Tags Area */}
      <div className="px-5 py-4 flex flex-col gap-3 bg-bg-primary">
        {(args.amenities?.length > 0 || args.warnings?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {args.amenities?.map((amenity, idx) => (
              <span key={`am-${idx}`} className="px-2.5 py-1 bg-green-500/10 text-green-700 text-[0.6875rem] font-bold rounded-full flex items-center gap-1 border border-green-500/20">
                <Check className="w-3 h-3" strokeWidth={2.5} />
                {amenity}
              </span>
            ))}
            {args.warnings?.map((warning, idx) => (
              <span key={`wn-${idx}`} className="px-2.5 py-1 bg-red-500/10 text-red-600 text-[0.6875rem] font-bold rounded-full flex items-center gap-1 border border-red-500/20">
                <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                {warning}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-1 flex items-center justify-between text-[0.6875rem] text-text-primary/40 font-medium tracking-wide border-t border-text-primary/5 pt-3">
          <span>Check-in: Sau 14:00</span>
          <span>Check-out: Trước 12:00</span>
        </div>
      </div>
    </div>
  );
}

function ServiceDetailCard({ args }: { args: ShowServiceCardArgs }) {
  return (
    <div className="mt-3 w-full bg-bg-secondary rounded-[28px] overflow-hidden border border-text-primary/10 flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header with Title & Description */}
      <div className="bg-text-primary/5 px-5 py-5 border-b border-text-primary/5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center text-accent shrink-0">
            {args.icon ? getIcon(args.icon) : <Info className="w-5 h-5" strokeWidth={1.5} />}
          </div>
          <div className="flex-1 mt-1">
            <h3 className="font-heading font-bold text-lg text-text-primary leading-tight font-serif">{args.title}</h3>
          </div>
        </div>
        {args.description && (
          <p className="text-xs text-text-primary/70 leading-relaxed font-medium bg-bg-primary/50 px-3 py-2 rounded-xl">
            {args.description}
          </p>
        )}
      </div>

      {/* Hero Pricing */}
      <div className="bg-accent/10 px-5 py-4 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-black text-accent">{args.price}</span>
      </div>

      {/* Tags Area */}
      <div className="px-5 py-4 flex flex-col gap-3 bg-bg-primary">
        {(args.highlights?.length > 0 || args.warnings?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {args.highlights?.map((hl, idx) => (
              <span key={`hl-${idx}`} className="px-2.5 py-1 bg-green-500/10 text-green-700 text-[0.6875rem] font-bold rounded-full flex items-center gap-1 border border-green-500/20">
                <Check className="w-3 h-3" strokeWidth={2.5} />
                {hl}
              </span>
            ))}
            {args.warnings?.map((warning, idx) => (
              <span key={`wn-${idx}`} className="px-2.5 py-1 bg-red-500/10 text-red-600 text-[0.6875rem] font-bold rounded-full flex items-center gap-1 border border-red-500/20">
                <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                {warning}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatBubble({ role, content, isTyping, toolInvocations, onOptionClick }: ChatBubbleProps) {
  const isUser = role === 'user';
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  // Tìm tool invocation show_options (chỉ render khi state = 'call' — chưa có result)
  const showOptions = toolInvocations?.find(
    (t) => t.toolName === 'show_options' && t.state === 'call'
  );
  const showOptionsArgs = showOptions?.args as ShowOptionsArgs | undefined;

  // Tìm tool invocation show_room_details
  const showRoomDetails = toolInvocations?.find(
    (t) => t.toolName === 'show_room_details' && (t.state === 'call' || t.state === 'result')
  );
  const showRoomDetailsArgs = showRoomDetails?.args as ShowRoomDetailsArgs | undefined;

  // Tìm tool invocation show_service_card
  const showServiceCard = toolInvocations?.find(
    (t) => t.toolName === 'show_service_card' && (t.state === 'call' || t.state === 'result')
  );
  const showServiceCardArgs = showServiceCard?.args as ShowServiceCardArgs | undefined;

  // Không render bubble rỗng hoàn toàn (chỉ có tool call, không có text)
  const hasTextContent = content.trim().length > 0;
  const hasOptions = !!showOptionsArgs?.choices?.length;
  const hasRoomCard = !!showRoomDetailsArgs?.roomName;
  const hasServiceCard = !!showServiceCardArgs?.title;

  if (!hasTextContent && !hasOptions && !hasRoomCard && !hasServiceCard && !isTyping) return null;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 mr-2 flex items-center justify-center text-bg-primary overflow-hidden relative self-end mb-1">
          <Image src="/longxiavatar.jpg" alt="Long Xì AI" fill className="object-cover" />
        </div>
      )}
      
      <div
        className={`px-5 py-4 w-fit max-w-[85%] ${
          isUser
            ? 'bg-text-primary text-bg-primary rounded-[24px] rounded-br-[6px] ml-auto'
            : 'bg-bg-secondary/40 border border-text-primary/5 text-text-primary rounded-[24px] rounded-bl-[6px]'
        }`}
      >
        {isTyping ? (
          <div className="flex gap-2 items-center h-6 px-2 opacity-60 animate-pulse">
            <span className="text-sm font-medium">Long Xì đang viết...</span>
          </div>
        ) : (
          <>
            {hasTextContent && (
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-text-primary/5 prose-pre:text-text-primary prose-ul:list-none prose-ul:pl-0 prose-li:my-1 prose-li:bg-bg-secondary prose-li:px-3 prose-li:py-2 prose-li:rounded-xl prose-li:text-sm prose-li:border prose-li:border-text-primary/5">
                <Markdown 
                  urlTransform={(url) => url} // Đảm bảo không bị sanitize mất thuộc tính tel: của React Markdown
                  components={{
                    a: ({ node, ...props }) => {
                      const isTel = props.href?.startsWith('tel:');
                      return (
                        <a 
                          {...props} 
                          target={isTel ? "_top" : "_blank"}
                          rel="noopener noreferrer"
                          className="bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-[12px] font-bold no-underline hover:bg-accent/8 transition-colors inline-block text-center mx-1"
                          onClick={(e) => {
                            if (isTel) {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsPhoneModalOpen(true);
                            }
                          }}
                        />
                      );
                    }
                  }}
                >
                  {content.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')}
                </Markdown>
              </div>
            )}

            {hasOptions && onOptionClick && (
              <OptionPills
                args={showOptionsArgs!}
                onOptionClick={onOptionClick}
              />
            )}

            {hasRoomCard && (
               <RoomDetailCard args={showRoomDetailsArgs!} />
            )}

            {hasServiceCard && (
               <ServiceDetailCard args={showServiceCardArgs!} />
            )}

          </>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-bg-secondary flex-shrink-0 ml-2 flex items-center justify-center text-text-secondary border border-glass-border self-end mb-1">
          <User className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}

      {/* Integrate M3E Phone Modal directly into Chat Bubble instance */}
      <QuickActionModal 
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Gọi Mr. Hoàng - Quản lý"
        subtitle="+84 965 312 678"
        largeSubtitle={true}
        icon={<Phone className="w-8 h-8" />}
        confirmLabel="Gọi ngay"
        onConfirm={() => window.location.href = "tel:+84965312678"}
        confirmColor="bg-text-primary"
      />
    </div>
  );
}
