// src/utils/signalLightConfig.js

export const MACHINE_STATUSES = {
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

// Constants for border and header colors
export const COLORS = {
  DANGER: 'var(--cui-danger)',
  WARNING: 'var(--cui-warning)',
  INFO: 'var(--cui-info)',
  SECONDARY: 'var(--cui-secondary)',
  SUCCESS: 'var(--cui-success)',
  CUSTOM_PINK: '#fc38da',
  CUSTOM_PURPLE: '#c03fab',
  BLACK: '#000',
}

// Signal light state constants
export const LIGHT_STATE = {
  OFF: 0,
  ON: 1,
  BLINKING: 2,
}

// New status configuration map based on the provided format
const STATUS_CONFIG_MAP = {
  [MACHINE_STATUSES.MACHINE_OFF]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Machine Off',
  },
  [MACHINE_STATUSES.TROUBLE_MACHINE]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Trouble Machine',
  },
  [MACHINE_STATUSES.CHOKOTEI]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Chokotei',
  },
  [MACHINE_STATUSES.DANDORI]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Dandori',
  },
  [MACHINE_STATUSES.STOP_PLANNING]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Stop Planning',
  },
  [MACHINE_STATUSES.TOOL_CHANGES]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Tool Changes',
  },
  [MACHINE_STATUSES.WAITING_MATERIAL]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Waiting Material',
  },
  [MACHINE_STATUSES.CONTROL_LOSS_TIME]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Control Loss Time',
  },
  [MACHINE_STATUSES.UNKNOWN_LOSS_TIME]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Unknown Loss Time',
  },
  [MACHINE_STATUSES.NORMAL_OPERATION]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Normal Operation',
  },
  [MACHINE_STATUSES.TENKEN]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Tenken',
  },
  [MACHINE_STATUSES.NOT_CONNECTED]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Not Connected',
  },
  [MACHINE_STATUSES.JAM_ISTIRAHAT]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Jam Istirahat',
  },
  [MACHINE_STATUSES.RENCANA_PERBAIKAN]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Rencana Perbaikan',
  },
  [MACHINE_STATUSES.TRIAL]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Trial',
  },
  [MACHINE_STATUSES.PLAN_PROSES_SELESAI]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Plan Proses Selesai',
  },
  [MACHINE_STATUSES.FIVE_S]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.ON,
    },
    displayName: '5S',
  },
  [MACHINE_STATUSES.MEETING_PAGI_SORE]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Meeting Pagi/Sore',
  },
  [MACHINE_STATUSES.PEMANASAN]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Pemanasan',
  },
  [MACHINE_STATUSES.CEK_QC]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Cek QC',
  },
  [MACHINE_STATUSES.INPUT_DATA]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Input Data',
  },
  [MACHINE_STATUSES.BUANG_KIRIKO]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Buang Kiriko',
  },
  [MACHINE_STATUSES.MENUNGGU_INTRUKSI_ATASAN]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Menunggu Intruksi Atasan',
  },
  [MACHINE_STATUSES.REPAIR]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Repair',
  },
  [MACHINE_STATUSES.KAIZEN]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Kaizen',
  },
  [MACHINE_STATUSES.GANTI_TOISHI]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Ganti Toishi',
  },
  [MACHINE_STATUSES.GANTI_DRESSER]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Ganti Dresser',
  },
  [MACHINE_STATUSES.ONE_TOOTH]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.ON,
      green: LIGHT_STATE.OFF,
    },
    displayName: '1 Tooth',
  },
  [MACHINE_STATUSES.CHECK_HAGATA]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Check Hagata',
  },
  [MACHINE_STATUSES.DRESSING_PROFILE]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.BLINKING,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Dressing Profile',
  },
  [MACHINE_STATUSES.DRESS_2]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Dress-2',
  },
  [MACHINE_STATUSES.ANTRI_JOB]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Antri Job',
  },
  // Backward compatibility
  [MACHINE_STATUSES.MAINTENANCE]: {
    borderColor: COLORS.CUSTOM_PINK,
    headerColor: COLORS.CUSTOM_PINK,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.BLINKING,
    },
    displayName: 'Maintenance',
  },
  [MACHINE_STATUSES.QUALITY_CHECK]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: {
      red: LIGHT_STATE.ON,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Quality Check',
  },
  [MACHINE_STATUSES.IDLE_TIME]: {
    borderColor: COLORS.CUSTOM_PURPLE,
    headerColor: COLORS.CUSTOM_PURPLE,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.BLINKING,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Idle Time',
  },
  [MACHINE_STATUSES.PRODUCTION]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.ON,
    },
    displayName: 'Production',
  },
  [MACHINE_STATUSES.SHUTDOWN]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: {
      red: LIGHT_STATE.OFF,
      yellow: LIGHT_STATE.OFF,
      green: LIGHT_STATE.OFF,
    },
    displayName: 'Shutdown',
  },
}

// Default signal configuration
const DEFAULT_CONFIG = {
  borderColor: COLORS.BLACK,
  headerColor: COLORS.BLACK,
  signal: {
    red: LIGHT_STATE.OFF,
    yellow: LIGHT_STATE.OFF,
    green: LIGHT_STATE.OFF,
  },
  displayName: 'Unknown',
}

// Get status configuration based on status string
export const getStatusConfig = (status) => {
  // Convert status to lowercase for case-insensitive matching
  const normalizedStatus = status.toLowerCase()

  // Return matching config or default config
  return STATUS_CONFIG_MAP[normalizedStatus] || { ...DEFAULT_CONFIG, displayName: status }
}

// Generate CSS class names based on light state
export const getLightClass = (state) => {
  switch (state) {
    case LIGHT_STATE.ON:
      return 'light-on'
    case LIGHT_STATE.BLINKING:
      return 'light-blinking'
    case LIGHT_STATE.OFF:
    default:
      return 'light-off'
  }
}

// Add CSS classes for the signal states
export const addSignalStylesheet = () => {
  // Only add stylesheet if it doesn't already exist
  if (typeof document !== 'undefined' && !document.getElementById('signal-light-styles')) {
    const stylesheet = document.createElement('style')
    stylesheet.id = 'signal-light-styles'
    stylesheet.innerHTML = `
      /* Blinking animation */
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.3; }
      }
      
      /* Apply animations to elements */
      .light-blinking {
        animation: blink 1s infinite;
      }
      
      .light-on {
        opacity: 1;
      }
      
      .light-off {
        opacity: 0.3;
      }
    `
    document.head.appendChild(stylesheet)
  }
}

// Initialize CSS when module is imported
if (typeof document !== 'undefined') {
  addSignalStylesheet()
}

// Helper function to render the signal light based on status
export const renderSignalLight = (status) => {
  const config = getStatusConfig(status)

  return {
    redClass: getLightClass(config.signal.red),
    yellowClass: getLightClass(config.signal.yellow),
    greenClass: getLightClass(config.signal.green),
    displayName: config.displayName,
    borderColor: config.borderColor,
    headerColor: config.headerColor,
  }
}
