import './App.css';
import LoginPage from './pages/Login';
import { Routes, Route, BrowserRouter} from 'react-router-dom';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
