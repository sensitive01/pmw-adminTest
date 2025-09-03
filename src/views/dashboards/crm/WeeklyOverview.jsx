'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
const API_URL = process.env.NEXT_PUBLIC_API_URL 
// Safely import the chart component with SSR disabled
const AppReactApexCharts = dynamic(
  () => import('@/libs/styles/AppReactApexCharts'),
  { ssr: false }
)

const VendorStatusChart = () => {
  const theme = useTheme()
  const [chartData, setChartData] = useState({
    series: [0, 0],
    options: null,
    stats: {
      totalApproved: 0,
      totalPending: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/vendor-status-stats`)
        if (!response.ok) throw new Error('Network response was not ok')
        
        const data = await response.json()
        
        if (!data || !data.data) {
          throw new Error('Invalid data structure received')
        }

        const newStats = {
          totalApproved: data.data.totalApproved ?? 0,
          totalPending: data.data.totalPending ?? 0
        }

        const newSeries = [newStats.totalApproved, newStats.totalPending]
        
        const newOptions = {
          chart: { type: 'donut', height: 350 },
          labels: ['Approved', 'Pending'],
          colors: ['#00E396', '#FF4560'],
          responsive: [{
            breakpoint: 480,
            options: { chart: { width: 200 }, legend: { position: 'bottom' } }
          }],
          legend: { position: 'right', offsetY: 0, height: 230 },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Total Vendors',
                    color: theme.palette.text.primary,
                    formatter: () => newSeries.reduce((a, b) => a + b, 0)
                  },
                  value: { color: theme.palette.text.primary }
                }
              }
            }
          },
          dataLabels: { enabled: false },
          states: { hover: { filter: { type: 'none' } } }
        }

        setChartData({
          series: newSeries,
          options: newOptions,
          stats: newStats
        })

      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [theme])

  if (loading) {
    return (
      <Card>
        <CardHeader title="Vendor Status Statistics" />
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Vendor Status Statistics" />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300, gap: 2 }}>
          <Typography color="error">Error loading data</Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader 
        title="Vendor Status Statistics"
        subheader={
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2">{`${chartData.stats.totalApproved} Approved`}</Typography>
            <Typography variant="body2">{`${chartData.stats.totalPending} Pending`}</Typography>
          </Box>
        }
      />
      <CardContent>
        {chartData.options ? (
          <Box sx={{ minHeight: 300 }}>
            <AppReactApexCharts
              type="donut"
              height={300}
              series={chartData.series}
              options={chartData.options}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography>No chart data available</Typography>
          </Box>
        )}
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          {chartData.stats.totalPending === 0 ? (
            'All vendors are currently approved and active.'
          ) : (
            `${chartData.stats.totalPending} vendors awaiting approval.`
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default VendorStatusChart
