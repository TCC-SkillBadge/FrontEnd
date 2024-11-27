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

  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

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
      newErrors.descricao = "The description is required.";
    }
    // Adicione outras validações de campos obrigatórios aqui, se necessário
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação antes da submissão
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isEditAllowed && existingEvent) {
      toast.error("It is no longer possible to edit this post.");
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
          `${enterpriseUrl}/api/eventos/${existingEvent.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Post updated successfully!");
        onPostUpdated(response.data.evento);
      } else {
        response = await axios.post(
          `${enterpriseUrl}/api/eventos`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Post created successfully!");
        onPostCreated(response.data.evento);
      }

      // Limpeza dos campos após a submissão
      setPostText("");
      setPostImage(null);
      onClose && onClose();
    } catch (error) {
      console.error("Erro ao salvar o post:", error);
      toast.error("Failed to save the post.");
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
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {existingEvent && existingEvent.createdAt && (
        <div className="post-publication-info">
          <p>
            Published on:{" "}
            <strong>{formatDateTime(existingEvent.createdAt)}</strong>
          </p>
        </div>
      )}

      <div className="form-group">
        <textarea
          value={postText}
          onChange={handleTextChange}
          placeholder="Write something..."
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
          <PlusSquare /> {existingEvent ? "Update" : "Publish"}
        </button>

        {existingEvent && (
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={!isEditAllowed}
          >
            Cancel
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
