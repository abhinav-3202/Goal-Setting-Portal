'use client'
import { useEffect, useState } from 'react'
import { Filter } from 'lucide-react'

interface Filters {
  department: string
  quarter: string
  managerId: string
}

interface AnalyticsFilterBarProps {
  filters: Filters
  onChange: (f: Filters) => void
}

const QUARTERS = ['all', 'Q1', 'Q2', 'Q3', 'Q4']

export default function AnalyticsFilterBar({ filters, onChange }: AnalyticsFilterBarProps) {
  const [departments, setDepartments] = useState<string[]>([])
  const [managers, setManagers] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/users?role=employee')
      .then((r) => r.json())
      .then((data) => {
        const depts = [...new Set((data as any[]).map((u) => u.department).filter(Boolean))] as string[]
        setDepartments(depts)
      })
      .catch(console.error)

    fetch('/api/users?role=manager')
      .then((r) => r.json())
      .then((data) => setManagers(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #c9ebe4',
    color: '#0f4c3a',
    fontSize: '13px',
    fontFamily: 'Georgia, serif',
    background: 'white',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '140px',
  }

  const handleReset = () => onChange({ department: 'all', quarter: 'all', managerId: 'all' })
  const isFiltered = filters.department !== 'all' || filters.quarter !== 'all' || filters.managerId !== 'all'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f4c3a', fontWeight: 700, fontSize: '13px' }}>
        <Filter size={14} color="#0d9488" />
        Filters
      </div>

      {/* Department */}
      <select
        value={filters.department}
        onChange={(e) => onChange({ ...filters, department: e.target.value })}
        style={selectStyle}
      >
        <option value="all">All Departments</option>
        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Quarter */}
      <select
        value={filters.quarter}
        onChange={(e) => onChange({ ...filters, quarter: e.target.value })}
        style={selectStyle}
      >
        {QUARTERS.map((q) => (
          <option key={q} value={q}>{q === 'all' ? 'All Quarters' : q}</option>
        ))}
      </select>

      {/* Manager */}
      <select
        value={filters.managerId}
        onChange={(e) => onChange({ ...filters, managerId: e.target.value })}
        style={selectStyle}
      >
        <option value="all">All Managers</option>
        {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
      </select>

      {/* Reset */}
      {isFiltered && (
        <button
          onClick={handleReset}
          style={{
            background: 'none', border: '1px solid #fecdd3',
            borderRadius: '10px', padding: '8px 14px',
            color: '#e11d48', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Georgia, serif',
          }}
        >
          ✕ Reset
        </button>
      )}

      {isFiltered && (
        <span style={{
          background: '#f0fdf9', color: '#0d9488',
          border: '1px solid #99f6e4', borderRadius: '999px',
          padding: '4px 12px', fontSize: '11px', fontWeight: 700,
        }}>
          Filtered
        </span>
      )}
    </div>
  )
}