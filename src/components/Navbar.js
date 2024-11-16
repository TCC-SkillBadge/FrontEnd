import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Form,
  FormControl,
  Image,
  Badge,
  Dropdown,
  Button,
} from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { OverlayPanel } from "primereact/overlaypanel";
import ChatBox from "./ChatBox";
import "../styles/Navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const NavBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const op = useRef(null);

  useEffect(() => {
    const storedUserType = sessionStorage.getItem("tipoUsuario");
    const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    const token = sessionStorage.getItem("token");

    if (storedUserType) {
      setUserType(storedUserType);
    }

    if (storedUserInfo) {
      setUser(storedUserInfo);
    }

    if (token) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(
            "http://localhost:7004/admin/notificacoes",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.status === 200) {
            setNotifications(response.data);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleClearNotifications = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:7004/admin/limpar-notificacoes",
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
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
            <Nav.Link as={NavLink} to="/proficiency-test">
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
            <Nav.Link as={NavLink} to="/api-reference">
              API Reference
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
            <Nav.Link as={NavLink} to="/list-soft-skills">
              Skills
            </Nav.Link>
            <Nav.Link as={NavLink} to="/manage-test">
              Test
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
  const email = sessionStorage.getItem("email"); // Obtém o email do sessionStorage
  const encodedEmail = email ? btoa(email) : null; // Codifica o email em Base64
  const userImage =
    user?.imageUrl ||
    sessionStorage.getItem("userImage") ||
    "/default-avatar.png"; // Fallback para avatar padrão

  let menuItems;

  switch (userType) {
    case "UC":
      menuItems = (
        <>
          <NavDropdown.Item
            as={NavLink}
            to={encodedEmail ? `/profile/${encodedEmail}` : "/profile"}
          >
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
          <NavDropdown.Item
            as={NavLink}
            to={encodedEmail ? `/profile/${encodedEmail}` : "/profile"}
          >
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
          <NavDropdown.Item
            as={NavLink}
            to={encodedEmail ? `/profile/${encodedEmail}` : "/profile"}
          >
            <i className="bi bi-person"></i> Profile
          </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/config">
            <i className="bi bi-gear"></i> Config
          </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/analytics">
            <i className="bi bi-bar-chart"></i> Analytics
          </NavDropdown.Item>
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
        <Image
          src={userImage}
          roundedCircle
          width="40"
          height="40"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
      }
      id="user-menu"
      alignRight
      show={showMenu}
      onClick={() => setShowMenu((prev) => !prev)}
      className={showMenu ? "show" : "hide"}
    >
      {menuItems}
    </NavDropdown>
  );
};


  const renderNotifications = () => {
    if (!user) return null;

    return (
      <Dropdown
        show={dropdownOpen}
        onToggle={() => setDropdownOpen(!dropdownOpen)}
        align="end"
      >
        <Dropdown.Toggle
          variant="link"
          id="dropdown-notifications"
          className="notification-toggle"
        >
          <i className="bi bi-bell"></i>
          {notifications.length > 0 && (
            <Badge pill bg="danger" className="notification-badge">
              {notifications.length}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="notifications-dropdown">
          {notifications.length === 0 ? (
            <Dropdown.Item disabled>No new notifications</Dropdown.Item>
          ) : (
            <>
              {notifications.map((notification) => (
                <Dropdown.Item key={notification.id}>
                  <strong>{notification.canal}:</strong> {notification.mensagem}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item as="div" className="text-center">
                <Button variant="link" onClick={handleClearNotifications}>
                  Clear Notifications
                </Button>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderChat = () => (
    <button className="btn-chat" onClick={(e) => op.current.toggle(e)}>
      <i className="bi bi-chat-left"></i>
    </button>
  );

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
              placeholder="Search"
              className="searchInput"
            />
          </Form>
          <Nav>
            {user && userType !== "UA" && renderChat()}
            {user && renderNotifications()}
            {user ? (
              renderUserMenu()
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="signIn">
                  Sign In
                </Nav.Link>
                <Nav.Link as={NavLink} to="/create" className="signUp">
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
        <OverlayPanel
          id="chat-panel"
          className="chatbox-panel"
          ref={op}
          dismissable={false}
          showCloseIcon
        >
          <ChatBox />
        </OverlayPanel>
      </Container>
    </Navbar>
  );
};

export default NavBar;
