import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faGithub, faFacebook, faConnectdevelop, faGoogle } from "@fortawesome/free-brands-svg-icons";
import {faLightbulb, faBookmark} from "@fortawesome/free-regular-svg-icons";
import {faUsers, faBriefcase} from "@fortawesome/free-solid-svg-icons";
import {faUserPlus, faSignInAlt} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Container, Row, Col, Navbar, Nav, Form, Button } from 'react-bootstrap';
import './styles/styles.css';
import img1 from '../assets/working.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div>
      <Navbar bg="light" expand="lg" variant="light" className="fluid">
        <Container fluid>
          <Navbar.Brand href="#" className="ms-4">
            <span><FontAwesomeIcon icon={faConnectdevelop} /></span> Connectify
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ms-4">
              <Nav.Link href="#">Home</Nav.Link>
              <Nav.Link href="#">Features</Nav.Link>
              <Nav.Link href="#">Contact</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Button variant="contained" color="primary" className="me-2">
                <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Sign Up
              </Button>
              <Button variant="outline-primary">
                <FontAwesomeIcon icon={faSignInAlt} className="me-1" /> Sign In
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="p-5">
        <Row className="align-items-center g-5 m-0">
          <Col md={6} className="p-4">
            <h1 className="mb-3" style={{ fontSize: "48px", fontWeight: "bold" }}>
              Connect and Grow Your Network
            </h1>
            <p className="mb-4 text-secondary">
              Connectify is the premier professional networking platform for building meaningful connections and advancing your career.
            </p>
            <Row className="mb-4">
              <Col xs={6}>
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faUsers} style={{ fontSize: "2rem", marginRight: "0.5rem" }} />
                  <h6 className="ms-2">Networking</h6>
                </div>
                <p className="text-secondary">
                  Expand your professional network and connect with like-minded individuals.
                </p>
              </Col>
              <Col xs={6}>
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: "2rem", marginRight: "0.5rem" }} />
                  <h6 className="ms-2">Job Opportunities</h6>
                </div>
                <p className="text-secondary">
                  Discover new job opportunities and connect with potential employers.
                </p>
              </Col>
              <Col xs={6}>
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: "2rem", marginRight: "0.5rem" }} />
                  <h6 className="ms-2">Professional Growth</h6>
                </div>
                <p className="text-secondary">
                  Access resources and tools to develop your skills and advance your career.
                </p>
              </Col>
              <Col xs={6}>
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faBookmark} style={{ fontSize: "2rem", marginRight: "0.5rem" }} />
                  <h6 className="ms-2">Personalized Feed</h6>
                </div>
                <p className="text-secondary">
                  Stay up-to-date with the latest industry news and discussions.
                </p>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col xs={6}>
                <Button variant="dark" className="w-100">
                  Join Now
                </Button>
              </Col>
              <Col xs={6}>
                <Button variant="outline-dark" className="w-100">
                  Learn More
                </Button>
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <img src={img1} alt="Network" className="img-fluid"/>
          </Col>
        </Row>
        <Row className="align-items-center g-5 m-0">
          <Col md={6}>
            <img src={img1} alt="Career Growth" className="img-fluid" />
          </Col>
          <Col md={6}>
            <div className="p-4 border rounded-2">
              <h4 className="mb-3 fw-bold fs-3">Sign In</h4>
              <p className="mb-4 text-secondary">
                Enter your email and password to access your account, or sign in with a social account.
              </p>
              <Form onSubmit={handleSubmit}>
                <Form.Control
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  className="mb-3"
                />
                <Form.Control
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="mb-3"
                />
                <div className="text-center mb-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <hr className="mx-3" />
                    </div>
                    <div className="px-2 fw-bold text-uppercase">or</div>
                    <div className="flex-grow-1">
                      <hr className="mx-3" />
                    </div>
                  </div>
                </div>
                <Row className="mb-3">
                  <Col sm={4}>
                    <Button variant="outline-dark" className="w-100">
                      <FontAwesomeIcon icon={faGithub} className="me-1" />
                      GitHub
                    </Button>
                  </Col>
                  <Col sm={4}>
                    <Button variant="outline-dark" className="w-100">
                      <FontAwesomeIcon icon={faFacebook} className="me-1" />
                      Facebook
                    </Button>
                  </Col>
                  <Col sm={4}>
                    <Button variant="outline-dark" className="w-100">
                      <FontAwesomeIcon icon={faGoogle} className="me-1" />
                      Google
                    </Button>
                  </Col>
                </Row>
                <Button variant="dark" type="submit" className="w-100">
                  Sign In
                </Button>
              </Form>
              <div className="d-flex justify-content-between mt-2">
                <Nav.Link href="#" className="dark">Forgot password?</Nav.Link>
                <Nav.Link href="#" className="dark">Create an account</Nav.Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="py-5 bg-light">
        <Container fluid>
          <Row className="justify-content-around">
            <Col md={1}>
              <h6 className="fw-bold">Company</h6>
              <Nav.Link href="#" className="dark">About Us</Nav.Link>
              <Nav.Link href="#" className="dark">Our Team</Nav.Link>
              <Nav.Link href="#" className="dark">Careers</Nav.Link>
              <Nav.Link href="#" className="dark">News</Nav.Link>
            </Col>
            <Col md={1}>
              <h6 className="fw-bold">Products</h6>
              <Nav.Link href="#" className="dark">Networking</Nav.Link>
              <Nav.Link href="#" className="dark">Job Search</Nav.Link>
              <Nav.Link href="#" className="dark">Career Development</Nav.Link>
              <Nav.Link href="#" className="dark">Talent Solutions</Nav.Link>
            </Col>
            <Col md={1}>
              <h6 className="fw-bold">Resources</h6>
              <Nav.Link href="#" className="dark">Blog</Nav.Link>
              <Nav.Link href="#" className="dark">Help Center</Nav.Link>
              <Nav.Link href="#" className="dark">Webinars</Nav.Link>
              <Nav.Link href="#" className="dark">Case Studies</Nav.Link>
            </Col>
            <Col md={1}>
              <h6 className="fw-bold">Legal</h6>
              <Nav.Link href="#" className="dark">Privacy Policy</Nav.Link>
              <Nav.Link href="#" className="dark">Terms of Service</Nav.Link>
              <Nav.Link href="#" className="dark">Cookie Policy</Nav.Link>
            </Col>
            <Col md={1}>
              <h6 className="fw-bold">Contact</h6>
              <Nav.Link href="#" className="dark">Support</Nav.Link>
              <Nav.Link href="#" className="dark">Sales</Nav.Link>
              <Nav.Link href="#" className="dark">Press</Nav.Link>
              <Nav.Link href="#" className="dark">Partnerships</Nav.Link>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <div className="mt-4 text-secondary">
                <p>© 2024 Connectify. All rights reserved.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

    </div>
  );
}

export default LoginPage;
