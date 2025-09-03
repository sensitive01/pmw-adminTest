'use client'
import { useRouter } from 'next/navigation';
// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Components
import classnames from 'classnames'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const Award = () => {
  // Hooks
  const theme = useTheme()
  const [vendorCount, setVendorCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter();

  useEffect(() => {
    const fetchVendorCount = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/vendor-count`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setVendorCount(data.count)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchVendorCount()
  }, [])

  return (
    <Card className='relative bs-full'>
      <CardContent>
        <div className='flex flex-col items-start gap-2.5'>
          <div className='flex flex-col'>
            <Typography variant='h5'>
              Congratulations <span className='font-bold'>ParkMyWheels!</span> 🎉
            </Typography>
            {/* <Typography variant='subtitle1'>Best seller of the month</Typography> */}
          </div>
          <div className='flex flex-col'>
            {loading ? (
              <div className='flex items-center gap-2'>
                <CircularProgress size={20} />
                <Typography>Loading vendor count...</Typography>
              </div>
            ) : error ? (
              <Typography color='error'>{error}</Typography>
            ) : (
              <>
                <Typography variant='h5' color='primary.main'>
                  {vendorCount} {vendorCount === 1 ? 'Vendor' : 'Vendors'}
                </Typography>
                <Typography>Active on platform</Typography>
              </>
            )}
          </div>
          <Button size='small' variant="contained"
            sx={{ backgroundColor: '#329a73' }}
            onClick={() => router.push('/en/apps/parking/vendors/list')}
          >

            View Vendors
          </Button>

        </div>
        <img
          src='/images/cards/trophy.png'
          className={classnames('is-[106px] absolute block-end-0 inline-end-5', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </CardContent>
    </Card>
  )
}

export default Award
