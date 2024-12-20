import { Routes, Route } from 'react-router-dom';
import {
  About, Contact, Apply, Home, TrafficControl, TrafficPlan, Rentals, PPE, Signs, BollardsWheels, Error, TService, Product } from './pages';
import axios from 'axios';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

axios.defaults.baseURL = 'https://tbs-server.onrender.com';
/* axios.defaults.baseURL = 'http://localhost:8000'; */
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <Navbar />
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />
        
        {/* Apply Now Route */}
        <Route path="/applynow" element={<Apply />} />

        {/* Traffic Control Services (Nested Routes) */}
        <Route path="/traffic-control-services" element={<TService />}>
          <Route path="trafficcontrol" element={<TrafficControl />} />
          <Route path="trafficplanning" element={<TrafficPlan />} />
          <Route path="rentals" element={<Rentals />} />
        </Route>

        {/* Product Services (Nested Routes) */}
        <Route path="/product-services" element={<Product />}>
          <Route path="bollardswheels" element={<BollardsWheels />} />
          <Route path="signs" element={<Signs />} />
          <Route path="ppe" element={<PPE />} />
        </Route>

        {/* Static Routes */}
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/about-us" element={<About />} />

        {/* Fallback Route */}
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
