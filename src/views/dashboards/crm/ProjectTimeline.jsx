'use client'

// Next Imports
import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import { useTheme } from '@mui/material/styles'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const KycTimeline = () => {
  // Hooks
  const theme = useTheme()

  const [kycData, setKycData] = useState({
    count: 0,
    verified: 0,
    notVerified: 0,
    totalMonths: 0,
    monthlyData: []
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchKycData = async () => {
      try {
        // Fetch summary data
        const summaryResponse = await fetch(`${API_URL}/admin/kyc-summary`)

        if (!summaryResponse.ok) throw new Error('Failed to fetch summary data')
        const summaryData = await summaryResponse.json()

        // Fetch detailed KYC data
        const detailsResponse = await fetch(`${API_URL}/vendor/getallkyc`)

        if (!detailsResponse.ok) throw new Error('Failed to fetch detailed KYC data')
        const detailsData = await detailsResponse.json()

        // Process detailed data to count statuses
        const verifiedCount = detailsData.data.filter(item => item.status === "Verified").length
        const notVerifiedCount = detailsData.data.filter(item => item.status === "Not Verified").length

        // Process monthly data for chart
        const monthlyData = processMonthlyData(detailsData.data)

        setKycData({
          count: summaryData.count,
          verified: verifiedCount,
          notVerified: notVerifiedCount,
          totalMonths: summaryData.totalMonths,
          monthlyData
        })
      } catch (error) {
        console.error('Error fetching KYC data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    // Helper function to process monthly data
    const processMonthlyData = (kycItems) => {
      const monthlyCounts = {}

      kycItems.forEach(item => {
        const date = new Date(item.createdAt)
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!monthlyCounts[monthYear]) {
          monthlyCounts[monthYear] = { verified: 0, notVerified: 0 }
        }

        if (item.status === "Verified") {
          monthlyCounts[monthYear].verified++
        } else {
          monthlyCounts[monthYear].notVerified++
        }
      })

      return Object.entries(monthlyCounts).map(([month, counts]) => ({
        month,
        ...counts
      }))
    }

    fetchKycData()
  }, [])

  // Prepare chart series data
  const series = [
    {
      name: 'Verified',
      data: kycData.monthlyData.map(item => ({
        x: item.month,
        y: item.verified
      }))
    },
    {
      name: 'Not Verified',
      data: kycData.monthlyData.map(item => ({
        x: item.month,
        y: item.notVerified
      }))
    }
  ]

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '50%',
      },
    },
    colors: [
      'var(--mui-palette-success-main)',
      'var(--mui-palette-error-main)'
    ],
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      type: 'category',
      categories: kycData.monthlyData.map(item => item.month),
      labels: {
        formatter: function (val) {
          return val
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Applications'
      },
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    },
    grid: {
      strokeDashArray: 6,
      borderColor: 'var(--mui-palette-divider)',
    },
    responsive: [{
      breakpoint: 600,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading KYC data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 12, sm: 8 }} className='max-sm:border-be sm:border-ie'>
          <CardHeader
            title='Monthly KYC Applications'
            subheader={`Trend over last ${kycData.totalMonths} months`}
          />
          <CardContent>
            <AppReactApexCharts
              height={350}
              width='100%'
              type='bar'
              series={series}
              options={chartOptions}
            />
          </CardContent>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} className='flex flex-col'>
          <CardHeader
            title='Verification Summary'
            subheader={`From ${kycData.monthlyData[0]?.month || ''} to ${kycData.monthlyData[kycData.monthlyData.length - 1]?.month || ''}`}

          // action={<OptionMenu options={['Refresh', 'Export', 'Share']} />}
          />
          <CardContent className='flex flex-grow flex-col justify-center gap-6'>
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='success' variant='rounded'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z'
                    fill='currentColor'
                  />
                </svg>
              </CustomAvatar>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  Verified
                </Typography>
                <Typography variant='body2'>{kycData.verified} applications ({Math.round((kycData.verified / kycData.count) * 100)}%)</Typography>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='error' variant='rounded'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM17 15.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59Z'
                    fill='currentColor'
                  />
                </svg>
              </CustomAvatar>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  Not Verified
                </Typography>
                <Typography variant='body2'>{kycData.notVerified} applications ({Math.round((kycData.notVerified / kycData.count) * 100)}%)</Typography>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='info' variant='rounded'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z'
                    fill='currentColor'
                  />
                </svg>
              </CustomAvatar>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  Total KYC List
                </Typography>
                <Typography variant='body2'>{kycData.count} across {kycData.monthlyData.length} months</Typography>
              </div>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default KycTimeline
