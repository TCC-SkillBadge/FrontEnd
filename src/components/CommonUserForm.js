import React from "react";
import {
  PersonFill,
  EnvelopeFill,
  LockFill,
  Phone,
} from "react-bootstrap-icons";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const CommonUserForm = ({ formData, handleChange, handlePhoneChange }) => {
  return (
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
  );
};

export default CommonUserForm;
