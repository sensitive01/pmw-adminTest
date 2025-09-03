'use client'

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const CreateSpacePage = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    vendorName: '',
    spaceid: id, 
    latitude: '',
    longitude: '',
    address: '',
    landmark: '',
    parkingEntries: [
      { type: 'Cars', count: '' },
      { type: 'Bikes', count: '' }
    ]
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParkingChange = (index, field, value) => {
    const updatedEntries = [...formData.parkingEntries];
    updatedEntries[index][field] = value;
    setFormData(prev => ({ ...prev, parkingEntries: updatedEntries }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('vendorName', formData.vendorName);
      formDataToSend.append('spaceid', formData.spaceid);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('landmark', formData.landmark);
      formDataToSend.append('parkingEntries', JSON.stringify(formData.parkingEntries));
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/spaceregister`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create space');
      }

      setSuccess(true);
      // Redirect to space list or show success message
      setTimeout(() => {
        router.push('/pages/myspace');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h4" gutterBottom>
        Create New Space for User: {id}
      </Typography>

      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Space created successfully! Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vendor/Space Name"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Space ID"
    name="spaceid"
    value={formData.spaceid}
    onChange={handleChange}
    required
    InputProps={{
      readOnly: true,
    }}
    helperText="Automatically set from URL"
  />
</Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Parking Capacity
                </Typography>
                <Paper sx={{ p: 2 }}>
                  {formData.parkingEntries.map((entry, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">{entry.type}</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        label="Count"
                        value={entry.count}
                        onChange={(e) => handleParkingChange(index, 'count', e.target.value)}
                        required
                      />
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Space Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Space'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateSpacePage;
