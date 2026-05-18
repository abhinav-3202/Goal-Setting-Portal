import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/app/api/auth/[...nextauth]/option'
import dbConnect from '@/src/lib/dbConnect'
import { UserModel } from '@/src/models/User'
import { GoalSheet } from '@/src/models/GoalSheet'
import { CheckIn } from '@/src/models/CheckIn'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const employees = await UserModel.find({ role: 'employee' }).lean()

    // Group by department
    const deptMap: Record<string, typeof employees> = {}
    for (const emp of employees) {
      const dept = emp.department ?? 'Unassigned'
      if (!deptMap[dept]) deptMap[dept] = []
      deptMap[dept].push(emp)
    }

    const heatmap = await Promise.all(
      Object.entries(deptMap).map(async ([department, emps]) => {
        const row: Record<string, any> = { department }

        for (const quarter of QUARTERS) {
          let done = 0
          let total = 0

          for (const emp of emps) {
            const sheet = await GoalSheet.findOne({ employeeId: emp._id, status: 'locked' }).lean()
            if (!sheet) continue
            total++
            const ci = await CheckIn.findOne({ goalSheetId: sheet._id, quarter }).lean()
            if (ci) done++
          }

          row[quarter] = total > 0 ? Math.round((done / total) * 100) / 100 : null
        }

        return row
      })
    )

    return NextResponse.json(heatmap)
  } catch (err) {
    console.error('[GET /api/analytics/heatmap]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
