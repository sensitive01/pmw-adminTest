'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import {
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import classnames from 'classnames'
import Logo from '@components/layout/shared/Logo'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'

const Login = () => {
  const { lang: locale } = useParams()
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        mobile,
        password,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Redirect to dashboard on success
      router.push("/dashboards/crm")
    } catch (error) {
      setError(error.message || "Login failed. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div className={classnames(
        'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
        'w-full' // Add full width
      )}>
        <div className='absolute inset-0 w-full h-full'> {/* Full-covering container */}
          <img
            src='/images/illustrations/auth/final.gif'
            alt='Login animation'
            className='w-full h-full object-cover' // Cover entire space
          />
        </div>
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div className='flex flex-col items-center mb-4'> 
            <div className='mb-4 scale-550'>
              <Logo />
            </div>
            <Typography variant='h4' className='text-center'>
              {`Welcome to ${themeConfig.templateName}ParkMyWheels`}
            </Typography>
            <Typography className='text-center'>
              Login to Continue
            </Typography>
          </div>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <TextField
              fullWidth
              label="Mobile"
              value={mobile}
              onChange={(e) => {
                const input = e.target.value
                if (/^\d{0,10}$/.test(input)) {
                  setMobile(input)
                }
              }}
              required
              inputMode="numeric"
              placeholder="Enter 10-digit mobile number"
            />

            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type={isPasswordShown ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setIsPasswordShown(!isPasswordShown)}
                      edge="end"
                    >
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
              {/* <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale)}
              >
                Forgot password?
              </Typography> */}
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            {/* <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/pages/auth/register-multi-steps', locale)} color='primary.main'>
                Create an account
              </Typography>
            </div> */}
          </form>

          <Divider className='gap-3'></Divider>
        </div>
      </div>
    </div>
  )
}

export default Login
