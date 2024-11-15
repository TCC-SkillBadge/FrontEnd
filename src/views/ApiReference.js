// src/views/ApiReference.js
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ApiReference.css"; // Specific stylesheet
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // react-toastify imports
import "react-toastify/dist/ReactToastify.css"; // react-toastify styles
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons import

const ApiReference = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState(null); // Initially null
  const [loadingApiKey, setLoadingApiKey] = useState(true); // State to control loading
  const [generatingApiKey, setGeneratingApiKey] = useState(false); // State to control API Key generation
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [showApiKey, setShowApiKey] = useState(false); // State to control API Key visibility

  // Function to verify login and set states
  const verifyLogin = () => {
    const userTypeStored = sessionStorage.getItem("tipoUsuario");
    const userInfoStored = sessionStorage.getItem("userInfo");
    const token = sessionStorage.getItem("token"); // Get token

    if (userTypeStored) {
      setUserType(userTypeStored);
    }

    if (userInfoStored) {
      setUser(JSON.parse(userInfoStored));
    }

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set authorization header globally
    }
  };

  // useEffect to verify login on component mount
  useEffect(() => {
    verifyLogin();
    window.addEventListener("storage", verifyLogin);
    return () => {
      window.removeEventListener("storage", verifyLogin);
    };
  }, []);

  // Define fetchApiKey outside useEffect for reuse
  const fetchApiKey = async () => {
    if (userType === "UE" && user) {
      setLoadingApiKey(true);
      try {
        // Define the correct URL based on user type
        const backendUrl = "http://localhost:7003/api/acessar-info-usuario-jwt"; // Complete backend URL for UE

        const response = await axios.get(backendUrl, {
          params: { email_comercial: user.email_comercial },
        });

        // Adjust based on the actual API response structure
        const receivedApiKey = response.data.api_key || response.data.apiKey;

        console.log("Fetch API Key Response Status:", response.status);
        console.log("Fetch API Key Response Data:", response.data);

        if (response.status === 200 && receivedApiKey) {
          setApiKey(receivedApiKey); // Adjust based on response structure
        } else {
          setApiKey(null);
          toast.error("Failed to obtain API Key.");
        }
      } catch (error) {
        console.error("Error obtaining API Key:", error);
        setApiKey(null);
        toast.error("Error obtaining API Key.");
      } finally {
        setLoadingApiKey(false);
      }
    }
  };

  // useEffect to fetch API Key when userType or user changes
  useEffect(() => {
    fetchApiKey();
  }, [userType, user]);

  // Function to generate a new API Key
  const handleGenerateApiKey = async () => {
    if (!user || !user.email_comercial) {
      toast.error("User information not available.");
      return;
    }

    setGeneratingApiKey(true);
    try {
      const backendUrl = "http://localhost:7003/api/generate-api-key"; // Adjust to the correct backend URL
      const response = await axios.post(backendUrl, {
        email_comercial: user.email_comercial,
      });

      console.log("Generate API Key Response Status:", response.status);
      console.log("Generate API Key Response Data:", response.data);

      // Adjust based on the actual API response structure
      const newApiKey = response.data.api_key || response.data.apiKey;

      if (response.status === 200 && newApiKey) {
        setApiKey(newApiKey);
        toast.success("API Key successfully generated and sent via email!");
      } else {
        // If the API does not return the key directly, fetch it again
        await fetchApiKey();
        toast.success("API Key successfully generated and sent via email!");
      }
    } catch (error) {
      console.error("Error generating API Key:", error);
      toast.error("Error generating API Key.");
    } finally {
      setGeneratingApiKey(false);
    }
  };

  // Code examples for different languages
  const codeExamples = {
    Java: `// Example in Java using HttpClient
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class AssignBadge {
    public static void main(String[] args) throws Exception {
        String apiKey = "YOUR_API_KEY_HERE";
        String json = "{\\"email_com\\": \\"user@example.com\\", \\"id_badge\\": \\"badge1234\\"}";

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
// Example in PHP using cURL
$apiKey = "YOUR_API_KEY_HERE";
$data = array(
    "email_com" => "user@example.com",
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
    "Node.js": `// Example in Node.js using axios
const axios = require('axios');

const apiKey = 'YOUR_API_KEY_HERE';
const data = {
  email_com: 'user@example.com',
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
    Python: `# Example in Python using requests
import requests

api_key = 'YOUR_API_KEY_HERE'
data = {
    'email_com': 'user@example.com',
    'id_badge': 'badge1234'
}
headers = {
    'Content-Type': 'application/json',
    'x-api-key': api_key
}

response = requests.post('http://localhost:7001/api/badges/assign', json=data, headers=headers)
print(response.text)`,
    C: `/* Example in C using libcurl */
#include <curl/curl.h>

int main(void) {
    CURL *curl = curl_easy_init();
    if(curl) {
        CURLcode res;
        const char *apiKey = "YOUR_API_KEY_HERE";
        const char *data = "{\\"email_com\\": \\"user@example.com\\", \\"id_badge\\": \\"badge1234\\"}";

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
    "C++": `// Example in C++ using libcurl
#include <curl/curl.h>
#include <string>

int main() {
    CURL *curl = curl_easy_init();
    if(curl) {
        CURLcode res;
        std::string apiKey = "YOUR_API_KEY_HERE";
        std::string data = "{\\"email_com\\": \\"user@example.com\\", \\"id_badge\\": \\"badge1234\\"}";

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
    "C#": `// Example in C# using HttpClient
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
            string apiKey = "YOUR_API_KEY_HERE";
            var data = new
            {
                email_com = "user@example.com",
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

  // Function to change the selected language
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // List of available languages
  const languages = Object.keys(codeExamples);

  // Function to toggle API Key visibility
  const toggleApiKeyVisibility = () => {
    setShowApiKey((prevState) => !prevState);
  };

  return (
    <div>
      <Navbar userType={userType} user={user} />
      <div className="api-reference-container">
        <h1 className="api-title">API Reference</h1>
        <p className="api-description">
          Use this API to integrate badge assignment directly into your system.
          Follow the instructions below to configure and use the endpoints.
        </p>

        {/* If the user is Business (UE), display the API Key section */}
        {userType === "UE" && (
          <div className="api-section">
            <h2>Your API Key</h2>
            {loadingApiKey ? (
              <p>Loading your API Key...</p>
            ) : apiKey ? (
              <>
                <div className="api-key-container">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="api-key-input"
                    aria-label="API Key"
                  />
                  <button
                    className="toggle-api-key-button"
                    onClick={toggleApiKeyVisibility}
                    aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                  >
                    {showApiKey ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  className="generate-api-key-button"
                  onClick={handleGenerateApiKey}
                  disabled={generatingApiKey}
                >
                  {generatingApiKey ? "Generating..." : "Generate New API Key"}
                </button>
              </>
            ) : (
              <button
                className="generate-api-key-button"
                onClick={handleGenerateApiKey}
                disabled={generatingApiKey}
              >
                {generatingApiKey ? "Generating..." : "Generate API Key"}
              </button>
            )}
          </div>
        )}

        {/* Authentication Section */}
        <div className="api-section">
          <h2>Authentication</h2>
          <p>
            Each API request requires an <strong>API Key</strong> in the{" "}
            <code>x-api-key</code> header. You can generate or retrieve your API
            Key in the business account dashboard.
          </p>
          <p className="code-snippet">
            <code>{`x-api-key: YOUR_API_KEY_HERE`}</code>
          </p>
        </div>

        {/* Endpoints Section */}
        <div className="api-section">
          <h2>Endpoints</h2>

          <div className="endpoint">
            <h3>POST /api/badges/assign</h3>
            <p>This endpoint allows assigning a badge to an end user.</p>
            <h4>Parameters:</h4>
            <ul>
              <li>
                <strong>email_com</strong> (string): Email of the badge
                recipient.
              </li>
              <li>
                <strong>id_badge</strong> (string): ID of the badge to be
                assigned.
              </li>
            </ul>
            <h4>Request Example:</h4>
            <p className="code-snippet">
              <code>
                {`curl -X POST "http://localhost:7001/api/badges/assign" \\
-H "x-api-key: YOUR_API_KEY_HERE" \\
-H "Content-Type: application/json" \\
-d '{ "email_com": "user@example.com", "id_badge": "badge1234" }'`}
              </code>
            </p>
            <h4>Success Response:</h4>
            <p className="code-snippet">
              <code>{`{ "message": "Badge assignment email sent successfully" }`}</code>
            </p>
          </div>
        </div>

        {/* Possible Errors Section */}
        <div className="api-section">
          <h2>Possible Errors</h2>
          <ul>
            <li>
              <strong>400 Bad Request:</strong> Invalid or missing parameters.
            </li>
            <li>
              <strong>401 Unauthorized:</strong> API Key not provided or
              invalid.
            </li>
            <li>
              <strong>403 Forbidden:</strong> No permission to access the
              resource.
            </li>
            <li>
              <strong>404 Not Found:</strong> Endpoint or resource not found.
            </li>
            <li>
              <strong>500 Internal Server Error:</strong> Server encountered an
              internal error.
            </li>
          </ul>
        </div>

        {/* Request Examples in Insomnia/Postman Section */}
        <div className="api-section">
          <h2>Request Example in Insomnia/Postman</h2>
          <p>
            You can use Insomnia or Postman to test this endpoint. See below how
            to configure the request:
          </p>
          <h4>Request Configuration:</h4>
          <ul>
            <li>
              <strong>Method:</strong> POST
            </li>
            <li>
              <strong>URL:</strong> http://localhost:7001/api/badges/assign
            </li>
            <li>
              <strong>Headers:</strong>
              <ul>
                <li>
                  <code>Content-Type: application/json</code>
                </li>
                <li>
                  <code>x-api-key: YOUR_API_KEY_HERE</code>
                </li>
              </ul>
            </li>
            <li>
              <strong>Body:</strong> (JSON)
            </li>
            <pre className="code-snippet">
              <code>
                {`{
  "email_com": "user@example.com",
  "id_badge": "badge1234"
}`}
              </code>
            </pre>
          </ul>
          <p>
            Make sure to replace <code>YOUR_API_KEY_HERE</code> with your API
            Key and adjust the parameter values as needed.
          </p>
        </div>

        {/* Implementation Examples Section */}
        <div className="api-section">
          <h2>Implementation Examples</h2>
          <p>
            Below are examples of how to integrate this endpoint in different
            programming languages.
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
            <pre>
              <code>{codeExamples[selectedLanguage]}</code>
            </pre>
          </div>
        </div>
      </div>
      <Footer />
      {/* Only one ToastContainer to avoid duplication */}
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
