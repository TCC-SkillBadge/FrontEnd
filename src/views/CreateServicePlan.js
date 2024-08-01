import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/CreateServicePlan.css";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateServicePlan = () => {
  const [formData, setFormData] = useState({
    planTitle: "",
    availableFeatures: "",
    unavailableFeatures: "",
    planPrice: "",
    paymentTerm: "",
    upgradeSuggestions: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    // Remove all non-digit characters
    value = value.replace(/\D/g, "");
    // Add formatting
    value = (value / 100).toFixed(2).toString();
    setFormData((prevData) => ({ ...prevData, planPrice: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to handle form submission
    console.log(formData);
  };

  return (
    <div>
      <Navbar />
      <div className="create-plan-page">
        <div className="create-plan-container">
          <h2>Create Service Plan</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="planTitle" className="form-label">
                Plan Title
              </label>
              <input
                type="text"
                className="form-control"
                id="planTitle"
                placeholder="Enter plan title"
                value={formData.planTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="availableFeatures" className="form-label">
                Available Features
              </label>
              <textarea
                className="form-control"
                id="availableFeatures"
                placeholder="List the features included in this plan"
                value={formData.availableFeatures}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="unavailableFeatures" className="form-label">
                Unavailable Features
              </label>
              <textarea
                className="form-control"
                id="unavailableFeatures"
                placeholder="List the features not included in this plan"
                value={formData.unavailableFeatures}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="planPrice" className="form-label">
                  Plan Price
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="planPrice"
                  placeholder="0.00"
                  value={formData.planPrice}
                  onChange={handlePriceChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="paymentTerm" className="form-label">
                  Payment Term
                </label>
                <div className="dropdown-container">
                  <select
                    className="form-control dropdown"
                    id="paymentTerm"
                    value={formData.paymentTerm}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select payment term</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <span className="dropdown-arrow">&#9662;</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="upgradeSuggestions" className="form-label">
                Upgrade Suggestions
              </label>
              <textarea
                className="form-control"
                id="upgradeSuggestions"
                placeholder="Provide upgrade recommendations for this plan"
                value={formData.upgradeSuggestions}
                onChange={handleChange}
                required
              />
            </div>
            <div className="text-right">
              <button type="submit" className="btn btn-primary save-button">
                Save Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateServicePlan;
