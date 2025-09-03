'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
const API_URL = process.env.NEXT_PUBLIC_API_URL 
// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const SpaceStatusStats = () => {
  // Hooks
  const theme = useTheme()
  const [stats, setStats] = useState({
    totalApproved: 0,
    totalPending: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSpaceStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/space-status-stats`)
        if (!response.ok) {
          throw new Error('Failed to fetch space statistics')
        }
        const data = await response.json()
        
        if (data.message === "Vendor summary fetched successfully") {
          setStats({
            totalApproved: data.data.totalApproved || 0,
            totalPending: data.data.totalPending || 0
          })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSpaceStats()
  }, [])

  // Chart options
  const options = {
    chart: {
      type: 'donut',
      height: 350,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    labels: ['Approved Spaces', 'Pending Spaces'],
    colors: ['var(--mui-palette-success-main)', 'var(--mui-palette-warning-main)'],
    responsive: [{
      breakpoint: theme.breakpoints.values.md,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    legend: {
      position: 'right',
      offsetY: 0,
      height: 230,
      labels: {
        colors: theme.palette.text.primary
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Spaces',
              color: theme.palette.text.primary,
              formatter: () => stats.totalApproved + stats.totalPending
            },
            value: {
              color: theme.palette.text.primary,
              formatter: (value) => value
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      style: {
        fontSize: '0.875rem',
        fontFamily: 'inherit'
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title='Space Status Statistics' />
        <CardContent className='flex justify-center items-center' style={{ height: '300px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title='Space Status Statistics' />
        <CardContent className='flex justify-center items-center' style={{ height: '300px' }}>
          <Typography color='error'>Error: {error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader 
        title='Space Status Statistics' 
        subheader={
          <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary">
              {`${stats.totalApproved} Approved Spaces`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`${stats.totalPending} Pending Spaces`}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <AppReactApexCharts 
          type='donut' 
          height={300} 
          options={options} 
          series={[stats.totalApproved, stats.totalPending]} 
        />
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          {stats.totalPending === 0 ? (
            'All spaces are currently approved and active.'
          ) : (
            `${stats.totalPending} spaces awaiting approval.`
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default SpaceStatusStats
