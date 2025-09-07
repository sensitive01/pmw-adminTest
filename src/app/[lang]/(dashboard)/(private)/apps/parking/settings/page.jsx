// Next Imports
import dynamic from 'next/dynamic'

import Settings from '@/views/apps/parking/settings'

// Component Imports
// import Settings from '@views/apps/ecommerce/settings'

const StoreDetailsTab = dynamic(() => import('@/views/apps/parking/settings/store-details'))
const PaymentsTab = dynamic(() => import('@/views/apps/parking/settings/payments'))
const CheckoutTab = dynamic(() => import('@views/apps/parking/settings/checkout'))
const ShippingDeliveryTab = dynamic(() => import('@views/apps/parking/settings/ShippingDelivery'))
const LocationsTab = dynamic(() => import('@views/apps/parking/settings/locations'))
const NotificationsTab = dynamic(() => import('@views/apps/parking/settings/Notifications'))

// Vars
const tabContentList = () => ({
  'store-details': <StoreDetailsTab />,
  payments: <PaymentsTab />,
  checkout: <CheckoutTab />,
  'shipping-delivery': <ShippingDeliveryTab />,
  locations: <LocationsTab />,
  notifications: <NotificationsTab />
})

const eCommerceSettings = () => {
  return <Settings tabContentList={tabContentList()} />
}

export default eCommerceSettings
