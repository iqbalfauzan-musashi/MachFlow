import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader, CRow, CCol, CFormInput, CSpinner } from '@coreui/react'
import axios from 'axios'
import { getApiUrl } from '../../../utils/apiUtils'
import './DetailProduction.scss'
import ProgressDisplay from './CProgress'
import CLegend from './Clegend'

const DetailProduction = () => {
  const { machineCode } = useParams()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [machineData, setMachineData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {}, [])

  const fetchMachineData = async (date) => {
    try {
      setLoading(true)
      setError(null)

      const currentDate = new Date(date)
      const nextDay = new Date(currentDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().slice(0, 10)

      const mainResponse = await axios.get(getApiUrl(`machine-detail/${machineCode}?date=${date}`))

      const nextDayResponse = await axios.get(
        getApiUrl(`machine-detail/${machineCode}?date=${nextDayStr}`),
      )

      const processedData = ProgressDisplay.processDataForDisplay(
        mainResponse.data,
        nextDayResponse.data,
        date,
        nextDayStr,
      )
      setMachineData(processedData)
    } catch (err) {
      setError('Failed to load machine data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    fetchMachineData(newDate)
  }

  useEffect(() => {
    if (machineCode) {
      fetchMachineData(selectedDate)
    }
  }, [machineCode, selectedDate])

  const getNextDayString = (dateString) => {
    const date = new Date(dateString)
    date.setDate(date.getDate() + 1)
    return date.toISOString().slice(0, 10)
  }

  const nextDayString = getNextDayString(selectedDate)

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <CSpinner color="primary" />
        <div className="ms-2">Loading data for machine {machineCode}...</div>
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

  return (
    <div>
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
      {machineData && machineData.shifts && (
        <div>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Legend for {selectedDate} (Shift 1 & 2)</strong>
            </CCardHeader>
            <CCardBody>
              <CLegend
                shifts={machineData.shifts}
                selectedDate={selectedDate}
                nextDayString={nextDayString}
              />
            </CCardBody>
          </CCard>
        </div>
      )}
      <strong>
        Detail Production - {selectedDate} (Shift 1 & 2) & {nextDayString} (Shift 3)
      </strong>
      {machineData && machineData.shifts && (
        <ProgressDisplay
          shifts={machineData.shifts}
          selectedDate={selectedDate}
          nextDayString={nextDayString}
        />
      )}
    </div>
  )
}

export default DetailProduction
