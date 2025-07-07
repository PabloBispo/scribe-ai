# 🤖 Scribe AI - Widget Embedded

O Scribe AI é um assistente inteligente que ajuda usuários a preencher formulários de forma conversacional e natural.

## 🚀 Instalação Rápida

### Via CDN (Recomendado)

```html
<script src="https://cdn.jsdelivr.net/gh/PabloBispo/scribe-ai@master/public/scribe-ai.js" 
        data-form-id="meuFormulario"></script>
```

### Via Download

1. Baixe o arquivo `scribe-ai.js`
2. Adicione ao seu projeto
3. Inclua no HTML:

```html
<script src="scribe-ai.js" data-form-id="meuFormulario"></script>
```

## 📋 Como Usar

### Método 1: Data Attributes (Mais Simples)

```html
<form id="meuFormulario">
    <input type="text" id="nome" name="nome">
    <input type="email" id="email" name="email">
    <button type="submit">Enviar</button>
</form>

<script src="scribe-ai.js" 
        data-form-id="meuFormulario" 
        data-api-url="https://meu-site.com/api/chat"></script>
```

### Método 2: JavaScript (Mais Flexível)

```html
<form id="meuFormulario">
    <!-- seus campos aqui -->
</form>

<script src="scribe-ai.js"></script>
<script>
    ScribeAI.init({
        formId: 'meuFormulario',
        apiUrl: 'https://meu-site.com/api/chat',
        theme: 'default'
    });
</script>
```

## ⚙️ Configuração

### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `formId` | string | ✅ | ID do formulário a ser preenchido |
| `apiUrl` | string | ❌ | URL da API do Scribe AI (padrão: `/api/chat`) |
| `theme` | string | ❌ | Tema do widget (padrão: `default`) |

### Exemplo Completo

```javascript
ScribeAI.init({
    formId: 'formularioContato',
    apiUrl: 'https://api.meusite.com/scribe-ai/chat',
    theme: 'dark'
});
```

## 🎯 Funcionalidades

- ✅ **Preenchimento Automático**: Respostas são automaticamente inseridas nos campos
- ✅ **Progresso Visual**: Indicador de progresso "X de Y" campos
- ✅ **Conversação Natural**: Interface de chat amigável
- ✅ **Validação Inteligente**: AI analisa e valida respostas
- ✅ **Envio Integrado**: Botão de envio quando formulário completo
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Sem Dependências**: Não requer jQuery ou outras bibliotecas

## 🔧 API Necessária

O widget precisa de uma API que aceite POST requests com:

```json
{
  "prompt": "System prompt do Scribe AI",
  "context": {
    "formFields": [...],
    "currentFieldIndex": 0,
    "totalFields": 3
  },
  "userMessage": "Resposta do usuário"
}
```

E retorne:

```json
{
  "text": "Resposta do assistente"
}
```

## 🎨 Personalização

### CSS Customizado

O widget injeta automaticamente seus estilos. Para customizar:

```css
/* Sobrescrever estilos do widget */
.scribe-ai-widget {
    /* seus estilos aqui */
}

.scribe-ai-header {
    background: #sua-cor !important;
}
```

### Temas

```javascript
ScribeAI.init({
    formId: 'meuForm',
    theme: 'dark' // ou 'light', 'custom'
});
```

## 📱 Compatibilidade

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 🐛 Solução de Problemas

### Widget não aparece
- Verifique se o `formId` está correto
- Confirme se o formulário tem campos com `id` válidos
- Verifique o console para erros

### API não responde
- Confirme se a `apiUrl` está correta
- Verifique se a API está funcionando
- Teste com `curl` ou Postman

### Campos não são preenchidos
- Certifique-se que os campos têm `id` únicos
- Verifique se não há campos desabilitados
- Confirme que os tipos de campo são suportados

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: suporte@scribe-ai.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: [Documentação Completa](https://scribe-ai.com/docs)

---

**Scribe AI** - Transformando formulários em conversas! 🤖✨ 