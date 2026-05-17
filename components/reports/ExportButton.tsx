'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  quarter?: string
  label?: string
}

export default function ExportButton({ quarter, label = 'Export Report' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const url = `/api/reports/achievement${quarter ? `?quarter=${quarter}` : ''}`
      const res = await fetch(url, { headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `achievement-report${quarter ? `-${quarter}` : ''}-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success('Report downloaded successfully')
    } catch {
      toast.error('Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: loading ? '#99f6e4' : 'linear-gradient(135deg, #0d9488, #06b6d4)',
        border: 'none', borderRadius: '12px',
        padding: '10px 20px', color: 'white',
        fontWeight: 700, fontSize: '14px', fontFamily: 'Georgia, serif',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s',
      }}
    >
      {loading
        ? <><Loader2 size={15} className="animate-spin" /> Exporting…</>
        : <><Download size={15} /> {label}</>}
    </button>
  )
}