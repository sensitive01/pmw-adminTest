// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import Award from '@views/dashboards/crm/Award'
import CardStatVertical from '@components/card-statistics/Vertical'
import DonutChart from '@views/dashboards/crm/DonutChart'
import OrganicSessions from '@views/dashboards/crm/OrganicSessions'
import ProjectTimeline from '@views/dashboards/crm/ProjectTimeline'
import WeeklyOverview from '@views/dashboards/crm/WeeklyOverview'
// import SocialNetworkVisits from '@views/dashboards/crm/SocialNetworkVisits'
import MonthlyBudget from '@views/dashboards/crm/MonthlyBudget'
// import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
// import ExternalLinks from '@views/dashboards/crm/ExternalLinks'
// import PaymentHistory from '@views/dashboards/crm/PaymentHistory'
// import SalesInCountries from '@views/dashboards/crm/SalesInCountries'
// import UserTable from '@views/dashboards/crm/UserTable'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Data Imports
import { getUserData } from '@/app/server/actions'

const API_URL = process.env.NEXT_PUBLIC_API_URL 

const getBookingData = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/booking-count`)
    
    if (!res.ok) {
      throw new Error('Failed to fetch booking data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching booking data:', error)
    return { count: 0, totalMonths: 0 }
  }
}

const getUserSummaryData = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/user-summary`)
    
    if (!res.ok) {
      throw new Error('Failed to fetch user summary data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching user summary data:', error)
    return { count: 0, totalMonths: 0 }
  }
}

const getSpaceSummaryData = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/space-summary`)
    
    if (!res.ok) {
      throw new Error('Failed to fetch space summary data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching space summary data:', error)
    return { count: 0, totalMonths: 0 }
  }
}

const DashboardCRM = async () => {
  // Fetch all data in parallel
  const [data, bookingData, userSummaryData, spaceSummaryData, serverMode] = await Promise.all([
    getUserData(),
    getBookingData(),
    getUserSummaryData(),
    getSpaceSummaryData(),
    getServerMode()
  ])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        <CardStatVertical
          stats={bookingData.count.toString()}
          title='Total Bookings'
          trendNumber=''
          // chipText={`${bookingData.totalMonths} Month${bookingData.totalMonths !== 1 ? 's' : ''}`}
          avatarColor='primary'
          avatarIcon='ri-calendar-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        <CardStatVertical
          stats={userSummaryData.count.toString()}
          title='Total Customers'
          trendNumber=''
          // chipText={`${userSummaryData.totalMonths} Month${userSummaryData.totalMonths !== 1 ? 's' : ''}`}
          avatarColor='success'
          avatarIcon='ri-user-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        <CardStatVertical
          stats={spaceSummaryData.count.toString()}
          title='Total MySpaces'
          trendNumber=''
          // chipText={`${spaceSummaryData.totalMonths} Month${spaceSummaryData.totalMonths !== 1 ? 's' : ''}`}
          avatarColor='info'
          avatarIcon='ri-home-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        <DonutChart />
      </Grid>
      <Grid item xs={12} md={4}>
        <OrganicSessions />
      </Grid>
      <Grid item xs={12} md={8}>
        <ProjectTimeline />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <WeeklyOverview />
      </Grid>
      {/* <Grid item xs={12} sm={6} md={4}>
        <SocialNetworkVisits />
      </Grid> */}
      <Grid item xs={12} sm={6} md={4}>
        <MonthlyBudget />
      </Grid>
      {/* <Grid item xs={12} sm={6} md={4}>
        <MeetingSchedule />
      </Grid> */}
      {/* <Grid item xs={12} sm={6} md={4}>
        <ExternalLinks />
      </Grid> */}
      {/* <Grid item xs={12} sm={6} md={4}>
        <PaymentHistory serverMode={serverMode} />
      </Grid> */}
      {/* <Grid item xs={12} md={4}>
        <SalesInCountries />
      </Grid> */}
      {/* <Grid item xs={12} md={8}>
        <UserTable tableData={data} />
      </Grid> */}
    </Grid>
  )
}

export default DashboardCRM
