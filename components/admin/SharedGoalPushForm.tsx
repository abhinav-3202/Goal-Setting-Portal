'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Send, Users } from 'lucide-react'

interface Employee {
  _id: string
  name: string
  email: string
  department?: string
}

const THRUST_AREAS = [
  'Revenue Growth', 'Cost Optimisation', 'Customer Satisfaction',
  'People Development', 'Process Improvement', 'Safety & Compliance',
  'Innovation', 'Digital Transformation',
]

const UOM_OPTIONS = [
  { value: 'min', label: 'Higher is Better (Min)' },
  { value: 'max', label: 'Lower is Better (Max)' },
  { value: 'timeline', label: 'Timeline (Date-based)' },
  { value: 'zero', label: 'Zero-based (0 = Success)' },
]

export default function SharedGoalPushForm() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [form, setForm] = useState({
    thrustArea: '',
    title: '',
    description: '',
    uom: '',
    target: '',
  })

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setEmployees(data))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setFetching(false))
  }, [])

  const toggleEmployee = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id])
  }

  const toggleAll = () => {
    setSelected(selected.length === employees.length ? [] : employees.map((e) => e._id))
  }

  const handleSubmit = async () => {
    if (!form.thrustArea || !form.title || !form.uom || !form.target) {
      toast.error('Please fill in all required fields')
      return
    }
    if (selected.length === 0) {
      toast.error('Select at least one employee')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/shared-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, employeeIds: selected }),
      })
      if (!res.ok) throw new Error('Push failed')
      toast.success(`Shared KPI pushed to ${selected.length} employee(s)`)
      setForm({ thrustArea: '', title: '', description: '', uom: '', target: '' })
      setSelected([])
    } catch {
      toast.error('Failed to push shared goal')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    borderRadius: '10px', border: '1px solid #c9ebe4',
    color: '#0f4c3a', fontSize: '13px',
    outline: 'none', fontFamily: 'Georgia, serif',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontFamily: 'Georgia, serif' }}>

      {/* Left: KPI details */}
      <div>
        <h3 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '17px', marginBottom: '18px' }}>KPI Details</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Thrust Area <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <select value={form.thrustArea} onChange={(e) => setForm({ ...form, thrustArea: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select thrust area</option>
              {THRUST_AREAS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              KPI Title <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Departmental NPS Score" style={inputStyle} />
          </div>

          <div>
            <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the KPI..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Unit of Measurement <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <select value={form.uom} onChange={(e) => setForm({ ...form, uom: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select UoM</option>
              {UOM_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              Target <span style={{ color: '#e11d48' }}>*</span>
              <span style={{ color: '#4a7c6f', fontWeight: 400, fontSize: '12px', marginLeft: '6px' }}>(read-only for recipients)</span>
            </label>
            <input
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              type={form.uom === 'timeline' ? 'date' : 'number'}
              placeholder={form.uom === 'zero-based' ? '0' : 'Enter target value'}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Right: Employee selection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ color: '#0f4c3a', fontWeight: 800, fontSize: '17px', margin: 0 }}>Select Employees</h3>
          <button
            onClick={toggleAll}
            style={{
              background: 'none', border: '1px solid #c9ebe4',
              borderRadius: '8px', padding: '5px 12px',
              color: '#0d9488', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {selected.length === employees.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#4a7c6f' }}>
            <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '13px' }}>Loading employees…</p>
          </div>
        ) : (
          <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {employees.map((emp) => {
              const isSelected = selected.includes(emp._id)
              return (
                <div
                  key={emp._id}
                  onClick={() => toggleEmployee(emp._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: isSelected ? '#f0fdf9' : 'white',
                    border: isSelected ? '1.5px solid #0d9488' : '1px solid #c9ebe4',
                    borderRadius: '12px', padding: '10px 14px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: isSelected ? 'none' : '1.5px solid #c9ebe4',
                    background: isSelected ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{
                    background: isSelected ? 'linear-gradient(135deg, #0d9488, #06b6d4)' : '#e2e8f0',
                    color: isSelected ? 'white' : '#64748b',
                    borderRadius: '50%', width: '30px', height: '30px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700,
                  }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ color: '#0f4c3a', fontWeight: 600, fontSize: '13px', margin: 0 }}>{emp.name}</p>
                    <p style={{ color: '#4a7c6f', fontSize: '11px', margin: '1px 0 0' }}>
                      {emp.email}{emp.department && ` · ${emp.department}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selected.length > 0 && (
          <div style={{
            background: '#f0fdf9', border: '1px solid #99f6e4',
            borderRadius: '10px', padding: '10px 14px', marginTop: '12px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Users size={14} color="#0d9488" />
            <span style={{ color: '#0d9488', fontWeight: 600, fontSize: '13px' }}>
              {selected.length} employee(s) selected
            </span>
          </div>
        )}
      </div>

      {/* Push button — full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#99f6e4' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: 700, fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'opacity 0.2s',
          }}
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Pushing KPI…</>
            : <><Send size={16} /> Push KPI to {selected.length} Employee(s)</>}
        </button>
      </div>
    </div>
  )
}