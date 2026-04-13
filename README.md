# 🔗 Pontin.dev TOOLS

Uma coleção de ferramentas web modernas e performáticas para otimizar a comunicação e o dia a dia digital. Desenvolvido para ser uma solução rápida e confiável, o projeto já auxilia diversos usuários e profissionais.

**Acesse as ferramentas ao vivo:** [**tools.pontin.dev**](https://tools.pontin.dev/)

---

## 🧰 Ferramentas Disponíveis

### 🔗 Gerador de Links para WhatsApp
Crie links diretos de conversa para o WhatsApp com mensagem personalizada, sem precisar salvar o contato.

### 📷 Gerador de QR Code
Gere QR Codes em lote a partir de uma ou múltiplas URLs com suporte a exportação em diversos formatos.

### 🎡 Roleta
Roleta interativa e personalizável, ideal para sorteios, dinâmicas e decisões em grupo.

---

## ✨ Funcionalidades

### 🔗 Gerador de Links para WhatsApp
-   **Geração Instantânea:** Crie links de forma rápida e sem complicações.
-   **Mensagem Personalizada:** Adicione uma mensagem de saudação que será preenchida automaticamente quando o usuário clicar no link.
-   **Interface Limpa:** Design simples e intuitivo, focado na usabilidade.
-   **Responsivo:** Funciona perfeitamente em desktops e dispositivos móveis.

### 📷 Gerador de QR Code
-   **Geração em Lote:** Gere múltiplos QR Codes de uma só vez, colando várias URLs — uma por linha.
-   **Exportação em 3 Formatos:** Baixe os QR Codes em **PNG**, **SVG** ou **PDF**.
-   **Download em ZIP:** Baixe todos os QR Codes gerados em um único arquivo `.zip`, organizados por formato.
-   **Nomes Personalizados:** Defina o nome do arquivo de cada QR Code antes de baixar.
-   **Histórico Local:** Os últimos 20 QR Codes gerados ficam salvos no navegador para acesso rápido.
-   **Tema Claro/Escuro:** Alterne entre os temas e a preferência é salva automaticamente.

### 🎡 Roleta
-   **Itens Personalizáveis:** Adicione, edite ou remova as opções da roleta livremente.
-   **Modo Eliminação:** Ative para que cada item sorteado seja eliminado automaticamente, até restar apenas um.
-   **Cronômetro Integrado:** Um cronômetro embutido para usar junto com as dinâmicas da roleta.
-   **Persistência Local:** As opções e configurações ficam salvas no navegador entre sessões.
-   **Tema Claro/Escuro:** Suporte a temas com preferência salva.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com um stack de tecnologias modernas baseadas em JavaScript:

-   ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
-   ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
-   ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
-   ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Dependências adicionais:**
- `qrcode` — geração de QR Codes no servidor
- `jspdf` — exportação de QR Codes em PDF
- `jszip` — empacotamento de múltiplos arquivos em `.zip`
- `intl-tel-input` — seleção de código de país no gerador de links

---

## 🎈 Como Usar

### 🔗 Gerador de Links para WhatsApp

1.  **Acesse a página:** Abra o site [**tools.pontin.dev**](https://tools.pontin.dev/).
2.  **Digite o Número:** Insira o número de telefone completo, incluindo o código do país e o DDD (ex: `5511999998888`).
3.  **Digite a Mensagem (Opcional):** Escreva a mensagem que você deseja que apareça ao iniciar a conversa.
4.  **Clique em "Gerar Link":** O seu link personalizado aparecerá logo abaixo.
5.  **Copie e Use:** Agora é só copiar o link gerado e usá-lo onde quiser!

### 📷 Gerador de QR Code

1.  Cole uma ou mais URLs na área de texto — uma por linha.
2.  Personalize o nome de cada arquivo, se desejar.
3.  Clique em **"Gerar QR Codes"** (ou use `Ctrl+Enter`).
4.  Baixe individualmente em PNG, SVG ou PDF, ou use **"Baixar .zip"** para obter todos de uma vez.

### 🎡 Roleta

1.  Adicione as opções desejadas no painel lateral.
2.  Clique na roleta para girá-la e descobrir o resultado.
3.  Ative o **Modo Eliminação** para sorteios progressivos.
4.  Use o **Cronômetro** para controlar o tempo das dinâmicas.

---

## ⚙️ Como Funciona

A aplicação utiliza **Next.js** com **React** para gerenciar o estado de cada ferramenta de forma reativa. O Gerador de QR Code utiliza uma API interna (`/api/qrcode/batch`) para processar as URLs no servidor via a biblioteca `qrcode`, retornando as imagens em PNG e SVG para o cliente, que cuida da exportação em PDF e do empacotamento ZIP. A Roleta usa animações via Canvas e persistência via `localStorage` para manter as opções entre sessões.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
