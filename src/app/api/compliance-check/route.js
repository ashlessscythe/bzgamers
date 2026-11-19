/**
 * API route for checking IGDB API compliance
 * 
 * This endpoint checks if the application is compliant with IGDB's terms:
 * - Rate limiting compliance
 * - Attribution requirements
 * - Usage terms
 * - Data handling policies
 * 
 * Access this endpoint at: /api/compliance-check
 */

import complianceChecker from '@/lib/compliance-checker'
import { requireAdmin } from '@/lib/require-admin'

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const report = complianceChecker.generateReport()
    
    return Response.json({
      status: 'success',
      message: report.compliance.overall.compliant 
        ? 'Application is compliant with IGDB terms' 
        : 'Compliance issues detected',
      report
    })
  } catch (error) {
    console.error('Compliance check failed:', error)
    
    return Response.json({
      status: 'error',
      message: 'Failed to check compliance status'
    }, { status: 500 })
  }
} 