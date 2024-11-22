import React, { useState, useEffect } from "react";
import "../../styles/Badge.css";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TagFill,
  JournalText,
  HourglassSplit,
  ShieldFill,
  LightbulbFill,
} from "react-bootstrap-icons";
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input';

const CreateBadge = () => {
  const [userType, setUserType] = useState(null);
  let [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name_badge: "",
    desc_badge: "",
    validity_badge: 0,
  });
  const [image_badge, setImageBadge] = useState(null);
  const [tags, setTags] = useState([]);

  const badgeUrl = process.env.REACT_APP_API_BADGE;
  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

  const verificaLogin = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("tipoUsuario");

    if (userType === "UE") {
      let userInfoResponse = await axios.get(
        `${enterpriseUrl}/api/acessar-info-usuario-jwt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserType("business");
      setUser(userInfoResponse.data);
    } else {
      navigate("/home")
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

  const handleDeleteSkill = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAdditionSkill = (tag) => {
    setTags([...tags, tag]);
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
        </div>
      )
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Loading...");

    try {
      if (user == null) {
        user = { email_comercial: "teste@email.com" }
      }

      const skillsString = tags.map(tag => tag.text).join(';');

      const formDataToSend = new FormData();
      formDataToSend.append('institution', user.email_comercial);
      formDataToSend.append('name_badge', formData.name_badge);
      formDataToSend.append('desc_badge', formData.desc_badge);
      formDataToSend.append('validity_badge', formData.validity_badge);
      formDataToSend.append('image_badge', image_badge);
      formDataToSend.append('created_user', user.email_comercial);
      formDataToSend.append('skills_badge', skillsString);


      let response = await axios.post(`${badgeUrl}/badges/create`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.dismiss(loadingToastId);

      if (response.status === 201) {
        toast.success("Badge registered successfully");
        setTimeout(() => {
          navigate("/badges");
        }, 2000);
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error registering badge:", error);
      toast.error("Error registering badge");
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
                  Skills
                </label>
                <div className="input-icon">
                  <LightbulbFill />
                  <ReactTags
                    tags={tags}
                    separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
                    handleDelete={handleDeleteSkill}
                    handleAddition={handleAdditionSkill}
                    inputFieldPosition="bottom"
                    autocomplete
                    placeholder="Enter skills and press enter"
                    maxTags={20}
                    minTags={2}
                    autoFocus={false}
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
      <Footer />
    </div>
  );
};

export default CreateBadge;