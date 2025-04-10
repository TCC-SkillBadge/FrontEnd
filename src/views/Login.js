import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeFill, LockFill, Eye, EyeSlash } from "react-bootstrap-icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../components/ConfirmationModal"; // Import the modal component
import "../styles/Login.css";
import "../styles/GlobalStylings.css";

// Definindo as variáveis de ambiente
const API_COMUM = process.env.REACT_APP_API_COMUM;
const API_ENTERPRISE = process.env.REACT_APP_API_ENTERPRISE;
const API_ADMIN = process.env.REACT_APP_API_ADMIN;
const API_BADGES = process.env.REACT_APP_API_BADGE; // Adicione esta variável para o serviço de badges

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginFailed, setLoginFailed] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State to control the confirmation modal
  const [confirmationMessage, setConfirmationMessage] = useState(""); // State to hold the confirmation message
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    const passwordInput = document.querySelector("#password");
    if (showPassword) {
      setShowPassword(false);
      passwordInput.type = "password";
    } else {
      setShowPassword(true);
      passwordInput.type = "text";
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleLogin = async (
    url,
    data,
    method = "post",
    params = {},
    headers = {}
  ) => {
    console.log("Remember me: ", rememberMe);
    try {
      const response = await axios({
        url,
        method,
        data,
        params,
        headers,
      });
      if (response.status === 200) {
        const { token, tipoUsuario } = response.data;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("tipoUsuario", tipoUsuario);

        if (rememberMe) {
          console.log("Entered Remember me for token and tipoUsuario");
          localStorage.setItem("token", token);
          localStorage.setItem("tipoUsuario", tipoUsuario);
        }

        let userInfoResponse;
        if (tipoUsuario === "UC") {
          userInfoResponse = await axios.get(`${API_COMUM}/api/user/info`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: { userType: "UC" },
          });
        } else if (tipoUsuario === "UE") {
          userInfoResponse = await axios.get(
            `${API_ENTERPRISE}/api/acessar-info-usuario-jwt`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { userType: "UE" },
            }
          );
        } else if (tipoUsuario === "UA") {
          userInfoResponse = await axios.get(`${API_ADMIN}/admin/acessa-info`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: { userType: "UA" },
          });
        }

        if (userInfoResponse && userInfoResponse.status === 200) {
          const userInfo = userInfoResponse.data;

          // Salve o email original e o codificado
          const email =
            tipoUsuario === "UC" ? userInfo.email : userInfo.email_comercial;
          if (email) {
            sessionStorage.setItem("email", email); // Email original
            sessionStorage.setItem("encodedEmail", btoa(email)); // Email codificado

            if (rememberMe) {
              console.log("Entered Remember me for email");
              localStorage.setItem("email", email);
              localStorage.setItem("encodedEmail", btoa(email));
            }
          }

          sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
          if (rememberMe) {
            console.log("Entered Remember me for userInfo");
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
          }
          return true;
        }
      }
    } catch (error) {
      console.error(`Error logging in at ${url}:`, error);
    }
    return false;
  };

  // Função para confirmar a badge após o login
  const confirmBadge = async (token) => {
    const toastId = toast.loading("Confirming badge...");
    try {
      // Verificar se a URL da API está definida
      if (!API_BADGES) {
        console.error("Erro: API_BADGES não está definida.");
        return;
      }

      // Log da URL completa para confirmação
      const fullUrl = `${API_BADGES}/badges/confirm-badge`;
      console.log("URL de confirmação da badge:", fullUrl);

      // Enviar a solicitação para confirmar a badge
      const response = await axios.get(`${API_BADGES}/badges/confirm-badge`, {
        params: { token },
      });

      if (response.status === 200) {
        toast.update(toastId, {
          render: "Badge confirmed successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        localStorage.removeItem("badgeConfirmationToken");
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Error confirming the badge. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      localStorage.removeItem("badgeConfirmationToken");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginFailed(false);

    const loginEndpoints = [
      {
        url: `${API_COMUM}/api/user/login`,
        data: { email: formData.email, password: formData.password },
        method: "post",
      },
      {
        url: `${API_ADMIN}/admin/login`,
        data: {
          email_admin: formData.email,
          senha: formData.password,
        },
        method: "post",
      },
      {
        url: `${API_ENTERPRISE}/api/login`,
        data: {
          email_comercial: formData.email,
          senha: formData.password,
        },
        method: "post",
      },
    ];

    const loginPromises = loginEndpoints.map((endpoint) =>
      handleLogin(endpoint.url, endpoint.data, endpoint.method, endpoint.params)
    );

    toast.promise(
      Promise.all(loginPromises).then((results) => {
        if (results.some((success) => success)) {
          toast.success("Login successful!");
          setTimeout(() => {
            navigate("/home");
            // Após o login, verificar se há um token de confirmação e confirmar a badge
            const confirmationToken = localStorage.getItem(
              "badgeConfirmationToken"
            );
            if (confirmationToken) {
              confirmBadge(confirmationToken);
            }
            // Disparar um evento para atualizar o estado do usuário logado, se necessário
            window.dispatchEvent(new Event("LoginChange"));
          }, 2000);
        } else {
          setLoginFailed(true);
          toast.error("Error logging in. Please check your credentials.");
        }
      }),
      {
        pending: "Logging in...",
      }
    );
  };

  const handleForgotPassword = async () => {
    const endpoints = [
      `${API_COMUM}/api/user/request-password-reset`,
      `${API_ENTERPRISE}/api/request-password-reset`,
    ];

    const loading = toast.loading("Sending reset link...");

    try {
      // Realizar ambas as chamadas e esperar o resultado
      const results = await Promise.allSettled(
        endpoints.map((endpoint) =>
          axios.post(endpoint, { email: formData.email })
        )
      );

      // Verificar se ao menos uma chamada teve sucesso
      const anySuccess = results.some(
        (result) => result.status === "fulfilled"
      );

      if (anySuccess) {
        toast.update(loading, {
          render: "A link to reset your password has been sent to your email.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(loading, {
          render: "Failed to send the password reset link.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      // Caso haja erro geral inesperado
      toast.update(loading, {
        render: "An unexpected error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setShowConfirmationModal(false);
    }
  };


  const handleForgotPasswordClick = () => {
    if (!formData.email) {
      toast.error("Please enter your email before proceeding.");
      return;
    }
    setConfirmationMessage(
      `Send the reset link to this email: ${formData.email}`
    );
    setShowConfirmationModal(true); // Show the confirmation modal when forgot password is clicked
  };

  const confirmForgotPassword = () => {
    handleForgotPassword(); // Call the forgot password handler
  };

  return (
    <div>
      <div className="login-page">
        <div className="coinBackgroundLogin"></div>
        <div className="login-container default-border-image">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon">
                <EnvelopeFill />
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-icon">
                <LockFill />
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {showPassword ? (
                  <EyeSlash onClick={handleShowPassword} />
                ) : (
                  <Eye onClick={handleShowPassword} />
                )}
              </div>
            </div>
            <div className="form-options">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe((oldValue) => !oldValue)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <span
                className="forgot-password"
                onClick={handleForgotPasswordClick}
                style={{
                  cursor: "pointer",
                  color: "white",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </span>
            </div>
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
          </form>
          <div className="signup-options">
            <span className="dont-have-account">Don't have an account?</span>
            <Link to="/create" className="sign-up">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <ConfirmationModal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        onConfirm={confirmForgotPassword}
        title="Confirm Password Reset"
        body={confirmationMessage}
        confirmButtonText="Yes, reset it"
        cancelButtonText="Cancel"
        showButtons={true}
      />
    </div>
  );
};

export default Login;
