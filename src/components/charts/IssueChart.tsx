"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  count: number;
}

interface IssueChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-[#1F1F1F] p-3 rounded-lg shadow-xl shadow-black">
        <p className="text-gray-400 text-xs font-semibold mb-1">{label}</p>
        <p className="text-white font-bold text-lg">
          <span className="text-[#DC2626] mr-2">●</span>
          {payload[0].value} <span className="text-gray-500 text-sm font-medium">Issued</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function IssueChart({ data }: IssueChartProps) {
  return (
    <div className="w-full h-full min-h-[120px] mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2A2A2A', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#DC2626" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorCount)" 
            isAnimationActive={true}
            animationDuration={1500}
            activeDot={{ r: 6, fill: '#DC2626', stroke: '#111111', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
