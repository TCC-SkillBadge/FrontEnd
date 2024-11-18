import React, { useState, useEffect } from "react";
import "../../styles/Badge.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TagFill,
  JournalText,
  HourglassSplit,
  ShieldFill,
} from "react-bootstrap-icons";

const EditBadge = () => {
  const { id_badge } = useParams();
  const [userType, setUserType] = useState(null);
  let [user, setUser] = useState(null);
  const [badge, setBadge] = useState({
    id_badge: 0,
    name_badge: "",
    desc_badge: "",
    validity_badge: 0,
    image_url: "",
  });
  const [image_badge, setImageBadge] = useState(null);

  const fetchBadge = async () => {
    try {
      const response = await axios.get(`http://localhost:7001/badges/consult?id_badge=${id_badge}`);
      setBadge(response.data);
    } catch (error) {
      console.error('Error fetching the badge:', error);
    }
  };

  const verificaLogin = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("tipoUsuario");

    if (userType === "UE") {
      let userInfoResponse = await axios.get(
        `http://localhost:7003/api/acessar-info-usuario-jwt`,
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
    setBadge((prevData) => ({ ...prevData, name_badge: value }));
  };

  const handleDescChange = (e) => {
    const { id, value } = e.target;
    setBadge((prevData) => ({ ...prevData, desc_badge: value }));
  };

  const handleValidityChange = (e) => {
    const { id, value } = e.target;
    setBadge((prevData) => ({ ...prevData, validity_badge: value }));
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
          <h3>{badge.name_badge}</h3>
          <button type="button" title={`link that will direct to detailed description: ` + badge.desc_badge}>Details</button>
        </div>
      )
    }
    else {
      return (
        <div className="badge-card">
          <img
            src={badge.image_url ? badge.image_url : ""}
            className="badge-preview"
          />
          <h3>{badge.name_badge}</h3>
        </div>
      )
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Loading...");

    try {
      if (user == null) {
        user = { email: "teste@email.com" }
      }

      const formDataToSend = new FormData();
      formDataToSend.append('id_badge', badge.id_badge);
      formDataToSend.append('name_badge', badge.name_badge);
      formDataToSend.append('desc_badge', badge.desc_badge);
      formDataToSend.append('validity_badge', badge.validity_badge);
      formDataToSend.append('image_badge', image_badge);
      formDataToSend.append('updated_user', user.email_comercial);

      let response = await axios.put("http://localhost:7001/badges/update", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.dismiss(loadingToastId);

      if (response.status === 200) {
        toast.success("Badge updated successfully");
        setTimeout(() => {
          navigate("/badges");
        }, 2000);
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error registering badge:", error);
      toast.error("Error updating badge");
    }
  };

  useEffect(() => {
    verificaLogin();
    window.onstorage = verificaLogin;
    fetchBadge();
  }, [id_badge]);

  return (
    <div>
      <div className="badge-page">
        <div className="badge-container">
          <h2>Edit Badge</h2>
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
                    value={badge.name_badge}
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
                    value={badge.desc_badge}
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
                    value={badge.validity_badge}
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
                  />
                </div>
              </div>
              {badgePreview()}
            </>
            <div className="btn-container">
              <button type="submit" className="btn btn-primary">
                Update badge
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

export default EditBadge;