import './App.css';
import { Routes, Route, BrowserRouter} from 'react-router-dom';
import LoginPage from './pages/Login';
import WelcomePage from './pages/Welcome';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/Profile';
import Homepage from './pages/Homepage';


function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/home" element={<Homepage/>} />
        <Route path="/profile" element={<ProfilePage/>} />

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
