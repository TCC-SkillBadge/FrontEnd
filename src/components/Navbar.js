import React from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css"; // Importa o arquivo CSS

const Navbar = ({ userType }) => {
  const renderNavItems = () => {
    switch (userType) {
      case "common":
        return (
          <>
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#wallet">Wallet</Nav.Link>
            <Nav.Link href="#skill-test">Skill Test</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
          </>
        );
      case "business":
        return (
          <>
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#plans">Plans</Nav.Link>
            <Nav.Link href="#badges">Badges</Nav.Link>
            <Nav.Link href="#contact">Contact</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
          </>
        );
      case "admin":
        return (
          <>
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#service-request">Service Request</Nav.Link>
            <Nav.Link href="#skills">Skills</Nav.Link>
            <Nav.Link href="#service-plans">Service Plans</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <BootstrapNavbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="custom-navbar"
    >
      <Container>
        <BootstrapNavbar.Brand href="#home">Brand</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">{renderNavItems()}</Nav>
          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Buscar"
              className="me-2 search-input"
              aria-label="Search"
            />
            <Button variant="outline-light" className="search-button">
              Search
            </Button>
          </Form>
          <Nav>
            <Nav.Link className="signin" href="#signin">
              Sign In
            </Nav.Link>
            <Nav.Link className="signup" href="#signup">
              Sign Up
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
