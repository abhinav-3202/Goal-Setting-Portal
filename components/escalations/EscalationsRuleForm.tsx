'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'

interface EscalationRule {
  _id?: string
  ruleType: 'goal_not_submitted' | 'goal_not_approved' | 'checkin_missed'
  thresholdDays: number
  isActive: boolean
}

interface EscalationRuleFormProps {
  rules: EscalationRule[]
  onSave: (updated: EscalationRule[]) => void
}

const RULE_META = [
  {
    type: 'goal_not_submitted' as const,
    label: 'Goal Not Submitted',
    icon: '📝',
    description: 'Escalate when an employee has not submitted their goal sheet within N days of the cycle opening',
    color: '#f59e0b',
  },
  {
    type: 'goal_not_approved' as const,
    label: 'Goal Not Approved',
    icon: '⏳',
    description: 'Escalate when a manager has not approved a submitted goal sheet within N days',
    color: '#e11d48',
  },
  {
    type: 'checkin_missed' as const,
    label: 'Check-in Missed',
    icon: '📊',
    description: 'Escalate when an employee has not submitted their quarterly check-in within N days of the window opening',
    color: '#8b5cf6',
  },
]

export default function EscalationRuleForm({ rules, onSave }: EscalationRuleFormProps) {
  const [localRules, setLocalRules] = useState<EscalationRule[]>(() => {
    return RULE_META.map((meta) => {
      const found = rules.find((r) => r.ruleType === meta.type)
      return found ?? { ruleType: meta.type, thresholdDays: 7, isActive: true }
    })
  })
  const [saving, setSaving] = useState(false)

  const updateRule = (type: string, field: keyof EscalationRule, value: any) => {
    setLocalRules((prev) =>
      prev.map((r) => r.ruleType === type ? { ...r, [field]: value } : r)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/escalations/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: localRules }),
      })
      if (!res.ok) throw new Error('Save failed')
      const saved = await res.json()
      onSave(saved)
      toast.success('Escalation rules saved successfully')
    } catch {
      toast.error('Failed to save rules')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {RULE_META.map((meta) => {
          const rule = localRules.find((r) => r.ruleType === meta.type)!

          return (
            <div key={meta.type} style={{
              background: rule.isActive ? 'white' : '#f8fafc',
              border: `1px solid ${rule.isActive ? '#c9ebe4' : '#e2e8f0'}`,
              borderRadius: '16px', padding: '18px 20px',
              borderLeft: `4px solid ${rule.isActive ? meta.color : '#e2e8f0'}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{meta.icon}</span>
                    <h3 style={{ color: rule.isActive ? '#0f4c3a' : '#94a3b8', fontWeight: 700, fontSize: '15px', margin: 0 }}>
                      {meta.label}
                    </h3>
                    {!rule.isActive && (
                      <span style={{ background: '#f1f5f9', color: '#94a3b8', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
                        Disabled
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#4a7c6f', fontSize: '12px', margin: '0 0 14px', lineHeight: 1.5 }}>
                    {meta.description}
                  </p>

                  {/* Threshold input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px' }}>
                      Trigger after
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={rule.thresholdDays}
                      disabled={!rule.isActive}
                      onChange={(e) => updateRule(meta.type, 'thresholdDays', Number(e.target.value))}
                      style={{
                        width: '64px', padding: '7px 10px',
                        border: `1px solid ${rule.isActive ? '#c9ebe4' : '#e2e8f0'}`,
                        borderRadius: '10px', color: '#0f4c3a',
                        fontSize: '14px', fontWeight: 700,
                        fontFamily: 'Georgia, serif',
                        background: rule.isActive ? 'white' : '#f8fafc',
                        outline: 'none', textAlign: 'center',
                        cursor: rule.isActive ? 'text' : 'not-allowed',
                      }}
                    />
                    <span style={{ color: '#4a7c6f', fontSize: '13px' }}>days</span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => updateRule(meta.type, 'isActive', !rule.isActive)}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: '4px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: rule.isActive ? '#0d9488' : '#94a3b8',
                    fontWeight: 600, fontSize: '12px',
                    fontFamily: 'Georgia, serif',
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}
                >
                  {rule.isActive
                    ? <ToggleRight size={28} />
                    : <ToggleLeft size={28} />}
                  {rule.isActive ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%', padding: '13px',
          background: saving ? '#99f6e4' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
          border: 'none', borderRadius: '12px',
          color: 'white', fontWeight: 700, fontSize: '15px',
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontFamily: 'Georgia, serif', transition: 'opacity 0.2s',
          boxShadow: '0 4px 14px rgba(13,148,136,0.2)',
        }}
      >
        {saving
          ? <><Loader2 size={16} className="animate-spin" /> Saving rules…</>
          : <><Save size={16} /> Save Rule Configuration</>}
      </button>
    </div>
  )
}