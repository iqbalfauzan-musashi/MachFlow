import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { getStatusConfig, COLORS } from '../../../components/signalLightConfig/signalLightConfig'

const CLegend = () => {
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
    if (config.borderColor.startsWith('#')) {
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

  // Import these from signalLightConfig.js for consistency
  const MACHINE_STATUSES = {
    MACHINE_OFF: 'machine off',
    TROUBLE_MACHINE: 'trouble machine',
    CHOKOTEI: 'chokotei',
    DANDORI: 'dandori',
    STOP_PLANNING: 'stop planning',
    TOOL_CHANGES: 'tool changes',
    WAITING_MATERIAL: 'waiting material',
    CONTROL_LOSS_TIME: 'control loss time',
    UNKNOWN_LOSS_TIME: 'unknown loss time',
    NORMAL_OPERATION: 'normal operation',
    TENKEN: 'tenken',
    NOT_CONNECTED: 'not connected',
    JAM_ISTIRAHAT: 'jam istirahat',
    RENCANA_PERBAIKAN: 'rencana perbaikan',
    TRIAL: 'trial',
    PLAN_PROSES_SELESAI: 'plan proses selesai',
    FIVE_S: '5s',
    MEETING_PAGI_SORE: 'meeting pagi/sore',
    PEMANASAN: 'pemanasan',
    CEK_QC: 'cek qc',
    INPUT_DATA: 'input data',
    BUANG_KIRIKO: 'buang kiriko',
    MENUNGGU_INTRUKSI_ATASAN: 'menunggu intruksi atasan',
    REPAIR: 'repair',
    KAIZEN: 'kaizen',
    GANTI_TOISHI: 'ganti toishi',
    GANTI_DRESSER: 'ganti dresser',
    ONE_TOOTH: '1 tooth',
    CHECK_HAGATA: 'check hagata',
    DRESSING_PROFILE: 'dressing profile',
    DRESS_2: 'dress-2',
    ANTRI_JOB: 'antri job',
    // Backward compatibility
    MAINTENANCE: 'maintenance',
    QUALITY_CHECK: 'quality check',
    IDLE_TIME: 'idle time',
    PRODUCTION: 'production',
    SHUTDOWN: 'shutdown',
  }

  return (
    <CCard className="mt-4">
      <CCardHeader>
        <strong>Status Legend</strong>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex flex-wrap">
          {Object.values(getStatusConfig('normal operation')).length > 0 &&
            Object.keys(MACHINE_STATUSES).map((statusKey) => {
              const status = MACHINE_STATUSES[statusKey]
              const config = getStatusConfig(status)
              const style = getProgressStyle(status)

              return (
                <div key={statusKey} className="me-3 mb-2 d-flex align-items-center">
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: style.backgroundColor,
                      marginRight: '5px',
                    }}
                  ></div>
                  <span>{config.displayName}</span>
                </div>
              )
            })}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default CLegend
