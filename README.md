# 🎨 AuthVault — Premium Frontend

[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)

Este é o frontend oficial de exemplo para o ecossistema **AuthVault**. Uma interface moderna, minimalista e de alta performance construída para demonstrar todo o poder da nossa API de autenticação.

---

## 🔗 Repositório da API (Backend)
Este frontend consome a API Core do AuthVault. Você precisará dela rodando para que a interface funcione:

👉 **[AuthVault-Backend](https://github.com/OJuanDev/AuthVault)**

---

## ✨ Funcionalidades

- **💎 Design Cyber-Premium:** Interface moderna com layout fluido, bento-box e tipografia avançada.
- **🔐 Fluxo de Autênticação:** Login e Cadastro com validação em tempo real.
- **🛰️ Dashboard de Identidade:** Painel centralizado para gestão da conta.
- **🖱️ Gestão de Sessões:** Visualize e revogue sessões em outros dispositivos remotamente.
- **🛡️ Log de Auditoria:** Histórico completo de eventos de segurança (logins, falhas, revogações).
- **🔑 Recuperação de Senha:** Fluxo completo de "Esqueci minha senha" com redefinição via token.
- **🌐 Social Auth Ready:** Suporte integrado para login via Google e GitHub.

---

## ⚙️ Como Rodar

Este projeto é construído totalmente com tecnologias web nativas (Vanilla), o que o torna extremamente leve e fácil de executar.

### 1. Pré-requisitos
Certifique-se de que o [AuthVault-Backend](https://github.com/OJuanDev/AuthVault) está rodando localmente na porta `3000`.

### 2. Execução
Você pode simplesmente abrir o arquivo `index.html` no seu navegador, ou usar uma extensão como o **Live Server** (VSCode) para uma experiência melhor.

```bash
# Se você tiver o utilitário 'serve' instalado:
npx serve .
```

---

## 🌐 Configuração de Login Social

O frontend detecta automaticamente se o Google ou GitHub estão configurados no seu backend.

1. Configure as chaves `GOOGLE_CLIENT_ID` e `GITHUB_CLIENT_ID` no arquivo `.env` do seu **Backend**.
2. Reinicie o servidor do backend.
3. O frontend habilitará as funções de login social automaticamente.

---

## 🛠️ Tecnologias

- **Linguagem:** JavaScript (ES6+)
- **Estilização:** CSS3 Moderno (Custom Properties, Flexbox, Grid)
- **Estrutura:** HTML5 Semântico
- **Ícones:** SVG Vetoriais
- **Fontes:** Plus Jakarta Sans & Outfit (via Google Fonts)

---

<p align="center">
  Desenvolvido com foco em UX e Segurança por <a href="https://github.com/OJuanDev">Juan</a>
</p>
