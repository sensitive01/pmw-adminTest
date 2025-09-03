'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const BookingSummaryChart = () => {
  // Hooks
  const theme = useTheme()

  // State for API data
  const [bookingData, setBookingData] = useState({
    totalCompletedBookings: 0,
    totalMonths: 0,
    totalAmount: '0.00',
    totalAmountThisMonth: '0.00'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/transaction-summary`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()

        if (data.success) {
          setBookingData({
            totalCompletedBookings: data.totalCompletedBookings,
            totalMonths: data.totalMonths,
            totalAmount: data.totalAmount,
            totalAmountThisMonth: data.totalAmountThisMonth
          })
        } else {
          setError(data.message || 'Failed to fetch booking summary')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedSegment(null)
  }

  // Get segment details for modal
  const getSegmentDetails = (index) => {
    switch(index) {
      case 0:
        return {
          description: 'Total number of completed transactions',
          icon: '📊',
          color: theme.palette.success.main
        }
      case 1:
        return {
          description: 'Number of months being tracked',
          icon: '📅',
          color: theme.palette.warning.main
        }
      case 2:
        return {
          description: 'Total revenue from all transactions',
          icon: '💰',
          color: theme.palette.info.main
        }
      case 3:
        return {
          description: 'Revenue generated this month',
          icon: '📈',
          color: theme.palette.error.main
        }
      default:
        return {
          description: '',
          icon: '',
          color: theme.palette.primary.main
        }
    }
  }

  // Normalize values for better chart visualization
  const normalizeForChart = () => {
    const totalBookings = bookingData.totalCompletedBookings
    const totalAmount = parseFloat(bookingData.totalAmount) || 0
    const thisMonthAmount = parseFloat(bookingData.totalAmountThisMonth) || 0
    const totalMonths = bookingData.totalMonths

    // Create percentage-based values for better visualization
    const totalAmountPercent = totalAmount > 0 ? 100 : 0
    const thisMonthPercent = totalAmount > 0 ? (thisMonthAmount / totalAmount) * 100 : 0
    const bookingsPercent = totalBookings > 0 ? (totalBookings / 1000) * 100 : 0 // Scale down bookings
    const monthsPercent = totalMonths * 10 // Scale up months for visibility

    return {
      totalBookings: Math.max(bookingsPercent, 5), // Minimum 5% for visibility
      months: Math.max(monthsPercent, 5),
      totalAmount: Math.max(totalAmountPercent * 0.8, 10), // Scale down total amount
      thisMonth: Math.max(thisMonthPercent * 2, 5) // Scale up this month for visibility
    }
  }

  const normalized = normalizeForChart()

  const options = {
    chart: {
      sparkline: { enabled: true },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const selectedIndex = config.dataPointIndex
          const labels = ['Total Bookings', 'Months Tracked', 'Total Amount (₹)', 'This Month (₹)']
          const values = [
            bookingData.totalCompletedBookings,
            bookingData.totalMonths,
            `₹${bookingData.totalAmount}`,
            `₹${bookingData.totalAmountThisMonth}`
          ]

          setSelectedSegment({
            label: labels[selectedIndex],
            value: values[selectedIndex],
            index: selectedIndex
          })
          setModalOpen(true)
        }
      }
    },
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main
    ],
    grid: {
      padding: {
        bottom: -30
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '13px',
      offsetY: 5,
      itemMargin: {
        horizontal: 20,
        vertical: 6
      },
      labels: {
        colors: theme.palette.text.secondary
      },
      markers: {
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 4 : -1,
        width: 8,
        height: 8
      }
    },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex }) {
        const labels = ['Total Bookings', 'Months Tracked', 'Total Amount', 'This Month']
        const values = [
          `${bookingData.totalCompletedBookings} transactions`,
          `${bookingData.totalMonths} months`,
          `₹${bookingData.totalAmount}`,
          `₹${bookingData.totalAmountThisMonth}`
        ]

        return `<div style="padding: 8px 12px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <strong>${labels[seriesIndex]}</strong><br/>
          ${values[seriesIndex]}
        </div>`
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 4, lineCap: 'round', colors: [theme.palette.background.paper] },
    labels: ['Total Bookings', 'Months Tracked', 'Total Amount (₹)', 'This Month (₹)'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        endAngle: 130,
        startAngle: -130,
        customScale: 0.9,
        donut: {
          size: '83%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.875rem',
              color: theme.palette.text.secondary
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '1.5rem',
              formatter: (value) => `${Math.round(value)}%`,
              color: theme.palette.text.primary
            },
            total: {
              show: true,
              label: 'Transaction Summary',
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              formatter: () => {
                return 'Click segments\nfor details'
              }
            }
          }
        }
      }
    }
  }

  const series = [
    normalized.totalBookings,
    normalized.months,
    normalized.totalAmount,
    normalized.thisMonth
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader title="Transaction Summary" />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Transaction Summary" />
        <CardContent>
          <Typography color="error" variant="body2">
            Error: {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Transaction Summary'
        subheader={`Last ${bookingData.totalMonths} month(s) | Total: ₹${bookingData.totalAmount}`}
      />
      <CardContent>
        <AppReactApexCharts
          type='donut'
          height={373}
          width='100%'
          options={options}
          series={series}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            This Month: <strong>₹{bookingData.totalAmountThisMonth}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Total Bookings: <strong>{bookingData.totalCompletedBookings}</strong>
          </Typography>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Click on chart segments to view detailed values
          </Typography>
        </Box>

        {/* Modal for segment details */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="segment-modal-title"
          aria-describedby="segment-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            outline: 'none'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography id="segment-modal-title" variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Transaction Details
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                ✕
              </IconButton>
            </Box>

            {selectedSegment && (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: `2px solid ${getSegmentDetails(selectedSegment.index).color}`
                }}>
                  <Typography sx={{ fontSize: '2rem', mr: 2 }}>
                    {getSegmentDetails(selectedSegment.index).icon}
                  </Typography>
                  <Box>
                    <Typography variant="h4" sx={{
                      fontWeight: 700,
                      color: getSegmentDetails(selectedSegment.index).color,
                      mb: 0.5
                    }}>
                      {selectedSegment.value}
                    </Typography>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
                      {selectedSegment.label}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  id="segment-modal-description"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {getSegmentDetails(selectedSegment.index).description}
                </Typography>

                {/* Additional context based on segment */}
                {selectedSegment.index === 2 && bookingData.totalCompletedBookings > 0 && (
                  <Box sx={{
                    bgcolor: 'info.50',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.200'
                  }}>
                    <Typography variant="caption" color="info.dark">
                      Average per transaction: ₹{(parseFloat(bookingData.totalAmount) / bookingData.totalCompletedBookings).toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {selectedSegment.index === 3 && parseFloat(bookingData.totalAmount) > 0 && (
                  <Box sx={{
                    bgcolor: 'error.50',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.200'
                  }}>
                    <Typography variant="caption" color="error.dark">
                      {((parseFloat(bookingData.totalAmountThisMonth) / parseFloat(bookingData.totalAmount)) * 100).toFixed(1)}% of total revenue
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Modal>
      </CardContent>
    </Card>
  )
}

export default BookingSummaryChart
