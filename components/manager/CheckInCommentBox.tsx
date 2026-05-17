'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { MessageSquare, CheckCircle, Loader2 } from 'lucide-react'

interface CheckInCommentBoxProps {
  checkInId: string
  employeeName: string
  existingComment?: string
  isManagerDone?: boolean
}

export default function CheckInCommentBox({ checkInId, employeeName, existingComment, isManagerDone }: CheckInCommentBoxProps) {
  const [comment, setComment] = useState(existingComment ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDone, setIsDone] = useState(isManagerDone ?? false)

  const handleSave = async () => {
    if (!comment.trim()) {
      toast.error('Please add a comment before completing the check-in')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(`/api/manager/check-ins/${checkInId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success(`Check-in for ${employeeName} marked complete`)
      setIsDone(true)
    } catch {
      toast.error('Failed to save comment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      background: isDone ? '#f0fdf9' : 'white',
      border: isDone ? '1.5px solid #0d9488' : '1px solid #c9ebe4',
      borderRadius: '16px', padding: '20px',
      marginTop: '20px', fontFamily: 'Georgia, serif',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          background: isDone ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : '#f0fdf9',
          borderRadius: '8px', padding: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={16} color={isDone ? 'white' : '#0d9488'} />
        </div>
        <div>
          <h4 style={{ color: '#0f4c3a', fontWeight: 700, fontSize: '15px', margin: 0 }}>Manager Check-in Comment</h4>
          <p style={{ color: '#4a7c6f', fontSize: '12px', margin: '2px 0 0' }}>
            {isDone ? '✓ Check-in completed' : `Document your discussion with ${employeeName}`}
          </p>
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isDone}
        placeholder={`Add your structured check-in notes for ${employeeName}... (e.g. progress updates, blockers, action items)`}
        rows={4}
        style={{
          width: '100%', padding: '12px 14px',
          border: `1px solid ${isDone ? '#99f6e4' : '#c9ebe4'}`,
          borderRadius: '12px', color: '#0f4c3a', fontSize: '13px',
          outline: 'none', resize: 'vertical',
          fontFamily: 'Georgia, serif',
          background: isDone ? '#f0fdf9' : 'white',
          cursor: isDone ? 'not-allowed' : 'text',
          boxSizing: 'border-box',
          lineHeight: 1.6,
        }}
      />

      {!isDone && (
        <button
          onClick={handleSave}
          disabled={isSaving || !comment.trim()}
          style={{
            marginTop: '12px', width: '100%', padding: '11px',
            background: isSaving || !comment.trim()
              ? '#99f6e4'
              : 'linear-gradient(135deg, #0d9488, #06b6d4)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: 700, fontSize: '14px',
            cursor: isSaving || !comment.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'opacity 0.2s',
          }}
        >
          {isSaving
            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
            : <><CheckCircle size={14} /> Complete Check-in</>}
        </button>
      )}

      {isDone && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '12px', padding: '10px',
          background: '#ccfbf1', borderRadius: '10px',
          color: '#0d9488', fontSize: '13px', fontWeight: 600,
        }}>
          <CheckCircle size={15} />
          Check-in completed and saved
        </div>
      )}
    </div>
  )
}