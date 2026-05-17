'use client'
import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface DistributionData {
  byThrustArea?: { name: string; count: number }[]
  byUom?: { name: string; count: number }[]
  byStatus?: { name: string; count: number }[]
}

interface GoalDistributionChartProps {
  data: DistributionData | null
}

type View = 'thrustArea' | 'uom' | 'status'

const COLORS_THRUST = ['#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#e11d48', '#10b981', '#f97316']

const STATUS_COLORS: Record<string, string> = {
  'Not Started': '#94a3b8',
  'On Track': '#f59e0b',
  'Completed': '#0d9488',
}

const UOM_COLORS: Record<string, string> = {
  'min': '#0d9488',
  'max': '#06b6d4',
  'timeline': '#8b5cf6',
  'zero': '#f59e0b',
}

const UOM_LABELS: Record<string, string> = {
  min: 'Higher Better', max: 'Lower Better', timeline: 'Timeline', zero: 'Zero-based',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #c9ebe4', borderRadius: '12px',
      padding: '10px 14px', boxShadow: '0 4px 20px rgba(13,148,136,0.12)',
      fontFamily: 'Georgia, serif',
    }}>
      <p style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#0d9488', fontWeight: 800, fontSize: '14px', margin: 0 }}>
        {payload[0]?.value} goals
      </p>
    </div>
  )
}

export default function GoalDistributionChart({ data }: GoalDistributionChartProps) {
  const [view, setView] = useState<View>('thrustArea')

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4a7c6f', fontSize: '13px', fontFamily: 'Georgia, serif' }}>
        No distribution data available.
      </div>
    )
  }

  const getRawData = () => {
    if (view === 'thrustArea') return data.byThrustArea ?? []
    if (view === 'uom') return (data.byUom ?? []).map((d) => ({ ...d, name: UOM_LABELS[d.name] ?? d.name }))
    return data.byStatus ?? []
  }

  const chartData = getRawData()

  const getBarColor = (entry: { name: string }, index: number) => {
    if (view === 'status') return STATUS_COLORS[entry.name] ?? '#94a3b8'
    if (view === 'uom') {
      const original = data.byUom?.[index]?.name ?? ''
      return UOM_COLORS[original] ?? '#0d9488'
    }
    return COLORS_THRUST[index % COLORS_THRUST.length]
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
        {([
          { key: 'thrustArea', label: 'Thrust Area' },
          { key: 'uom', label: 'UoM Type' },
          { key: 'status', label: 'Status' },
        ] as { key: View; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            style={{
              padding: '6px 14px', borderRadius: '999px',
              border: view === tab.key ? 'none' : '1px solid #c9ebe4',
              background: view === tab.key ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : 'white',
              color: view === tab.key ? 'white' : '#4a7c6f',
              fontWeight: 600, fontSize: '12px', cursor: 'pointer',
              fontFamily: 'Georgia, serif', transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
          No data for this view
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8f4f1" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#4a7c6f', fontSize: 10, fontFamily: 'Georgia, serif' }}
              axisLine={{ stroke: '#c9ebe4' }}
              tickLine={false}
              interval={0}
              angle={chartData.length > 4 ? -25 : 0}
              textAnchor={chartData.length > 4 ? 'end' : 'middle'}
              height={chartData.length > 4 ? 48 : 30}
            />
            <YAxis
              tick={{ fill: '#4a7c6f', fontSize: 11, fontFamily: 'Georgia, serif' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}