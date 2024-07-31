import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { EnvelopeFill, LockFill } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
            `http://localhost:7000/api/user/info?email=${formData.email}`,
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
          // Adicionando verificação para usuário admin
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
          alert("Login successful");
          navigate("/home");
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

    const loginEndpoints = [
      {
        url: "http://localhost:7000/api/user/login",
        data: { email: formData.email, password: formData.password },
        method: "post",
      },
      {
        url: "http://localhost:7004/admin/login", // Atualizar a URL do admin
        data: { email_admin: formData.email, senha: formData.password }, // Atualizar os dados do admin
        method: "post",
      },
      {
        url: "http://localhost:7003/api/login",
        data: { email_comercial: formData.email, senha: formData.password },
        method: "post",
      },
    ];

    for (let i = 0; i < loginEndpoints.length; i++) {
      const success = await handleLogin(
        loginEndpoints[i].url,
        loginEndpoints[i].data,
        loginEndpoints[i].method,
        loginEndpoints[i].params
      );
      if (success) return;
    }

    alert("Error logging in user");
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
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
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
    </div>
  );
};

export default Login;
