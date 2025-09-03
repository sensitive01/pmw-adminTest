'use client'
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import axios from 'axios';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const CommercialServicesTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/getallcorporate`);

        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/deletecorporate/${id}`);
        setData(data.filter(item => item._id !== id));
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const handleView = (row) => {
    setSelectedData(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'organisationName', headerName: 'Organisation Name', width: 200 },
    { field: 'representative', headerName: 'Representative', width: 200 },
    { field: 'phoneNumbers', headerName: 'Phone Numbers', width: 200, renderCell: (params) => params.value?.join(', ') || '' },
    { field: 'totalParkingSlots', headerName: 'Total Parking Slots', width: 150 },
    { 
      field: 'parkingDetails', 
      headerName: 'Parking Details', 
      width: 250,
      renderCell: (params) => params.value?.map(pd => `${pd.category} (${pd.capacity})`).join(', ') || ''
    },
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 500, 
      renderCell: (params) => (
        <Box>
          <Typography>{params.row.addressDetails?.street}, {params.row.addressDetails?.locality},</Typography>
          <Typography>{params.row.addressDetails?.city}, {params.row.addressDetails?.state} - {params.row.addressDetails?.postalCode}, Landmark: {params.row.addressDetails?.landmark}</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleView(params.row)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">Corporate Solution Data</Typography>
        <Button 
          variant="contained" 
          sx={{ backgroundColor: '#329a73' }}
          startIcon={<AddIcon />}
          onClick={() => router.push('/en/pages/corporate-solutions')}
        >
          Add Corporate Solutions
        </Button>
      </Box>
      <DataGrid 
        rows={data.map((item, index) => ({ ...item, id: index + 1 }))} 
        columns={columns} 
        pageSize={5} 
        loading={loading}
        disableSelectionOnClick
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Commercial Service Details</DialogTitle>
        <DialogContent>
          {selectedData && (
            <Box>
              <Typography><strong>Organisation Name:</strong> {selectedData.organisationName}</Typography>
              <Typography><strong>Representative:</strong> {selectedData.representative}</Typography>
              <Typography><strong>Phone Numbers:</strong> {selectedData.phoneNumbers?.join(', ')}</Typography>
              <Typography><strong>Total Parking Slots:</strong> {selectedData.totalParkingSlots}</Typography>
              <Typography><strong>Parking Details:</strong> {selectedData.parkingDetails?.map(pd => `${pd.category} (${pd.capacity})`).join(', ')}</Typography>
              <Typography><strong>Address:</strong></Typography>
              <Typography>{selectedData.addressDetails?.street}, {selectedData.addressDetails?.locality},</Typography>
              <Typography>{selectedData.addressDetails?.city}, {selectedData.addressDetails?.state} - {selectedData.addressDetails?.postalCode}, Landmark: {selectedData.addressDetails?.landmark}</Typography>
              <Typography><strong>Latitude:</strong> {selectedData.addressDetails?.latitude}</Typography>
              <Typography><strong>Longitude:</strong> {selectedData.addressDetails?.longitude}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommercialServicesTable;
