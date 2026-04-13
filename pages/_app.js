import "intl-tel-input/build/css/intlTelInput.css";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import "../styles/global.css";

const NAV_ITEMS = [
  { href: "/", label: "Link WhatsApp" },
  { href: "/gerador-qrcode", label: "QR Code" },
  { href: "/roletada", label: "Roleta" },
];

function App({ Component, pageProps }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  return (
    <div id="app">
      <Head>
        <title>Pontin.dev TOOLS</title>
        <meta name="description" content="Central de ferramentas Pontin.dev" />
      </Head>
      <section className="header">
        <a href="/" className="logo">
          pontin.dev<span className="blinking">|</span>
        </a>
        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${router.pathname === item.href ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className={`hamburger ${menuOpen ? "hamburger-open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </section>
      <Component {...pageProps} />
      <section className="footer">
        <div className="footer-info">
          <a href="/termos-de-uso">Termos de Uso</a>
          <a href="/politica-de-privacidade">Política de Privacidade</a>
        </div>
        <div className="copyright text-align-center" style={{ paddingBottom: "15px" }}>
          <p>
            © 2025 Pontin.dev TOOLS. Todos os direitos reservados.
            Desenvolvido por pontin.dev.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
