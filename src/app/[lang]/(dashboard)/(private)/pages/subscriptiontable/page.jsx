'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Snackbar, Alert, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

const SubscriptionTable = () => {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('https://api.parkmywheels.com/admin/subscriptionall')

      // Ensure every row has a unique `id`
      const formattedData = response.data.map((item) => ({
        ...item,
        id: item._id, // Map `_id` to `id`
      }))

      setSubscriptions(formattedData)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching subscriptions',
        severity: 'error'
      })
    }
  }

  const columns = [
    { field: 'userId', headerName: 'User ID', width: 150 },
    { field: 'planId', headerName: 'Plan ID', width: 150 },
    { field: 'planTitle', headerName: 'Plan Title', width: 150 },
    { field: 'price', headerName: 'Price ($)', width: 100 },
    {
      field: 'autoRenew',
      headerName: 'Auto Renew',
      width: 120,
      valueGetter: (params) => (params.row?.autoRenew ? 'Yes' : 'No')
    },
    { field: 'expiresAt', headerName: 'Expires At', width: 150 },

    {
      field: 'paymentDetails',
      headerName: 'Payment Details',
      width: 250,
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.paymentDetails) return 'N/A'

        const { cardNumber, cardHolderName } = params.row.paymentDetails || {}

        const maskedCard = cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : 'No Card'


        return `${maskedCard} - ${cardHolderName || 'Unknown'}`
      }
    }

  ]


  return (
    <Box sx={{ height: 400, width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Subscriptions</Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#329a73' }}
          startIcon={<AddIcon />}
          onClick={() => router.push('/en/pages/subscriptions')}
        >
          Add Subscription
        </Button>
      </Box>
      <DataGrid
        rows={subscriptions}
        columns={columns}
        pageSize={5}
        checkboxSelection
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SubscriptionTable
