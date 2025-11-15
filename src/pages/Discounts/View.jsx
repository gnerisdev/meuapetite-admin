import React, { useState } from 'react'
import fecthApi from 'fetch'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import ButtonUpload from 'components/ButtonUpload'
import Gallery from 'components/Gallery'
import { CategoryIcon as Category } from 'components/icons'

const Create = () => {
  const [images, setImages] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const response = await fecthApi('post', 'category', {
      name: data.get('name'),
      image: images[0],
    })
    console.log(response)
  }

  //Load images
  const loadFile = async (e) => { }

  const closeImage = (id) =>
    setImages((items) => items.filter((item) => item.id !== id))

  return (
    <>
      <Box component="section" noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <TextField
              margin="dense"
              required
              fullWidth
              name="name"
              label="Nome"
              autoFocus
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <ButtonUpload text="carregar foto" loadFile={loadFile} />
            <Gallery itemData={images} closeImage={closeImage} />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Create
