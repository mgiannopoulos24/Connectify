import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConnectdevelop } from '@fortawesome/free-brands-svg-icons';
import { Button, Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './styles/styles.css'; // Make sure your styles are properly imported

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('/api/auth/register', formData);
      // Redirect to login page or another page after successful registration
      navigate('/login');
    } catch (err) {
      setErrorMessage('Registration failed');
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const backToWelcome = () => {
    navigate('/');
  };

  return (
    <>
      <Navbar bg="transparent" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#" className="ms-4 fw-bolder fs-3" onClick={backToWelcome}>
            <span><FontAwesomeIcon icon={faConnectdevelop} /></span> Connectify
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="w-100 p-4 border rounded" style={{ maxWidth: '400px' }}>
          <h2 className="text-left mb-4 fw-bold">Register</h2>
          {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
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
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                name="username"
                placeholder="Username" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group mb-3">
              <input 
                type="email" 
                className="form-control" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group mb-3 position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control pe-5" 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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
            <div className="form-group mb-3 position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control pe-5" 
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            <Button type="submit" className="btn btn-primary w-100 mt-3 rounded-pill">Register</Button>
          </form>
        </div>
      </Container>
      <div className="w-100 text-center mt-3">
        Already have an account? <Link to="/login" className='text-decoration-none fw-bold'>Sign In</Link>
      </div>
    </>
  );
};

export default RegisterPage;
