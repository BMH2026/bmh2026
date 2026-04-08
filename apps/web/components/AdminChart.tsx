'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dataDay = [
  { name: 'Sáng', sold: 4, deposited: 5, empty: 11 },
  { name: 'Trưa', sold: 6, deposited: 6, empty: 8 },
  { name: 'Chiều', sold: 8, deposited: 7, empty: 5 },
  { name: 'Tối', sold: 10, deposited: 8, empty: 2 },
];

const dataWeek = [
  { name: 'T2', sold: 5, deposited: 3, empty: 12 },
  { name: 'T3', sold: 4, deposited: 4, empty: 12 },
  { name: 'T4', sold: 6, deposited: 5, empty: 9 },
  { name: 'T5', sold: 8, deposited: 6, empty: 6 },
  { name: 'T6', sold: 15, deposited: 5, empty: 0 },
  { name: 'T7', sold: 18, deposited: 2, empty: 0 },
  { name: 'CN', sold: 12, deposited: 4, empty: 4 },
];

const dataMonth = [
  { name: 'Tuần 1', sold: 45, deposited: 20, empty: 75 },
  { name: 'Tuần 2', sold: 50, deposited: 25, empty: 65 },
  { name: 'Tuần 3', sold: 80, deposited: 30, empty: 30 },
  { name: 'Tuần 4', sold: 90, deposited: 10, empty: 40 },
];

export function AdminChart() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const getData = () => {
    switch (timeRange) {
      case 'day': return dataDay;
      case 'week': return dataWeek;
      case 'month': return dataMonth;
    }
  };

  return (
    <div className="bg-surface rounded-card shadow-soft border border-glass-border p-4 mt-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-text-primary">Tình trạng phòng</h3>
        <div className="flex bg-bg-secondary rounded-full p-1">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timeRange === range 
                  ? 'bg-text-primary text-bg-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getData()} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            />
            <Tooltip 
              cursor={{ fill: 'var(--glass-bg)' }}
              contentStyle={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: 'var(--text-secondary)' }} />
            <Bar dataKey="sold" name="Đã bán" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
            <Bar dataKey="deposited" name="Đã cọc" stackId="a" fill="#f59e0b" />
            <Bar dataKey="empty" name="Còn trống" stackId="a" fill="#9ca3af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
