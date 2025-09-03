// 'use client'

// // React Imports
// import { useState, useEffect, useMemo } from 'react'
// import Link from 'next/link'
// import { useParams, useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import Checkbox from '@mui/material/Checkbox'
// import Chip from '@mui/material/Chip'
// import TablePagination from '@mui/material/TablePagination'
// import TextField from '@mui/material/TextField'
// import CardHeader from '@mui/material/CardHeader'
// import Divider from '@mui/material/Divider'
// import Alert from '@mui/material/Alert'
// import Menu from '@mui/material/Menu'
// import MenuItem from '@mui/material/MenuItem'
// import ListItemIcon from '@mui/material/ListItemIcon'
// import ListItemText from '@mui/material/ListItemText'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import Select from '@mui/material/Select'
// import Tooltip from '@mui/material/Tooltip'

// // Icons
// import { Download, PictureAsPdf, GridOn } from '@mui/icons-material'
// import { AccountBalanceWallet, Receipt, Summarize, CalendarToday } from '@mui/icons-material'

// // Third-party Imports
// import classnames from 'classnames'
// import { rankItem } from '@tanstack/match-sorter-utils'
// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getFilteredRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFacetedMinMaxValues,
//   getPaginationRowModel,
//   getSortedRowModel
// } from '@tanstack/react-table'

// // Component Imports
// import TableFilters from '../../products/list/TableFilters'
// import CustomAvatar from '@core/components/mui/Avatar'
// import OptionMenu from '@core/components/option-menu'

// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// import { getLocalizedUrl } from '@/utils/i18n'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// // Style Imports
// import tableStyles from '@core/styles/table.module.css'
// import { CircularProgress } from '@mui/material'

// export const stsChipColor = {
//   instant: { color: '#ff4d49', text: 'Instant' },
//   subscription: { color: '#72e128', text: 'Subscription' },
//   schedule: { color: '#fdb528', text: 'Schedule' }
// };

// export const statusChipColor = {
//   completed: { color: 'success' },
//   pending: { color: 'warning' },
//   parked: { color: '#666CFF' },
//   cancelled: { color: 'error' },
//   approved: { color: 'info' }
// };

// const fuzzyFilter = (row, columnId, value, addMeta) => {
//   const itemRank = rankItem(row.getValue(columnId), value)

//   addMeta({
//     itemRank
//   })

//   return itemRank.passed
// }

// const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
//   const [value, setValue] = useState(initialValue)

//   useEffect(() => {
//     setValue(initialValue)
//   }, [initialValue])
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value)
//     }, debounce)

//     return () => clearTimeout(timeout)
//   }, [value])

//   return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
// }

// const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
//   const [elapsedTime, setElapsedTime] = useState('00:00:00')

//   useEffect(() => {
//     if (!parkedDate || !parkedTime) {
//       setElapsedTime('00:00:00')
//       return
//     }
//     const [day, month, year] = parkedDate.split('-')
//     const [timePart, ampm] = parkedTime.split(' ')
//     let [hours, minutes] = timePart.split(':')
//     if (ampm && ampm.toUpperCase() === 'PM' && hours !== '12') {
//       hours = parseInt(hours) + 12
//     } else if (ampm && ampm.toUpperCase() === 'AM' && hours === '12') {
//       hours = '00'
//     }
//     const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
//     const timer = setInterval(() => {
//       const now = new Date()
//       const diffMs = now - parkingStartTime
//       if (diffMs < 0) {
//         setElapsedTime('00:00:00')
//         return
//       }

//       const diffSecs = Math.floor(diffMs / 1000)
//       const hours = Math.floor(diffSecs / 3600)
//       const minutes = Math.floor((diffSecs % 3600) / 60)
//       const seconds = diffSecs % 60

//       const formattedHours = hours.toString().padStart(2, '0')
//       const formattedMinutes = minutes.toString().padStart(2, '0')
//       const formattedSeconds = seconds.toString().padStart(2, '0')

//       setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [parkedDate, parkedTime])

//   return (
//     <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
//       {elapsedTime}
//     </Typography>
//   )
// }

// const calculateTotalDuration = (parkedDate, parkedTime, exitDate, exitTime) => {
//   if (!parkedDate || !parkedTime || !exitDate || !exitTime) return 'N/A';

//   try {
//     // Parse start time
//     const [startDay, startMonth, startYear] = parkedDate.split('-');
//     const [startTimePart, startAmpm] = parkedTime.split(' ');
//     let [startHours, startMinutes] = startTimePart.split(':').map(Number);

//     // Convert to 24-hour format
//     if (startAmpm && startAmpm.toUpperCase() === 'PM' && startHours !== 12) {
//       startHours += 12;
//     } else if (startAmpm && startAmpm.toUpperCase() === 'AM' && startHours === '12') {
//       startHours = 0;
//     }

//     // Parse end time
//     const [endDay, endMonth, endYear] = exitDate.split('-');
//     const [endTimePart, endAmpm] = exitTime.split(' ');
//     let [endHours, endMinutes] = endTimePart.split(':').map(Number);

//     // Convert to 24-hour format
//     if (endAmpm && endAmpm.toUpperCase() === 'PM' && endHours !== 12) {
//       endHours += 12;
//     } else if (endAmpm && endAmpm.toUpperCase() === 'AM' && endHours === '12') {
//       endHours = 0;
//     }

//     // Create Date objects
//     const startTime = new Date(
//       parseInt(startYear),
//       parseInt(startMonth) - 1,
//       parseInt(startDay),
//       startHours,
//       startMinutes
//     );

//     const endTime = new Date(
//       parseInt(endYear),
//       parseInt(endMonth) - 1,
//       parseInt(endDay),
//       endHours,
//       endMinutes
//     );

//     // Calculate difference in milliseconds
//     const diffMs = endTime - startTime;

//     if (diffMs < 0) {
//       return 'Invalid time range';
//     }

//     // Calculate days, hours, minutes, seconds
//     const diffSecs = Math.floor(diffMs / 1000);
//     const days = Math.floor(diffSecs / (3600 * 24));
//     const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
//     const minutes = Math.floor((diffSecs % 3600) / 60);
//     const seconds = diffSecs % 60;

//     // Format the duration
//     const formattedDays = days > 0 ? `${days}d ` : '';
//     const formattedHours = hours.toString().padStart(2, '0');
//     const formattedMinutes = minutes.toString().padStart(2, '0');
//     const formattedSeconds = seconds.toString().padStart(2, '0');

//     return `${formattedDays}${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`;
//   } catch (e) {
//     console.error("Error calculating duration:", e);
//     return 'N/A';
//   }
// };

// const columnHelper = createColumnHelper()

// const OrderListTable = ({ orderData }) => {
//   const [rowSelection, setRowSelection] = useState({})
//   const [data, setData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [globalFilter, setGlobalFilter] = useState('')
//   const [filteredData, setFilteredData] = useState([])
//   const [vendors, setVendors] = useState([])
//   const [selectedVendor, setSelectedVendor] = useState('')
//   const { lang: locale } = useParams()
//   const { data: session } = useSession()
//   const router = useRouter();
//   const vendorId = session?.user?.id
//   const [error, setError] = useState(null)
//   // Download menu state
//   const [anchorEl, setAnchorEl] = useState(null)
//   const open = Boolean(anchorEl)

//   // Filter states
//   const [filters, setFilters] = useState({
//     vehicleType: '',
//     sts: '',
//     status: '',
//     bookingDate: ''
//   })

//   useEffect(() => {
//     const fetchVendors = async () => {
//       try {
//         const response = await fetch(`${API_URL}/vendor/all-vendors`);
//         if (!response.ok) {
//           throw new Error(`Error: ${response.status}`);
//         }
//         const result = await response.json();
//         if (result && Array.isArray(result.data)) {
//           setVendors(result.data);
//         }
//       } catch (error) {
//         console.error('Error fetching vendors:', error);
//       }
//     };

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(`${API_URL}/vendor/bookings`);

//         if (!response.ok) {
//           throw new Error(`Error: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('Fetched bookings:', result);

//         if (result && Array.isArray(result)) {
//           setData(result);
//           setFilteredData(result);
//         } else if (result && result.bookings && Array.isArray(result.bookings)) {
//           setData(result.bookings);
//           setFilteredData(result.bookings);
//         } else {
//           throw new Error('Unexpected response format');
//         }
//       } catch (error) {
//         console.error('Error fetching booking data:', error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVendors();
//     fetchData();
//   }, []);

//   // Apply filters whenever data, selectedVendor, or filters change
//   useEffect(() => {
//     const applyFilters = () => {
//       let filteredResults = [...data];

//       // First filter by vendor if selected
//       if (selectedVendor) {
//         filteredResults = filteredResults.filter(booking => booking.vendorId === selectedVendor);
//       }

//       // Then apply other filters
//       if (filters.vehicleType) {
//         filteredResults = filteredResults.filter(booking => booking.vehicleType === filters.vehicleType);
//       }
//       if (filters.sts) {
//         filteredResults = filteredResults.filter(booking => booking.sts === filters.sts);
//       }
//       if (filters.status) {
//         filteredResults = filteredResults.filter(booking => booking.status === filters.status);
//       }
//       if (filters.bookingDate) {
//         // Normalize the filter date to DD-MM-YYYY format
//         const normalizedFilterDate = filters.bookingDate;

//         filteredResults = filteredResults.filter(booking => {
//           // Ensure booking date is in DD-MM-YYYY format
//           const bookingDate = booking.bookingDate; // Assuming it's already in DD-MM-YYYY format

//           // Compare dates directly after normalizing both to same format
//           return bookingDate === normalizedFilterDate;
//         });
//       }

//       setFilteredData(filteredResults.length > 0 ? filteredResults : []);
//     };

//     applyFilters();
//   }, [data, selectedVendor, filters]);

//   const handleFilterChange = (name, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleVendorChange = (value) => {
//     setSelectedVendor(value);
//     // Reset other filters when vendor changes
//     setFilters({
//       vehicleType: '',
//       sts: '',
//       status: '',
//       bookingDate: ''
//     });
//   };

//   // Download menu handlers
//   const handleDownloadClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleDownloadClose = () => {
//     setAnchorEl(null);
//   };
// // Convert from DD-MM-YYYY to DD/MM/YYYY for display
// const formatDisplayDate = (dateStr) => {
//   return dateStr.replace(/-/g, '/');
// };

// // Convert from DD/MM/YYYY to DD-MM-YYYY for filtering
// const formatFilterDate = (dateStr) => {
//   return dateStr.replace(/\//g, '-');
// };
//   const exportToExcel = () => {
//     // Get data filtered by ALL current filters (vendor + date + others)
//     const filteredByVendor = selectedVendor
//       ? data.filter(booking => booking.vendorId === selectedVendor)
//       : data;

//     const filteredByAll = filteredByVendor.filter(booking => {
//       // Apply date filter if present
//       if (filters.bookingDate && booking.bookingDate !== filters.bookingDate) {
//         return false;
//       }
//       // Apply other filters if present
//       if (filters.vehicleType && booking.vehicleType !== filters.vehicleType) {
//         return false;
//       }
//       if (filters.sts && booking.sts !== filters.sts) {
//         return false;
//       }
//       if (filters.status && booking.status !== filters.status) {
//         return false;
//       }
//       return true;
//     });

//     if (!filteredByAll || filteredByAll.length === 0) {
//       alert('No data to export with current filters');
//       return;
//     }

//     // Rest of your Excel export code...
//     let csvContent = "data:text/csv;charset=utf-8,";

//     // const headers = [
//     //   'S.No',
//     //   'Vehicle Number',
//     //   'Booking Date & Time',
//     //   'Customer Name',
//     //   'Booking Type',
//     //   'Status',
//     //   'Vehicle Type',
//     //   'Amount (₹)',
//     //   'Duration'
//     // ];

//     const headers = [
//   'S.No',
//   'Vehicle Number',
//   'Booking Date & Time',
//   'Customer Name',
//   'Booking Type',
//   'Status',
//   'Vehicle Type',
//   'Amount (₹)',
//   'Duration',
//   'Parked Date',
//   'Parked Time',
//   'Exit Date',
//   'Exit Time'
// ];
// csvContent += headers.join(",") + "\r\n";

// filteredByAll.forEach((row, index) => {
//   let duration = '';
//   if (row.status?.toLowerCase() === 'completed') {
//     duration = calculateTotalDuration(
//       row.parkedDate,
//       row.parkedTime,
//       row.exitvehicledate,
//       row.exitvehicletime
//     );
//   }

//   const rowData = [
//     index + 1,
//     `"${row.vehicleNumber}"`,
//     `"${row.bookingDate}, ${row.bookingTime}"`,
//     `"${row.personName}"`,
//     `"${stsChipColor[row.sts?.toLowerCase()]?.text || row.sts}"`,
//     `"${row.status}"`,
//     `"${row.vehicleType}"`,
//     `"${row.amount || 'N/A'}"`,
//     `"${duration}"`,
//     `"${row.parkedDate || 'N/A'}"`,
//     `"${row.parkedTime || 'N/A'}"`,
//     `"${row.exitvehicledate || 'N/A'}"`,
//     `"${row.exitvehicletime || 'N/A'}"`
//   ];
//   csvContent += rowData.join(",") + "\r\n";
// });
//     csvContent += headers.join(",") + "\r\n";

//     filteredByAll.forEach((row, index) => {
//       let duration = '';
//       if (row.status?.toLowerCase() === 'completed') {
//         duration = calculateTotalDuration(
//           row.parkedDate,
//           row.parkedTime,
//           row.exitvehicledate,
//           row.exitvehicletime
//         );
//       }

//       const rowData = [
//         index + 1,
//         `"${row.vehicleNumber}"`,
//         `"${row.bookingDate}, ${row.bookingTime}"`,
//         `"${row.personName}"`,
//         `"${stsChipColor[row.sts?.toLowerCase()]?.text || row.sts}"`,
//         `"${row.status}"`,
//         `"${row.vehicleType}"`,
//         `"${row.amount || 'N/A'}"`,
//         `"${duration}"`
//       ];
//       csvContent += rowData.join(",") + "\r\n";
//     });

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     const vendorName = selectedVendor
//       ? vendors.find(v => v._id === selectedVendor)?.vendorName
//       : 'all_vendors';
//     const fileName = `bookings_${vendorName}_${filters.bookingDate || 'all_dates'}_${new Date().toISOString().slice(0, 10)}.csv`;
//     link.setAttribute("download", fileName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     handleDownloadClose();
//   };

//   const exportToPDF = () => {
//     // Get data filtered by ALL current filters (vendor + date + others)
//     const filteredByVendor = selectedVendor
//       ? data.filter(booking => booking.vendorId === selectedVendor)
//       : data;

//     const filteredByAll = filteredByVendor.filter(booking => {
//       // Apply date filter if present
//       if (filters.bookingDate && booking.bookingDate !== filters.bookingDate) {
//         return false;
//       }
//       // Apply other filters if present
//       if (filters.vehicleType && booking.vehicleType !== filters.vehicleType) {
//         return false;
//       }
//       if (filters.sts && booking.sts !== filters.sts) {
//         return false;
//       }
//       if (filters.status && booking.status !== filters.status) {
//         return false;
//       }
//       return true;
//     });

//     if (!filteredByAll || filteredByAll.length === 0) {
//       alert('No data to export with current filters');
//       return;
//     }

//     const vendorName = selectedVendor
//       ? vendors.find(v => v._id === selectedVendor)?.vendorName
//       : 'All Vendors';

//     // Calculate total amount
//     const totalAmount = filteredByAll.reduce((sum, booking) => {
//       return sum + (parseInt(booking.amount) || 0);
//     }, 0);

//     // Rest of your PDF export code...
//   //   const printContent = `
//   //   <html>
//   //     <head>
//   //       <title>Bookings Report</title>
//   //       <style>
//   //         body { font-family: Arial; margin: 20px; }
//   //         h1 { color: #333; }
//   //         table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//   //         th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//   //         th { background-color: #f2f2f2; }
//   //         .total-amount { font-weight: bold; margin-top: 20px; }
//   //         .filter-info { margin-bottom: 20px; }
//   //       </style>
//   //     </head>
//   //     <body>
//   //       <h1>Bookings Report</h1>
//   //       <div class="filter-info">
//   //         <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
//   //         <p><strong>Vendor:</strong> ${vendorName}</p>
//   //         ${filters.bookingDate ? `<p><strong>Booking Date:</strong> ${filters.bookingDate}</p>` : ''}
//   //         ${filters.vehicleType ? `<p><strong>Vehicle Type:</strong> ${filters.vehicleType}</p>` : ''}
//   //         ${filters.sts ? `<p><strong>Booking Type:</strong> ${filters.sts}</p>` : ''}
//   //         ${filters.status ? `<p><strong>Status:</strong> ${filters.status}</p>` : ''}
//   //         <p><strong>Total Bookings:</strong> ${filteredByAll.length}</p>
//   //       </div>
        
//   //       <table>
//   //         <thead>
//   //           <tr>
//   //             <th>S.No</th>
//   //             <th>Vehicle No.</th>
//   //             <th>Booking Date & Time</th>
//   //             <th>Customer</th>
//   //             <th>Booking Type</th>
//   //             <th>Status</th>
//   //             <th>Vehicle Type</th>
//   //             <th>Amount (₹)</th>
//   //             <th>Duration</th>
//   //           </tr>
//   //         </thead>
//   //         <tbody>
//   //           ${filteredByAll.map((booking, index) => {
//   //     let duration = '';
//   //     if (booking.status?.toLowerCase() === 'completed') {
//   //       duration = calculateTotalDuration(
//   //         booking.parkedDate,
//   //         booking.parkedTime,
//   //         booking.exitvehicledate,
//   //         booking.exitvehicletime
//   //       );
//   //     }

//   //     return `
//   //               <tr>
//   //                 <td>${index + 1}</td>
//   //                 <td>${booking.vehicleNumber}</td>
//   //                 <td>${booking.bookingDate}, ${booking.bookingTime}</td>
//   //                 <td>${booking.personName}</td>
//   //                 <td>${stsChipColor[booking.sts?.toLowerCase()]?.text || booking.sts}</td>
//   //                 <td>${booking.status}</td>
//   //                 <td>${booking.vehicleType}</td>
//   //                 <td>${booking.amount || 'N/A'}</td>
//   //                 <td>${duration}</td>
//   //               </tr>
//   //             `;
//   //   }).join('')}
//   //         </tbody>
//   //       </table>
        
//   //       <div class="total-amount">
//   //         Total Amount: ₹${totalAmount.toLocaleString()}
//   //       </div>
//   //     </body>
//   //   </html>
//   // `;

//       const printContent = `
// <html>
//   <head>
//     <title>Bookings Report</title>
//     <style>
//       body { font-family: Arial; margin: 20px; }
//       h1 { color: #333; }
//       table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//       th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//       th { background-color: #f2f2f2; }
//       .total-amount { font-weight: bold; margin-top: 20px; }
//       .filter-info { margin-bottom: 20px; }
//     </style>
//   </head>
//   <body>
//     <h1>Bookings Report</h1>
//     <div class="filter-info">
//       <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
//       <p><strong>Vendor:</strong> ${vendorName}</p>
//       ${filters.bookingDate ? `<p><strong>Booking Date:</strong> ${filters.bookingDate}</p>` : ''}
//       ${filters.vehicleType ? `<p><strong>Vehicle Type:</strong> ${filters.vehicleType}</p>` : ''}
//       ${filters.sts ? `<p><strong>Booking Type:</strong> ${filters.sts}</p>` : ''}
//       ${filters.status ? `<p><strong>Status:</strong> ${filters.status}</p>` : ''}
//       <p><strong>Total Bookings:</strong> ${filteredByAll.length}</p>
//     </div>
    
//     <table>
//       <thead>
//         <tr>
//           <th>S.No</th>
//           <th>Vehicle No.</th>
//           <th>Booking Date & Time</th>
//           <th>Customer</th>
//           <th>Booking Type</th>
//           <th>Status</th>
//           <th>Vehicle Type</th>
//           <th>Amount (₹)</th>
//           <th>Duration</th>
//           <th>Parked Date</th>
//           <th>Parked Time</th>
//           <th>Exit Date</th>
//           <th>Exit Time</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${filteredByAll.map((booking, index) => {
//       let duration = '';
//       if (booking.status?.toLowerCase() === 'completed') {
//         duration = calculateTotalDuration(
//           booking.parkedDate,
//           booking.parkedTime,
//           booking.exitvehicledate,
//           booking.exitvehicletime
//         );
//       }

//       return `
//             <tr>
//               <td>${index + 1}</td>
//               <td>${booking.vehicleNumber}</td>
//               <td>${booking.bookingDate}, ${booking.bookingTime}</td>
//               <td>${booking.personName}</td>
//               <td>${stsChipColor[booking.sts?.toLowerCase()]?.text || booking.sts}</td>
//               <td>${booking.status}</td>
//               <td>${booking.vehicleType}</td>
//               <td>${booking.amount || 'N/A'}</td>
//               <td>${duration}</td>
//               <td>${booking.parkedDate || 'N/A'}</td>
//               <td>${booking.parkedTime || 'N/A'}</td>
//               <td>${booking.exitvehicledate || 'N/A'}</td>
//               <td>${booking.exitvehicletime || 'N/A'}</td>
//             </tr>
//           `;
//     }).join('')}
//       </tbody>
//     </table>
    
//     <div class="total-amount">
//       Total Amount: ₹${totalAmount.toLocaleString()}
//     </div>
//   </body>
// </html>
// `;
//     const win = window.open('', '_blank');
//     win.document.write(printContent);
//     win.document.close();
//     win.focus();
//     setTimeout(() => {
//       win.print();
//       win.close();
//     }, 500);

//     handleDownloadClose();
//   };

//   const columns = useMemo(
//     () => [
//       {
//         id: 'serialNumber',
//         header: 'S.No',
//         cell: ({ row }) => (
//           <Typography>
//             {row.index + 1}
//           </Typography>
//         )
//       },
//       columnHelper.accessor('vehicleNumber', {
//         header: 'Vehicle Number',
//         cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber}</Typography>
//       }),
//       columnHelper.accessor('bookingDate', {
//         header: 'Booking Date & Time',
//         cell: ({ row }) => {
//           const formatDate = (dateStr) => {
//             if (!dateStr) return 'Invalid Date';
//             const [day, month, year] = dateStr.split('-');
//             return `${day}/${month}/${year}`; // Format as DD/MM/YYYY
//           };

//           return (
//             <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <i className="ri-calendar-2-line text-[26px]" style={{ fontSize: '16px', color: '#666' }}></i>
//               {`${formatDate(row.original.bookingDate)}, ${row.original.bookingTime}`}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('payableTime', {
//         header: 'Payable Time',
//         cell: ({ row }) => {
//           const status = row.original.status?.toLowerCase();

//           // Only show for parked status
//           if (status === 'parked') {
//             return (
//               <div className="flex items-center gap-2">
//                 <i className="ri-time-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
//                 <PayableTimeTimer
//                   parkedDate={row.original.parkedDate}
//                   parkedTime={row.original.parkedTime}
//                 />
//               </div>
//             );
//           }

//           return null;
//         }
//       }),
//       columnHelper.accessor('duration', {
//         header: 'Duration',
//         cell: ({ row }) => {
//           const status = row.original.status?.toLowerCase();

//           // Only show duration for completed bookings
//           if (status === 'completed') {
//             const duration = calculateTotalDuration(
//               row.original.parkedDate,
//               row.original.parkedTime,
//               row.original.exitvehicledate,
//               row.original.exitvehicletime
//             );

//             return (
//               <Typography sx={{ fontWeight: 500, color: '#666CFF' }}>
//                 {duration}
//               </Typography>
//             );
//           }

//           return null;
//         }
//       }),
//       columnHelper.accessor('amount', {
//         header: 'Amount',
//         cell: ({ row }) => (
//           <Typography sx={{ fontWeight: 500, color: '#666CFF' }}>
//             {row.original.amount ? `₹${row.original.amount}` : 'N/A'}
//           </Typography>
//         )
//       }),
//       columnHelper.accessor('customerName', {
//         header: 'Customer',
//         cell: ({ row }) => (
//           <div className="flex items-center gap-3">
//             <CustomAvatar src="/images/avatars/1.png" skin='light' size={34} />
//             <div className="flex flex-col">
//               <Typography className="font-medium">{row.original.personName}</Typography>
//               <Typography variant="body2">{row.original.mobileNumber}</Typography>
//             </div>
//           </div>
//         )
//       }),
//       columnHelper.accessor('sts', {
//         header: 'Booking Type',
//         cell: ({ row }) => {
//           const stsKey = row.original.sts?.toLowerCase();
//           const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts };

//           return (
//             <Typography
//               sx={{ color: chipData.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}
//             >
//               <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
//               {chipData.text}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('status', {
//         header: 'Status',
//         cell: ({ row }) => {
//           const statusKey = row.original.status?.toLowerCase();
//           const chipData = statusChipColor[statusKey] || { color: 'default' };

//           return (
//             <Chip
//               label={row.original.status}
//               variant="tonal"
//               size="small"
//               sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
//               color={!chipData.color.startsWith('#') ? chipData.color : undefined}
//             />
//           );
//         }
//       }),
//       columnHelper.accessor('vehicleType', {
//         header: 'Vehicle Type',
//         cell: ({ row }) => {
//           const vehicleType = row.original.vehicleType?.toLowerCase();

//           const vehicleIcons = {
//             car: { icon: 'ri-car-fill', color: '#ff4d49' },
//             bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
//             default: { icon: 'ri-roadster-fill', color: '#282a42' }
//           };

//           const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

//           return (
//             <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <i className={icon} style={{ fontSize: '16px', color }}></i>
//               {row.original.vehicleType}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('action', {
//         header: 'Actions',
//         cell: ({ row }) => (
//           <div className='flex items-center'>
//             <OptionMenu
//               iconButtonProps={{ size: 'medium' }}
//               iconClassName='text-[22px]'
//               options={[
//                 {
//                   text: 'View',
//                   icon: 'ri-eye-line',
//                   menuItemProps: {
//                     onClick: () => {
//                       const selectedId = row.original._id;

//                       if (selectedId) {
//                         console.log('Navigating to Order Details:', selectedId);
//                         router.push(`/pages/bookingdetails/${selectedId}`);
//                       } else {
//                         console.error('⚠️ Booking ID is undefined!');
//                       }
//                     }
//                   }
//                 },
//                 {
//                   text: 'Delete',
//                   icon: 'ri-delete-bin-7-line text-[22px]',
//                   menuItemProps: {
//                     onClick: async () => {
//                       try {
//                         const selectedId = row.original._id;

//                         if (!selectedId) {
//                           console.error('⚠️ Booking ID is missing!');
//                           return;
//                         }

//                         console.log('Attempting to delete Booking ID:', selectedId);
//                         const isConfirmed = window.confirm("Are you sure you want to delete this booking?");

//                         if (!isConfirmed) {
//                           console.log('Deletion cancelled');
//                           return;
//                         }

//                         const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
//                           method: 'DELETE'
//                         });

//                         if (!response.ok) {
//                           throw new Error('Failed to delete booking');
//                         }

//                         console.log('✅ Booking Deleted:', selectedId);
//                         setData(prevData => prevData.filter(booking => booking._id !== selectedId));
//                       } catch (error) {
//                         console.error('Error deleting booking:', error);
//                       }
//                     },
//                     className: 'flex items-center gap-2 pli-4'
//                   }
//                 }
//               ]}
//             />
//           </div>
//         ),
//         enableSorting: false
//       })
//     ],
//     [data, filteredData]
//   );

//   const table = useReactTable({
//     data: filteredData.length > 0 || globalFilter ? filteredData : data,
//     columns,
//     filterFns: {
//       fuzzy: fuzzyFilter
//     },
//     state: {
//       rowSelection,
//       globalFilter
//     },
//     initialState: {
//       pagination: {
//         pageSize: 10
//       }
//     },
//     enableRowSelection: true,
//     globalFilterFn: fuzzyFilter,
//     onRowSelectionChange: setRowSelection,
//     onGlobalFilterChange: setGlobalFilter,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues()
//   });

//   return (
//     <Card>
//       <CardHeader title='Filters' />
//       <CardContent className='flex flex-col gap-4'>
//         <div className='flex flex-col sm:flex-row gap-4'>
//           <FormControl fullWidth size='small' sx={{ maxWidth: 550 }}>
//             <InputLabel id='vendor-select-label'>Vendor</InputLabel>
//             <Select
//               labelId='vendor-select-label'
//               id='vendor-select'
//               value={selectedVendor}
//               label='Vendor'
//               onChange={(e) => handleVendorChange(e.target.value)}
//               sx={{
//                 minWidth: 200,
//                 height: 53,
//                 '& .MuiSelect-select': {
//                   paddingTop: '12px',
//                   paddingBottom: '12px'
//                 }
//               }}
//             >
//               <MenuItem value=''>
//                 <em>All Vendors</em>
//               </MenuItem>
//               {vendors.map((vendor) => (
//                 <MenuItem key={vendor._id} value={vendor._id}>
//                   {vendor.vendorName}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <TableFilters
//             filters={filters}
//             onFilterChange={handleFilterChange}
//             bookingData={selectedVendor ? data.filter(booking => booking.vendorId === selectedVendor) : data}
//           />
//         </div>
//       </CardContent>
//       <Divider />
//       <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
//         <DebouncedInput
//           value={globalFilter ?? ''}
//           onChange={value => setGlobalFilter(String(value))}
//           placeholder='Search Order'
//           className='sm:is-auto'
//         />

//         <div className="flex gap-2">
//           <Button
//             variant='outlined'
//             startIcon={<Download />}
//             onClick={handleDownloadClick}
//           >
//             Download
//           </Button>
//           <Menu
//             anchorEl={anchorEl}
//             open={open}
//             onClose={handleDownloadClose}
//           >
//             <MenuItem onClick={exportToExcel}>
//               <ListItemIcon>
//                 <GridOn fontSize="small" />
//               </ListItemIcon>
//               <ListItemText>Export to Excel</ListItemText>
//             </MenuItem>
//             <MenuItem onClick={exportToPDF}>
//               <ListItemIcon>
//                 <PictureAsPdf fontSize="small" />
//               </ListItemIcon>
//               <ListItemText>Export to PDF</ListItemText>
//             </MenuItem>
//           </Menu>

//           <Button
//             variant='contained'
//             component={Link}
//             href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
//             startIcon={<i className='ri-add-line' />}
//             className='max-sm:is-full is-auto'
//           >
//             New Booking
//           </Button>
//         </div>
//       </CardContent>
//       <div className='overflow-x-auto'>
//         {loading ? (
//           <div className="flex justify-center items-center p-8">
//             <CircularProgress />
//           </div>
//         ) : error ? (
//           <Alert severity="error" className="m-4">
//             Error loading data. Please try again.
//           </Alert>
//         ) : (
//           <>
//             <table className={tableStyles.table}>
//               <thead>
//                 {table.getHeaderGroups().map(headerGroup => (
//                   <tr key={headerGroup.id}>
//                     {headerGroup.headers.map(header => (
//                       <th key={header.id}>
//                         {header.isPlaceholder ? null : (
//                           <div
//                             className={classnames({
//                               'flex items-center': header.column.getIsSorted(),
//                               'cursor-pointer select-none': header.column.getCanSort()
//                             })}
//                             onClick={header.column.getToggleSortingHandler()}
//                           >
//                             {flexRender(header.column.columnDef.header, header.getContext())}
//                             {{
//                               asc: <i className='ri-arrow-up-s-line text-xl' />,
//                               desc: <i className='ri-arrow-down-s-line text-xl' />
//                             }[header.column.getIsSorted()] ?? null}
//                           </div>
//                         )}
//                       </th>
//                     ))}
//                   </tr>
//                 ))}
//               </thead>
//               {table.getFilteredRowModel().rows.length === 0 ? (
//                 <tbody>
//                   <tr>
//                     <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
//                       No data found matching your filters
//                     </td>
//                   </tr>
//                 </tbody>
//               ) : (
//                 <tbody>
//                   {table
//                     .getRowModel()
//                     .rows.slice(0, table.getState().pagination.pageSize)
//                     .map(row => {
//                       return (
//                         <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
//                           {row.getVisibleCells().map(cell => (
//                             <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
//                           ))}
//                         </tr>
//                       )
//                     })}
//                 </tbody>
//               )}
//             </table>
//             <TablePagination
//               rowsPerPageOptions={[10, 25, 50, 100]}
//               component='div'
//               className='border-bs'
//               count={table.getFilteredRowModel().rows.length}
//               rowsPerPage={table.getState().pagination.pageSize}
//               page={table.getState().pagination.pageIndex}
//               SelectProps={{
//                 inputProps: { 'aria-label': 'rows per page' }
//               }}
//               onPageChange={(_, page) => {
//                 table.setPageIndex(page)
//               }}
//               onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
//             />
//           </>
//         )}
//       </div>
//     </Card>
//   )
// }

// export default OrderListTable


'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'

// Icons
import { Download, PictureAsPdf, GridOn } from '@mui/icons-material'
import { AccountBalanceWallet, Receipt, Summarize, CalendarToday } from '@mui/icons-material'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import TableFilters from '../../vendors/list/TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Schedule' }
};

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')
      return
    }
    const [day, month, year] = parkedDate.split('-')
    const [timePart, ampm] = parkedTime.split(' ')
    let [hours, minutes] = timePart.split(':')
    if (ampm && ampm.toUpperCase() === 'PM' && hours !== '12') {
      hours = parseInt(hours) + 12
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === '12') {
      hours = '00'
    }
    const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = now - parkingStartTime
      if (diffMs < 0) {
        setElapsedTime('00:00:00')
        return
      }

      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60

      const formattedHours = hours.toString().padStart(2, '0')
      const formattedMinutes = minutes.toString().padStart(2, '0')
      const formattedSeconds = seconds.toString().padStart(2, '0')

      setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [parkedDate, parkedTime])

  return (
    <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
      {elapsedTime}
    </Typography>
  )
}

const calculateTotalDuration = (parkedDate, parkedTime, exitDate, exitTime) => {
  if (!parkedDate || !parkedTime || !exitDate || !exitTime) return 'N/A';

  try {
    // Parse start time
    const [startDay, startMonth, startYear] = parkedDate.split('-');
    const [startTimePart, startAmpm] = parkedTime.split(' ');
    let [startHours, startMinutes] = startTimePart.split(':').map(Number);

    // Convert to 24-hour format
    if (startAmpm && startAmpm.toUpperCase() === 'PM' && startHours !== '12') {
      startHours += 12;
    } else if (startAmpm && startAmpm.toUpperCase() === 'AM' && startHours === '12') {
      startHours = 0;
    }

    // Parse end time
    const [endDay, endMonth, endYear] = exitDate.split('-');
    const [endTimePart, endAmpm] = exitTime.split(' ');
    let [endHours, endMinutes] = endTimePart.split(':').map(Number);

    // Convert to 24-hour format
    if (endAmpm && endAmpm.toUpperCase() === 'PM' && endHours !== '12') {
      endHours += 12;
    } else if (endAmpm && endAmpm.toUpperCase() === 'AM' && endHours === '12') {
      endHours = 0;
    }

    // Create Date objects
    const startTime = new Date(
      parseInt(startYear),
      parseInt(startMonth) - 1,
      parseInt(startDay),
      startHours,
      startMinutes
    );

    const endTime = new Date(
      parseInt(endYear),
      parseInt(endMonth) - 1,
      parseInt(endDay),
      endHours,
      endMinutes
    );

    // Calculate difference in milliseconds
    const diffMs = endTime - startTime;

    if (diffMs < 0) {
      return 'Invalid time range';
    }

    // Calculate days, hours, minutes, seconds
    const diffSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSecs / (3600 * 24));
    const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    const seconds = diffSecs % 60;

    // Format the duration
    const formattedDays = days > 0 ? `${days}d ` : '';
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedDays}${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`;
  } catch (e) {
    console.error("Error calculating duration:", e);
    return 'N/A';
  }
};

const columnHelper = createColumnHelper()

const BookingListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('')
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter();
  const vendorId = session?.user?.id
  const [error, setError] = useState(null)
  // Download menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  // Filter states
  const [filters, setFilters] = useState({
    vehicleType: '',
    sts: '',
    status: '',
    bookingDate: ''
  })

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${API_URL}/vendor/all-vendors`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setVendors(result.data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/vendor/bookings`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Fetched bookings:', result);

        if (result && Array.isArray(result)) {
          setData(result);
          setFilteredData(result);
        } else if (result && result.bookings && Array.isArray(result.bookings)) {
          setData(result.bookings);
          setFilteredData(result.bookings);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
    fetchData();
  }, []);

  // Apply filters whenever data, selectedVendor, or filters change
  useEffect(() => {
    const applyFilters = () => {
      let filteredResults = [...data];

      // First filter by vendor if selected
      if (selectedVendor) {
        filteredResults = filteredResults.filter(booking => booking.vendorId === selectedVendor);
      }

      // Then apply other filters
      if (filters.vehicleType) {
        filteredResults = filteredResults.filter(booking => booking.vehicleType === filters.vehicleType);
      }
      if (filters.sts) {
        filteredResults = filteredResults.filter(booking => booking.sts === filters.sts);
      }
      if (filters.status) {
        filteredResults = filteredResults.filter(booking => booking.status === filters.status);
      }
      if (filters.bookingDate) {
        // Normalize the filter date to DD-MM-YYYY format
        const normalizedFilterDate = filters.bookingDate;

        filteredResults = filteredResults.filter(booking => {
          // Ensure booking date is in DD-MM-YYYY format
          const bookingDate = booking.bookingDate; // Assuming it's already in DD-MM-YYYY format

          // Compare dates directly after normalizing both to same format
          return bookingDate === normalizedFilterDate;
        });
      }

      setFilteredData(filteredResults.length > 0 ? filteredResults : []);
    };

    applyFilters();
  }, [data, selectedVendor, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVendorChange = (value) => {
    setSelectedVendor(value);
    // Reset other filters when vendor changes
    setFilters({
      vehicleType: '',
      sts: '',
      status: '',
      bookingDate: ''
    });
  };

  // Download menu handlers
  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    // Get data filtered by ALL current filters (vendor + date + others)
    const filteredByVendor = selectedVendor
      ? data.filter(booking => booking.vendorId === selectedVendor)
      : data;

    const filteredByAll = filteredByVendor.filter(booking => {
      // Apply date filter if present
      if (filters.bookingDate && booking.bookingDate !== filters.bookingDate) {
        return false;
      }
      // Apply other filters if present
      if (filters.vehicleType && booking.vehicleType !== filters.vehicleType) {
        return false;
      }
      if (filters.sts && booking.sts !== filters.sts) {
        return false;
      }
      if (filters.status && booking.status !== filters.status) {
        return false;
      }
      return true;
    });

    if (!filteredByAll || filteredByAll.length === 0) {
      alert('No data to export with current filters');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    const headers = [
      'S.No',
      'Vendor Name',
      'Customer',
      'Vehicle Type',
      'Vehicle Number',
      'Booking Type',
      'Booking Date & Time',
      'Parking Entry Date & Time',
      'Exit Date & Time',
      'Payable Time',
      'Duration',
      'Charges',
      'Handling Fee',
      'GST',
      'Total',
      'Status'
    ];

    csvContent += headers.join(",") + "\r\n";

    filteredByAll.forEach((row, index) => {
      let duration = '';
      if (row.status?.toLowerCase() === 'completed') {
        duration = calculateTotalDuration(
          row.parkedDate,
          row.parkedTime,
          row.exitvehicledate,
          row.exitvehicletime
        );
      }

      // Find vendor name
      const vendor = vendors.find(v => v._id === row.vendorId) || {};

      const rowData = [
        index + 1,
        `"${vendor.vendorName || row.vendorName || 'N/A'}"`,
        `"${row.personName || 'N/A'}"`,
        `"${row.vehicleType || 'N/A'}"`,
        `"${row.vehicleNumber || 'N/A'}"`,
        `"${stsChipColor[row.sts?.toLowerCase()]?.text || row.sts || 'N/A'}"`,
        `"${row.bookingDate || 'N/A'}, ${row.bookingTime || 'N/A'}"`,
        `"${row.parkedDate || 'N/A'}, ${row.parkedTime || 'N/A'}"`,
        `"${row.exitvehicledate || 'N/A'}, ${row.exitvehicletime || 'N/A'}"`,
        `"${row.hour || 'N/A'}"`,
        `"${duration}"`,
        `"${row.amount || 'N/A'}"`,
        `"${row.handlingfee || '0'}"`,
        `"${row.gstamout || '0'}"`,
        `"${row.totalamout || '0'}"`,
        `"${row.status || 'N/A'}"`
      ];
      csvContent += rowData.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const vendorName = selectedVendor
      ? vendors.find(v => v._id === selectedVendor)?.vendorName
      : 'all_vendors';
    const fileName = `bookings_${vendorName}_${filters.bookingDate || 'all_dates'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleDownloadClose();
  };

  const exportToPDF = () => {
    // Get data filtered by ALL current filters (vendor + date + others)
    const filteredByVendor = selectedVendor
      ? data.filter(booking => booking.vendorId === selectedVendor)
      : data;

    const filteredByAll = filteredByVendor.filter(booking => {
      // Apply date filter if present
      if (filters.bookingDate && booking.bookingDate !== filters.bookingDate) {
        return false;
      }
      // Apply other filters if present
      if (filters.vehicleType && booking.vehicleType !== filters.vehicleType) {
        return false;
      }
      if (filters.sts && booking.sts !== filters.sts) {
        return false;
      }
      if (filters.status && booking.status !== filters.status) {
        return false;
      }
      return true;
    });

    if (!filteredByAll || filteredByAll.length === 0) {
      alert('No data to export with current filters');
      return;
    }

    const vendorName = selectedVendor
      ? vendors.find(v => v._id === selectedVendor)?.vendorName
      : 'All Vendors';

    // Calculate total amount
    const totalAmount = filteredByAll.reduce((sum, booking) => {
      return sum + (parseFloat(booking.totalamout) || 0);
    }, 0);

    const printContent = `
      <html>
        <head>
          <title>Bookings Report</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-amount { font-weight: bold; margin-top: 20px; }
            .filter-info { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Bookings Report</h1>
          <div class="filter-info">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Vendor:</strong> ${vendorName}</p>
            ${filters.bookingDate ? `<p><strong>Booking Date:</strong> ${filters.bookingDate}</p>` : ''}
            ${filters.vehicleType ? `<p><strong>Vehicle Type:</strong> ${filters.vehicleType}</p>` : ''}
            ${filters.sts ? `<p><strong>Booking Type:</strong> ${filters.sts}</p>` : ''}
            ${filters.status ? `<p><strong>Status:</strong> ${filters.status}</p>` : ''}
            <p><strong>Total Bookings:</strong> ${filteredByAll.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Vendor Name</th>
                <th>Customer</th>
                <th>Vehicle Type</th>
                <th>Vehicle Number</th>
                <th>Booking Type</th>
                <th>Booking Date & Time</th>
                <th>Parking Entry Date & Time</th>
                <th>Exit Date & Time</th>
                <th>Payable Time</th>
                <th>Duration</th>
                <th>Charges</th>
                <th>Handling Fee</th>
                <th>GST</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredByAll.map((booking, index) => {
      let duration = '';
      if (booking.status?.toLowerCase() === 'completed') {
        duration = calculateTotalDuration(
          booking.parkedDate,
          booking.parkedTime,
          booking.exitvehicledate,
          booking.exitvehicletime
        );
      }

      // Find vendor name
      const vendor = vendors.find(v => v._id === booking.vendorId) || {};

      return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${vendor.vendorName || booking.vendorName || 'N/A'}</td>
                    <td>${booking.personName || 'N/A'}</td>
                    <td>${booking.vehicleType || 'N/A'}</td>
                    <td>${booking.vehicleNumber || 'N/A'}</td>
                    <td>${stsChipColor[booking.sts?.toLowerCase()]?.text || booking.sts || 'N/A'}</td>
                    <td>${booking.bookingDate || 'N/A'}, ${booking.bookingTime || 'N/A'}</td>
                    <td>${booking.parkedDate || 'N/A'}, ${booking.parkedTime || 'N/A'}</td>
                    <td>${booking.exitvehicledate || 'N/A'}, ${booking.exitvehicletime || 'N/A'}</td>
                    <td>${booking.hour || 'N/A'}</td>
                    <td>${duration}</td>
                    <td>${booking.amount || 'N/A'}</td>
                    <td>${booking.handlingfee || '0'}</td>
                    <td>${booking.gstamout || '0'}</td>
                    <td>${booking.totalamout || '0'}</td>
                    <td>${booking.status || 'N/A'}</td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
          
          <div class="total-amount">
            Total Amount: ₹${totalAmount.toLocaleString()}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);

    handleDownloadClose();
  };

  const columns = useMemo(
    () => [
      {
        id: 'serialNumber',
        header: 'S.No',
        cell: ({ row }) => (
          <Typography>
            {row.index + 1}
          </Typography>
        )
      },
      columnHelper.accessor('vendorName', {
        header: 'Vendor Name',
        cell: ({ row }) => {
          const vendor = vendors.find(v => v._id === row.original.vendorId) || {};
          return (
            <Typography>
              {vendor.vendorName || row.original.vendorName || 'N/A'}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CustomAvatar src="/images/avatars/1.png" skin='light' size={34} />
            <div className="flex flex-col">
              <Typography className="font-medium">{row.original.personName}</Typography>
              <Typography variant="body2">{row.original.mobileNumber}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: ({ row }) => {
          const vehicleType = row.original.vehicleType?.toLowerCase();

          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' },
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
            default: { icon: 'ri-roadster-fill', color: '#282a42' }
          };

          const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.vehicleType}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('vehicleNumber', {
        header: 'Vehicle Number',
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber}</Typography>
      }),
      columnHelper.accessor('sts', {
        header: 'Booking Type',
        cell: ({ row }) => {
          const stsKey = row.original.sts?.toLowerCase();
          const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts };

          return (
            <Typography
              sx={{ color: chipData.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
              {chipData.text}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('bookingDateTime', {
        header: 'Booking Date & Time',
        cell: ({ row }) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'Invalid Date';
            const [day, month, year] = dateStr.split('-');
            return `${day}/${month}/${year}`; // Format as DD/MM/YYYY
          };

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line text-[26px]" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDate(row.original.bookingDate)}, ${row.original.bookingTime}`}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('parkingEntryDateTime', {
        header: 'Parking Entry Date & Time',
        cell: ({ row }) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const [day, month, year] = dateStr.split('-');
            return `${day}/${month}/${year}`;
          };

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-check-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {row.original.parkedDate && row.original.parkedTime
                ? `${formatDate(row.original.parkedDate)}, ${row.original.parkedTime}`
                : 'N/A'}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('exitDateTime', {
        header: 'Exit Date & Time',
        cell: ({ row }) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const [day, month, year] = dateStr.split('-');
            return `${day}/${month}/${year}`;
          };

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-close-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {row.original.exitvehicledate && row.original.exitvehicletime
                ? `${formatDate(row.original.exitvehicledate)}, ${row.original.exitvehicletime}`
                : 'N/A'}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('payableTime', {
        header: 'Payable Time',
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();

          // Only show for parked status
          if (status === 'parked') {
            return (
              <div className="flex items-center gap-2">
                <i className="ri-time-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
                <PayableTimeTimer
                  parkedDate={row.original.parkedDate}
                  parkedTime={row.original.parkedTime}
                />
              </div>
            );
          }

          return (
            <Typography>
              {row.original.hour || 'N/A'}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('duration', {
        header: 'Duration',
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();

          // Only show duration for completed bookings
          if (status === 'completed') {
            const duration = calculateTotalDuration(
              row.original.parkedDate,
              row.original.parkedTime,
              row.original.exitvehicledate,
              row.original.exitvehicletime
            );

            return (
              <Typography sx={{ fontWeight: 500, color: '#666CFF' }}>
                {duration}
              </Typography>
            );
          }

          return 'N/A';
        }
      }),
      columnHelper.accessor('charges', {
        header: 'Charges',
        cell: ({ row }) => (
          <Typography sx={{ fontWeight: 500, color: '#666CFF' }}>
            {row.original.amount ? `₹${row.original.amount}` : 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('handlingFee', {
        header: 'Handling Fee',
        cell: ({ row }) => (
          <Typography>
            {row.original.handlingfee ? `₹${row.original.handlingfee}` : '₹0'}
          </Typography>
        )
      }),
      columnHelper.accessor('gst', {
        header: 'GST',
        cell: ({ row }) => (
          <Typography>
            {row.original.gstamout ? `₹${row.original.gstamout}` : '₹0'}
          </Typography>
        )
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: ({ row }) => (
          <Typography sx={{ fontWeight: 500, color: '#666CFF' }}>
            {row.original.totalamout ? `₹${row.original.totalamout}` : '₹0'}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusKey = row.original.status?.toLowerCase();
          const chipData = statusChipColor[statusKey] || { color: 'default' };

          return (
            <Chip
              label={row.original.status}
              variant="tonal"
              size="small"
              sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
              color={!chipData.color.startsWith('#') ? chipData.color : undefined}
            />
          );
        }
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center' onClick={(e) => e.stopPropagation()}>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-[22px]'
              options={[
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: {
                    onClick: async (e) => {
                      e.stopPropagation();
                      try {
                        const selectedId = row.original._id;
                        if (!selectedId) {
                          console.error('⚠️ Booking ID is missing!');
                          return;
                        }
                        const isConfirmed = window.confirm("Are you sure you want to delete this booking?");
                        if (!isConfirmed) return;

                        const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
                          method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('Failed to delete booking');

                        setData(prevData => prevData.filter(booking => booking._id !== selectedId));
                      } catch (error) {
                        console.error('Error deleting booking:', error);
                      }
                    },
                    className: 'flex items-center gap-2 pli-4'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, filteredData, vendors]
  );

  const table = useReactTable({
    data: filteredData.length > 0 || globalFilter ? filteredData : data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <Card>
      <CardHeader title='Filters' />
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <FormControl fullWidth size='small' sx={{ maxWidth: 550 }}>
            <InputLabel id='vendor-select-label'>Vendor</InputLabel>
            <Select
              labelId='vendor-select-label'
              id='vendor-select'
              value={selectedVendor}
              label='Vendor'
              onChange={(e) => handleVendorChange(e.target.value)}
              sx={{
                minWidth: 200,
                height: 53,
                '& .MuiSelect-select': {
                  paddingTop: '12px',
                  paddingBottom: '12px'
                }
              }}
            >
              <MenuItem value=''>
                <em>All Vendors</em>
              </MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor._id} value={vendor._id}>
                  {vendor.vendorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TableFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            bookingData={selectedVendor ? data.filter(booking => booking.vendorId === selectedVendor) : data}
          />
        </div>
      </CardContent>
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Booking'
          className='sm:is-auto'
        />

        <div className="flex gap-2">
          <Button
            variant='outlined'
            startIcon={<Download />}
            onClick={handleDownloadClick}
          >
            Download
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleDownloadClose}
          >
            <MenuItem onClick={exportToExcel}>
              <ListItemIcon>
                <GridOn fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <ListItemIcon>
                <PictureAsPdf fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export to PDF</ListItemText>
            </MenuItem>
          </Menu>

          <Button
            variant='contained'
            component={Link}
            href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
            startIcon={<i className='ri-add-line' />}
            className='max-sm:is-full is-auto'
          >
            New Booking
          </Button>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity="error" className="m-4">
            Error loading data. Please try again.
          </Alert>
        ) : (
          <>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data found matching your filters
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <tr
                          key={row.id}
                          className={classnames({ selected: row.getIsSelected() })}
                          onClick={() => {
                            const selectedId = row.original._id;
                            if (selectedId) {
                              router.push(`/pages/bookingdetails/${selectedId}`);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component='div'
              className='border-bs'
              count={table.getFilteredRowModel().rows.length}
              rowsPerPage={table.getState().pagination.pageSize}
              page={table.getState().pagination.pageIndex}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' }
              }}
              onPageChange={(_, page) => {
                table.setPageIndex(page)
              }}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          </>
        )}
      </div>
    </Card>
  )
}

export default BookingListTable
