import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Regitser';
import Signin from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserHome from './pages/UserHome';
import Home from './pages/Home';
import UploadSuccess from './pages/UploadSuccess';
import DownloadPage from './pages/DownloadPage';

export default function MyComponent() {
  return (

    <Router>
      <div className="bg-[#090a15] h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/upload-success' element={<UploadSuccess />} />
          <Route path='/download/:fileId' element={<DownloadPage />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Signin />} />
          <Route path='/user/dashboard' element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}