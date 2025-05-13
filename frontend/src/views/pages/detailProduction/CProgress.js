import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CProgress,
  CProgressStacked,
} from '@coreui/react'
import { getStatusConfig } from '../../../components/signalLightConfig/signalLightConfig'
import CustomTooltip from './CTooltip'

const ProgressDisplay = ({ shifts, selectedDate, nextDayString }) => {
  const getStatusColor = (status) => {
    const config = getStatusConfig(status)

    if (status === 'EMPTY') {
      return '#f8f9fa'
    }

    return config.borderColor.replace('var(--cui-', '').replace(')', '')
  }

  const getProgressStyle = (status) => {
    if (status === 'EMPTY') {
      return {
        backgroundColor: '#f8f9fa',
        opacity: 0.5,
      }
    }

    const config = getStatusConfig(status)

    if (config.borderColor.startsWith('#')) {
      return {
        backgroundColor: config.borderColor,
      }
    }

    const colorMap = {
      'var(--cui-danger)': '#e55353',
      'var(--cui-warning)': '#f9b115',
      'var(--cui-info)': '#39f',
      'var(--cui-secondary)': '#9da5b1',
      'var(--cui-success)': '#2eb85c',
      'var(--cui-primary)': '#321fdb',
    }

    return {
      backgroundColor: colorMap[config.borderColor] || '#9da5b1',
    }
  }

  const generateTimeMarkers = (shift) => {
    const markers = []

    let startHour, endHour

    if (shift.name === 'Shift 1') {
      startHour = 7
      endHour = 16
    } else if (shift.name === 'Shift 2') {
      startHour = 16
      endHour = 24
    } else if (shift.name === 'Shift 3') {
      startHour = 0
      endHour = 7
    }

    for (let hour = startHour; hour <= endHour; hour++) {
      const position = ((hour - startHour) / (endHour - startHour)) * 100

      // Modified: Get the counter value for the previous hour (for the data that ends at this hour)
      // except for the first hour marker which will have no counter
      const hourCounter = hour === startHour ? null : getCounterForHour(shift, hour - 1)

      markers.push({
        time: `${(hour === 24 ? 0 : hour).toString().padStart(2, '0')}:00`,
        position: position,
        counter: hourCounter,
      })
    }

    return markers
  }

  // Function to get the counter value for a specific hour
  const getCounterForHour = (shift, hour) => {
    if (!shift.hourCounters) return null

    const hourKey = hour.toString().padStart(2, '0')
    return shift.hourCounters[hourKey] || null
  }

  // Enhanced tooltip content generator for progress segments
  const getTooltipContent = (segment) => {
    if (segment.isEmpty) return null

    let content = `${segment.displayTime}: ${segment.status}`

    if (segment.isContinuity) {
      content = `${segment.displayTime}: ${segment.status} (Continued from ${segment.sourceTime})${segment.durationDisplay}`
    }

    return content
  }

  return (
    <CRow>
      {shifts.map((shift, index) => {
        const timeMarkers = generateTimeMarkers(shift)
        return (
          <CCol md={12} key={index}>
            <CCard className="mb-3">
              <CCardHeader className="text-body">
                <strong>
                  {shift.name}
                  {shift.name === 'Shift 3' ? ` (${nextDayString})` : ''}
                </strong>
              </CCardHeader>
              <CCardBody className="p-4">
                <div className="progress-grid-container">
                  {timeMarkers.map((marker, markerIndex) => (
                    <React.Fragment key={markerIndex}>
                      <span className="time-text top" style={{ left: `${marker.position}%` }}>
                        {marker.time}
                      </span>
                      <div className="grid-line" style={{ left: `${marker.position}%` }} />
                      <span className="time-text bottom" style={{ left: `${marker.position}%` }}>
                        {marker.counter !== null ? marker.counter : ''}
                      </span>
                    </React.Fragment>
                  ))}

                  {timeMarkers.length > 0 &&
                    Math.abs(timeMarkers[timeMarkers.length - 1].position - 100) > 1 && (
                      <div className="grid-line" style={{ left: '100%' }} />
                    )}

                  <div className="progress-container">
                    <CProgressStacked className="mb-3">
                      {shift.progressSegments &&
                        shift.progressSegments.map((segment, segmentIndex) => {
                          const customStyle = getProgressStyle(segment.status)
                          const tooltipContent = getTooltipContent(segment)

                          return (
                            <CustomTooltip
                              key={segmentIndex}
                              content={tooltipContent}
                              placement="top"
                            >
                              <CProgress style={customStyle} value={segment.value} />
                            </CustomTooltip>
                          )
                        })}
                    </CProgressStacked>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        )
      })}
    </CRow>
  )
}

ProgressDisplay.processDataForDisplay = (mainData, nextDayData, selectedDate, nextDayDate) => {
  const shiftRanges = [
    { name: 'Shift 1', start: 7, end: 16 },
    { name: 'Shift 2', start: 16, end: 0 },
    { name: 'Shift 3', start: 0, end: 7 },
  ]

  const selectedDateObj = new Date(selectedDate)
  selectedDateObj.setHours(0, 0, 0, 0)

  const nextDateObj = new Date(selectedDateObj)
  nextDateObj.setDate(nextDateObj.getDate() + 1)

  const shift1Start = new Date(selectedDateObj)
  shift1Start.setHours(7, 0, 0, 0)

  const shift1End = new Date(selectedDateObj)
  shift1End.setHours(16, 0, 0, 0)

  const shift2Start = new Date(selectedDateObj)
  shift2Start.setHours(16, 0, 0, 0)

  const shift2End = new Date(nextDateObj)
  shift2End.setHours(0, 0, 0, 0)

  const shift3Start = new Date(nextDateObj)
  shift3Start.setHours(0, 0, 0, 0)

  const shift3End = new Date(nextDateObj)
  shift3End.setHours(7, 0, 0, 0)

  const rawRecordsForShift1And2 = ProgressDisplay.processShiftRecords(
    mainData,
    selectedDateObj,
    nextDateObj,
    shift1Start,
    shift2End,
    'shift1and2',
    selectedDate,
  )

  const rawRecordsForShift3 = ProgressDisplay.processShiftRecordsForShift3(
    nextDayData,
    nextDateObj,
    shift3Start,
    shift3End,
    nextDayDate,
  )

  const rawRecords = [...rawRecordsForShift1And2, ...rawRecordsForShift3]

  rawRecords.sort((a, b) => a.displayTimestamp - b.displayTimestamp)

  const shifts = shiftRanges.map((shiftRange) => {
    let shiftStartTime, shiftEndTime, shiftRecords

    if (shiftRange.name === 'Shift 1') {
      shiftStartTime = shift1Start
      shiftEndTime = shift1End

      shiftRecords = rawRecords.filter((record) => {
        const hours = record.displayTimestamp.getHours()
        return hours >= 7 && hours < 16
      })
    } else if (shiftRange.name === 'Shift 2') {
      shiftStartTime = shift2Start
      shiftEndTime = shift2End

      shiftRecords = rawRecords.filter((record) => {
        const hours = record.displayTimestamp.getHours()
        return hours >= 16 && hours < 24
      })
    } else if (shiftRange.name === 'Shift 3') {
      shiftStartTime = shift3Start
      shiftEndTime = shift3End

      shiftRecords = rawRecords.filter((record) => {
        const hours = record.displayTimestamp.getHours()
        return hours >= 0 && hours < 7 && record.isShift3
      })
    }

    // Extract counter values for each hour
    const hourCounters = ProgressDisplay.getCountersByHour(shiftRecords, shiftRange.name)

    let previousShiftLastStatus = null
    let previousShiftLastTimestamp = null
    let previousShiftLastRawTime = null

    if (shiftRange.name === 'Shift 2') {
      const shift1Records = rawRecords.filter(
        (record) =>
          record.displayTimestamp.toISOString().slice(0, 10) === selectedDate &&
          record.displayTimestamp.getHours() >= 7 &&
          record.displayTimestamp.getHours() < 16,
      )

      if (shift1Records.length > 0) {
        previousShiftLastStatus = shift1Records[shift1Records.length - 1].status
        previousShiftLastTimestamp = shift1Records[shift1Records.length - 1].timestamp
        previousShiftLastRawTime = shift1Records[shift1Records.length - 1].rawTime
      }
    }

    if (shiftRange.name === 'Shift 3') {
      const shift2Records = rawRecords.filter(
        (record) =>
          record.displayTimestamp.toISOString().slice(0, 10) === selectedDate &&
          record.displayTimestamp.getHours() >= 16 &&
          record.displayTimestamp.getHours() < 24,
      )

      if (shift2Records.length > 0) {
        previousShiftLastStatus = shift2Records[shift2Records.length - 1].status
        previousShiftLastTimestamp = shift2Records[shift2Records.length - 1].timestamp
        previousShiftLastRawTime = shift2Records[shift2Records.length - 1].rawTime
      }
    }

    const processedRecords = []

    if (previousShiftLastStatus) {
      const continuityTimestamp = new Date(shiftStartTime)

      let continuityDisplayTime
      if (shiftRange.name === 'Shift 2') {
        continuityDisplayTime = `16:00`
      } else if (shiftRange.name === 'Shift 3') {
        continuityDisplayTime = `00:00`
      }

      processedRecords.push({
        timestamp: continuityTimestamp,
        displayTimestamp: continuityTimestamp,
        status: previousShiftLastStatus,
        isContinuity: true,
        sourceTimestamp: previousShiftLastTimestamp,
        sourceTime: previousShiftLastRawTime,
        displayTime: continuityDisplayTime,
      })
    }

    if (shiftRecords) {
      shiftRecords.forEach((record) => {
        processedRecords.push({
          timestamp: record.timestamp,
          displayTimestamp: record.displayTimestamp,
          status: record.status,
          displayTime: record.rawTime,
        })
      })
    }

    processedRecords.sort((a, b) => a.displayTimestamp - b.displayTimestamp)

    const progressSegments = ProgressDisplay.createProgressSegments(
      shiftRange,
      shiftStartTime,
      shiftEndTime,
      processedRecords,
    )

    return {
      name: shiftRange.name,
      progressSegments: progressSegments,
      shiftStartHour: shiftRange.start,
      shiftEndHour: shiftRange.end,
      hourCounters: hourCounters,
    }
  })

  return {
    machineInfo: mainData.machineInfo,
    shifts: shifts,
  }
}

// New function to get counter values by hour
ProgressDisplay.getCountersByHour = (records, shiftName) => {
  if (!records || records.length === 0) {
    return {}
  }

  const hourCounters = {}

  // Process all hours in the shift
  let startHour, endHour
  if (shiftName === 'Shift 1') {
    startHour = 7
    endHour = 16
  } else if (shiftName === 'Shift 2') {
    startHour = 16
    endHour = 24
  } else if (shiftName === 'Shift 3') {
    startHour = 0
    endHour = 7
  }

  // First initialize all hours with null
  for (let h = startHour; h < endHour; h++) {
    const hourKey = (h === 24 ? 0 : h).toString().padStart(2, '0')
    hourCounters[hourKey] = null
  }

  // Find base counter value at the start of the shift
  let baseCounter = 0
  let foundBaseCounter = false

  // If we have records, try to find the earliest counter value as our base
  if (records.length > 0) {
    // Find the earliest record with a counter value
    const earliestRecords = records
      .filter((record) => record.counter !== undefined)
      .sort((a, b) => a.displayTimestamp - b.displayTimestamp)

    if (earliestRecords.length > 0) {
      baseCounter = earliestRecords[0].counter
      foundBaseCounter = true
    }
  }

  // Group records by hour
  const recordsByHour = {}

  // Group all records by hour
  records.forEach((record) => {
    if (record.counter !== undefined) {
      const hour = record.displayTimestamp.getHours()
      const hourKey = hour.toString().padStart(2, '0')

      if (!recordsByHour[hourKey]) {
        recordsByHour[hourKey] = []
      }

      recordsByHour[hourKey].push({
        counter: record.counter,
        minutes: record.displayTimestamp.getMinutes(),
        timestamp: record.displayTimestamp,
      })
    }
  })

  // Process hours in sequence to calculate per-hour counters
  let previousHourCounter = baseCounter
  for (let h = startHour; h < endHour; h++) {
    const hourKey = (h === 24 ? 0 : h).toString().padStart(2, '0')

    if (recordsByHour[hourKey] && recordsByHour[hourKey].length > 0) {
      // Sort records within this hour by minutes
      recordsByHour[hourKey].sort((a, b) => a.minutes - b.minutes)

      // Get the latest record for this hour
      const latestRecord = recordsByHour[hourKey][recordsByHour[hourKey].length - 1]

      // Calculate the difference from previous hour's final counter
      const hourlyCounter = latestRecord.counter - previousHourCounter
      hourCounters[hourKey] = hourlyCounter

      // Update the previous counter for the next iteration
      previousHourCounter = latestRecord.counter
    }
  }

  return hourCounters
}

ProgressDisplay.processShiftRecords = (
  data,
  dateObj,
  nextDayObj,
  startTime,
  endTime,
  shiftGroup,
  selectedDate,
) => {
  const rawRecords = []
  const selectedDateStr = selectedDate

  if (data.shifts && Array.isArray(data.shifts)) {
    data.shifts.forEach((shift) => {
      if (shift.records && Array.isArray(shift.records)) {
        shift.records.forEach((record) => {
          const timestampStr = record.timestamp
          const recordDateStr = timestampStr.split('T')[0]

          if (recordDateStr === selectedDateStr) {
            const timeParts = timestampStr.split('T')[1].split(':')
            const dbHours = parseInt(timeParts[0], 10)
            const dbMinutes = parseInt(timeParts[1], 10)

            const formattedTime = `${dbHours.toString().padStart(2, '0')}:${dbMinutes.toString().padStart(2, '0')}`

            const displayTimestamp = new Date(selectedDateStr)
            displayTimestamp.setHours(dbHours, dbMinutes, 0, 0)

            if (shiftGroup === 'shift1and2') {
              const isInShift1Or2 =
                (dbHours >= 7 && dbHours < 24) || (dbHours === 0 && dbMinutes === 0)

              if (isInShift1Or2) {
                const recordTimestamp = new Date(timestampStr)
                rawRecords.push({
                  timestamp: recordTimestamp,
                  displayTimestamp: displayTimestamp,
                  status: record.status,
                  counter: record.counter,
                  rawTime: formattedTime,
                  rawTimestamp: record.timestamp,
                  isShift3: false,
                })
              }
            }
          }
        })
      }
    })
  }

  return rawRecords
}

ProgressDisplay.processShiftRecordsForShift3 = (
  data,
  nextDayObj,
  shift3Start,
  shift3End,
  nextDayDate,
) => {
  const rawRecords = []
  const nextDayDateStr = nextDayDate

  if (data.shifts && Array.isArray(data.shifts)) {
    data.shifts.forEach((shift) => {
      if (shift.records && Array.isArray(shift.records)) {
        shift.records.forEach((record) => {
          const timestampStr = record.timestamp
          const recordDateStr = timestampStr.split('T')[0]

          if (recordDateStr === nextDayDateStr) {
            const timeParts = timestampStr.split('T')[1].split(':')
            const dbHours = parseInt(timeParts[0], 10)
            const dbMinutes = parseInt(timeParts[1], 10)

            if (dbHours >= 0 && dbHours < 7) {
              const formattedTime = `${dbHours.toString().padStart(2, '0')}:${dbMinutes.toString().padStart(2, '0')}`

              const displayTimestamp = new Date(nextDayDateStr)
              displayTimestamp.setHours(dbHours, dbMinutes, 0, 0)

              const recordTimestamp = new Date(timestampStr)
              rawRecords.push({
                timestamp: recordTimestamp,
                displayTimestamp: displayTimestamp,
                status: record.status,
                counter: record.counter,
                rawTime: formattedTime,
                rawTimestamp: record.timestamp,
                isShift3: true,
              })
            }
          }
        })
      }
    })
  }

  return rawRecords
}

ProgressDisplay.createProgressSegments = (shift, shiftStartTime, shiftEndTime, records) => {
  if (!records || records.length === 0) {
    return []
  }

  const segments = []

  // Get current time for comparison
  const currentTime = new Date()

  // Check if shift is in the past
  const shiftDate = new Date(shiftStartTime)
  shiftDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPastDay = shiftDate < today

  let shiftDuration
  if (shift.name === 'Shift 1') {
    shiftDuration = 9
  } else if (shift.name === 'Shift 2') {
    shiftDuration = 8
  } else if (shift.name === 'Shift 3') {
    shiftDuration = 7
  }

  // For past days, use all records; for today, filter to current time
  const filteredRecords = isPastDay
    ? records
    : records.filter((record) => record.displayTimestamp <= currentTime)

  if (filteredRecords.length === 0) {
    // If no valid records after filtering, show empty bar
    segments.push({
      status: 'EMPTY',
      value: 100,
      displayTime: `${shiftStartTime.getHours().toString().padStart(2, '0')}:00`,
      isEmpty: true,
    })
    return segments
  }

  if (filteredRecords[0].displayTimestamp > shiftStartTime) {
    let initialPadPercentage

    if (shift.name === 'Shift 1') {
      const firstRecordHour = filteredRecords[0].displayTimestamp.getHours()
      const firstRecordMinute = filteredRecords[0].displayTimestamp.getMinutes()
      initialPadPercentage = ((firstRecordHour - 7 + firstRecordMinute / 60) / shiftDuration) * 100
    } else if (shift.name === 'Shift 2') {
      const firstRecordHour = filteredRecords[0].displayTimestamp.getHours()
      const firstRecordMinute = filteredRecords[0].displayTimestamp.getMinutes()
      initialPadPercentage = ((firstRecordHour - 16 + firstRecordMinute / 60) / shiftDuration) * 100
    } else if (shift.name === 'Shift 3') {
      const firstRecordHour = filteredRecords[0].displayTimestamp.getHours()
      const firstRecordMinute = filteredRecords[0].displayTimestamp.getMinutes()
      initialPadPercentage = ((firstRecordHour + firstRecordMinute / 60) / shiftDuration) * 100
    }

    if (initialPadPercentage > 0.1) {
      segments.push({
        status: 'EMPTY',
        value: initialPadPercentage,
        displayTime: `${shiftStartTime.getHours().toString().padStart(2, '0')}:00`,
        isEmpty: true,
      })
    }
  }

  // For past days, always set currentTimePosition to cover full shift (100%)
  let currentTimePosition = isPastDay ? 1 : 0

  // Only calculate partial progress for current day
  if (!isPastDay) {
    if (shift.name === 'Shift 1') {
      if (currentTime.getHours() >= 7 && currentTime.getHours() < 16) {
        currentTimePosition =
          (currentTime.getHours() - 7 + currentTime.getMinutes() / 60) / shiftDuration
      } else if (currentTime.getHours() >= 16) {
        currentTimePosition = 1
      }
    } else if (shift.name === 'Shift 2') {
      if (currentTime.getHours() >= 16) {
        currentTimePosition =
          (currentTime.getHours() - 16 + currentTime.getMinutes() / 60) / shiftDuration
      } else if (currentTime.getHours() < 16) {
        currentTimePosition = 0
      }
    } else if (shift.name === 'Shift 3') {
      if (currentTime.getHours() >= 0 && currentTime.getHours() < 7) {
        currentTimePosition =
          (currentTime.getHours() + currentTime.getMinutes() / 60) / shiftDuration
      } else if (currentTime.getHours() >= 7) {
        currentTimePosition = 1
      }
    }
  }

  // Clamp current time position between 0 and 1
  currentTimePosition = Math.max(0, Math.min(1, currentTimePosition))

  for (let i = 0; i < filteredRecords.length; i++) {
    const currentRecord = filteredRecords[i]
    const nextRecord = i < filteredRecords.length - 1 ? filteredRecords[i + 1] : null
    const isLastRecord = i === filteredRecords.length - 1

    let segmentPercentage

    if (nextRecord) {
      if (shift.name === 'Shift 1') {
        const currentHour = currentRecord.displayTimestamp.getHours()
        const currentMinute = currentRecord.displayTimestamp.getMinutes()
        const nextHour = nextRecord.displayTimestamp.getHours()
        const nextMinute = nextRecord.displayTimestamp.getMinutes()

        const currentPosition = (currentHour - 7 + currentMinute / 60) / shiftDuration
        const nextPosition = (nextHour - 7 + nextMinute / 60) / shiftDuration

        segmentPercentage = (nextPosition - currentPosition) * 100
      } else if (shift.name === 'Shift 2') {
        const currentHour = currentRecord.displayTimestamp.getHours()
        const currentMinute = currentRecord.displayTimestamp.getMinutes()
        const nextHour = nextRecord.displayTimestamp.getHours()
        const nextMinute = nextRecord.displayTimestamp.getMinutes()

        const currentPosition = (currentHour - 16 + currentMinute / 60) / shiftDuration
        const nextPosition = (nextHour - 16 + nextMinute / 60) / shiftDuration

        segmentPercentage = (nextPosition - currentPosition) * 100
      } else if (shift.name === 'Shift 3') {
        const currentHour = currentRecord.displayTimestamp.getHours()
        const currentMinute = currentRecord.displayTimestamp.getMinutes()
        const nextHour = nextRecord.displayTimestamp.getHours()
        const nextMinute = nextRecord.displayTimestamp.getMinutes()

        const currentPosition = (currentHour + currentMinute / 60) / shiftDuration
        const nextPosition = (nextHour + nextMinute / 60) / shiftDuration

        segmentPercentage = (nextPosition - currentPosition) * 100
      }
    } else {
      // Calculate position for the last record
      let currentPosition

      if (shift.name === 'Shift 1') {
        const recordHour = currentRecord.displayTimestamp.getHours()
        const recordMinute = currentRecord.displayTimestamp.getMinutes()
        currentPosition = (recordHour - 7 + recordMinute / 60) / shiftDuration
      } else if (shift.name === 'Shift 2') {
        const recordHour = currentRecord.displayTimestamp.getHours()
        const recordMinute = currentRecord.displayTimestamp.getMinutes()
        currentPosition = (recordHour - 16 + recordMinute / 60) / shiftDuration
      } else if (shift.name === 'Shift 3') {
        const recordHour = currentRecord.displayTimestamp.getHours()
        const recordMinute = currentRecord.displayTimestamp.getMinutes()
        currentPosition = (recordHour + recordMinute / 60) / shiftDuration
      }

      // For past days, the last segment should extend to the end of the shift (100%)
      // For today, extend to the current time position
      const endPosition = isPastDay ? 1 : currentTimePosition

      // For past days, always fill to 100% if it's the last record
      segmentPercentage = (endPosition - currentPosition) * 100
    }

    // Ensure segment percentage is positive
    segmentPercentage = Math.max(0.1, segmentPercentage)

    let durationDisplay = ''
    if (currentRecord.isContinuity && currentRecord.sourceTimestamp) {
      // Calculate duration up to current time or next record
      const endTime = nextRecord ? nextRecord.timestamp : isPastDay ? shiftEndTime : currentTime
      const durationMs = endTime - currentRecord.sourceTimestamp
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      durationDisplay = ` (${durationHours}h ${durationMinutes}m total)`
    }

    const displayTime =
      currentRecord.displayTime ||
      `${currentRecord.displayTimestamp.getHours().toString().padStart(2, '0')}:${currentRecord.displayTimestamp
        .getMinutes()
        .toString()
        .padStart(2, '0')}`

    segments.push({
      status: currentRecord.status,
      value: segmentPercentage,
      displayTime: displayTime,
      durationDisplay: durationDisplay,
      isContinuity: currentRecord.isContinuity,
      sourceTime: currentRecord.sourceTime,
    })
  }

  // Add empty segment only if it's the current day and the shift is in progress
  // For past days, don't add empty segments at the end
  const totalPercentage = segments.reduce((total, segment) => total + segment.value, 0)

  if (!isPastDay && totalPercentage < 99.9 && currentTimePosition > 0) {
    segments.push({
      status: 'EMPTY',
      value: Math.max(0.1, 100 - totalPercentage),
      isEmpty: true,
    })
  }

  return segments
}
export default ProgressDisplay
