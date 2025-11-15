import { MenuItem } from '@mui/material';
import { styled } from '@mui/system';

export const ContainerCategories = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4)
}));

export const ContainerCategory = styled('div')(({ theme }) => ({
  border: '1px solid #e0e1e0', 
}));

export const HeaderCategory = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#f1f3f1',
  color: '#000000',
  padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
  fontWeight: 'bold',
  'h2': {
    fontSize: theme.spacing(2.2),
  },
  '.actions': {
    display: 'flex',
    flexWrap: 'no-wrap',
    gap: theme.spacing(2),
    '.btnUp, .btnDown': {
      fontSize: theme.spacing(2.2),
      margin: `0 ${theme.spacing(1)}`,
      cursor: 'pointer'
    }
  },
}));

export const BodyCategory = styled('div')(({ theme }) => ({
  borderTop: '1px solid #e0e1e0', 
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`, 
}));

export const CategoryItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(3),
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  padding: `${theme.spacing(2)} 0`,
  '.wrapperInfo': {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '24px auto 1fr',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  '.imageItem': {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '1px solid #000'
  },
  '.nameItem': {
    textTransform: 'lowercase',
    whiteSpace: 'nowrap', 
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%', 
  },
  '.nameItem::first-letter': {
    textTransform: 'uppercase'
  },
  '.action': {
    display: 'flex',
    alignItems: 'center',
    minWidth: '121px',
    '.move': {
      display: 'flex',
      gap: '8px'
    },
    '.btnUp, .btnDown': {
      fontSize: theme.spacing(2.2),
      margin: `0 ${theme.spacing(1)}`,
      cursor: 'pointer'
    }
  },
}));

export const MenuItemCuston = styled(MenuItem)({
  display: 'flex',
  gap: 8
});
