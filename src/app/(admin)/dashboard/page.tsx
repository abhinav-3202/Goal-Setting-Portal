'use client'
import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import CompletionDashboard from '@/src/components/reports/CompletionDashboard'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

interface DashboardData {
  employees: any[]
  totalEmployees: number
  completedCount: number
}

export default function AdminDashboardPage() {
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1')
  const [activeQuarter, setActiveQuarter] = useState<Quarter>('Q1')
  const [data, setData] = useState<DashboardData>({ employees: [], totalEmployees: 0, completedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = (quarter: Quarter) => {
    setLoading(true)
    fetch(`/api/reports/completion?quarter=${quarter}`)
      .then((r) => r.json())
      .then((d) => {
        setData({
          employees: d.employees ?? [],
          totalEmployees: d.totalEmployees ?? 0,
          completedCount: d.completedCount ?? 0,
        })
        setLastUpdated(new Date())
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Get active quarter from cycle
    fetch('/api/cycles/active')
      .then((r) => r.json())
      .then((d) => {
        const q = d?.activeQuarter ?? 'Q1'
        setActiveQuarter(q)
        setSelectedQuarter(q)
        fetchData(q)
      })
      .catch(() => fetchData('Q1'))
  }, [])

  const handleQuarterChange = (q: Quarter) => {
    setSelectedQuarter(q)
    fetchData(q)
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, right: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              borderRadius: '14px', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
                Completion Dashboard
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '14px', margin: '3px 0 0' }}>
                Real-time check-in completion across the organisation
                {lastUpdated && (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {' '}· Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchData(selectedQuarter)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              border: '1px solid #c9ebe4', borderRadius: '12px',
              background: 'white', color: '#0d9488', fontWeight: 600, fontSize: '13px',
              padding: '10px 18px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Georgia, serif', transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Quarter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {QUARTERS.map((q) => {
            const isSelected = q === selectedQuarter
            const isActive = q === activeQuarter
            return (
              <button
                key={q}
                onClick={() => handleQuarterChange(q)}
                style={{
                  padding: '10px 24px', borderRadius: '12px',
                  border: isSelected ? 'none' : '1px solid #c9ebe4',
                  background: isSelected
                    ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                    : isActive ? '#f0fdf9' : 'white',
                  color: isSelected ? 'white' : '#0f4c3a',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  boxShadow: isSelected ? '0 4px 12px rgba(13,148,136,0.2)' : 'none',
                  position: 'relative', transition: 'all 0.2s',
                }}
              >
                {q}
                {isActive && !isSelected && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-4px',
                    background: '#0d9488', color: 'white',
                    fontSize: '9px', fontWeight: 700,
                    padding: '1px 5px', borderRadius: '999px',
                  }}>
                    LIVE
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Dashboard content */}
        <div style={{
          background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)', padding: '28px 30px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading completion data…</p>
            </div>
          ) : (
            <CompletionDashboard
              data={data.employees}
              quarter={selectedQuarter}
              totalEmployees={data.totalEmployees}
              completedCount={data.completedCount}
            />
          )}
        </div>
      </div>
    </div>
  )
}