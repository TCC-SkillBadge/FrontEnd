// FuncionalidadesManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/FuncionalidadesManager.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FuncionalidadesManager = () => {
  const [funcionalidades, setFuncionalidades] = useState([]);
  const [newFuncionalidade, setNewFuncionalidade] = useState("");

  useEffect(() => {
    fetchFuncionalidades();
  }, []);

  const fetchFuncionalidades = async () => {
    try {
      const response = await axios.get("http://localhost:9090/api/funcionalidades");
      if (response.status === 200) {
        setFuncionalidades(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionalidades!", error);
      toast.error("Erro ao buscar funcionalidades.");
    }
  };

  const handleAddFuncionalidade = async () => {
    if (newFuncionalidade.trim() === "") {
      toast.error("O nome da funcionalidade não pode estar vazio.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:9090/api/funcionalidades", {
        nomeFuncionalidade: newFuncionalidade,
      });

      if (response.status === 201) {
        toast.success("Funcionalidade adicionada com sucesso!");
        setNewFuncionalidade("");
        fetchFuncionalidades();
      }
    } catch (error) {
      console.error("Erro ao adicionar funcionalidade!", error);
      toast.error("Erro ao adicionar funcionalidade.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="funcionalidades-manager">
        <h2>Gerenciar Funcionalidades</h2>
        <div className="add-funcionalidade mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Nome da nova funcionalidade"
            value={newFuncionalidade}
            onChange={(e) => setNewFuncionalidade(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleAddFuncionalidade}>
            Adicionar
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
