// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { 
//   Button, 
//   DialogTitle, 
//   DialogContent, 
//   DialogActions, 
//   TextField,
//   Alert,
//   CircularProgress,
//   Typography,
//   Box,
//   Divider,
//   Card,
//   CardContent,
//   Stack,
//   Grid
// } from '@mui/material'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// const ParkedTimer = ({ parkedDate, parkedTime }) => {
//   const [elapsedTime, setElapsedTime] = useState('00:00:00')
  
//   useEffect(() => {
//     if (!parkedDate || !parkedTime) {
//       setElapsedTime('00:00:00')
//       return
//     }
    
//     try {
//       const [day, month, year] = parkedDate.split('-')
//       const [timePart, ampm] = parkedTime.split(' ')
//       let [hours, minutes] = timePart.split(':').map(Number)
//       if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
//         hours += 12
//       } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
//         hours = 0
//       }
      
//       const parkingStartTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)
      
//       const timer = setInterval(() => {
//         const now = new Date()
//         const diffMs = now - parkingStartTime
//         const diffSecs = Math.floor(diffMs / 1000)
//         const hours = Math.floor(diffSecs / 3600)
//         const minutes = Math.floor((diffSecs % 3600) / 60)
//         const seconds = diffSecs % 60
        
//         setElapsedTime(
//           `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
//         )
//       }, 1000)
      
//       return () => clearInterval(timer)
//     } catch (error) {
//       console.error("Error setting up timer:", error)
//       setElapsedTime('00:00:00')
//     }
//   }, [parkedDate, parkedTime])
  
//   return (
//     <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>
//       ({elapsedTime})
//     </Typography>
//   )
// }

// const ExitVehicleCalculator = ({ 
//   bookingId, 
//   vehicleType = 'Car', 
//   bookType = 'Hourly',
//   bookingDetails = null,
//   vendorId = null, // Added vendorId prop
//   onClose, 
//   onSuccess 
// }) => {
//   const { data: session } = useSession();
//   // Use the provided vendorId or fall back to session user id
//   const effectiveVendorId = vendorId || session?.user?.id;
  
//   const [loading, setLoading] = useState(false)
//   const [fetchingCharges, setFetchingCharges] = useState(true)
//   const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false)
//   const [hours, setHours] = useState(0)
//   const [amount, setAmount] = useState(0)
//   const [chargesData, setChargesData] = useState(null)
//   const [error, setError] = useState('')
//   const [calculationDetails, setCalculationDetails] = useState(null)
//   const [bookingData, setBookingData] = useState(bookingDetails || null)
//   const [otp, setOtp] = useState('')
//   const [backendOtp, setBackendOtp] = useState('')
//   const [fullDayModes, setFullDayModes] = useState({
//     car: 'Full Day',
//     bike: 'Full Day',
//     others: 'Full Day'
//   })
//   const is24Hours = bookingData?.bookType === '24 Hours' || bookType === '24 Hours'

//   const fetchBookingDirectly = async (id) => {
//     try {
//       setFetchingBookingDetails(true)
//       console.log(`Fetching booking details for ID: ${id} from direct API`)
      
//       const response = await fetch(`${API_URL}/vendor/getbooking/${id}`)
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch booking details')
//       }
      
//       const data = await response.json()
      
//       if (!data || !data.booking) {
//         throw new Error('Invalid booking data received')
//       }
      
//       console.log('Received booking details from direct API:', data.booking)
      
//       setBookingData(data.booking)
//       if (data.booking.otp) {
//         console.log('Received OTP from API:', data.booking.otp)
//         setBackendOtp(data.booking.otp)
//       }
      
//       return data.booking
//     } catch (err) {
//       console.error('Error fetching booking details from direct API:', err)
//       setError('Failed to fetch booking details: ' + (err.message || ''))
//       return null
//     } finally {
//       setFetchingBookingDetails(false)
//     }
//   }

//   const fetchFullDayModes = async () => {
//     if (!effectiveVendorId) return;
    
//     try {
//       console.log(`Fetching full day modes for vendor: ${effectiveVendorId}`)
//       const response = await fetch(`${API_URL}/vendor/getfullday/${effectiveVendorId}`)
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch full day modes')
//       }
      
//       const data = await response.json()
//       console.log('Received full day modes:', data)
      
//       if (data && data.data) {
//         setFullDayModes({
//           car: data.data.fulldaycar || 'Full Day',
//           bike: data.data.fulldaybike || 'Full Day',
//           others: data.data.fulldayothers || 'Full Day'
//         })
//       }
//     } catch (err) {
//       console.error('Error fetching full day modes:', err)
//     }
//   }

//   useEffect(() => {
//     const getBookingDetails = async () => {
//       if (bookingDetails) {
//         setBookingData(bookingDetails)
//         if (bookingDetails.otp) {
//           setBackendOtp(bookingDetails.otp)
//         } else {
//           await fetchBookingDirectly(bookingId)
//         }
//         return
//       }
      
//       if (!bookingId) return
      
//       try {
//         const directBooking = await fetchBookingDirectly(bookingId)
        
//         if (directBooking) {
//           return
//         }
        
//         setFetchingBookingDetails(true)
//         console.log(`Falling back to original API for ID: ${bookingId}`)
        
//         const response = await fetch(`${API_URL}/vendor/getbookingdetails/${bookingId}`)
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch booking details')
//         }
        
//         const data = await response.json()
        
//         if (!data || !data.booking) {
//           throw new Error('Invalid booking data received')
//         }
        
//         console.log('Received booking details from fallback:', data.booking)
//         setBookingData(data.booking)
        
//         if (!data.booking.otp) {
//           await fetchBookingDirectly(bookingId)
//         } else {
//           setBackendOtp(data.booking.otp)
//         }
//       } catch (err) {
//         console.error('Error fetching booking details:', err)
//         setError('Failed to fetch booking details: ' + (err.message || ''))
//       } finally {
//         setFetchingBookingDetails(false)
//       }
//     }
    
//     if (bookingId) {
//       getBookingDetails()
//     }
//   }, [bookingId, bookingDetails])

//   useEffect(() => {
//     if (effectiveVendorId) {
//       fetchFullDayModes()
//     }
//   }, [effectiveVendorId])

//   useEffect(() => {
//     const fetchCharges = async () => {
//       try {
//         if (!effectiveVendorId) {
//           console.log('Waiting for vendorId...');
//           return;
//         }

//         setFetchingCharges(true)
//         setError('')

//         console.log(`Fetching charges for vendor: ${effectiveVendorId}`);
//         const response = await fetch(`${API_URL}/vendor/getchargesdata/${effectiveVendorId}`)
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch charges data')
//         }

//         const data = await response.json()
//         console.log('Received charges data:', data);
        
//         if (!data?.vendor?.charges) {
//           throw new Error('Invalid charges data format')
//         }

//         setChargesData(data.vendor)
//       } catch (err) {
//         console.error('Error fetching charges:', err)
//         setError(err.message || 'Failed to fetch parking charges data')
//       } finally {
//         setFetchingCharges(false)
//       }
//     }

//     fetchCharges()
//   }, [effectiveVendorId])

//   const calculateDuration = () => {
//     try {
//       const parkingDate = bookingData?.parkedDate
//       const parkingTime = bookingData?.parkedTime
      
//       console.log('Calculating duration with:', { parkingDate, parkingTime });
//       if (!parkingDate || !parkingTime) {
//         console.error('Missing parking data:', { parkingDate, parkingTime });
//         throw new Error('Parking date or time not available')
//       }
      
//       const [day, month, year] = parkingDate.split('-').map(Number)
  
//       let [time, period] = parkingTime.split(' ')
//       let [hours, minutes] = time.split(':').map(Number)
  
//       if (period === 'PM' && hours < 12) {
//         hours += 12
//       } else if (period === 'AM' && hours === 12) {
//         hours = 0
//       }
      
//       const parkingDateTime = new Date(year, month - 1, day, hours, minutes)
//       const currentDateTime = new Date()
      
//       console.log('Parking date time:', parkingDateTime);
//       console.log('Current date time:', currentDateTime);
      
//       const diffMs = currentDateTime - parkingDateTime
  
//       if (is24Hours) {
//         const effectiveVehicleType = bookingData?.vehicleType?.toLowerCase() || vehicleType.toLowerCase()
//         const fullDayMode = fullDayModes[effectiveVehicleType] || 'Full Day'
        
//         console.log(`Using full day mode "${fullDayMode}" for ${effectiveVehicleType}`)
        
//         if (fullDayMode === '24 Hours') {
//           // 24 Hours mode: Calculate complete 24-hour periods from parking time
//           const diffHours = diffMs / (1000 * 60 * 60)
//           const days = Math.ceil(diffHours / 24)
//           const calculatedDays = Math.max(1, days)
//           console.log('Calculated days (24 Hours mode):', calculatedDays);
          
//           // Store calculation method for later display
//           const calculationMethod = {
//             methodName: '24 Hours',
//             description: 'Complete 24-hour periods from parking time',
//             parkingDateTime: parkingDateTime,
//             currentDateTime: currentDateTime,
//             diffHours: diffHours,
//             days: calculatedDays
//           }
          
//           setHours(calculatedDays)
//           return { duration: calculatedDays, method: calculationMethod }
//         } else {
//           // Modified Full Day mode: Calculate calendar days but don't include current day unless complete
//           const parkingDay = new Date(year, month - 1, day)
//           const currentDay = new Date(
//             currentDateTime.getFullYear(), 
//             currentDateTime.getMonth(), 
//             currentDateTime.getDate()
//           )
          
//           // Calculate the difference in days (not inclusive of the current day)
//           const timeDiff = currentDay.getTime() - parkingDay.getTime();
//           const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
//           // Only add the current day if it's complete (already passed midnight)
//           // Always charge minimum 1 day
//           const calculatedDays = Math.max(1, diffDays);
          
//           console.log('Calculated calendar days (Full Day mode):', calculatedDays);
          
//           // Store calculation method for later display
//           const calculationMethod = {
//             methodName: 'Full Day', 
//             description: 'Calendar days (excluding current day unless complete)',
//             parkingDay: parkingDay,
//             currentDay: currentDay,
//             diffDays: calculatedDays,
//             explanation: 'Charges apply for each complete calendar day, excluding the current day if not yet complete'
//           }
          
//           setHours(calculatedDays)
//           return { duration: calculatedDays, method: calculationMethod }
//         }
//       } else {
//         // Hourly booking - unchanged
//         const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
//         const calculatedHours = Math.max(1, diffHours)
//         console.log('Calculated hours (Hourly booking):', calculatedHours);
        
//         // Store calculation method for later display
//         const calculationMethod = {
//           methodName: 'Hourly',
//           description: 'Hours since parking time',
//           parkingDateTime: parkingDateTime,
//           currentDateTime: currentDateTime,
//           diffHours: calculatedHours
//         }
        
//         setHours(calculatedHours)
//         return { duration: calculatedHours, method: calculationMethod }
//       }
//     } catch (err) {
//       console.error('Error calculating duration:', err)
//       setError('Failed to calculate parking duration. Using default value.')
//       setHours(1)
//       return { duration: 1, method: null }
//     }
//   }

//   useEffect(() => {
//     if (bookingData?.parkedDate && bookingData?.parkedTime && fullDayModes) {
//       const result = calculateDuration()
      
//       if (chargesData) {
//         calculateAmount(result.duration, chargesData, result.method)
//       }
//     }
//   }, [bookingData, chargesData, is24Hours, fullDayModes, vehicleType])

//   const calculateAmount = (hoursValue, charges = chargesData, calculationMethod = null) => {
//     if (!charges || !charges.charges || !charges.charges.length) {
//       console.warn('No charges data available');
//       return;
//     }

//     try {
//       const effectiveVehicleType = bookingData?.vehicleType || vehicleType
      
//       console.log('Calculating amount for:', { 
//         hoursValue, 
//         vehicleType: effectiveVehicleType, 
//         is24Hours,
//         calculationMethod
//       });
      
//       const relevantCharges = charges.charges.filter(charge => 
//         charge.category.toLowerCase() === effectiveVehicleType.toLowerCase()
//       )

//       if (relevantCharges.length === 0) {
//         throw new Error(`No charges found for ${effectiveVehicleType}`)
//       }

//       console.log('Relevant charges:', relevantCharges);

//       let calculatedAmount = 0
//       let details = {}

//       if (is24Hours) {
//         const fullDayCharge = relevantCharges.find(charge => 
//           charge.type.toLowerCase().includes('full day') || 
//           charge.type.toLowerCase().includes('24 hour')
//         )
        
//         if (!fullDayCharge) {
//           throw new Error(`Full day charge not found for ${effectiveVehicleType}`)
//         }
        
//         const days = hoursValue
//         calculatedAmount = Number(fullDayCharge.amount) * days
        
//         const vehicleTypeKey = effectiveVehicleType.toLowerCase()
//         const fullDayMode = fullDayModes[vehicleTypeKey] || 'Full Day'
        
//         details = {
//           rateType: "Full day",
//           baseRate: Number(fullDayCharge.amount),
//           days: days,
//           fullDayMode: fullDayMode,
//           calculation: `${fullDayCharge.amount} × ${days} day(s) = ${calculatedAmount}`,
//           calculationMethod: calculationMethod
//         }
        
//         console.log('Full day calculation details:', details);
//       } else {
//         const baseCharge = relevantCharges.find(charge => 
//           charge.type.toLowerCase().includes('0 to 1') || 
//           charge.type.toLowerCase().includes('first hour') ||
//           charge.type.toLowerCase().includes('minimum')
//         )
        
//         const additionalCharge = relevantCharges.find(charge => 
//           charge.type.toLowerCase().includes('additional') || 
//           charge.type.toLowerCase().includes('extra hour')
//         )
        
//         if (!baseCharge) {
//           throw new Error(`Base charge not found for ${effectiveVehicleType}`)
//         }
        
//         calculatedAmount = Number(baseCharge.amount)
        
//         const additionalRate = additionalCharge ? Number(additionalCharge.amount) : Number(baseCharge.amount)
        
//         if (hoursValue > 1) {
//           calculatedAmount += additionalRate * (hoursValue - 1)
//         }
        
//         details = {
//           rateType: "Hourly",
//           baseRate: Number(baseCharge.amount),
//           additionalRate: additionalRate,
//           totalHours: hoursValue,
//           calculation: hoursValue > 1 ? 
//             `${baseCharge.amount} (first hour) + ${additionalRate} × ${hoursValue - 1} (additional hours) = ${calculatedAmount}` :
//             `${baseCharge.amount} (first hour) = ${calculatedAmount}`,
//           calculationMethod: calculationMethod
//         }
        
//         console.log('Hourly calculation details:', details);
//       }

//       setAmount(calculatedAmount)
//       setCalculationDetails(details)
//       setError('')
//     } catch (err) {
//       console.error('Error calculating amount:', err)
//       setError(err.message || 'Failed to calculate amount')
//       setAmount(0)
//     }
//   }

//   const handleHoursChange = (e) => {
//     const value = Math.max(1, parseInt(e.target.value) || 1)
//     setHours(value)
//     if (chargesData) {
//       calculateAmount(value, chargesData)
//     }
//   }

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     return dateStr;
//   }

//   const formatTime = (timeStr) => {
//     if (!timeStr) return 'N/A';
    
//     let [time, period] = timeStr.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);
    
//     if (period === 'PM' && hours < 12) {
//       hours += 12;
//     } else if (period === 'AM' && hours === 12) {
//       hours = 0;
//     }
    
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//   }

//   const formatDateObject = (date) => {
//     if (!date) return 'N/A';
//     return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
//   }

//   const formatTimeObject = (date) => {
//     if (!date) return 'N/A';
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//   }

//   const handleSubmit = async () => {
//     if (!bookingId || !amount || !hours) {
//       setError('Booking ID, amount and hours are required')
//       return;
//     }

//     if (!otp) {
//       setError('Last 3 digits of OTP are required');
//       return;
//     }
    
//     // Check if entered OTP matches the last 3 digits of backend OTP
//     if (otp.length !== 3 || !backendOtp || !backendOtp.endsWith(otp)) {
//       setError('OTP does not match the last 3 digits of booking OTP');
//       return;
//     }
  
//     setLoading(true)
//     setError('')
    
//     try {
//       console.log('Submitting exit data:', {
//         bookingId,
//         amount,
//         hour: hours,
//         is24Hours,
//         vendorId: effectiveVendorId,
//         otp: backendOtp // Send full OTP to backend for validation
//       });
      
//       const response = await fetch(`${API_URL}/vendor/exitvehicle/${bookingId}`, {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session?.accessToken}`
//         },
//         body: JSON.stringify({
//           amount,
//           hour: hours,
//           is24Hours,
//           vendorId: effectiveVendorId,
//           otp: backendOtp // Send full OTP to backend
//         })
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || 'Failed to update booking status')
//       }

//       const data = await response.json()
//       onSuccess?.(data.message || 'Vehicle exit processed successfully')
//       onClose?.()
//     } catch (err) {
//       console.error('Error processing exit:', err)
//       setError(err.message || 'Failed to process vehicle exit')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const isLoading = fetchingCharges || fetchingBookingDetails || loading
//   const otpValidated = backendOtp && otp.length === 3 && backendOtp.endsWith(otp);

//   return (
//     <Box>
//       <DialogTitle>
//         Calculate Exit Charges
//         <Typography variant="subtitle2" color="text.secondary">
//           Booking ID: {bookingId}
//         </Typography>
//       </DialogTitle>
      
//       <DialogContent>
//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
//             {error}
//           </Alert>
//         )}
        
//         {isLoading && !error ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//             <CircularProgress />
//             <Typography variant="body2" sx={{ ml: 2 }}>
//               {fetchingBookingDetails ? 'Loading booking details and OTP...' : 
//                fetchingCharges ? 'Loading charges data...' : 'Processing...'}
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             <Card variant="outlined" sx={{ mb: 3 }}>
//               <CardContent>
//                 <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                   Vehicle Type: {bookingData?.vehicleType || vehicleType}
//                 </Typography>
//                 <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                   Booking Type: {bookingData?.bookType || bookType}
//                 </Typography>
//                 {is24Hours && (
//                   <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                     Full Day Mode: {fullDayModes[bookingData?.vehicleType?.toLowerCase() || vehicleType.toLowerCase()] || 'Full Day'}
//                   </Typography>
//                 )}
//                 <Divider sx={{ my: 1 }} />
//                 <Typography variant="subtitle1" color="text.secondary">
//                   Parked Since: {formatDate(bookingData?.parkedDate)} at {formatTime(bookingData?.parkedTime)}{' '}
//                   {bookingData?.parkedDate && bookingData?.parkedTime && (
//                     <ParkedTimer 
//                       parkedDate={bookingData.parkedDate} 
//                       parkedTime={bookingData.parkedTime} 
//                     />
//                   )}
//                 </Typography>
//               </CardContent>
//             </Card>
            
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label={is24Hours ? "Number of Days" : "Number of Hours"}
//                   type="number"
//                   value={hours}
//                   InputProps={{ 
//                     readOnly: true,
//                     inputProps: { min: 1 }
//                   }}
//                   disabled={isLoading}
//                   required
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Enter Last 3 Digits of OTP"
//                   type="text"
//                   value={otp}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '').slice(0, 3);
//                     setOtp(value);
//                   }}
//                   error={!otp || (otp && backendOtp && !backendOtp.endsWith(otp))}
//                   helperText={
//                     !otp ? "Last 3 digits of OTP are required" : 
//                     (otp && backendOtp && !backendOtp.endsWith(otp) ? "OTP does not match the last 3 digits" : "")
//                   }
//                   disabled={isLoading}
//                   required
//                   inputProps={{
//                     maxLength: 3,
//                     pattern: "\\d{3}"
//                   }}
//                 />
//               </Grid>
//             </Grid>
            
//             {calculationDetails && (
//               <Card sx={{ mt: 3, backgroundColor: '#f9f9f9' }}>
//                 <CardContent>
//                   <Typography variant="subtitle1" gutterBottom>
//                     Calculation Details
//                   </Typography>
//                   <Divider sx={{ mb: 2 }} />
//                   <Stack spacing={1}>
//                     <Typography variant="body2">
//                       <strong>Rate Type:</strong> {calculationDetails.rateType}
//                     </Typography>
//                     {is24Hours ? (
//                       <>
//                         <Typography variant="body2">
//                           <strong>Full Day Rate:</strong> ₹{calculationDetails.baseRate}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Number of Days:</strong> {calculationDetails.days}
//                         </Typography>
//                         {calculationDetails.fullDayMode && (
//                           <Typography variant="body2">
//                             <strong>Full Day Mode:</strong> {calculationDetails.fullDayMode}
//                           </Typography>
//                         )}
                        
//                         {calculationDetails.calculationMethod && (
//                           <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
//                             <Typography variant="body2" fontWeight="medium">
//                               Calculation Mode: {calculationDetails.calculationMethod.methodName}
//                             </Typography>
//                             <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 0.5 }}>
//                               {calculationDetails.calculationMethod.description}
//                             </Typography>
                            
//                             {calculationDetails.calculationMethod.methodName === 'Full Day' && (
//                               <>
//                                 <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
//                                   Parking day: {formatDateObject(calculationDetails.calculationMethod.parkingDay)}
//                                 </Typography>
//                                 <Typography variant="body2" fontSize="0.875rem">
//                                   Current day: {formatDateObject(calculationDetails.calculationMethod.currentDay)}
//                                 </Typography>
//                                 <Typography variant="body2" fontSize="0.875rem">
//                                   Calendar days (inclusive): {calculationDetails.calculationMethod.diffDays}
//                                 </Typography>
//                               </>
//                             )}
                            
//                             {calculationDetails.calculationMethod.methodName === '24 Hours' && (
//                               <>
//                                 <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
//                                   Parking time: {formatDateObject(calculationDetails.calculationMethod.parkingDateTime)} {formatTimeObject(calculationDetails.calculationMethod.parkingDateTime)}
//                                 </Typography>
//                                 <Typography variant="body2" fontSize="0.875rem">
//                                   Current time: {formatDateObject(calculationDetails.calculationMethod.currentDateTime)} {formatTimeObject(calculationDetails.calculationMethod.currentDateTime)}
//                                 </Typography>
//                                 <Typography variant="body2" fontSize="0.875rem">
//                                   Elapsed hours: {calculationDetails.calculationMethod.diffHours.toFixed(2)}
//                                 </Typography>
//                                 <Typography variant="body2" fontSize="0.875rem">
//                                   24-hour periods: {calculationDetails.calculationMethod.days}
//                                 </Typography>
//                               </>
//                             )}
//                           </Box>
//                         )}
//                       </>
//                     ) : (
//                       <>
//                         <Typography variant="body2">
//                           <strong>First Hour Rate:</strong> ₹{calculationDetails.baseRate}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Additional Hour Rate:</strong> ₹{calculationDetails.additionalRate}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Total Hours:</strong> {calculationDetails.totalHours}
//                         </Typography>
                        
//                         {calculationDetails.calculationMethod && (
//                           <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
//                             <Typography variant="body2" fontWeight="medium">
//                               Calculation Mode: {calculationDetails.calculationMethod.methodName}
//                             </Typography>
//                             <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 0.5 }}>
//                               {calculationDetails.calculationMethod.description}
//                             </Typography>
//                             <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
//                               Parking time: {formatDateObject(calculationDetails.calculationMethod.parkingDateTime)} {formatTimeObject(calculationDetails.calculationMethod.parkingDateTime)}
//                             </Typography>
//                             <Typography variant="body2" fontSize="0.875rem">
//                               Current time: {formatDateObject(calculationDetails.calculationMethod.currentDateTime)} {formatTimeObject(calculationDetails.calculationMethod.currentDateTime)}
//                             </Typography>
//                             <Typography variant="body2" fontSize="0.875rem">
//                               Elapsed hours: {calculationDetails.calculationMethod.diffHours}
//                             </Typography>
//                           </Box>
//                         )}
//                       </>
//                     )}
//                     <Divider sx={{ my: 1 }} />
//                     <Typography variant="body2">
//                       <strong>Calculation:</strong> {calculationDetails.calculation}
//                     </Typography>
//                   </Stack>
//                 </CardContent>
//               </Card>
//             )}
            
//             <Box sx={{ mt: 3, mb: 2 }}>
//               <Typography variant="h6" color="primary" gutterBottom>
//                 Final Amount
//               </Typography>
//               <Typography variant="h4" fontWeight="bold">
//                 ₹{amount.toFixed(2)}
//               </Typography>
//             </Box>
//           </>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button 
//           onClick={onClose} 
//           disabled={loading}
//           color="secondary"
//         >
//           Cancel
//         </Button>
//         <Button 
//           onClick={handleSubmit} 
//           variant="contained" 
//           color="primary"
//           disabled={isLoading || !effectiveVendorId || !otpValidated}
//           startIcon={loading ? <CircularProgress size={20} /> : null}
//         >
//           {loading ? 'Processing...' : 'Confirm Exit'}
//         </Button>
//       </DialogActions>
//     </Box>
//   )
// }

// export default ExitVehicleCalculator



'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Button, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  Stack,
  Grid
} from '@mui/material'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ParkedTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  
  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')
      return
    }
    
    try {
      const [day, month, year] = parkedDate.split('-')
      const [timePart, ampm] = parkedTime.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)
      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }
      
      const parkingStartTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)
      
      const timer = setInterval(() => {
        const now = new Date()
        const diffMs = now - parkingStartTime
        const diffSecs = Math.floor(diffMs / 1000)
        const hours = Math.floor(diffSecs / 3600)
        const minutes = Math.floor((diffSecs % 3600) / 60)
        const seconds = diffSecs % 60
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        )
      }, 1000)
      
      return () => clearInterval(timer)
    } catch (error) {
      console.error("Error setting up timer:", error)
      setElapsedTime('00:00:00')
    }
  }, [parkedDate, parkedTime])
  
  return (
    <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>
      ({elapsedTime})
    </Typography>
  )
}

const ExitVehicleCalculator = ({ 
  bookingId, 
  vehicleType = 'Car', 
  bookType = 'Hourly',
  bookingDetails = null,
  vendorId = null,
  onClose, 
  onSuccess 
}) => {
  const { data: session } = useSession();
  const effectiveVendorId = vendorId || session?.user?.id;
  
  const [loading, setLoading] = useState(false)
  const [fetchingCharges, setFetchingCharges] = useState(true)
  const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false)
  const [hours, setHours] = useState(0)
  const [amount, setAmount] = useState(0)
  const [chargesData, setChargesData] = useState(null)
  const [error, setError] = useState('')
  const [calculationDetails, setCalculationDetails] = useState(null)
  const [bookingData, setBookingData] = useState(bookingDetails || null)
  const [otp, setOtp] = useState('')
  const [backendOtp, setBackendOtp] = useState('')
  const [fullDayModes, setFullDayModes] = useState({
    car: 'Full Day',
    bike: 'FullDay',
    others: 'Full Day'
  })
  const [isVendorBooking, setIsVendorBooking] = useState(false)
  const is24Hours = bookingData?.bookType === '24 Hours' || bookType === '24 Hours'

  const fetchBookingDirectly = async (id) => {
    try {
      setFetchingBookingDetails(true)
      console.log(`Fetching booking details for ID: ${id} from direct API`)
      
      const response = await fetch(`${API_URL}/vendor/getbooking/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking details')
      }
      
      const data = await response.json()
      
      if (!data || !data.booking) {
        throw new Error('Invalid booking data received')
      }
      
      console.log('Received booking details from direct API:', data.booking)
      
      setBookingData(data.booking)
      // Check if this is a vendor booking (no userid present)
      setIsVendorBooking(!data.booking.userid)
      
      if (data.booking.otp && !isVendorBooking) {
        console.log('Received OTP from API:', data.booking.otp)
        setBackendOtp(data.booking.otp)
      }
      
      return data.booking
    } catch (err) {
      console.error('Error fetching booking details from direct API:', err)
      setError('Failed to fetch booking details: ' + (err.message || ''))
      return null
    } finally {
      setFetchingBookingDetails(false)
    }
  }

  const fetchFullDayModes = async () => {
    if (!effectiveVendorId) return;
    
    try {
      console.log(`Fetching full day modes for vendor: ${effectiveVendorId}`)
      const response = await fetch(`${API_URL}/vendor/getfullday/${effectiveVendorId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch full day modes')
      }
      
      const data = await response.json()
      console.log('Received full day modes:', data)
      
      if (data && data.data) {
        setFullDayModes({
          car: data.data.fulldaycar || 'Full Day',
          bike: data.data.fulldaybike || 'Full Day',
          others: data.data.fulldayothers || 'Full Day'
        })
      }
    } catch (err) {
      console.error('Error fetching full day modes:', err)
    }
  }

  useEffect(() => {
    const getBookingDetails = async () => {
      if (bookingDetails) {
        setBookingData(bookingDetails)
        setIsVendorBooking(!bookingDetails.userid)
        if (bookingDetails.otp && bookingDetails.userid) {
          setBackendOtp(bookingDetails.otp)
        } else {
          await fetchBookingDirectly(bookingId)
        }
        return
      }
      
      if (!bookingId) return
      
      try {
        const directBooking = await fetchBookingDirectly(bookingId)
        
        if (directBooking) {
          return
        }
        
        setFetchingBookingDetails(true)
        console.log(`Falling back to original API for ID: ${bookingId}`)
        
        const response = await fetch(`${API_URL}/vendor/getbookingdetails/${bookingId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        
        const data = await response.json()
        
        if (!data || !data.booking) {
          throw new Error('Invalid booking data received')
        }
        
        console.log('Received booking details from fallback:', data.booking)
        setBookingData(data.booking)
        setIsVendorBooking(!data.booking.userid)
        
        if (!data.booking.otp || isVendorBooking) {
          await fetchBookingDirectly(bookingId)
        } else {
          setBackendOtp(data.booking.otp)
        }
      } catch (err) {
        console.error('Error fetching booking details:', err)
        setError('Failed to fetch booking details: ' + (err.message || ''))
      } finally {
        setFetchingBookingDetails(false)
      }
    }
    
    if (bookingId) {
      getBookingDetails()
    }
  }, [bookingId, bookingDetails])

  useEffect(() => {
    if (effectiveVendorId) {
      fetchFullDayModes()
    }
  }, [effectiveVendorId])

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        if (!effectiveVendorId) {
          console.log('Waiting for vendorId...');
          return;
        }

        setFetchingCharges(true)
        setError('')

        console.log(`Fetching charges for vendor: ${effectiveVendorId}`);
        const response = await fetch(`${API_URL}/vendor/getchargesdata/${effectiveVendorId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch charges data')
        }

        const data = await response.json()
        console.log('Received charges data:', data);
        
        if (!data?.vendor?.charges) {
          throw new Error('Invalid charges data format')
        }

        setChargesData(data.vendor)
      } catch (err) {
        console.error('Error fetching charges:', err)
        setError(err.message || 'Failed to fetch parking charges data')
      } finally {
        setFetchingCharges(false)
      }
    }

    fetchCharges()
  }, [effectiveVendorId])

  const calculateDuration = () => {
    try {
      const parkingDate = bookingData?.parkedDate
      const parkingTime = bookingData?.parkedTime
      
      console.log('Calculating duration with:', { parkingDate, parkingTime });
      if (!parkingDate || !parkingTime) {
        console.error('Missing parking data:', { parkingDate, parkingTime });
        throw new Error('Parking date or time not available')
      }
      
      const [day, month, year] = parkingDate.split('-').map(Number)
  
      let [time, period] = parkingTime.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
  
      if (period === 'PM' && hours < 12) {
        hours += 12
      } else if (period === 'AM' && hours === 12) {
        hours = 0
      }
      
      const parkingDateTime = new Date(year, month - 1, day, hours, minutes)
      const currentDateTime = new Date()
      
      console.log('Parking date time:', parkingDateTime);
      console.log('Current date time:', currentDateTime);
      
      const diffMs = currentDateTime - parkingDateTime
  
      if (is24Hours) {
        const effectiveVehicleType = bookingData?.vehicleType?.toLowerCase() || vehicleType.toLowerCase()
        const fullDayMode = fullDayModes[effectiveVehicleType] || 'Full Day'
        
        console.log(`Using full day mode "${fullDayMode}" for ${effectiveVehicleType}`)
        
        if (fullDayMode === '24 Hours') {
          // 24 Hours mode: Calculate complete 24-hour periods from parking time
          const diffHours = diffMs / (1000 * 60 * 60)
          const days = Math.ceil(diffHours / 24)
          const calculatedDays = Math.max(1, days)
          console.log('Calculated days (24 Hours mode):', calculatedDays);
          
          // Store calculation method for later display
          const calculationMethod = {
            methodName: '24 Hours',
            description: 'Complete 24-hour periods from parking time',
            parkingDateTime: parkingDateTime,
            currentDateTime: currentDateTime,
            diffHours: diffHours,
            days: calculatedDays
          }
          
          setHours(calculatedDays)
          return { duration: calculatedDays, method: calculationMethod }
        } else {
          // Modified Full Day mode: Calculate calendar days but don't include current day unless complete
          const parkingDay = new Date(year, month - 1, day)
          const currentDay = new Date(
            currentDateTime.getFullYear(), 
            currentDateTime.getMonth(), 
            currentDateTime.getDate()
          )
          
          // Calculate the difference in days (not inclusive of the current day)
          const timeDiff = currentDay.getTime() - parkingDay.getTime();
          const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
          // Only add the current day if it's complete (already passed midnight)
          // Always charge minimum 1 day
          const calculatedDays = Math.max(1, diffDays);
          
          console.log('Calculated calendar days (Full Day mode):', calculatedDays);
          
          // Store calculation method for later display
          const calculationMethod = {
            methodName: 'Full Day', 
            description: 'Calendar days (excluding current day unless complete)',
            parkingDay: parkingDay,
            currentDay: currentDay,
            diffDays: calculatedDays,
            explanation: 'Charges apply for each complete calendar day, excluding the current day if not yet complete'
          }
          
          setHours(calculatedDays)
          return { duration: calculatedDays, method: calculationMethod }
        }
      } else {
        // Hourly booking - unchanged
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
        const calculatedHours = Math.max(1, diffHours)
        console.log('Calculated hours (Hourly booking):', calculatedHours);
        
        // Store calculation method for later display
        const calculationMethod = {
          methodName: 'Hourly',
          description: 'Hours since parking time',
          parkingDateTime: parkingDateTime,
          currentDateTime: currentDateTime,
          diffHours: calculatedHours
        }
        
        setHours(calculatedHours)
        return { duration: calculatedHours, method: calculationMethod }
      }
    } catch (err) {
      console.error('Error calculating duration:', err)
      setError('Failed to calculate parking duration. Using default value.')
      setHours(1)
      return { duration: 1, method: null }
    }
  }

  useEffect(() => {
    if (bookingData?.parkedDate && bookingData?.parkedTime && fullDayModes) {
      const result = calculateDuration()
      
      if (chargesData) {
        calculateAmount(result.duration, chargesData, result.method)
      }
    }
  }, [bookingData, chargesData, is24Hours, fullDayModes, vehicleType])

  const calculateAmount = (hoursValue, charges = chargesData, calculationMethod = null) => {
    if (!charges || !charges.charges || !charges.charges.length) {
      console.warn('No charges data available');
      return;
    }

    try {
      const effectiveVehicleType = bookingData?.vehicleType || vehicleType
      
      console.log('Calculating amount for:', { 
        hoursValue, 
        vehicleType: effectiveVehicleType, 
        is24Hours,
        calculationMethod
      });
      
      const relevantCharges = charges.charges.filter(charge => 
        charge.category.toLowerCase() === effectiveVehicleType.toLowerCase()
      )

      if (relevantCharges.length === 0) {
        throw new Error(`No charges found for ${effectiveVehicleType}`)
      }

      console.log('Relevant charges:', relevantCharges);

      let calculatedAmount = 0
      let details = {}

      if (is24Hours) {
        const fullDayCharge = relevantCharges.find(charge => 
          charge.type.toLowerCase().includes('full day') || 
          charge.type.toLowerCase().includes('24 hour')
        )
        
        if (!fullDayCharge) {
          throw new Error(`Full day charge not found for ${effectiveVehicleType}`)
        }
        
        const days = hoursValue
        calculatedAmount = Number(fullDayCharge.amount) * days
        
        const vehicleTypeKey = effectiveVehicleType.toLowerCase()
        const fullDayMode = fullDayModes[vehicleTypeKey] || 'Full Day'
        
        details = {
          rateType: "Full day",
          baseRate: Number(fullDayCharge.amount),
          days: days,
          fullDayMode: fullDayMode,
          calculation: `${fullDayCharge.amount} × ${days} day(s) = ${calculatedAmount}`,
          calculationMethod: calculationMethod
        }
        
        console.log('Full day calculation details:', details);
      } else {
        const baseCharge = relevantCharges.find(charge => 
          charge.type.toLowerCase().includes('0 to 1') || 
          charge.type.toLowerCase().includes('first hour') ||
          charge.type.toLowerCase().includes('minimum')
        )
        
        const additionalCharge = relevantCharges.find(charge => 
          charge.type.toLowerCase().includes('additional') || 
          charge.type.toLowerCase().includes('extra hour')
        )
        
        if (!baseCharge) {
          throw new Error(`Base charge not found for ${effectiveVehicleType}`)
        }
        
        calculatedAmount = Number(baseCharge.amount)
        
        const additionalRate = additionalCharge ? Number(additionalCharge.amount) : Number(baseCharge.amount)
        
        if (hoursValue > 1) {
          calculatedAmount += additionalRate * (hoursValue - 1)
        }
        
        details = {
          rateType: "Hourly",
          baseRate: Number(baseCharge.amount),
          additionalRate: additionalRate,
          totalHours: hoursValue,
          calculation: hoursValue > 1 ? 
            `${baseCharge.amount} (first hour) + ${additionalRate} × ${hoursValue - 1} (additional hours) = ${calculatedAmount}` :
            `${baseCharge.amount} (first hour) = ${calculatedAmount}`,
          calculationMethod: calculationMethod
        }
        
        console.log('Hourly calculation details:', details);
      }

      setAmount(calculatedAmount)
      setCalculationDetails(details)
      setError('')
    } catch (err) {
      console.error('Error calculating amount:', err)
      setError(err.message || 'Failed to calculate amount')
      setAmount(0)
    }
  }

  const handleHoursChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setHours(value)
    if (chargesData) {
      calculateAmount(value, chargesData)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr;
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    
    let [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const formatDateObject = (date) => {
    if (!date) return 'N/A';
    return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
  }

  const formatTimeObject = (date) => {
    if (!date) return 'N/A';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const handleSubmit = async () => {
    if (!bookingId || !amount || !hours) {
      setError('Booking ID, amount and hours are required')
      return;
    }

    // Only validate OTP for user bookings (not vendor bookings)
    if (!isVendorBooking) {
      if (!otp) {
        setError('Last 3 digits of OTP are required');
        return;
      }
      
      // Check if entered OTP matches the last 3 digits of backend OTP
      if (otp.length !== 3 || !backendOtp || !backendOtp.endsWith(otp)) {
        setError('OTP does not match the last 3 digits of booking OTP');
        return;
      }
    }
  
    setLoading(true)
    setError('')
    
    try {
      console.log('Submitting exit data:', {
        bookingId,
        amount,
        hour: hours,
        is24Hours,
        vendorId: effectiveVendorId,
        otp: isVendorBooking ? null : backendOtp // Only send OTP for user bookings
      });
      
      const response = await fetch(`${API_URL}/vendor/exitvehicle/${bookingId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          amount,
          hour: hours,
          is24Hours,
          vendorId: effectiveVendorId,
          otp: isVendorBooking ? null : backendOtp // Only send OTP for user bookings
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update booking status')
      }

      const data = await response.json()
      onSuccess?.(data.message || 'Vehicle exit processed successfully')
      onClose?.()
    } catch (err) {
      console.error('Error processing exit:', err)
      setError(err.message || 'Failed to process vehicle exit')
    } finally {
      setLoading(false)
    }
  }

  const isLoading = fetchingCharges || fetchingBookingDetails || loading
  const otpValidated = isVendorBooking || (backendOtp && otp.length === 3 && backendOtp.endsWith(otp));

  return (
    <Box>
      <DialogTitle>
        Calculate Exit Charges
        <Typography variant="subtitle2" color="text.secondary">
          Booking ID: {bookingId}
          {isVendorBooking && (
            <Typography component="span" color="primary" sx={{ ml: 1 }}>
              (Vendor Booking)
            </Typography>
          )}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {isLoading && !error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              {fetchingBookingDetails ? 'Loading booking details...' : 
               fetchingCharges ? 'Loading charges data...' : 'Processing...'}
            </Typography>
          </Box>
        ) : (
          <>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Vehicle Type: {bookingData?.vehicleType || vehicleType}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Booking Type: {bookingData?.bookType || bookType}
                </Typography>
                {is24Hours && (
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Full Day Mode: {fullDayModes[bookingData?.vehicleType?.toLowerCase() || vehicleType.toLowerCase()] || 'Full Day'}
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  Parked Since: {formatDate(bookingData?.parkedDate)} at {formatTime(bookingData?.parkedTime)}{' '}
                  {bookingData?.parkedDate && bookingData?.parkedTime && (
                    <ParkedTimer 
                      parkedDate={bookingData.parkedDate} 
                      parkedTime={bookingData.parkedTime} 
                    />
                  )}
                </Typography>
              </CardContent>
            </Card>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={is24Hours ? "Number of Days" : "Number of Hours"}
                  type="number"
                  value={hours}
                  InputProps={{ 
                    readOnly: true,
                    inputProps: { min: 1 }
                  }}
                  disabled={isLoading}
                  required
                />
              </Grid>
              
              {!isVendorBooking && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Enter Last 3 Digits of OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setOtp(value);
                    }}
                    error={!otp || (otp && backendOtp && !backendOtp.endsWith(otp))}
                    helperText={
                      !otp ? "Last 3 digits of OTP are required" : 
                      (otp && backendOtp && !backendOtp.endsWith(otp) ? "OTP does not match the last 3 digits" : "")
                    }
                    disabled={isLoading}
                    required
                    inputProps={{
                      maxLength: 3,
                      pattern: "\\d{3}"
                    }}
                  />
                </Grid>
              )}
            </Grid>
            
            {calculationDetails && (
              <Card sx={{ mt: 3, backgroundColor: '#f9f9f9' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Calculation Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Rate Type:</strong> {calculationDetails.rateType}
                    </Typography>
                    {is24Hours ? (
                      <>
                        <Typography variant="body2">
                          <strong>Full Day Rate:</strong> ₹{calculationDetails.baseRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Number of Days:</strong> {calculationDetails.days}
                        </Typography>
                        {calculationDetails.fullDayMode && (
                          <Typography variant="body2">
                            <strong>Full Day Mode:</strong> {calculationDetails.fullDayMode}
                          </Typography>
                        )}
                        
                        {calculationDetails.calculationMethod && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              Calculation Mode: {calculationDetails.calculationMethod.methodName}
                            </Typography>
                            <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 0.5 }}>
                              {calculationDetails.calculationMethod.description}
                            </Typography>
                            
                            {calculationDetails.calculationMethod.methodName === 'Full Day' && (
                              <>
                                <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
                                  Parking day: {formatDateObject(calculationDetails.calculationMethod.parkingDay)}
                                </Typography>
                                <Typography variant="body2" fontSize="0.875rem">
                                  Current day: {formatDateObject(calculationDetails.calculationMethod.currentDay)}
                                </Typography>
                                <Typography variant="body2" fontSize="0.875rem">
                                  Calendar days (inclusive): {calculationDetails.calculationMethod.diffDays}
                                </Typography>
                              </>
                            )}
                            
                            {calculationDetails.calculationMethod.methodName === '24 Hours' && (
                              <>
                                <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
                                  Parking time: {formatDateObject(calculationDetails.calculationMethod.parkingDateTime)} {formatTimeObject(calculationDetails.calculationMethod.parkingDateTime)}
                                </Typography>
                                <Typography variant="body2" fontSize="0.875rem">
                                  Current time: {formatDateObject(calculationDetails.calculationMethod.currentDateTime)} {formatTimeObject(calculationDetails.calculationMethod.currentDateTime)}
                                </Typography>
                                <Typography variant="body2" fontSize="0.875rem">
                                  Elapsed hours: {calculationDetails.calculationMethod.diffHours.toFixed(2)}
                                </Typography>
                                <Typography variant="body2" fontSize="0.875rem">
                                  24-hour periods: {calculationDetails.calculationMethod.days}
                                </Typography>
                              </>
                            )}
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          <strong>First Hour Rate:</strong> ₹{calculationDetails.baseRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Additional Hour Rate:</strong> ₹{calculationDetails.additionalRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Hours:</strong> {calculationDetails.totalHours}
                        </Typography>
                        
                        {calculationDetails.calculationMethod && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              Calculation Mode: {calculationDetails.calculationMethod.methodName}
                            </Typography>
                            <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 0.5 }}>
                              {calculationDetails.calculationMethod.description}
                            </Typography>
                            <Typography variant="body2" fontSize="0.875rem" sx={{ mt: 1 }}>
                              Parking time: {formatDateObject(calculationDetails.calculationMethod.parkingDateTime)} {formatTimeObject(calculationDetails.calculationMethod.parkingDateTime)}
                            </Typography>
                            <Typography variant="body2" fontSize="0.875rem">
                              Current time: {formatDateObject(calculationDetails.calculationMethod.currentDateTime)} {formatTimeObject(calculationDetails.calculationMethod.currentDateTime)}
                            </Typography>
                            <Typography variant="body2" fontSize="0.875rem">
                              Elapsed hours: {calculationDetails.calculationMethod.diffHours}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Calculation:</strong> {calculationDetails.calculation}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Final Amount
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ₹{amount.toFixed(2)}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isLoading || !effectiveVendorId || !otpValidated}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Confirm Exit'}
        </Button>
      </DialogActions>
    </Box>
  )
}

export default ExitVehicleCalculator
