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
    organisationName: '',
    representative: '', 
    phoneNumbers: [''],
    addressDetails: {  
        street: '',     
        locality: '',    
        city: '',
        state: '',
        postalCode: '',   
        landmark: '',
        latitude: '',
        longitude: ''
    },
    totalParkingSlots: '',  
    parkingDetails: [{ category: '', capacity: '' }] 
});

const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleAddressChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    addressDetails: { ...prev.addressDetails, [name]: value }
  }));
};

const handlePhoneChange = (index, value) => {
  const newPhones = [...formData.phoneNumbers];

  newPhones[index] = value;
  setFormData(prev => ({ ...prev, phoneNumbers: newPhones }));
};

const addPhoneField = () => {
  setFormData(prev => ({ ...prev, phoneNumbers: [...prev.phoneNumbers, ''] }));
};

const removePhoneField = (index) => {
  const newPhones = formData.phoneNumbers.filter((_, i) => i !== index);

  setFormData(prev => ({ ...prev, phoneNumbers: newPhones.length ? newPhones : [''] }));
};

const handleParkingChange = (index, field, value) => {
  const newParkingDetails = [...formData.parkingDetails];

  newParkingDetails[index][field] = value;
  setFormData(prev => ({ ...prev, parkingDetails: newParkingDetails }));
};

const addParkingField = () => {
  setFormData(prev => ({ ...prev, parkingDetails: [...prev.parkingDetails, { category: 'Car', capacity: '' }] }));
};

const removeParkingField = (index) => {
  const newParkingDetails = formData.parkingDetails.filter((_, i) => i !== index);

  setFormData(prev => ({ ...prev, parkingDetails: newParkingDetails.length ? newParkingDetails : [{ category: 'Car', capacity: '' }] }));
};


  const handleSubmit = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/createcorporate`, formData)
      setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Error submitting form', severity: 'error' })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
    <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>Corporate Solution Form</Typography>
        
        <TextField fullWidth label="Organisation Name" name="organisationName" value={formData.organisationName} onChange={handleInputChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Representative" name="representative" value={formData.representative} onChange={handleInputChange} sx={{ mb: 2 }} />
        
        <Typography variant="subtitle1">Phone Numbers</Typography>
        {formData.phoneNumbers.map((phone, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => handlePhoneChange(index, e.target.value)} sx={{ mr: 1 }} />
            <IconButton onClick={addPhoneField} color="primary"><AddCircleOutlineIcon /></IconButton>
            {formData.phoneNumbers.length > 1 && <IconButton onClick={() => removePhoneField(index)} color="error"><DeleteOutlineIcon /></IconButton>}
          </Box>
        ))}
  
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Address Details</Typography>
        {Object.keys(formData.addressDetails).map((key) => (
          <TextField key={key} fullWidth label={key.charAt(0).toUpperCase() + key.slice(1)} name={key} value={formData.addressDetails[key]} onChange={handleAddressChange} sx={{ mb: 2 }} />
        ))}
  
        <TextField fullWidth label="Total Parking Slots" name="totalParkingSlots" value={formData.totalParkingSlots} onChange={handleInputChange} sx={{ mb: 2 }} />
  
        <Typography variant="subtitle1">Parking Details</Typography>
        {formData.parkingDetails.map((parking, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Select value={parking.category} onChange={(e) => handleParkingChange(index, 'category', e.target.value)} sx={{ mr: 1, width: 120 }}>
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Bike">Bike</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>
            <TextField label="Capacity" value={parking.capacity} onChange={(e) => handleParkingChange(index, 'capacity', e.target.value)} sx={{ mr: 1 }} />
            <IconButton onClick={addParkingField} color="primary"><AddCircleOutlineIcon /></IconButton>
            {formData.parkingDetails.length > 1 && <IconButton onClick={() => removeParkingField(index)} color="error"><DeleteOutlineIcon /></IconButton>}
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


// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import axios from 'axios'
// import { 
//   Box, 
//   Button, 
//   Card, 
//   CardContent, 
//   TextField, 
//   Typography, 
//   IconButton,
//   Snackbar,
//   Alert,
//   MenuItem,
//   Select,
//   CircularProgress
// } from '@mui/material'
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
// import LocationOnIcon from '@mui/icons-material/LocationOn'

// const CommercialServicesForm = () => {
//   const router = useRouter()
//   const [formData, setFormData] = useState({
//     organisationName: '',
//     representative: '', 
//     phoneNumbers: [''],
//     addressDetails: {  
//         street: '',     
//         locality: '',    
//         city: '',
//         state: '',
//         postalCode: '',   
//         landmark: '',
//         latitude: '',
//         longitude: ''
//     },
//     totalParkingSlots: '',  
//     parkingDetails: [{ category: '', capacity: '' }] 
//   });

//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
//   const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

//   // Load Google Maps API
//   useEffect(() => {
//     if (!window.google && !document.getElementById('google-maps-script')) {
//       const script = document.createElement('script');
//       script.id = 'google-maps-script';
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
//       script.async = true;
//       script.defer = true;
//       script.onload = () => setGoogleMapsLoaded(true);
//       document.head.appendChild(script);
//     } else if (window.google) {
//       setGoogleMapsLoaded(true);
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       addressDetails: { ...prev.addressDetails, [name]: value }
//     }));
//   };

//   // Function to fetch coordinates from address
//   const fetchCoordinates = async () => {
//     if (!window.google || !window.google.maps) {  // Ensure Google Maps API is loaded
//       setSnackbar({ 
//         open: true, 
//         message: 'Google Maps is still loading. Please try again in a moment.', 
//         severity: 'warning' 
//       });
//       return;
//     }
  
//     const { street, locality, city, state, postalCode } = formData.addressDetails;
//     const addressString = `${street}, ${locality}, ${city}, ${state}, ${postalCode}`.trim();
  
//     if (!addressString || addressString.split(',').filter(part => part.trim()).length < 2) {
//       setSnackbar({ 
//         open: true, 
//         message: 'Please enter more address details to get coordinates', 
//         severity: 'warning' 
//       });
//       return;
//     }
  
//     setIsLoadingCoordinates(true);
    
//     try {
//       const geocoder = new window.google.maps.Geocoder();
      
//       geocoder.geocode({ address: addressString }, (results, status) => {
//         if (status === 'OK' && results[0]) {
//           const { lat, lng } = results[0].geometry.location;
//           setFormData(prev => ({
//             ...prev,
//             addressDetails: {
//               ...prev.addressDetails,
//               latitude: lat().toString(),
//               longitude: lng().toString()
//             }
//           }));
//           setSnackbar({ 
//             open: true, 
//             message: 'Coordinates fetched successfully!', 
//             severity: 'success' 
//           });
//         } else {
//           setSnackbar({ 
//             open: true, 
//             message: 'Could not find coordinates for this address', 
//             severity: 'error' 
//           });
//         }
//         setIsLoadingCoordinates(false);
//       });
//     } catch (error) {
//       console.error('Error fetching coordinates:', error);
//       setSnackbar({ 
//         open: true, 
//         message: 'Error fetching coordinates', 
//         severity: 'error' 
//       });
//       setIsLoadingCoordinates(false);
//     }
//   };
  

//   const handlePhoneChange = (index, value) => {
//     const newPhones = [...formData.phoneNumbers];
//     newPhones[index] = value;
//     setFormData(prev => ({ ...prev, phoneNumbers: newPhones }));
//   };

//   const addPhoneField = () => {
//     setFormData(prev => ({ ...prev, phoneNumbers: [...prev.phoneNumbers, ''] }));
//   };

//   const removePhoneField = (index) => {
//     const newPhones = formData.phoneNumbers.filter((_, i) => i !== index);
//     setFormData(prev => ({ ...prev, phoneNumbers: newPhones.length ? newPhones : [''] }));
//   };

//   const handleParkingChange = (index, field, value) => {
//     const newParkingDetails = [...formData.parkingDetails];
//     newParkingDetails[index][field] = value;
//     setFormData(prev => ({ ...prev, parkingDetails: newParkingDetails }));
//   };

//   const addParkingField = () => {
//     setFormData(prev => ({ ...prev, parkingDetails: [...prev.parkingDetails, { category: 'Car', capacity: '' }] }));
//   };

//   const removeParkingField = (index) => {
//     const newParkingDetails = formData.parkingDetails.filter((_, i) => i !== index);
//     setFormData(prev => ({ ...prev, parkingDetails: newParkingDetails.length ? newParkingDetails : [{ category: 'Car', capacity: '' }] }));
//   };

//   const handleSubmit = async () => {
//     try {
//       await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/createcorporate`, formData)
//       setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' })
//     } catch (error) {
//       setSnackbar({ open: true, message: 'Error submitting form', severity: 'error' })
//     }
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
//       <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 3 }}>
//         <CardContent sx={{ p: 3 }}>
//           <Typography variant="h3" sx={{ mb: 3, textAlign: 'center' }}>Corporate Solutions Form</Typography>
          
//           <TextField fullWidth label="Organisation Name" name="organisationName" value={formData.organisationName} onChange={handleInputChange} sx={{ mb: 2 }} />
//           <TextField fullWidth label="Representative" name="representative" value={formData.representative} onChange={handleInputChange} sx={{ mb: 2 }} />
          
//           <Typography variant="subtitle1">Phone Numbers</Typography>
//           {formData.phoneNumbers.map((phone, index) => (
//             <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => handlePhoneChange(index, e.target.value)} sx={{ mr: 1 }} />
//               <IconButton onClick={addPhoneField} color="primary"><AddCircleOutlineIcon /></IconButton>
//               {formData.phoneNumbers.length > 1 && <IconButton onClick={() => removePhoneField(index)} color="error"><DeleteOutlineIcon /></IconButton>}
//             </Box>
//           ))}
    
//           <Typography variant="subtitle1" sx={{ mt: 2 }}>Address Details</Typography>
          
//           {/* Address fields that will be used to generate coordinates */}
//           <TextField fullWidth label="Street" name="street" value={formData.addressDetails.street} onChange={handleAddressChange} sx={{ mb: 2 }} />
//           <TextField fullWidth label="Locality" name="locality" value={formData.addressDetails.locality} onChange={handleAddressChange} sx={{ mb: 2 }} />
//           <TextField fullWidth label="City" name="city" value={formData.addressDetails.city} onChange={handleAddressChange} sx={{ mb: 2 }} />
//           <TextField fullWidth label="State" name="state" value={formData.addressDetails.state} onChange={handleAddressChange} sx={{ mb: 2 }} />
//           <TextField fullWidth label="Postal Code" name="postalCode" value={formData.addressDetails.postalCode} onChange={handleAddressChange} sx={{ mb: 2 }} />
//           <TextField fullWidth label="Landmark" name="landmark" value={formData.addressDetails.landmark} onChange={handleAddressChange} sx={{ mb: 2 }} />
          
//           {/* Coordinates fields with fetch button */}
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//             <TextField 
//               label="Latitude" 
//               name="latitude" 
//               value={formData.addressDetails.latitude} 
//               onChange={handleAddressChange} 
//               sx={{ mr: 1 }}
//               InputProps={{
//                 readOnly: true,
//               }}
//             />
//             <TextField 
//               label="Longitude" 
//               name="longitude" 
//               value={formData.addressDetails.longitude} 
//               onChange={handleAddressChange}
//               InputProps={{
//                 readOnly: true,
//               }}
//             />
//             <IconButton 
//               onClick={fetchCoordinates} 
//               color="primary" 
//               disabled={isLoadingCoordinates}
//               sx={{ ml: 1 }}
//             >
//               {isLoadingCoordinates ? <CircularProgress size={24} /> : <LocationOnIcon />}
//             </IconButton>
//           </Box>
    
//           <TextField fullWidth label="Total Parking Slots" name="totalParkingSlots" value={formData.totalParkingSlots} onChange={handleInputChange} sx={{ mb: 2 }} />
    
//           <Typography variant="subtitle1">Parking Details</Typography>
//           {formData.parkingDetails.map((parking, index) => (
//             <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <Select value={parking.category} onChange={(e) => handleParkingChange(index, 'category', e.target.value)} sx={{ mr: 1, width: 120 }}>
//                 <MenuItem value="Car">Car</MenuItem>
//                 <MenuItem value="Bike">Bike</MenuItem>
//                 <MenuItem value="Others">Others</MenuItem>
//               </Select>
//               <TextField label="Capacity" value={parking.capacity} onChange={(e) => handleParkingChange(index, 'capacity', e.target.value)} sx={{ mr: 1 }} />
//               <IconButton onClick={addParkingField} color="primary"><AddCircleOutlineIcon /></IconButton>
//               {formData.parkingDetails.length > 1 && <IconButton onClick={() => removeParkingField(index)} color="error"><DeleteOutlineIcon /></IconButton>}
//             </Box>
//           ))}
    
//           <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Submit</Button>
//           <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
//             <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
//           </Snackbar>
//         </CardContent>
//       </Card>
//     </Box>
//   )
// }

// export default CommercialServicesForm
