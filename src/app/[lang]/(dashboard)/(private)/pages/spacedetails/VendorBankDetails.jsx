'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'

// Icon Imports
import SaveIcon from '@mui/icons-material/Save'

const VendorBankDetails = ({ vendorId }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()

  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  })

  // Fetch existing bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!vendorId) {
        setFetchLoading(false)
        return
      }

      try {
        setFetchLoading(true)
        console.log(`Fetching bank details from: ${API_URL}/vendor/getbankdetails/${vendorId}`)
        const response = await axios.get(`${API_URL}/vendor/getbankdetails/${vendorId}`)
        
        if (response.data?.data && response.data.data.length > 0) {
          const bankData = response.data.data[0]
          setAccountNumber(bankData.accountnumber || '')
          setConfirmAccountNumber(bankData.accountnumber || '')
          setAccountHolderName(bankData.accountholdername || '')
          setIfscCode(bankData.ifsccode || '')
        }
      } catch (error) {
        console.error('Error fetching bank details:', error)
        // If 404, it's fine - just means no existing details
        if (error.response?.status !== 404) {
          setSnackbar({
            open: true,
            message: 'Failed to load bank details',
            severity: 'error'
          })
        }
      } finally {
        setFetchLoading(false)
      }
    }

    fetchBankDetails()
  }, [vendorId, API_URL])

  const validateForm = () => {
    if (!accountNumber) {
      setSnackbar({
        open: true, 
        message: 'Please enter account number',
        severity: 'warning'
      })
      return false
    }
    
    if (accountNumber !== confirmAccountNumber) {
      setSnackbar({
        open: true, 
        message: 'Account numbers do not match',
        severity: 'warning'
      })
      return false
    }
    
    if (!accountHolderName) {
      setSnackbar({
        open: true, 
        message: 'Please enter account holder name',
        severity: 'warning'
      })
      return false
    }
    
    if (!ifscCode) {
      setSnackbar({
        open: true, 
        message: 'Please enter IFSC code',
        severity: 'warning'
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!vendorId) {
      setSnackbar({
        open: true, 
        message: 'You must be logged in to update bank details',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)
      
      const formData = new FormData()
      formData.append('vendorId', vendorId)
      formData.append('accountnumber', accountNumber)
      formData.append('confirmaccountnumber', confirmAccountNumber)
      formData.append('accountholdername', accountHolderName)
      formData.append('ifsccode', ifscCode)
      
      const response = await axios.post(`${API_URL}/vendor/bankdetails`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      setSnackbar({
        open: true, 
        message: response.data.message || 'Bank details saved successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving bank details:', error)
      setSnackbar({
        open: true, 
        message: error.response?.data?.message || 'Failed to save bank details',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (fetchLoading) {
    return (
      <Card sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    )
  }

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader 
        title="Bank Account Details" 
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
      />
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Your Payout will be transferred to this account
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              ':hover': { boxShadow: 2 }
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Account Number
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Confirm Account Number
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                placeholder="Confirm account number"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Account Holder Name
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Enter account holder name"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                IFSC Code
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="Enter IFSC code"
                sx={{ mb: 2 }}
              />
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit"
              variant="contained" 
              color="success"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ 
                py: 1.5,
                px: 4, 
                borderRadius: 2,
                textTransform: 'none',
                fontSize: 16
              }}
            >
              {loading ? 'Saving...' : 'Save Bank Details'}
            </Button>
          </Box>
        </form>
      </CardContent>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default VendorBankDetails
