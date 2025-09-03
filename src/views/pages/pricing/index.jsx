'use client'
import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import PropTypes from 'prop-types'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Checkbox
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'

const PlanManagementTable = () => {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedPlans, setSelectedPlans] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/getallplan`)

      const plansData = (Array.isArray(response.data)
        ? response.data
        : response.data.plans
        || response.data.data
        || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features)
            ? plan.features
            : (plan.features ? plan.features.split(',').map(f => f.trim()) : [])
        }))

      setPlans(plansData)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching plans',
        severity: 'error'
      })
      console.error('Error fetching plans:', error)
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteplan/${selectedPlan._id}`)

      setPlans(plans.filter(plan => plan._id !== selectedPlan._id))

      setDeleteDialogOpen(false)
      setSnackbar({
        open: true,
        message: 'Plan deleted successfully',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting plan',
        severity: 'error'
      })
      console.error('Error deleting plan:', error)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan)
    setDeleteDialogOpen(true)
  }

  const handleEditPlan = (plan) => {
    router.push(`/en/pages/planform?id=${plan._id}`)
  }

  const handleViewPlan = (plan) => {
    router.push(`/en/pages/plandetails?id=${plan._id}`)
  }

  const handleSelectPlan = (planId) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPlans([])
    } else {
      setSelectedPlans(plans.map(plan => plan._id))
    }

    setSelectAll(!selectAll)
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress />
      </Box>
    )
  }

  if (plans.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" sx={{ color: '#329a73', mb: 2 }}>
          No plans found
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#329a73' }}
          onClick={() => router.push('/en/pages/planform')}
        >
          Create New Plan
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{
      backgroundColor: '#f4f4f4',
      minHeight: '100vh',
      p: 3
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            color: '#329a73'
          }}
        >
          Plan Management
        </Typography>

        <Button
          variant='contained'
          onClick={() => router.push('/en/pages/planform')}
          startIcon={<i className='ri-add-line' />}
          className='max-sm:is-full is-auto'
          sx={{ backgroundColor: '#329a73' }}
        >
          Add Plan
        </Button>
      </Box>

      {selectedPlans.length > 0 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          backgroundColor: '#e6f3ef',
          p: 2,
          borderRadius: 2
        }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {selectedPlans.length} plan(s) selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#329a73' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  sx={{
                    color: 'white',
                    '&.Mui-checked': {
                      color: 'white'
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Validity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Features</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Images</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan, index) => (
              <TableRow key={plan._id} hover>
                <TableCell>
                  <Checkbox
                    checked={selectedPlans.includes(plan._id)}
                    onChange={() => handleSelectPlan(plan._id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{plan.planName}</TableCell>
                <TableCell>{plan.role}</TableCell>
                <TableCell>{plan.validity} days</TableCell>
                <TableCell>₹{plan.amount}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {plan.features && plan.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  {plan.image && (
                    <Avatar
                      variant="rounded"
                      src={plan.image}
                      alt={`${plan.planName} image`}
                      sx={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: plan.status === 'enable' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewPlan(plan)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleEditPlan(plan)}
                    title="Edit Plan"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => openDeleteDialog(plan)}
                    title="Delete Plan"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Are you sure you want to delete the plan "{selectedPlan?.planName}"?
            This action cannot be undone.
          </DialogContentText> */}
          <DialogContentText>
            Are you sure you want to delete the plan &quot;{selectedPlan?.planName}&quot;?
            This action cannot be undone.
          </DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeletePlan} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

PlanManagementTable.propTypes = {

}

PlanManagementTable.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    planName: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    validity: PropTypes.number.isRequired,
    amount: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['enable', 'disable']).isRequired,
    features: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string
  }))
}

export default PlanManagementTable
