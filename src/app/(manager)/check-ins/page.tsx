'use client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import TeamCheckInTable from '@/components/manager/TeamCheckInTable'
import CheckInCommentBox from '@/components/manager/CheckInCommentBox'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

interface TeamMember {
  employeeId: string
  employeeName: string
  department?: string
  checkInId?: string
  isManagerDone: boolean
  managerComment?: string
  goals: any[]
}

interface ActiveCycle {
  activeQuarter: Quarter
  name: string
}

export default function ManagerCheckInsPage() {
  const [cycle, setCycle] = useState<ActiveCycle | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
    // 1. Fetch the active cycle first
    fetch('/api/cycles/active')
      .then((r) => r.json())
      .then((data) => {
        setCycle(data);
        
        // Determine the correct quarter to fetch data for
        const targetQuarter = data?.activeQuarter ?? 'Q1';
        setSelectedQuarter(targetQuarter);

        // 2. Fetch the check-ins using that target quarter immediately
        setLoading(true);
        setSelectedMemberId(null);
        
        return fetch(`/api/manager/check-ins?quarter=${targetQuarter}`);
      })
      .then((r) => r.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // Only runs once on initial component mount

  const selectedMember = members.find((m) => m.employeeId === selectedMemberId)
  const completedCount = members.filter((m) => m.isManagerDone).length

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)',
        position: 'fixed', top: 0, right: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: '0 0 4px' }}>
            Team Check-ins
          </h1>
          <p style={{ color: '#4a7c6f', fontSize: '14px' }}>
            {"Review your team's quarterly achievement updates"}
            {cycle && <span> · Cycle: <strong style={{ color: '#0f4c3a' }}>{cycle.name}</strong></span>}
          </p>
        </div>

        {/* Progress summary */}
        {!loading && members.length > 0 && (
          <div style={{
            background: 'white', border: '1px solid #c9ebe4', borderRadius: '18px',
            padding: '16px 22px', marginBottom: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            boxShadow: '0 2px 12px rgba(13,148,136,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '14px' }}>
                {selectedQuarter} Check-in Progress
              </span>
              <span style={{
                background: completedCount === members.length ? '#f0fdf9' : '#fffbeb',
                color: completedCount === members.length ? '#0d9488' : '#92400e',
                border: `1px solid ${completedCount === members.length ? '#99f6e4' : '#fde68a'}`,
                borderRadius: '999px', padding: '3px 12px',
                fontSize: '13px', fontWeight: 700,
              }}>
                {completedCount} / {members.length} done
              </span>
            </div>
            {/* Mini progress bar */}
            <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', width: '200px', overflow: 'hidden' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                width: `${members.length > 0 ? (completedCount / members.length) * 100 : 0}%`,
                height: '100%', borderRadius: '999px', transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Quarter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {QUARTERS.map((q) => {
            const isActive = q === selectedQuarter
            const isCycleActive = q === cycle?.activeQuarter
            return (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                style={{
                  padding: '10px 22px', borderRadius: '12px',
                  border: isActive ? 'none' : '1px solid #c9ebe4',
                  background: isActive
                    ? 'linear-gradient(135deg, #0d9488, #06b6d4)'
                    : isCycleActive ? '#f0fdf9' : 'white',
                  color: isActive ? 'white' : '#0f4c3a',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  boxShadow: isActive ? '0 4px 12px rgba(13,148,136,0.2)' : 'none',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                {q}
                {isCycleActive && !isActive && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-4px',
                    background: '#0d9488', color: 'white',
                    fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '999px',
                  }}>
                    OPEN
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Main content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={32} color="#0d9488" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Loading team check-ins…</p>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: '24px', border: '1px solid #c9ebe4',
            boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
            padding: '24px 28px',
          }}>
            <TeamCheckInTable
              members={members}
              quarter={selectedQuarter}
              onSelectMember={setSelectedMemberId}
              selectedMemberId={selectedMemberId}
            />

            {/* Comment box — shown when a member is selected and has a check-in */}
            {selectedMember && selectedMember.checkInId && (
              <div style={{ marginTop: '8px' }}>
                <CheckInCommentBox
                  checkInId={selectedMember.checkInId}
                  employeeName={selectedMember.employeeName}
                  existingComment={selectedMember.managerComment}
                  isManagerDone={selectedMember.isManagerDone}
                />
              </div>
            )}

            {/* No check-in yet notice */}
            {selectedMember && !selectedMember.checkInId && (
              <div style={{
                marginTop: '20px', background: '#f8fafc',
                border: '1px solid #e2e8f0', borderRadius: '14px',
                padding: '16px 18px',
              }}>
                <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                  ⏳ <strong>{selectedMember.employeeName}</strong> has not submitted their {selectedQuarter} check-in yet.
                  The comment box will appear once they do.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}