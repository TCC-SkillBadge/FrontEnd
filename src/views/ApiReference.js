// src/views/ApiReference.js
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ApiReference.css"; // Arquivo de estilos específico
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Importações do react-toastify
import "react-toastify/dist/ReactToastify.css"; // Importação dos estilos do react-toastify

const ApiReference = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState(null); // Inicialmente null
  const [loadingApiKey, setLoadingApiKey] = useState(true); // Estado para controlar o carregamento
  const [selectedLanguage, setSelectedLanguage] = useState("Java");

  const verificaLogin = () => {
    const tipoUsuario = sessionStorage.getItem("tipoUsuario");
    const userInfo = sessionStorage.getItem("userInfo");
    const token = sessionStorage.getItem("token"); // Obter o token

    if (tipoUsuario) {
      setUserType(tipoUsuario);
    }

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Definir o cabeçalho de autorização globalmente
    }
  };

  useEffect(() => {
    verificaLogin();
    window.addEventListener("storage", verificaLogin);
    return () => {
      window.removeEventListener("storage", verificaLogin);
    };
  }, []);

  useEffect(() => {
    const fetchApiKey = async () => {
      if (userType === "UE" && user) {
        setLoadingApiKey(true);
        try {
          // Definir a URL correta com base no tipo de usuário
          const backendUrl =
            "http://localhost:7003/api/acessar-info-usuario-jwt"; // URL completa do backend para UE

          const response = await axios.get(backendUrl, {
            params: { email_comercial: user.email_comercial },
          });

          if (response.status === 200) {
            setApiKey(response.data.api_key); // Ajuste conforme a estrutura da resposta
          } else {
            setApiKey(null);
          }
        } catch (error) {
          console.error("Erro ao obter API Key:", error);
          setApiKey(null);
        } finally {
          setLoadingApiKey(false);
        }
      }
    };

    fetchApiKey();
  }, [userType, user]);

  const handleGenerateApiKey = async () => {
    try {
      const backendUrl = "http://localhost:7003/api/generate-api-key"; // Ajuste para a URL correta do backend
      const response = await axios.post(backendUrl, {
        email_comercial: user.email_comercial,
      });

      if (response.status === 200) {
        setApiKey(response.data.api_key);
        toast.success("API Key gerada com sucesso e enviada por email!");
      } else {
        toast.error("Falha ao gerar API Key.");
      }
    } catch (error) {
      console.error("Erro ao gerar API Key:", error);
      toast.error("Erro ao gerar API Key.");
    }
  };

  const codeExamples = {
    Java: `// Exemplo em Java usando HttpClient
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class AssignBadge {
    public static void main(String[] args) throws Exception {
        String apiKey = "SUA_API_KEY_AQUI";
        String json = "{\\"email_com\\": \\"usuario@exemplo.com\\", \\"id_badge\\": \\"badge1234\\"}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:7001/api/badges/assign"))
            .header("Content-Type", "application/json")
            .header("x-api-key", apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}`,
    PHP: `<?php
// Exemplo em PHP usando cURL
$apiKey = "SUA_API_KEY_AQUI";
$data = array(
    "email_com" => "usuario@exemplo.com",
    "id_badge" => "badge1234"
);
$payload = json_encode($data);

$ch = curl_init("http://localhost:7001/api/badges/assign");
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Content-Type: application/json",
    "x-api-key: $apiKey"
));
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
    "Node.js": `// Exemplo em Node.js usando axios
const axios = require('axios');

const apiKey = 'SUA_API_KEY_AQUI';
const data = {
  email_com: 'usuario@exemplo.com',
  id_badge: 'badge1234'
};

axios.post('http://localhost:7001/api/badges/assign', data, {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error(error);
});`,
    Python: `# Exemplo em Python usando requests
import requests

api_key = 'SUA_API_KEY_AQUI'
data = {
    'email_com': 'usuario@exemplo.com',
    'id_badge': 'badge1234'
}
headers = {
    'Content-Type': 'application/json',
    'x-api-key': api_key
}

response = requests.post('http://localhost:7001/api/badges/assign', json=data, headers=headers)
print(response.text)`,
    C: `/* Exemplo em C usando libcurl */
#include <curl/curl.h>

int main(void) {
    CURL *curl = curl_easy_init();
    if(curl) {
        CURLcode res;
        const char *apiKey = "SUA_API_KEY_AQUI";
        const char *data = "{\\"email_com\\": \\"usuario@exemplo.com\\", \\"id_badge\\": \\"badge1234\\"}";

        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        char apiKeyHeader[256];
        snprintf(apiKeyHeader, sizeof(apiKeyHeader), "x-api-key: %s", apiKey);
        headers = curl_slist_append(headers, apiKeyHeader);

        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:7001/api/badges/assign");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }
    return 0;
}`,
    "C++": `// Exemplo em C++ usando libcurl
#include <curl/curl.h>
#include <string>

int main() {
    CURL *curl = curl_easy_init();
    if(curl) {
        CURLcode res;
        std::string apiKey = "SUA_API_KEY_AQUI";
        std::string data = "{\\"email_com\\": \\"usuario@exemplo.com\\", \\"id_badge\\": \\"badge1234\\"}";

        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        std::string apiKeyHeader = "x-api-key: " + apiKey;
        headers = curl_slist_append(headers, apiKeyHeader.c_str());

        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:7001/api/badges/assign");
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }
    return 0;
}`,
    "C#": `// Exemplo em C# usando HttpClient
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace AssignBadge
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string apiKey = "SUA_API_KEY_AQUI";
            var data = new
            {
                email_com = "usuario@exemplo.com",
                id_badge = "badge1234"
            };
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(data);

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("x-api-key", apiKey);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync("http://localhost:7001/api/badges/assign", content);
                string result = await response.Content.ReadAsStringAsync();
                Console.WriteLine(result);
            }
        }
    }
}`,
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const languages = Object.keys(codeExamples);

  return (
    <div>
      <Navbar userType={userType} user={user} />
      <div className="api-reference-container">
        <h1 className="api-title">API Reference</h1>
        <p className="api-description">
          Use esta API para integrar a atribuição de badges diretamente em seu
          sistema. Siga as instruções abaixo para configurar e utilizar os
          endpoints.
        </p>

        {userType === "UE" && (
          <div className="api-section">
            <h2>Sua API Key</h2>
            {loadingApiKey ? (
              <p>Carregando sua API Key...</p>
            ) : apiKey ? (
              <>
                <p className="api-key">{apiKey}</p>
                <button
                  className="generate-api-key-button"
                  onClick={handleGenerateApiKey}
                >
                  Gerar Nova API Key
                </button>
              </>
            ) : (
              <button
                className="generate-api-key-button"
                onClick={handleGenerateApiKey}
              >
                Gerar API Key
              </button>
            )}
          </div>
        )}

        <div className="api-section">
          <h2>Autenticação</h2>
          <p>
            Cada solicitação à API requer uma <strong>API Key</strong> no
            cabeçalho <code>x-api-key</code>. Você pode gerar ou recuperar sua
            API Key no painel da conta empresarial.
          </p>
          <p className="code-snippet">
            <code>{`x-api-key: SUA_API_KEY_AQUI`}</code>
          </p>
        </div>

        <div className="api-section">
          <h2>Endpoints</h2>

          <div className="endpoint">
            <h3>POST /api/badges/assign</h3>
            <p>Este endpoint permite atribuir uma badge a um usuário final.</p>
            <h4>Parâmetros:</h4>
            <ul>
              <li>
                <strong>email_com</strong> (string): Email do destinatário da
                badge.
              </li>
              <li>
                <strong>id_badge</strong> (string): ID da badge a ser atribuída.
              </li>
            </ul>
            <h4>Exemplo de Requisição:</h4>
            <p className="code-snippet">
              <code>
                {`curl -X POST "http://localhost:7001/api/badges/assign" \\
  -H "x-api-key: SUA_API_KEY_AQUI" \\
  -H "Content-Type: application/json" \\
  -d '{ "email_com": "usuario@exemplo.com", "id_badge": "badge1234" }'`}
              </code>
            </p>
            <h4>Resposta de Sucesso:</h4>
            <p className="code-snippet">
              <code>{`{ "message": "Email de atribuição de badge enviado com sucesso" }`}</code>
            </p>
          </div>
        </div>

        <div className="api-section">
          <h2>Erros Possíveis</h2>
          <ul>
            <li>
              <strong>400 Bad Request:</strong> Parâmetros inválidos ou
              faltando.
            </li>
            <li>
              <strong>401 Unauthorized:</strong> API Key não fornecida ou
              inválida.
            </li>
            <li>
              <strong>403 Forbidden:</strong> Sem permissão para acessar o
              recurso.
            </li>
            <li>
              <strong>404 Not Found:</strong> Endpoint ou recurso não
              encontrado.
            </li>
            <li>
              <strong>500 Internal Server Error:</strong> Erro interno no
              servidor.
            </li>
          </ul>
        </div>

        <div className="api-section">
          <h2>Exemplo de Requisição no Insomnia/Postman</h2>
          <p>
            Você pode utilizar o Insomnia ou Postman para testar este endpoint.
            Veja abaixo como configurar a requisição:
          </p>
          <h4>Configuração da Requisição:</h4>
          <ul>
            <li>
              <strong>Método:</strong> POST
            </li>
            <li>
              <strong>URL:</strong> http://localhost:7001/api/badges/assign
            </li>
            <li>
              <strong>Headers:</strong>
            </li>
            <ul>
              <li>
                <code>Content-Type: application/json</code>
              </li>
              <li>
                <code>x-api-key: SUA_API_KEY_AQUI</code>
              </li>
            </ul>
            <li>
              <strong>Body:</strong> (JSON)
            </li>
            <pre className="code-snippet">
              <code>
                {`{
  "email_com": "usuario@exemplo.com",
  "id_badge": "badge1234"
}`}
              </code>
            </pre>
          </ul>
          <p>
            Certifique-se de substituir <code>SUA_API_KEY_AQUI</code> pela sua
            API Key e os valores dos parâmetros conforme necessário.
          </p>
        </div>

        <div className="api-section">
          <h2>Exemplos de Implementação</h2>
          <p>
            Veja abaixo exemplos de como integrar este endpoint em diferentes
            linguagens de programação.
          </p>
          <div className="language-tabs">
            {languages.map((language) => (
              <button
                key={language}
                className={`language-tab ${
                  selectedLanguage === language ? "active" : ""
                }`}
                onClick={() => handleLanguageChange(language)}
              >
                {language}
              </button>
            ))}
          </div>
          <div className="code-snippet">
            <code>{codeExamples[selectedLanguage]}</code>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer
        position="top-center"
        autoClose={3000}
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

export default ApiReference;
