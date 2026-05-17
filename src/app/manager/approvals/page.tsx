'use client'
import { useEffect, useState } from 'react'
import { Loader2, CheckSquare } from 'lucide-react'
import PendingList from '@/components/approvals/PendingList'

interface Stats {
  pending: number
  approvedToday: number
  totalReports: number
}

export default function ManagerApprovalsPage() {
  const [items, setItems] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, approvedToday: 0, totalReports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/approvals')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items ?? []
        setItems(list)
        setStats({
          pending: list.length,
          approvedToday: data.approvedToday ?? 0,
          totalReports: data.totalReports ?? list.length,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, right: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              borderRadius: '14px', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckSquare size={22} color="white" />
            </div>
            <div>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
                Goal Approvals
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '14px', margin: '3px 0 0' }}>
                {"Review and approve your team's goal sheets"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Pending Review', value: stats.pending, bg: '#fffbeb', color: '#92400e', border: '#fde68a', icon: '⏳' },
            { label: 'Approved Today', value: stats.approvedToday, bg: '#f0fdf9', color: '#0d9488', border: '#99f6e4', icon: '✅' },
            { label: 'Total Reports', value: stats.totalReports, bg: 'white', color: '#0f4c3a', border: '#c9ebe4', icon: '👥' },
          ].map((card) => (
            <div key={card.label} style={{
              background: card.bg, border: `1px solid ${card.border}`,
              borderRadius: '18px', padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(13,148,136,0.05)',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ color: card.color, fontWeight: 800, fontSize: '26px', fontFamily: 'Georgia, serif' }}>
                {loading ? '—' : card.value}
              </div>
              <div style={{ color: '#4a7c6f', fontSize: '12px', marginTop: '3px' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading pending approvals…</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '17px', margin: 0 }}>
                Pending Submissions
                {items.length > 0 && (
                  <span style={{
                    marginLeft: '10px', background: '#fffbeb', color: '#92400e',
                    border: '1px solid #fde68a', borderRadius: '999px',
                    padding: '2px 10px', fontSize: '13px', fontWeight: 700,
                  }}>
                    {items.length}
                  </span>
                )}
              </h2>
            </div>
            <PendingList items={items} />
          </>
        )}
      </div>
    </div>
  )
}