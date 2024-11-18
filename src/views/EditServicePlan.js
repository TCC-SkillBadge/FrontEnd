// EditServicePlan.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/CreateServicePlan.css"; // Reutilizando estilos
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreatableSelect from "react-select/creatable"; // Importando o componente CreatableSelect

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
          const response = await axios.get("http://localhost:9090/api/funcionalidades");
          if (response.status === 200) {
            const options = response.data.map((func) => ({
              value: func.id,
              label: func.nomeFuncionalidade,
            }));
            setFuncionalidadesOptions(options);
          }
        } catch (error) {
          console.error("Houve um erro ao buscar as funcionalidades!", error);
          toast.error("Erro ao buscar funcionalidades.");
        }
      };

      // Buscar dados do plano
      const fetchPlan = async () => {
        try {
          const response = await axios.get(`http://localhost:9090/api/plans/${id}`);
          if (response.status === 200) {
            const planData = response.data;

            // Transformar funcionalidades em formato compatível com o Select
            const funcionalidadesDisponiveis = planData.funcionalidadesDisponiveis.map((func) => ({
              value: func.id,
              label: func.nomeFuncionalidade,
            }));
            const funcionalidadesNaoDisponiveis = planData.funcionalidadesNaoDisponiveis.map((func) => ({
              value: func.id,
              label: func.nomeFuncionalidade,
            }));

            setFormData({
              tituloPlanoServico: planData.tituloPlanoServico,
              descricaoPlano: planData.descricaoPlano,
              precoPlanoServico: planData.precoPlanoServico,
              prazoPagamentos: planData.prazoPagamentos,
              sugestoesUpgrades: planData.sugestoesUpgrades,
              prioridade: planData.prioridade,
              funcionalidadesDisponiveis,
              funcionalidadesNaoDisponiveis,
            });
          }
        } catch (error) {
          console.error("Houve um erro ao buscar o plano!", error);
          toast.error("Erro ao buscar o plano.");
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

  // Handler para "Available Features" com criação de novas funcionalidades
  const handleFuncDisponiveisChange = async (selectedOptions, actionMeta) => {
    if (actionMeta.action === "create-option") {
      // Nova funcionalidade criada
      const newOption = actionMeta.option;
      try {
        // Enviar nova funcionalidade para o back-end
        const response = await axios.post("http://localhost:9090/api/funcionalidades", {
          nomeFuncionalidade: newOption.label,
        });
        if (response.status === 201) {
          const newFunc = response.data;
          const newFuncOption = { value: newFunc.id, label: newFunc.nomeFuncionalidade };

          // Atualizar opções
          setFuncionalidadesOptions((prevOptions) => [...prevOptions, newFuncOption]);

          // Atualizar seleção
          const updatedSelectedOptions = [...selectedOptions, newFuncOption];

          setFormData((prevData) => {
            const selectedIds = updatedSelectedOptions.map((opt) => opt.value);
            const unavailable = funcionalidadesOptions.filter(
              (opt) => !selectedIds.includes(opt.value)
            );
            return {
              ...prevData,
              funcionalidadesDisponiveis: updatedSelectedOptions,
              funcionalidadesNaoDisponiveis: unavailable,
            };
          });

          toast.success("Funcionalidade adicionada com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao adicionar nova funcionalidade!", error);
        toast.error("Erro ao adicionar nova funcionalidade.");
      }
    } else {
      // Atualizar funcionalidades disponíveis e indisponíveis
      setFormData((prevData) => {
        const selectedIds = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
        const unavailable = funcionalidadesOptions.filter((opt) => !selectedIds.includes(opt.value));
        return {
          ...prevData,
          funcionalidadesDisponiveis: selectedOptions || [],
          funcionalidadesNaoDisponiveis: unavailable,
        };
      });
    }
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
      const response = await axios.put(`http://localhost:9090/api/plans/${id}`, dataToSend);

      toast.success("Plan updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      if (response.status === 200 || response.status === 201) {
        setTimeout(() => {
          navigate("/price");
        }, 2000);
      }
    } catch (error) {
      console.error("There was an error updating the plan!", error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("There was an error updating the plan.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:9090/api/plans/${id}`);
      if (response.status === 204) {
        toast.success("Plan deleted successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/price");
        }, 2000);
      }
    } catch (error) {
      console.error("There was an error deleting the plan!", error);
      if (error.response && error.response.data) {
        toast.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("There was an error deleting the plan.");
      }
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleConfirmDelete = () => {
    handleDelete();
    setShowModal(false);
  };

  const handleCancel = () => {
    navigate("/price"); // Volta para a página de preço
  };

  return (
    <div>
      <div className="create-plan-page">
        <div className="create-plan-container">
          <h2>Edit Service Plan</h2>
          <form onSubmit={handleSubmit}>
            {/* Título do Plano */}
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

            {/* Descrição do Plano */}
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

            {/* Funcionalidades Disponíveis */}
            <div className="form-group">
              <label htmlFor="funcionalidadesDisponiveis" className="form-label">
                Available Features
              </label>
              <CreatableSelect
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncDisponiveisChange}
                value={formData.funcionalidadesDisponiveis}
                placeholder="Select or add available features"
                styles={customStyles}
              />
            </div>

            {/* Funcionalidades Indisponíveis - Renderização Condicional */}
            {formData.funcionalidadesNaoDisponiveis.length > 0 && (
              <div className="form-group">
                <label htmlFor="funcionalidadesNaoDisponiveis" className="form-label">
                  Unavailable Features
                </label>
                <CreatableSelect
                  isMulti
                  options={funcionalidadesOptions}
                  value={formData.funcionalidadesNaoDisponiveis}
                  placeholder="Unavailable features are auto-set"
                  styles={customStyles}
                  isDisabled // Desabilitar o campo para evitar edição manual
                />
              </div>
            )}

            {/* Preço do Plano */}
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

              {/* Prazo de Pagamentos */}
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

            {/* Sugestões de Upgrades */}
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

            {/* Plano de Prioridade */}
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

            {/* Botão de Salvar */}
            <div className="text-right">
              <button type="submit" className="btn btn-primary save-button">
                Save Plan
              </button>
            </div>

            {/* Botões de Excluir e Cancelar */}
            <div className="button-group mt-3">
              <button
                type="button"
                className="btn btn-danger delete-button me-2"
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

      {/* Modal de Confirmação */}
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

      {/* Container de Toast */}
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
