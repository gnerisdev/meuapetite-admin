import React, { useState, useEffect } from 'react'
import fetchApi from 'fetch'
import Box from '@mui/material/Box'
import { DataGrid, ptBR } from '@mui/x-data-grid'

const columns = [
  {
    field: 'code',
    headerName: 'Cód.',
    width: 150,
  },
  {
    field: 'name',
    headerName: 'Nome',
    width: 300,
  },
  {
    field: 'categories',
    headerName: 'Categorias',
    width: 200,
  },
  {
    field: 'variations',
    headerName: 'Variações',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
  {
    field: 'price',
    headerName: 'Preço',
    width: 200,
  },
]

const rows = [
  {
    id: '0',
    code: '03039221',
    name: 'Short jeans',
    categories: 'Roupas e calçados',
    price: 'R$ 35,00',
  },
  {
    id: '1',
    code: '03039222',
    name: 'Bermuda jeans',
    categories: 'Roupas e calçados',
    price: 'R$ 42,00',
  },
  {
    id: '2',
    code: '03039223',
    name: 'Camissa',
    categories: 'Roupas e calçados',
    price: 'R$ 45,00',
  },
  {
    id: '3',
    code: '03039224',
    name: 'Camisa polo',
    categories: 'Roupas e calçados',
    price: 'R$ 16,00',
  },
  {
    id: '4',
    code: '03039225',
    name: 'Camisa nike',
    categories: 'Roupas e calçados',
    price: 'R$ 23,00',
  },
  {
    id: '5',
    code: '03039226',
    name: 'Tênis adidas',
    categories: 'Roupas e calçados',
    price: 'R$ 150,00',
  },
  {
    id: '6',
    code: '03039227',
    name: 'Tênis masculino',
    categories: 'Roupas e calçados',
    price: 'R$ 44,00',
  },
]

export default function DataGridDemo() {
  const [categories, setCategories] = useState([])

  const getCategories = async () => {
    const req = await fetchApi('get', 'category')
    const res =await req.json()
    setCategories(res)
  }

  useEffect(() => {
    getCategories()
  }, [])

  const rowCategories = categories.map((item) => (item.id = item._id))

  return (
    <>
      {' '}
      <Box sx={{ height: 430, width: '100%' }}>
        <DataGrid
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
        />
      </Box>
    </>
  )
}
