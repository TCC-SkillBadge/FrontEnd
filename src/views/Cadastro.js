import React from "react";
import { Link } from "react-router-dom";
import "../styles/Cadastro.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { PersonFill, EnvelopeFill, LockFill } from "react-bootstrap-icons";

const Cadastro = () => {
  return (
    <div className="cadastro-page">
      <div className="cadastro-container">
        <h2>Register</h2>
        <form>
          <div className="form-group">
            <div className="input-icon">
              <PersonFill />
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Name"
              />
            </div>
          </div>
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
          <div className="form-group">
            <div className="input-icon">
              <LockFill />
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm Password"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </form>
        <div className="login-options">
          <span className="have-account">Already have an account?</span>
          <Link to="/login" className="login-link">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
