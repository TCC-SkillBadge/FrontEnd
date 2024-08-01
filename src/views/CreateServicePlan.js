import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/CreateServicePlan.css";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateServicePlan = () => {
  const [formData, setFormData] = useState({
    tituloPlanoServico: "",
    descricaoPlano: "",
    funcDisponibilizadas: "",
    funcNaoDisponibilizadas: "",
    precoPlanoServico: "",
    prazoPagamentos: "",
    sugestoesUpgrades: "",
    prioridade: false, // Novo campo para prioridade
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    // Remove all non-digit characters
    value = value.replace(/\D/g, "");
    // Add formatting
    value = (value / 100).toFixed(2).toString();
    setFormData((prevData) => ({ ...prevData, precoPlanoServico: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:9090/api/plans",
        formData
      );
      if (response.status === 200) {
        alert("Plan created successfully");
        setFormData({
          tituloPlanoServico: "",
          descricaoPlano: "",
          funcDisponibilizadas: "",
          funcNaoDisponibilizadas: "",
          precoPlanoServico: "",
          prazoPagamentos: "",
          sugestoesUpgrades: "",
          prioridade: false,
        });
      }
    } catch (error) {
      console.error("There was an error creating the plan!", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-plan-page">
        <div className="create-plan-container">
          <h2>Create Service Plan</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tituloPlanoServico" className="form-label">
                Plan Title
              </label>
              <input
                type="text"
                className="form-control"
                id="tituloPlanoServico"
                placeholder="Enter plan title"
                value={formData.tituloPlanoServico}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="descricaoPlano" className="form-label">
                Plan Description
              </label>
              <textarea
                className="form-control"
                id="descricaoPlano"
                placeholder="Describe the plan"
                value={formData.descricaoPlano}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="funcDisponibilizadas" className="form-label">
                Available Features
              </label>
              <textarea
                className="form-control"
                id="funcDisponibilizadas"
                placeholder="List the features included in this plan"
                value={formData.funcDisponibilizadas}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="funcNaoDisponibilizadas" className="form-label">
                Unavailable Features
              </label>
              <textarea
                className="form-control"
                id="funcNaoDisponibilizadas"
                placeholder="List the features not included in this plan"
                value={formData.funcNaoDisponibilizadas}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="precoPlanoServico" className="form-label">
                  Plan Price
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="precoPlanoServico"
                  placeholder="0.00"
                  value={formData.precoPlanoServico}
                  onChange={handlePriceChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="prazoPagamentos" className="form-label">
                  Payment Term
                </label>
                <div className="dropdown-container">
                  <select
                    className="form-control dropdown"
                    id="prazoPagamentos"
                    value={formData.prazoPagamentos}
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
              <label htmlFor="sugestoesUpgrades" className="form-label">
                Upgrade Suggestions
              </label>
              <textarea
                className="form-control"
                id="sugestoesUpgrades"
                placeholder="Provide upgrade recommendations for this plan"
                value={formData.sugestoesUpgrades}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="prioridade"
                checked={formData.prioridade}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="prioridade">
                Priority Plan
              </label>
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
