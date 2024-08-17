import React, { useState, useEffect } from "react";
import "../styles/Badge.css";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import {
  TagFill,
  JournalText,
  HourglassSplit,
  ShieldFill,
} from "react-bootstrap-icons";

const Badge = () => {
  const [userType, setUserType] = useState(null);
  let [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name_badge: "",
    desc_badge: "",
    validity_badge: 0,
  });
  const [image_badge, setImageBadge] = useState(null);

  const verificaLogin = () => {
    const usuarioEmpresarial = sessionStorage.getItem("usuarioEmpresarial");
    const usuarioAdmin = sessionStorage.getItem("usuarioAdmin");
    if (usuarioEmpresarial) {
      setUserType("business");
      setUser(JSON.parse(usuarioEmpresarial));
    } else if (usuarioAdmin) {
      setUserType("admin");
      setUser(JSON.parse(usuarioAdmin));
    } else {
      //navigate("/home")
    }
  };

  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, name_badge: value }));
  };

  const handleDescChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, desc_badge: value }));
  };

  const handleValidityChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, validity_badge: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageBadge(file);
    } else {
      setImageBadge(null);
    }
  };

  const badgePreview = () => {
    if (image_badge !== null) {
      return (
        <div className="badge-card">
          <img
            src={image_badge ? URL.createObjectURL(image_badge) : ""}            
            className="badge-preview"
          />
          <h3>{formData.name_badge}</h3>
          <button type="button" title={`link that will direct to detailed description: ` + formData.desc_badge}>Details</button>
        </div>
      )
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(user == null){
      user = {email: "teste@email.com"}
    }

    const formDataToSend = new FormData();
    formDataToSend.append('institution', user.email);
    formDataToSend.append('name_badge', formData.name_badge);
    formDataToSend.append('desc_badge', formData.desc_badge);
    formDataToSend.append('validity_badge', formData.validity_badge);
    formDataToSend.append('image_badge', image_badge);
    formDataToSend.append('created_user', user.email);

    try {
      let response = await axios.post("http://localhost:7001/badge/cadastrar", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        alert("Badge registered successfully");
        navigate("/badge");
      }
    } catch (error) {
      console.error("Error registering badge:", error);
      alert("Error registering badge");
    }
  };

  useEffect(() => {
    verificaLogin();
    window.onstorage = verificaLogin;
  }, []);

  return (
    <div>
      <Navbar />
      <div className="badge-page">
        <div className="badge-container">
          <h2>Create Badge</h2>
          <form onSubmit={handleSubmit}>
            <>
              <div className="form-group">
                <label className="form-label">
                  Badge title
                </label>
                <div className="input-icon">
                  <TagFill />
                  <input
                    type="text"
                    className="form-control"
                    id="name_badge"
                    placeholder="Enter badge title"
                    value={formData.name_badge}
                    onChange={handleNameChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Badge description
                </label>
                <div className="input-icon">
                  <JournalText />
                  <textarea
                    className="form-control"
                    id="desc_badge"
                    placeholder="Enter badge description"
                    value={formData.desc_badge}
                    onChange={handleDescChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Badge validity in months (optional)
                </label>
                <div className="input-icon">
                  <HourglassSplit />
                  <input
                    type="number"
                    className="form-control"
                    id="validity_badge"
                    placeholder="Enter badge validity"
                    value={formData.validity_badge}
                    onChange={handleValidityChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Badge image
                </label>
                <div className="input-icon">
                  <ShieldFill />
                  <label htmlFor="image_badge" className="custom-file-upload">
                    Escolher Arquivo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    id="image_badge"
                    onChange={handleImageChange}
                    required
                  />
                </div>
              </div>
              {badgePreview()}
            </>
            <div className="btn-container">
              <button type="submit" className="btn btn-primary">
                Save badge
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Badge;