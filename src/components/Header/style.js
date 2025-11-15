import { styled } from '@mui/material/styles'

export const Header = styled('header')(({ theme }) => ({
  flexWrap: 'wrap',
  gap: '1rem',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  paddingBottom: '16px',
  margin: `${theme.spacing(1)} 0 ${theme.spacing(4)}`,
  '& h1': {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 500
  },
}))

export const BtnBack = styled('span')(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  marginRight: '0.4rem',
  cursor: 'pointer'
}))
