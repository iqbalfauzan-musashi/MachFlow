import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CSpinner,
  CProgress,
  CProgressStacked,
} from '@coreui/react'
import axios from 'axios'
import { getApiUrl } from '../../utils/apiUtils'

const DetailProduction = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [machineData, setMachineData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const machineCode = '45004'

  const fetchMachineData = async (date) => {
    try {
      setLoading(true)
      setError(null)

      // Calculate the next day for Shift 3
      const currentDate = new Date(date)
      const nextDay = new Date(currentDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().slice(0, 10)

      // Fetch data for the selected date (Shift 1 & 2)
      const mainResponse = await axios.get(getApiUrl(`machine-detail/${machineCode}?date=${date}`))

      // Fetch data for the next day (for Shift 3)
      const nextDayResponse = await axios.get(
        getApiUrl(`machine-detail/${machineCode}?date=${nextDayStr}`),
      )

      const processedData = processDataForDisplay(
        mainResponse.data,
        nextDayResponse.data,
        date,
        nextDayStr,
      )
      setMachineData(processedData)
    } catch (err) {
      setError('Failed to load machine data. Please try again later.')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const processDataForDisplay = (mainData, nextDayData, selectedDate, nextDayDate) => {
    console.log('Processing data for display, date:', selectedDate, 'next day:', nextDayDate)

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

    // Filter records for Shift 1 and 2 (from selected date)
    const rawRecordsForShift1And2 = processShiftRecords(
      mainData,
      selectedDateObj,
      nextDateObj,
      shift1Start,
      shift2End,
      'shift1and2',
      selectedDate,
    )

    // Filter records for Shift 3 (from next day)
    const rawRecordsForShift3 = processShiftRecordsForShift3(
      nextDayData,
      nextDateObj,
      shift3Start,
      shift3End,
      nextDayDate,
    )

    const rawRecords = [...rawRecordsForShift1And2, ...rawRecordsForShift3]

    rawRecords.sort((a, b) => a.displayTimestamp - b.displayTimestamp)

    console.log('Total raw records after processing:', rawRecords.length)

    const shifts = shiftRanges.map((shiftRange) => {
      let shiftStartTime, shiftEndTime, shiftRecords

      if (shiftRange.name === 'Shift 1') {
        shiftStartTime = shift1Start
        shiftEndTime = shift1End

        // Filter records for Shift 1
        shiftRecords = rawRecords.filter((record) => {
          const hours = record.displayTimestamp.getHours()
          return hours >= 7 && hours < 16
        })
      } else if (shiftRange.name === 'Shift 2') {
        shiftStartTime = shift2Start
        shiftEndTime = shift2End

        // Filter records for Shift 2
        shiftRecords = rawRecords.filter((record) => {
          const hours = record.displayTimestamp.getHours()
          return hours >= 16 && hours < 24
        })
      } else if (shiftRange.name === 'Shift 3') {
        shiftStartTime = shift3Start
        shiftEndTime = shift3End

        // Filter records for Shift 3 (next day, 00:00 - 07:00)
        shiftRecords = rawRecords.filter((record) => {
          const hours = record.displayTimestamp.getHours()
          return hours >= 0 && hours < 7 && record.isShift3
        })
      }

      console.log(`${shiftRange.name} records count:`, shiftRecords ? shiftRecords.length : 0)

      let previousShiftLastStatus = null
      let previousShiftLastTimestamp = null
      let previousShiftLastRawTime = null

      // For Shift 2, get the last status from Shift 1
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

      // For Shift 3, get the last status from Shift 2
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

      const progressSegments = createProgressSegments(
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
      }
    })

    return {
      machineInfo: mainData.machineInfo,
      shifts: shifts,
    }
  }

  const processShiftRecords = (
    data,
    dateObj,
    nextDayObj,
    startTime,
    endTime,
    shiftGroup,
    selectedDate,
  ) => {
    const rawRecords = []
    const selectedDateStr = selectedDate // Use the selected date string directly

    console.log('Processing records for date:', selectedDateStr)

    if (data.shifts && Array.isArray(data.shifts)) {
      data.shifts.forEach((shift) => {
        if (shift.records && Array.isArray(shift.records)) {
          shift.records.forEach((record) => {
            const timestampStr = record.timestamp

            // Extract the date part directly from the timestamp string to avoid timezone issues
            const recordDateStr = timestampStr.split('T')[0]

            // Only process records from the selected date
            if (recordDateStr === selectedDateStr) {
              console.log('Processing record timestamp:', timestampStr)

              // Extract time components directly from the timestamp string
              // Format should be YYYY-MM-DDTHH:MM:SS.sssZ or similar
              const timeParts = timestampStr.split('T')[1].split(':')
              const dbHours = parseInt(timeParts[0], 10)
              const dbMinutes = parseInt(timeParts[1], 10)

              const formattedTime = `${dbHours.toString().padStart(2, '0')}:${dbMinutes.toString().padStart(2, '0')}`

              // Create a display timestamp using the db time, not local time
              const displayTimestamp = new Date(selectedDateStr)
              displayTimestamp.setHours(dbHours, dbMinutes, 0, 0)

              if (shiftGroup === 'shift1and2') {
                // Only accept records from the selected date and within shift hours
                const isInShift1Or2 =
                  (dbHours >= 7 && dbHours < 24) || (dbHours === 0 && dbMinutes === 0)

                if (isInShift1Or2) {
                  console.log(
                    'Adding record with status:',
                    record.status,
                    'at time:',
                    formattedTime,
                  )
                  // Use original timestamp for reference but displayTimestamp for UI
                  const recordTimestamp = new Date(timestampStr)
                  rawRecords.push({
                    timestamp: recordTimestamp,
                    displayTimestamp: displayTimestamp, // This uses selected date with db time
                    status: record.status,
                    counter: record.counter,
                    rawTime: formattedTime, // Use the time directly from the db timestamp
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

    console.log('Total records processed for Shift 1 & 2:', rawRecords.length)
    return rawRecords
  }

  // New function to process Shift 3 records specifically
  const processShiftRecordsForShift3 = (data, nextDayObj, shift3Start, shift3End, nextDayDate) => {
    const rawRecords = []
    const nextDayDateStr = nextDayDate // Use the next day string directly

    console.log('Processing Shift 3 records for next day:', nextDayDateStr)

    if (data.shifts && Array.isArray(data.shifts)) {
      data.shifts.forEach((shift) => {
        if (shift.records && Array.isArray(shift.records)) {
          shift.records.forEach((record) => {
            const timestampStr = record.timestamp

            // Extract the date part directly from the timestamp string
            const recordDateStr = timestampStr.split('T')[0]

            // Only process records from the next day
            if (recordDateStr === nextDayDateStr) {
              // Extract time components directly from the timestamp string
              const timeParts = timestampStr.split('T')[1].split(':')
              const dbHours = parseInt(timeParts[0], 10)
              const dbMinutes = parseInt(timeParts[1], 10)

              // Only accept records from midnight to 7 AM
              if (dbHours >= 0 && dbHours < 7) {
                console.log('Processing Shift 3 record timestamp:', timestampStr)

                const formattedTime = `${dbHours.toString().padStart(2, '0')}:${dbMinutes.toString().padStart(2, '0')}`

                // Create a display timestamp using the db time from next day
                const displayTimestamp = new Date(nextDayDateStr)
                displayTimestamp.setHours(dbHours, dbMinutes, 0, 0)

                console.log(
                  'Adding Shift 3 record with status:',
                  record.status,
                  'at time:',
                  formattedTime,
                )

                // Use original timestamp for reference but displayTimestamp for UI
                const recordTimestamp = new Date(timestampStr)
                rawRecords.push({
                  timestamp: recordTimestamp,
                  displayTimestamp: displayTimestamp,
                  status: record.status,
                  counter: record.counter,
                  rawTime: formattedTime,
                  rawTimestamp: record.timestamp,
                  isShift3: true, // Flag to identify Shift 3 records
                })
              }
            }
          })
        }
      })
    }

    console.log('Total records processed for Shift 3:', rawRecords.length)
    return rawRecords
  }

  const createProgressSegments = (shift, shiftStartTime, shiftEndTime, records) => {
    if (!records || records.length === 0) {
      return []
    }

    const segments = []

    let shiftDuration
    if (shift.name === 'Shift 1') {
      shiftDuration = 9
    } else if (shift.name === 'Shift 2') {
      shiftDuration = 8
    } else if (shift.name === 'Shift 3') {
      shiftDuration = 7
    }

    if (records[0].displayTimestamp > shiftStartTime) {
      let initialPadPercentage

      if (shift.name === 'Shift 1') {
        const firstRecordHour = records[0].displayTimestamp.getHours()
        const firstRecordMinute = records[0].displayTimestamp.getMinutes()
        initialPadPercentage =
          ((firstRecordHour - 7 + firstRecordMinute / 60) / shiftDuration) * 100
      } else if (shift.name === 'Shift 2') {
        const firstRecordHour = records[0].displayTimestamp.getHours()
        const firstRecordMinute = records[0].displayTimestamp.getMinutes()
        initialPadPercentage =
          ((firstRecordHour - 16 + firstRecordMinute / 60) / shiftDuration) * 100
      } else if (shift.name === 'Shift 3') {
        const firstRecordHour = records[0].displayTimestamp.getHours()
        const firstRecordMinute = records[0].displayTimestamp.getMinutes()
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

    for (let i = 0; i < records.length; i++) {
      const currentRecord = records[i]
      const nextRecord = i < records.length - 1 ? records[i + 1] : null

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
        if (shift.name === 'Shift 1') {
          const currentHour = currentRecord.displayTimestamp.getHours()
          const currentMinute = currentRecord.displayTimestamp.getMinutes()

          const currentPosition = (currentHour - 7 + currentMinute / 60) / shiftDuration
          segmentPercentage = (1 - currentPosition) * 100
        } else if (shift.name === 'Shift 2') {
          const currentHour = currentRecord.displayTimestamp.getHours()
          const currentMinute = currentRecord.displayTimestamp.getMinutes()

          const currentPosition = (currentHour - 16 + currentMinute / 60) / shiftDuration
          segmentPercentage = (1 - currentPosition) * 100
        } else if (shift.name === 'Shift 3') {
          const currentHour = currentRecord.displayTimestamp.getHours()
          const currentMinute = currentRecord.displayTimestamp.getMinutes()

          const currentPosition = (currentHour + currentMinute / 60) / shiftDuration
          segmentPercentage = (1 - currentPosition) * 100
        }
      }

      let durationDisplay = ''
      if (currentRecord.isContinuity && currentRecord.sourceTimestamp) {
        const endTime = nextRecord ? nextRecord.timestamp : shiftEndTime
        const durationMs = endTime - currentRecord.sourceTimestamp
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
        durationDisplay = ` (${durationHours}h ${durationMinutes}m total)`
      }

      const displayTime =
        currentRecord.displayTime ||
        `${currentRecord.displayTimestamp.getHours().toString().padStart(2, '0')}:${currentRecord.displayTimestamp.getMinutes().toString().padStart(2, '0')}`

      segments.push({
        status: currentRecord.status,
        value: Math.max(0.1, segmentPercentage),
        displayTime: displayTime,
        durationDisplay: durationDisplay,
        isContinuity: currentRecord.isContinuity,
        sourceTime: currentRecord.sourceTime,
      })
    }

    return segments
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    fetchMachineData(newDate)
  }

  useEffect(() => {
    fetchMachineData(selectedDate)
  }, [selectedDate])

  const gridContainerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: '5px',
    padding: '0',
    height: '120px',
  }

  const gridLineStyle = {
    position: 'absolute',
    top: 25,
    bottom: 25,
    width: '2px',
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
    zIndex: 1,
  }

  const timeTextStyle = {
    position: 'absolute',
    transform: 'translateX(-50%)',
    width: 'auto',
    fontSize: '0.9rem',
    padding: '0 5px',
  }

  const progressContainerStyle = {
    position: 'absolute',
    left: '0',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    padding: '0',
    height: '32px',
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL OPERATION':
        return 'success'
      case 'CHOKOTEI':
        return 'danger'
      case 'TIDAK NORMAL':
        return 'warning'
      case 'EMPTY':
        return 'light'
      default:
        return 'primary'
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  const generateTimeMarkers = (shift) => {
    const markers = []

    let startHour,
      endHour,
      isNextDay = false

    if (shift.name === 'Shift 1') {
      startHour = 7
      endHour = 16
    } else if (shift.name === 'Shift 2') {
      startHour = 16
      endHour = 24
    } else if (shift.name === 'Shift 3') {
      startHour = 0
      endHour = 7
      isNextDay = true
    }

    if (shift.name === 'Shift 1' || shift.name === 'Shift 3') {
      for (let hour = startHour; hour <= endHour; hour++) {
        const position = ((hour - startHour) / (endHour - startHour)) * 100
        markers.push({
          time: `${hour.toString().padStart(2, '0')}:00${isNextDay ? ' (+1)' : ''}`,
          position: position,
          minutes: (hour - startHour) * 60,
        })
      }
    } else if (shift.name === 'Shift 2') {
      for (let hour = startHour; hour <= endHour; hour++) {
        const position = ((hour - startHour) / (endHour - startHour)) * 100
        markers.push({
          time: `${(hour === 24 ? 0 : hour).toString().padStart(2, '0')}:00${hour === 24 ? ' (+1)' : ''}`,
          position: position,
          minutes: (hour - startHour) * 60,
        })
      }
    }

    return markers
  }

  // Calculate the next day for display purposes
  const getNextDayString = (dateString) => {
    const date = new Date(dateString)
    date.setDate(date.getDate() + 1)
    return date.toISOString().slice(0, 10)
  }

  const nextDayString = getNextDayString(selectedDate)

  return (
    <div>
      <style>
        {`
          .c-progress {
            height: 32px !important;
          }
          .c-progress-bar {
            height: 32px !important;
          }
          .c-progress-stacked {
            height: 32px !important;
          }
        `}
      </style>

      <CRow className="mb-4">
        <CCol md={4}>
          <CCard>
            <CCardHeader>
              <strong>Select Date</strong>
            </CCardHeader>
            <CCardBody>
              <CFormInput
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                label="Production Date"
              />
            </CCardBody>
          </CCard>
        </CCol>
        {machineData && machineData.machineInfo && (
          <CCol md={8}>
            <CCard>
              <CCardHeader>
                <strong>Machine Information</strong>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <p>
                      <strong>Machine Code:</strong> {machineData.machineInfo.MACHINE_CODE}
                    </p>
                    <p>
                      <strong>Machine Name:</strong> {machineData.machineInfo.MACHINE_NAME}
                    </p>
                  </CCol>
                  <CCol md={6}>
                    <p>
                      <strong>Line Group:</strong> {machineData.machineInfo.LINE_GROUP}
                    </p>
                    <p>
                      <strong>Location:</strong> {machineData.machineInfo.LOCATION}
                    </p>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        )}
      </CRow>

      <h2>
        Detail Production - {selectedDate} (Shift 1 & 2) & {nextDayString} (Shift 3)
      </h2>
      {machineData && machineData.shifts && (
        <CRow>
          {machineData.shifts.map((shift, index) => {
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
                    <div style={gridContainerStyle}>
                      {timeMarkers.map((marker, markerIndex) => (
                        <React.Fragment key={markerIndex}>
                          <span style={{ ...timeTextStyle, top: '0', left: `${marker.position}%` }}>
                            {marker.time}
                          </span>
                          <div style={{ ...gridLineStyle, left: `${marker.position}%` }} />
                          <span
                            style={{ ...timeTextStyle, bottom: '0', left: `${marker.position}%` }}
                          >
                            {marker.minutes}
                          </span>
                        </React.Fragment>
                      ))}

                      {timeMarkers.length > 0 &&
                        Math.abs(timeMarkers[timeMarkers.length - 1].position - 100) > 1 && (
                          <div style={{ ...gridLineStyle, left: '100%' }} />
                        )}

                      <div style={progressContainerStyle}>
                        <CProgressStacked className="mb-3">
                          {shift.progressSegments &&
                            shift.progressSegments.map((segment, segmentIndex) => (
                              <CProgress
                                color={getStatusColor(segment.status)}
                                value={segment.value}
                                key={segmentIndex}
                                title={
                                  segment.isEmpty
                                    ? undefined
                                    : segment.isContinuity
                                      ? `${segment.displayTime}: ${segment.status} (Continued from ${segment.sourceTime})${segment.durationDisplay}`
                                      : `${segment.displayTime}: ${segment.status}`
                                }
                                variant={segment.isEmpty ? undefined : undefined}
                              />
                            ))}
                        </CProgressStacked>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )
          })}
        </CRow>
      )}
    </div>
  )
}

export default DetailProduction
