'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Settings } from 'lucide-react'
import { Cycle } from '@/src/models/Cycle'

interface CycleData {
  _id?: string
  name: string
  phase: string
  openDate: string
  closeDate: string
  isActive: boolean
}

export default function AdminCyclesPage() {
  const router = useRouter()
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CycleData>({
    name: '',
    phase: 'goal_setting',
    openDate: new Date().toISOString().split('T')[0],
    closeDate: new Date().toISOString().split('T')[0],
    isActive: false
  })

  useEffect(() => {
    fetch('/api/cycles')
      .then(r => r.json())
      .then(data => setCycles(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setCycles([...cycles, data.data])
        setShowForm(false)
        setFormData({
          name: '',
          phase: 'goal_setting',
          openDate: new Date().toISOString().split('T')[0],
          closeDate: new Date().toISOString().split('T')[0],
          isActive: false
        })
      }
    } catch (error) {
      console.error('Error creating cycle:', error)
    }
  }

  const handleToggleActive = async (cycleId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      const data = await res.json()
      if (data.success) {
        setCycles(cycles.map(c => c._id === cycleId ? { ...c, isActive: !isActive } : c))
      }
    } catch (error) {
      console.error('Error updating cycle:', error)
    }
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
              Cycle Management
            </h1>
            <p style={{ color: '#4a7c6f', fontSize: '14px', marginTop: '4px' }}>
              Create and manage performance cycles
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '12px 22px', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', fontFamily: 'Georgia, serif'
            }}
          >
            <Plus size={16} /> New Cycle
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #c9ebe4', padding: '24px', marginBottom: '24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#0f4c3a', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                  Cycle Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c9ebe4',
                    fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box'
                  }}
                  placeholder="e.g., FY2026 Q1"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#0f4c3a', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                  Phase
                </label>
                <select
                  value={formData.phase}
                  onChange={e => setFormData({ ...formData, phase: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c9ebe4',
                    fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box'
                  }}
                >
                  <option value="goal_setting">Goal Setting</option>
                  <option value="q1">Q1</option>
                  <option value="q2">Q2</option>
                  <option value="q3">Q3</option>
                  <option value="q4_annual">Q4 Annual</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#0f4c3a', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                    Open Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.openDate}
                    onChange={e => setFormData({ ...formData, openDate: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c9ebe4',
                      fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#0f4c3a', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                    Close Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.closeDate}
                    onChange={e => setFormData({ ...formData, closeDate: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c9ebe4',
                      fontSize: '14px', fontFamily: 'Georgia, serif', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '12px', background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                    color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif'
                  }}
                >
                  Create Cycle
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '12px', background: 'white', color: '#4a7c6f',
                    border: '1px solid #c9ebe4', borderRadius: '8px', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading cycles…</p>
          </div>
        )}

        {/* Cycles List */}
        {!loading && cycles.length > 0 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {cycles.map(cycle => (
              <div
                key={cycle._id}
                style={{
                  background: 'white',
                  border: cycle.isActive ? '2px solid #0d9488' : '1px solid #c9ebe4',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '16px', margin: 0 }}>
                    {cycle.name}
                  </h3>
                  <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '6px 0 0' }}>
                    {cycle.phase} • {new Date(cycle.openDate).toLocaleDateString()} to {new Date(cycle.closeDate).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    background: cycle.isActive ? '#d1fae5' : '#f3f4f6',
                    color: cycle.isActive ? '#0f4c3a' : '#6b7280',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {cycle.isActive ? '✓ Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(cycle._id, cycle.isActive)}
                    style={{
                      padding: '8px 16px',
                      background: cycle.isActive ? '#fee2e2' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
                      color: cycle.isActive ? '#991b1b' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    {cycle.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && cycles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4' }}>
            <Settings size={48} color="#c9ebe4" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>
              No cycles yet
            </h2>
            <p style={{ color: '#4a7c6f', fontSize: '14px', marginBottom: '24px' }}>
              Create your first performance cycle to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                color: 'white', border: 'none', borderRadius: '8px',
                padding: '12px 28px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}
            >
              Create Cycle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
