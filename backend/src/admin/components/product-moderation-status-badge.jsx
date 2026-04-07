import React from 'react'

const ProductModerationStatusBadge = (props) => {
  const record = props?.record
  const value = String(record?.params?.moderationStatus || '')
  const label = record?.params?.moderationStatusLabel || value || '—'

  let background = '#E5E7EB'
  let color = '#374151'

  if (value === 'PENDING') {
    background = '#FEF3C7'
    color = '#92400E'
  } else if (value === 'APPROVED') {
    background = '#DCFCE7'
    color = '#166534'
  } else if (value === 'REJECTED') {
    background = '#FEE2E2'
    color = '#991B1B'
  }

  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        background,
        color,
        whiteSpace: 'nowrap',
      },
    },
    label,
  )
}

export default ProductModerationStatusBadge