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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/getallCommercial`);

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
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteCommercial/${id}`);
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
    { field: 'businessName', headerName: 'Business Name', width: 200 },
    { field: 'contactPerson', headerName: 'Contact Person', width: 200 },
    { field: 'contactNumbers', headerName: 'Contact Numbers', width: 200, renderCell: (params) => params.value?.join(', ') || '' },
    { field: 'parkingSlots', headerName: 'Parking Slots', width: 150 },
    { 
      field: 'parkingTypes', 
      headerName: 'Parking Types', 
      width: 250,
      renderCell: (params) => params.value?.map(pt => `${pt.type} (${pt.space})`).join(', ') || ''
    },
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 500, 
      renderCell: (params) => (
        <Box>
          <Typography>{params.row.location?.address}, {params.row.location?.area},</Typography>
          <Typography>{params.row.location?.city}, {params.row.location?.state} - {params.row.location?.pincode}, Landmark: {params.row.location?.landmark}</Typography>
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
        <Typography variant="h3">Commercial Services Data</Typography>
        <Button 
          variant="contained" 
          sx={{ backgroundColor: '#329a73' }}
          startIcon={<AddIcon />}
          onClick={() => router.push('/en/pages/Commercial')}
        >
          Add Commercial
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
              <Typography><strong>Business Name:</strong> {selectedData.businessName}</Typography>
              <Typography><strong>Contact Person:</strong> {selectedData.contactPerson}</Typography>
              <Typography><strong>Contact Numbers:</strong> {selectedData.contactNumbers?.join(', ')}</Typography>
              <Typography><strong>Parking Slots:</strong> {selectedData.parkingSlots}</Typography>
              <Typography><strong>Parking Types:</strong> {selectedData.parkingTypes?.map(pt => `${pt.type} (${pt.space})`).join(', ')}</Typography>
              <Typography><strong>Address:</strong></Typography>
              <Typography>{selectedData.location?.address}, {selectedData.location?.area},</Typography>
              <Typography>{selectedData.location?.city}, {selectedData.location?.state} - {selectedData.location?.pincode}, Landmark: {selectedData.location?.landmark}</Typography>
              <Typography><strong>Latitude:</strong> {selectedData.location?.latitude}</Typography>
              <Typography><strong>Longitude:</strong> {selectedData.location?.longitude}</Typography>
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
