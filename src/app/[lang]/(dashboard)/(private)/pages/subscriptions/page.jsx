// 'use client'
// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
// import PaymentIcon from '@mui/icons-material/Payment'
// import ReceiptIcon from '@mui/icons-material/Receipt'
// import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
// import CreditCardIcon from '@mui/icons-material/CreditCard'
// import LocalOfferIcon from '@mui/icons-material/LocalOffer'
// import LockIcon from '@mui/icons-material/Lock'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Grid from '@mui/material/Grid'
// import Typography from '@mui/material/Typography'
// import Button from '@mui/material/Button'
// import IconButton from '@mui/material/IconButton'
// import Box from '@mui/material/Box'
// import Paper from '@mui/material/Paper'
// import TextField from '@mui/material/TextField'
// import Divider from '@mui/material/Divider'
// import Stepper from '@mui/material/Stepper'
// import Step from '@mui/material/Step'
// import StepLabel from '@mui/material/StepLabel'
// import CircularProgress from '@mui/material/CircularProgress'
// import Dialog from '@mui/material/Dialog'
// import DialogActions from '@mui/material/DialogActions'
// import DialogContent from '@mui/material/DialogContent'
// import DialogContentText from '@mui/material/DialogContentText'
// import DialogTitle from '@mui/material/DialogTitle'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Checkbox from '@mui/material/Checkbox'

// const SubscriptionPage = () => {
//   const { data: session } = useSession()
//   const [activeStep, setActiveStep] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
//   const [couponCode, setCouponCode] = useState('')
//   const [couponApplied, setCouponApplied] = useState(false)
//   const [couponLoading, setCouponLoading] = useState(false)
//   const [autoRenew, setAutoRenew] = useState(true)

//   const steps = ['Select Plan', 'Payment Details', 'Confirmation'];

//   // Card validation states
//   const [cardInfo, setCardInfo] = useState({
//     number: '',
//     name: '',
//     expiry: '',
//     cvv: ''
//   })

//   const [errors, setErrors] = useState({
//     number: '',
//     name: '',
//     expiry: '',
//     cvv: ''
//   })

//   const plans = [
//     {
//       id: 'monthly',
//       title: 'Monthly',
//       subtitle: 'Basic',
//       description: 'Perfect for starters',
//       price: '₹120',
//       perMonth: '₹120/month',
//       isActive: false,
//       color: '#FFFFFF',
//       features: [
//         'Unlimited bookings',
//         '24/7 customer support',
//         'Access to premium spots'
//       ]
//     },
//     {
//       id: 'quarterly',
//       title: 'Quarterly',
//       subtitle: 'Standard',
//       description: 'Most popular choice',
//       price: '₹330',
//       perMonth: '₹110/month',
//       isActive: true,
//       color: '#329a73',
//       features: [
//         'Unlimited bookings',
//         '24/7 customer support',
//         'Access to premium spots',
//         'Priority booking'
//       ]
//     },
//     {
//       id: 'yearly',
//       title: 'Yearly',
//       subtitle: 'Premium',
//       description: 'Best value for money',
//       price: '₹1290',
//       perMonth: '₹107.5/month',
//       isActive: false,
//       color: '#FFFFFF',
//       features: [
//         'Unlimited bookings',
//         '24/7 customer support',
//         'Access to premium spots',
//         'Priority booking',
//         'Exclusive offers'
//       ]
//     }
//   ]

//   const [selectedPlan, setSelectedPlan] = useState(plans[1].id)

//   const handleBack = () => {
//     if (activeStep > 0) {
//       setActiveStep(activeStep - 1);
//     } else {
//       // Navigate to previous page
//       console.log('Going back to main page');
//     }
//   }

//   const handlePlanSelect = (planId) => {
//     setSelectedPlan(planId)
//   }

//   const handleNext = () => {
//     if (activeStep === steps.length - 1) {
//       setConfirmDialogOpen(true);
//     } else {
//       setActiveStep(activeStep + 1);
//     }
//   }

//   const handleConfirmSubscription = () => {
//     setLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
//       setConfirmDialogOpen(false);
//       // Navigate to success page or show success message
//       console.log('Subscription confirmed for plan:', selectedPlan);
//     }, 2000);
//   }

//   const handleCancel = () => {
//     setConfirmDialogOpen(false);
//   }

//   const handleApplyCoupon = () => {
//     if (!couponCode) return;

//     setCouponLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       setCouponLoading(false);
//       setCouponApplied(true);
//     }, 1500);
//   }

//   const handleCardInfoChange = (e) => {
//     const { name, value } = e.target;
//     setCardInfo({
//       ...cardInfo,
//       [name]: value
//     });

//     // Basic validation
//     if (name === 'number' && !/^\d*$/.test(value)) {
//       setErrors({...errors, number: 'Card number must contain only digits'});
//     } else if (name === 'cvv' && !/^\d{3,4}$/.test(value)) {
//       setErrors({...errors, cvv: 'CVV must be 3 or 4 digits'});
//     } else {
//       setErrors({...errors, [name]: ''});
//     }
//   }

//   const getSelectedPlan = () => {
//     return plans.find(plan => plan.id === selectedPlan);
//   }

//   // Plan Selection Screen
//   const renderPlanSelection = () => (
//     <Box>
//       <Typography 
//         variant="body1" 
//         color="text.secondary" 
//         sx={{ mb: 4 }}
//       >
//         Choose a subscription plan that works for you.
//       </Typography>

//       {/* Plan Options */}
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         mb: 4, 
//         gap: 3,
//         overflowX: 'auto'
//       }}>
//         {plans.map((plan) => (
//           <Card 
//             key={plan.id}
//             onClick={() => handlePlanSelect(plan.id)}
//             sx={{ 
//               flex: 1,
//               minWidth: '100px',
//               borderRadius: 2,
//               backgroundColor: selectedPlan === plan.id ? '#329a73' : '#FFFFFF',
//               color: selectedPlan === plan.id ? 'white' : 'inherit',
//               cursor: 'pointer',
//               border: selectedPlan === plan.id && plan.color !== '#329a73' ? '2px solid #329a73' : 'none',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'space-between',
//               height: '240px',
//               position: 'relative',
//               padding: 2,
//               boxShadow: selectedPlan === plan.id ? '0 4px 12px rgba(50, 154, 115, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
//               transition: 'all 0.2s ease-in-out',
//               '&:hover': {
//                 transform: 'translateY(-5px)',
//                 boxShadow: '0 6px 14px rgba(0, 0, 0, 0.15)'
//               }
//             }}
//           >
//             <Box>
//               <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
//                 {plan.title}
//               </Typography>
//               {plan.subtitle && (
//                 <Typography variant="subtitle1" component="p" sx={{ mb: 1 }}>
//                   {plan.subtitle}
//                 </Typography>
//               )}
//               <Typography variant="body2" sx={{ mb: 2, color: selectedPlan === plan.id ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
//                 {plan.description}
//               </Typography>
//             </Box>
//             <Box>
//               <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
//                 {plan.price}
//               </Typography>
//               <Typography variant="body2" sx={{ color: selectedPlan === plan.id ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
//                 {plan.perMonth}
//               </Typography>
//             </Box>
//           </Card>
//         ))}
//       </Box>

//       {/* Features of Selected Plan */}
//       <Card sx={{ borderRadius: 2, mb: 4, p: 2 }}>
//         <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold', pl: 2 }}>
//           {getSelectedPlan().subtitle} Plan Features:
//         </Typography>

//         <Box sx={{ mb: 2, pl: 2 }}>
//           {getSelectedPlan().features.map((feature, index) => (
//             <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <CheckCircleOutlineIcon sx={{ color: '#329a73', mr: 1 }} />
//               <Typography variant="body1">{feature}</Typography>
//             </Box>
//           ))}
//         </Box>
//       </Card>
//     </Box>
//   )

//   // Payment Details Screen
//   const renderPaymentDetails = () => (
//     <Box>
//       <Typography 
//         variant="body1" 
//         color="text.secondary" 
//         sx={{ mb: 4 }}
//       >
//         Enter your payment information securely.
//       </Typography>

//       <Card sx={{ borderRadius: 2, mb: 4, p: 3 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <CreditCardIcon sx={{ color: '#329a73', mr: 2 }} />
//           <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
//             Card Details
//           </Typography>
//         </Box>

//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Card Number"
//               name="number"
//               value={cardInfo.number}
//               onChange={handleCardInfoChange}
//               error={!!errors.number}
//               helperText={errors.number}
//               placeholder="1234 5678 9012 3456"
//               InputProps={{
//                 startAdornment: (
//                   <Box sx={{ mr: 1, color: 'text.secondary' }}>
//                     <CreditCardIcon fontSize="small" />
//                   </Box>
//                 ),
//               }}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Cardholder Name"
//               name="name"
//               value={cardInfo.name}
//               onChange={handleCardInfoChange}
//               error={!!errors.name}
//               helperText={errors.name}
//               placeholder="John Doe"
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="Expiry Date"
//               name="expiry"
//               value={cardInfo.expiry}
//               onChange={handleCardInfoChange}
//               error={!!errors.expiry}
//               helperText={errors.expiry}
//               placeholder="MM/YY"
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="CVV"
//               name="cvv"
//               value={cardInfo.cvv}
//               onChange={handleCardInfoChange}
//               error={!!errors.cvv}
//               helperText={errors.cvv}
//               placeholder="123"
//               type="password"
//             />
//           </Grid>
//         </Grid>

//         <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
//           <LockIcon sx={{ fontSize: 'small', color: '#329a73', mr: 1 }} />
//           <Typography variant="caption" color="text.secondary">
//             Your payment information is encrypted and secure.
//           </Typography>
//         </Box>
//       </Card>

//       <Card sx={{ borderRadius: 2, mb: 4, p: 3 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <LocalOfferIcon sx={{ color: '#329a73', mr: 2 }} />
//           <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
//             Have a coupon code?
//           </Typography>
//         </Box>

//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <TextField
//             fullWidth
//             label="Coupon Code"
//             value={couponCode}
//             onChange={(e) => setCouponCode(e.target.value)}
//             placeholder="Enter your code"
//             disabled={couponApplied}
//           />
//           <Button
//             variant="outlined"
//             onClick={handleApplyCoupon}
//             disabled={!couponCode || couponApplied}
//             sx={{ 
//               borderColor: '#329a73',
//               color: '#329a73',
//               '&:hover': {
//                 borderColor: '#3d8b40',
//                 backgroundColor: 'rgba(50, 154, 115, 0.1)'
//               }
//             }}
//           >
//             {couponLoading ? <CircularProgress size={24} /> : 
//              couponApplied ? 'Applied' : 'Apply'}
//           </Button>
//         </Box>

//         {couponApplied && (
//           <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
//             Coupon successfully applied! You've received 10% off.
//           </Typography>
//         )}
//       </Card>

//       <FormControlLabel
//         control={
//           <Checkbox 
//             checked={autoRenew}
//             onChange={(e) => setAutoRenew(e.target.checked)}
//             sx={{
//               color: '#329a73',
//               '&.Mui-checked': {
//                 color: '#329a73',
//               },
//             }}
//           />
//         }
//         label="Automatically renew my subscription"
//       />
//     </Box>
//   )

//   // Order Summary Screen
//   const renderOrderSummary = () => (
//     <Box>
//       <Typography 
//         variant="body1" 
//         color="text.secondary" 
//         sx={{ mb: 4 }}
//       >
//         Please review your subscription details before confirming.
//       </Typography>

//       <Card sx={{ borderRadius: 2, mb: 4, p: 3 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <AssignmentTurnedInIcon sx={{ color: '#329a73', mr: 2 }} />
//           <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
//             Order Summary
//           </Typography>
//         </Box>

//         <Box sx={{ mb: 3 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={6}>
//               <Typography variant="body2" color="text.secondary">
//                 Plan
//               </Typography>
//             </Grid>
//             <Grid item xs={6}>
//               <Typography variant="body1" fontWeight="medium">
//                 {getSelectedPlan().title} ({getSelectedPlan().subtitle})
//               </Typography>
//             </Grid>

//             <Grid item xs={6}>
//               <Typography variant="body2" color="text.secondary">
//                 Price
//               </Typography>
//             </Grid>
//             <Grid item xs={6}>
//               <Typography variant="body1" fontWeight="medium">
//                 {getSelectedPlan().price}
//               </Typography>
//             </Grid>

//             {couponApplied && (
//               <>
//                 <Grid item xs={6}>
//                   <Typography variant="body2" color="text.secondary">
//                     Discount
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography variant="body1" fontWeight="medium" color="success.main">
//                     -10%
//                   </Typography>
//                 </Grid>
//               </>
//             )}
//           </Grid>
//         </Box>

//         <Divider sx={{ my: 2 }} />

//         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//           <Typography variant="h6">Total</Typography>
//           <Typography variant="h6" color="#329a73" fontWeight="bold">
//             {couponApplied 
//               ? `₹${(parseInt(getSelectedPlan().price.replace('₹', '')) * 0.9).toFixed(0)}` 
//               : getSelectedPlan().price}
//           </Typography>
//         </Box>

//         <Typography variant="body2" color="text.secondary">
//           {autoRenew 
//             ? `Your subscription will automatically renew every ${getSelectedPlan().title.toLowerCase()} until canceled.` 
//             : 'Your subscription will not automatically renew.'}
//         </Typography>
//       </Card>

//       <Card sx={{ borderRadius: 2, mb: 4, p: 3, backgroundColor: '#f8f9fa' }}>
//         <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
//           <PaymentIcon sx={{ color: '#329a73', mt: 0.5 }} />
//           <Box>
//             <Typography variant="body2" fontWeight="medium">
//               Payment Method
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Credit Card ending in {cardInfo.number.slice(-4) || '****'}
//             </Typography>
//           </Box>
//         </Box>
//       </Card>
//     </Box>
//   )

//   return (
//     <Box sx={{ backgroundColor: '#329a73', minHeight: '100vh', padding: 2 }}>
//       {/* Header */}
//       <Box sx={{ display: 'flex', alignItems: 'center', color: 'white', mb: 2 }}>
//         <IconButton onClick={handleBack} sx={{ color: 'white' }}>
//           <ArrowBackIcon />
//         </IconButton>
//         <Typography variant="h5" component="h1" sx={{ fontWeight: 500, color: 'white', ml: 1 }}>
//           {activeStep === 0 ? 'Choose Your Plan' : 
//            activeStep === 1 ? 'Payment Details' : 'Review & Confirm'}
//         </Typography>
//       </Box>

//       {/* Stepper */}
//       <Card sx={{ borderRadius: 3, mb: 2, p: 2 }}>
//         <Stepper activeStep={activeStep} alternativeLabel>
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel>{label}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </Card>

//       {/* Main Card */}
//       <Card sx={{ borderRadius: 3, mb: 2 }}>
//         <CardContent sx={{ p: 3 }}>
//           {activeStep === 0 && renderPlanSelection()}
//           {activeStep === 1 && renderPaymentDetails()}
//           {activeStep === 2 && renderOrderSummary()}

//           {/* Navigation Buttons */}
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
//             <Button 
//               variant="outlined" 
//               onClick={handleBack}
//               sx={{ 
//                 borderColor: '#329a73',
//                 color: '#329a73',
//                 borderRadius: 2,
//                 px: 3,
//                 py: 1,
//                 textTransform: 'none',
//                 fontWeight: 'medium',
//                 '&:hover': {
//                   borderColor: '#3d8b40',
//                   backgroundColor: 'rgba(50, 154, 115, 0.1)'
//                 }
//               }}
//             >
//               {activeStep === 0 ? 'Cancel' : 'Back'}
//             </Button>
//             <Button 
//               variant="contained" 
//               onClick={handleNext}
//               sx={{ 
//                 backgroundColor: '#329a73', 
//                 borderRadius: 2,
//                 px: 4,
//                 py: 1,
//                 textTransform: 'none',
//                 fontSize: '1rem',
//                 fontWeight: 'bold',
//                 '&:hover': {
//                   backgroundColor: '#3d8b40'
//                 }
//               }}
//             >
//               {activeStep === steps.length - 1 ? 'Confirm Subscription' : 'Continue'}
//             </Button>
//           </Box>
//         </CardContent>
//       </Card>

//       {/* Confirmation Dialog */}
//       <Dialog
//         open={confirmDialogOpen}
//         onClose={handleCancel}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">
//           {"Confirm Your Subscription"}
//         </DialogTitle>
//         <DialogContent>
//           <DialogContentText id="alert-dialog-description">
//             You're about to subscribe to the {getSelectedPlan().title} plan for {couponApplied 
//               ? `₹${(parseInt(getSelectedPlan().price.replace('₹', '')) * 0.9).toFixed(0)}` 
//               : getSelectedPlan().price}.
//             {autoRenew && " Your subscription will automatically renew until canceled."}
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button 
//             onClick={handleCancel}
//             sx={{ color: 'text.secondary' }}
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleConfirmSubscription}
//             variant="contained"
//             sx={{ 
//               backgroundColor: '#329a73',
//               '&:hover': {
//                 backgroundColor: '#3d8b40'
//               }
//             }}
//             autoFocus
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

// export default SubscriptionPage


'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import axios from 'axios'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert
} from '@mui/material'

const SubscriptionForm = () => {
  const router = useRouter()

  const [subscriptionDetails, setSubscriptionDetails] = useState({
    userId: '',
    planId: '',
    planTitle: '',
    price: '',
    autoRenew: true,
    expiresAt: '',
    cardNumber: '',
    cardHolderName: '',
    expiry: '',
    cvv: ''
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setSubscriptionDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateSubscription = async () => {
    if (!subscriptionDetails.userId || !subscriptionDetails.planId || !subscriptionDetails.planTitle ||
      !subscriptionDetails.price || !subscriptionDetails.expiresAt ||
      !subscriptionDetails.cardNumber || !subscriptionDetails.cardHolderName ||
      !subscriptionDetails.expiry || !subscriptionDetails.cvv) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      })

      return
    }

    try {
      const response = await axios.post('https://api.parkmywheels.com/admin/subscription', {
        userId: subscriptionDetails.userId,
        planId: subscriptionDetails.planId,
        planTitle: subscriptionDetails.planTitle,
        price: Number(subscriptionDetails.price),
        autoRenew: subscriptionDetails.autoRenew,
        expiresAt: new Date(subscriptionDetails.expiresAt),
        paymentDetails: {
          cardNumber: subscriptionDetails.cardNumber,
          cardHolderName: subscriptionDetails.cardHolderName,
          expiry: subscriptionDetails.expiry,
          cvv: subscriptionDetails.cvv
        }
      })

      setSnackbar({
        open: true,
        message: 'Subscription created successfully!',
        severity: 'success'
      })
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating subscription',
        severity: 'error'
      })
    }
  }

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            Create Subscription
          </Typography>

          <TextField fullWidth label="User ID" name="userId" value={subscriptionDetails.userId} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Plan ID" name="planId" value={subscriptionDetails.planId} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Plan Title" name="planTitle" value={subscriptionDetails.planTitle} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Price" name="price" type="number" value={subscriptionDetails.price} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Expiration Date" name="expiresAt" type="date" value={subscriptionDetails.expiresAt} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Auto Renew</FormLabel>
            <RadioGroup row name="autoRenew" value={subscriptionDetails.autoRenew} onChange={(e) => setSubscriptionDetails({ ...subscriptionDetails, autoRenew: e.target.value === 'true' })}>
              <FormControlLabel value={true} control={<Radio />} label="Yes" />
              <FormControlLabel value={false} control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Payment Details</Typography>
          <TextField fullWidth label="Card Number" name="cardNumber" value={subscriptionDetails.cardNumber} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Card Holder Name" name="cardHolderName" value={subscriptionDetails.cardHolderName} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Expiry Date (MM/YY)" name="expiry" value={subscriptionDetails.expiry} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="CVV" name="cvv" type="number" value={subscriptionDetails.cvv} onChange={handleInputChange} sx={{ mb: 2 }} />

          <Button fullWidth variant="contained" onClick={handleCreateSubscription} sx={{ mt: 2, borderRadius: 2, py: 1.5 }}>
            Create Subscription
          </Button>

          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SubscriptionForm
