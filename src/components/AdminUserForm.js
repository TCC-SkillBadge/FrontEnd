import React from "react";
import { EnvelopeFill, LockFill, PersonFill, Briefcase, PersonCircle } from "react-bootstrap-icons";

const AdminUserForm = ({ formData, handleChange }) => {
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
  );
};

export default AdminUserForm;
