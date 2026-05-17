'use client'
import { useEffect, useState } from 'react'
import { Loader2, TrendingUp } from 'lucide-react'
import QoQTrendChart from '@/src/components/analytics/QoQTrendChart'
import CompletionHeatmap from '@/src/components/analytics/CompletionHeatmap'
import GoalDistributionChart from '@/src/components/analytics/GoalDistributionChart'
import ManagerEffectivenessTable from '@/src/components/analytics/ManagerEffectivenessTable'
import AnalyticsFilterBar from '@/components/analytics/AnalyticsFilterBar'

interface Filters {
  department: string
  quarter: string
  managerId: string
}

export default function AdminAnalyticsPage() {
  const [filters, setFilters] = useState<Filters>({ department: 'all', quarter: 'all', managerId: 'all' })

  const [trendsData, setTrendsData] = useState<any[]>([])
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [distributionData, setDistributionData] = useState<any>(null)
  const [effectivenessData, setEffectivenessData] = useState<any[]>([])

  const [loadingTrends, setLoadingTrends] = useState(true)
  const [loadingHeatmap, setLoadingHeatmap] = useState(true)
  const [loadingDist, setLoadingDist] = useState(true)
  const [loadingEffect, setLoadingEffect] = useState(true)

  const buildQuery = (base: string) => {
    const params = new URLSearchParams()
    if (filters.department !== 'all') params.set('department', filters.department)
    if (filters.quarter !== 'all') params.set('quarter', filters.quarter)
    if (filters.managerId !== 'all') params.set('managerId', filters.managerId)
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  useEffect(() => {
    setLoadingTrends(true)
    fetch(buildQuery('/api/analytics/trends'))
      .then((r) => r.json())
      .then((d) => setTrendsData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingTrends(false))
  }, [filters])

  useEffect(() => {
    setLoadingHeatmap(true)
    fetch(buildQuery('/api/analytics/heatmap'))
      .then((r) => r.json())
      .then((d) => setHeatmapData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingHeatmap(false))
  }, [filters])

  useEffect(() => {
    setLoadingDist(true)
    fetch(buildQuery('/api/analytics/distribution'))
      .then((r) => r.json())
      .then(setDistributionData)
      .catch(console.error)
      .finally(() => setLoadingDist(false))
  }, [filters])

  useEffect(() => {
    setLoadingEffect(true)
    fetch(buildQuery('/api/analytics/manager-effectiveness'))
      .then((r) => r.json())
      .then((d) => setEffectivenessData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingEffect(false))
  }, [filters])

  const SectionCard = ({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) => (
    <div style={{
      background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
      boxShadow: '0 4px 24px rgba(13,148,136,0.07)', padding: '24px 28px',
    }}>
      <h2 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '17px', margin: '0 0 20px' }}>{title}</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Loader2 size={26} color="#0d9488" style={{ margin: '0 auto 10px', display: 'block', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#4a7c6f', fontSize: '13px' }}>Loading…</p>
        </div>
      ) : children}
    </div>
  )

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, right: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
            borderRadius: '14px', padding: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>Analytics</h1>
            <p style={{ color: '#4a7c6f', fontSize: '14px', margin: '3px 0 0' }}>
              Quarter-on-quarter trends, heatmaps & goal distribution
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          background: 'white', borderRadius: '18px', border: '1px solid #c9ebe4',
          boxShadow: '0 2px 10px rgba(13,148,136,0.05)',
          padding: '16px 22px', marginBottom: '24px',
        }}>
          <AnalyticsFilterBar filters={filters} onChange={setFilters} />
        </div>

        {/* Grid: Trends + Heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <SectionCard title="📈 Quarter-on-Quarter Trend" loading={loadingTrends}>
            <QoQTrendChart data={trendsData} />
          </SectionCard>
          <SectionCard title="🔥 Completion Heatmap" loading={loadingHeatmap}>
            <CompletionHeatmap data={heatmapData} />
          </SectionCard>
        </div>

        {/* Grid: Distribution + Manager effectiveness */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <SectionCard title="🎯 Goal Distribution" loading={loadingDist}>
            <GoalDistributionChart data={distributionData} />
          </SectionCard>
          <SectionCard title="👔 Manager Effectiveness" loading={loadingEffect}>
            <ManagerEffectivenessTable data={effectivenessData} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}