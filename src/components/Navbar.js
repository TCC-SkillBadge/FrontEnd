import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Form,
  FormControl,
  Image,
} from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const NavBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserType = sessionStorage.getItem("tipoUsuario");
    const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    if (storedUserType) {
      setUserType(storedUserType);
    }

    if (storedUserInfo) {
      setUser(storedUserInfo);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const renderNavItems = () => {
    switch (userType) {
      case "UC":
        return (
          <>
            <Nav.Link as={NavLink} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/wallet">
              Wallet
            </Nav.Link>
            <Nav.Link as={NavLink} to="/skill-test">
              Skill Test
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about">
              About
            </Nav.Link>
          </>
        );
      case "UE":
        return (
          <>
            <Nav.Link as={NavLink} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/price">
              Plans
            </Nav.Link>
            <Nav.Link as={NavLink} to="/badges">
              Badges
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact">
              Contact
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about">
              About
            </Nav.Link>
          </>
        );
      case "UA":
        return (
          <>
            <Nav.Link as={NavLink} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/orders">
              Service Request
            </Nav.Link>
            <Nav.Link as={NavLink} to="/skills">
              Skills
            </Nav.Link>
            <Nav.Link as={NavLink} to="/price">
              Service Plans
            </Nav.Link>
          </>
        );
      default:
        return (
          <>
            <Nav.Link as={NavLink} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about">
              About
            </Nav.Link>
          </>
        );
    }
  };

  const renderUserMenu = () => {
    let menuItems;
    switch (userType) {
      case "UC":
        menuItems = (
          <>
            <NavDropdown.Item as={NavLink} to="/profile">
              <i className="bi bi-person"></i> Profile
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/config">
              <i className="bi bi-gear"></i> Config
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/portfolio">
              <i className="bi bi-briefcase"></i> Portfolio
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Log Out
            </NavDropdown.Item>
          </>
        );
        break;
      case "UE":
        menuItems = (
          <>
            <NavDropdown.Item as={NavLink} to="/profile">
              <i className="bi bi-person"></i> Profile
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/config">
              <i className="bi bi-gear"></i> Config
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/analysis">
              <i className="bi bi-bar-chart"></i> Analysis
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Log Out
            </NavDropdown.Item>
          </>
        );
        break;
      case "UA":
        menuItems = (
          <>
            <NavDropdown.Item as={NavLink} to="/profile">
              <i className="bi bi-person"></i> Profile
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/config">
              <i className="bi bi-gear"></i> Config
            </NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/analytics">
              <i className="bi bi-bar-chart"></i> Analytics
            </NavDropdown.Item>{" "}
            {/* Link de Analytics adicionado */}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Log Out
            </NavDropdown.Item>
          </>
        );
        break;
      default:
        menuItems = null;
    }

    return (
      <NavDropdown
        title={
          user && user.image ? (
            <Image src={user.image} roundedCircle width="40" height="40" />
          ) : (
            <i className="bi bi-person-circle userAvatar"></i>
          )
        }
        id="user-menu"
        alignRight
        show={showMenu}
        onClick={() => setShowMenu(!showMenu)}
        className={showMenu ? "show" : "hide"}
      >
        {menuItems}
      </NavDropdown>
    );
  };

  return (
    <Navbar expand="lg" className="navbar">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/home">
          Brand
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">{renderNavItems()}</Nav>
          <Form className="d-flex mx-auto searchSection">
            <FormControl
              type="text"
              placeholder="Buscar"
              className="searchInput"
            />
          </Form>
          <Nav>
            {user ? (
              renderUserMenu()
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="signIn">
                  Sign In
                </Nav.Link>
                <Nav.Link as={NavLink} to="/cadastro" className="signUp">
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
