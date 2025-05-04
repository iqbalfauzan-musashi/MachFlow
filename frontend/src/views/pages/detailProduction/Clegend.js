import React from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { getStatusConfig } from '../../../components/signalLightConfig/signalLightConfig'

const CLegend = ({ shifts, selectedDate, nextDayString }) => {
  // Calculate status statistics from shifts data
  const calculateStatusStatistics = () => {
    const statusStats = {}

    // Process all segments across all shifts
    if (shifts && shifts.length > 0) {
      shifts.forEach((shift) => {
        // Skip Shift 3 if we're focusing only on selectedDate
        if (shift.name === 'Shift 3') return

        if (shift.progressSegments && shift.progressSegments.length > 0) {
          shift.progressSegments.forEach((segment) => {
            const status = segment.status
            if (status === 'EMPTY') return // Skip empty segments

            // Initialize status if not exists
            if (!statusStats[status]) {
              statusStats[status] = {
                count: 0,
                totalDurationHours: 0,
                totalProduction: 0,
              }
            }

            // Count occurrences
            statusStats[status].count += 1

            // Calculate duration for this segment
            // Calculate segment duration based on its percentage of the shift
            let shiftDuration
            if (shift.name === 'Shift 1') {
              shiftDuration = 9 // hours
            } else if (shift.name === 'Shift 2') {
              shiftDuration = 8 // hours
            } else if (shift.name === 'Shift 3') {
              shiftDuration = 7 // hours
            }

            const segmentDurationHours = (segment.value / 100) * shiftDuration
            statusStats[status].totalDurationHours += segmentDurationHours

            // If we have counter values, we could calculate production
            // For now using placeholder logic - can be improved with actual counter data
            if (status === 'NORMAL_OPERATION' || status === 'PRODUCTION') {
              // Estimate production based on duration (assuming 400 units per hour)
              statusStats[status].totalProduction += Math.round(segmentDurationHours * 400)
            }
          })
        }
      })
    }

    return statusStats
  }

  // Format hours to "X.X jam" format
  const formatHours = (hours) => {
    return `${hours.toFixed(1)} jam`
  }

  // Get status color from the configuration
  const getProgressStyle = (status) => {
    if (status === 'EMPTY') {
      return {
        backgroundColor: '#f8f9fa',
        opacity: 0.5,
      }
    }

    const config = getStatusConfig(status)

    // Handle custom colors that aren't CSS variables
    if (config.borderColor && config.borderColor.startsWith('#')) {
      return {
        backgroundColor: config.borderColor,
      }
    }

    // For CSS variables, try to map them to actual colors
    const colorMap = {
      'var(--cui-danger)': '#e55353', // red
      'var(--cui-warning)': '#f9b115', // yellow
      'var(--cui-info)': '#39f', // blue
      'var(--cui-secondary)': '#9da5b1', // gray
      'var(--cui-success)': '#2eb85c', // green
      'var(--cui-primary)': '#321fdb', // primary
    }

    return {
      backgroundColor: colorMap[config.borderColor] || '#9da5b1', // default to secondary if not found
    }
  }

  // Calculate the statistics
  const statusStatistics = calculateStatusStatistics()

  // Get array of statuses sorted by total duration (descending)
  const sortedStatuses = Object.keys(statusStatistics).sort(
    (a, b) => statusStatistics[b].totalDurationHours - statusStatistics[a].totalDurationHours,
  )

  return (
    <CCard className="mb-4">
      <CCardBody>
        <CTable bordered hover responsive className="legend-table">
          <CTableHead>
            <CTableRow className="table-primary">
              <CTableHeaderCell scope="col" style={{ width: '60px' }}>
                Status
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">Keterangan</CTableHeaderCell>
              <CTableHeaderCell scope="col">Total Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Berapa kali status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Total Produksi</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {sortedStatuses.map((status) => {
              const stats = statusStatistics[status]
              const config = getStatusConfig(status)
              const style = getProgressStyle(status)

              // Determine if status should be shown as circle (for MACHINE_OFF)
              const isCircle =
                status.toUpperCase() === 'MACHINE_OFF' || status.toUpperCase() === 'MACHINE OFF'

              return (
                <CTableRow key={status}>
                  <CTableDataCell className="align-middle">
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: style.backgroundColor,
                        borderRadius: isCircle ? '50%' : '0',
                        margin: '0 auto',
                      }}
                    ></div>
                  </CTableDataCell>
                  <CTableDataCell>{config.displayName || status}</CTableDataCell>
                  <CTableDataCell>{formatHours(stats.totalDurationHours)}</CTableDataCell>
                  <CTableDataCell>{stats.count}</CTableDataCell>
                  <CTableDataCell>{stats.totalProduction}</CTableDataCell>
                </CTableRow>
              )
            })}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default CLegend
