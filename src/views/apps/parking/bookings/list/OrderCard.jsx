// import { useEffect, useState } from 'react'

// import { useSession } from 'next-auth/react'
// import axios from 'axios'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Grid from '@mui/material/Grid'
// import Typography from '@mui/material/Typography'
// import useMediaQuery from '@mui/material/useMediaQuery'
// import Divider from '@mui/material/Divider'

// // Third-party Imports
// import classnames from 'classnames'


// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'

// const OrderCard = ({ }) => {
//   const API_URL = process.env.NEXT_PUBLIC_API_URL
//   const { data: session } = useSession()
//   const vendorId = session?.user?.id


//   // State to store booking counts
//   const [statusCounts, setStatusCounts] = useState({
//     Pending: 0,
//     COMPLETED: 0,
//     Approved: 0,
//     Cancelled: 0,
//     Parked: 0
//   })


//   // Hooks
//   const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
//   const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))


//   // Status-to-Icon Mapping
//   const statusIcons = {
//     Pending: 'ri-time-line', // Clock icon
//     Approved: 'ri-thumb-up-line', // Thumbs up
//     Cancelled: 'ri-close-circle-line', // Cross icon
//     PARKED: 'ri-parking-box-line', // Parking icon
//     COMPLETED: 'ri-check-double-line', // Checkmark icon

//   }


//   // Fetch booking data
//   useEffect(() => {
//     if (!vendorId) return

//     const fetchBookings = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)

//         console.log('API Response:', response.data) // Debug the response
//         const bookings = response.data.bookings // Access the correct array

//         if (!Array.isArray(bookings)) {
//           console.error('Expected an array but got:', bookings)
          
// return
//         }

//         const counts = {
//           Pending: 0,
//           Approved: 0,
//           Cancelled: 0,
//           PARKED: 0,
//           COMPLETED: 0,
//         }
        
//         bookings.forEach(booking => {
//           const status = booking.status?.trim().toLowerCase(); // Normalize status to lowercase

//           const normalizedKey = 
//             status === 'completed' ? 'COMPLETED' :
//             status === 'pending' ? 'Pending' :
//             status === 'approved' ? 'Approved' :
//             status === 'cancelled' ? 'Cancelled' :
//             status === 'parked' ? 'PARKED' :
//             null; // Handle unexpected cases
        
//           if (normalizedKey && counts[normalizedKey] !== undefined) {
//             counts[normalizedKey] += 1;
//           }
//         });
        
//         setStatusCounts(counts)
//       } catch (error) {
//         console.error('Error fetching bookings:', error)
//       }
//     }

//     if (vendorId) fetchBookings()
//   }, [vendorId])


//   // Data structure for UI display
//   const statusData = Object.keys(statusCounts).map(status => ({
//     title: status.charAt(0) + status.slice(1).toLowerCase(), // Capitalize first letter
//     value: statusCounts[status],
//     icon: statusIcons[status] || 'ri-question-line' // Default icon if missing
//   }))

  
// return (
//     <Card>
//       <CardContent>
//         <Grid container spacing={6}>
//           {statusData.map((item, index) => (
//             <Grid
//             item
//             xs={12}
//             sm={6}
//             md={2.4} // Set to 2.4 to fit 5 items per row (12 / 5 = 2.4)
//             key={index}
//             className={classnames({
//               '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
//                 isBelowMdScreen && !isBelowSmScreen,
//               '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
//             })}
//           >
//               <div className='flex justify-between gap-4'>
//                 <div className='flex flex-col items-start'>
//                   <Typography variant='h4'>{item.value}</Typography>
//                   <Typography>{item.title}</Typography>
//                 </div>
//                 <CustomAvatar variant='rounded' size={42} skin='light'>
//                   <i className={classnames(item.icon, 'text-[26px]')} />
//                 </CustomAvatar>
//               </div>
//               {isBelowMdScreen && !isBelowSmScreen && index < statusData.length - 2 && (
//                 <Divider
//                   className={classnames('mbs-6', {
//                     'mie-6': index % 2 === 0
//                   })}
//                 />
//               )}
//               {isBelowSmScreen && index < statusData.length - 1 && <Divider className='mbs-6' />}
//             </Grid>
//           ))}
//         </Grid>
//       </CardContent>
//     </Card>
//   )
// }

// export default OrderCard


import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const OrderCard = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  // State to store booking counts
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    COMPLETED: 0,
    Approved: 0,
    Cancelled: 0,
    Parked: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // Status-to-Icon Mapping
  const statusIcons = {
    Pending: 'ri-time-line', // Clock icon
    Approved: 'ri-thumb-up-line', // Thumbs up
    Cancelled: 'ri-close-circle-line', // Cross icon
    PARKED: 'ri-parking-box-line', // Parking icon
    COMPLETED: 'ri-check-double-line', // Checkmark icon
  }

  // Status-to-Color Mapping
  const statusColors = {
    Pending: 'warning.main',
    Approved: 'info.main',
    Cancelled: 'error.main',
    PARKED: 'primary.main',
    COMPLETED: 'success.main',
  }

  // Fetch booking data
  useEffect(() => {
    const fetchBookings = async () => {
      if (!API_URL) {
        setError('API URL is not defined')
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        // Use the /vendor/bookings endpoint to get all bookings
        const response = await axios.get(`${API_URL}/vendor/bookings`)
        
        console.log('API Response:', response.data) // Debug the response
        
        // Handle different response formats
        let bookings = []
        if (Array.isArray(response.data)) {
          bookings = response.data
        } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
          bookings = response.data.bookings
        } else {
          throw new Error('Unexpected response format')
        }

        const counts = {
          Pending: 0,
          Approved: 0,
          Cancelled: 0,
          PARKED: 0,
          COMPLETED: 0,
        }
        
        bookings.forEach(booking => {
          const status = booking.status?.trim().toLowerCase() // Normalize status to lowercase

          // Map status to our normalized keys
          const normalizedKey = 
            status === 'completed' ? 'COMPLETED' :
            status === 'pending' ? 'Pending' :
            status === 'approved' ? 'Approved' :
            status === 'cancelled' ? 'Cancelled' :
            status === 'parked' ? 'PARKED' :
            null // Handle unexpected cases
        
          if (normalizedKey && counts[normalizedKey] !== undefined) {
            counts[normalizedKey] += 1
          }
        })
        
        setStatusCounts(counts)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError(error.message || 'Failed to fetch booking data')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [API_URL]) // Remove vendorId dependency to fetch all bookings

  // Data structure for UI display
  const statusData = Object.keys(statusCounts).map(status => ({
    title: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), // Proper capitalization
    value: statusCounts[status],
    icon: statusIcons[status] || 'ri-question-line', // Default icon if missing
    color: statusColors[status] || 'grey.500' // Default color if missing
  }))

  return (
    <Card>
      <CardContent>
        {loading && (
          <div className="flex justify-center mb-4">
            <CircularProgress size={24} />
          </div>
        )}
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Grid container spacing={6}>
          {statusData.map((item, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={2.4} // Set to 2.4 to fit 5 items per row (12 / 5 = 2.4)
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar 
                  variant='rounded' 
                  size={42} 
                  skin='light'
                  color={item.color.split('.')[0]} // Extract the color name without the shade
                >
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < statusData.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < statusData.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default OrderCard
