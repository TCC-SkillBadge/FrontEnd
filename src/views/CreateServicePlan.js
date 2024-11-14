// CreateServicePlan.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/CreateServicePlan.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select"; // Importando o componente Select

const CreateServicePlan = () => {
  const [formData, setFormData] = useState({
    tituloPlanoServico: "",
    descricaoPlano: "",
    precoPlanoServico: "",
    prazoPagamentos: "",
    sugestoesUpgrades: "",
    prioridade: false, // Novo campo para prioridade
    funcionalidadesDisponiveis: [],
    funcionalidadesNaoDisponiveis: [],
  });

  const [funcionalidadesOptions, setFuncionalidadesOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = sessionStorage.getItem("tipoUsuario");
    if (userType !== "UA") {
      navigate("/home"); // Redireciona para a página inicial se o usuário não for administrador
    } else {
      // Buscar funcionalidades do back-end
      const fetchFuncionalidades = async () => {
        try {
          const response = await axios.get("http://localhost:9090/api/funcionalidades");
          if (response.status === 200) {
            const options = response.data.map((func) => ({
              value: func.id,
              label: func.nomeFuncionalidade,
            }));
            setFuncionalidadesOptions(options);
          }
        } catch (error) {
          console.error("Erro ao buscar funcionalidades!", error);
          toast.error("Erro ao buscar funcionalidades.");
        }
      };

      fetchFuncionalidades();
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
    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, "");
    // Formata o valor
    value = (value / 100).toFixed(2).toString();
    setFormData((prevData) => ({ ...prevData, precoPlanoServico: value }));
  };

  // Definir estilos personalizados para o react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: "#8DFD8B",
      borderRadius: "5px",
      padding: "2px",
      minHeight: "38px",
      boxShadow: state.isFocused ? "0 0 0 1px #8DFD8B" : provided.boxShadow,
      "&:hover": {
        borderColor: "#8DFD8B",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#000000", // Preto de fundo para o menu
      borderRadius: "5px",
      color: "#ffffff",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#d273ff" : "#000000",
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#d273ff",
        color: "#ffffff",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "rgba(141, 253, 139, 0.2)", // Fundo verde mais sutil
      borderRadius: "15px", // Bordas mais arredondadas
      padding: "2px 8px",
      display: "flex",
      alignItems: "center",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#8DFD8B", // Cor do texto para corresponder ao fundo
      fontWeight: "500",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#8DFD8B",
      ":hover": {
        backgroundColor: "#8DFD8B",
        color: "#ffffff",
        borderRadius: "50%",
      },
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#b0b0b0",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };

  // Handlers para os componentes Select
  const handleFuncDisponiveisChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      funcionalidadesDisponiveis: selectedOptions || [],
    }));
  };

  const handleFuncNaoDisponiveisChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      funcionalidadesNaoDisponiveis: selectedOptions || [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar os dados para enviar ao back-end
    const dataToSend = {
      ...formData,
      funcionalidadesDisponiveis: formData.funcionalidadesDisponiveis.map((func) => ({
        id: func.value,
        nomeFuncionalidade: func.label,
      })),
      funcionalidadesNaoDisponiveis: formData.funcionalidadesNaoDisponiveis.map((func) => ({
        id: func.value,
        nomeFuncionalidade: func.label,
      })),
    };

    try {
      const response = await axios.post("http://localhost:9090/api/plans", dataToSend);

      toast.success("Plan created successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      if (response.status === 200 || response.status === 201) {
        // Após o sucesso da criação do plano, redireciona para a página de preço
        setTimeout(() => {
          navigate("/price");
        }, 2000);
      }
    } catch (error) {
      console.error("There was an error creating the plan!", error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("There was an error creating the plan.");
      }
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
              <label htmlFor="funcionalidadesDisponiveis" className="form-label">
                Available Features
              </label>
              <Select
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncDisponiveisChange}
                value={formData.funcionalidadesDisponiveis}
                placeholder="Select available features"
                styles={customStyles} // Aplicando estilos personalizados
              />
            </div>
            <div className="form-group">
              <label htmlFor="funcionalidadesNaoDisponiveis" className="form-label">
                Unavailable Features
              </label>
              <Select
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncNaoDisponiveisChange}
                value={formData.funcionalidadesNaoDisponiveis}
                placeholder="Select unavailable features"
                styles={customStyles} // Aplicando estilos personalizados
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
