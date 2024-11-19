import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/BadgeDetails.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const BadgeDetails = ({ id_badge, razao_social, url_origem }) => {
    const [badge, setBadge] = useState({
        id_badge: 0,
        name_badge: "",
        desc_badge: "",
        validity_badge: 0,
        image_url: "",
        institution: "",
    });

    const [user, setUser] = useState({
        email_comercial: "",
        senha: "",
        razao_social: "",
        cnpj: "",
        cep: "",
        logradouro: "",
        bairro: "",
        municipio: "",
        suplemento: "",
        numero_contato: "",
        api_key: "",
        imageUrl: "",
    });

    const [razSoc, setRazSoc] = useState('');

    const fetchBadge = async () => {
        try {
            const response = await axios.get(`http://localhost:7001/badges/consult?id_badge=${id_badge}`);
            setBadge(response.data);
        } catch (error) {
            console.error('Error fetching the badge:', error);
        }
    };

    const fetchUser = async () => {
        try {
            const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));
            setUser(storedUserInfo);
        } catch (error) {
            console.error('Error fetching institution:', error);
        }
    };

    useEffect(() => {
        fetchBadge();
        fetchUser();
    }, [id_badge]);

    useEffect(() => {
        let inst = 'Unknown';
        if (user && user.razao_social) {
            console.log('user dentro if:', user);
            inst = user.razao_social;
        } else if (razao_social && !(razao_social === 'undefined')) {
            console.log('razao_social dentro if:', razao_social);
            inst = razao_social;
        }
        setRazSoc(() => inst);
    }, [user, razao_social]);

    return (
        <div className="badge-details-container">
            <div className="row">
                <div className="col-md-4">
                    <img src={badge.image_url} className="badge-details-image" alt={badge.name_badge} />
                    <p className="badge-details-text">
                        By {razSoc}
                    </p>
                </div>
                <div className="col-md-8">
                    <div className="badge-details-content">
                        <h1 className="badge-details-title">{badge.name_badge}</h1>
                        <br />
                        <br />
                        <h2 className="badge-details-subtitle">Description</h2>
                        <br />
                        <p className="badge-details-description">{badge.desc_badge}</p>
                        {
                            url_origem ?
                            <Link to={url_origem} className="badge-details-button">
                                Back
                            </Link> :
                            null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeDetails;