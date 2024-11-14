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
    prioridade: false,
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
          console.error("Erro ao buscar funcionalidades!", error);
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

    const createPlanPromise = axios.post(
      "http://localhost:9090/api/plans",
      dataToSend
    );

    toast.promise(createPlanPromise, {
      pending: "Criando plano...",
      success: "Plano criado com sucesso!",
      error: "Houve um erro ao criar o plano.",
    });

    try {
      const response = await createPlanPromise;
      if (response.status === 200) {
        // Após o sucesso da criação do plano, redireciona para a página de preço
        navigate("/price");
      }
    } catch (error) {
      console.error("Houve um erro ao criar o plano!", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-plan-page">
        <div className="create-plan-container">
          <h2>Criar Plano de Serviço</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tituloPlanoServico" className="form-label">
                Título do Plano
              </label>
              <input
                type="text"
                className="form-control"
                id="tituloPlanoServico"
                placeholder="Digite o título do plano"
                value={formData.tituloPlanoServico}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="descricaoPlano" className="form-label">
                Descrição do Plano
              </label>
              <textarea
                className="form-control"
                id="descricaoPlano"
                placeholder="Descreva o plano"
                value={formData.descricaoPlano}
                onChange={handleChange}
                required
              />
            </div>
            {/* Campos para as funcionalidades */}
            <div className="form-group">
              <label
                htmlFor="funcionalidadesDisponiveis"
                className="form-label"
              >
                Funcionalidades Disponíveis
              </label>
              <Select
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncDisponiveisChange}
                value={formData.funcionalidadesDisponiveis}
                placeholder="Selecione as funcionalidades disponíveis"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="funcionalidadesNaoDisponiveis"
                className="form-label"
              >
                Funcionalidades Não Disponíveis
              </label>
              <Select
                isMulti
                options={funcionalidadesOptions}
                onChange={handleFuncNaoDisponiveisChange}
                value={formData.funcionalidadesNaoDisponiveis}
                placeholder="Selecione as funcionalidades não disponíveis"
              />
            </div>
            {/* Campos restantes */}
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="precoPlanoServico" className="form-label">
                  Preço do Plano
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
                  Prazo de Pagamento
                </label>
                <div className="dropdown-container">
                  <select
                    className="form-control dropdown"
                    id="prazoPagamentos"
                    value={formData.prazoPagamentos}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione o prazo de pagamento</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Anual">Anual</option>
                  </select>
                  <span className="dropdown-arrow">&#9662;</span>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="sugestoesUpgrades" className="form-label">
                Sugestões de Upgrades
              </label>
              <textarea
                className="form-control"
                id="sugestoesUpgrades"
                placeholder="Forneça sugestões de upgrade para este plano"
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
                Plano Prioritário
              </label>
            </div>
            <div className="text-right">
              <button type="submit" className="btn btn-primary save-button">
                Salvar Plano
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
