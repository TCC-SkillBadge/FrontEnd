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

  useEffect(() => {
    if (existingEvent) {
      setPostText(existingEvent.descricao || "");
      // Não definimos postImage para evitar manipulação de arquivos existentes
    }
  }, [existingEvent]);

  const handleTextChange = (e) => {
    setPostText(e.target.value);
  };

  const handleImageChange = (e) => {
    setPostImage(e.target.files[0]);
  };

  const handleImageClick = () => {
    if (isEditAllowed) {
      document.getElementById("image-upload").click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      <textarea
        value={postText}
        onChange={handleTextChange}
        placeholder="Escreva algo..."
        className="post-textarea"
        disabled={existingEvent && !isEditAllowed}
      />

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

        <div className="share-wrapper">
          <ShareFill className="share-icon" />
        </div>

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
          <img src={URL.createObjectURL(postImage)} alt="Preview" />
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
