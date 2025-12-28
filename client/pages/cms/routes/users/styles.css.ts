import { style } from '@vanilla-extract/css'

export const container = style({
  padding: '24px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  minHeight: '100%',
})

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #f0f0f0',
})

export const title = style({
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
  color: '#262626',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const error = style({
  padding: '12px 16px',
  marginBottom: '16px',
  backgroundColor: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: '4px',
  color: '#cf1322',
})

export const stats = style({
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#fafafa',
  borderRadius: '4px',
})

export const statItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const statLabel = style({
  fontSize: '14px',
  color: '#8c8c8c',
})

export const statValue = style({
  fontSize: '18px',
  fontWeight: 600,
  color: '#1890ff',
})

export const table = style({
  backgroundColor: '#fff',
})

export const avatar = style({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
})

