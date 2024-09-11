import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { EnvelopeFill, LockFill } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../components/ConfirmationModal"; // Import the modal component

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginFailed, setLoginFailed] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State to control the confirmation modal
  const [confirmationMessage, setConfirmationMessage] = useState(""); // State to hold the confirmation message
  const navigate = useNavigate();

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

      let userInfoResponse;
      if (tipoUsuario === "UC") {
        userInfoResponse = await axios.get(
          `http://localhost:7000/api/user/info`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (tipoUsuario === "UE") {
        userInfoResponse = await axios.get(
          `http://localhost:7003/api/acessar-info-usuario-jwt`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (tipoUsuario === "UA") {
        userInfoResponse = await axios.get(
          `http://localhost:7004/admin/acessa-info`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (userInfoResponse && userInfoResponse.status === 200) {
        const userInfo = userInfoResponse.data;
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
        return true;
      }
    }
  } catch (error) {
    console.error(`Error logging in at ${url}:`, error);
  }
  return false;
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginFailed(false);

    const loginEndpoints = [
      {
        url: "http://localhost:7000/api/user/login",
        data: { email: formData.email, password: formData.password },
        method: "post",
      },
      {
        url: "http://localhost:7004/admin/login",
        data: { email_admin: formData.email, senha: formData.password },
        method: "post",
      },
      {
        url: "http://localhost:7003/api/login",
        data: { email_comercial: formData.email, senha: formData.password },
        method: "post",
      },
    ];

    const loginPromises = loginEndpoints.map((endpoint) =>
      handleLogin(endpoint.url, endpoint.data, endpoint.method, endpoint.params)
    );

    toast.promise(
      Promise.all(loginPromises).then((results) => {
        if (results.some((success) => success)) {
          toast.success("Login successful");
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        } else {
          setLoginFailed(true);
          toast.error("Error logging in user");
        }
      }),
      {
        pending: "Logging in...",
      }
    );
  };

  const handleForgotPassword = async () => {
    const endpoints = [
      "http://localhost:7000/api/user/request-password-reset",
      "http://localhost:7003/api/request-password-reset",
    ]

    const resetPasswordPromises = endpoints.map((endpoint) => 
      axios.post(endpoint, {
        email: formData.email
      })
    );

    const loading = toast.loading("Sending reset link...");
    Promise.allSettled(resetPasswordPromises)
    .then((results) => {
      console.log(results);
      if (results.some((response) => response.status >= 200 && response.status < 300)) {
        toast.update(loading, {
          render: "A link to reset your password has been sent to your email.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setShowConfirmationModal(false);
      }
      else {
        toast.update(loading, {
          render: "Error sending password reset link",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    })

    // const promise = axios.post(
    //   "http://localhost:7000/api/user/request-password-reset",
    //   {
    //     email: formData.email,
    //   }
    // );

    // toast.promise(promise, {
    //   pending: "Sending reset link...",
    //   success: "A link to reset your password has been sent to your email.",
    //   error: "Error sending password reset link",
    // });

    // try {
    //   const response = await promise;
    //   if (response.status === 200) {
    //     setShowConfirmationModal(false); // Hide the confirmation modal
    //   }
    // } catch (error) {
    //   // Handle the error case in the toast.promise
    // }
  };

  const handleForgotPasswordClick = () => {
    if (!formData.email) {
      toast.error("Please enter your email address before proceeding.");
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
      <Navbar />
      <div className="login-page">
        <div className="login-container">
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
              </div>
            </div>
            <div className="form-options">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
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
            <Link to="/cadastro" className="sign-up">
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
