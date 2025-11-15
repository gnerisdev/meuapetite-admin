import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectSmall(props) {
  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id="demo-select-small" sx={{ background: '#fff', paddingRight: '8px' }}>
        {props.label}
      </InputLabel>
      
      <Select labelId="demo-select-small" value={props.value || ''} label="value" onChange={props.onChange}>
        {props.data.map((item) => <MenuItem key={item.value} value={item.value}>{item.text}</MenuItem>)}
        {!props.data.length && <div style={{ paddingLeft: 10 }}>Nenhum item</div>}
      </Select>
    </FormControl>
  );
}
