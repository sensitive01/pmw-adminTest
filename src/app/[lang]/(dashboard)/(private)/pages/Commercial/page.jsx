'use client'
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  Select
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

const CommercialServicesForm = () => {
  const router = useRouter()

  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    contactNumbers: [''],
    location: {
      address: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      latitude: '',
      longitude: ''
    },
    parkingSlots: '',
    parkingTypes: [{ type: '', space: '' }]
  })
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }))
  }

  const handleContactChange = (index, value) => {
    const newContacts = [...formData.contactNumbers]

    newContacts[index] = value
    setFormData(prev => ({ ...prev, contactNumbers: newContacts }))
  }

  const addContactField = () => {
    setFormData(prev => ({ ...prev, contactNumbers: [...prev.contactNumbers, ''] }))
  }

  const removeContactField = (index) => {
    const newContacts = formData.contactNumbers.filter((_, i) => i !== index)

    setFormData(prev => ({ ...prev, contactNumbers: newContacts.length ? newContacts : [''] }))
  }

  const handleParkingChange = (index, field, value) => {
    const newParkingTypes = [...formData.parkingTypes]

    newParkingTypes[index][field] = value
    setFormData(prev => ({ ...prev, parkingTypes: newParkingTypes }))
  }

  const addParkingField = () => {
    setFormData(prev => ({ ...prev, parkingTypes: [...prev.parkingTypes, { type: 'Car', space: '' }] }))
  }

  const removeParkingField = (index) => {
    const newParkingTypes = formData.parkingTypes.filter((_, i) => i !== index)

    setFormData(prev => ({ ...prev, parkingTypes: newParkingTypes.length ? newParkingTypes : [{ type: 'Car', space: '' }] }))
  }

  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/createCommercial`, formData)
      setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Error submitting form', severity: 'error' })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>Commercial Services Form</Typography>
          
          <TextField fullWidth label="Business Name" name="businessName" value={formData.businessName} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1">Contact Numbers</Typography>
          {formData.contactNumbers.map((contact, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField fullWidth label="Contact Number" value={contact} onChange={(e) => handleContactChange(index, e.target.value)} sx={{ mr: 1 }} />
              <IconButton onClick={addContactField} color="primary"><AddCircleOutlineIcon /></IconButton>
              {formData.contactNumbers.length > 1 && <IconButton onClick={() => removeContactField(index)} color="error"><DeleteOutlineIcon /></IconButton>}
            </Box>
          ))}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Location Details</Typography>
          {Object.keys(formData.location).map((key) => (
            <TextField key={key} fullWidth label={key.charAt(0).toUpperCase() + key.slice(1)} name={key} value={formData.location[key]} onChange={handleLocationChange} sx={{ mb: 2 }} />
          ))}

          <TextField fullWidth label="Number of Parking Slots" name="parkingSlots" value={formData.parkingSlots} onChange={handleInputChange} sx={{ mb: 2 }} />

          <Typography variant="subtitle1">Parking Types</Typography>
          {formData.parkingTypes.map((parking, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Select value={parking.type} onChange={(e) => handleParkingChange(index, 'type', e.target.value)} sx={{ mr: 1, width: 120 }}>
                <MenuItem value="Car">Car</MenuItem>
                <MenuItem value="Bike">Bike</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
              <TextField label="Space" value={parking.space} onChange={(e) => handleParkingChange(index, 'space', e.target.value)} sx={{ mr: 1 }} />
              <IconButton onClick={addParkingField} color="primary"><AddCircleOutlineIcon /></IconButton>
              {formData.parkingTypes.length > 1 && <IconButton onClick={() => removeParkingField(index)} color="error"><DeleteOutlineIcon /></IconButton>}
            </Box>
          ))}

          <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Submit</Button>
          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CommercialServicesForm



