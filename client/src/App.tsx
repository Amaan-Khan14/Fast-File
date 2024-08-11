import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Signup from './pages/Regitser';
import Signin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import UploadSuccess from './pages/UploadSuccess';
import DownloadPage from './pages/DownloadPage';
import { Toaster } from './components/ui/toaster';
import AppBar from './components/ui/AppBar';




const AppBarWrapper: React.FC = () => {
  const location = useLocation();
  const hideAppBarPaths = ['/signup', '/login'];

  return (
    <>
      {!hideAppBarPaths.includes(location.pathname) && <AppBar />}
    </>
  );
};

export default function App() {
  return (
    <Router>
      <div className="bg-[#090a15] min-h-screen">
        <AppBarWrapper />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/upload-success' element={<UploadSuccess />} />
            <Route path='/download/:fileId' element={<DownloadPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Signin />} />
            <Route path='/user/dashboard' element={<Dashboard />} />
          </Routes>
          <Toaster />
        </div>
    </Router>
  );
}
