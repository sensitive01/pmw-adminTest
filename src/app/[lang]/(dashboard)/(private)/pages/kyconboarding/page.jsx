'use client'

import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Snackbar, Alert, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, FormControl, InputLabel, Select } from '@mui/material'
import { Delete, Visibility, Edit } from '@mui/icons-material'
import axios from 'axios'

const KycDataTable = () => {
  const [kycData, setKycData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedKyc, setSelectedKyc] = useState(null)
  const [currentViewItem, setCurrentViewItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editFormData, setEditFormData] = useState({
    idProof: '',
    idProofNumber: '',
    addressProof: '',
    addressProofNumber: '',
    status: '',
    idProofImage: null,
    addressProofImage: null
  })
  const [idProofImagePreview, setIdProofImagePreview] = useState('')
  const [addressProofImagePreview, setAddressProofImagePreview] = useState('')

  const idProofTypes = ['Passport',
    'Driving License',
    'Phone Bill',
    'Ration Card',
    'Pancard',
    'Latest Bank Statement',
    'Aadhar Card',
    'Bank Passbook Photo',
    'Others'
  ]
  const addressProofTypes = ['Driving License',
    'Passport',
    'Ration Card',
    'Aadhar Card'
  ]

  const fetchVendorName = async (vendorId) => {
    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/fetch-vendor-data?id=${vendorId}`)
      if (response.data && response.data.data && response.data.data.vendorName) {
        return response.data.data.vendorName
      }
      return 'N/A'
    } catch (error) {
      console.error('Error fetching vendor name:', error)
      return 'N/A'
    }
  }

  useEffect(() => {
    fetchKycData()
  }, [])

  const fetchKycData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('https://api.parkmywheels.com/vendor/getallkyc')

      const formattedData = await Promise.all(
        response.data.data.map(async (item) => {
          const vendorName = await fetchVendorName(item.vendorId)
          return {
            ...item,
            id: item._id,
            vendorName: vendorName
          }
        })
      )
      setKycData(formattedData)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching KYC data',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyKyc = async (vendorId) => {
    try {
      await axios.put(`https://api.parkmywheels.com/vendor/verifykyc/${vendorId}`)
      setKycData(prevData => prevData.map(item => item.vendorId === vendorId ? { ...item, status: 'Verified' } : item))
      setSnackbar({ open: true, message: 'KYC verified successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error verifying KYC',
        severity: 'error'
      })
    }
  }

  const handleView = (item) => {
    setCurrentViewItem(item)
    setViewDialogOpen(true)
  }

  const handleEditClick = async (item) => {
    try {
      setLoading(true)
      const response = await axios.get(`https://api.parkmywheels.com/vendor/getkyc/${item.vendorId}`)

      if (response.data && response.data.data) {
        const kycDetails = response.data.data
        setEditFormData({
          idProof: kycDetails.idProof,
          idProofNumber: kycDetails.idProofNumber,
          addressProof: kycDetails.addressProof,
          addressProofNumber: kycDetails.addressProofNumber,
          status: kycDetails.status,
          idProofImage: null,
          addressProofImage: null
        })
        setIdProofImagePreview(kycDetails.idProofImage)
        setAddressProofImagePreview(kycDetails.addressProofImage)
        setSelectedKyc(item)
        setEditDialogOpen(true)
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching KYC details',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (item) => {
    setSelectedKyc(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`https://api.parkmywheels.com/admin/delete/${selectedKyc.id}`)
      setKycData(prevData => prevData.filter(item => item.id !== selectedKyc.id))
      setSnackbar({
        open: true,
        message: 'KYC record deleted successfully',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting KYC record',
        severity: 'error'
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedKyc(null)
    }
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (type === 'idProof') {
        setEditFormData(prev => ({
          ...prev,
          idProofImage: file
        }))
        setIdProofImagePreview(URL.createObjectURL(file))
      } else {
        setEditFormData(prev => ({
          ...prev,
          addressProofImage: file
        }))
        setAddressProofImagePreview(URL.createObjectURL(file))
      }
    }
  }

  const handleEditSubmit = async () => {
    try {
      setLoading(true)
      const formData = new FormData()

      // Append all fields to formData
      formData.append('idProof', editFormData.idProof)
      formData.append('idProofNumber', editFormData.idProofNumber)
      formData.append('addressProof', editFormData.addressProof)
      formData.append('addressProofNumber', editFormData.addressProofNumber)
      formData.append('status', editFormData.status)

      if (editFormData.idProofImage instanceof File) {
        formData.append('idProofImage', editFormData.idProofImage)
      }

      if (editFormData.addressProofImage instanceof File) {
        formData.append('addressProofImage', editFormData.addressProofImage)
      }

      const response = await axios.put(
        `https://api.parkmywheels.com/vendor/updatekyc/${selectedKyc.vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setSnackbar({
        open: true,
        message: 'KYC updated successfully',
        severity: 'success'
      })

      // Refresh the data
      fetchKycData()
      setEditDialogOpen(false)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating KYC',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (event) => {
    setSearchText(event.target.value)
  }

  const filteredData = kycData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  const columns = [
    { field: 'vendorId', headerName: 'Vendor ID', width: 200 },
    { field: 'vendorName', headerName: 'Vendor Name', width: 200 },
    { field: 'idProof', headerName: 'ID Proof', width: 150 },
    { field: 'idProofNumber', headerName: 'ID Proof Number', width: 180 },
    {
      field: 'idProofImage',
      headerName: 'ID Proof Image',
      width: 200,
      renderCell: (params) => (
        <img src={params.value} alt="ID Proof" style={{ width: 50, height: 50, objectFit: 'contain' }} />
      )
    },
    { field: 'addressProof', headerName: 'Address Proof', width: 150 },
    { field: 'addressProofNumber', headerName: 'Address Proof Number', width: 180 },
    {
      field: 'addressProofImage',
      headerName: 'Address Proof Image',
      width: 200,
      renderCell: (params) => (
        <img src={params.value} alt="Address Proof" style={{ width: 50, height: 50, objectFit: 'contain' }} />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.value === 'Verified' ? 'success' : 'error'}
          onClick={() => verifyKyc(params.row.vendorId)}
          disabled={params.value === 'Verified'}
          size="small"
        >
          {params.value === 'Verified' ? 'Verified' : 'Not Verified'}
        </Button>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => handleView(params.row)}
            size="small"
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleEditClick(params.row)}
            size="small"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            size="small"
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ height: '100%', width: '100%', padding: 2 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center' }}>KYC Details</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
        />
      </Box>
      <DataGrid
        rows={filteredData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection={false}
        loading={loading}
        autoHeight
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
        }}
      />

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>KYC Details</DialogTitle>
        <DialogContent>
          {currentViewItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Vendor ID: {currentViewItem.vendorId}</Typography>
              <Typography variant="h6">Vendor Name: {currentViewItem.vendorName}</Typography>
              <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                <Box>
                  <Typography variant="subtitle1">ID Proof Details</Typography>
                  <Typography>Type: {currentViewItem.idProof}</Typography>
                  <Typography>Number: {currentViewItem.idProofNumber}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">ID Proof Image:</Typography>
                    <img
                      src={currentViewItem.idProofImage}
                      alt="ID Proof"
                      style={{ maxWidth: '100%', maxHeight: 300, marginTop: 1 }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Address Proof Details</Typography>
                  <Typography>Type: {currentViewItem.addressProof}</Typography>
                  <Typography>Number: {currentViewItem.addressProofNumber}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Address Proof Image:</Typography>
                    <img
                      src={currentViewItem.addressProofImage}
                      alt="Address Proof"
                      style={{ maxWidth: '100%', maxHeight: 300, marginTop: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit KYC Details</DialogTitle>
        <DialogContent>
          {selectedKyc && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6">Vendor ID: {selectedKyc.vendorId}</Typography>
              <Typography variant="h6">Vendor Name: {selectedKyc.vendorName}</Typography>

              <Box sx={{ display: 'flex', gap: 4 }}>
                {/* ID Proof Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>ID Proof Details</Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>ID Proof Type</InputLabel>
                    <Select
                      name="idProof"
                      value={editFormData.idProof}
                      onChange={handleEditFormChange}
                      label="ID Proof Type"
                    >
                      {idProofTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="ID Proof Number"
                    name="idProofNumber"
                    value={editFormData.idProofNumber}
                    onChange={handleEditFormChange}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>ID Proof Image:</Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="id-proof-image-upload"
                      onChange={(e) => handleImageChange(e, 'idProof')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="id-proof-image-upload">
                      <Button variant="contained" component="span" sx={{ mb: 1 }}>
                        Upload New ID Proof
                      </Button>
                    </label>
                    {idProofImagePreview && (
                      <img
                        src={idProofImagePreview}
                        alt="ID Proof Preview"
                        style={{ maxWidth: '100%', maxHeight: 200, display: 'block', marginTop: 1 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Address Proof Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Address Proof Details</Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Address Proof Type</InputLabel>
                    <Select
                      name="addressProof"
                      value={editFormData.addressProof}
                      onChange={handleEditFormChange}
                      label="Address Proof Type"
                    >
                      {addressProofTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Address Proof Number"
                    name="addressProofNumber"
                    value={editFormData.addressProofNumber}
                    onChange={handleEditFormChange}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Address Proof Image:</Typography>
                    <input
                      accept="image/*"
                      type="file"
                      id="address-proof-image-upload"
                      onChange={(e) => handleImageChange(e, 'addressProof')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="address-proof-image-upload">
                      <Button variant="contained" component="span" sx={{ mb: 1 }}>
                        Upload New Address Proof
                      </Button>
                    </label>
                    {addressProofImagePreview && (
                      <img
                        src={addressProofImagePreview}
                        alt="Address Proof Preview"
                        style={{ maxWidth: '100%', maxHeight: 200, display: 'block', marginTop: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  label="Status"
                >
                  <MenuItem value="Verified">Verified</MenuItem>
                  <MenuItem value="Not Verified">Not Verified</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update KYC'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this KYC record?</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            KYC ID: {selectedKyc?.id}
          </Typography>
          <Typography variant="subtitle2">
            Vendor Name: {selectedKyc?.vendorName}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default KycDataTable
