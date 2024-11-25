// FuncionalidadesManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FuncionalidadesManager.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FuncionalidadesManager = () => {
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [newFuncionalidade, setNewFuncionalidade] = useState("");

  const planServiceUrl = process.env.REACT_APP_API_PLAN;

  useEffect(() => {
    fetchFuncionalidades();
  }, []);

  const fetchFuncionalidades = async () => {
    try {
      const response = await axios.get(`${planServiceUrl}/api/funcionalidades`);
      if (response.status === 200) {
        setFuncionalidades(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionalidades!", error);
      toast.error("Error fetching functionalities.");
    }
  };

  const handleAddFuncionalidade = async () => {
    if (newFuncionalidade.trim() === "") {
      toast.error("The functionality name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(`${planServiceUrl}/api/funcionalidades`, {
        nomeFuncionalidade: newFuncionalidade,
      });

      if (response.status === 201) {
        toast.success("Functionality added successfully!");
        setNewFuncionalidade("");
        fetchFuncionalidades();
      }
    } catch (error) {
      console.error("Erro ao adicionar funcionalidade!", error);
      toast.error("Error adding functionality.");
    }
  };

  return (
    <div>
      <div className="funcionalidades-manager">
        <h2>Manage Functionalities</h2>
        <div className="add-funcionalidade mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Name of the new functionality"
            value={newFuncionalidade}
            onChange={(e) => setNewFuncionalidade(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleAddFuncionalidade}>
            Add
          </button>
        </div>
        <ul className="funcionalidades-list list-group">
          {funcionalidades.map((func) => (
            <li key={func.id} className="list-group-item">
              {func.nomeFuncionalidade}
            </li>
          ))}
        </ul>
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

export default FuncionalidadesManager;
