'use client'
import { useEffect, useState } from 'react'
import { Loader2, BarChart3 } from 'lucide-react'
import AchievementTable from '@/components/reports/AchievementTable'
import AuditLogTable from '@/components/reports/AuditLogTable'
import ExportButton from '@/components/reports/ExportButton'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
type Tab = 'achievement' | 'audit'

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('achievement')
  const [selectedQuarters, setSelectedQuarters] = useState<Quarter[]>(['Q1', 'Q2', 'Q3', 'Q4'])
  const [achievementData, setAchievementData] = useState<any[]>([])
  const [auditData, setAuditData] = useState<any[]>([])
  const [loadingAchievement, setLoadingAchievement] = useState(true)
  const [loadingAudit, setLoadingAudit] = useState(false)

  // ✅ 1. Intercept tab clicks to trigger the loader synchronously in the event loop instead of an effect
  const handleTabChange = (tab: Tab) => {
    if (tab === 'audit') {
      setLoadingAudit(true)
    }
    setActiveTab(tab)
  }

  useEffect(() => {
    fetch('/api/reports/achievement')
      .then((r) => r.json())
      .then((d) => setAchievementData(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingAchievement(false));
  }, []);

  // ✅ 2. Removed the synchronous loading state modifier from here
  useEffect(() => {
    if (activeTab === 'audit') {
        fetch('/api/audit')
          .then((r) => r.json())
          .then((d) => setAuditData(Array.isArray(d) ? d : []))
          .catch(console.error)
          .finally(() => setLoadingAudit(false))
    }
  }, [activeTab])

  const toggleQuarter = (q: Quarter) => {
    setSelectedQuarters((prev) =>
      prev.includes(q) ? (prev.length > 1 ? prev.filter((x) => x !== q) : prev) : [...prev, q]
    )
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      {/* Added utility rule so Loader2 actually spins around */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, left: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              borderRadius: '14px', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={22} color="white" />
            </div>
            <div>
              <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
                Reports
              </h1>
              <p style={{ color: '#4a7c6f', fontSize: '14px', margin: '3px 0 0' }}>
                Planned vs Actual achievement · Audit trail
              </p>
            </div>
          </div>
          {activeTab === 'achievement' && (
            <ExportButton label="Export to Excel" />
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', border: '1px solid #c9ebe4', borderRadius: '14px', padding: '4px', marginBottom: '22px', width: 'fit-content', boxShadow: '0 2px 10px rgba(13,148,136,0.05)' }}>
          {([
            { key: 'achievement', label: '📊 Achievement Report' },
            { key: 'audit', label: '🔍 Audit Log' },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)} // ✅ 3. Using the cleaner interaction pipeline wrapper
              style={{
                padding: '9px 20px', borderRadius: '10px', border: 'none',
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                  : 'transparent',
                color: activeTab === tab.key ? 'white' : '#4a7c6f',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                fontFamily: 'Georgia, serif', transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement tab */}
        {activeTab === 'achievement' && (
          <>
            {/* Quarter filter */}
            <div style={{
              background: 'white', border: '1px solid #c9ebe4', borderRadius: '16px',
              padding: '16px 20px', marginBottom: '18px',
              display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
              boxShadow: '0 2px 10px rgba(13,148,136,0.05)',
            }}>
              <span style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '13px' }}>Show quarters:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {QUARTERS.map((q) => {
                  const isSelected = selectedQuarters.includes(q)
                  return (
                    <button
                      key={q}
                      onClick={() => toggleQuarter(q)}
                      style={{
                        padding: '6px 16px', borderRadius: '999px',
                        border: isSelected ? 'none' : '1px solid #c9ebe4',
                        background: isSelected ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : 'white',
                        color: isSelected ? 'white' : '#4a7c6f',
                        fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                        fontFamily: 'Georgia, serif', transition: 'all 0.2s',
                      }}
                    >
                      {q}
                    </button>
                  )
                })}
              </div>
              <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: 'auto' }}>
                {achievementData.length} employee(s)
              </span>
            </div>

            <div style={{
              background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
              boxShadow: '0 4px 24px rgba(13,148,136,0.07)', padding: '24px 28px',
            }}>
              {loadingAchievement ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Loader2 size={28} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                  <p style={{ color: '#4a7c6f', fontSize: '13px' }}>Loading achievement data…</p>
                </div>
              ) : (
                <AchievementTable data={achievementData} visibleQuarters={selectedQuarters} />
              )}
            </div>
          </>
        )}

        {/* Audit tab */}
        {activeTab === 'audit' && (
          <div style={{
            background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
            boxShadow: '0 4px 24px rgba(13,148,136,0.07)', padding: '24px 28px',
          }}>
            {loadingAudit ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Loader2 size={28} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#4a7c6f', fontSize: '13px' }}>Loading audit log…</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h2 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '17px', margin: 0 }}>
                    Audit Trail
                  </h2>
                  <span style={{ color: '#4a7c6f', fontSize: '13px' }}>
                    {auditData.length} entries
                  </span>
                </div>
                <AuditLogTable entries={auditData} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}