'use client'
import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import EscalationLogTable from '@/components/escalations/EscalationsLogTable'
import EscalationRuleForm from '@/components/escalations/EscalationsRuleForm'

type Tab = 'active' | 'rules'

interface EscalationStats {
  open: number
  resolved: number
  total: number
}

export default function AdminEscalationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [escalations, setEscalations] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [stats, setStats] = useState<EscalationStats>({ open: 0, resolved: 0, total: 0 })
  const [loadingEscalations, setLoadingEscalations] = useState(true)
  const [loadingRules, setLoadingRules] = useState(false)

  // ✅ Clean interaction handler: set the state and the loader at the exact same time
  const handleTabChange = (tab: Tab) => {
    if (tab === 'rules') {
      setLoadingRules(true)
    }
    setActiveTab(tab)
  }

  // Fetch escalation logs on initial layout mount
  useEffect(() => {
    fetch('/api/escalations')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : d.items ?? []
        setEscalations(list)
        setStats({
          open: list.filter((e: any) => e.status !== 'resolved').length,
          resolved: list.filter((e: any) => e.status === 'resolved').length,
          total: list.length,
        })
      })
      .catch(console.error)
      .finally(() => setLoadingEscalations(false))
  }, [])

  // Fetch rules when tab switches (Synchronous state updater completely removed)
  useEffect(() => {
    if (activeTab !== 'rules') return

    fetch('/api/escalations/rules')
      .then((r) => r.json())
      .then((d) => setRules(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingRules(false))
  }, [activeTab])

  const handleResolve = async (escalationId: string) => {
    const res = await fetch(`/api/escalations/${escalationId}/resolve`, { method: 'POST' })
    if (res.ok) {
      setEscalations((prev) =>
        prev.map((e) => e._id === escalationId ? { ...e, status: 'resolved' } : e)
      )
      setStats((s) => ({ ...s, open: s.open - 1, resolved: s.resolved + 1 }))
    }
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      {/* Utility rule injection for functional rotating icons */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, left: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
            borderRadius: '14px', padding: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} color="white" />
          </div>
          <div>
            <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
              Escalations
            </h1>
            <p style={{ color: '#4a7c6f', fontSize: '14px', margin: '3px 0 0' }}>
              Overdue action alerts and escalation rule configuration
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '26px' }}>
          {[
            { label: 'Open Escalations', value: stats.open, bg: '#fff1f2', color: '#be123c', border: '#fecdd3', icon: '🚨' },
            { label: 'Resolved', value: stats.resolved, bg: '#f0fdf9', color: '#0d9488', border: '#99f6e4', icon: '✅' },
            { label: 'Total Logged', value: stats.total, bg: 'white', color: '#0f4c3a', border: '#c9ebe4', icon: '📋' },
          ].map((card) => (
            <div key={card.label} style={{
              background: card.bg, border: `1px solid ${card.border}`,
              borderRadius: '18px', padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(13,148,136,0.05)',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{card.icon}</div>
              <div style={{ color: card.color, fontWeight: 800, fontSize: '28px', fontFamily: 'Georgia, serif' }}>
                {loadingEscalations ? '—' : card.value}
              </div>
              <div style={{ color: '#4a7c6f', fontSize: '12px', marginTop: '3px' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Open escalations alert banner */}
        {!loadingEscalations && stats.open > 0 && (
          <div style={{
            background: '#fff1f2', border: '1px solid #fecdd3',
            borderRadius: '14px', padding: '14px 18px', marginBottom: '22px',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ color: '#be123c', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>
                {stats.open} open escalation{stats.open > 1 ? 's' : ''} require attention
              </p>
              <p style={{ color: '#be123c', fontSize: '12px', margin: 0 }}>
                Review the list below and mark resolved once action has been taken.
                Escalations auto-trigger daily at 8:00 AM based on your rule configuration.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', background: 'white',
          border: '1px solid #c9ebe4', borderRadius: '14px', padding: '4px',
          marginBottom: '22px', width: 'fit-content',
          boxShadow: '0 2px 10px rgba(13,148,136,0.05)',
        }}>
          {([
            { key: 'active', label: '🚨 Active Escalations' },
            { key: 'rules', label: '⚙️ Rule Configuration' },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)} // ✅ Using the wrapper clean handler
              style={{
                padding: '9px 20px', borderRadius: '10px', border: 'none',
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                  : 'transparent',
                color: activeTab === tab.key ? 'white' : '#4a7c6f',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                fontFamily: 'Georgia, serif', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {tab.label}
              {tab.key === 'active' && stats.open > 0 && (
                <span style={{
                  background: activeTab === 'active' ? 'rgba(255,255,255,0.25)' : '#fecdd3',
                  color: activeTab === 'active' ? 'white' : '#be123c',
                  borderRadius: '999px', padding: '0px 7px',
                  fontSize: '11px', fontWeight: 800,
                }}>
                  {stats.open}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active escalations tab */}
        {activeTab === 'active' && (
          <div style={{
            background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
            boxShadow: '0 4px 24px rgba(13,148,136,0.07)', padding: '24px 28px',
          }}>
            {loadingEscalations ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Loader2 size={28} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#4a7c6f', fontSize: '13px' }}>Loading escalations…</p>
              </div>
            ) : (
              <EscalationLogTable
                entries={escalations}
                onResolve={handleResolve}
              />
            )}
          </div>
        )}

        {/* Rules config tab */}
        {activeTab === 'rules' && (
          <div style={{
            background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
            boxShadow: '0 4px 24px rgba(13,148,136,0.07)', padding: '24px 28px',
          }}>
            {/* Rules explainer */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
            }}>
              <p style={{ color: '#92400e', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>
                How Escalation Rules Work
              </p>
              <ul style={{ color: '#92400e', fontSize: '12px', margin: 0, paddingLeft: '16px', lineHeight: 1.8 }}>
                <li><strong>Goal Not Submitted</strong> {"— fires if employee hasn't submitted N days after cycle open"}</li>
                <li><strong>Goal Not Approved</strong> {"— fires if manager hasn't approved N days after submission"}</li>
                <li><strong>Check-in Missed</strong> — fires if check-in not logged N days into an open quarter window</li>
                <li>Escalations auto-run <strong>daily at 8:00 AM</strong> via a scheduled cron job</li>
              </ul>
            </div>

            {loadingRules ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Loader2 size={26} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#4a7c6f', fontSize: '13px' }}>Loading rules…</p>
              </div>
            ) : (
              <EscalationRuleForm
                rules={rules}
                onSave={(updated) => setRules(updated)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}