import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CRow, CCol, CSpinner } from '@coreui/react'

const DetailProduction = () => {
  const [loading, setLoading] = useState(true)
  const [appsmithUrl] = useState(
    'http://localhost/app/untitled-application-1/page1-6819ff2dce5fe22f5e81d63f?embed=true',
  )

  // Handle iframe loading completion
  const handleIframeLoad = () => {
    setLoading(false)
    console.log('Appsmith application loaded successfully')
  }

  // Handle any errors that might occur with the iframe
  const handleIframeError = () => {
    console.error('Failed to load Appsmith application')
    setLoading(false)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Machine Status Production</strong>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol xs={12}>
            {loading && (
              <div className="d-flex justify-content-center my-3">
                <CSpinner color="primary" />
                <span className="ms-2">Loading Production Data...</span>
              </div>
            )}
            <div style={{ height: '85vh', width: '100%' }}>
              <iframe
                src={appsmithUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: loading ? 'none' : 'block',
                }}
                title="Machine Status Production"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allowFullScreen
              />
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default DetailProduction
