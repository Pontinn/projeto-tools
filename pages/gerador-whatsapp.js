import React, { useEffect, useRef, useState } from "react";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import { useRouter } from "next/router";
import ThemeToggle from "../components/roleta/ThemeToggle";

const THEME_KEY = "whatsapp_theme";

let whatsappLink;
function Home() {
  const router = useRouter();
  const inputRef = useRef(null);
  const messageRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  let iti;

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (inputRef.current) {
      iti = intlTelInput(inputRef.current, {
        initialCountry: "br",
        loadUtils: () => import("intl-tel-input/build/js/utils"),
      });
    }

    return () => {
      if (iti) {
        iti.destroy();
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (iti) {
      const fullNumber = iti.getNumber();
      const encodedMessage = encodeURI(messageRef.current.value);
      whatsappLink = `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodedMessage}`;
      router.push({
        pathname: "/link-gerado",
        query: { link: whatsappLink },
      });
    }
  };

  return (
    <div className={`whatsapp-page ${theme}`}>
      <div className="main-div">
        <section id="home">
          <h1>GERADOR DE LINKS PARA WHATSAPP</h1>
          <div className="home-theme-toggle">
            <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} />
          </div>
        </section>
        {/* FORM */}
        <section id="form" className="container">
          <div className="form-div">
            <h3>
              Preencha os campos abaixo e <br />
              gere seu link personalizado!
            </h3>
            <form onSubmit={handleSubmit}>
              <input type="tel" id="phone" ref={inputRef} />
              <textarea
                id="message"
                placeholder="Digite sua mensagem"
                ref={messageRef}
              ></textarea>
              <button className="submit-button" type="submit">
                Gerar link
              </button>
              <p className="form-alert">
                <strong>Atenção:</strong> Este site não armazena nenhum dado
                inserido nos campos acima. O link gerado é temporário e será
                excluído após o uso.
              </p>
            </form>
          </div>
          {/* FORM TEXT */}
          <div className="form-text">
            <ul>
              <li className="listed-text">
                <strong>Vantagens ao gerar seu link personalizado:</strong>
              </li>
              <li className="listed-text">
                <strong>Facilidade e agilidade na comunicação:</strong> <br /> Com
                um link direto para o WhatsApp, os usuários podem iniciar uma
                conversa imediatamente, sem precisar salvar o número ou passar por
                múltiplos passos. Isso melhora a experiência do cliente e torna a
                comunicação mais rápida e fluida.
              </li>
              <li className="listed-text">
                <strong>Melhoria no marketing e no atendimento:</strong> <br />{" "}
                Empresas podem incluir o link em campanhas de marketing, e-mails,
                redes sociais, ou até mesmo em cartões de visita. Isso facilita o
                contato direto com potenciais clientes, agilizando o atendimento e
                aumentando as chances de conversões.
              </li>
              <li className="listed-text">
                <strong>Personalização e praticidade:</strong> <br /> O link
                gerado pode ser personalizado, como por exemplo, com uma mensagem
                inicial predefinida (ex: "Oi, estou interessado no seu produto").
                Isso otimiza a interação e garante que o usuário tenha uma
                experiência mais objetiva desde o primeiro contato.
              </li>
            </ul>
          </div>
        </section>
        {/* MESSAGE SUGGESTION */}
        <section className="message-indication container-column">
          <h1>
            <strong>
              Como iniciar uma mensagem no WhatsApp de forma eficaz?
            </strong>
          </h1>
          <p className="text-align-center">
            Uma saudação adequada é educada e objetiva, ajustando-se ao contexto
            da conversa. Em situações profissionais, opte por um tom mais formal e
            respeitoso. Já em interações pessoais, seja amigável e descontraído.
            Mencionar o nome do destinatário demonstra cuidado e torna a
            comunicação mais pessoal e receptiva.
          </p>
          <div className="example-display">
            <div className="example-box">
              <h3>Para atendimento profissional:</h3>
              <p>"Olá! Gostaria de mais informações sobre os seus serviços."</p>
              <p>
                "Olá! Poderia me informar sobre as opções disponíveis para
                [assunto]?"
              </p>
              <p>
                "Boa tarde! Gostaria de agendar um horário para discutir
                [assunto]."
              </p>
            </div>
            <div className="example-box">
              <h3>Para vendas ou suporte:</h3>
              <p>
                "Oi! Tenho interesse no produto/serviço e gostaria de saber mais
                detalhes."
              </p>
              <p>
                "Oi! Tenho uma dúvida sobre [produto/serviço]. Pode me ajudar?"
              </p>
              <p>
                "Olá! Gostaria de saber o preço e as condições para
                [produto/serviço]."
              </p>
            </div>
            <div className="example-box">
              <h3>Para contatos gerais:</h3>
              <p>
                "Olá! Estou entrando em contato através do seu WhatsApp. Podemos
                conversar?"
              </p>
              <p>
                "Oi! Encontrei seu número e gostaria de conversar sobre
                [assunto]."
              </p>
              <p>
                "Olá! Gostaria de falar com você sobre algo importante. Podemos
                conversar?"
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
export { whatsappLink };
export default Home;
