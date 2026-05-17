'use client'
import { Share2 } from 'lucide-react'
import SharedGoalPushForm from '@/components/admin/SharedGoalPushForm'

export default function AdminSharedGoalsPage() {
  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)',
        position: 'fixed', top: 0, right: 0, width: '500px', height: '500px',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
            borderRadius: '14px', padding: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Share2 size={22} color="white" />
          </div>
          <div>
            <h1 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '28px', margin: 0 }}>
              Shared Goals
            </h1>
            <p style={{ color: '#4a7c6f', fontSize: '14px', margin: '3px 0 0' }}>
              Push departmental KPIs to multiple employees at once
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: '14px', padding: '14px 18px', marginBottom: '24px',
          display: 'flex', gap: '12px',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>📌</span>
          <div>
            <p style={{ color: '#92400e', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>
              How Shared Goals Work
            </p>
            <ul style={{ color: '#92400e', fontSize: '12px', margin: 0, paddingLeft: '16px', lineHeight: 1.8 }}>
              <li><strong>Title and Target</strong> are read-only for recipients — they cannot change them</li>
              <li>Recipients can only adjust their <strong>Weightage</strong> for this goal</li>
              <li>Achievement updates by the primary owner <strong>sync across all linked sheets</strong></li>
              <li>{"The shared goal counts toward the employeee's 100% weightage total"}</li>
            </ul>
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: 'white', borderRadius: '24px',
          border: '1px solid #c9ebe4',
          boxShadow: '0 4px 24px rgba(13,148,136,0.07)',
          padding: '28px 30px',
        }}>
          <SharedGoalPushForm />
        </div>
      </div>
    </div>
  )
}