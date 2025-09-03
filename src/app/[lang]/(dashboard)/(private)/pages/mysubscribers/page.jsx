'use client'
import React, { useState, useEffect } from 'react'

import { useSearchParams } from 'next/navigation'

import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Checkbox,
  TextField
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'

const MySubscriptionListPage = () => {
  const searchParams = useSearchParams()
  const vendorId = searchParams.get('id')
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [planName, setPlanName] = useState('') // Added missing state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    if (!vendorId) {
      setError('Plan ID is missing from URL')
      setLoading(false)
      return
    }

    fetchData()
  }, [vendorId])

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm) {
      const filtered = data.filter(item =>
        item.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paymentStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.amount?.toString().includes(searchTerm) ||
        item.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionName?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }
  }, [searchTerm, data])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/fetch-subscriber-list/${vendorId}`)

      if (response.data.success) {
        // Updated to use 'subscribers' instead of 'plans'
        const subscribersData = response.data.subscribers || []

        setData(subscribersData)
        setFilteredData(subscribersData)
        
        // Set plan name from the first subscriber if available
        if (subscribersData.length > 0) {
          setPlanName(subscribersData[0].planName || 'Unknown Plan')
        }
        
        setLoading(false)
      } else {
        setError('Failed to fetch subscription data')
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError('Error fetching subscription data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    try {
      const date = new Date(dateString)

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const openDeleteDialog = (item) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return

    try {
      if (selectedItem._id === 'multiple') {
        // Handle multiple deletions
        // Add your bulk delete API call here
        // await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-payments`, { data: { ids: selectedItems } })
        
        setData(data.filter(item => !selectedItems.includes(item._id)))
        setSelectedItems([])
        setSelectAll(false)
        
        setSnackbar({
          open: true,
          message: `${selectedItems.length} payment records deleted successfully`,
          severity: 'success'
        })
      } else {
        // Handle single deletion
        // await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-payment/${selectedItem._id}`)

        setData(data.filter(item => item._id !== selectedItem._id))
        
        setSnackbar({
          open: true,
          message: 'Payment record deleted successfully',
          severity: 'success'
        })
      }
      
      setDeleteDialogOpen(false)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting payment record',
        severity: 'error'
      })
      console.error('Error deleting payment record:', error)
    }
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
      
      // Update selectAll state based on new selection
      setSelectAll(newSelection.length === filteredData.length)
      
      return newSelection
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredData.map(item => item._id))
    }

    setSelectAll(!selectAll)
  }

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'success'
      case 'error':
      case 'failed':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" sx={{ color: '#329a73', mb: 2 }}>
          No subscription payments found for this plan
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Plan Name: {planName}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      backgroundColor: '#f4f4f4',
      minHeight: '100vh',
      p: 3
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            color: '#329a73'
          }}
        >
          Subscription Payments
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Plan Name: {planName}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search payments..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />

        <Typography variant="body2" color="textSecondary">
          {filteredData.length} payment(s) found
        </Typography>
      </Box>

      {selectedItems.length > 0 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          backgroundColor: '#e6f3ef',
          p: 2,
          borderRadius: 2
        }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {selectedItems.length} payment(s) selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => openDeleteDialog({ _id: 'multiple' })}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#329a73' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  sx={{
                    color: 'white',
                    '&.Mui-checked': {
                      color: 'white'
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendor</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transaction Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              {/* <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={item._id} hover>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.vendorName || 'N/A'}</TableCell>
                <TableCell>{item.planName || 'Unknown Plan'}</TableCell>
                <TableCell>{item.transactionName || 'N/A'}</TableCell>
                <TableCell>₹{item.amount || '0'}</TableCell>
                <TableCell>
                  <Chip
                    label={item.paymentStatus ? item.paymentStatus.toUpperCase() : 'N/A'}
                    color={getPaymentStatusColor(item.paymentStatus)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.paymentId || 'N/A'}</TableCell>
                <TableCell>{item.orderId || 'N/A'}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                {/* <TableCell>
                  <IconButton
                    color="primary"
                    // onClick={() => handleViewItem(item)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => openDeleteDialog(item)}
                    title="Delete Payment"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Payment Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedItem && selectedItem._id === 'multiple'
              ? `Are you sure you want to delete ${selectedItems.length} selected payment records? This action cannot be undone.`
              : `Are you sure you want to delete the payment record for "${selectedItem?.vendorName}"? This action cannot be undone.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteItem} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MySubscriptionListPage
