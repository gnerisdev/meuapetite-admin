import { Button, Card } from '@mui/material';
import { styled } from '@mui/system';

export const ContainerMain = styled(Card)({
  display: 'grid',
  flexWrap: 'wrap',
  alignItems: 'end',
  gap: '12x',
  padding: '1.5rem 20px'
});

export const FilterContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '8px',

  '.grid-item': {
    backgroundColor: '#ddd',
    padding: '20px',
    textAlign: 'center',
  },

  '@media screen and (min-width: 600px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },

  '@media screen and (min-width: 900px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  alignItems: 'end',

  '& > *': {
    margin: 0,
  },

  label: {
    fontSize: 'small'
  },
  input: {
    padding: '8px',
    marginRight: '4px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
  },
  select: {
    height: '35px',
    padding: '4px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '8px',
    width: '100%',
  }
}));

export const ContainerButton = styled('div')({
  marginTop: 16,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'end',
  gap: '8px',
  width: '100%',
});

export const ButtonFilter = styled(Button)({
  height: 35,
  minWidth: 120
});