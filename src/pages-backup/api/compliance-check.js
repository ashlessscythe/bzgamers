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

import complianceChecker from '../../lib/compliance-checker'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use GET to check compliance.' 
    })
  }

  try {
    const report = complianceChecker.generateReport()
    
    return res.status(200).json({
      status: 'success',
      message: report.compliance.overall.compliant 
        ? 'Application is compliant with IGDB terms' 
        : 'Compliance issues detected',
      report
    })
  } catch (error) {
    console.error('Compliance check failed:', error)
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check compliance status',
      error: error.message
    })
  }
} 