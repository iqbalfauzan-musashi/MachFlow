import React from 'react'
import {
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
        // Include all shifts - removed the Shift 3 exclusion

        if (shift.progressSegments && shift.progressSegments.length > 0) {
          // Track consecutive status occurrences
          let lastStatus = null
          let consecutiveSegments = []

          // Group consecutive segments with the same status
          shift.progressSegments.forEach((segment, index) => {
            const status = segment.status
            if (status === 'EMPTY') return // Skip empty segments

            // If this is a new status or the last segment, process the group
            if (status !== lastStatus || index === shift.progressSegments.length - 1) {
              // Process the previous group if it exists
              if (consecutiveSegments.length > 0 && lastStatus !== null) {
                // Initialize status if not exists
                if (!statusStats[lastStatus]) {
                  statusStats[lastStatus] = {
                    count: 0,
                    totalDurationHours: 0,
                    durations: [], // Array to store individual durations for calculating average
                  }
                }

                // Count this group as 1 occurrence regardless of how many consecutive segments
                statusStats[lastStatus].count += 1

                // Calculate combined duration for all segments in this group
                let shiftDuration
                if (shift.name === 'Shift 1') {
                  shiftDuration = 9 // hours
                } else if (shift.name === 'Shift 2') {
                  shiftDuration = 8 // hours
                } else if (shift.name === 'Shift 3') {
                  shiftDuration = 7 // hours
                }

                // Sum up the durations of all segments in this consecutive group
                const totalGroupPercentage = consecutiveSegments.reduce(
                  (sum, seg) => sum + seg.value,
                  0,
                )
                const groupDurationHours = (totalGroupPercentage / 100) * shiftDuration
                statusStats[lastStatus].totalDurationHours += groupDurationHours
                // Store this duration for average calculation
                statusStats[lastStatus].durations.push(groupDurationHours)
              }

              // Start a new group
              consecutiveSegments = [segment]
              lastStatus = status
            } else {
              // Add to current group if same status
              consecutiveSegments.push(segment)
            }
          })

          // Process the last group if it wasn't processed in the loop
          // (This handles cases where the last segment continues the same status)
          if (
            consecutiveSegments.length > 0 &&
            lastStatus !== null &&
            (lastStatus !== shift.progressSegments[shift.progressSegments.length - 1].status ||
              shift.progressSegments[shift.progressSegments.length - 1].status === 'EMPTY')
          ) {
            // Initialize status if not exists
            if (!statusStats[lastStatus]) {
              statusStats[lastStatus] = {
                count: 0,
                totalDurationHours: 0,
                durations: [], // Array to store individual durations for calculating average
              }
            }

            // Count this group as 1 occurrence
            statusStats[lastStatus].count += 1

            // Calculate combined duration
            let shiftDuration
            if (shift.name === 'Shift 1') {
              shiftDuration = 9
            } else if (shift.name === 'Shift 2') {
              shiftDuration = 8
            } else if (shift.name === 'Shift 3') {
              shiftDuration = 7
            }

            const totalGroupPercentage = consecutiveSegments.reduce(
              (sum, seg) => sum + seg.value,
              0,
            )
            const groupDurationHours = (totalGroupPercentage / 100) * shiftDuration
            statusStats[lastStatus].totalDurationHours += groupDurationHours
            // Store this duration for average calculation
            statusStats[lastStatus].durations.push(groupDurationHours)
          }
        }
      })
    }
    return statusStats
  }

  // Format hours to "xx' xx'' xx'''" format (hours, minutes, seconds)
  const formatHours = (hours) => {
    // Convert hours to hours, minutes, seconds
    const totalSeconds = Math.round(hours * 3600) // Convert to seconds

    // Calculate hours, minutes, seconds
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    // Format to "xx' xx'' xx'''" format
    return `${h}' ${m}'' ${s}'''`
  }

  // Calculate average duration from array of durations
  const calculateAverageDuration = (durations) => {
    if (!durations || durations.length === 0) return 0
    const sum = durations.reduce((total, duration) => total + duration, 0)
    return sum / durations.length
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
    <CTable bordered hover responsive className="legend-table">
      <CTableHead>
        <CTableRow className="table-primary">
          <CTableHeaderCell scope="col" style={{ width: '60px' }}>
            Status
          </CTableHeaderCell>
          <CTableHeaderCell scope="col">Keterangan</CTableHeaderCell>
          <CTableHeaderCell scope="col">Total Status</CTableHeaderCell>
          <CTableHeaderCell scope="col">Berapa kali status</CTableHeaderCell>
          <CTableHeaderCell scope="col">Rata-rata Waktu</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {sortedStatuses.map((status) => {
          const stats = statusStatistics[status]
          const config = getStatusConfig(status)
          const style = getProgressStyle(status)
          // Semua status akan ditampilkan sebagai lingkaran (borderRadius: '50%')
          return (
            <CTableRow key={status}>
              <CTableDataCell className="align-middle">
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: style.backgroundColor,
                    borderRadius: '50%',
                    margin: '0 auto',
                  }}
                ></div>
              </CTableDataCell>
              <CTableDataCell>{config.displayName || status}</CTableDataCell>
              <CTableDataCell>{formatHours(stats.totalDurationHours)}</CTableDataCell>
              <CTableDataCell>{stats.count}</CTableDataCell>
              <CTableDataCell>
                {formatHours(calculateAverageDuration(stats.durations))}
              </CTableDataCell>
            </CTableRow>
          )
        })}
      </CTableBody>
    </CTable>
  )
}

export default CLegend
