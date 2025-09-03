'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
const API_URL = process.env.NEXT_PUBLIC_API_URL 
// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const DonutChart = () => {
  // Hooks
  const theme = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/transaction-status-list`)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Chart options
  const options = {
    legend: { show: false },
    stroke: { width: 5, colors: ['var(--mui-palette-background-paper)'] },
    grid: {
      padding: {
        top: 10,
        left: 0,
        right: 0,
        bottom: 13
      }
    },
    colors: ['var(--mui-palette-primary-main)', 'var(--mui-palette-error-main)'],
    labels: ['Active Transactions', 'Zero Transactions'],
    tooltip: {
      y: { formatter: val => `${val}` }
    },
    dataLabels: {
      enabled: false
    },
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
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: false },
            total: {
              label: 'Total Vendors',
              show: true,
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: () => data ? (data.activeCount + data.zeroCount).toString() : '0'
            },
            value: {
              offsetY: 6,
              fontWeight: 600,
              fontSize: '0.9375rem',
              formatter: val => `${val}`,
              color: 'var(--mui-palette-text-primary)'
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1309,
        options: {
          plotOptions: {
            pie: {
              offsetY: 20
            }
          }
        }
      },
      {
        breakpoint: 900,
        options: {
          plotOptions: {
            pie: {
              offsetY: 0
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: 165
          }
        }
      }
    ]
  }

  if (loading) {
    return (
      <Card className='bs-full'>
        <CardContent className='flex justify-center items-center pbe-0' style={{ height: '200px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='bs-full'>
        <CardContent className='pbe-0'>
          <Typography color='error.main'>Error: {error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bs-full'>
      <CardContent className='pbe-0'>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{data?.activeCount || 0}</Typography>
          <Typography color={data?.activeCount > 0 ? 'success.main' : 'text.disabled'}>
            Active Transactions 
          </Typography>
        </div>
        <Typography variant='subtitle1'>
          {data?.zeroCount || 0} Inactive
        </Typography>
        <AppReactApexCharts 
          type='donut' 
          height={127} 
          width='100%' 
          options={options} 
          series={data ? [data.activeCount, data.zeroCount] : [0, 0]} 
        />
      </CardContent>
    </Card>
  )
}

export default DonutChart
