import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export const maxDuration = 60;

function fallback(models: any[]): any {
  return {
    specificationVersion: models[0].specificationVersion,
    provider: 'fallback',
    modelId: 'fallback',
    defaultObjectGenerationMode: models[0].defaultObjectGenerationMode,
    supportsImageUrls: models[0].supportsImageUrls,
    doGenerate: async (options: any) => {
      for (let i = 0; i < models.length; i++) {
        try { return await models[i].doGenerate(options); } catch (e) { if (i === models.length - 1) throw e; }
      }
    },
    doStream: async (options: any) => {
      for (let i = 0; i < models.length; i++) {
        try { return await models[i].doStream(options); } catch (e) { if (i === models.length - 1) throw e; }
      }
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Nội dung trống' }, { status: 400 });
    }

    const { text: resultText } = await generateText({
      model: fallback([
        google('gemini-2.0-flash-exp'),
        anthropic('claude-3-haiku-20240307')
      ]),
      prompt: `Bạn là trợ lý bóc tách dữ liệu cho Bình Minh Homestay. 
      Hãy bóc tách thông tin về lịch tàu và giá cả từ đoạn văn bản sau và trả về DUY NHẤT một mã JSON hợp lệ.
      
      "${text}"
      
      Hệ thống hiện có các key giá sau (theo phong.pdf — nguồn sự thật):
      - pricing_room_2_bed: Giá phòng 2 giường (ngày thường)
      - pricing_room_1_bed: Giá phòng 1 giường (ngày thường)
      - pricing_speed_boat: Giá vé tàu cao tốc 1 lượt/người (220.000đ)
      - pricing_port_ticket: Vé cảng Ao Tiên 1 lượt/người (55.000đ)
      
      JSON Schema yêu cầu:
      {
        "vessels": [
          { "operator": "Tên hãng", "departure": "HH:MM", "direction": "inbound/outbound/both", "scheduleDate": "YYYY-MM-DD", "note": "" }
        ],
        "pricing": [
          { "key": "pricing_...", "value": "số hoặc text", "label": "Tên mục giá" }
        ]
      }
      
      Nếu không có dữ liệu, hãy trả về mảng rỗng. Chỉ trả về JSON, không có văn bản giải thích.`
    });

    // Clean JSON (remove markdown blocks if present)
    const jsonStr = resultText.replace(/```json\n?|```/g, '').trim();
    const object = JSON.parse(jsonStr);

    const store = getStore();

    // 1. Lưu tàu
    for (const v of object.vessels || []) {
      await store.addVessel({
        operator: v.operator,
        departure: v.departure,
        direction: v.direction as any,
        scheduleDate: v.scheduleDate,
        note: v.note
      });
    }

    // 2. Cập nhật giá
    for (const p of object.pricing || []) {
      await store.updateSetting(p.key, p.value);
    }

    return NextResponse.json({ 
      success: true, 
      extracted: object,
      message: `Đã cập nhật ${object.vessels.length} chuyến tàu và ${object.pricing.length} mục giá.`
    });

  } catch (error) {
    console.error('Lỗi Extraction:', error);
    return NextResponse.json({ error: 'Không thể bóc tách dữ liệu. Vui lòng thử lại.' }, { status: 500 });
  }
}
