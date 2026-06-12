
# Portela Hub - Gestão Política Inteligente

![Portela Hub Screenshot](https://storage.googleapis.com/stitch-dev-images/projects/portela-hub-1721867123164/cover.png)

## 📖 Sobre o Projeto

O **Portela Hub** é um dashboard de gestão política moderno e responsivo, desenvolvido como um protótipo funcional de alta fidelidade. O objetivo da aplicação é centralizar e fornecer insights sobre a atuação parlamentar, cobrindo a gestão de municípios, o relacionamento com lideranças políticas e a coordenação da equipe de assessores.

Este projeto foi construído utilizando tecnologias de ponta do frontend, simulando uma arquitetura de aplicação real com uma camada de serviço que mimetiza o comportamento de uma API REST, incluindo latência e carregamento de dados assíncronos.

---

## ✨ Funcionalidades Implementadas

- **Dashboard Analítico:** Visão geral com KPIs (Indicadores-Chave de Desempenho) sobre lideranças, municípios, assessores e demandas.
- **Gestão de Municípios:** Tabela interativa para visualização e busca de todos os municípios, com dados de influência e status.
- **Detalhes do Município:** Página detalhada para cada município com informações demográficas, eleitorais, demandas ativas e lideranças locais.
- **Gestão de Lideranças:** Interface para gerenciar a base de contatos de líderes políticos, com filtros por município, partido e cargo.
- **Equipe de Assessores:** Visualização da equipe em formato de cards, exibindo as responsabilidades e métricas de cada assessor.
- **Agenda de Compromissos:** Calendário interativo para visualização de eventos e reuniões.
- **Configurações:** Painel para gerenciamento de perfil, notificações e tema da aplicação.
- **Modo Light/Dark:** Alternância de tema com persistência da preferência do usuário no `localStorage`.
- **Design Responsivo:** Interface adaptada para uma ótima experiência em diferentes tamanhos de tela.

---

## 🛠️ Tecnologias Utilizadas

- **React 19:** Biblioteca principal para a construção da interface de usuário.
- **TypeScript:** Superset do JavaScript para adicionar tipagem estática e robustez ao código.
- **Tailwind CSS:** Framework CSS utility-first para estilização rápida e consistente.
- **ES Modules Nativos (Import Maps):** Carregamento de dependências (React) diretamente no navegador via CDN (`esm.sh`), sem a necessidade de um bundler (Webpack, Vite) na fase de prototipagem.

---

## 🚀 Como Executar o Projeto

Como este projeto utiliza import maps e não possui um passo de build, executá-lo é muito simples. Você só precisa de um servidor web local para servir os arquivos estáticos.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU-USUARIO/portela-hub.git
    cd portela-hub
    ```

2.  **Inicie um servidor local:**
    A maneira mais fácil é usar o `serve`, um pacote `npm`. Se você não o tiver, pode executá-lo com o `npx`.

    ```bash
    npx serve
    ```

3.  **Abra no navegador:**
    O terminal mostrará um endereço local (geralmente `http://localhost:3000`). Abra-o no seu navegador para ver a aplicação funcionando.

---

## 🗺️ Próximos Passos (Roadmap)

Este protótipo é a base sólida para uma aplicação completa. O plano de evolução inclui:

-   **Fase 1: Backend e API (Em Andamento)**
    -   [ ] Desenvolver uma API REST (ex: com Node.js/Express).
    -   [ ] Configurar um banco de dados (ex: PostgreSQL).
    -   [ ] Substituir a camada de serviço (`services/api.ts`) por chamadas `fetch` reais.

-   **Fase 2: Autenticação**
    -   [ ] Implementar um sistema de login com JWT (JSON Web Tokens).
    -   [ ] Criar rotas protegidas e controle de acesso.

-   **Fase 3: Funcionalidades CRUD Completas**
    -   [ ] Desenvolver modais e formulários para criar, editar e deletar dados (Lideranças, Demandas, etc.).
    -   [ ] Conectar as ações do frontend com os endpoints da API.

-   **Fase 4: Otimizações**
    -   [ ] Adotar uma biblioteca de gerenciamento de estado de servidor, como o `React Query`, para otimizar o fetching e caching de dados.
    -   [ ] Implementar notificações de feedback para o usuário (ex: "Liderança criada com sucesso!").

