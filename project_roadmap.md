Título do Projeto: Scribe AI: Assistente Inteligente de Formulários com Next.js
1. Visão Geral do Projeto

O objetivo é desenvolver um assistente de chat inteligente, batizado de Scribe AI, construído como um componente React dentro de uma aplicação Next.js. Este assistente será capaz de identificar campos de formulário em uma página web e guiar o usuário no preenchimento através de uma conversa em linguagem natural. A comunicação com a API de IA (Google Gemini) deve ser realizada de forma segura, sem expor chaves de API no código do cliente (frontend).

2. Requisitos Funcionais

Detecção de Formulário: Ao ser carregado, o componente de chat deve escanear o DOM da página para identificar todos os campos de formulário preenchíveis (input, textarea, select).

Início da Conversa:

Se nenhum campo for encontrado, o chat deve exibir uma mensagem informativa e permanecer inativo.

Se campos forem encontrados, o chat deve iniciar proativamente uma conversa, saudando o usuário e fazendo a primeira pergunta para preencher o primeiro campo.

Fluxo de Conversa: O assistente deve fazer uma pergunta por vez, aguardando a resposta do usuário antes de prosseguir para o próximo campo.

Preenchimento em Tempo Real: A resposta do usuário para cada pergunta deve ser usada para preencher o campo correspondente no formulário da página instantaneamente.

Finalização: Após o preenchimento de todos os campos, o chat deve exibir um botão "Enviar Formulário". Clicar neste botão deve acionar o evento de submit do formulário principal na página.

Interface do Chat: O chat deve ter uma interface clara, distinguindo entre mensagens do usuário e do assistente, e exibir um indicador de "digitando" enquanto aguarda a resposta da API.

3. Requisitos Técnicos e de Arquitetura

Framework: A aplicação deve ser construída com Next.js.

Linguagem: JavaScript/React.

API de IA: Google Gemini (modelo gemini-2.0-flash ou superior).

Proxy de API Seguro:

Deve ser criada uma API Route no Next.js no caminho pages/api/chat.js.

Esta API Route atuará como um proxy seguro. O frontend NUNCA deve chamar a API do Gemini diretamente.

A chave da API do Gemini (GEMINI_API_KEY) DEVE ser armazenada em um arquivo de variáveis de ambiente (.env.local) e acessada apenas no lado do servidor (dentro da API Route).

O endpoint deve aceitar requisições POST contendo um prompt no corpo da requisição.

O endpoint deve retornar a resposta de texto do Gemini em um objeto JSON (ex: { "text": "..." }).

Componentização (Frontend):

O assistente de chat deve ser encapsulado em um componente React reutilizável (<ChatWidget />).

Este componente será responsável por gerenciar todo o seu estado interno (mensagens, status de carregamento, etc.) usando hooks do React (useState, useEffect, useRef).

A interação com o DOM para encontrar e preencher os campos deve ocorrer dentro do useEffect para garantir que o componente seja montado antes da manipulação.

Gerenciamento de Estado: O estado da conversa (histórico de mensagens, campo atual, dados coletados) deve ser gerenciado dentro do componente ChatWidget.

4. Estrutura de Arquivos Sugerida

scribe-ai-next/
├── pages/
│   ├── api/
│   │   └── chat.js      # Backend: API Route segura para o Gemini
│   └── index.js         # Frontend: Página principal com formulário e <ChatWidget />
├── components/
│   └── ChatWidget.js    # (Opcional, mas recomendado) Componente React do Chat
├── public/
├── styles/
└── .env.local           # Arquivo SECRETO para a chave da API
└── package.json

5. Detalhes da Implementação

pages/api/chat.js (Backend):

Importar o SDK do Google (@google/generative-ai).

Ler a GEMINI_API_KEY de process.env.

Implementar a função handler que recebe req e res.

Validar se o método é POST e se o req.body.prompt existe.

Fazer a chamada para model.generateContent(prompt).

Retornar a resposta em res.status(200).json({ text: ... }).

Incluir tratamento de erros robusto.

Adicionar um comentário // TODO: para futura implementação de lógica de autenticação de usuário para seleção de chaves.

pages/index.js (Frontend):

Conter uma página de exemplo com um formulário HTML padrão com ids e labels claros.

Renderizar o componente <ChatWidget />.

Dentro do <ChatWidget />:

useEffect de inicialização: Usar document.querySelectorAll para encontrar os campos do formulário. Armazenar as informações (id, label, tipo) no estado. Se nenhum campo for encontrado, definir um estado para exibir a mensagem apropriada. Iniciar a conversa chamando a API (/api/chat) para a primeira pergunta.

Função handleSendMessage:

Adicionar a mensagem do usuário ao estado de mensagens.

Limpar o campo de input.

Definir o estado de isLoading para true.

Preencher o campo do formulário correspondente no DOM.

Avançar para o próximo campo. Se houver mais campos, construir o prompt para a próxima pergunta e fazer a chamada fetch para /api/chat.

Se não houver mais campos, atualizar a UI para mostrar o botão de "Enviar Formulário".

Renderização: Renderizar condicionalmente a conversa, o indicador de "digitando" e o botão final de "Enviar Formulário" com base no estado do componente.

6. Instruções de Configuração e Execução

Crie um novo projeto Next.js: npx create-next-app@latest scribe-ai-next

Instale a dependência do SDK do Google: npm install @google/generative-ai

Crie o arquivo .env.local na raiz do projeto.

Adicione sua chave de API ao arquivo .env.local: GEMINI_API_KEY=SUA_CHAVE_AQUI

Implemente os arquivos pages/api/chat.js e pages/index.js conforme as especificações.

Execute o servidor de desenvolvimento: npm run dev

Acesse http://localhost:3000 para testar a aplicação.