import React, { useState } from "react";
import { EnvelopeFill, LockFill, PersonFill, Briefcase, PersonCircle, Eye, EyeSlash, QuestionCircle } from "react-bootstrap-icons";
import PasswordRequirements from "./PasswordRequirements";

const AdminUserForm = ({ formData, handleChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showValidationCode, setShowValidationCode] = useState(false);

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

  const handleShowValidationCode = () => {
    const validationCodeInput = document.querySelector("#validationCode");
    if (showValidationCode) {
      setShowValidationCode(false);
      validationCodeInput.type = "password";
    } else {
      setShowValidationCode(true);
      validationCodeInput.type = "text";
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
            placeholder="Admin Email"
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
            required/>
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
          <Briefcase />
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
            type="password"
            className="form-control"
            id="validationCode"
            placeholder="Validation Code"
            value={formData.validationCode}
            onChange={handleChange}
            required
          />
          {
            showValidationCode ?
            <EyeSlash onClick={handleShowValidationCode} /> :
            <Eye onClick={handleShowValidationCode} />
          }
        </div>
      </div>
    </>
  );
};

export default AdminUserForm;
