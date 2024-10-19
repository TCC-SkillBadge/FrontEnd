import React, { useState } from "react";
import axios from "axios";
import { PlusSquare, Image, ShareFill } from "react-bootstrap-icons"; // Import icons
import { toast } from "react-toastify";
import "../styles/PostForm.css"; // Import CSS

const PostForm = ({ onPostCreated }) => {
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await axios.post(
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
      setPostText("");
      setPostImage(null);
      onPostCreated(response.data.evento);
    } catch (error) {
      console.error("Erro ao criar o post:", error);
      toast.error("Falha ao criar o post.");
    } finally {
      setIsSubmitting(false);
    }
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
      
        <div className="image-upload-wrapper" onClick={handleImageClick}>
          <Image className="photo-icon" /> 
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="image-upload"
            style={{ display: "none" }} 
          />
        </div>

      
        <div className="share-wrapper">
          <ShareFill className="share-icon" /> 
        </div>

    
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-post-button"
        >
          <PlusSquare /> Publicar
        </button>
      </div>

      {postImage && (
        <div className="image-preview">
          <img src={URL.createObjectURL(postImage)} alt="Preview" />
        </div>
      )}
    </form>
  );
};

export default PostForm;
