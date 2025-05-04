import React from 'react'

// Cikarang Plant
const Cikarang = React.lazy(() => import('./views/cikarang/Cikarang.js'))

// Karawang Plant
const Karawang = React.lazy(() => import('./views/karawang/Karawang.js'))

// Tool Control
const Tool_Control = React.lazy(() => import('./views/tool_control/Tool_Control.js'))

// Kanagata
const Kanagata = React.lazy(() => import('./views/kanagata/Kanagata.js'))

// Manufacturing
const Inventory = React.lazy(() => import('./views/manufacturing/inventory/Inventory.js'))
const JobList = React.lazy(() => import('./views/manufacturing/joblist/JobList.js'))
const JobHistory = React.lazy(() => import('./views/manufacturing/jobhistory/JobHistory.js'))

// Maintenance
const Pump = React.lazy(() => import('./views/maintenance/pump/Pump.js'))

// PPIC
const Inventory1 = React.lazy(() => import('./views/ppic/Inventory1.js'))

// Timeline Project
const Charts = React.lazy(() => import('./views/charts/Charts'))

// Detail Production
const DetailProduction = React.lazy(
  () => import('./views/pages/detailProduction/DetailProduction.js'),
)

const routes = [
  // Cikarang Plant
  { path: '/cikarang', name: 'Cikarang', element: Cikarang, exact: true },

  // Karawang Plant
  { path: '/karawang', name: 'Karawang', element: Karawang },

  // Tool Control
  { path: '/tool_control', name: 'Tool_Control', element: Tool_Control },

  // Kanagata
  { path: '/kanagata', name: 'Kanagata', element: Kanagata },

  // Manufacturing
  { path: '/manufacturing/inventory', name: 'Inventory', element: Inventory },
  { path: '/manufacturing/jobhistory', name: 'JobHistory', element: JobHistory },
  { path: '/manufacturing/joblist', name: 'JobList', element: JobList },

  // Maintenance
  { path: '/maintenance/Pump', name: 'Pump', element: Pump },

  // PPIC
  { path: '/ppic/inventory1', name: 'Inventory1', element: Inventory1 },

  // Timeline Project
  { path: '/charts', name: 'Charts', element: Charts },

  // Detail Production - Changed from :name to :machineCode to match component
  { path: '/karawang/machine/:machineCode', name: 'DetailProduction', element: DetailProduction },
  { path: '/cikarang/machine/:machineCode', name: 'DetailProduction', element: DetailProduction },
]

export default routes
