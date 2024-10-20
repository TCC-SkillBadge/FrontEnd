import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/CreateServicePlan.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const navigate = useNavigate();

  useEffect(() => {
    const userType = sessionStorage.getItem("tipoUsuario");
    if (userType !== "UA") {
      navigate("/home"); // Redireciona para a página inicial se o usuário não for administrador
    }
  }, [navigate]);

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
    const createPlanPromise = axios.post(
      "http://localhost:9090/api/plans",
      formData
    );

    toast.promise(createPlanPromise, {
      pending: "Creating plan...",
      success: "Plan created successfully!",
      error: "There was an error creating the plan.",
    });

    try {
      const response = await createPlanPromise;
      if (response.status === 200) {
        // Após o sucesso da criação do plano, redireciona para a página de preço
        navigate("/price");
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

export default CreateServicePlan;
