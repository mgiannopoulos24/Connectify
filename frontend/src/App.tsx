import Homepage from "./pages/Homepage"
import { Register } from "./pages/Register"
import { Login } from "./pages/Login"
import { AdminPage } from "./pages/admin/AdminPage"
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
    </>
  )
}

export default App