// src/components/PostForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusSquare, Image, ShareFill } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import "../styles/PostForm.css";

const PostForm = ({
  onPostCreated,
  onPostUpdated,
  existingEvent,
  onClose,
  isEditAllowed = true, // Valor padrão definido aqui
}) => {
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingEvent) {
      setPostText(existingEvent.descricao || "");
      // Não definimos postImage para evitar manipulação de arquivos existentes
    }
  }, [existingEvent]);

  const handleTextChange = (e) => {
    setPostText(e.target.value);
    // Limpa o erro quando o usuário começa a digitar
    if (errors.descricao) {
      setErrors((prevErrors) => ({ ...prevErrors, descricao: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      // Limpa o erro relacionado à imagem, se houver
      if (errors.image) {
        setErrors((prevErrors) => ({ ...prevErrors, image: null }));
      }
    }
  };

  const handleImageClick = () => {
    if (isEditAllowed) {
      document.getElementById("image-upload").click();
    }
  };

  // Função de validação
  const validate = () => {
    const newErrors = {};
    if (!postText.trim()) {
      newErrors.descricao = "A descrição é obrigatória.";
    }
    // Adicione outras validações de campos obrigatórios aqui, se necessário
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação antes da submissão
    if (!validate()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!isEditAllowed && existingEvent) {
      toast.error("Não é mais possível editar este post.");
      return;
    }

    setIsSubmitting(true);

    const token = sessionStorage.getItem("token");
    const formData = new FormData();

    formData.append("descricao", postText);
    if (postImage) {
      formData.append("image", postImage);
    }

    try {
      let response;
      if (existingEvent) {
        response = await axios.put(
          `http://localhost:7003/api/eventos/${existingEvent.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Post atualizado com sucesso!");
        onPostUpdated(response.data.evento);
      } else {
        response = await axios.post(
          "http://localhost:7003/api/eventos",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Post criado com sucesso!");
        onPostCreated(response.data.evento);
      }

      // Limpeza dos campos após a submissão
      setPostText("");
      setPostImage(null);
      onClose && onClose();
    } catch (error) {
      console.error("Erro ao salvar o post:", error);
      toast.error("Falha ao salvar o post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPostText("");
    setPostImage(null);
    setErrors({});
    onClose && onClose();
  };

  // Função para formatar a data e hora
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", options);
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {existingEvent && existingEvent.createdAt && (
        <div className="post-publication-info">
          <p>
            Publicado em:{" "}
            <strong>{formatDateTime(existingEvent.createdAt)}</strong>
          </p>
        </div>
      )}

      <div className="form-group">
        <textarea
          value={postText}
          onChange={handleTextChange}
          placeholder="Escreva algo..."
          className={`post-textarea ${errors.descricao ? "is-invalid" : ""}`}
          disabled={existingEvent && !isEditAllowed}
        />
        {errors.descricao && (
          <div className="invalid-feedback">{errors.descricao}</div>
        )}
      </div>

      <div className="post-actions">
        <div
          className={`image-upload-wrapper ${
            existingEvent && !isEditAllowed ? "disabled" : ""
          }`}
          onClick={handleImageClick}
        >
          <Image className="photo-icon" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="image-upload"
            style={{ display: "none" }}
            disabled={existingEvent && !isEditAllowed}
          />
        </div>

        {/* <div className="share-wrapper">
          <ShareFill className="share-icon" />
        </div> */}

        <button
          type="submit"
          disabled={isSubmitting || (existingEvent && !isEditAllowed)}
          className="submit-post-button"
        >
          <PlusSquare /> {existingEvent ? "Atualizar" : "Publicar"}
        </button>

        {existingEvent && (
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={!isEditAllowed}
          >
            Cancelar
          </button>
        )}
      </div>

      {postImage && (
        <div className="image-preview">
          <img src={URL.createObjectURL(postImage)} alt="Pré-visualização" />
        </div>
      )}

      {existingEvent && existingEvent.imageUrl && !postImage && (
        <div className="image-preview">
          <img src={existingEvent.imageUrl} alt="Imagem existente" />
        </div>
      )}
    </form>
  );
};

export default PostForm;
