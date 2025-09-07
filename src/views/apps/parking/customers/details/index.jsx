// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerDetailsHeader from './CustomerDetailsHeader'
import CustomerLeftOverview from './customer-left-overview'
import CustomerRight from './customer-right'




const OverViewTab = dynamic(() => import('@/views/apps/user/view/user-right/overview'))
const SecurityTab = dynamic(() => import('./customer-right/security'))
const NotificationsTab = dynamic(() => import('@/views/apps/user/view/user-right/notifications'))

const AddressBillingTab = dynamic(
  () => import('./customer-right/address-billing')
)

// Vars
const tabContentList = () => ({
  overview: <OverViewTab />,
  security: <SecurityTab />,
  addressBilling: <AddressBillingTab />,
  notifications: <NotificationsTab />
})

const CustomerDetails = ({ customerData, customerId }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerDetailsHeader customerId={customerId} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomerLeftOverview customerData={customerData} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <CustomerRight tabContentList={tabContentList()} />
      </Grid>
    </Grid>
  )
}

export default CustomerDetails
