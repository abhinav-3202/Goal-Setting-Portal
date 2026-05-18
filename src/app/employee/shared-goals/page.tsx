'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Inbox, Share2 } from 'lucide-react'

interface SharedGoal {
  _id: string
  title: string
  description: string
  target: string
  weightage: number
  uom: string
  thrustArea: string
  sharedFrom?: { name: string }
}

export default function SharedGoalsPage() {
  const router = useRouter()
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [myWeightages, setMyWeightages] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/shared-goals')
      .then(r => r.json())
      .then(data => setSharedGoals(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleWeightageChange = (goalId: string, weightage: number) => {
    setMyWeightages({ ...myWeightages, [goalId]: weightage })
  }

  const handleAccept = async (goalId: string) => {
    try {
      const weightage = myWeightages[goalId] || 10
      const res = await fetch(`/api/shared-goals/${goalId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightage })
      })
      const data = await res.json()
      if (data.success) {
        setSharedGoals(sharedGoals.filter(g => g._id !== goalId))
      }
    } catch (error) {
      console.error('Error accepting goal:', error)
    }
  }

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
            Shared Goals
          </h1>
          <p style={{ color: '#4a7c6f', fontSize: '14px', marginTop: '4px' }}>
            Review and accept goals pushed by your manager
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading shared goals…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && sharedGoals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4' }}>
            <Inbox size={48} color="#c9ebe4" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>
              No shared goals
            </h2>
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>
              You'll see goals shared by your manager here
            </p>
          </div>
        )}

        {/* Goals List */}
        {!loading && sharedGoals.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sharedGoals.map(goal => (
              <div
                key={goal._id}
                style={{
                  background: 'white',
                  border: '1px solid #c9ebe4',
                  borderLeft: '4px solid #f59e0b',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(13,148,136,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '16px', margin: 0 }}>
                      {goal.title}
                    </h3>
                    <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '6px 0 0' }}>
                      {goal.description}
                    </p>
                  </div>
                  <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Share2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Shared
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Target: </span>
                    <span style={{ color: '#0f4c3a', fontWeight: 600 }}>{goal.target}</span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Thrust Area: </span>
                    <span style={{ color: '#0f4c3a', fontWeight: 600 }}>{goal.thrustArea}</span>
                  </div>
                </div>

                {/* Weightage Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#0f4c3a', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                    Your Weightage
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={myWeightages[goal._id] || 10}
                      onChange={e => handleWeightageChange(goal._id, Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right', color: '#0f4c3a', fontWeight: 700, fontSize: '14px' }}>
                      {myWeightages[goal._id] || 10}%
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>
                    Minimum 10% • Maximum 100%
                  </p>
                </div>

                {/* Accept Button */}
                <button
                  onClick={() => handleAccept(goal._id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  Accept Goal
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
