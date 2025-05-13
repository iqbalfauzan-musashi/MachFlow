import React from 'react'
import { CTooltip } from '@coreui/react'

/**
 * CustomTooltip component that wraps elements with CoreUI tooltip functionality
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child element to apply the tooltip to
 * @param {string} props.content - Text content to display in the tooltip
 * @param {string} props.placement - Tooltip placement (top, right, bottom, left)
 * @param {Object} props.tooltipProps - Additional props to pass to CTooltip
 * @returns {ReactNode} Wrapped element with tooltip
 */
const CustomTooltip = ({ children, content, placement = 'top', tooltipProps = {} }) => {
  if (!content) {
    return children
  }

  return (
    <CTooltip content={content} placement={placement} {...tooltipProps}>
      {children}
    </CTooltip>
  )
}

export default CustomTooltip
