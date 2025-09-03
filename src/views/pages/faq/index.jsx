'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  Chip,
  Button,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccountBalanceWallet,
  Receipt,
  Summarize,
  CalendarToday,
  Download,
  PictureAsPdf,
  GridOn
} from '@mui/icons-material';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Dashboard = () => {
  const [value, setValue] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    vendor: 'all'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      const response = await fetch('https://api.parkmywheels.com/admin/fetchallbookingtransactions');
      const data = await response.json();

      if (data.success) {
        setSummaryData(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFilterChange = (name, value) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    if (!summaryData) return;

    // Get filtered vendors based on current selection
    const vendorsToExport = filter.vendor === 'all'
      ? summaryData.vendors
      : summaryData.vendors.filter(v => v.vendorId === filter.vendor);

    if (vendorsToExport.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    const headers = ["Vendor Name", "Bookings", "Total Amount", "Platform Fee %", "Receivable"];
    csvContent += headers.join(",") + "\r\n";

    // Add data rows
    vendorsToExport.forEach(vendor => {
      const row = [
        `"${vendor.vendorName}"`,
        vendor.bookingCount,
        vendor.totalAmount,
        vendor.platformFeePercentage,
        vendor.totalReceivable
      ];
      csvContent += row.join(",") + "\r\n";
    });

    // Add summary row
    csvContent += `"${filter.vendor === 'all' ? 'Grand Total' : 'Selected Vendor Total'}",${vendorsToExport.reduce((sum, v) => sum + v.bookingCount, 0)
      },${vendorsToExport.reduce((sum, v) => sum + v.totalAmount, 0)
      },,${vendorsToExport.reduce((sum, v) => sum + v.totalReceivable, 0)
      }\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${filter.vendor === 'all' ? 'all_vendors' : 'vendor_' + filter.vendor}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleDownloadClose();
  };

  const exportToPDF = () => {
    if (!summaryData) return;

    // Get filtered vendors based on current selection
    const vendorsToExport = filter.vendor === 'all'
      ? summaryData.vendors
      : summaryData.vendors.filter(v => v.vendorId === filter.vendor);

    if (vendorsToExport.length === 0) return;

    // Create a basic PDF using browser's print functionality
    const printContent = `
      <html>
        <head>
          <title>Transactions Report</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Transactions Report</h1>
          <p>${filter.vendor === 'all' ? 'All Vendors' : 'Selected Vendor'} | Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Bookings</th>
                <th>Total Amount</th>
                <th>Platform Fee %</th>
                <th>Receivable</th>
              </tr>
            </thead>
            <tbody>
              ${vendorsToExport.map(vendor => `
                <tr>
                  <td>${vendor.vendorName}</td>
                  <td>${vendor.bookingCount}</td>
                  <td>₹${vendor.totalAmount}</td>
                  <td>${vendor.platformFeePercentage}%</td>
                  <td>₹${vendor.totalReceivable}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td>${filter.vendor === 'all' ? 'Grand Total' : 'Selected Vendor Total'}</td>
                <td>${vendorsToExport.reduce((sum, v) => sum + v.bookingCount, 0)}</td>
                <td>₹${vendorsToExport.reduce((sum, v) => sum + v.totalAmount, 0)}</td>
                <td></td>
                <td>₹${vendorsToExport.reduce((sum, v) => sum + v.totalReceivable, 0)}</td>
              </tr>
            </tbody>
          </table>
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

  const filteredVendors = summaryData?.vendors.filter(vendor => {
    if (filter.vendor !== 'all' && vendor.vendorId !== filter.vendor) {
      return false;
    }
    return true;
  }) || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
        >
          <Tab label="Transaction" icon={<Summarize />} iconPosition="start" />
          <Tab label="Payouts Details" />
        </Tabs>

        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownloadClick}
          sx={{ ml: 2 }}
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
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={filter.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={filter.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Vendor"
              value={filter.vendor}
              onChange={(e) => handleFilterChange('vendor', e.target.value)}
              fullWidth
            >
              <MenuItem value="all">All Vendors</MenuItem>
              {summaryData?.vendors.map((vendor) => (
                <MenuItem key={vendor.vendorId} value={vendor.vendorId}>
                  {vendor.vendorName}
                  {vendor.bookingCount === 0 && (
                    <Chip
                      label="No transactions"
                      size="small"
                      sx={{ ml: 1 }}
                      variant="outlined"
                    />
                  )}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TabPanel value={value} index={0}>
        {summaryData && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Transaction Summary
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary">
                        Total Bookings
                      </Typography>
                      <Typography variant="h3">
                        {summaryData.vendors.reduce((sum, vendor) => sum + vendor.bookingCount, 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h3" color="primary">
                        ₹{summaryData.grandTotalAmount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary">
                        Total Receivable
                      </Typography>
                      <Typography variant="h3" color="success.main">
                        ₹{summaryData.grandTotalReceivable}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>
              All Vendors ({filteredVendors.length})
            </Typography>
            <Grid container spacing={2}>
              {filteredVendors.map((vendor) => (
                <Grid item xs={12} sm={6} md={4} key={vendor.vendorId}>
                  <Card sx={{
                    opacity: vendor.bookingCount === 0 ? 0.7 : 1,
                    border: vendor.bookingCount === 0 ? '1px dashed #ccc' : '1px solid rgba(0, 0, 0, 0.12)'
                  }}>
                    <CardContent>
                      <Typography variant="h6">
                        {vendor.vendorName}
                        {vendor.bookingCount === 0 && (
                          <Chip
                            label="No transactions"
                            size="small"
                            sx={{ ml: 1 }}
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography>Amount: ₹{vendor.totalAmount}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Receipt sx={{ mr: 1, color: 'error.main' }} />
                            <Typography>Fee: {vendor.platformFeePercentage}%</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>Receivable: ₹{vendor.totalReceivable}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography>Bookings: {vendor.bookingCount}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {summaryData && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Detailed Vendor Information
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                {filteredVendors.map((vendor) => (
                  <Grid item xs={12} key={vendor.vendorId}>
                    <Card sx={{
                      opacity: vendor.bookingCount === 0 ? 0.7 : 1,
                      border: vendor.bookingCount === 0 ? '1px dashed #ccc' : '1px solid rgba(0, 0, 0, 0.12)'
                    }}>
                      <CardContent>
                        <Typography variant="h6">
                          {vendor.vendorName}
                          {vendor.bookingCount === 0 && (
                            <Chip
                              label="No transactions"
                              size="small"
                              sx={{ ml: 1 }}
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Typography>Platform Fee: {vendor.platformFeePercentage}%</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography>Total Amount: ₹{vendor.totalAmount}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography>Receivable: ₹{vendor.totalReceivable}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography>Bookings: {vendor.bookingCount}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
