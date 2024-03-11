import { Routes, Route, Link} from 'react-router-dom'
import { Apply, Home, TrafficControl, TrafficPlan, Rentals, PPE, Signs, BollardsWheels, Email, WorX } from './pages';
import axios from 'axios';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast'


axios.defaults.baseURL = 'http://localhost:8000';
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
    <Route path="/emailform" element={<Email/>}/>
    <Route path="/materialworx" element={<WorX/>}/>
  </Routes>
</>

  );
}

export default App;
