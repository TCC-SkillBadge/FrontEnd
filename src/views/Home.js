import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Certifique-se de que o caminho está correto
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard"; // Importe o novo componente
import "../styles/Home.css"; // Certifique-se de criar este arquivo de estilo

const Home = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const verificaLogin = () => {
    const tipoUsuario = sessionStorage.getItem("tipoUsuario");
    const userInfo = sessionStorage.getItem("userInfo");

    if (tipoUsuario) {
      setUserType(tipoUsuario);
    }

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  };

  useEffect(() => {
    verificaLogin();
    window.addEventListener("storage", verificaLogin);
    return () => {
      window.removeEventListener("storage", verificaLogin);
    };
  }, []);

  return (
    <div>
      <Navbar userType={userType} user={user} />
      <div className="container-fluid home-content">
        <div className="text-container">
          <h1 className="home-title">
            Suas medalhas com a segurança da nossa Blockchain.
          </h1>
          <p className="home-subtitle">
            Um único lugar para <span className="emitir">emitir</span>,{" "}
            <span className="conquistar">conquistar</span> e{" "}
            <span className="armazenar">armazenar</span> todas as suas medalhas
            de maneira segura.
          </p>
        </div>
      </div>
      <div className="divisoria1">
        <img
          className="iconShieldSmall"
          alt="Shield Icon 1"
          src="/icons/home/icon-shield-fill.svg"
        />
        <img
          className="iconShieldLarge"
          alt="Shield Icon 2"
          src="/icons/home/icon-shield-fill1.svg"
        />
        <img
          className="iconShieldSmall"
          alt="Shield Icon 3"
          src="/icons/home/icon-shield-fill2.svg"
        />
      </div>
      <div className="container">
        <div className="why-digital-medals">
          <h2>Por que medalhas digitais?</h2>
          <div className="reasons">
            <h3>Compartilhamento</h3>
            <p>
              Compartilhe suas conquistas com um público mais amplo. Ao exibir
              medalhas em mídias sociais, currículos ou portfólios, suas
              realizações são comunicadas de forma visual e impactante,
              inspirando e abrindo oportunidades no mundo educacional e
              profissional.
            </p>

            <h3>Currículo e portfólio modernos</h3>
            <p>
              Medalhas digitais estão se tornando uma parte moderna de
              currículos e portfólios. Elas adicionam um elemento visual
              dinâmico, tornando seu histórico mais envolvente e informativo.
              Isso chama a atenção de empregadores e instituições de ensino e
              servem de destaque em um mercado competitivo.
            </p>

            <h3>Demonstração de Habilidade e Competências</h3>
            <p>
              Medalhas digitais são uma forma sólida de demonstrar suas
              habilidades e competências. Elas não apenas contam uma história,
              mas também validam suas competências de maneira objetiva.
            </p>

            <h3>Destaque</h3>
            <p>
              Num mundo cada vez mais competitivo, medalhas digitais te ajudam a
              se destacar. Além de serem símbolos de conquista, também são
              indicativos de um profissional ou indivíduo dedicado e orientado
              para o sucesso.
            </p>
          </div>
        </div>
      </div>
      <div className="divisoria2">
        <img
          className="iconSmall"
          alt="New Icon 1"
          src="/icons/home/slhield1.svg"
        />
        <img
          className="iconLarge"
          alt="New Icon 2"
          src="/icons/home/slhield1.svg"
        />
        <img
          className="iconSmall"
          alt="New Icon 3"
          src="/icons/home/slhield1.svg"
        />
      </div>
      <div className="container">
        <div className="credibilidade-seguranca">
          <h2>Credibilidade e Segurança</h2>
          <p>
            Nossas medalhas digitais são projetadas com um conjunto de medidas
            de segurança robustas, garantindo a integridade e autenticidade de
            cada medalha. Isso significa que, quando alguém recebe uma medalha
            digital, ela é mais do que apenas um símbolo bonito de conquista - é
            um atestado sólido de suas habilidades e realizações.
          </p>
          <p>
            Além disso, para garantir que as medalhas permaneçam seguras e à
            prova de adulterações a longo prazo, armazenamos informações sobre
            elas em uma tecnologia blockchain. Isso cria um registro imutável
            que pode ser verificado a qualquer momento, proporcionando a mais
            alta garantia de autenticidade.
          </p>
        </div>
      </div>
      <div className="divisoria3">
        <img
          className="iconSmall"
          alt="New Icon 1"
          src="/icons/home/new-icon2.svg"
        />
        <img
          className="iconLarge"
          alt="New Icon 2"
          src="/icons/home/new-icon2.svg"
        />
        <img
          className="iconSmall"
          alt="New Icon 2"
          src="/icons/home/new-icon2.svg"
        />
      </div>
      <div className="container">
        <div className="features-section">
          <FeatureCard icon="/icons/home/image-card.svg" title="Imagem">
            "Uma imagem cativante, alinhada à identidade visual da marca, que
            tanto a empresa quanto o emissor se orgulhem de compartilhar."
          </FeatureCard>
          <FeatureCard icon="/icons/home/im.svg" title="Nome">
            Cada medalha tem um nome que prontamente identifica a competência
            que o ganhador conquistou.
          </FeatureCard>
          <FeatureCard icon="/icons/home/descricao.svg" title="Descrição">
            Um texto claro e conciso que estrategicamente descreve as
            habilidades e conhecimentos adquiridos pelo vencedor.
          </FeatureCard>
          <FeatureCard icon="/icons/home/criteria-icon.svg" title="Critérios">
            Explica o motivo pelo qual o vencedor foi premiado com a medalha,
            incluindo detalhes que variam desde a confirmação da presença mínima
            até a avaliação da nota na prova final.
          </FeatureCard>
          <FeatureCard icon="/icons/home/calendario.svg" title="Validade">
            Indica se a medalha é de prazo indeterminado ou se tem uma data de
            expiração estabelecida pela instituição emissora.
          </FeatureCard>
          <FeatureCard icon="/icons/home/maleta.svg" title="Emissor">
            Quando você clica no logotipo do emissor, o sistema abre um link
            para uma 'página da empresa' que exibe todas as medalhas emitidas
            por aquela instituição.
          </FeatureCard>
        </div>
      </div>
      <div className="divisoria4">
        <img
          className="iconSmall"
          alt="Divisoria Icon 1"
          src="/icons/home/shield4.svg"
        />
        <img
          className="iconLarge"
          alt="Divisoria Icon 2"
          src="/icons/home/shield4.svg"
        />
        <img
          className="iconSmall"
          alt="Divisoria Icon 3"
          src="/icons/home/shield4.svg"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
