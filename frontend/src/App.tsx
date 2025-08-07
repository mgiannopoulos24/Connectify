import Homepage from "./pages/Homepage"
import { Register } from "./pages/Register"
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </>
  )
}

export default App
