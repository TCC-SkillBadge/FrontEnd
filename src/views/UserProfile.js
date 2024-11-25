// src/components/UserProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  PencilSquare,
  Trash,
  PlusSquare,
  AwardFill,
  Building,
  Briefcase,
  Globe,
  Flag,
  PersonFill,
  MortarboardFill,
  ShareFill,
  FileEarmarkArrowDownFill,
  GeoAlt,
  Phone,
  CalendarFill,
  PeopleFill,
  ThreeDotsVertical,
  ChevronDown,
  ChevronUp,
} from "react-bootstrap-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/UserProfile.css";
import "../styles/GlobalStylings.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { Link } from "react-router-dom"; 
import PostForm from "../components/PostForm";
import { useNavigate, useParams } from "react-router-dom";
import { protectRoute } from "../utils/general-functions/ProtectRoutes";
import { CameraFill } from "react-bootstrap-icons";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    occupation: "",
    about: "",
    education: [],
    professionalExperience: [],
    languages: [],
    imageUrl: "",
    razao_social: "",
    cnpj: "",
    username: "",
    municipio: "",
    segmento: "",
    tamanho: "",
    website: "",
    numero_contato: "",
    events: [],
    badges: [],
    photo: null, // Adicionado para armazenar o arquivo de foto
  });

  const [imagePreview, setImagePreview] = useState(null); // Novo estado para a pré-visualização

  const navigate = useNavigate();
  const { encodedEmail } = useParams();

  const [originalUserData, setOriginalUserData] = useState(null);

  // useEffect(() => {
  //   const updateUrlWithEncodedEmail = async () => {
  //     try {
  //       const token = sessionStorage.getItem("token");
  //       if (!token) {
  //         console.error("Token não encontrado. Usuário não autenticado.");
  //         return;
  //       }

  //       const response = await axios.get(
  //         "http://localhost:7000/api/user/info",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       const userEmail = response.data.email || response.data.email_comercial;
  //       if (!userEmail) {
  //         console.error("Email do usuário não disponível.");
  //         return;
  //       }

  //       const encodedEmail = btoa(userEmail); // Codifica o email
  //       const currentPath = window.location.pathname;

  //       // Atualiza a URL se necessário
  //       if (!currentPath.includes(encodedEmail)) {
  //         navigate(`/public-profile/${encodedEmail}`, { replace: true });
  //       }
  //     } catch (error) {
  //       console.error("Erro ao atualizar a URL:", error);
  //     }
  //   };

  //   updateUrlWithEncodedEmail();
  // }, [navigate]);

  const handleBadgeVisibilityChange = async (e, badgeId, index) => {
    const isPublic = e.target.checked;
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:7000/api/badges/visibility",
        {
          badgeIds: [badgeId],
          is_public: isPublic,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Atualiza o estado local para refletir a mudança
      setUserData((prevData) => {
        const updatedBadges = [...prevData.badges];
        updatedBadges[index].is_public = isPublic;
        return {
          ...prevData,
          badges: updatedBadges,
        };
      });
      // Removido o toast de sucesso
    } catch (error) {
      console.error("Erro ao atualizar visibilidade da badge:", error);
      toast.error("Falha ao atualizar a visibilidade da badge.");
    }
  };

  const [optionsVisibleIndex, setOptionsVisibleIndex] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  const tipoUsuario = sessionStorage.getItem("tipoUsuario");
  const [activeTab, setActiveTab] = useState(
    tipoUsuario === "UC" ? "perfil" : "sobre"
  );
  const handleNewPost = (newPost) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      events: [newPost, ...prevUserData.events],
    }));
  };

  useEffect(() => {
    const checkAuthenticationAndRedirect = async () => {
      const token = sessionStorage.getItem("token");

      // Caso o usuário não esteja logado ou não seja o proprietário do perfil
      if (!token) {
        try {
          // Verificar o perfil público do usuário comum
          const publicProfileUCResponse = await axios.get(
            `http://localhost:7000/api/public-profile/${encodedEmail}`
          );
          if (publicProfileUCResponse.data) {
            navigate(`/public-profile/${encodedEmail}`, { replace: true });
            return;
          }
        } catch (error) {
          console.error("Perfil público de UC não encontrado:", error);
        }

        try {
          // Verificar o perfil público do usuário empresarial
          const publicProfileUEResponse = await axios.get(
            `http://localhost:7003/api/public-profile/${encodedEmail}`
          );
          if (publicProfileUEResponse.data) {
            navigate(`/public-profile-enterprise/${encodedEmail}`, {
              replace: true,
            });
            return;
          }
        } catch (error) {
          console.error("Perfil público de UE não encontrado:", error);
        }

        // Se nenhum perfil for encontrado, redirecionar para a página inicial
        navigate("/", { replace: true });
      } else {
        // Carregar informações do perfil privado
        try {
          await fetchUserInfo();
        } catch (error) {
          console.error(
            "Erro ao carregar informações do usuário autenticado:",
            error
          );
          navigate("/", { replace: true });
        }
      }
    };

    checkAuthenticationAndRedirect();
  }, [encodedEmail, navigate]);

  // Função para buscar as informações do usuário
  const fetchUserInfo = async () => {
    try {
      const token = sessionStorage.getItem("token");
      let response;

      if (!token) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      // Carregar os idiomas disponíveis primeiro
      const languagesResponse = await axios.get(
        "http://localhost:7000/api/languages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvailableLanguages(languagesResponse.data);

      if (tipoUsuario === "UC") {
        response = await axios.get("http://localhost:7000/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Mapear os idiomas do usuário para objetos com id e name
        const userLanguages = Array.isArray(response.data.languages)
          ? response.data.languages
          : [];

        setUserData({
          ...response.data,
          education: Array.isArray(response.data.education)
            ? response.data.education
            : [],
          professionalExperience: Array.isArray(
            response.data.professional_experience
          )
            ? response.data.professional_experience
            : [],
          languages: userLanguages,
        });

        // Chamar fetchBadges para usuários comuns
        const email = response.data.email || "teste@email.com";
        await fetchBadges("UC", email);
      } else if (tipoUsuario === "UE") {
        response = await axios.get(
          "http://localhost:7003/api/acessar-info-usuario-jwt",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const eventsResponse = await axios.get(
          "http://localhost:7003/api/eventos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData({
          ...response.data,
          email_comercial: response.data.email_comercial,
          sobre: response.data.sobre || "",
          username: response.data.username || "",
          website: response.data.website || "",
          events: eventsResponse.data || [],
          badges: [], // Inicializa como vazio
        });

        console.log("Loaded events:", eventsResponse.data);

        // Chamar fetchBadges para usuários empresariais
        const email =
          response.data.email_comercial || "teste_comercial@email.com";
        await fetchBadges("UE", email);
      } else {
        setError("Tipo de usuário inválido");
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao obter informações do usuário:", error);
      setError("Falha ao carregar os dados do usuário");
      setLoading(false);
    }
  };

  // Função para buscar as badges do usuário
  const fetchBadges = async (tipoUsuario, email) => {
    try {
      let response;
      const token = sessionStorage.getItem("token");

      if (tipoUsuario === "UC") {
        // Endpoint para usuários comuns
        response = await axios.get(
          `http://localhost:7001/badges/wallet?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (tipoUsuario === "UE") {
        // Endpoint para usuários empresariais
        response = await axios.get(
          `http://localhost:7001/badges/consult?search=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        throw new Error("Tipo de usuário inválido");
      }

      setUserData((prevData) => ({
        ...prevData,
        badges: response.data,
      }));
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar badges:", error);
      setUserData((prevData) => ({ ...prevData, badges: [] }));
      setLoading(false);
    }
  };

  // Função para formatar data e hora
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

  // Verificar autenticação e buscar informações do usuário
useEffect(() => {
  const checkAuthentication = async () => {
    const token = sessionStorage.getItem("token");

    // Se o usuário não estiver autenticado
    if (!token) {
      try {
        // Verificar se o perfil público de usuário comum (UC) está acessível
        const responseUC = await axios.get(
          `http://localhost:7009/api/public-profile/${encodedEmail}`
        );
        if (responseUC.data) {
          // Redirecionar para o perfil público de UC
          navigate(`/public-profile/${encodedEmail}`, { replace: true });
          return;
        }
      } catch (error) {
        console.error("Perfil público UC não encontrado, tentando UE...");
      }

      try {
        // Verificar se o perfil público de usuário empresarial (UE) está acessível
        const responseUE = await axios.get(
          `http://localhost:7003/api/public-profile/${encodedEmail}`
        );
        if (responseUE.data) {
          // Redirecionar para o perfil público de UE
          navigate(`/public-profile-enterprise/${encodedEmail}`, {
            replace: true,
          });
          return;
        }
      } catch (error) {
        console.error("Perfil público UE não encontrado.");
      }

      // Se nenhum perfil público for encontrado, redirecionar para a página inicial
      navigate(`/`, { replace: true });
      return;
    }

    // Usuário autenticado, carregar informações privadas
    try {
      await fetchUserInfo();
    } catch (error) {
      console.error(
        "Erro ao buscar informações do usuário autenticado:",
        error
      );
      navigate(`/`, { replace: true });
    }
  };

  checkAuthentication();
}, [navigate, encodedEmail]);


  useEffect(() => {
    // const fetchUserInfo = async () => {
    //   try {
    //     const token = sessionStorage.getItem("token");
    //     let response;

    //     if (!token) {
    //       setError("Usuário não autenticado");
    //       setLoading(false);
    //       return;
    //     }

    //     // Carregar os idiomas disponíveis primeiro
    //     const languagesResponse = await axios.get(
    //       "http://localhost:7000/api/languages",
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       }
    //     );
    //     setAvailableLanguages(languagesResponse.data);

    //     if (tipoUsuario === "UC") {
    //       response = await axios.get("http://localhost:7000/api/user/info", {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       });

    //       // Mapear os idiomas do usuário para objetos com id e name
    //       const userLanguages = Array.isArray(response.data.languages)
    //         ? response.data.languages
    //         : [];

    //       setUserData({
    //         ...response.data,
    //         education: Array.isArray(response.data.education)
    //           ? response.data.education
    //           : [],
    //         professionalExperience: Array.isArray(
    //           response.data.professional_experience
    //         )
    //           ? response.data.professional_experience
    //           : [],
    //         languages: userLanguages,
    //       });

    //       // Chamar fetchBadges para usuários comuns
    //       const email = response.data.email || "teste@email.com";
    //       await fetchBadges("UC", email);
    //     } else if (tipoUsuario === "UE") {
    //       response = await axios.get(
    //         "http://localhost:7003/api/acessar-info-usuario-jwt",
    //         {
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         }
    //       );

    //       const eventsResponse = await axios.get(
    //         "http://localhost:7003/api/eventos",
    //         {
    //           headers: {
    //             Authorization: `Bearer ${token}`,
    //           },
    //         }
    //       );

    //       setUserData({
    //         ...response.data,
    //         email_comercial: response.data.email_comercial,
    //         sobre: response.data.sobre || "",
    //         website: response.data.website || "",
    //         events: eventsResponse.data || [],
    //         badges: [], // Inicializa como vazio
    //       });

    //       console.log("Loaded events:", eventsResponse.data);

    //       // Chamar fetchBadges para usuários empresariais
    //       const email =
    //         response.data.email_comercial || "teste_comercial@email.com";
    //       await fetchBadges("UE", email);
    //     } else {
    //       setError("Tipo de usuário inválido");
    //     }

    //     setLoading(false);
    //   } catch (error) {
    //     console.error("Erro ao obter informações do usuário:", error);
    //     setError("Falha ao carregar os dados do usuário");
    //     setLoading(false);
    //   }
    // };

    fetchUserInfo();
  }, [tipoUsuario]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Se estiver editando e o usuário clicar para cancelar, reseta imagePreview e photo
      setImagePreview(null);
      setUserData(originalUserData);
      setUserData((prevData) => ({
        ...prevData,
        photo: null,
      }));
    }else{
      setOriginalUserData(JSON.parse(JSON.stringify(userData)));
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Atualizando ${name}: ${value}`);
    setUserData({ ...userData, [name]: value });
  };

  const handleArrayChange = (e, index, key, arrayKey) => {
    let value = e.target.value;

    // Se o campo for um ano (admissionYear, graduationYear, startDate, endDate)
    if (
      key === "admissionYear" ||
      key === "graduationYear" ||
      key === "startDate" ||
      key === "endDate"
    ) {
      // Remover caracteres não numéricos
      value = value.replace(/[^0-9]/g, "");

      // Limitar o tamanho a 4 dígitos
      if (value.length > 4) {
        value = value.slice(0, 4);
      }
    }

    const updatedArray = [...userData[arrayKey]];
    updatedArray[index][key] = value;
    setUserData({ ...userData, [arrayKey]: updatedArray });
  };

  const handleAddItem = (arrayKey, newItem) => {
    setUserData({
      ...userData,
      [arrayKey]: [...userData[arrayKey], newItem],
    });
  };

  const handleRemoveItem = (index, arrayKey) => {
    const updatedArray = userData[arrayKey].filter((_, i) => i !== index);
    setUserData({ ...userData, [arrayKey]: updatedArray });
  };

  const handleLanguageCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const languageId = parseInt(value);
    const languageObj = availableLanguages.find(
      (lang) => lang.id === languageId
    );

    if (checked) {
      // Adiciona o idioma à lista se estiver marcado
      if (languageObj) {
        setUserData((prevState) => ({
          ...prevState,
          languages: [
            ...prevState.languages,
            { id: languageObj.id, name: languageObj.language },
          ],
        }));
      }
    } else {
      // Remove o idioma da lista se desmarcado
      setUserData((prevState) => ({
        ...prevState,
        languages: prevState.languages.filter((lang) => lang.id !== languageId),
      }));
    }
  };
  

useEffect(() => {
  const fetchLanguages = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:7000/api/languages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableLanguages(response.data);
    } catch (error) {
      console.error("Erro ao buscar idiomas:", error);
      toast.error("Falha ao carregar idiomas.");
    }
  };

  fetchLanguages();
}, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, photo: file });
      setImagePreview(URL.createObjectURL(file)); // Define a pré-visualização
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

const validateDates = () => {
  let isValid = true;

  (userData.education || []).forEach((edu) => {
    if (
      edu.admissionYear &&
      edu.graduationYear &&
      parseInt(edu.admissionYear) > parseInt(edu.graduationYear)
    ) {
      toast.error(
        `Na educação, o ano de início (${edu.admissionYear}) não pode ser maior que o ano de término (${edu.graduationYear}).`
      );
      isValid = false;
    }
  });

  (userData.professionalExperience || []).forEach((exp) => {
    if (
      exp.startDate &&
      exp.endDate &&
      parseInt(exp.startDate) > parseInt(exp.endDate)
    ) {
      toast.error(
        `Na experiência profissional, a data de início (${exp.startDate}) não pode ser maior que a data de término (${exp.endDate}).`
      );
      isValid = false;
    }
  });

  return isValid;
};

  const handleSaveChanges = async () => {
    if (tipoUsuario === "UC") {
      if (!userData.fullName.trim()) {
        toast.error(
          "O campo 'Nome Completo' é obrigatório e não pode estar vazio."
        );
        return; // Impede a continuação da função
      }
    } else if (tipoUsuario === "UE") {
      if (!userData.username.trim()) {
        toast.error("O campo 'Username' é obrigatório e não pode estar vazio.");
        return; // Impede a continuação da função
      }
    }
    if (!validateDates()) {
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      if (userData.photo) {
        formData.append("photo", userData.photo);
      }

      if (tipoUsuario === "UC") {
        formData.append("fullName", userData.fullName || "");
        formData.append("occupation", userData.occupation || "");
        formData.append("country", userData.country || "");
        formData.append("phoneNumber", userData.phoneNumber || "");
        formData.append("about", userData.about || "");
        formData.append("education", JSON.stringify(userData.education || []));
        formData.append(
          "professionalExperience",
          JSON.stringify(userData.professionalExperience || [])
        );
        formData.append(
          "languages",
          JSON.stringify(userData.languages.map((lang) => lang.id))
        );

        await axios.put("http://localhost:7000/api/user/update", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (tipoUsuario === "UE") {
        formData.append("razao_social", userData.razao_social || "");
        formData.append("cnpj", userData.cnpj || "");
        formData.append("username", userData.username || "");
        formData.append("cep", userData.cep || "");
        formData.append("logradouro", userData.logradouro || "");
        formData.append("bairro", userData.bairro || "");
        formData.append("municipio", userData.municipio || "");
        formData.append("suplemento", userData.suplemento || "");
        formData.append("numero_contato", userData.numero_contato || "");
        formData.append("sobre", userData.sobre || "");
        formData.append("website", userData.website || "");

        await axios.put("http://localhost:7003/api/update", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setIsEditing(false);
      setImagePreview(null);
      setOriginalUserData(null);
      setUserData((prevData) => ({
        ...prevData,
        photo: null, // Opcional: garantir que photo também seja resetado
      }));
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar os dados do usuário:", error);
      toast.error("Falha ao atualizar os dados do usuário");
    }
  };

  const handleShareProfile = () => {
    let encodedEmail;
    let publicProfileUrl;

    if (tipoUsuario === "UC") {
      if (!userData.email) {
        toast.error("Email não disponível.");
        return;
      }
      encodedEmail = btoa(userData.email);
      publicProfileUrl = `${window.location.origin}/public-profile/${encodedEmail}`;
    } else if (tipoUsuario === "UE") {
      if (!userData.email_comercial) {
        toast.error("Email comercial não disponível.");
        return;
      }
      encodedEmail = btoa(userData.email_comercial);
      publicProfileUrl = `${window.location.origin}/public-profile-enterprise/${encodedEmail}`;
    } else {
      toast.error("Tipo de usuário inválido.");
      return;
    }

    navigator.clipboard
      .writeText(publicProfileUrl)
      .then(() => {
        toast.info("URL do perfil copiada para a área de transferência!");
      })
      .catch((error) => {
        console.error("Erro ao copiar o link:", error);
        toast.error("Falha ao copiar o link.");
      });
  };

  const handleDownloadPortfolio = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    let currentY = 50;

    doc.setFontSize(20);
    doc.text("User Portfolio", 40, currentY);
    currentY += 40;

    doc.setFontSize(12);
    doc.text(`Name: ${userData.fullName}`, 40, currentY);
    currentY += 20;
    doc.text(`Occupation: ${userData.occupation}`, 40, currentY);
    currentY += 20;
    doc.text(`About: ${userData.about}`, 40, currentY);
    currentY += 30;

    doc.setFontSize(16);
    doc.text("Education:", 40, currentY);
    currentY += 20;
    userData.education.forEach((edu, index) => {
      doc.setFontSize(12);
      doc.text(
        `${edu.institution}, ${edu.degree}, ${edu.admissionYear} - ${edu.graduationYear}`,
        60,
        currentY
      );
      currentY += 20;
    });

    currentY += 20;
    doc.setFontSize(16);
    doc.text("Professional Experience:", 40, currentY);
    currentY += 20;
    userData.professionalExperience.forEach((exp, index) => {
      doc.setFontSize(12);
      doc.text(
        `${exp.company}, ${exp.position}, ${exp.startDate} - ${exp.endDate}`,
        60,
        currentY
      );
      currentY += 20;
    });

    currentY += 20;
    doc.setFontSize(16);
    doc.text("Languages:", 40, currentY);
    currentY += 20;
    userData.languages.forEach((language, index) => {
      doc.setFontSize(12);
      doc.text(`${language.name}`, 60, currentY);
      currentY += 20;
    });

    if (userData.imageUrl) {
      const imgElement = document.createElement("img");
      imgElement.src = userData.imageUrl;
      imgElement.onload = async () => {
        const canvas = await html2canvas(imgElement);
        const imgDataUrl = canvas.toDataURL("image/png");
        doc.addImage(imgDataUrl, "PNG", 400, 40, 100, 100);
        doc.save("portfolio.pdf");
      };
    } else {
      doc.save("portfolio.pdf");
    }

    toast.success("Portfólio baixado com sucesso");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Funções relacionadas aos eventos (para o UE)
  const isWithin24Hours = (createdAt) => {
    const eventDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now - eventDate) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const handleOptionsClick = (index) => {
    setOptionsVisibleIndex(optionsVisibleIndex === index ? null : index);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  const handleDeleteEvent = async (event) => {
    const confirmDelete = window.confirm(
      "Você realmente deseja excluir este evento?"
    );
    if (!confirmDelete) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:7003/api/eventos/${event.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData((prevUserData) => ({
        ...prevUserData,
        events: prevUserData.events.filter((e) => e.id !== event.id),
      }));
      toast.success("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir o evento:", error);
      toast.error("Falha ao excluir o evento.");
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      events: prevUserData.events.map((event) =>
        event.id === updatedPost.id ? updatedPost : event
      ),
    }));
    setEditingEvent(null);
  };

  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageDropdownRef]);

const toggleLanguageDropdown = () => {
  setIsLanguageDropdownOpen((prevState) => !prevState);
};

  if (loading) {
    return (
      <div className="user-spinner-container">
        <ClipLoader color="#8DFD8B" size={150} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (tipoUsuario === "UC") {
    return (
      <div className="user-profile-page">
        <ToastContainer />
        <div className="user-profile-container default-border-image">
          {/* Cabeçalho do Perfil */}
          <div className="user-profile-header">
            <div className="user-profile-photo-wrapper">
              <img
                src={imagePreview || userData.imageUrl || "/default-avatar.png"}
                alt="User Avatar"
                className="user-profile-photo"
              />
              {isEditing && (
                <div className="user-edit-photo-overlay">
                  <label htmlFor="upload-photo" className="user-edit-photo-icon">
                    <CameraFill size={20} /> {/* Usando o ícone de câmera */}
                  </label>
                  <input
                    type="file"
                    id="upload-photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>
            <div className="user-profile-info">
              {isEditing ? (
                <>
                  {/* Campos de Edição */}
                  <div className="user-profile-input-group">
                    <label htmlFor="fullName" className="user-profile-label">
                      Nome <span className="user-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={userData.fullName || ""}
                      onChange={handleInputChange}
                      className="user-profile-input"
                      placeholder="Nome Completo"
                    />
                  </div>
                  <div className="user-profile-input-group">
                    <label htmlFor="occupation" className="user-profile-label">
                      Ocupação
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={userData.occupation || ""}
                      onChange={handleInputChange}
                      className="user-profile-input"
                      placeholder="Ocupação"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Exibição dos Dados */}
                  <h2 className="user-profile-name">{userData.fullName}</h2>
                  <p className="user-profile-title">
                    {userData.occupation || "Ocupação não informada"}
                  </p>
                </>
              )}
              <div className="user-profile-actions">
                <button onClick={handleEditToggle} className="user-edit-button">
                  <PencilSquare /> {isEditing ? "Cancelar" : "Editar"}
                </button>
                <button onClick={handleShareProfile} className="user-share-button">
                  <ShareFill /> Compartilhar
                </button>
                {/* <button                                                    Adicionar quando a funcionalidade estiver pronta
                  onClick={handleDownloadPortfolio}
                  className="download-button"
                >
                  <FileEarmarkArrowDownFill /> Baixar Portfólio
                </button> */}
              </div>
            </div>
          </div>

          {/* Guias de Perfil e Badges */}
          <div className="user-tabs">
            <button
              onClick={() => handleTabChange("perfil")}
              className={activeTab === "perfil" ? "active" : ""}
            >
              Perfil
            </button>
            <button
              onClick={() => handleTabChange("badges")}
              className={activeTab === "badges" ? "active" : ""}
            >
              Badges
            </button>
          </div>

          {/* Conteúdo das Guias */}
          <div className="user-tab-content">
            {/* Guia Perfil */}
            {activeTab === "perfil" &&
              (isEditing ? (
                <div className="user-profile-sections">
                  {/* Seção Sobre */}
                  <div className="user-profile-section">
                    <p>
                      <PersonFill className="user-icon" /> Sobre
                    </p>
                    <textarea
                      name="about"
                      value={userData.about || ""}
                      onChange={handleInputChange}
                      className="user-profile-about-input"
                    />
                  </div>

                  {/* Seção Idiomas */}
                  <div className="user-profile-section">
                    <h3>
                      <Globe className="user-icon" /> Idiomas
                    </h3>
                    {isEditing ? (
                      // Renderiza o dropdown de idiomas apenas no modo de edição
                      <div
                        className="user-language-dropdown"
                        ref={languageDropdownRef}
                      >
                        <button
                          type="button"
                          className="user-language-dropdown-button"
                          onClick={toggleLanguageDropdown}
                        >
                          {userData.languages.length > 0
                            ? userData.languages
                                .map((lang) => lang.name)
                                .join(", ")
                            : "Selecione os idiomas"}
                          <span className="user-dropdown-icon">
                            {isLanguageDropdownOpen ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </span>
                        </button>
                        {isLanguageDropdownOpen && (
                          <div className="user-language-dropdown-content">
                            {availableLanguages.length > 0 ? (
                              availableLanguages.map((language) => (
                                <div
                                  key={language.id}
                                  className="user-language-checkbox"
                                >
                                  <label>
                                    <input
                                      type="checkbox"
                                      value={language.id}
                                      checked={userData.languages.some(
                                        (lang) => lang.id === language.id
                                      )}
                                      onChange={handleLanguageCheckboxChange}
                                    />
                                    {language.language}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <p>Carregando idiomas...</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Renderiza apenas os idiomas selecionados quando não está no modo de edição
                      <p>
                        {userData.languages.length > 0
                          ? userData.languages
                              .map((lang) => lang.name)
                              .join(", ")
                          : "Nenhum idioma selecionado."}
                      </p>
                    )}
                  </div>

                  {/* Seção Educação */}
                  <div className="user-profile-section">
                    <h3>
                      <MortarboardFill className="user-icon" /> Educação
                    </h3>
                    {userData.education.map((edu, index) => (
                      <div key={index} className="user-profile-array-item">
                        <Building className="user-icon" />
                        <input
                          type="text"
                          value={edu.institution || ""}
                          placeholder="Instituição"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "institution",
                              "education"
                            )
                          }
                          className="user-profile-input"
                        />
                        <AwardFill className="user-icon" />
                        <input
                          type="text"
                          value={edu.degree || ""}
                          placeholder="Grau"
                          onChange={(e) =>
                            handleArrayChange(e, index, "degree", "education")
                          }
                          className="user-profile-input"
                        />
                        <CalendarFill className="user-icon" />
                        <input
                          type="text"
                          value={edu.admissionYear || ""}
                          placeholder="Ano de Ingresso"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "admissionYear",
                              "education"
                            )
                          }
                          className="user-profile-input"
                        />
                        <CalendarFill className="user-icon" />
                        <input
                          type="text"
                          value={edu.graduationYear || ""}
                          placeholder="Ano de Conclusão"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "graduationYear",
                              "education"
                            )
                          }
                          className="user-profile-input"
                        />
                        <button
                          onClick={() => handleRemoveItem(index, "education")}
                          className="user-delete-button"
                        >
                          <Trash />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        handleAddItem("education", {
                          degree: "",
                          institution: "",
                          admissionYear: "",
                          graduationYear: "",
                        })
                      }
                      className="user-add-button"
                    >
                      <PlusSquare /> Adicionar
                    </button>
                  </div>

                  {/* Seção Experiência Profissional */}
                  <div className="user-profile-section">
                    <h3>
                      <Briefcase className="user-icon" /> Experiência Profissional
                    </h3>
                    {userData.professionalExperience.map((exp, index) => (
                      <div key={index} className="user-profile-array-item">
                        <Building className="user-icon" />
                        <input
                          type="text"
                          value={exp.company || ""}
                          placeholder="Empresa"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "company",
                              "professionalExperience"
                            )
                          }
                          className="user-profile-input"
                        />
                        <Briefcase className="user-icon" />
                        <input
                          type="text"
                          value={exp.position || ""}
                          placeholder="Cargo"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "position",
                              "professionalExperience"
                            )
                          }
                          className="user-profile-input"
                        />
                        <CalendarFill className="user-icon" />
                        <input
                          type="text"
                          value={exp.startDate || ""}
                          placeholder="Ano de Início"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "startDate",
                              "professionalExperience"
                            )
                          }
                          className="user-profile-input"
                        />
                        <CalendarFill className="user-icon" />
                        <input
                          type="text"
                          value={exp.endDate || ""}
                          placeholder="Ano de Término"
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "endDate",
                              "professionalExperience"
                            )
                          }
                          className="user-profile-input"
                        />
                        <button
                          onClick={() =>
                            handleRemoveItem(index, "professionalExperience")
                          }
                          className="user-delete-button"
                        >
                          <Trash />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        handleAddItem("professionalExperience", {
                          company: "",
                          position: "",
                          startDate: "",
                          endDate: "",
                        })
                      }
                      className="user-add-button"
                    >
                      <PlusSquare /> Adicionar
                    </button>
                  </div>

                  {/* Botão Salvar Alterações */}
                  <button
                    onClick={handleSaveChanges}
                    className="user-save-button"
                    disabled={isEditing && !userData.fullName.trim()}
                  >
                    Salvar Alterações
                  </button>
                </div>
              ) : (
                <div className="user-profile-sections">
                  {/* Seção Sobre */}
                  <div className="user-profile-section">
                    <h3>
                      <PersonFill className="user-icon" /> Sobre
                    </h3>
                    <p>{userData.about || "Nenhuma descrição fornecida."}</p>
                  </div>

                  {/* Seção Educação */}
                  <div className="user-profile-section">
                    <h3>
                      <MortarboardFill className="user-icon" /> Educação
                    </h3>
                    {Array.isArray(userData.education) &&
                    userData.education.length > 0 ? (
                      userData.education.map((edu, index) => (
                        <div key={index} className="user-education-item">
                          <div className="user-profile-info-row">
                            <Building className="user-icon" />
                            <span className="user-institution-name">
                              {edu.institution}
                            </span>
                          </div>
                          <div className="user-profile-info-row">
                            <AwardFill className="user-icon" />
                            <span className="user-education-degree">
                              {edu.degree}
                            </span>
                          </div>
                          <div className="user-profile-info-row">
                            <CalendarFill className="user-icon" />
                            <span className="user-education-dates">
                              {edu.admissionYear} - {edu.graduationYear}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Nenhuma informação educacional fornecida.</p>
                    )}
                  </div>

                  {/* Seção Experiência Profissional */}
                  <div className="user-profile-section">
                    <h3>
                      <Briefcase className="user-icon" /> Experiência Profissional
                    </h3>
                    {Array.isArray(userData.professionalExperience) &&
                    userData.professionalExperience.length > 0 ? (
                      userData.professionalExperience.map((exp, index) => (
                        <div key={index} className="user-experience-item">
                          <div className="user-profile-info-row">
                            <Building className="user-icon" />
                            <span className="user-profile-info-text">
                              {exp.company}
                            </span>
                          </div>
                          <div className="user-profile-info-row">
                            <Briefcase className="user-icon" />
                            <span className="user-profile-info-text">
                              {exp.position}
                            </span>
                          </div>
                          <div className="user-profile-info-row">
                            <CalendarFill className="user-icon" />
                            <span className="user-education-dates">
                              {exp.startDate} - {exp.endDate}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Nenhuma experiência profissional fornecida.</p>
                    )}
                  </div>

                  {/* Seção Idiomas */}
                  <div className="user-profile-section">
                    <h3>
                      <Globe className="user-icon" /> Idiomas
                    </h3>
                    <p>
                      {userData.languages.length > 0
                        ? userData.languages.map((lang) => lang.name).join(", ")
                        : "Nenhum idioma selecionado."}
                    </p>
                  </div>
                </div>
              ))}

            {/* Guia Badges */}
            {activeTab === "badges" && (
              <div className="user-badges-section">
                <h3>Badges</h3>
                {userData.badges && userData.badges.length > 0 ? (
                  <div className="user-badge-slide">
                    {userData.badges.map((badge, index) => (
                      <div key={badge.id} className="user-badge-card default-border-image">
                        <img
                          src={badge.image_url}
                          alt="Badge"
                          className="user-badge-preview"
                        />
                        <h3>{badge.name_badge}</h3>
                        <div className="user-badge-visibility">
                          <label className="user-custom-checkbox">
                            <input
                              type="checkbox"
                              checked={badge.is_public}
                              onChange={(e) =>
                                handleBadgeVisibilityChange(e, badge.id, index)
                              }
                            />
                            <span className="user-checkmark"></span>
                            {badge.is_public ? "Pública" : "Privada"}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhuma badge disponível.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else if (tipoUsuario === "UE") {
    return (
      <div className="user-profile-page">
        <ToastContainer />
        <div className="user-profile-container default-border-image">
          <div className="user-profile-header">
            <div className="user-profile-photo-wrapper">
              <img
                src={imagePreview || userData.imageUrl || "/default-avatar.png"}
                alt="User Avatar"
                className="user-profile-photo"
              />
              {isEditing && (
                <div className="user-edit-photo-overlay">
                  <label htmlFor="upload-photo" className="user-edit-photo-icon">
                    <CameraFill size={20} /> {/* Usando o ícone de câmera */}
                  </label>
                  <input
                    type="file"
                    id="upload-photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>

            <div className="user-profile-info">
              {console.log("usename= ", userData.username)}
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={userData.username || ""}
                  onChange={handleInputChange}
                  className="user-profile-name-input"
                />
              ) : (
                <h2 className="user-profile-name">{userData.username}</h2>
              )}
              <p className="user-profile-title">
                {userData.cnpj || "CNPJ não fornecido"}
              </p>
              <div className="user-company-badges">
                {userData.municipio && (
                  <span className="user-company-badge">
                    <GeoAlt /> {userData.municipio}
                  </span>
                )}
                {userData.segmento && (
                  <span className="user-company-badge">
                    <Briefcase /> {userData.segmento}
                  </span>
                )}
                {userData.tamanho && (
                  <span className="user-company-badge">
                    <PeopleFill /> {userData.tamanho}
                  </span>
                )}
              </div>
              <div className="user-profile-actions">
                <button onClick={handleEditToggle} className="user-edit-button">
                  <PencilSquare /> {isEditing ? "Cancelar" : "Editar"}
                </button>
                <button onClick={handleShareProfile} className="user-share-button">
                  <ShareFill /> Compartilhar
                </button>
              </div>
            </div>
          </div>

          <div className="user-tabs">
            <button
              onClick={() => handleTabChange("sobre")}
              className={activeTab === "sobre" ? "active" : ""}
            >
              Sobre
            </button>
            <button
              onClick={() => handleTabChange("eventos")}
              className={activeTab === "eventos" ? "active" : ""}
            >
              Eventos
            </button>
            <button
              onClick={() => handleTabChange("badges")}
              className={activeTab === "badges" ? "active" : ""}
            >
              Badges
            </button>
          </div>

          <div className="user-tab-content">
            {activeTab === "sobre" && (
              <div className="user-sobre-section">
                {isEditing ? (
                  <>
                    <div className="user-profile-section">
                      <label>
                        <PersonFill className="user-icon" /> Sobre
                      </label>
                      <textarea
                        name="sobre"
                        value={userData.sobre || ""}
                        onChange={handleInputChange}
                        className="user-profile-about-input"
                      />
                    </div>
                    <div className="user-profile-section">
                      <label>
                        <Globe className="user-icon" /> Website
                      </label>
                      <input
                        type="text"
                        name="website"
                        value={userData.website || ""}
                        onChange={handleInputChange}
                        className="user-profile-input"
                      />
                    </div>
                    <div className="user-profile-section">
                      <label>
                        <Phone className="user-icon" /> Telefone
                      </label>
                      <input
                        type="text"
                        name="numero_contato"
                        value={userData.numero_contato || ""}
                        onChange={handleInputChange}
                        className="user-profile-input"
                      />
                    </div>
                    <button
                      onClick={handleSaveChanges}
                      className="user-save-button"
                      disabled={isEditing && !userData.username.trim()}
                    >
                      Salvar Alterações
                    </button>
                  </>
                ) : (
                  <>
                    <div className="user-profile-section">
                      <h3>
                        <PersonFill className="user-icon" /> Sobre
                      </h3>
                      <p>{userData.sobre || "Nenhuma descrição fornecida."}</p>
                    </div>
                    <div className="user-profile-section">
                      <h3>
                        <Globe className="user-icon" /> Website
                      </h3>
                      <p>{userData.website || "Não fornecido"}</p>
                    </div>
                    <div className="user-profile-section">
                      <h3>
                        <Phone className="user-icon" /> Telefone
                      </h3>
                      <p>{userData.numero_contato || "Não fornecido"}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "eventos" && (
              <div className="user-eventos-section">
                <h3>Eventos Promovidos</h3>

                {/* Componente para criar novos posts */}
                <PostForm onPostCreated={handleNewPost} />

                {/* Renderizar o PostForm para edição */}
                {editingEvent && (
                  <PostForm
                    existingEvent={editingEvent}
                    onPostUpdated={handlePostUpdated}
                    onClose={() => setEditingEvent(null)}
                    isEditAllowed={isWithin24Hours(editingEvent.createdAt)}
                  />
                )}

                {/* Renderização dos eventos */}
                {userData.events && userData.events.length > 0 ? (
                  userData.events.map((event, index) => (
                    <div key={index} className="user-event-item">
                      <div className="user-event-header">
                        <img
                          src={
                            imagePreview ||
                            userData.imageUrl ||
                            "/default-avatar.png"
                          } // Usa a pré-visualização se disponível
                          alt="User Avatar"
                          className="user-event-user-avatar"
                        />
                        <span className="user-event-user-name">
                          {userData.username}
                        </span>

                        {/* Exibição da Data e Hora de Publicação */}
                        {event.createdAt && (
                          <span className="user-event-publication-time">
                            {formatDateTime(event.createdAt)}
                          </span>
                        )}

                        {/* Ícone de três pontinhos sempre visível */}
                        <div className="user-event-options">
                          <ThreeDotsVertical
                            className="user-options-icon"
                            onClick={() => handleOptionsClick(index)}
                          />
                          {optionsVisibleIndex === index && (
                            <div className="user-options-menu">
                              {/* Botão "Editar" habilitado apenas se dentro de 24h */}
                              <button
                                onClick={() => handleEditEvent(event)}
                                disabled={!isWithin24Hours(event.createdAt)}
                                style={{
                                  cursor: isWithin24Hours(event.createdAt)
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isWithin24Hours(event.createdAt)
                                    ? 1
                                    : 0.5,
                                }}
                                title={
                                  !isWithin24Hours(event.createdAt)
                                    ? "Edição disponível apenas nas primeiras 24 horas"
                                    : "Editar Evento"
                                }
                              >
                                Editar
                              </button>
                              {/* Botão "Excluir" sempre habilitado */}
                              <button onClick={() => handleDeleteEvent(event)}>
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="user-event-details">
                        <p>{event.descricao || "Nenhuma descrição"}</p>
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt="Event Image"
                            className="user-event-image"
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum evento disponível.</p>
                )}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="user-badges-section">
                <h3>Badges</h3>
                {userData.badges && userData.badges.length > 0 ? (
                  <div className="user-badge-slide">
                    {userData.badges.map((badge) => (
                      <div key={badge.id_badge} className="user-badge-card default-border-image">
                        <img
                          src={badge.image_url}
                          alt="Badge"
                          className="user-badge-preview"
                        />
                        <h3>{badge.name_badge}</h3>
                        <Link to={`/badges/details/${badge.id_badge}`}>
                          <button>Detalhes</button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhuma badge disponível.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return null; // Ou redirecione para o login
  }
};

export default UserProfile;
