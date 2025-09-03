'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Alert,
    Snackbar,
    CircularProgress,
    Avatar,
    Paper,
    Breadcrumbs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import Link from 'next/link';

const UserUpdate = ({ params }) => {
    const unwrappedParams = use(params);
    const userId = unwrappedParams?.id;
    const router = useRouter();
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userMobile: "",
        vehicleNo: ""
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });
    const [originalUser, setOriginalUser] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);
    useEffect(() => {
        if (originalUser) {
            const changed =
                formData.userName !== originalUser.userName ||
                formData.userEmail !== originalUser.userEmail ||
                formData.userMobile !== originalUser.userMobile.toString() ||
                formData.vehicleNo !== (originalUser.vehicleNo || '');

            setHasChanges(changed);
        }
    }, [formData, originalUser]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.parkmywheels.com/fetchuser/${userId}`);
            const userData = response.data.user;
            setOriginalUser(userData);
            setFormData({
                userName: userData.userName || '',
                userEmail: userData.userEmail || '',
                userMobile: userData.userMobile ? userData.userMobile.toString() : '',
                vehicleNo: userData.vehicleNo || ''
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            showAlert('error', error.response?.data?.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.userName || !formData.userEmail || !formData.userMobile) {
            showAlert('error', 'Name, Email and Mobile fields are required');
            return;
        }
        if (!/^\d+$/.test(formData.userMobile)) {
            showAlert('error', 'Mobile number should contain only digits');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.put(
                `https://api.parkmywheels.com/userupdate/${userId}`,
                formData
            );

            showAlert('success', 'User updated successfully!');
            setOriginalUser({
                ...originalUser,
                ...formData
            });
            setHasChanges(false);
            setTimeout(() => {
                router.push('/en/apps/ecommerce/customers/list');
            }, 2000);

        } catch (error) {
            console.error('Error updating user:', error);
            showAlert('error', error.response?.data?.message || 'Error updating user');
        } finally {
            setSubmitting(false);
        }
    };

    const showAlert = (severity, message) => {
        setAlert({
            open: true,
            severity,
            message
        });
    };

    const handleAlertClose = () => {
        setAlert(prev => ({
            ...prev,
            open: false
        }));
    };

    const goBack = () => {
        router.push('/en/apps/ecommerce/customers/list');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress sx={{ color: '#329a73' }} />
            </Box>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ mb: 3 }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link href="/en/apps/ecommerce/customers/list" passHref style={{ textDecoration: 'none', color: '#329a73' }}>
                            Customer List
                        </Link>
                        <Typography color="text.primary">Edit Customer</Typography>
                    </Breadcrumbs>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1">
                        Edit Customer
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={goBack}
                    >
                        Back to List
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', height: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={originalUser?.image || '/avatar-placeholder.png'}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mb: 2,
                                        bgcolor: originalUser?.image ? 'transparent' : '#329a73'
                                    }}
                                >
                                    {!originalUser?.image && <PersonIcon sx={{ fontSize: 60 }} />}
                                </Avatar>
                                <Typography variant="h6">{originalUser?.userName || 'N/A'}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Customer ID: {originalUser?.uuid || 'N/A'}
                                </Typography>

                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Status
                                    </Typography>
                                    <Box sx={{
                                        bgcolor: originalUser?.status?.toLowerCase() === 'active' ? '#e8f5e9' : '#ffebee',
                                        color: originalUser?.status?.toLowerCase() === 'active' ? '#4caf50' : '#f44336',
                                        py: 0.5,
                                        px: 2,
                                        borderRadius: 1,
                                        display: 'inline-block',
                                        fontWeight: 'medium',
                                        fontSize: '0.875rem'
                                    }}>
                                        {originalUser?.status || 'Active'}
                                    </Box>
                                </Box>

                                {originalUser?.role && (
                                    <Box sx={{ width: '100%', mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Role
                                        </Typography>
                                        <Typography variant="body1">{originalUser.role}</Typography>
                                    </Box>
                                )}

                                {originalUser?.walletamount !== undefined && (
                                    <Box sx={{ width: '100%', mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Wallet Amount
                                        </Typography>
                                        <Typography variant="h6" color="#329a73">
                                            ${originalUser.walletamount}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Wallet Status: {originalUser.walletstatus || 'N/A'}
                                        </Typography>
                                    </Box>
                                )}

                                {originalUser?.createdAt && (
                                    <Box sx={{ width: '100%', mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Customer Since
                                        </Typography>
                                        <Typography variant="body2">
                                            {new Date(originalUser.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>Customer Information</Typography>

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Full Name"
                                            name="userName"
                                            value={formData.userName}
                                            onChange={handleFormChange}
                                            fullWidth
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Email Address"
                                            name="userEmail"
                                            type="email"
                                            value={formData.userEmail}
                                            onChange={handleFormChange}
                                            fullWidth
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Mobile Number"
                                            name="userMobile"
                                            value={formData.userMobile}
                                            onChange={handleFormChange}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            inputProps={{
                                                maxLength: 15,
                                                pattern: "[0-9]*"
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Vehicle Number"
                                            name="vehicleNo"
                                            value={formData.vehicleNo}
                                            onChange={handleFormChange}
                                            fullWidth
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={goBack}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={submitting || !hasChanges}
                                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                                sx={{ bgcolor: '#329a73', '&:hover': { bgcolor: '#277a5b' } }}
                                            >
                                                {submitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </CardContent>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleAlertClose}
                    severity={alert.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default UserUpdate;
