import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Create.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown } from "react-bootstrap";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CommonUserForm from "../components/CommonUserForm";
import BusinessUserForm from "../components/BusinessUserForm";
import AdminUserForm from "../components/AdminUserForm";

const Create = () => {
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
            <Dropdown className="custom-dropdown">
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
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
              <CommonUserForm
                formData={formData}
                handleChange={handleChange}
                handlePhoneChange={handlePhoneChange}
              />
            )}
            {userType === "business" && (
              <BusinessUserForm
                formData={formData}
                companyData={companyData}
                handleChange={handleChange}
                handleCompanyChange={handleCompanyChange}
                handleCNPJBlur={handleCNPJBlur}
                setCompanyData={setCompanyData}
              />
            )}
            {userType === "admin" && (
              <AdminUserForm formData={formData} handleChange={handleChange} />
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
        theme="dark"
      />
    </div>
  );
};

export default Create;
