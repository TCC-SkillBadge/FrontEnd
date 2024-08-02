import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Dropdown } from "react-bootstrap";
import Navbar from "../components/Navbar";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cadastro = () => {
  const [userType, setUserType] = useState("common");
  const [formData, setFormData] = useState({
    fullName: "",
    occupation: "",
    phone: "",
    country: "",
    email: "",
    password: "",
    confirmPassword: "",
    validationCode: "",
  });
  const [companyData, setCompanyData] = useState({
    nomeEmpresa: "",
    cnpj: "",
    cep: "",
    rua: "",
    bairro: "",
    cidade: "",
    complemento: "",
    numeroContato: "",
  });

  const navigate = useNavigate();

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleCNPJBlur = async (event) => {
    const cnpj = event.target.value.replace(/\D/g, "");
    if (cnpj.length === 14) {
      try {
        const response = await axios.get(
          `http://localhost:7003/api/validarCNPJ?cnpj=${cnpj}`
        );
        const data = response.data;
        setCompanyData((prevData) => ({
          ...prevData,
          nomeEmpresa: data.nome,
          cep: data.cep,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.municipio,
          complemento: data.complemento,
        }));
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handlePhoneChange = (value, country) => {
    setFormData((prevData) => ({ ...prevData, phone: value, country }));
  };

  const handleCompanyChange = (e) => {
    const { id, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      let response;
      if (userType === "common") {
        response = await axios.post("http://localhost:7000/api/user/register", {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          occupation: formData.occupation,
          phoneNumber: formData.phone,
          country: formData.country,
        });
      } else if (userType === "business") {
        response = await axios.post("http://localhost:7003/api/cadastrar", {
          email_comercial: formData.email,
          senha: formData.password,
          razao_social: companyData.nomeEmpresa,
          cnpj: companyData.cnpj,
          cep: companyData.cep,
          logradouro: companyData.rua,
          bairro: companyData.bairro,
          municipio: companyData.cidade,
          suplemento: companyData.complemento,
          numero_contato: companyData.numeroContato,
        });
      } else if (userType === "admin") {
        response = await axios.post("http://localhost:7004/admin/cadastrar", {
          email_admin: formData.email,
          senha: formData.password,
          nome_admin: formData.fullName,
          cargo: formData.occupation,
          codigo_validacao: formData.validationCode,
        });
      }

      if (response.status === 201) {
        toast.success("User registered successfully");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Error registering user");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="cadastro-page">
        <div className="cadastro-container">
          <h2>Register</h2>
          <div className="dropdown-container">
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-basic"
                className="custom-dropdown"
              >
                <i className="bi bi-caret-down-fill"></i>
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
          <form onSubmit={handleSubmit}>
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
                      value={formData.fullName}
                      onChange={handleChange}
                      required
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
                      value={formData.occupation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon">
                    <Phone />
                    <PhoneInput
                      defaultCountry="BR"
                      value={formData.phone}
                      onChange={(value, country) =>
                        handlePhoneChange(value, country.iso2)
                      }
                      placeholder="Phone Number"
                      containerClassName="intl-phone-input"
                      inputClassName="intl-phone-input"
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
                <div className="form-group">
                  <div className="input-icon">
                    <LockFill />
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
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
                      id="email"
                      placeholder="Business Email"
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
                <div className="form-group">
                  <div className="input-icon">
                    <LockFill />
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon">
                    <Building />
                    <input
                      type="text"
                      className="form-control"
                      id="nomeEmpresa"
                      placeholder="Company Name"
                      value={companyData.nomeEmpresa}
                      onChange={handleCompanyChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon">
                    <Building />
                    <input
                      type="text"
                      className="form-control"
                      id="cnpj"
                      placeholder="CNPJ"
                      onBlur={handleCNPJBlur}
                      value={companyData.cnpj}
                      onChange={handleCompanyChange}
                      required
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
                        onChange={handleCompanyChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6 form-group">
                    <div className="input-icon">
                      <Building />
                      <input
                        type="text"
                        className="form-control"
                        id="rua"
                        placeholder="Street"
                        value={companyData.rua}
                        onChange={handleCompanyChange}
                        required
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
                        id="bairro"
                        placeholder="Neighborhood"
                        value={companyData.bairro}
                        onChange={handleCompanyChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6 form-group">
                    <div className="input-icon">
                      <Building />
                      <input
                        type="text"
                        className="form-control"
                        id="cidade"
                        placeholder="City"
                        value={companyData.cidade}
                        onChange={handleCompanyChange}
                        required
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
                      id="complemento"
                      placeholder="Complement"
                      value={companyData.complemento}
                      onChange={handleCompanyChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon">
                    <Phone />
                    <PhoneInput
                      defaultCountry="BR"
                      value={companyData.numeroContato}
                      onChange={(value, country) =>
                        setCompanyData((prevData) => ({
                          ...prevData,
                          numeroContato: value,
                        }))
                      }
                      placeholder="Business Phone"
                      containerClassName="intl-phone-input"
                      inputClassName="intl-phone-input"
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
                      id="email"
                      placeholder="Admin Email"
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
                <div className="form-group">
                  <div className="input-icon">
                    <LockFill />
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon">
                    <PersonFill />
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="Admin Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
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
                      placeholder="Role"
                      value={formData.occupation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon">
                    <LockFill />
                    <input
                      type="text"
                      className="form-control"
                      id="validationCode"
                      placeholder="Validation Code"
                      value={formData.validationCode}
                      onChange={handleChange}
                      required
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
        theme="dark" // Adiciona o tema escuro
      />
    </div>
  );
};

export default Cadastro;
