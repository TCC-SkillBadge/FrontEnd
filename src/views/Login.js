import React from "react";
import "../styles/Login.css";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { EnvelopeFill, LockFill } from "react-bootstrap-icons";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form>
          <div className="form-group">
            <div className="input-icon">
              <EnvelopeFill />
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email"
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
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
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
  );
};

export default Login;
