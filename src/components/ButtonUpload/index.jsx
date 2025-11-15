import * as React from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { PhotoCameraIcon as PhotoCamera } from 'components/icons'
import Stack from '@mui/material/Stack'

const UploadButtons = (props) => {

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Button variant="contained" component="label">
        { props.text || "Nova imagem" }
        <input hidden accept="image/*" onChange={props.loadFile} multiple={true} type="file" />
      </Button>
      <IconButton color="primary" aria-label="upload picture" component="label">
        <input hidden accept="image/*" onChange={props.loadFile} type="file" />
        <PhotoCamera />
      </IconButton>
    </Stack>
  )
}

export default UploadButtons
