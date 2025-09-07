'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Drawer,
  Box,
  Tab,
  Tabs,
  Grid,
  Paper,
  Chip,
  Avatar,
  InputAdornment,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import ChatIcon from '@mui/icons-material/Chat';
import { statusChipColor } from '../details/customer-right/overview/OrderListTable';
import { Download, PictureAsPdf, GridOn } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const CustomerListTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: '' });
  const [vendorSpaces, setVendorSpaces] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [spaceError, setSpaceError] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [parkingServices, setParkingServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportRequestsLoading, setSupportRequestsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [bookingTransactions, setBookingTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [charges, setCharges] = useState({});
  const [chargesLoading, setChargesLoading] = useState(false);
  const [transactionDates, setTransactionDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    category: '',
    type: '',
    make: '',
    model: '',
    color: '',
    vehicleNo: '',
    image: null
  });
  const [deleteVehicleDialogOpen, setDeleteVehicleDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [addVehicleLoading, setAddVehicleLoading] = useState(false);
  const [deleteVehicleLoading, setDeleteVehicleLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userMobile: "",
    userPassword: "",
    confirmPassword: "",
    otp: ""
  });

  const [userBookings, setUserBookings] = useState([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpAlertOpen, setOtpAlertOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);  // Renamed from 'open'
  const isMenuOpen = Boolean(anchorEl);
  const router = useRouter();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('https://api.parkmywheels.com/admin/allusers')
      .then(response => {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  };
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    const dataToExport = search ? filteredUsers : users;
    if (!dataToExport.length) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["ID", "Name", "Email", "Mobile", "Role", "Status"];
    csvContent += headers.join(",") + "\r\n";

    dataToExport.forEach(user => {
      const row = [
        `"${user.id}"`, `"${user.userName}"`, `"${user.userEmail}"`,
        `"${user.userMobile}"`, `"${user.role}"`, `"${user.status}"`
      ];
      csvContent += row.join(",") + "\r\n";
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleExportClose();
  };

  const exportToPDF = () => {
    const dataToExport = search ? filteredUsers : users;
    if (!dataToExport.length) return;

    const printContent = `
    <html>
      <head><title>Users Export</title></head>
      <body>
        <h1>Users Report</h1>
        <table border="1">
          <tr>
            <th>ID</th><th>Name</th><th>Email</th>
            <th>Mobile</th><th>Role</th><th>Status</th>
          </tr>
          ${dataToExport.map(user => `
            <tr>
              <td>${user.id}</td><td>${user.userName}</td>
              <td>${user.userEmail}</td><td>${user.userMobile}</td>
              <td>${user.role}</td><td>${user.status}</td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `;

    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    setTimeout(() => win.print(), 500);
    handleExportClose();
  };

  const fetchVendorSpaces = async (userId) => {
    if (!userId) return;

    setLoadingSpaces(true);
    setSpaceError(null);
    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/fetchspace/${userId}`);
      setVendorSpaces(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendor spaces:', error);
      setSpaceError(error.response?.data?.message || 'Failed to fetch vendor spaces');
      setVendorSpaces([]);
    } finally {
      setLoadingSpaces(false);
    }
  };

  const fetchBusinessHours = async (vendorId) => {
    if (!vendorId) return;

    setHoursLoading(true);

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/fetchbusinesshours/${vendorId}`);
      const data = response.data;

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

  const fetchAmenitiesData = async (vendorId) => {
    if (!vendorId) return;

    setAmenitiesLoading(true);

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/getamenitiesdata/${vendorId}`);
      const data = response.data;

      if (data?.AmenitiesData?.amenities) {
        setAmenities(data.AmenitiesData.amenities);
      }
    } catch (error) {
      console.error('Error fetching amenities data:', error);
    } finally {
      setAmenitiesLoading(false);
    }
  };

  const fetchServiceData = async (vendorId) => {
    if (!vendorId) return;
    setServicesLoading(true);
    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/getamenitiesdata/${vendorId}`);
      const data = response.data;

      if (data?.AmenitiesData?.parkingEntries) {
        setParkingServices(data.AmenitiesData.parkingEntries);
      }
    } catch (error) {
      console.error('Error fetching service data', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchSupportRequests = async (vendorId) => {
    if (!vendorId) return;

    setSupportRequestsLoading(true);

    try {
      const response = await fetch(`${API_URL}/vendor/gethelpvendor/${vendorId}`);
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


  const fetchBankDetails = async (vendorId) => {
    if (!vendorId) return;

    setBankDetailsLoading(true);

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/getbankdetails/${vendorId}`);
      const data = response.data;

      if (data?.BankDetails) {
        setBankDetails(data.BankDetails);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const fetchMeetings = async (vendorId) => {
    if (!vendorId) return;

    setMeetingsLoading(true);

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/fetchmeeting/${vendorId}`);
      const data = response.data;

      if (data?.meetings) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const fetchBookingTransactions = async (vendorId) => {
    if (!vendorId) return;

    setTransactionsLoading(true);

    try {
      const response = await axios.get(
        `https://api.parkmywheels.com/vendor/fetchbookingtransaction/${vendorId}?startDate=${transactionDates.start}&endDate=${transactionDates.end}`
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

  const fetchBookings = async (vendorId) => {
    if (!vendorId) return;

    setBookingsLoading(true);

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/fetchbookingsbyvendorid/${vendorId}`);

      if (response.data?.bookings) {
        const sortedBookings = response.data.bookings.sort((a, b) => {
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

  const fetchChargesData = async (vendorId) => {
    if (!vendorId) return;

    setChargesLoading(true);

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/getchargesdata/${vendorId}`);
      const data = response.data;

      if (data?.vendor?.charges) {
        const chargesMap = {};
        data.vendor.charges.forEach(charge => {
          let label;
          const typeLC = charge.type.toLowerCase();

          if (typeLC.includes('additional')) label = 'Additional Hour';
          else if (typeLC.includes('full day') || typeLC.includes('24 hour')) label = 'Full Day';
          else if (typeLC.includes('monthly')) label = 'Monthly';
          else label = 'Minimum Charges';

          const key = `${charge.category}-${label}`;
          chargesMap[key] = { ...charge, label };
        });
        setCharges(chargesMap);
      }
    } catch (error) {
      console.error('Error fetching charges data:', error);
    } finally {
      setChargesLoading(false);
    }
  };

  const fetchUserVehicles = async (userId) => {
    if (!userId) return;

    setVehiclesLoading(true);
    try {
      const response = await axios.get(`https://api.parkmywheels.com/get-vehicle-slot?id=${userId}`);
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Error fetching user vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const fetchUserBookings = async (userId) => {
    if (!userId) return;

    setUserBookingsLoading(true);
    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/getbookinguserid/${userId}`);
      setUserBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setUserBookingsLoading(false);
    }
  };



  const handleAddVehicleClick = () => {
    setAddVehicleDialogOpen(true);
  };

  const handleAddVehicleClose = () => {
    setAddVehicleDialogOpen(false);
    setNewVehicleData({
      category: '',
      type: '',
      make: '',
      model: '',
      color: '',
      vehicleNo: '',
      image: null
    });
  };

  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicleData({ ...newVehicleData, [name]: value });
  };

  const handleVehicleImageChange = (e) => {
    setNewVehicleData({ ...newVehicleData, image: e.target.files[0] });
  };

  const handleAddVehicleSubmit = async () => {
    if (!selectedUser?.uuid) return;

    setAddVehicleLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', newVehicleData.image);
      formData.append('category', newVehicleData.category);
      formData.append('type', newVehicleData.type);
      formData.append('make', newVehicleData.make);
      formData.append('model', newVehicleData.model);
      formData.append('color', newVehicleData.color);
      formData.append('vehicleNo', newVehicleData.vehicleNo);

      const response = await axios.post(
        `https://api.parkmywheels.com/add-vehicle?id=${selectedUser.uuid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccessSnackbar({
        open: true,
        message: response.data.message || 'Vehicle added successfully'
      });
      fetchUserVehicles(selectedUser.uuid);
      handleAddVehicleClose();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert(error.response?.data?.message || 'Error adding vehicle');
    } finally {
      setAddVehicleLoading(false);
    }
  };

  const handleDeleteVehicleClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteVehicleDialogOpen(true);
  };

  const handleDeleteVehicleCancel = () => {
    setDeleteVehicleDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleDeleteVehicleConfirm = async () => {
    if (!vehicleToDelete?._id || !selectedUser?.uuid) {
      setDeleteVehicleDialogOpen(false);
      return;
    }

    setDeleteVehicleLoading(true);
    try {
      const response = await axios.delete(
        `https://api.parkmywheels.com/deletevehicle?vehicleId=${vehicleToDelete._id}`
      );

      setSuccessSnackbar({
        open: true,
        message: response.data.message || 'Vehicle deleted successfully'
      });
      fetchUserVehicles(selectedUser.uuid);
      setDeleteVehicleDialogOpen(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert(error.response?.data?.message || 'Error deleting vehicle');
    } finally {
      setDeleteVehicleLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = users.filter(user =>
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      user.userMobile?.includes(search) ||
      user.role?.toLowerCase().includes(search.toLowerCase()) ||
      user.status?.toLowerCase().includes(search.toLowerCase()) ||
      user.walletstatus?.toLowerCase().includes(search.toLowerCase()) ||
      user.vehicleNo?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setOpen(true);
    if (currentTab === 1) { // My space bookings tab
      fetchVendorSpaces(user.uuid);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setVendorSpaces([]);
    setSpaceError(null);
    setBusinessHours([]);
    setVehicles([]);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setFormData({
      userName: "",
      userEmail: "",
      userMobile: "",
      userPassword: "",
      confirmPassword: "",
      otp: ""
    });
    setPasswordError("");
    setOtpSent(false);
    setGeneratedOTP("");
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !userToDelete.uuid) {
      setDeleteDialogOpen(false);
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await axios.delete(`https://api.parkmywheels.com/admin/deleteuser/${userToDelete.uuid}`);

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();

      setSuccessSnackbar({
        open: true,
        message: response.data.message || 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error deleting user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === 'userPassword' || name === 'confirmPassword') {
      setPasswordError("");
    }
  };

  const validatePasswords = () => {
    if (formData.userPassword !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

  const generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async () => {
    if (!formData.userEmail || !formData.userMobile) {
      alert("Email and mobile number are required to send OTP");
      return;
    }

    setFormLoading(true);

    try {
      const otp = generateRandomOTP();
      setGeneratedOTP(otp);
      setTimeout(() => {
        setOtpSent(true);
        setFormLoading(false);
        setOtpAlertOpen(true);
      }, 1000);
    } catch (error) {
      alert("Failed to generate OTP");
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    if (!formData.otp) {
      alert("Please enter the OTP");
      return;
    }

    if (formData.otp !== generatedOTP) {
      alert("Invalid OTP. Please enter the correct OTP.");
      return;
    }

    setFormLoading(true);

    try {
      const { confirmPassword, ...submissionData } = formData;
      const response = await axios.post("https://api.parkmywheels.com/signup", submissionData);

      alert(response.data.message);
      handleDrawerClose();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 1 && selectedUser) { // My space bookings tab
      fetchVendorSpaces(selectedUser.uuid);
    }
    // Add these new conditions
    if (newValue === 3 && vendorSpaces.length > 0) { // Amenities tab
      // Will be triggered after vendor selection
    }
    if (newValue === 4 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 5 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 6 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 7 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 8 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 8 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 8 && vendorSpaces.length > 0) { // Services tab
      // Will be triggered after vendor selection
    }
    if (newValue === 11 && selectedUser) { // Vehicles tab
      fetchUserVehicles(selectedUser.uuid);
    }
    if (newValue === 12 && selectedUser) {
      fetchUserBookings(selectedUser.uuid);
    }
  };

  const handleOtpAlertClose = () => {
    setOtpAlertOpen(false);
  };

  const handleEditUser = (uuid) => {
    if (uuid) {
      router.push(`/en/pages/userupdate/${uuid}`);
    }
  };

  const handleSnackbarClose = () => {
    setSuccessSnackbar({ ...successSnackbar, open: false });
  };



  const handleOpenReschedule = (booking) => {
    setSelectedBooking(booking);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedBooking) return;

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `https://api.parkmywheels.com/updatebookingbyid/${selectedBooking._id}`,
        {
          parkingDate: selectedBooking.parkingDate,
          parkingTime: selectedBooking.parkingTime
        }
      );

      setSuccessSnackbar({
        open: true,
        message: 'Booking rescheduled successfully'
      });

      // Refresh bookings data for the current tab
      if (selectedUser) {
        if (currentTab === 12) { // User Bookings tab
          fetchUserBookings(selectedUser.uuid);
        }
      }

      setRescheduleModalOpen(false);
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setSuccessSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error rescheduling booking'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!booking?._id || booking.status !== 'PENDING') return;

    const confirmed = window.confirm(`Are you sure you want to cancel booking ${booking._id}?`);
    if (!confirmed) return;

    try {
      const response = await axios.put(
        `https://api.parkmywheels.com/updatebookingbyid/${booking._id}`,
        { status: 'Cancelled' }
      );

      setSuccessSnackbar({
        open: true,
        message: 'Booking cancelled successfully'
      });

      // Refresh bookings data
      if (selectedUser) {
        fetchUserBookings(selectedUser.uuid);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setSuccessSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error cancelling booking'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' (ET)';
  };

  const formatTime = (time) => {
    if (!time) return 'Closed';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes} ${period}`;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'rejected':
        return <WarningIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

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

  const renderSupportRequestsTable = () => {
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

  const renderSupportTab = () => {
    if (supportRequestsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (!vendorSpaces || vendorSpaces.length === 0) {
      return <Alert severity="info">No vendor spaces available to show support requests</Alert>;
    }

    return (
      <>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Select Vendor"
            variant="outlined"
            fullWidth
            SelectProps={{
              native: true,
            }}
            onChange={(e) => {
              const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
              if (selectedVendor) {
                fetchSupportRequests(selectedVendor.vendorId);
              }
            }}
          >
            <option value="">Select a vendor</option>
            {vendorSpaces.map((space) => (
              <option key={space.vendorId} value={space.vendorId}>
                {space.vendorName} ({space.vendorId})
              </option>
            ))}
          </TextField>
        </Box>
        {renderSupportRequestsTable()}
      </>
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
      return <Alert severity="info">No bank details information available</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Bank Account Details
          </Typography>
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
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
      return <Alert severity="info">No meeting requests available</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Meeting Requests
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
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
        </Paper>
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
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Booking Transactions
          </Typography>

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
              onClick={() => fetchBookingTransactions(selectedVendorId)}
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
        </Paper>
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
        width: 300,
        renderCell: (params) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const [day, month, year] = dateStr.split('-');
            if (!day || !month || !year) return 'Invalid Date';
            const date = new Date(`${year}-${month}-${day}`);
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
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Bookings
          </Typography>
          <div style={{ height: 400, width: '100%' }}>
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
          </div>
        </Paper>
      </Box>
    );
  };

  const renderCharges = () => {
    const categories = ['Car', 'Bike', 'Others'];

    if (chargesLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (Object.keys(charges).length === 0) {
      return <Alert severity="info">No parking charges found</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Parking Charges
          </Typography>

          <TableContainer component={Paper}>
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
        </Paper>
      </Box>
    );
  };



  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'userName', headerName: 'Name', width: 150 },
    { field: 'userEmail', headerName: 'Email', width: 200 },
    { field: 'userMobile', headerName: 'Mobile', width: 150 },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'walletamount', headerName: 'Wallet Amount', width: 150 },
    { field: 'walletstatus', headerName: 'Wallet Status', width: 150 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 150 },
    {
      field: 'image',
      headerName: 'Profile Image',
      width: 150,
      renderCell: (params) => (
        params.value ? <img src={params.value} alt='Profile' style={{ width: 50, height: 50, borderRadius: '50%' }} /> : null
      )
    },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => handleView(params.row)}>
            <VisibilityIcon color='primary' />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(params.row)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const rows = filteredUsers.map((user, index) => ({ id: index + 1, ...user }));

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Typography variant='h3' gutterBottom>
            Customer List
          </Typography>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant='contained'
              startIcon={<Download />}
              onClick={handleExportClick}
              sx={{ backgroundColor: '#329a73' }}
            >
              Download
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleExportClose}
            >
              <MenuItem onClick={exportToExcel}>
                <ListItemIcon><GridOn fontSize="small" /></ListItemIcon>
                <ListItemText>Excel</ListItemText>
              </MenuItem>
              <MenuItem onClick={exportToPDF}>
                <ListItemIcon><PictureAsPdf fontSize="small" /></ListItemIcon>
                <ListItemText>PDF</ListItemText>
              </MenuItem>
            </Menu>
            <Button
              variant='contained'
              onClick={handleDrawerOpen}
              startIcon={<i className='ri-add-line' />}
              sx={{ backgroundColor: '#329a73' }}
            >
              Add Customer
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant='contained' onClick={handleSearch}>Search</Button>
        </div>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            loading={loading}
          />
        </div>
      </CardContent>


      <Dialog open={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reschedule Booking</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Vendor"
                value={selectedBooking.vendorName}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Vehicle"
                value={`${selectedBooking.vehicleNumber} (${selectedBooking.vehicleType})`}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {/* Date picker - format DD-MM-YYYY */}
                <TextField
                  label="Date (DD-MM-YYYY)"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0], // Set min date to today
                  }}
                  // Convert from HTML date format (YYYY-MM-DD) to app format (DD-MM-YYYY) for display
                  value={(() => {
                    const dateStr = selectedBooking.parkingDate || selectedBooking.bookingDate;
                    if (!dateStr) return '';
                    // If it's already in YYYY-MM-DD format (HTML input format)
                    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      return dateStr;
                    }
                    // If it's in DD-MM-YYYY format (convert to YYYY-MM-DD for the input)
                    const parts = dateStr.split('-');
                    if (parts.length === 3) {
                      return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return '';
                  })()}
                  onChange={(e) => {
                    // Convert from HTML date format (YYYY-MM-DD) to app format (DD-MM-YYYY) for storage
                    const htmlDate = e.target.value; // YYYY-MM-DD
                    if (htmlDate) {
                      const parts = htmlDate.split('-');
                      const appDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
                      setSelectedBooking({ ...selectedBooking, parkingDate: appDate });
                    } else {
                      setSelectedBooking({ ...selectedBooking, parkingDate: '' });
                    }
                  }}
                />

                {/* Time picker - format hh:mm AM/PM */}
                <TextField
                  label="Time (hh:mm AM/PM)"
                  type="time"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min steps
                  }}
                  // Convert from 24h format to 12h format for display
                  value={(() => {
                    const timeStr = selectedBooking.parkingTime || selectedBooking.bookingTime;
                    if (!timeStr) return '';
                    // If already in 24h format (HTML time input format)
                    if (timeStr.match(/^\d{2}:\d{2}$/)) {
                      return timeStr;
                    }
                    // If in 12h format (convert to 24h for the input)
                    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                    if (match) {
                      let hours = parseInt(match[1]);
                      const minutes = match[2];
                      const period = match[3].toUpperCase();

                      if (period === 'PM' && hours < 12) hours += 12;
                      if (period === 'AM' && hours === 12) hours = 0;

                      return `${hours.toString().padStart(2, '0')}:${minutes}`;
                    }
                    return '';
                  })()}
                  onChange={(e) => {
                    // Convert from 24h format to 12h format (hh:mm AM/PM) for storage
                    const time24 = e.target.value; // HH:MM in 24h
                    if (time24) {
                      const [hoursStr, minutes] = time24.split(':');
                      let hours = parseInt(hoursStr);
                      const period = hours >= 12 ? 'PM' : 'AM';

                      // Convert to 12-hour format
                      if (hours > 12) hours -= 12;
                      if (hours === 0) hours = 12;

                      const time12 = `${hours}:${minutes} ${period}`; // h:mm AM/PM
                      setSelectedBooking({ ...selectedBooking, parkingTime: time12 });
                    } else {
                      setSelectedBooking({ ...selectedBooking, parkingTime: '' });
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRescheduleSubmit}
            disabled={isSubmitting}
            sx={{ backgroundColor: '#329a73' }}
          >
            {isSubmitting ? 'Updating...' : 'Update Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        {selectedUser && (
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">
                  Customer ID #{selectedUser.id}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: '4px', backgroundColor: '#329a73' }}
                  startIcon={<EditIcon />}
                  onClick={() => handleEditUser(selectedUser.uuid)}
                >
                  Edit Customer
                </Button>
              </div>
              <Typography variant="body2" color="text.secondary">
                {formatDate(selectedUser.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="customer details tabs" variant="scrollable" scrollButtons="auto">
                <Tab icon={<Avatar sx={{ bgcolor: '#329a73', width: 24, height: 24 }}><i className="ri-user-line" style={{ fontSize: '14px', color: 'white' }} /></Avatar>} iconPosition="start" label="Profile" />
                <Tab icon={<LocationOnIcon fontSize="small" />} iconPosition="start" label="My space bookings" />
                <Tab icon={<AccessTimeIcon fontSize="small" />} iconPosition="start" label="Myspace Business Hours" />
                <Tab icon={<i className="ri-list-check" />} iconPosition='start' label=" My space Amenities" />
                <Tab icon={<MonetizationOnIcon fontSize="small" />} iconPosition="start" label="Myspace Services & Pricing" />
                <Tab icon={<ChatIcon fontSize="small" />} iconPosition="start" label="Myspace Support Requests" />
                <Tab icon={<i className="ri-bank-line" />} iconPosition='start' label="Myspace Bank Details" />
                <Tab icon={<i className="ri-calendar-line" />} iconPosition='start' label="Myspace Advertise With Us" />
                <Tab icon={<i className="ri-money-dollar-circle-line" />} iconPosition="start" label="Myspace Booking Transactions" />
                <Tab icon={<i className="ri-car-line" />} iconPosition="start" label="Myspace Bookings" />
                <Tab icon={<i className="ri-money-dollar-circle-line" />} iconPosition="start" label="Myspace Parking Charges" />
                <Tab icon={<i className="ri-car-line" />} iconPosition="start" label="User Vehicles" />
                <Tab icon={<i className="ri-calendar-line" />} iconPosition="start" label="User Bookings" />
              </Tabs>
            </Box>

            {currentTab === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={selectedUser.image || '/avatar-placeholder.png'}
                          sx={{ width: 120, height: 120, mb: 2 }}
                        />
                        <Typography variant="h6">{selectedUser.userName || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customer ID #{selectedUser.id}
                        </Typography>
                      </Box>


                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedUser.userEmail || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Mobile</Typography>
                          <Typography variant="body1">{selectedUser.userMobile || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Role</Typography>
                          <Typography variant="body1">{selectedUser.role || 'Customer'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Chip
                            label={selectedUser.status || 'Active'}
                            sx={{
                              bgcolor: selectedUser.status?.toLowerCase() === 'active' ? '#e8f5e9' : '#ffebee',
                              color: selectedUser.status?.toLowerCase() === 'active' ? '#4caf50' : '#f44336'
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Wallet Status</Typography>
                          <Typography variant="body1">{selectedUser.walletstatus || 'Active'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Vehicle No</Typography>
                          <Typography variant="body1">{selectedUser.vehicleNo || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Vendor Spaces</Typography>

                {loadingSpaces ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <CircularProgress />
                  </Box>
                ) : spaceError ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {spaceError}
                  </Alert>
                ) : vendorSpaces.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    No vendor spaces found for this user.
                  </Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vendor Name</TableCell>
                          <TableCell>Vendor ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Address</TableCell>
                          <TableCell>Premium Package</TableCell>
                          <TableCell>Parking Entries</TableCell>
                          <TableCell>Created At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vendorSpaces.map((space) => (
                          <TableRow key={space._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {space.image && (
                                  <Avatar src={space.image} sx={{ width: 40, height: 40 }} />
                                )}
                                <Typography>{space.vendorName}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                {space.uuid || space.vendorId || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(space.status)}
                                <Typography>{space.status || 'N/A'}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography>{space.address}</Typography>
                              {space.landMark && (
                                <Typography variant="body2" color="text.secondary">
                                  Landmark: {space.landMark}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                            <Typography variant="body2">Days Remaining: {space.subscriptionleft || 0}</Typography>

                              <Typography>
                                {space.subscription === "true" ? 'Active' : 'Inactive'}
                              </Typography>
                              {space.subscriptionenddate && (
                                <Typography variant="body2" color="text.secondary">
                                  Ends: {new Date(space.subscriptionenddate).toLocaleDateString()}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {space.parkingEntries?.map((entry, index) => (
                                <Chip
                                  key={index}
                                  label={`${entry.type}: ${entry.count}`}
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </TableCell>
                            <TableCell>
                              {formatDate(space.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )} */}

            {currentTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Vendor Spaces</Typography>

                {loadingSpaces ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <CircularProgress />
                  </Box>
                ) : spaceError ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {spaceError}
                  </Alert>
                ) : vendorSpaces.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    No vendor spaces found for this user.
                  </Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Vendor Name</TableCell>
                          <TableCell>Vendor ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Address</TableCell>
                          <TableCell>Premium Package</TableCell>
                          <TableCell>Parking Entries</TableCell>
                          <TableCell>Created At</TableCell>
                          <TableCell>Actions</TableCell> {/* Added this column */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vendorSpaces.map((space) => (
                          <TableRow key={space._id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {space.image && (
                                  <Avatar src={space.image} sx={{ width: 40, height: 40 }} />
                                )}
                                <Typography>{space.vendorName}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                {space.uuid || space.vendorId || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(space.status)}
                                <Typography>{space.status || 'N/A'}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography>{space.address}</Typography>
                              {space.landMark && (
                                <Typography variant="body2" color="text.secondary">
                                  Landmark: {space.landMark}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">Days Remaining: {space.subscriptionleft || 0}</Typography>

                              <Typography>
                                {space.subscription === "true" ? 'Active' : 'Inactive'}
                              </Typography>
                              {space.subscriptionenddate && (
                                <Typography variant="body2" color="text.secondary">
                                  Ends: {new Date(space.subscriptionenddate).toLocaleDateString()}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {space.parkingEntries?.map((entry, index) => (
                                <Chip
                                  key={index}
                                  label={`${entry.type}: ${entry.count}`}
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </TableCell>
                            <TableCell>
                              {formatDate(space.createdAt)}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => router.push(`/pages/spacedetails/${space.vendorId}`)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {currentTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Business Hours</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchBusinessHours(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderBusinessHours()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show business hours</Alert>
                )}
              </Box>
            )}

            {currentTab === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Amenities</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchAmenitiesData(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderAmenities()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show amenities</Alert>
                )}
              </Box>
            )}

            {currentTab === 4 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Services & Pricing</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchServiceData(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderServicesPricing()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show services & pricing</Alert>
                )}
              </Box>
            )}

            {currentTab === 5 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Help & Support</Typography>
                {renderSupportTab()}
              </Box>
            )}

            {currentTab === 6 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Bank Details</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchBankDetails(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderBankDetails()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show bank details</Alert>
                )}
              </Box>
            )}

            {currentTab === 7 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Advertise With Us</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchMeetings(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderMeetings()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show meeting requests</Alert>
                )}
              </Box>
            )}

            {currentTab === 8 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Booking Transactions</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchBookingTransactions(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderBookingTransactions()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show booking transactions</Alert>
                )}
              </Box>
            )}

            {currentTab === 9 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Bookings</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchBookings(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderBookings()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show bookings</Alert>
                )}
              </Box>
            )}

            {currentTab === 10 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Parking Charges</Typography>
                {vendorSpaces.length > 0 ? (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        select
                        label="Select Vendor"
                        variant="outlined"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                        onChange={(e) => {
                          const selectedVendor = vendorSpaces.find(space => space.vendorId === e.target.value);
                          if (selectedVendor) {
                            fetchChargesData(selectedVendor.vendorId);
                          }
                        }}
                      >
                        <option value="">Select a vendor</option>
                        {vendorSpaces.map((space) => (
                          <option key={space.vendorId} value={space.vendorId}>
                            {space.vendorName} ({space.vendorId})
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    {renderCharges()}
                  </>
                ) : (
                  <Alert severity="info">No vendor spaces available to show parking charges</Alert>
                )}
              </Box>
            )}

            {currentTab === 11 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Vehicle Details</Typography>
                  <Button
                    variant="contained"
                    onClick={handleAddVehicleClick}
                    sx={{ backgroundColor: '#329a73' }}
                  >
                    Add Vehicle
                  </Button>
                </Box>
                {vehiclesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : vehicles.length === 0 ? (
                  <Alert severity="info">No vehicles found for this user</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Make</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell>Vehicle No</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vehicles.map((vehicle) => (
                          <TableRow key={vehicle._id}>
                            <TableCell>
                              {vehicle.image && (
                                <img
                                  src={vehicle.image}
                                  alt="Vehicle"
                                  style={{ width: 80, height: 60, objectFit: 'cover' }}
                                />
                              )}
                            </TableCell>
                            <TableCell>{vehicle.category}</TableCell>
                            <TableCell>{vehicle.type}</TableCell>
                            <TableCell>{vehicle.make}</TableCell>
                            <TableCell>{vehicle.model}</TableCell>
                            <TableCell>{vehicle.color}</TableCell>
                            <TableCell>{vehicle.vehicleNo}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteVehicleClick(vehicle)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {currentTab === 12 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">User Bookings</Typography>
                  <Button
                    variant="contained"
                    onClick={() => router.push(`/pages/create-booking-user/${selectedUser.uuid}`)}
                    sx={{ backgroundColor: '#329a73' }}
                  >
                    Add Booking
                  </Button>
                </Box>
                {userBookingsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : userBookings.length === 0 ? (
                  <Alert severity="info">No bookings found for this user</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Booking ID</TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Vehicle</TableCell>
                          <TableCell>Booking Date/Time</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userBookings.map((booking) => (
                          <TableRow key={booking._id}>
                            <TableCell>{booking._id}</TableCell>
                            <TableCell>{booking.vendorName}</TableCell>
                            <TableCell>
                              {booking.vehicleNumber} ({booking.vehicleType})
                            </TableCell>
                            <TableCell>
                              {booking.bookingDate}, {booking.bookingTime}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={booking.status}
                                color={
                                  booking.status === 'COMPLETED' ? 'success' :
                                    booking.status === 'Cancelled' ? 'error' : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>₹{booking.amount || '0'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  onClick={() => handleOpenReschedule(booking)}
                                  color="primary"
                                  disabled={booking.status === 'Cancelled'}
                                  title={booking.status === 'Cancelled' ? 'Cancelled bookings cannot be rescheduled' : 'Reschedule booking'}
                                >
                                  <i className="ri-calendar-line" />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleCancelBooking(booking)}
                                  color="error"
                                  disabled={booking.status !== 'PENDING'}
                                  title={booking.status !== 'PENDING' ? 'Only pending bookings can be cancelled' : 'Cancel booking'}
                                >
                                  <i className="ri-close-line" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#ffebee', color: '#d32f2f', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete this user?
          </Typography>
          {userToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography><strong>Name:</strong> {userToDelete.userName || 'N/A'}</Typography>
              <Typography><strong>Email:</strong> {userToDelete.userEmail || 'N/A'}</Typography>
              <Typography><strong>Mobile:</strong> {userToDelete.userMobile || 'N/A'}</Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Yes, Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog
        open={addVehicleDialogOpen}
        onClose={handleAddVehicleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="vehicle-category-label">Category</InputLabel>
              <Select
                labelId="vehicle-category-label"
                name="category"
                value={newVehicleData.category}
                onChange={handleVehicleInputChange}
                label="Category"
              >
                <MenuItem value="Two-Wheeler">Two-Wheeler</MenuItem>
                <MenuItem value="Four-Wheeler">Four-Wheeler</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Type"
              name="type"
              value={newVehicleData.type}
              onChange={handleVehicleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Make"
              name="make"
              value={newVehicleData.make}
              onChange={handleVehicleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Model"
              name="model"
              value={newVehicleData.model}
              onChange={handleVehicleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Color"
              name="color"
              value={newVehicleData.color}
              onChange={handleVehicleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Vehicle Number"
              name="vehicleNo"
              value={newVehicleData.vehicleNo}
              onChange={handleVehicleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Vehicle Image</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleVehicleImageChange}
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddVehicleClose}>Cancel</Button>
          <Button
            onClick={handleAddVehicleSubmit}
            variant="contained"
            disabled={addVehicleLoading || !newVehicleData.image}
            sx={{ backgroundColor: '#329a73' }}
          >
            {addVehicleLoading ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Vehicle Confirmation Dialog */}
      <Dialog
        open={deleteVehicleDialogOpen}
        onClose={handleDeleteVehicleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#ffebee', color: '#d32f2f', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            Confirm Vehicle Deletion
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete this vehicle?
          </Typography>
          {vehicleToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography><strong>Vehicle No:</strong> {vehicleToDelete.vehicleNo}</Typography>
              <Typography><strong>Make/Model:</strong> {vehicleToDelete.make} {vehicleToDelete.model}</Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDeleteVehicleCancel}
            variant="outlined"
            disabled={deleteVehicleLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVehicleConfirm}
            variant="contained"
            color="error"
            disabled={deleteVehicleLoading}
          >
            {deleteVehicleLoading ? 'Deleting...' : 'Yes, Delete Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            padding: 2,
            boxSizing: 'border-box',
          },
        }}
      >
        <Card sx={{ boxShadow: 'none', height: '100%' }}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant='h6' gutterBottom>
                Add New Customer
              </Typography>
              <Button onClick={handleDrawerClose}>Close</Button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <TextField
                label='Name'
                name='userName'
                value={formData.userName}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Email'
                name='userEmail'
                type='email'
                value={formData.userEmail}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Mobile'
                name='userMobile'
                value={formData.userMobile}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Password'
                name='userPassword'
                type='password'
                value={formData.userPassword}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Confirm Password'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleFormChange}
                fullWidth
                margin='normal'
                required
                error={!!passwordError}
                helperText={passwordError}
              />

              <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
                <TextField
                  label='OTP'
                  name='otp'
                  value={formData.otp}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  disabled={!otpSent}
                  placeholder="Enter verification code"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SecurityIcon fontSize="small" /></InputAdornment>,
                  }}
                />
                <Button
                  variant='outlined'
                  onClick={handleSendOTP}
                  disabled={formLoading || otpSent}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {otpSent ? "OTP Sent" : "Send OTP"}
                </Button>
              </Box>

              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={formLoading || !otpSent}
                sx={{ marginTop: 2, backgroundColor: '#329a73' }}
                fullWidth
              >
                {formLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Drawer>

      {/* OTP Alert */}
      <Snackbar
        open={otpAlertOpen}
        autoHideDuration={10000}
        onClose={handleOtpAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleOtpAlertClose}
          severity="info"
          sx={{ width: '100%', boxShadow: 3, backgroundColor: '#329a73', color: 'white' }}
          iconMapping={{
            info: <InfoIcon sx={{ color: 'red' }} />,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
            Verification Code
          </Typography>
          <Typography sx={{ color: 'white' }}>
            Your OTP is: <strong>{generatedOTP}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
            Please use this code to complete your registration.
          </Typography>
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {successSnackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CustomerListTable;
