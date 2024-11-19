import React, { useState } from "react";
import { EnvelopeFill, LockFill, Building, Phone, GeoAltFill, PersonCircle, Eye, EyeSlash, QuestionCircle } from "react-bootstrap-icons";
import PasswordRequirements from "./PasswordRequirements";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const BusinessUserForm = ({
  formData,
  companyData,
  handleChange,
  handleCompanyChange,
  handleCNPJBlur,
  setCompanyData,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

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

  const handleShowConfirmPassword = () => {
    const confirmPasswordInput = document.querySelector("#confirmPassword");
    if (showConfirmPassword) {
      setShowConfirmPassword(false);
      confirmPasswordInput.type = "password";
    } else {
      setShowConfirmPassword(true);
      confirmPasswordInput.type = "text";
    }
  };

  return (
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
          <PersonCircle />
          <input
            type="text"
            className="form-control"
            id="username"
            maxLength={15}
            placeholder="Username"
            value={formData.username}
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
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}"
            required
          />
          {
            showPassword ?
            <EyeSlash onClick={handleShowPassword} /> :
            <Eye onClick={handleShowPassword} />
          }
          <QuestionCircle onClick={() => setShowPasswordRequirements((oldValue) => !oldValue)} />
        </div>
      </div>
      <PasswordRequirements show={showPasswordRequirements} password={formData.password} />
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
          {
            showConfirmPassword ?
            <EyeSlash onClick={handleShowConfirmPassword} /> :
            <Eye onClick={handleShowConfirmPassword} />
          }
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
            <GeoAltFill />
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
            <GeoAltFill />
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
            <GeoAltFill />
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
            <GeoAltFill />
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
          <GeoAltFill />
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
  );
};

export default BusinessUserForm;
