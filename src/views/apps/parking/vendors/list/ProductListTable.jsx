'use client'

// React Imports
import React from 'react';
import { Fragment } from 'react';

import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'

import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// Next Imports
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
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import { DataGrid } from "@mui/x-data-grid";
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

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
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import ChatIcon from '@mui/icons-material/Chat'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'
import ContactsIcon from '@mui/icons-material/Contacts'
import SubscriptionsIcon from '@mui/icons-material/Subscriptions'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import axios from 'axios'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Style Imports
import tableStyles from '@core/styles/table.module.css'

import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'

// Status color mapping for vendor status
export const statusChipColor = {
  approved: { color: 'success' },
  pending: { color: 'warning' },
  rejected: { color: 'error' },
  suspended: { color: '#666CFF' }
};

// Place type icon mapping
export const placeTypeIcons = {
  mall: { icon: 'ri-store-3-line', color: '#ff4d49' },
  apartment: { icon: 'ri-building-line', color: '#72e128' },
  commercial: { icon: 'ri-building-4-line', color: '#fdb528' },
  hospital: { icon: 'ri-hospital-line', color: '#00cfe8' },
  default: { icon: 'ri-map-pin-line', color: '#282a42' }
};

// Day name mapping
const dayNames = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday"
};

// Format time from 24h to 12h format
const formatTime = (time) => {
  if (!time) return 'Closed';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minutes} ${period}`;
};

// Vendor Detail Modal Component
const VendorDetailModal = ({ open, handleClose, vendorId }) => {
  const [vendorData, setVendorData] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();
  const { lang: locale } = useParams();
  const [amenities, setAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [parkingServices, setParkingServies] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportRequestsLoading, setSupportRequestsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [bookingTransactions, setBookingTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const [transactionDates, setTransactionDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [charges, setCharges] = useState({});
  const [chargesLoading, setChargesLoading] = useState(false);


  // Day name mapping - Changed from object to array for better ordering
  const dayNames = [
    "Monday",    // 0
    "Tuesday",   // 1
    "Wednesday", // 2
    "Thursday",  // 3
    "Friday",    // 4
    "Saturday",  // 5
    "Sunday"     // 6
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (!vendorId || !open) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/vendor/fetch-vendor-data?id=${vendorId}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        setVendorData(data.data);
      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
        setError(err.message || "Failed to fetch vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [vendorId, open]);

  // Fetch business hours - Updated to match the expected API response structure
  useEffect(() => {
    const fetchBusinessHours = async () => {
      if (!vendorData?.vendorId) return;

      setHoursLoading(true);

      try {
        const response = await fetch(`${API_URL}/vendor/fetchbusinesshours/${vendorData.vendorId}`);

        if (!response.ok) {
          throw new Error(`Error fetching business hours: ${response.status}`);
        }

        const data = await response.json();

        // Make sure we have the expected data structure
        if (data && data.businessHours && Array.isArray(data.businessHours)) {
          // Process the hours data to ensure it conforms to our expected format
          const processedHours = data.businessHours.map(hour => ({
            day: typeof hour.day === 'number' ? dayNames[hour.day] : hour.day,
            openTime: hour.openTime || null,
            closeTime: hour.closeTime || null,
            closed: hour.isClosed || !hour.openTime || !hour.closeTime
          }));

          // Sort by day of week to ensure consistent order
          const sortedHours = processedHours.sort((a, b) => {
            return dayNames.indexOf(a.day) - dayNames.indexOf(b.day);
          });

          setBusinessHours(sortedHours);
        } else {
          // If data structure is unexpected, log for debugging
          console.warn("Business hours data structure is not as expected:", data);
          setBusinessHours([]);
        }
      } catch (err) {
        console.error("Failed to fetch business hours:", err);
      } finally {
        setHoursLoading(false);
      }
    };

    fetchBusinessHours();
  }, [vendorData]);

  // Format time from 24h to 12h format
  const formatTime = (time) => {
    if (!time) return 'Closed';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${period}`;
  };


  const fetchAmenitiesData = async () => {
    if (!vendorData?.vendorId) return;

    setAmenitiesLoading(true);

    try {
      const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorData.vendorId}`);
      const data = await response.json();

      if (data?.AmenitiesData?.amenities) {
        setAmenities(data.AmenitiesData.amenities);
      }
    } catch (error) {
      console.error('Error fetching amenities data:', error);
    } finally {
      setAmenitiesLoading(false);
    }
  };

  useEffect(() => {
    if (vendorData?.vendorId) {
      fetchAmenitiesData();
    }
  }, [vendorData]);

  const fetchServiceData = async () => {
    if (!vendorData?.vendorId) return;
    setServicesLoading(true);

    try {
      const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorData.vendorId}`);
      const data = await response.json();

      if (data?.AmenitiesData?.parkingEntries) {
        setParkingServies(data.AmenitiesData.parkingEntries);
      }
    } catch (error) {
      console.error('Error fetching service data', error);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (vendorData?.vendorId) {
      fetchServiceData();
      fetchSupportRequests();
      fetchBankDetails();
      fetchMeetings();
      fetchBookingTransactions();
      fetchBookings();
      fetchChargesData();
    }
  }, [vendorData]);

  const fetchSupportRequests = async () => {
    if (!vendorData?.vendorId) return;

    setSupportRequestsLoading(true);

    try {
      const response = await fetch(`${API_URL}/vendor/gethelpvendor/${vendorData.vendorId}`);
      const data = await response.json();

      if (data?.helpRequests) {
        setSupportRequests(Array.isArray(data.helpRequests) ? data.helpRequests : []);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
    } finally {
      setSupportRequestsLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    if (!vendorData?.vendorId) return;

    setBankDetailsLoading(true);

    try {
      const response = await fetch(`${API_URL}/vendor/getbankdetails/${vendorData.vendorId}`);
      const data = await response.json();

      if (data?.data && data.data.length > 0) {
        setBankDetails(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const fetchMeetings = async () => {
    if (!vendorData?.vendorId) return;

    setMeetingsLoading(true);

    try {
      const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorData.vendorId}`);

      if (response.data?.meetings) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const fetchBookingTransactions = async () => {
    if (!vendorData?.vendorId) return;

    setTransactionsLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/vendor/fetchbookingtransaction/${vendorData.vendorId}?startDate=${transactionDates.start}&endDate=${transactionDates.end}`
      );

      if (response.data?.data?.bookings) {
        const formattedTransactions = response.data.data.bookings.map((item, index) => ({
          id: item._id,
          serialNo: index + 1,
          bookingId: item._id,
          bookingAmount: `₹${item.amount}`,
          platformFee: `₹${item.platformfee}`,
          receivable: `₹${item.receivableAmount}`,
        }));

        setBookingTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error fetching booking transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!vendorData?.vendorId) return;

    setBookingsLoading(true);

    try {
      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorData.vendorId}`);
      const data = await response.json();

      if (data?.bookings) {
        // Sort bookings by date (newest first)
        const sortedBookings = data.bookings.sort((a, b) => {
          const dateA = new Date(a.bookingDate).getTime();
          const dateB = new Date(b.bookingDate).getTime();


          return dateB - dateA;
        });

        setBookings(sortedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchChargesData = async () => {
    if (!vendorData?.vendorId) return;

    setChargesLoading(true);

    try {
      console.log(`Fetching charges from: ${API_URL}/vendor/getchargesdata/${vendorData.vendorId}`);

      const response = await fetch(`${API_URL}/vendor/getchargesdata/${vendorData.vendorId}`);
      const data = await response.json();

      console.log('Charges API response:', data);

      if (!data || !data.vendor) {
        throw new Error('Invalid response format');
      }

      const { vendor } = data;
      const chargesMap = {};

      vendor.charges.forEach(charge => {
        let label;

        // Case-insensitive type matching
        const typeLC = charge.type.toLowerCase();

        if (typeLC.includes('additional')) {
          label = 'Additional Hour';
        } else if (typeLC.includes('full day') || typeLC.includes('24 hour')) {
          label = 'Full Day';
        } else if (typeLC.includes('monthly')) {
          label = 'Monthly';
        } else {
          label = 'Minimum Charges';
        }

        // Create a key using category and label
        const key = `${charge.category}-${label}`;

        chargesMap[key] = {
          ...charge,
          label
        };
      });

      console.log('Mapped charges:', chargesMap);
      setCharges(chargesMap);
    } catch (error) {
      console.error('Error fetching charges data:', error);
    } finally {
      setChargesLoading(false);
    }
  };

  // Render contact information
  const renderContacts = () => {
    if (!vendorData?.contacts || vendorData.contacts.length === 0) {
      return <Typography>No contact information available</Typography>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        {vendorData.contacts.map((contact, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
            <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
            <Typography variant="body2">Mobile: {contact.mobile}</Typography>
            {contact.email && <Typography variant="body2">Email: {contact.email}</Typography>}
            {contact.designation && <Typography variant="body2">Role: {contact.designation}</Typography>}
          </Paper>
        ))}
      </Box>
    );
  };

  // Render subscription information
  const renderSubscription = () => {
    if (!vendorData) return null;

    const isSubscribed = vendorData.subscription === "true";

    const endDate = vendorData.subscriptionenddate
      ? new Date(vendorData.subscriptionenddate).toLocaleDateString()
      : 'N/A';

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold">Subscription Status</Typography>
          <Chip
            label={isSubscribed ? "Active" : "Inactive"}
            variant="filled"
            size="small"
            color={isSubscribed ? "success" : "default"}
            sx={{ mt: 1, mb: 1 }}
          />
          {isSubscribed && (
            <>
              <Typography variant="body2">Days Remaining: {vendorData.subscriptionleft || 0}</Typography>
              <Typography variant="body2">End Date: {endDate}</Typography>
              {vendorData.subscriptionplan && (
                <Typography variant="body2">Plan: {vendorData.subscriptionplan}</Typography>
              )}
              {vendorData.trial === "true" && (
                <Chip label="Trial" size="small" color="info" sx={{ mt: 1 }} />
              )}
              {vendorData.platformfee && (
                <Typography variant="body2" sx={{ mt: 1 }}>Platform Fee: {vendorData.platformfee}</Typography>
              )}
            </>
          )}
        </Paper>
      </Box>
    );
  };

  // Render parking information
  const renderParking = () => {
    if (!vendorData?.parkingEntries || vendorData.parkingEntries.length === 0) {
      return <Typography>No parking information available</Typography>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold">Parking Capacity</Typography>
          <Box sx={{ mt: 1 }}>
            {vendorData.parkingEntries.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <i
                  className={entry.type?.toLowerCase() === 'bike' ? 'ri-motorbike-fill' : 'ri-car-fill'}
                  style={{
                    fontSize: '18px',
                    color: entry.type?.toLowerCase() === 'bike' ? '#72e128' : '#ff4d49',
                    marginRight: '8px'
                  }}
                />
                <Typography variant="body1">
                  {entry.type}: <strong>{entry.count}</strong>
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  // Render business hours - Updated to handle various data structures
  const renderBusinessHours = () => {
    if (hoursLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!businessHours || businessHours.length === 0) {
      return <Alert severity="info">No business hours information available</Alert>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Day</strong></TableCell>
              <TableCell><strong>Opening Time</strong></TableCell>
              <TableCell><strong>Closing Time</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {businessHours.map((hours, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{hours.day}</TableCell>
                <TableCell>{hours.closed ? 'Closed' : formatTime(hours.openTime)}</TableCell>
                <TableCell>{hours.closed ? 'Closed' : formatTime(hours.closeTime)}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={hours.closed ? "Closed" : "Open"}
                    color={hours.closed ? "default" : "success"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render location information
  const renderLocation = () => {
    if (!vendorData) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold">Location Details</Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Address</Typography>
              <Typography variant="body1">{vendorData.address || 'N/A'}</Typography>
            </Grid>

            {vendorData.landMark && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Landmark</Typography>
                <Typography variant="body1">{vendorData.landMark}</Typography>
              </Grid>
            )}

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Latitude</Typography>
              <Typography variant="body1">{vendorData.latitude || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Longitude</Typography>
              <Typography variant="body1">{vendorData.longitude || 'N/A'}</Typography>
            </Grid>
          </Grid>

          {vendorData.latitude && vendorData.longitude && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<LocationOnIcon />}
              sx={{ mt: 2 }}
              component="a"
              href={`https://www.google.com/maps?q=${vendorData.latitude},${vendorData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </Button>
          )}
        </Paper>
      </Box>
    );
  };

  const renderAmenities = () => {
    if (amenitiesLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!amenities || amenities.length === 0) {
      return <Alert severity="info">No amenities information available</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Available Amenities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {amenities.map((amenity, index) => (
              <Chip
                key={index}
                label={amenity}
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderServicesPricing = () => {
    if (servicesLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!parkingServices || parkingServices.length === 0) {
      return <Alert severity="info">No services & pricing information available</Alert>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Service Name</strong></TableCell>
              <TableCell align="right"><strong>Price (₹)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parkingServices.map((service, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <div style={{ fontWeight: 500 }}>{service.text}</div>
                </TableCell>
                <TableCell align="right">
                  <div style={{ color: '#2196f3', fontWeight: 500 }}>
                    ₹{service.amount}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSupportRequests = () => {
    if (supportRequestsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!supportRequests || supportRequests.length === 0) {
      return <Alert severity="info">No support requests found</Alert>;
    }

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="right"><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supportRequests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{request.description}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={request.status || 'Pending'}
                    color={
                      request.status === 'resolved' ? 'success' :
                        request.status === 'closed' ? 'default' : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderBankDetails = () => {
    if (bankDetailsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!bankDetails) {
      return <Alert severity="info">No bank details found</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Bank Account Information</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">Account Number</TableCell>
                <TableCell>{bankDetails.accountnumber || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Account Holder</TableCell>
                <TableCell>{bankDetails.accountholdername || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">IFSC Code</TableCell>
                <TableCell>{bankDetails.ifsccode || 'N/A'}</TableCell>
              </TableRow>
              {/* <TableRow>
                  <TableCell component="th" scope="row">Last Updated</TableCell>
                  <TableCell>
                    {bankDetails.updatedAt ? new Date(bankDetails.updatedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow> */}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderMeetings = () => {
    if (meetingsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!meetings || meetings.length === 0) {
      return <Alert severity="info">No meeting requests found</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Advertise with us</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Mobile</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting._id}>
                  <TableCell>{meeting.name || 'N/A'}</TableCell>
                  <TableCell>{meeting.email || 'N/A'}</TableCell>
                  <TableCell>{meeting.mobile || 'N/A'}</TableCell>
                  <TableCell>{meeting.callbackTime || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderBookingTransactions = () => {
    if (transactionsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!bookingTransactions || bookingTransactions.length === 0) {
      return <Alert severity="info">No booking transactions found</Alert>;
    }

    const getTotalReceivable = () => {
      return bookingTransactions.reduce((total, transaction) => {
        const amount = parseFloat(transaction.receivable.replace("₹", "")) || 0;


        return total + amount;
      }, 0);
    };

    const columns = [
      { field: "serialNo", headerName: "S.No", width: 80 },
      { field: "bookingId", headerName: "Booking ID", width: 220 },
      { field: "bookingAmount", headerName: "Total Amount", width: 150 },
      { field: "platformFee", headerName: "Platform Fee", width: 150 },
      { field: "receivable", headerName: "Receivable", width: 150 },
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Booking Transactions</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={transactionDates.start}
            onChange={(e) => setTransactionDates({ ...transactionDates, start: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 180, mr: 2 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={transactionDates.end}
            onChange={(e) => setTransactionDates({ ...transactionDates, end: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 180, mr: 2 }}
          />
          <Button
            variant="contained"
            onClick={fetchBookingTransactions}
            sx={{ textTransform: 'none' }}
          >
            Apply Filter
          </Button>
        </Box>

        <Box sx={{
          bgcolor: '#f5f5f5',
          padding: '8px 16px',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          mb: 2,
          display: 'inline-block'
        }}>
          <Typography variant="body2" fontWeight="bold" color="#329a73">
            Total Receivable: ₹{getTotalReceivable().toFixed(2)}
          </Typography>
        </Box>

        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={bookingTransactions}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#329a73",
                color: "black",
                fontSize: '0.875rem'
              },
              borderRadius: 2,
            }}
          />
        </div>
      </Box>
    );
  };

  const renderBookings = () => {
    if (bookingsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!bookings || bookings.length === 0) {
      return <Alert severity="info">No bookings found</Alert>;
    }

    const columns = [
      {
        field: 'vehicleNumber',
        headerName: 'Vehicle Number',
        width: 150,
        renderCell: (params) => (
          <Typography style={{ color: '#329a73' }}>
            {params.value || 'N/A'}
          </Typography>
        )
      },

      {
        field: 'bookingDateTime',
        headerName: 'Booking Date & Time',
        width: '300',
        renderCell: (params) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const [day, month, year] = dateStr.split('-');

            if (!day || !month || !year) return 'Invalid Date';
            const date = new Date(`${year}- ${month}-${day}`);

            if (isNaN(date.getTime())) return 'Invalid Date';

            return date.toDateString();
          };


          return (
            <Typography>
              {formatDate(params.row.bookingDate)}, {params.row.bookingTime || 'N/A'}
            </Typography>
          );
        }
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 180,
        renderCell: (params) => {
          const statusKey = params.value?.toLowerCase();
          const chipData = statusChipColor[statusKey] || { color: 'default' };

          return (
            <Chip
              label={params.value || 'N/A'}
              variant="tonal"
              size="small"
              color={chipData.color}
            />
          );
        }
      },
      {
        field: 'sts',
        headerName: 'Booking Type',
        width: 200,
        renderCell: (params) => {
          const statusKey = params.value?.toLowerCase();
          const chipData = statusChipColor[statusKey] || { color: 'default' };

          return (
            <Chip
              label={params.value || 'N/A'}
              variant="tonal"
              size="small"
              color={chipData.color}
            />
          );
        }
      },
      {
        field: 'vehicleType',
        headerName: 'vehicle Type',
        width: 200,
        renderCell: (params) => {
          const vehicleType = params.value?.toLowerCase();

          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' },
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
            default: { icon: 'ri-roadster-fill', color: '#282a42' }
          };

          const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              <Typography>{params.value || 'N/A'}</Typography>
            </Box>
          );
        }
      },
      {
        field: 'customer',
        headerName: 'Customer',
        width: 200,
        renderCell: (params) => (
          <Box>
            <Typography fontWeight="500">{params.row.personName || 'Unknown'}</Typography>
            <Typography variant="body2">{params.row.mobileNumber || 'N/A'}</Typography>
          </Box>
        )
      },
    ];

    const rows = bookings.map(booking => ({
      id: booking._id,
      ...booking,
      bookingDateTime: `${booking.bookingDate}, ${booking.bookingTime}`
    }));

    return (
      <Box sx={{ height: 400, width: '100%', mt: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#329a73',
              color: 'black',
            },
          }}
        />
      </Box>
    );
  };


  const renderCharges = () => {
    const categories = ['Car', 'Bike', 'Others'];
    const labels = ['Minimum Charges', 'Additional Hour', 'Full Day', 'Monthly'];

    if (chargesLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (Object.keys(charges).length === 0) {
      return <Alert severity="info">No parking charges found for this vendor</Alert>;
    }

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Parking Charges
        </Typography>

        {/* Charges Table */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(charges).map((key) => {
                const charge = charges[key];


                return (
                  <TableRow
                    key={key}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {charge.category === 'Car' && <i className="ri-car-fill" style={{ color: '#ff4d49' }} />}
                        {charge.category === 'Bike' && <i className="ri-motorbike-fill" style={{ color: '#72e128' }} />}
                        {charge.category === 'Others' && <i className="ri-roadster-fill" style={{ color: '#282a42' }} />}
                        {charge.category}
                      </Box>
                    </TableCell>
                    <TableCell>{charge.label}</TableCell>
                    <TableCell>{charge.type}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium" color="primary">
                        {charge.amount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Alternative Card View */}
        <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
          Charges by Category
        </Typography>

        <Grid container spacing={2}>
          {categories.map((category) => {
            // Filter charges for this category
            const categoryCharges = Object.values(charges).filter(
              charge => charge.category === category
            );

            if (categoryCharges.length === 0) {
              return null;
            }

            return (
              <Grid item xs={12} md={4} key={category}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category === 'Car' && <i className="ri-car-fill" style={{ color: '#ff4d49' }} />}
                        {category === 'Bike' && <i className="ri-motorbike-fill" style={{ color: '#72e128' }} />}
                        {category === 'Others' && <i className="ri-roadster-fill" style={{ color: '#282a42' }} />}
                        {category}
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <Divider />
                  <CardContent sx={{ pt: 2 }}>
                    <List dense>
                      {categoryCharges.map((charge, index) => (
                        <React.Fragment key={`${charge.category}-${charge.type}`}>
                          <ListItem
                            secondaryAction={
                              <Chip
                                label={`₹${charge.amount}`}
                                color="primary"
                                size="small"
                                variant="tonal"
                              />
                            }
                          >
                            <ListItemIcon sx={{ minWidth: '36px' }}>
                              <i className="ri-time-line" />
                            </ListItemIcon>
                            <ListItemText
                              primary={charge.label}
                              secondary={charge.type}
                            />
                          </ListItem>
                          {index < categoryCharges.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderPayout = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Payout
        </Typography>

        {/* Dummy Header Table */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Booking Id</TableCell>
                <TableCell>Total (₹)</TableCell>
                <TableCell>Platform Fee (₹)</TableCell>
                <TableCell>Receivable (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Empty for now; just a dummy header */}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };


  const handleEditProfile = () => {
    if (vendorId) {
      router.push(getLocalizedUrl(`/pages/vendordetails/${vendorId}`, locale))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg" // Changed from "md" to "lg" to increase the width
      fullWidth
    >
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEditProfile}
          sx={{ mr: 2 }}
        >
          Edit Profile
        </Button>
        {/* <Button onClick={handleClose} color="primary">Close</Button> */}
      </DialogActions>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Vendor Details
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : vendorData ? (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              {vendorData.image ? (
                <img
                  src={vendorData.image}
                  alt={vendorData.vendorName}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <CustomAvatar skin='light' size={64}>
                  {getInitials(vendorData.vendorName || '')}
                </CustomAvatar>
              )}
              <Box>
                <Typography variant="h6">{vendorData.vendorName}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={vendorData.status || 'Pending'}
                    variant="filled"
                    size="small"
                    color={
                      vendorData.status === 'approved' ? 'success' :
                        vendorData.status === 'rejected' ? 'error' :
                          vendorData.status === 'suspended' ? 'default' : 'warning'
                    }
                  />
                  <Chip
                    label={`ID: ${vendorData.vendorId}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="vendor details tabs"
              sx={{ mb: 2 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<InfoIcon fontSize="small" />} iconPosition="start" label="Basic Info" />
              <Tab icon={<ContactsIcon fontSize="small" />} iconPosition="start" label="Contacts" />
              <Tab icon={<LocationOnIcon fontSize="small" />} iconPosition="start" label="Location" />
              <Tab icon={<AccessTimeIcon fontSize="small" />} iconPosition="start" label="Business Hours" />
              <Tab icon={<DirectionsCarIcon fontSize="small" />} iconPosition="start" label="Parking Entries" />
              <Tab icon={<SubscriptionsIcon fontSize="small" />} iconPosition="start" label="Premium Package" />
              <Tab icon={<i className="ri-list-check" />} iconPosition='start' label="Amenities" />
              <Tab icon={<MonetizationOnIcon fontSize="small" />} iconPosition="start" label="Services & Pricing" />
              <Tab icon={<ChatIcon fontSize="small" />} iconPosition="start" label="Support Requests" />
              <Tab icon={<i className="ri-bank-line" />} iconPosition="start" label="Bank Details" />
              <Tab icon={<i className="ri-calendar-line" />} iconPosition="start" label="Advertise With Us" />
              <Tab icon={<i className="ri-money-dollar-circle-line" />} iconPosition="start" label="Booking Transactions" />
              <Tab icon={<i className="ri-car-line" />} iconPosition="start" label="Bookings" />
              <Tab icon={<i className="ri-money-dollar-circle-line" />} iconPosition="start" label="Parking Charges" />
              <Tab icon={<i className="ri-money-dollar-circle-line" />} iconPosition="start" label="Payout" />

            </Tabs>

            {/* Basic Info Tab */}
            {tabValue === 0 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Vendor ID</Typography>
                    <Typography variant="body1">#{vendorData.vendorId || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Space ID</Typography>
                    <Typography variant="body1">{vendorData.spaceid || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Creation Date</Typography>
                    <Typography variant="body1">
                      {vendorData.createdAt ? new Date(vendorData.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {vendorData.updatedAt ? new Date(vendorData.updatedAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  {vendorData.email && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{vendorData.email}</Typography>
                    </Grid>
                  )}
                  {vendorData.mobile && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                      <Typography variant="body1">{vendorData.mobile}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{vendorData.status || 'Pending'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">MongoDB ID</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{vendorData._id || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Contacts Tab */}
            {tabValue === 1 && renderContacts()}

            {/* Location Tab */}
            {tabValue === 2 && renderLocation()}

            {/* Business Hours Tab */}
            {tabValue === 3 && renderBusinessHours()}

            {/* Parking Tab */}
            {tabValue === 4 && renderParking()}

            {/* Subscription Tab */}
            {tabValue === 5 && renderSubscription()}

            {tabValue === 6 && renderAmenities()}

            {tabValue === 7 && renderServicesPricing()}

            {tabValue === 8 && renderSupportRequests()}

            {tabValue === 9 && renderBankDetails()}

            {tabValue === 10 && renderMeetings()}

            {tabValue === 11 && renderBookingTransactions()}

            {tabValue === 12 && renderBookings()}

            {tabValue === 13 && renderCharges()}

            {tabValue === 14 && renderPayout()}
          </>
        ) : (
          <Typography>No vendor data available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
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
  }, [value, debounce, onChange])

  return (
    <TextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      size="small"
    />
  );
};

const columnHelper = createColumnHelper()

const VendorListTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [vendorLoading, setVendorLoading] = useState({});
  const [vendorStatusMap, setVendorStatusMap] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenModal = (vendorId) => {
    setSelectedVendorId(vendorId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };



  const handleDisplaySubscribers = (vendorId) => {
    router.push(`/en/pages/mysubscribers?id=${vendorId}`)
  }

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendor/all-vendors`)
      const result = await response.json()

      if (result && result.data) {
        setData(result.data)
        setFilteredData(result.data)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Function to update vendor status
  const updateVendorStatus = async (vendorId, newStatus) => {
    setVendorLoading(prev => ({ ...prev, [vendorId]: true }));

    try {
      const endpoint = newStatus === 'approved'
        ? `${API_URL}/vendor/approve/${vendorId}`
        : `${API_URL}/vendor/updateStatus/${vendorId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update vendor status');

      setVendorStatusMap(prev => ({ ...prev, [vendorId]: newStatus }));

      return true;
    } catch (error) {
      console.error('Error updating vendor status:', error);

      return false;
    } finally {
      setVendorLoading(prev => ({ ...prev, [vendorId]: false }));
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('vendorId', {
        header: 'Vendor ID',
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vendorId}</Typography>
      }),
      columnHelper.accessor('vendorName', {
        header: 'Vendor Name',
        cell: ({ row }) => {
          const vendor = row.original;
          const imgSrc = vendor.image || "https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png";

          return (
            <div className="flex items-center gap-3">
              {vendor.image ? (
                <img
                  src={imgSrc}
                  alt="Vendor Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <CustomAvatar skin='light' size={34}>
                  {getInitials(vendor.vendorName)}
                </CustomAvatar>
              )}

              <div className="flex flex-col">
                <Typography className="font-medium">{vendor.vendorName}</Typography>
                <Typography variant="body2">{vendor.spaceid}</Typography>
              </div>
            </div>
          );
        }
      }),
      columnHelper.accessor('contacts', {
        header: 'Contact Info',
        cell: ({ row }) => {
          const contacts = row.original.contacts || [];
          const primaryContact = contacts[0] || { name: 'N/A', mobile: 'N/A' };

          return (
            <div className="flex flex-col">
              <Typography className="font-medium">{primaryContact.name}</Typography>
              <Typography variant="body2">{primaryContact.mobile}</Typography>
              {contacts.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  +{contacts.length - 1} more contacts
                </Typography>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: ({ row }) => {
          const placeType = row.original.address?.toLowerCase() || 'default';
          const { icon, color } = placeTypeIcons[placeType] || placeTypeIcons.default;

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.address || 'Unknown'}
            </Typography>
          );
        }
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const vendorId = row.original._id;
          const isLoading = vendorLoading[vendorId] || false;
          const currentStatus = vendorStatusMap[vendorId] || row.original.status || 'pending';

          const toggleStatus = async () => {
            if (isLoading || currentStatus !== 'pending') return;

            const success = await updateVendorStatus(vendorId, 'approved');

            if (!success) {
              // Optional: rollback or show toast
            }
          };

          const chipStyles = {
            backgroundColor: currentStatus === 'pending' ? '#ff4d4f' : '#52c41a',
            color: 'white',
            cursor: currentStatus === 'pending' ? 'pointer' : 'default',
            opacity: isLoading ? 0.7 : 1,
            '&:hover': currentStatus === 'pending' ? {
              backgroundColor: '#ff7875',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            } : {}
          };

          const chip = (
            <Chip
              label={isLoading ? '...' : (currentStatus || 'Pending')}
              variant="tonal"
              size="small"
              sx={chipStyles}
              onClick={currentStatus === 'pending' ? toggleStatus : undefined}
            />
          );

          return currentStatus === 'pending' ? (
            <Tooltip title="Click to approve">{chip}</Tooltip>
          ) : chip;
        }
      }),

      columnHelper.accessor('subscription', {
        header: 'Subscription',
        cell: ({ row }) => {
          const isSubscribed = row.original.subscription === "true";
          const daysLeft = row.original.subscriptionleft || "0";

          const endDate = row.original.subscriptionenddate
            ? new Date(row.original.subscriptionenddate).toLocaleDateString()
            : 'N/A';

          return (
            <div className="flex flex-col">
              <Chip
                label={isSubscribed ? "Active" : "Inactive"}
                variant="tonal"
                size="small"
                color={isSubscribed ? "success" : "default"}
              />
              {isSubscribed && (
                <Typography variant="caption">
                  {daysLeft} days left • Ends: {endDate}
                </Typography>
              )}
            </div>
          );
        }
      }),
      columnHelper.accessor('parkingEntries', {
        header: 'Parking Capacity',
        cell: ({ row }) => {
          const parkingEntries = row.original.parkingEntries || [];

          if (parkingEntries.length === 0) {
            return <Typography variant="body2">No entries</Typography>;
          }

          return (
            <div className="flex flex-col gap-1">
              {parkingEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <i className={entry.type?.toLowerCase() === 'bike' ? 'ri-motorbike-fill' : 'ri-car-fill'}
                    style={{ fontSize: '14px', color: entry.type?.toLowerCase() === 'bike' ? '#72e128' : '#ff4d49' }}></i>
                  <Typography variant="body2">
                    {entry.type}: <strong>{entry.count}</strong>
                  </Typography>
                </div>
              ))}
            </div>
          );
        }
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => {
          // State for delete confirmation dialog
          const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
          const [deleteLoading, setDeleteLoading] = useState(false);

          // Function to delete vendor
          const handleDeleteVendor = async () => {
            try {
              setDeleteLoading(true);

              const response = await fetch(`${API_URL}/admin/deletevendor/${row.original.vendorId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete vendor');
              }

              // Close dialog and refresh vendor list
              setDeleteDialogOpen(false);
              fetchVendors(); // Call the fetchVendors function to refresh the list

            } catch (error) {
              console.error('Error deleting vendor:', error);

              // You could add a toast notification here
            } finally {
              setDeleteLoading(false);
            }
          };

          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={() => handleDisplaySubscribers(row.original._id)}
              >
               View Subscriptions
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={() => handleOpenModal(row.original._id)}
              >
                View
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>

              {/* Delete Confirmation Dialog */}
              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
              >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to delete vendor <strong>{row.original.vendorName}</strong> (ID: {row.original.vendorId})?
                    This action cannot be undone.
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setDeleteDialogOpen(false)}
                    color="primary"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteVendor}
                    color="error"
                    variant="contained"
                    disabled={deleteLoading}
                    startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          );
        }
      })
    ],
    [data, filteredData, vendorLoading, vendorStatusMap]
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

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    handleExportClose();

    // Get the data to export (filtered if search is active, otherwise all data)
    const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

    // Create CSV headers
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Contact Name',
      'Contact Mobile',
      'Address',
      'Status',
      'Subscription Status',
      'Subscription End Date',
      'Parking Capacity'
    ];

    // Create CSV rows
    const rows = exportData.map(vendor => {
      const primaryContact = vendor.contacts?.[0] || {};
      const parkingEntries = vendor.parkingEntries?.map(entry => `${entry.type}:${entry.count}`).join(', ') || '';

      return [
        vendor.vendorId,
        `"${vendor.vendorName || ''}"`,
        `"${primaryContact.name || ''}"`,
        primaryContact.mobile || '',
        `"${vendor.address || ''}"`,
        vendor.status || '',
        vendor.subscription === "true" ? "Active" : "Inactive",
        vendor.subscriptionenddate || '',
        `"${parkingEntries}"`
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `vendors_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    handleExportClose();

    // Create a new window with the content to print
    const printWindow = window.open('', '_blank');

    // Get the data to export (filtered if search is active, otherwise all data)
    const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

    // Create the HTML content with print-specific styles
    printWindow.document.write(`
    <html>
      <head>
        <title>Vendors Export</title>
        <style>
          @media print {
            body { font-family: Arial, sans-serif; margin: 1cm; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f2f2f2; text-align: left; padding: 8px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.8em; color: #666; }
            @page { size: A4 landscape; margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <h1>Vendors Export</h1>
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Vendor Name</th>
              <th>Contact</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Subscription</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.map(vendor => {
      const primaryContact = vendor.contacts?.[0] || {};


      return `
                <tr>
                  <td>${vendor.vendorId}</td>
                  <td>${vendor.vendorName || 'N/A'}</td>
                  <td>${primaryContact.name || 'N/A'}</td>
                  <td>${primaryContact.mobile || 'N/A'}</td>
                  <td>${vendor.status || 'N/A'}</td>
                  <td>${vendor.subscription === "true" ? "Active" : "Inactive"}</td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
        <div class="footer">
          Generated on ${new Date().toLocaleString()} | Total Vendors: ${exportData.length}
        </div>
        <script>
          // Automatically trigger print when the window loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 200);
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };


  return (
    <Card>
      <CardHeader title="Vendor Management" />
      <Divider />
      <CardContent className="flex justify-between items-center gap-4 max-sm:flex-col">
        {/* Search Input (Left Side) */}
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search Vendors"
          className="sm:is-auto"
        />

        {/* Buttons (Right Side - Add Vendor + Export) */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Add Vendor Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push(getLocalizedUrl('/pages/vendoradd', locale))}
          >
            Add Vendor
          </Button>

          {/* Export Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<i className="ri-download-line" />}
            onClick={handleExportClick}
          >
            Download
          </Button>

          {/* Export Menu (CSV/PDF) */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={exportToCSV}>
              <ListItemIcon>
                <i className="ri-file-excel-2-line" />
              </ListItemIcon>
              <ListItemText>Export as Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <ListItemIcon>
                <i className="ri-file-pdf-line" />
              </ListItemIcon>
              <ListItemText>Export as PDF</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
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
                      </>
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
                  {loading ? 'Loading vendor data...' : 'No vendors found'}
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
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
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

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        open={modalOpen}
        handleClose={handleCloseModal}
        vendorId={selectedVendorId}
      />
    </Card>
  )
}

export default VendorListTable





