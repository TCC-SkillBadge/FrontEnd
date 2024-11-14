import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/CreateServicePlan.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select"; // Importando o componente Select

const EditServicePlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionalidadesOptions, setFuncionalidadesOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    tituloPlanoServico: "",
    descricaoPlano: "",
    precoPlanoServico: "",
    prazoPagamentos: "",
    sugestoesUpgrades: "",
    prioridade: false,
    funcionalidadesDisponiveis: [],
    funcionalidadesNaoDisponiveis: [],
  });

  useEffect(() => {
    const userType = sessionStorage.getItem("tipoUsuario");
    if (userType !== "UA") {
      navigate("/home");
    } else {
      // Buscar funcionalidades do back-end
      const fetchFuncionalidades = async () => {
        try {
          const response = await axios.get(
            "http://localhost:9090/api/funcionalidades"
          );
          if (response.status === 200) {
            const options = response.data.map((func) => ({
              value: func.id,
              label: func.nomeFuncionalidade,
            }));
            setFuncionalidadesOptions(options);
          }
        } catch (error) {
          console.error("Houve um erro ao buscar as funcionalidades!", error);
        }
      };

      // Buscar dados do plano
      const fetchPlan = async () => {
        try {
          const response = await axios.get(
            `http://localhost:9090/api/plans/${id}`
          );
          if (response.status === 200) {
            const planData = response.data;

            // Transformar funcionalidades em formato compatível com o Select
            const funcionalidadesDisponiveis =
              planData.funcionalidadesDisponiveis.map((func) => ({
                value: func.id,
                label: func.nomeFuncionalidade,
              }));
            const funcionalidadesNaoDisponiveis =
              planData.funcionalidadesNaoDisponiveis.map((func) => ({
                value: func.id,
                label: func.nomeFuncionalidade,
              }));

            setFormData({
              ...planData,
              funcionalidadesDisponiveis,
              funcionalidadesNaoDisponiveis,
            });
          }
        } catch (error) {
          console.error("Houve um erro ao buscar o plano!", error);
        }
      };

      fetchFuncionalidades();
      fetchPlan();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = (value / 100).toFixed(2).toString();
    setFormData((prevData) => ({ ...prevData, precoPlanoServico: value }));
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
      funcionalidadesDisponiveis: formData.funcionalidadesDisponiveis.map(
        (func) => ({
          id: func.value,
          nomeFuncionalidade: func.label,
        })
      ),
      funcionalidadesNaoDisponiveis: formData.funcionalidadesNaoDisponiveis.map(
        (func) => ({
          id: func.value,
          nomeFuncionalidade: func.label,
        })
      ),
    };

    const updatePlanPromise = axios.put(
      `http://localhost:9090/api/plans/${id}`,
      dataToSend
    );

    toast.promise(updatePlanPromise, {
      pending: "Updating plan...",
      success: "Plan updated successfully!",
      error: "There was an error updating the plan.",
    });

    try {
      const response = await updatePlanPromise;
      if (response.status === 200) {
        setTimeout(() => {
          navigate("/price");
        }, 2000);
      }
    } catch (error) {
      console.error("There was an error updating the plan!", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:9090/api/plans/${id}`
      );
      if (response.status === 204) {
        toast.success("Plan deleted successfully");
        setTimeout(() => {
          navigate("/price");
        }, 2000);
      }
    } catch (error) {
      console.error("There was an error deleting the plan!", error);
      toast.error("There was an error deleting the plan.");
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleConfirmDelete = () => {
    handleDelete();
    setShowModal(false);
  };

  const handleCancel = () => {
    navigate("/price"); // Volta para a página anterior
  };

  return (
    <div>
      <Navbar />
      <div className="create-plan-page">
        <div className="create-plan-container">
          <h2>Edit Service Plan</h2>
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
            {/* Substituir textareas por componentes Select */}
            <div className="form-group">
              <label
                htmlFor="funcionalidadesDisponiveis"
                className="form-label"
              >
                Available Features
              </label>
              <Select
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncDisponiveisChange}
                value={formData.funcionalidadesDisponiveis}
                placeholder="Select available features"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="funcionalidadesNaoDisponiveis"
                className="form-label"
              >
                Unavailable Features
              </label>
              <Select
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncNaoDisponiveisChange}
                value={formData.funcionalidadesNaoDisponiveis}
                placeholder="Select unavailable features"
              />
            </div>
            {/* Campos restantes permanecem iguais */}
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

            {/* Botões de Excluir e Cancelar */}
            <div className="button-group">
              <button
                type="button"
                className="btn btn-danger delete-button"
                onClick={handleShowModal}
              >
                Delete Plan
              </button>
              <button
                type="button"
                className="btn btn-secondary cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        body="Are you sure you want to delete this plan?"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        showButtons={true}
      />
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

export default EditServicePlan;
