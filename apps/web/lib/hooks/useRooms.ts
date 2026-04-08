'use client';

import { useState, useEffect } from 'react';
import { ROOM_PRICES } from '@/lib/constants';

export interface ApiRoom {
  id: string;
  group: string;
  name: string;
  weekdayPrice: number;
  weekendPrice: number;
  capacityStandard: number;
  capacityMax: number;
  extraPersonFeeRate: number;
  extraPersonNote: string;
  description: string;
  features: string[];
  badge?: string;
  images: string[];
}

interface UseRoomsReturn {
  rooms: ApiRoom[];
  isLoading: boolean;
  error: Error | null;
}

// Fallback data mapper to use constants.ts if API fails
const getFallbackRooms = (): ApiRoom[] => {
  return [
    {
      id: "phi-thuyen-2",
      group: "core",
      name: "Căn Phi Thuyền 2 Giường",
      weekdayPrice: ROOM_PRICES["phi-thuyen-2"].weekday,
      weekendPrice: ROOM_PRICES["phi-thuyen-2"].weekend,
      capacityStandard: ROOM_PRICES["phi-thuyen-2"].stdPax,
      capacityMax: ROOM_PRICES["phi-thuyen-2"].maxPax,
      extraPersonFeeRate: ROOM_PRICES["phi-thuyen-2"].extraPaxFeeRate,
      extraPersonNote: "Người thêm (tối đa 2 người ghép): +25% giá phòng/đêm/người",
      description: "Không gian kính rộng đón ánh sáng tự nhiên. Tĩnh lặng, phù hợp cặp đôi hoặc nhóm nhỏ.",
      features: ["2 Giường 1.6m", "Kính tràn viền", "Ánh sáng tự nhiên", "Wifi miễn phí", "Minibar", "Máy sấy tóc", "Điều hòa", "Phòng tắm riêng"],
      badge: "Phổ biến",
      images: [], // Will be mapped below
    },
    {
      id: "phi-thuyen-1",
      group: "core",
      name: "Căn Phi Thuyền 1 Giường",
      weekdayPrice: ROOM_PRICES["phi-thuyen-1"].weekday,
      weekendPrice: ROOM_PRICES["phi-thuyen-1"].weekend,
      capacityStandard: ROOM_PRICES["phi-thuyen-1"].stdPax,
      capacityMax: ROOM_PRICES["phi-thuyen-1"].maxPax,
      extraPersonFeeRate: ROOM_PRICES["phi-thuyen-1"].extraPaxFeeRate,
      extraPersonNote: "Người thứ 3 (tối đa): +50% giá phòng/đêm",
      description: "Khung kính lớn, ánh sáng tự nhiên tràn đầy. Tĩnh lặng, thiết kế mở — lý tưởng cho cặp đôi.",
      features: ["1 Giường 1.6m", "Khung kính lớn", "Ánh sáng tự nhiên", "Wifi miễn phí", "Minibar", "Máy sấy tóc", "Điều hòa", "Phòng tắm riêng"],
      images: [],
    },
    {
      id: "homestay-2",
      group: "core",
      name: "Homestay 2 Giường",
      weekdayPrice: ROOM_PRICES["homestay-2"].weekday,
      weekendPrice: ROOM_PRICES["homestay-2"].weekend,
      capacityStandard: ROOM_PRICES["homestay-2"].stdPax,
      capacityMax: ROOM_PRICES["homestay-2"].maxPax,
      extraPersonFeeRate: ROOM_PRICES["homestay-2"].extraPaxFeeRate,
      extraPersonNote: "Người thêm (tối đa 2 người ghép): +25% giá phòng/đêm/người",
      description: "Thiết kế gần gũi, tiện sinh hoạt chung. Dành cho gia đình hoặc nhóm bạn 3–4 người.",
      features: ["2 Giường 1.4m", "Không gian gia đình", "Tiện sinh hoạt chung", "Wifi miễn phí", "Minibar", "Máy sấy tóc", "Điều hòa", "Phòng tắm riêng"],
      images: [],
    },
    {
      id: "homestay-1",
      group: "core",
      name: "Homestay 1 Giường",
      weekdayPrice: ROOM_PRICES["homestay-1"].weekday,
      weekendPrice: ROOM_PRICES["homestay-1"].weekend,
      capacityStandard: ROOM_PRICES["homestay-1"].stdPax,
      capacityMax: ROOM_PRICES["homestay-1"].maxPax,
      extraPersonFeeRate: ROOM_PRICES["homestay-1"].extraPaxFeeRate,
      extraPersonNote: "Người thứ 3 (tối đa): +50% giá phòng/đêm",
      description: "Không gian riêng tư, ấm cúng, thiết kế tối giản. Dành cho cặp đôi.",
      features: ["1 Giường 1.4m", "Riêng tư", "Ấm cúng", "Wifi miễn phí", "Minibar", "Máy sấy tóc", "Điều hòa", "Phòng tắm riêng"],
      images: [],
    },
  ];
};

// Helper to provide brand-accurate placeholder images
const ensureImages = (rooms: ApiRoom[]): ApiRoom[] => {
  return rooms.map(room => {
    // Check if images array is empty or contains non-existent static paths
    // For MVP phase 1, we replace any missing or broken static paths with placehold.co
    const safeImages = (room.images && room.images.length > 0 && !room.images[0].includes('.jpg')) 
      ? room.images 
      : [`https://placehold.co/600x800/EFEBE5/534135?text=${encodeURIComponent(room.name)}`];
      
    return {
      ...room,
      images: safeImages
    };
  });
};

export function useRooms(): UseRoomsReturn {
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRooms() {
      try {
        const response = await fetch('/api/v1/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms endpoint');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          if (data.success && data.rooms) {
            setRooms(ensureImages(data.rooms));
          } else {
            throw new Error('Invalid data format from rooms endpoint');
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[useRooms] API failed, falling back to constants:', err);
        if (isMounted) {
          setRooms(ensureImages(getFallbackRooms()));
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    }

    fetchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  return { rooms, isLoading, error };
}
