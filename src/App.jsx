import { Routes, Route, Navigate} from 'react-router-dom'
import { About, Invoice, Work, ManageJobTest, CancelJobTest, ManageJob, CancelJob, AdminLog, AdminDashboard, Contact, Apply, Home, TrafficControl, TrafficPlan, Rentals, PPE, Signs, BollardsWheels, Error, TService, Product, TrafficControlTest } from './pages';
import axios from 'axios';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast'
import { isAdminAuthenticated } from './utils/auth';
import EmployeeLogin from './pages/employee-login';
import RequireEmployee from './components/RequireEmployee';
 axios.defaults.baseURL = 'https://tbs-server.onrender.com'; 
/* axios.defaults.baseURL = 'http://localhost:8000';*/
axios.defaults.withCredentials = true

// Add axios interceptor to include JWT token in requests
axios.interceptors.request.use(
  (config) => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      const { token } = JSON.parse(adminUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminUser');
      if (window.location.pathname !== '/admin-login') {
        window.location.href = '/admin-login';
      }
    }
    return Promise.reject(error);
  }
);
function App() {
  return (
    <>
<Navbar />
  <Toaster position='bottom-right' toastOptions={{duration: 2000}} />
  <Routes>
    <Route path="/applynow" element={<Apply/>}/>
    <Route path="/" element={<Home/>}/>
<Route path="/work-order/:legacyId" element={<Navigate to="/work-order" replace />} />
     <Route
    path="/work-order"
    element={
      <RequireStaff>
        <Work />
      </RequireStaff>
    }
  />
    <Route path="/trafficcontrol" element={<TrafficControl/>}/>
    <Route path="/trafficplanning" element={<TrafficPlan/>}/>
    <Route path="/rentals" element={<Rentals/>}/>
    <Route path="/ppe" element={<PPE/>}/>
    <Route path="/signs" element={<Signs/>}/>
    <Route path="/bollardswheels" element={<BollardsWheels/>}/>
    <Route path="*" element={<Error/>}/>
    <Route path="/traffic-control-services" element={<TService/>}/>
    <Route path="/product-services" element={<Product/>}/>
    <Route path="/contact-us" element={<Contact/>}/>
    <Route path="/about-us" element={<About/>}/>
    <Route path="/admin-login" element={<AdminLog />} />
   <Route path="/traffic-control-test-page" element={<TrafficControlTest />} />
   <Route path="/manage-job-test/:id" element={<ManageJobTest/>} />
   <Route path="/cancel-job-test/:id" element={<CancelJobTest/>} />
   <Route path="/billing/invoices" element={<Invoice />} />
    <Route path="/admin-dashboard"
        element={isAdminAuthenticated() ? <AdminDashboard /> : <Navigate to="/admin-login" />}
/>
    <Route path="/cancel-job/:id" element={<CancelJob />} />
    <Route path="/work-order/:id" element={<Work />} />
   <Route path="/manage-job/:id" element={<ManageJob />} />
  </Routes>
</>

  );
}

export default App;
