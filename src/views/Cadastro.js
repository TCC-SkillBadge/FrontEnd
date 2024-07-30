import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Cadastro.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  PersonFill,
  EnvelopeFill,
  LockFill,
  Building,
  Phone,
} from "react-bootstrap-icons";
import axios from "axios";
import InputMask from "react-input-mask";
import { Dropdown } from "react-bootstrap";
import Navbar from "../components/Navbar"; // Importe o componente Navbar

const Cadastro = () => {
  const [userType, setUserType] = useState("common");
  const [companyData, setCompanyData] = useState({
    nomeEmpresa: "",
    cep: "",
    rua: "",
    bairro: "",
    cidade: "",
    complemento: "",
  });

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCNPJBlur = async (event) => {
    const cnpj = event.target.value.replace(/\D/g, "");
    if (cnpj.length === 14) {
      try {
        const response = await axios.get(
          `https://www.receitaws.com.br/v1/cnpj/${cnpj}`
        );
        const data = response.data;
        setCompanyData({
          nomeEmpresa: data.nome,
          cep: data.cep,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.municipio,
          complemento: data.complemento,
        });
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      }
    }
  };

  return (
    <div className="cadastro-page">
      <Navbar />
      <div className="cadastro-container">
        <h2>Register</h2>
        <div className="dropdown-container">
          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-basic"
              className="custom-dropdown"
            >
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleUserTypeChange("common")}>
                Common
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleUserTypeChange("business")}>
                Business
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleUserTypeChange("admin")}>
                Admin
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <form>
          {userType === "common" && (
            <>
              <div className="form-group">
                <div className="input-icon">
                  <PersonFill />
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon">
                  <PersonFill />
                  <input
                    type="text"
                    className="form-control"
                    id="occupation"
                    placeholder="Occupation"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon">
                  <Phone />
                  <InputMask
                    mask="(99) 99999-9999"
                    className="form-control"
                    id="phone"
                    placeholder="Phone Number"
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
            </>
          )}
          {userType === "business" && (
            <>
              <div className="form-group">
                <div className="input-icon">
                  <EnvelopeFill />
                  <input
                    type="email"
                    className="form-control"
                    id="businessEmail"
                    placeholder="Business Email"
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
              <div className="form-group">
                <div className="input-icon">
                  <Building />
                  <input
                    type="text"
                    className="form-control"
                    id="companyName"
                    placeholder="Company Name"
                    value={companyData.nomeEmpresa}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon">
                  <Building />
                  <InputMask
                    mask="99.999.999/9999-99"
                    className="form-control"
                    id="cnpj"
                    placeholder="CNPJ"
                    onBlur={handleCNPJBlur}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <div className="input-icon">
                    <Building />
                    <input
                      type="text"
                      className="form-control"
                      id="cep"
                      placeholder="CEP"
                      value={companyData.cep}
                    />
                  </div>
                </div>
                <div className="col-md-6 form-group">
                  <div className="input-icon">
                    <Building />
                    <input
                      type="text"
                      className="form-control"
                      id="street"
                      placeholder="Street"
                      value={companyData.rua}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 form-group">
                  <div className="input-icon">
                    <Building />
                    <input
                      type="text"
                      className="form-control"
                      id="neighborhood"
                      placeholder="Neighborhood"
                      value={companyData.bairro}
                    />
                  </div>
                </div>
                <div className="col-md-6 form-group">
                  <div className="input-icon">
                    <Building />
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      placeholder="City"
                      value={companyData.cidade}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon">
                  <Building />
                  <input
                    type="text"
                    className="form-control"
                    id="complement"
                    placeholder="Complement"
                    value={companyData.complemento}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon">
                  <Phone />
                  <InputMask
                    mask="(99) 99999-9999"
                    className="form-control"
                    id="businessPhone"
                    placeholder="Business Phone"
                  />
                </div>
              </div>
            </>
          )}
          {userType === "admin" && (
            <>
              <div className="form-group">
                <div className="input-icon">
                  <EnvelopeFill />
                  <input
                    type="email"
                    className="form-control"
                    id="adminEmail"
                    placeholder="Admin Email"
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
              <div className="form-group">
                <div className="input-icon">
                  <PersonFill />
                  <input
                    type="text"
                    className="form-control"
                    id="adminName"
                    placeholder="Admin Name"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-icon">
                  <PersonFill />
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    placeholder="Role"
                  />
                </div>
              </div>
            </>
          )}
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
