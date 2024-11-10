import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import { LockFill, Eye, EyeSlash, QuestionCircle } from "react-bootstrap-icons";
import PasswordRequirements from "../components/PasswordRequirements";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const { token } = useParams(); // Assume the reset token is passed as a URL parameter
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const handleShowPassword = () => {
    const passwordInput = document.querySelector("#newPassword");
    if (showPassword) {
      setShowPassword(false);
      passwordInput.type = "password";
    } else {
      setShowPassword(true);
      passwordInput.type = "text";
    }
  };

  const handleShowConfirmPassword = () => {
    const confirmPasswordInput = document.querySelector("#confirmNewPassword");
    if (showConfirmPassword) {
      setShowConfirmPassword(false);
      confirmPasswordInput.type = "password";
    } else {
      setShowConfirmPassword(true);
      confirmPasswordInput.type = "text";
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const endpoints = [
      "http://localhost:7000/api/user/reset-password",
      "http://localhost:7003/api//reset-password",
    ]

    const resetPasswordPromises = endpoints.map(endpoint => 
      axios.post(endpoint, 
        {
          token,
          newPassword: formData.newPassword
        }
      )
    );

    const loading = toast.loading("Resetting password...");
    Promise.allSettled(resetPasswordPromises)
    .then(results => {
      if(results.some(result => result.status === "fulfilled")) {
        toast.update(loading, { render: "Password reset successfully", type: "success", isLoading: false, autoClose: 2000 });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
      else {
        toast.update(loading, { render: "Fail to reset password", type: "error", isLoading: false, autoClose: 2000 });
      }
    })
  };

  return (
    <div>
      <Navbar />
      <div className="login-page">
        <div className="login-container">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon">
                <LockFill />
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
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
            <PasswordRequirements show={showPasswordRequirements} password={formData.newPassword} />
            <div className="form-group">
              <div className="input-icon">
                <LockFill />
                <input
                  type="password"
                  className="form-control"
                  id="confirmNewPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmNewPassword}
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
            <button type="submit" className="btn btn-primary">
              Reset Password
            </button>
          </form>
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

export default ResetPassword;
