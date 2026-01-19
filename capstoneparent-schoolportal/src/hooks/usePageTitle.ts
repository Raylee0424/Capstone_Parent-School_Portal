import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Home | Parent-School Portal',
  '/announcements': 'Announcements | Parent-School Portal',
  '/forgotpassword': 'Forgot Password | Parent-School Portal',
  '/login': 'Login | Parent-School Portal',
  '/register': 'Register | Parent-School Portal',
  '/partnership&events' : 'Partnership & Events | Parent-School Portal',

  '/contactus': 'Contact Us | Parent-School Portal',
  '/history': 'History | Parent-School Portal',
  '/orginizationalchart': 'Orginizational Chart | Parent-School Portal',
  '/schoolcalendar': 'School Calendar | Parent-School Portal',
  '/transparency': 'Transparency | Parent-School Portal',
  '/visionandmission': 'Vision And Mission | Parent-School Portal',
  
}

export const usePageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'Parent-School Portal'
    document.title = title
  }, [location.pathname])
}
