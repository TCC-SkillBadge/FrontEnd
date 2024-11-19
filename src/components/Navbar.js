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

const NavBar = (props) => {
  const [token, setToken] = useState(() => props.token);
  const [user, setUser] = useState(() => props.user);
  const [userType, setUserType] = useState(() => props.userType);
  const [notifications, setNotifications] = useState([]); // Estado para notificações
  const [dropdownOpen, setDropdownOpen] = useState(false); // Estado para o dropdown
  const [search, setSearch] = useState(""); // Estado para a barra de pesquisa
  const navigate = useNavigate();
  const chatRef = useRef(null);

  useEffect(() => {
    if(token !== props.token) {
      setToken(() => props.token);
    }
    if(user !== props.user) {
      setUser(() => props.user);
    }
    if(userType !== props.userType) {
      setUserType(() => props.userType);
    }
  }, [props.token, props.user, props.userType]);


  useEffect(() => {
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

    let interval;
    if (token) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
    window.dispatchEvent(new Event("LoginChange"));
  };

  const handleClearNotifications = async () => {
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

  //Lista de páginas do menu e o tipo de usuário que pode acessá-las
  const menuPageCollection = [
    { page: "/home", title: "Home", user: 'any' },
    { page: "/about", title: "About", user: 'any' },
    { page: "/wallet", title: "Wallet", user: 'UC' },
    { page: "/proficiency-test", title: "Skill Test", user: 'UC' },
    { page: "/price", title: "Plans", user: 'UE' },
    { page: "/badges", title: "Badges", user: 'UE' },
    { page: "/contact", title: "Contact", user: 'UE' },
    { page: "/api-reference", title: "API Reference", user: 'UE' },
    { page: "/orders", title: "Service Request", user: 'UA' },
    { page: "/list-soft-skills", title: "Skills", user: 'UA' },
    { page: "/manage-test", title: "Test", user: 'UA' },
    { page: "/portfolio", title: "Portfolio", user: 'UC' },
    { page: "/price", title: "Service Plans", user: 'UA' },
  ];

  //Novo renderizador de itens do menu
  const renderNavItems = (renderType) => {
    const filteredPages = menuPageCollection.filter((page) => page.user === userType || page.user === 'any');

    if(renderType === 'nav') {
      return (
        <>
          {filteredPages.map((page) => (
            <Nav.Link as={NavLink} to={page.page} key={page.page}>
              {page.title}
            </Nav.Link>
          ))}
        </>
      );
    } else if(renderType === 'dropdown') {
      return (
        <>
          {filteredPages.map((page) => (
            <NavDropdown.Item as={NavLink} to={page.page} key={page.page}>
              {page.title}
            </NavDropdown.Item>
          ))}
        </>
      );
    }
  };

  const renderUserMenu = () => {
    const email = sessionStorage.getItem("email");
    const encodedEmail = email ? btoa(email) : null;
    const userImage = (
      user?.imageUrl ||
      sessionStorage.getItem("userImage") ||
      "/default-avatar.png"
    );

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
        className="user-menu"
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
    <button className="btn-chat" onClick={(e) => chatRef.current.toggle(e)}>
      <i className="bi bi-chat-left"></i>
    </button>
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if(search !== "") {
      console.log("Search: ", search);
      navigate('/general-search', { state: search });
      setSearch(() => "");
    }
  };

  return (
    <Navbar className="navbar" sticky="top">
      <Container fluid>
        <div className="flex flex-row align-items-center">
          <Navbar.Brand as={NavLink} to="/home">
            <img height={50} width='auto' src="/Icone.png"/>
          </Navbar.Brand>
          <div className="expanded-menu">
            <Nav className={"me-auto"}>
              {renderNavItems('nav')}
            </Nav>
          </div>
          <NavDropdown
          className={"collapsed-menu flex-1"}
          title={<i className="pi pi-align-justify" style={{fontSize: '2rem'}}/>}
          >
            {renderNavItems('dropdown')}
          </NavDropdown>
        </div>
        {
          token &&
          <Form className="d-flex mx-auto searchSection">
            <FormControl
              type="text"
              placeholder="Search"
              className="searchInput"
              value={search}
              onChange={(e) =>  setSearch(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleSearch(e); }}
            />
            <button className="search-btn" onClick={(e) => handleSearch(e)}>
              <i className="bi bi-search"/>
            </button>
          </Form>
        }
        <Nav className="ml-3">
          {user && (userType !== 'UA') && renderChat()}{" "}
          {/* Exibe o ícone do chat apenas se houver usuário e ele não for um usuário administrativo */}
          {user && renderNotifications()}{" "}
          {/* Exibe o sino de notificações apenas se houver usuário */}
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

        <OverlayPanel
          id="chat-panel"
          className="chatbox-panel"
          ref={chatRef}
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
