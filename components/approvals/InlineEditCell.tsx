'use client'
import { useState, useRef, useEffect } from 'react'
import { Check, Pencil } from 'lucide-react'

interface InlineEditCellProps {
  value: string | number
  onSave: (val: string | number) => void
  type?: 'text' | 'number' | 'date'
  min?: number
  max?: number
}

export default function InlineEditCell({ value, onSave, type = 'text', min, max }: InlineEditCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    const parsed = type === 'number' ? Number(draft) : draft
    onSave(parsed)
    setEditing(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) }
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          ref={inputRef}
          type={type}
          value={draft}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          style={{
            padding: '5px 10px',
            border: '1.5px solid #0d9488',
            borderRadius: '8px',
            color: '#0f4c3a',
            fontSize: '13px',
            width: type === 'number' ? '80px' : '140px',
            outline: 'none',
            background: '#f0fdf9',
            fontFamily: 'Georgia, serif',
          }}
        />
        <button
          onMouseDown={commit}
          style={{
            background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
            border: 'none', borderRadius: '6px',
            padding: '5px 6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <Check size={12} color="white" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', border: '1px dashed #c9ebe4',
        borderRadius: '8px', padding: '5px 10px',
        cursor: 'pointer', color: '#0f4c3a', fontSize: '13px',
        fontFamily: 'Georgia, serif',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0d9488'
        e.currentTarget.style.background = '#f0fdf9'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#c9ebe4'
        e.currentTarget.style.background = 'none'
      }}
    >
      {value}
      <Pencil size={11} color="#0d9488" />
    </button>
  )
}