import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const { token } = useParams(); // Assume the reset token is passed as a URL parameter
  const navigate = useNavigate();

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

    try {
      const response = await axios.post(
        "http://localhost:7000/api/user/reset-password",
        {
          token,
          newPassword: formData.newPassword,
        }
      );

      if (response.status === 200) {
        toast.success("Password reset successfully");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Failed to reset password");
      }
    } catch (error) {
      toast.error("Error resetting password");
    }
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
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-icon">
                <input
                  type="password"
                  className="form-control"
                  id="confirmNewPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  required
                />
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
