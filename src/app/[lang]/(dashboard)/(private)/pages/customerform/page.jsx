// 'use client';

// import { useState } from 'react';
// import axios from 'axios';
// import { TextField, Button, Card, CardContent, Typography } from '@mui/material';
// import { useRouter } from 'next/navigation';

// const UserForm = () => {
//   const [formData, setFormData] = useState({
//     userName: '',
//     userEmail: '',
//     userMobile: '',
//     userPassword: '',
//     image: null
//   });
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const formDataToSend = new FormData();
//       Object.keys(formData).forEach(key => {
//         formDataToSend.append(key, formData[key]);
//       });

//       await axios.post('https://api.parkmywheels.com/signup', formDataToSend, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       alert('User registered successfully!');
//       router.push('/');
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       alert('Failed to register user.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card>
//       <CardContent>
//         <Typography variant='h6' gutterBottom>
//           User Registration
//         </Typography>
//         <form onSubmit={handleSubmit} encType='multipart/form-data'>
//           <TextField label='Name' name='userName' value={formData.userName} onChange={handleChange} fullWidth margin='normal' required />
//           <TextField label='Email' name='userEmail' type='email' value={formData.userEmail} onChange={handleChange} fullWidth margin='normal' />
//           <TextField label='Mobile' name='userMobile' value={formData.userMobile} onChange={handleChange} fullWidth margin='normal' required />
//           <TextField label='Password' name='userPassword' type='password' value={formData.userPassword} onChange={handleChange} fullWidth margin='normal' required />
//           <Button type='submit' variant='contained' color='primary' disabled={loading} sx={{ marginTop: 2 }}>
//             {loading ? 'Registering...' : 'Register'}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default UserForm;


"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userMobile: "",
    userPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("https://api.parkmywheels.com/signup", formData);

      alert(response.data.message);
      router.push("/en/apps/ecommerce/customers/list");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "auto", marginTop: 4, padding: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          User Signup
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label='Name'
            name='userName'
            value={formData.userName}
            onChange={handleChange}
            fullWidth
            margin='normal'
            required
          />
          <TextField
            label='Email'
            name='userEmail'
            type='email'
            value={formData.userEmail}
            onChange={handleChange}
            fullWidth
            margin='normal'
          />
          <TextField
            label='Mobile'
            name='userMobile'
            value={formData.userMobile}
            onChange={handleChange}
            fullWidth
            margin='normal'
            required
          />
          <TextField
            label='Password'
            name='userPassword'
            type='password'
            value={formData.userPassword}
            onChange={handleChange}
            fullWidth
            margin='normal'
            required
          />
          <Button type='submit' variant='contained' color='primary' disabled={loading} sx={{ marginTop: 2 }}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;

