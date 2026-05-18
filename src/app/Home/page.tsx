'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || !session.user) {
      router.replace('/signIn')
      return
    }

    // Role-based redirect
    const role = (session.user as any).role
    if (role === 'employee') {
      router.replace('/employee/goals')
    } else if (role === 'manager') {
      router.replace('/manager/approvals')
    } else if (role === 'admin') {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/signIn')
    }
  }, [session, status, router])

  return (
    <div style={{ background: '#f0faf8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={40} color="#0d9488" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#4a7c6f', fontSize: '14px' }}>Redirecting...</p>
      </div>
    </div>
  )
}