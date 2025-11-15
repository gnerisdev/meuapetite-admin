import React, { useState } from 'react'
import fecthApi from 'fetch'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

const Create = () => {

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
  }

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

        </Grid>
      </Box>
    </>
  )
}

export default Create
