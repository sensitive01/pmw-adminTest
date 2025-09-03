'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Paper from '@mui/material/Paper'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Container from '@mui/material/Container'

// Icon Imports
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import SaveIcon from '@mui/icons-material/Save'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AvTimerIcon from '@mui/icons-material/AvTimer'
import CloseIcon from '@mui/icons-material/Close'

// Custom Components
import CustomIconButton from '@/@core/components/mui/IconButton'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import { styled } from '@mui/material/styles'
import CustomAvatar from '@core/components/mui/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { useDropzone } from 'react-dropzone'
import VendorAmenitiesServices from '../VendorAmenitiesServices'
import VendorSupportChat from '../VendorSupportChat'
import VendorBankDetails from '../VendorBankDetails'
import ParkingCharges from '../ParkingCharges'
import BookingEdit from '../BookingEdit'

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

// Product Image Component
const ProductImage = ({ onChange, existingImage }) => {
  const [files, setFiles] = useState([])

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles)
      if (onChange) {
        onChange(acceptedFiles[0])
      }
    }
  })

  const renderFilePreview = file => {
    return file.type?.startsWith('image') ? (
      <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    ) : (
      <i className='ri-file-text-line' />
    )
  }

  const handleRemoveFile = file => {
    const filteredFiles = files.filter(i => i.name !== file.name)
    setFiles(filteredFiles)
    if (onChange && filteredFiles.length === 0) {
      onChange(null)
    }
  }

  const handleRemoveAllFiles = () => {
    setFiles([])
    if (onChange) {
      onChange(null)
    }
  }

  return (
    <Dropzone>
      <Card>
        <CardHeader title='Upload MySpace Banner' />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='ri-upload-2-line' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Your Image Here</Typography>
              <Typography color='text.disabled'>or</Typography>
              <Button variant='outlined' size='small'>
                Browse Image
              </Button>
            </div>
          </div>
          {existingImage && files.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">Current image is being used</Typography>
            </Box>
          )}
          {files.length > 0 && (
            <>
              <List>
                {files.map(file => (
                  <ListItem key={file.name} className='pis-4 plb-3'>
                    <div className='file-details'>
                      <div className='file-preview'>{renderFilePreview(file)}</div>
                      <div>
                        <Typography className='file-name font-medium' color='text.primary'>
                          {file.name}
                        </Typography>
                        <Typography className='file-size' variant='body2'>
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </div>
                    </div>
                    <IconButton onClick={() => handleRemoveFile(file)}>
                      <i className='ri-close-line text-xl' />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <div className='buttons'>
                <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                  Remove All
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

// Business Hours Component
const BusinessHoursUpdate = ({ vendorId }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [businessHours, setBusinessHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const hours = Array.from({ length: 24 }, (_, index) =>
    index < 10 ? `0${index}:00` : `${index}:00`
  )

  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  const initializeDefaultHours = () => {
    return DAYS_OF_WEEK.map(day => ({
      day,
      openTime: '09:00',
      closeTime: '21:00',
      is24Hours: false,
      isClosed: false
    }))
  }

  useEffect(() => {
    const fetchBusinessHours = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching business hours from: ${API_URL}/vendor/fetchbusinesshours/${vendorId}`)
        const response = await axios.get(`${API_URL}/vendor/fetchbusinesshours/${vendorId}`)

        if (response.data?.businessHours && response.data.businessHours.length > 0) {
          setBusinessHours(response.data.businessHours)
        } else {
          setBusinessHours(initializeDefaultHours())
        }
      } catch (err) {
        console.error('API Error fetching business hours:', err)
        setError('Failed to load business hours')
        setBusinessHours(initializeDefaultHours())
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessHours()
  }, [vendorId, API_URL])

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/vendor/updatehours/${vendorId}`,
        { businessHours }
      )

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Business hours saved successfully!',
          severity: 'success'
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      console.error('Error saving business hours:', err)
      setSnackbar({
        open: true,
        message: 'Failed to save business hours',
        severity: 'error'
      })
    }
  }

  const handleModeChange = (index, mode) => {
    const updatedHours = [...businessHours]

    switch (mode) {
      case 'timeBased':
        updatedHours[index] = {
          ...updatedHours[index],
          isClosed: false,
          is24Hours: false
        }
        break
      case '24Hours':
        updatedHours[index] = {
          ...updatedHours[index],
          isClosed: false,
          is24Hours: true
        }
        break
      case 'closed':
        updatedHours[index] = {
          ...updatedHours[index],
          isClosed: true,
          is24Hours: false
        }
        break
    }

    setBusinessHours(updatedHours)
  }

  const handleTimeChange = (index, field, value) => {
    const updatedHours = [...businessHours]
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    }
    setBusinessHours(updatedHours)
  }

  const getCurrentMode = (dayData) => {
    if (dayData.isClosed) return 'closed'
    if (dayData.is24Hours) return '24Hours'
    return 'timeBased'
  }

  if (loading) {
    return (
      <Card sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ mt: 6 }}>
        <CardHeader title="Operational Timings"
          sx={{ bgcolor: 'error.main' }}
          titleTypographyProps={{ color: 'common.white' }}
        />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader
        title="Operational Timings"
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
      />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1} sx={{ fontWeight: 'bold', px: 1 }}>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Day</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Open at</Typography>
            </Grid>
            <Grid item xs={3} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2">Close at</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2">Mode</Typography>
            </Grid>
          </Grid>
        </Box>

        {businessHours.map((dayData, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 1,
              mb: 1,
              borderRadius: 2,
              ':hover': { boxShadow: 2 }
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={3}>
                <Typography fontWeight={500} variant="body2">
                  {dayData.day}
                </Typography>
              </Grid>

              <Grid item xs={3}>
                {dayData.isClosed ? (
                  <Box sx={{ bgcolor: 'error.light', borderRadius: 1, p: 0.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="common.white" fontWeight={600}>
                      Closed
                    </Typography>

                  </Box>
                ) : dayData.is24Hours ? (
                  <Box sx={{ bgcolor: 'success.light', borderRadius: 1, p: 0.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="common.white" fontWeight={600}>
                      24 Hours
                    </Typography>

                  </Box>
                ) : (
                  <FormControl size="small" fullWidth>
                    <Select
                      value={dayData.openTime}
                      onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                      sx={{
                        height: 32,
                        fontSize: { xs: '0.75rem', sm: '0.8rem' }
                      }}
                    >
                      {hours.map((time) => (
                        <MenuItem key={time} value={time} dense>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid item xs={3} sx={{ display: { xs: 'none', sm: 'block' } }}>
                {!dayData.isClosed && !dayData.is24Hours && (
                  <FormControl size="small" fullWidth>
                    <Select
                      value={dayData.closeTime}
                      onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                      sx={{
                        height: 32,
                        fontSize: { xs: '0.75rem', sm: '0.8rem' }
                      }}
                    >
                      {hours.map((time) => (
                        <MenuItem key={time} value={time} dense>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>

              <Grid item xs={6} sm={3}>
                <ToggleButtonGroup
                  value={getCurrentMode(dayData)}
                  exclusive
                  onChange={(event, newMode) => newMode && handleModeChange(index, newMode)}
                  size="small"
                  fullWidth
                  sx={{ height: 32 }}
                >
                  <ToggleButton value="timeBased">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="24Hours">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AvTimerIcon fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
                        24h
                      </Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="closed">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CloseIcon fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
                        Closed
                      </Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            fullWidth
            onClick={handleSave}
            sx={{
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Save Operational Timings
          </Button>
        </Box>
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

// Main Vendor Update Component
const VendorUpdate = ({ vendorId }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // States for form data
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [vendorName, setVendorName] = useState('')
  const [contacts, setContacts] = useState([{ id: 1, name: '', mobile: '' }])
  const [address, setAddress] = useState('')
  const [landMark, setLandMark] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [parkingEntries, setParkingEntries] = useState([{ type: '', count: '' }])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [platformFee, setPlatformFee] = useState('')
  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching vendor data for ID: ${vendorId}`)
        const response = await fetch(`${API_URL}/vendor/fetch-vendor-data?id=${vendorId}`, {
          cache: 'no-store',
          headers: {
            'pragma': 'no-cache',
            'cache-control': 'no-cache'
          }
        })
        const result = await response.json()

        if (response.ok && result.data) {
          console.log('Received MySpace data:', result.data)
          const vendorData = result.data

          setVendorName(vendorData.vendorName || '')
          setAddress(vendorData.address || '')
          setLandMark(vendorData.landMark || '')
          setLatitude(vendorData.latitude || '')
          setLongitude(vendorData.longitude || '')
          setPlatformFee(vendorData.platformfee || '')

          if (Array.isArray(vendorData.contacts) && vendorData.contacts.length > 0) {
            setContacts(
              vendorData.contacts.map((contact, index) => ({
                id: contact._id || (index + 1),
                name: contact.name || '',
                mobile: contact.mobile || '',
              }))
            )
          } else {
            setContacts([{ id: 1, name: '', mobile: '' }])
          }

          if (vendorData.parkingEntries?.length > 0) {
            setParkingEntries(vendorData.parkingEntries.map(entry => ({
              type: entry.type || '',
              count: entry.count || ''
            })))
          } else {
            setParkingEntries([{ type: '', count: '' }])
          }

          if (vendorData.image) {
            setImagePreview(vendorData.image)
          }
        }
      } catch (error) {
        console.error('Error fetching MySpace data:', error)
        setSnackbar({
          open: true,
          message: 'Failed to load MySpace data',
          severity: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    if (vendorId) {
      fetchVendorData()
    }
  }, [vendorId, refreshTrigger, API_URL])

  // Handlers for form inputs
  const handleAddContact = () => setContacts([...contacts, { id: Date.now(), name: '', mobile: '' }])
  const handleRemoveContact = id => setContacts(contacts.filter(contact => contact.id !== id))
  const handleAddParkingEntry = () => setParkingEntries([...parkingEntries, { type: '', count: '' }])
  const handleRemoveParkingEntry = index => setParkingEntries(parkingEntries.filter((_, i) => i !== index))

  // Submit handler
  const handleSubmit = async () => {
    if (!vendorId) {
      setSnackbar({
        open: true,
        message: 'Vendor ID not found',
        severity: 'error'
      })
      return
    }

    if (!vendorName || !address) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      })
      return
    }

    const formData = new FormData()
    formData.append('vendorName', vendorName)
    formData.append('address', address)
    formData.append('landmark', landMark)
    formData.append('latitude', latitude)
    formData.append('longitude', longitude)
    formData.append('platformfee', platformFee)

    const formattedContacts = contacts.map(contact => ({
      name: contact.name,
      mobile: contact.mobile
    }))
    formData.append('contacts', JSON.stringify(formattedContacts))

    const formattedParkingEntries = parkingEntries
      .filter(entry => entry.type && entry.count)
      .map(entry => ({
        type: entry.type,
        count: entry.count
      }))
    formData.append('parkingEntries', JSON.stringify(formattedParkingEntries))

    if (image) {
      formData.append('image', image)
    }

    try {
      setLoading(true)
      console.log('Submitting form data:', formData)

      const response = await fetch(`${API_URL}/admin/updatevendors/${vendorId}`, {
        method: 'PUT',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'MySpace details updated successfully!',
          severity: 'success'
        })

        // Refresh data after update
        setRefreshTrigger(prev => prev + 1)

        if (image) {
          setImage(null)
        }
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update vendor',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Error updating vendor:', error)
      setSnackbar({
        open: true,
        message: 'Something went wrong with the update!',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h4' sx={{ mb: 4 }} align='center'>
          Update MySpace Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='MySpace Name'
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              required
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {contacts.map((contact, index) => (
            <Grid item xs={12} key={contact.id || index}>
              <Grid container spacing={3} alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={`Contact Name ${index + 1}`}
                    value={contact.name}
                    onChange={e => {
                      const updatedContacts = [...contacts]
                      updatedContacts[index].name = e.target.value
                      setContacts(updatedContacts)
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TextField
                      fullWidth
                      label={`Contact Number ${index + 1}`}
                      value={contact.mobile}
                      onChange={e => {
                        const updatedContacts = [...contacts]
                        updatedContacts[index].mobile = e.target.value
                        setContacts(updatedContacts)
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>
                      }}
                    />
                    {contacts.length > 1 && (
                      <IconButton onClick={() => handleRemoveContact(contact.id)} color='error'>
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant='contained' onClick={handleAddContact} startIcon={<AddIcon />}>
              Add Another Contact
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Address'
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder='Enter complete address'
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Latitude'
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              placeholder='Enter latitude (e.g., 28.6139)'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Longitude'
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              placeholder='Enter longitude (e.g., 77.209)'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Landmark'
              value={landMark}
              onChange={e => setLandMark(e.target.value)}
              placeholder='Enter a nearby landmark'
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="MySpace Image"
                style={{ width: 100, height: 100, borderRadius: '50%' }}
              />
            )}
          </Grid>

          <Grid item xs={12} sx={{ mb: 3 }}>
            <ProductImage
              onChange={(file) => {
                setImage(file)
                if (file) {
                  const previewUrl = URL.createObjectURL(file)
                  setImagePreview(previewUrl)
                }
              }}
              existingImage={imagePreview}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Parking Entries</Typography>
            <Grid container spacing={2}>
              {parkingEntries.map((entry, index) => (
                <Grid key={index} item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Parking Type</InputLabel>
                        <Select
                          value={entry.type}
                          onChange={(e) => {
                            const updatedEntries = [...parkingEntries]
                            updatedEntries[index].type = e.target.value
                            setParkingEntries(updatedEntries)
                          }}
                          label="Parking Type"
                        >
                          <MenuItem value="Cars">Cars</MenuItem>
                          <MenuItem value="Bikes">Bikes</MenuItem>
                          <MenuItem value="Others">Others</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TextField
                          label="Count"
                          value={entry.count}
                          onChange={(e) => {
                            const updatedEntries = [...parkingEntries]
                            updatedEntries[index].count = e.target.value
                            setParkingEntries(updatedEntries)
                          }}
                          fullWidth
                        />
                        {parkingEntries.length > 1 && (
                          <CustomIconButton onClick={() => handleRemoveParkingEntry(index)} color='error'>
                            <RemoveIcon />
                          </CustomIconButton>
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, mb: 4 }}>
              <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<AddIcon />}>
                Add Another Option
              </Button>
            </Box>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Platform Fee (%)"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                placeholder="Enter platform fee percentage"
              />
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ px: 4, py: 1 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

// Main Page Component
const VendorSettingsPage = () => {
  const params = useParams()
  const vendorId = params.id // Get vendorId from URL params

  return (
    <div maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        MySpace Update
      </Typography>
      <VendorUpdate vendorId={vendorId} />
      <BusinessHoursUpdate vendorId={vendorId} />
      <VendorAmenitiesServices vendorId={vendorId} />
      <VendorSupportChat vendorId={vendorId} />
      <VendorBankDetails vendorId={vendorId} />
      <ParkingCharges vendorId={vendorId} />
      <BookingEdit vendorId={vendorId} />
    </div>
  )
}

export default VendorSettingsPage
