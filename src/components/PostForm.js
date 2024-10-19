import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusSquare, Image, ShareFill } from "react-bootstrap-icons"; // Import icons
import { toast } from "react-toastify";
import "../styles/PostForm.css"; // Import CSS

const PostForm = ({ onPostCreated, onPostUpdated, existingEvent, onClose }) => {
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza o estado quando um evento existente é passado para edição
  useEffect(() => {
    if (existingEvent) {
      setPostText(existingEvent.descricao || "");
      // Não podemos definir postImage aqui porque não temos acesso ao arquivo original
    }
  }, [existingEvent]);

  const handleTextChange = (e) => {
    setPostText(e.target.value);
  };

  const handleImageChange = (e) => {
    setPostImage(e.target.files[0]);
  };

  const handleImageClick = () => {
    document.getElementById("image-upload").click(); // Trigger file input click
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        // Editar evento
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
        // Criar novo evento
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

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <textarea
        value={postText}
        onChange={handleTextChange}
        placeholder="Escreva algo..."
        className="post-textarea"
      />

      <div className="post-actions">
        {/* Botão para upload de imagem */}
        <div className="image-upload-wrapper" onClick={handleImageClick}>
          <Image className="photo-icon" /> {/* Ícone de foto */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="image-upload"
            style={{ display: "none" }} // Input de arquivo oculto
          />
        </div>

        {/* Opção de compartilhar (pode ser implementada conforme necessário) */}
        <div className="share-wrapper">
          <ShareFill className="share-icon" /> {/* Ícone de compartilhar */}
        </div>

        {/* Botão de enviar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-post-button"
        >
          <PlusSquare /> {existingEvent ? "Atualizar" : "Publicar"}
        </button>

        {/* Botão de cancelar (apenas no modo de edição) */}
        {existingEvent && (
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Pré-visualização da imagem selecionada */}
      {postImage && (
        <div className="image-preview">
          <img src={URL.createObjectURL(postImage)} alt="Preview" />
        </div>
      )}

      {/* Mostrar a imagem existente se estiver editando e nenhuma nova imagem for selecionada */}
      {existingEvent && existingEvent.imageUrl && !postImage && (
        <div className="image-preview">
          <img src={existingEvent.imageUrl} alt="Imagem existente" />
        </div>
      )}
    </form>
  );
};

export default PostForm;
