// 'use client'
// import { useRef, useEffect, useState } from 'react'

// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'
// import TextField from '@mui/material/TextField'
// import Typography from '@mui/material/Typography'
// import InputAdornment from '@mui/material/InputAdornment'
// import IconButton from '@mui/material/IconButton'
// import AddIcon from '@mui/icons-material/Add'
// import RemoveIcon from '@mui/icons-material/Remove'

// import DirectionalIcon from '@components/DirectionalIcon'

// const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// const StepPersonalInfo = ({ handleNext, contacts, setContacts, address, setAddress, adminName, setadminName }) => {
//   const [showMap, setShowMap] = useState(false)
//   const mapRef = useRef(null)
//   const markerRef = useRef(null)
//   const autocompleteRef = useRef(null)

//   useEffect(() => {
//     if (showMap && !window.google) {
//       const script = document.createElement('script')

//       script.src = `https://maps.gomaps.pro/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
//       script.async = true
//       script.onload = initMap
//       document.body.appendChild(script)
//     } else if (showMap) {
//       initMap()
//     }
//   }, [showMap])

//   const initMap = () => {
//     const map = new window.google.maps.Map(mapRef.current, { center: { lat: 28.6139, lng: 77.209 }, zoom: 15 })

//     markerRef.current = new window.google.maps.Marker({ position: map.getCenter(), map, draggable: true })
//     const input = document.getElementById('autocomplete')

//     autocompleteRef.current = new window.google.maps.places.Autocomplete(input)
//     autocompleteRef.current.bindTo('bounds', map)
//     autocompleteRef.current.addListener('place_changed', () => {
//       const place = autocompleteRef.current.getPlace()

//       if (!place.geometry) return
//       map.setCenter(place.geometry.location)
//       markerRef.current.setPosition(place.geometry.location)
//       setAddress(place.formatted_address)
//     })
//     markerRef.current.addListener('dragend', () => {
//       const geocoder = new window.google.maps.Geocoder()

//       geocoder.geocode({ location: markerRef.current.getPosition() }, (results, status) => {
//         if (status === 'OK' && results[0]) {
//           setAddress(results[0].formatted_address)
//         }
//       })
//     })
//   }

//   const handleAddContact = () => {
//     setContacts([...contacts, { id: contacts.length + 1, name: '', number: '' }])
//   }

//   const handleContactChange = (id, field, value) => {
//     setContacts(contacts.map(contact => (contact.id === id ? { ...contact, [field]: value } : contact)))
//   }

//   const handleRemoveContact = id => {
//     setContacts(contacts.filter(contact => contact.id !== id))
//   }

  
// return (
//     <>
//       <Typography variant='h4' className='mbe-1'>
//         Personal Information
//       </Typography>
//       <Typography>Enter Admin Personal Information</Typography>
//       <br />
//       {/* Vendor Name Field */}
//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label='Admin Name'
//             placeholder='John'
//             value={adminName}
//             onChange={e => setadminName(e.target.value)}
//           />
//         </Grid>
//       </Grid>
//       {/* Contact Repeater Block */}
//       <Grid container spacing={3} style={{ marginTop: '10px' }}>
//         {contacts.map((contact, index) => (
//           <Grid item xs={12} key={contact.id} className='repeater-item'>
//             <Grid container spacing={3} alignItems='center'>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label={`Contact Name ${index + 1}`}
//                   placeholder='Doe'
//                   value={contact.name}
//                   onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <TextField
//                     fullWidth

//                     // type='number'
//                     label={`Contact Number ${index + 1}`}
//                     placeholder='123-456-7890'
//                     value={contact.mobile}
//                     onChange={e => handleContactChange(contact.id, 'mobile', e.target.value)}
//                     InputProps={{
//                       startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>
//                     }}
//                   />
//                   {index > 0 && (
//                     <IconButton onClick={() => handleRemoveContact(contact.id)} color='error'>
//                       <RemoveIcon />
//                     </IconButton>
//                   )}
//                 </div>
//               </Grid>
//             </Grid>
//           </Grid>
//         ))}
//         {/* Add Contact Button */}
//         <Grid item xs={12}>
//           <Button variant='contained' onClick={handleAddContact} startIcon={<AddIcon />}>
//             Add Another Contact
//           </Button>
//         </Grid>
//       </Grid>
//       {/* Address Field */}
//       <Grid container spacing={3} style={{ marginTop: '10px' }}>
//         <Grid item xs={12}>
//           <TextField
//             id='autocomplete'
//             fullWidth
//             label='Address'
//             placeholder='Click to select address'
//             value={address}
//             onChange={e => setAddress(e.target.value)}
//             onFocus={() => setShowMap(true)}
//           />
//         </Grid>
//         {showMap && (
//           <Grid item xs={12}>
//             <div ref={mapRef} style={{ width: '100%', height: '300px', marginTop: '10px' }}></div>
//             <Button onClick={() => setShowMap(false)} variant='contained' style={{ marginTop: '10px' }}>
//               Confirm Address
//             </Button>
//           </Grid>
//         )}
//       </Grid>
//       {/* Navigation Buttons */}
//       <Grid container spacing={3} justifyContent='space-between' style={{ marginTop: '20px' }}>
//         <Grid item>
//           <Button
//             variant='contained'
//             onClick={handleNext}
//             endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' />}
//           >
//             Next
//           </Button>
//         </Grid>
//       </Grid>
//     </>
//   )
// }

// export default StepPersonalInfo




'use client'
import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import DirectionalIcon from '@components/DirectionalIcon'

const StepPersonalInfo = ({ 
  handleNext, 
  contacts, 
  setContacts, 
  address, 
  setAddress, 
  adminName, 
  setadminName, 
  latitude, 
  setLatitude, 
  longitude, 
  setLongitude, 
  landmark, 
  setLandmark 
}) => {
  // State to track if add button should be enabled
  const [addButtonEnabled, setAddButtonEnabled] = useState(false)

  // Check if the last contact has both name and mobile filled
  useEffect(() => {
    if (contacts.length > 0) {
      const lastContact = contacts[contacts.length - 1]
      setAddButtonEnabled(
        lastContact.name.trim() !== '' &&
        /^\d{10}$/.test(lastContact.mobile.trim())
      )
      
    } else {
      setAddButtonEnabled(false)
    }
  }, [contacts])

  const handleAddContact = () => {
    setContacts([...contacts, { id: contacts.length + 1, name: '', mobile: '' }])
    // Disable button after adding a new contact
    setAddButtonEnabled(false)
  }

  const handleContactChange = (id, field, value) => {
    if (field === 'mobile') {
      // Allow only digits and limit to 10 characters
      if (!/^\d*$/.test(value) || value.length > 10) return
    }
    setContacts(contacts.map(contact => {
      if (contact.id === id) {
        return { ...contact, [field]: value }
      }
      return contact
    }))
  }

  const handleRemoveContact = id => {
    setContacts(contacts.filter(contact => contact.id !== id))
  }

  return (
    <>
      <Typography variant='h4' className='mbe-1'>
        Personal Information
      </Typography>
      <Typography>Enter Admin Personal Information</Typography>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Admin Name'
            placeholder='Enter Your Admin Name'
            value={adminName}
            onChange={e => setadminName(e.target.value)}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginTop: '10px' }}>
        {contacts.map((contact, index) => (
          <Grid item xs={12} key={contact.id} className='repeater-item'>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Contact Person`}
                  placeholder='Contact Person'
                  value={contact.name}
                  onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TextField
                    fullWidth
                    label={`Contact Number`}
                    placeholder='Contact Number'
                    value={contact.mobile}
                    onChange={e => handleContactChange(contact.id, 'mobile', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>,
                      inputProps: { maxLength: 10 }
                    }}
                    required
                  />
                  {index > 0 && (
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
          <Button 
            variant='contained' 
            onClick={handleAddContact} 
            startIcon={<AddIcon />}
            disabled={!addButtonEnabled}
          >
            Add Another Contact
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginTop: '10px' }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Address'
            placeholder='Enter complete address'
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Latitude'
            placeholder='Enter latitude (e.g., 28.6139)'
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Longitude'
            placeholder='Enter longitude (e.g., 77.209)'
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Landmark'
            placeholder='Enter a nearby landmark'
            value={landmark}
            onChange={e => setLandmark(e.target.value)}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} justifyContent='space-between' style={{ marginTop: '20px' }}>
        <Grid item>
          <Button
            variant='contained'
            onClick={handleNext}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' />}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default StepPersonalInfo
