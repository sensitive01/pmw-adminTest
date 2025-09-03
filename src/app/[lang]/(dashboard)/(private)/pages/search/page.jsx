// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// // MUI Imports
// import TextField from '@mui/material/TextField'
// import InputAdornment from '@mui/material/InputAdornment'
// import Box from '@mui/material/Box'
// import Typography from '@mui/material/Typography'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Stack from '@mui/material/Stack'
// import IconButton from '@mui/material/IconButton'
// import Container from '@mui/material/Container'
// import AppBar from '@mui/material/AppBar'
// import Toolbar from '@mui/material/Toolbar'
// import CircularProgress from '@mui/material/CircularProgress'

// // Icon Imports
// import SearchIcon from '@mui/icons-material/Search'
// import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
// import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// import { Grid } from '@mui/material'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// const VendorSearchScreen = () => {
//   const { data: session } = useSession()
//   const router = useRouter()
  
//   const [filteredData, setFilteredData] = useState([])
//   const [data, setData] = useState([])
//   const [searchQuery, setSearchQuery] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   const fetchData = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       // Using the new API endpoint as requested
//       const response = await fetch(`${API_URL}/vendor/bookings`)
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch bookings')
//       }

//       const result = await response.json()

//       if (result && result.bookings) {
//         // Filter and map only the required fields
//         const filteredBookings = result.bookings
//           .filter(booking => ["pending", "approved", "cancelled", "parked", "completed"]
//             .includes(booking.status.toLowerCase()))
//           .map(booking => ({
//             sts: booking.sts,
//             parkingDate: booking.parkingDate,
//             parkingTime: booking.parkingTime,
//             vehicleNumber: booking.vehicleNumber,
//             status: booking.status,
//             // Include minimal other fields needed for display
//             vehicleType: booking.vehicleType,
//             bookingDate: booking.bookingDate,
//             bookingTime: booking.bookingTime,
//             exitvehicledate: booking.exitvehicledate,
//             exitvehicletime: booking.exitvehicletime
//           }))
        
//         setData(filteredBookings)
//         setFilteredData(filteredBookings)
//       } else {
//         setData([])
//         setFilteredData([])
//       }
//     } catch (error) {
//       console.error("Error fetching bookings:", error)
//       setError(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSearch = (query) => {
//     setSearchQuery(query)
    
//     if (!query.trim()) {
//       setFilteredData(data)
//       return
//     }
    
//     const filtered = data.filter(booking => {
//       const vehicleNumber = booking.vehicleNumber?.toString().toLowerCase() || ''
//       return vehicleNumber.includes(query.toLowerCase())
//     })
    
//     setFilteredData(filtered)
//   }

//   useEffect(() => {
//     fetchData()
//   }, []) // Removed vendorId dependency since we're fetching all bookings now

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <Typography color="error">Error: {error}</Typography>
//       </Box>
//     )
//   }

//   return (
//     <>
//       <Container maxWidth="lg" sx={{ py: 2 }}>
//         <Box sx={{ mb: 3, mt: 1 }}>
//           <TextField
//             fullWidth
//             value={searchQuery}
//             onChange={(e) => handleSearch(e.target.value)}
//             placeholder="Search by vehicle number"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 height: 40,
//                 bgcolor: '#ffffff',
//                 '& fieldset': {
//                   borderColor: '#329a73',
//                   borderWidth: 0.5,
//                 },
//                 '&:hover fieldset': {
//                   borderColor: '#329a73',
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: '#329a73',
//                 },
//               },
//               '& .MuiInputBase-input': {
//                 px: 1.5,
//                 py: 1,
//               },
//             }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon sx={{ color: '#329a73' }} />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Box>
        
//         {filteredData.length === 0 ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
//             <Typography>
//               {searchQuery ? 'No bookings found for this vehicle number' : 'No bookings available'}
//             </Typography>
//           </Box>
//         ) : (
//           <Stack spacing={2}>
//             {filteredData.map((booking, index) => (
//               <Card key={index} sx={{ borderRadius: '8px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//                     <Typography variant="h6" sx={{ fontWeight: 'bold', color: booking.status === 'Cancelled' ? 'error.main' : '#329a73' }}>
//                       {booking.vehicleNumber || 'N/A'}
//                     </Typography>
//                     <Typography sx={{ 
//                       color: booking.status.toLowerCase() === 'cancelled' ? 'error.main' : 
//                             booking.status.toLowerCase() === 'completed' ? 'success.main' : '#329a73', 
//                       fontWeight: 'bold' 
//                     }}>
//                       {booking.status}
//                     </Typography>
//                   </Box>
                  
//                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                     <Box sx={{ 
//                       bgcolor: booking.status.toLowerCase() === 'cancelled' ? 'error.main' : '#329a73',
//                       color: 'white',
//                       borderRadius: '4px',
//                       p: '4px 8px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       mr: 1
//                     }}>
//                       {booking.vehicleType === "Car" ? 
//                         <DirectionsCarIcon sx={{ fontSize: 20 }} /> : 
//                         <TwoWheelerIcon sx={{ fontSize: 20 }} />
//                       }
//                     </Box>
//                     <Typography variant="body2">
//                       {booking.vehicleType || 'N/A'}
//                     </Typography>
//                   </Box>
                  
//                   <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
//                     Schedule Type: {booking.sts || 'N/A'}
//                   </Typography>
                  
//                   <Grid container spacing={1}>
//                     <Grid item xs={6}>
//                       <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parking Date:</Typography>
//                       <Typography variant="body2">{booking.parkingDate || 'N/A'}</Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parking Time:</Typography>
//                       <Typography variant="body2">{booking.parkingTime || 'N/A'}</Typography>
//                     </Grid>
//                   </Grid>
//                 </CardContent>
//               </Card>
//             ))}
//           </Stack>
//         )}
//       </Container>
//     </>
//   )
// }

// export default VendorSearchScreen


'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Icon Imports
import SearchIcon from '@mui/icons-material/Search'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Grid } from '@mui/material'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const VendorSearchScreen = () => {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [filteredData, setFilteredData] = useState([])
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination states
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [pageCount, setPageCount] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Using the new API endpoint as requested
      const response = await fetch(`${API_URL}/vendor/bookings`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()

      if (result && result.bookings) {
        // Filter and map only the required fields
        const filteredBookings = result.bookings
          .filter(booking => ["pending", "approved", "cancelled", "parked", "completed"]
            .includes(booking.status.toLowerCase()))
          .map(booking => ({
            sts: booking.sts,
            parkingDate: booking.parkingDate,
            parkingTime: booking.parkingTime,
            vehicleNumber: booking.vehicleNumber,
            status: booking.status,
            // Include minimal other fields needed for display
            vehicleType: booking.vehicleType,
            bookingDate: booking.bookingDate,
            bookingTime: booking.bookingTime,
            exitvehicledate: booking.exitvehicledate,
            exitvehicletime: booking.exitvehicletime
          }))
        
        setData(filteredBookings)
        setFilteredData(filteredBookings)
        setPageCount(Math.ceil(filteredBookings.length / rowsPerPage))
      } else {
        setData([])
        setFilteredData([])
        setPageCount(0)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setPage(1) // Reset to first page when searching
    
    if (!query.trim()) {
      setFilteredData(data)
      setPageCount(Math.ceil(data.length / rowsPerPage))
      return
    }
    
    const filtered = data.filter(booking => {
      const vehicleNumber = booking.vehicleNumber?.toString().toLowerCase() || ''
      return vehicleNumber.includes(query.toLowerCase())
    })
    
    setFilteredData(filtered)
    setPageCount(Math.ceil(filtered.length / rowsPerPage))
  }
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(1) // Reset to first page when changing rows per page
    setPageCount(Math.ceil(filteredData.length / newRowsPerPage))
  }

  useEffect(() => {
    fetchData()
  }, []) // Removed vendorId dependency since we're fetching all bookings now
  
  // Update page count whenever filtered data or rows per page changes
  useEffect(() => {
    setPageCount(Math.ceil(filteredData.length / rowsPerPage))
  }, [filteredData, rowsPerPage])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by vehicle number"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 40,
                    bgcolor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#329a73',
                      borderWidth: 0.5,
                    },
                    '&:hover fieldset': {
                      borderColor: '#329a73',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#329a73',
                    },
                  },
                  '& .MuiInputBase-input': {
                    px: 1.5,
                    py: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#329a73' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderColor: '#329a73',
                  '& fieldset': {
                    borderColor: '#329a73',
                    borderWidth: 0.5,
                  },
                },
              }}>
                <InputLabel id="rows-per-page-label" sx={{ color: '#329a73' }}>Entries per page</InputLabel>
                <Select
                  labelId="rows-per-page-label"
                  id="rows-per-page-select"
                  value={rowsPerPage}
                  label="Entries per page"
                  onChange={handleChangeRowsPerPage}
                  sx={{ color: '#329a73' }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={300}>300</MenuItem>
                  <MenuItem value={500}>500</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {filteredData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <Typography>
              {searchQuery ? 'No bookings found for this vehicle number' : 'No bookings available'}
            </Typography>
          </Box>
        ) : (
          <>
            <Stack spacing={2}>
              {/* Apply pagination by slicing the data based on current page and rows per page */}
              {filteredData
                .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                .map((booking, index) => (
                <Card key={index} sx={{ borderRadius: '8px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: booking.status === 'Cancelled' ? 'error.main' : '#329a73' }}>
                        {booking.vehicleNumber || 'N/A'}
                      </Typography>
                      <Typography sx={{ 
                        color: booking.status.toLowerCase() === 'cancelled' ? 'error.main' : 
                              booking.status.toLowerCase() === 'completed' ? 'success.main' : '#329a73', 
                        fontWeight: 'bold' 
                      }}>
                        {booking.status}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        bgcolor: booking.status.toLowerCase() === 'cancelled' ? 'error.main' : '#329a73',
                        color: 'white',
                        borderRadius: '4px',
                        p: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        mr: 1
                      }}>
                        {booking.vehicleType === "Car" ? 
                          <DirectionsCarIcon sx={{ fontSize: 20 }} /> : 
                          <TwoWheelerIcon sx={{ fontSize: 20 }} />
                        }
                      </Box>
                      <Typography variant="body2">
                        {booking.vehicleType || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Schedule Type: {booking.sts || 'N/A'}
                    </Typography>
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parking Date:</Typography>
                        <Typography variant="body2">{booking.parkingDate || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parking Time:</Typography>
                        <Typography variant="body2">{booking.parkingTime || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            
            {/* Pagination controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handleChangePage} 
                color="primary"
                showFirstButton
                showLastButton
                sx={{ 
                  '& .MuiPaginationItem-root': { 
                    color: '#329a73',
                  },
                  '& .Mui-selected': { 
                    bgcolor: '#329a73 !important',
                    color: 'white !important'
                  }
                }}
              />
            </Box>
            
            {/* Display data range information */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length} entries
              </Typography>
            </Box>
          </>
        )}
      </Container>
    </>
  )
}

export default VendorSearchScreen
