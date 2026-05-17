'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface TrendPoint {
  quarter: string
  [employeeName: string]: string | number
}

interface QoQTrendChartProps {
  data: TrendPoint[]
}

const COLORS = [
  '#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#f59e0b', '#e11d48', '#10b981', '#f97316',
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #c9ebe4',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: '0 4px 20px rgba(13,148,136,0.12)',
      fontFamily: 'Georgia, serif',
    }}>
      <p style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '13px', margin: '0 0 8px' }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#4a7c6f', fontSize: '12px' }}>{entry.name}:</span>
          <span style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '12px' }}>
            {Math.round((entry.value ?? 0) * 100)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function QoQTrendChart({ data }: QoQTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4a7c6f', fontSize: '13px', fontFamily: 'Georgia, serif' }}>
        No trend data available for the selected filters.
      </div>
    )
  }

  // Extract employee/dept keys (all keys except 'quarter')
  const seriesKeys = Object.keys(data[0] ?? {}).filter((k) => k !== 'quarter')

  return (
    <div>
      {/* Legend pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {seriesKeys.map((key, i) => (
          <span key={key} style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '999px', padding: '3px 10px',
            fontSize: '11px', fontWeight: 600, color: '#0f4c3a',
            fontFamily: 'Georgia, serif',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            {key}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f4f1" />
          <XAxis
            dataKey="quarter"
            tick={{ fill: '#4a7c6f', fontSize: 12, fontFamily: 'Georgia, serif' }}
            axisLine={{ stroke: '#c9ebe4' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fill: '#4a7c6f', fontSize: 11, fontFamily: 'Georgia, serif' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 5, fill: COLORS[i % COLORS.length], strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: 'white' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}