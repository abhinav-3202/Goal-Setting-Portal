'use client'
import { useState } from 'react'
import { X, RotateCcw, Loader2 } from 'lucide-react'

interface ReturnModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comment: string) => Promise<void>
  employeeName: string
}

export default function ReturnModal({ isOpen, onClose, onConfirm, employeeName }: ReturnModalProps) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!comment.trim()) return
    setLoading(true)
    try {
      await onConfirm(comment.trim())
      setComment('')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,76,58,0.3)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'white', borderRadius: '24px',
        border: '1px solid #c9ebe4',
        boxShadow: '0 20px 60px rgba(13,148,136,0.15)',
        padding: '28px', width: '100%', maxWidth: '480px',
        fontFamily: 'Georgia, serif',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '20px', margin: 0 }}>Return for Rework</h2>
            <p style={{ color: '#4a7c6f', fontSize: '13px', margin: '4px 0 0' }}>Goals for: <strong>{employeeName}</strong></p>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Warning */}
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
        }}>
          <p style={{ color: '#9a3412', fontSize: '13px', margin: 0 }}>
            The goal sheet will be returned to the employee with your comment. They will need to revise and resubmit.
          </p>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '8px' }}>
            Reason for return <span style={{ color: '#e11d48' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain what changes are needed..."
            rows={4}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid #c9ebe4', borderRadius: '12px',
              color: '#0f4c3a', fontSize: '13px',
              outline: 'none', resize: 'vertical',
              fontFamily: 'Georgia, serif',
              boxSizing: 'border-box',
            }}
          />
          {!comment.trim() && (
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Comment is required</p>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px',
              border: '1.5px solid #c9ebe4', borderRadius: '12px',
              background: 'white', color: '#0f4c3a', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!comment.trim() || loading}
            style={{
              flex: 2, padding: '11px',
              background: !comment.trim() || loading ? '#fecdd3' : 'linear-gradient(135deg, #e11d48, #fb7185)',
              border: 'none', borderRadius: '12px',
              color: 'white', fontWeight: 700, fontSize: '14px',
              cursor: !comment.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Returning…</>
              : <><RotateCcw size={14} /> Return to Employee</>}
          </button>
        </div>
      </div>
    </div>
  )
}