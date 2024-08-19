import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faConnectdevelop} from "@fortawesome/free-brands-svg-icons";
import {faLightbulb, faBookmark, faNewspaper} from "@fortawesome/free-regular-svg-icons";
import {faUsers, faBriefcase} from "@fortawesome/free-solid-svg-icons";
import {faUserPlus, faSignInAlt} from "@fortawesome/free-solid-svg-icons";
import { Container, Row, Col, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import img1 from '../assets/working.jpg';
import konami from '../assets/Konami.png';
import sony from '../assets/Sony.png';
import nintendo from '../assets/nintendo.png';
import ghost from '../assets/ghostbusters.jpg';
import nord from '../assets/nord.jpg';
import sklavos from '../assets/sklavos.png';
import forall from '../assets/forallsecure.png';
import fsociety from '../assets/fsociety.png';
import allsafe from '../assets/allsafe.jpg';

const WelcomePage = () => {

  const formRef = useRef(null);

  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  }

  const handleSignUp = () => {
    navigate('/register');
  }

  return (
    <div>
      <Navbar bg="light" expand="lg" variant="light" className="fluid">
        <Container fluid>
          <Navbar.Brand href="#" className="ms-4 fw-bolder fs-3">
            <span><FontAwesomeIcon icon={faConnectdevelop}/></span> Connectify
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav"/>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#" className="me-3">
                <div className="nav-link-content">
                  <FontAwesomeIcon icon={faNewspaper}/>
                  <span>Articles</span>
                </div>
              </Nav.Link>
              <Nav.Link href="#" className="me-3">
                <div className="nav-link-content">
                  <FontAwesomeIcon icon={faUsers}/>
                  <span>People</span>
                </div>
              </Nav.Link>
              <Nav.Link href="#" className="me-3">
                <div className="nav-link-content">
                  <FontAwesomeIcon icon={faBriefcase}/>
                  <span>Jobs</span>
                </div>               
              </Nav.Link>
              <Button variant="contained" color="primary" className="me-2 rounded-pill" onClick={handleSignUp}>
                <FontAwesomeIcon icon={faUserPlus} className="me-1" /> Sign Up
              </Button>
              <Button variant="outline-primary" className="rounded-pill" onClick={handleSignIn}>
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
            <Row className="mb-4 justify-content-center">
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
        <Row className="align-items-center g-5 m-0" ref={formRef}>
          <Col md={6}>
            <img src={img1} alt="Career Growth" className="img-fluid" />
          </Col>
        </Row>
      </Container>
      <Row className="align-items-center justify-content-center g-5 m-0" style={{fontSize: "2.5rem", fontWeight:"bold"}}>
          Our Customers
        <Row>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={konami}
              width={140}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={sony}
              width={140}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={nintendo}
              width={250}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.7"}}
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={ghost}
              width={300}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.7"}}
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={nord}
              width={400}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.7"}}
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={sklavos}
              width={500}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.7"}}
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={forall}
              width={500}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.4"}}
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={fsociety}
              width={500}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.5"}}
            />
          </Col>
          <Col xs={4} className="d-flex justify-content-center mb-4">
            <img
              src={allsafe}
              width={250}
              height={70}
              alt="Customer Logo"
              className="img-fluid rounded-lg"
              style={{scale: "0.7"}}
            />
          </Col>
        </Row>
      </Row>
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

export default WelcomePage;
