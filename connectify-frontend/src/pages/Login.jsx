import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Navbar } from 'react-bootstrap';
import './styles/styles.css';

const LoginPage = () => {
  // State to manage password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <Navbar bg="transparent" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#home" className="ms-4">Connectify</Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="w-100 p-4 border rounded" style={{ maxWidth: '400px' }}>
          <h2 className="text-left mb-4 fw-bold">Log In</h2>
          <div className='d-flex flex-column align-items-center'>
            <Button className='btn btn-light text-dark border rounded-pill px-4 py-2 mb-2 w-100' id="continue-btn">
              <i className="fab fa-google me-2"></i>Continue with Google
            </Button>
            <Button className='btn btn-light text-dark border rounded-pill px-4 py-2 w-100' id="continue-btn">
              <i className='fab fa-apple me-2'></i>Continue with Apple
            </Button>
          </div>
          <div className='d-flex align-items-center my-3'>
            <div className='flex-grow-1 border-top'></div>
            <span className='mx-3 text-muted'>OR</span>
            <div className='flex-grow-1 border-top'></div>
          </div>
          <form>
            <div className="form-group mb-3">
              <input type="email" className="form-control" placeholder="Email" required />
            </div>
            <div className="form-group mb-3 position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control pe-5" 
                placeholder="Password"
                required
              />
              <Button
                type="button"
                className={`btn btn-light position-absolute top-50 end-0 rounded-pill text-dark px-2 py-1 border fw-bold`}
                style={{ right: '5px', fontSize: '0.75rem', transform: 'translateY(-50%)'}} 
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="w-100 text-left mt-3 py-0 mt-0">
              <Link to="/forgot-password" className='text-muted text-decoration-none' style={{ fontSize: '12px' }}>Forgot Password?</Link>
            </div>
            <Button type="submit" className="btn btn-primary w-100 mt-3 rounded-pill">Log In</Button>
          </form>
        </div>
      </Container>
      <div className="w-100 text-center mt-3">
        Don’t have an account? <Link to="/register" className='text-decoration-none fw-bold'>Register</Link>
      </div>
    </>
  );
};

export default LoginPage;
