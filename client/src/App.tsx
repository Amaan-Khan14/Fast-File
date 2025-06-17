import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import UploadSuccess from './pages/UploadSuccess';
import DownloadPage from './pages/DownloadPage';
import { Toaster } from './components/ui/toaster';
import AppBar from './components/ui/AppBar';
import WaveLines from './components/ui/Threas';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#090a15] via-[#0b1d23] to-[#090a15] relative">
        <div className="absolute inset-0 pointer-events-none">
          <WaveLines />
        </div>
        <div className="relative z-10">
          <AppBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/upload-success' element={<UploadSuccess />} />
            <Route path='/download/:fileId' element={<DownloadPage />} />
          </Routes>
          <Toaster />
        </div>
      </div>
    </Router>
  );
}
