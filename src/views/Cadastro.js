// views/Cadastro.js
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import {
  PersonFill,
  LockFill,
  EnvelopeFill,
  FileText,
} from "react-bootstrap-icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../styles/Cadastro.css";

const Cadastro = () => {
  const [userType, setUserType] = useState("comum");

  const renderFields = () => {
    switch (userType) {
      case "comum":
        return (
          <>
            <Form.Group controlId="nomeCompleto">
              <Form.Label>
                <PersonFill color="#8DFD8B" /> Nome Completo
              </Form.Label>
              <Form.Control type="text" placeholder="Nome Completo" />
            </Form.Group>
            <Form.Group controlId="ocupacao">
              <Form.Label>
                <FileText color="#8DFD8B" /> Ocupação
              </Form.Label>
              <Form.Control type="text" placeholder="Ocupação" />
            </Form.Group>
            <Form.Group controlId="telefone">
              <Form.Label>
                <PhoneInput />
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>
                <EnvelopeFill color="#8DFD8B" /> Email
              </Form.Label>
              <Form.Control type="email" placeholder="Email" />
            </Form.Group>
            <Form.Group controlId="senha">
              <Form.Label>
                <LockFill color="#8DFD8B" /> Senha
              </Form.Label>
              <Form.Control type="password" placeholder="Senha" />
            </Form.Group>
            <Form.Group controlId="confirmarSenha">
              <Form.Label>
                <LockFill color="#8DFD8B" /> Confirmar Senha
              </Form.Label>
              <Form.Control type="password" placeholder="Confirmar Senha" />
            </Form.Group>
          </>
        );
      case "empresarial":
        return (
          <>
            <Form.Group controlId="emailEmpresarial">
              <Form.Label>
                <EnvelopeFill color="#8DFD8B" /> Email Empresarial
              </Form.Label>
              <Form.Control type="email" placeholder="Email Empresarial" />
            </Form.Group>
            <Form.Group controlId="senhaEmpresarial">
              <Form.Label>
                <LockFill color="#8DFD8B" /> Senha
              </Form.Label>
              <Form.Control type="password" placeholder="Senha" />
            </Form.Group>
            <Form.Group controlId="confirmarSenhaEmpresarial">
              <Form.Label>
                <LockFill color="#8DFD8B" /> Confirmar Senha
              </Form.Label>
              <Form.Control type="password" placeholder="Confirmar Senha" />
            </Form.Group>
            <Form.Group controlId="nomeEmpresa">
              <Form.Label>
                <FileText color="#8DFD8B" /> Nome da Empresa
              </Form.Label>
              <Form.Control type="text" placeholder="Nome da Empresa" />
            </Form.Group>
            <Form.Group controlId="cnpj">
              <Form.Label>
                <FileText color="#8DFD8B" /> CNPJ
              </Form.Label>
              <Form.Control type="text" placeholder="CNPJ" />
            </Form.Group>
            <Form.Group controlId="cep">
              <Form.Label>
                <FileText color="#8DFD8B" /> CEP
              </Form.Label>
              <Form.Control type="text" placeholder="CEP" />
            </Form.Group>
            <Form.Group controlId="endereco">
              <Form.Label>
                <FileText color="#8DFD8B" /> Endereço
              </Form.Label>
              <Form.Control type="text" placeholder="Endereço" />
            </Form.Group>
            <Form.Group controlId="bairro">
              <Form.Label>
                <FileText color="#8DFD8B" /> Bairro
              </Form.Label>
              <Form.Control type="text" placeholder="Bairro" />
            </Form.Group>
            <Form.Group controlId="cidade">
              <Form.Label>
                <FileText color="#8DFD8B" /> Cidade
              </Form.Label>
              <Form.Control type="text" placeholder="Cidade" />
            </Form.Group>
            <Form.Group controlId="complemento">
              <Form.Label>
                <FileText color="#8DFD8B" /> Complemento
              </Form.Label>
              <Form.Control type="text" placeholder="Complemento" />
            </Form.Group>
            <Form.Group controlId="numeroContato">
              <Form.Label>
                <PhoneInput />
              </Form.Label>
            </Form.Group>
          </>
        );
      case "admin":
        return (
          <>
            <Form.Group controlId="emailAdmin">
              <Form.Label>
                <EnvelopeFill color="#8DFD8B" /> Email Administrativo
              </Form.Label>
              <Form.Control type="email" placeholder="Email Administrativo" />
            </Form.Group>
            <Form.Group controlId="senhaAdmin">
              <Form.Label>
                <LockFill color="#8DFD8B" /> Senha
              </Form.Label>
              <Form.Control type="password" placeholder="Senha" />
            </Form.Group>
            <Form.Group controlId="confirmarSenhaAdmin">
              <Form.Label>
                <LockFill color="#8DFD8B" /> Confirmar Senha
              </Form.Label>
              <Form.Control type="password" placeholder="Confirmar Senha" />
            </Form.Group>
            <Form.Group controlId="nomeAdmin">
              <Form.Label>
                <PersonFill color="#8DFD8B" /> Nome
              </Form.Label>
              <Form.Control type="text" placeholder="Nome" />
            </Form.Group>
            <Form.Group controlId="cargoAdmin">
              <Form.Label>
                <FileText color="#8DFD8B" /> Cargo
              </Form.Label>
              <Form.Control type="text" placeholder="Cargo" />
            </Form.Group>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-inner">
        <h2 className="cadastro-title">Criar conta</h2>
        <Form>
          <Form.Group controlId="tipoUsuario">
            <Form.Label className="cadastro-label">Tipo de Usuário</Form.Label>
            <Form.Control
              as="select"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="comum">Comum</option>
              <option value="empresarial">Empresarial</option>
              <option value="admin">Admin</option>
            </Form.Control>
          </Form.Group>
          {renderFields()}
          <Button variant="success" type="submit" className="cadastro-button">
            Registrar
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Cadastro;
