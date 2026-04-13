import Head from "next/head";
import Link from "next/link";
import { MessageCircle, QrCode, Shuffle } from "lucide-react";

const TOOLS = [
  {
    href: "/gerador-whatsapp",
    Icon: MessageCircle,
    name: "Link WhatsApp",
    description:
      "Crie links diretos para iniciar conversas no WhatsApp com mensagem personalizada, sem precisar salvar o contato.",
    accent: "#25D366",
    gradient: "linear-gradient(135deg, #25D366, #128C7E)",
  },
  {
    href: "/gerador-qrcode",
    Icon: QrCode,
    name: "Gerador de QR Code",
    description:
      "Gere QR Codes em lote a partir de múltiplas URLs. Exporte em PNG, SVG ou PDF e baixe tudo em um único .zip.",
    accent: "#34B7F1",
    gradient: "linear-gradient(135deg, #34B7F1, #1a6fa8)",
  },
  {
    href: "/roletada",
    Icon: Shuffle,
    name: "Roleta",
    description:
      "Roleta interativa para sorteios e dinâmicas em grupo. Com modo eliminação, cronômetro e persistência local.",
    accent: "#a855f7",
    gradient: "linear-gradient(135deg, #a855f7, #7c3aed)",
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <Head>
        <title>Pontin.dev TOOLS</title>
        <meta name="description" content="Ferramentas web simples, rápidas e gratuitas." />
      </Head>

      <section className="home-hero">
        <h1 className="home-hero-title">
          pontin.dev<span className="blinking">|</span> tools
        </h1>
        <p className="home-hero-sub">Ferramentas simples, rápidas e gratuitas.</p>
      </section>

      <section className="home-tools">
        {TOOLS.map(({ href, Icon, name, description, accent, gradient }) => (
          <Link
            key={href}
            href={href}
            className="tool-card"
            style={{ "--accent": accent }}
          >
            <span className="tool-card-icon">
              <Icon size={32} color={accent} strokeWidth={1.75} />
            </span>
            <h2 className="tool-card-name">{name}</h2>
            <p className="tool-card-desc">{description}</p>
            <span className="tool-card-cta" style={{ background: gradient }}>
              Usar ferramenta →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
