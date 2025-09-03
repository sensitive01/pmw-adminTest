"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

const VendorSignupForm = () => {
  const [formData, setFormData] = useState({
    vendorName: "",
    spaceid: "",
    latitude: "",
    longitude: "",
    address: "",
    password: "",
    parkingEntries: "[]", // JSON string
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("vendorName", formData.vendorName);
      formDataToSend.append("spaceid", formData.spaceid);
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("parkingEntries", formData.parkingEntries);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.post("https://api.parkmywheels.com/vendor/signup", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message);
      router.push("/en/apps/ecommerce/customers/list");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "auto", marginTop: 4, padding: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Vendor Signup
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField label='Vendor Name' name='vendorName' value={formData.vendorName} onChange={handleChange} fullWidth margin='normal' required />
          <TextField label='Space ID' name='spaceid' value={formData.spaceid} onChange={handleChange} fullWidth margin='normal' required />
          <TextField label='Latitude' name='latitude' value={formData.latitude} onChange={handleChange} fullWidth margin='normal' required />
          <TextField label='Longitude' name='longitude' value={formData.longitude} onChange={handleChange} fullWidth margin='normal' required />
          <TextField label='Address' name='address' value={formData.address} onChange={handleChange} fullWidth margin='normal' required />
          <TextField label='Password' name='password' type='password' value={formData.password} onChange={handleChange} fullWidth margin='normal' required />
          <TextField label='Parking Entries (JSON Array)' name='parkingEntries' value={formData.parkingEntries} onChange={handleChange} fullWidth margin='normal' required />
          <input type='file' name='image' onChange={handleChange} accept='image/*' style={{ marginTop: 10 }} />
          <Button type='submit' variant='contained' color='primary' disabled={loading} sx={{ marginTop: 2 }}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorSignupForm;
