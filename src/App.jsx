import { Routes, Route, Navigate} from 'react-router-dom'
import { About, CancelJob, AdminLog, AdminDashboard, Contact, Apply, Home, TrafficControl, TrafficPlan, Rentals, PPE, Signs, BollardsWheels, Error, TService, Product } from './pages';
import axios from 'axios';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast'
import { isAdminAuthenticated } from './utils/auth';

 axios.defaults.baseURL = 'https://tbs-server.onrender.com'; 
/* axios.defaults.baseURL = 'http://localhost:8000';*/
axios.defaults.withCredentials = true


function App() {
  return (
    <>
<Navbar />
  <Toaster position='bottom-right' toastOptions={{duration: 2000}} />
  <Routes>
    <Route path="/applynow" element={<Apply/>}/>
    <Route path="/" element={<Home/>}/>
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
    <Route path="/admin-dashboard"
        element={isAdminAuthenticated() ? <AdminDashboard /> : <Navigate to="/admin-login" />}
/>
    <Route path="/cancel-job/:id" element={<CancelJob />} />
  </Routes>
</>

  );
}

export default App;
