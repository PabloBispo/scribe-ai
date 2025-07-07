(function() {
  'use strict';

  // Scribe AI Widget - Standalone Version
  // Usage: <script src="https://cdn.jsdelivr.net/gh/PabloBispo/scribe-ai@master/public/scribe-ai.js"></script>
  // Then call: ScribeAI.init({ formId: 'myForm', apiUrl: 'https://your-api.com/api/chat' });

  window.ScribeAI = {
    init: function(config) {
      const { formId, apiUrl = '/api/chat', theme = 'default' } = config;
      
      if (!formId) {
        console.error('ScribeAI: formId is required');
        return;
      }

      // Create and inject CSS
      this.injectCSS();
      
      // Create widget
      this.createWidget(formId, apiUrl, theme);
    },

    injectCSS: function() {
      if (document.getElementById('scribe-ai-styles')) return;

      const css = `
        .scribe-ai-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          height: 500px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .scribe-ai-header {
          background: #007bff;
          color: white;
          padding: 15px;
          border-radius: 10px 10px 0 0;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .scribe-ai-progress {
          font-size: 12px;
          opacity: 0.9;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
        }

        .scribe-ai-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          max-height: 350px;
        }

        .scribe-ai-message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 8px;
          max-width: 80%;
          word-wrap: break-word;
        }

        .scribe-ai-message.assistant {
          background: #f1f1f1;
          margin-right: auto;
        }

        .scribe-ai-message.user {
          background: #007bff;
          color: white;
          margin-left: auto;
        }

        .scribe-ai-input {
          padding: 15px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
        }

        .scribe-ai-input input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
        }

        .scribe-ai-input input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .scribe-ai-input button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .scribe-ai-input button:hover:not(:disabled) {
          background: #0056b3;
        }

        .scribe-ai-input button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .scribe-ai-complete {
          padding: 15px;
          border-top: 1px solid #eee;
          text-align: center;
        }

        .scribe-ai-completion-message {
          color: #28a745;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .scribe-ai-submit-btn {
          width: 100%;
          padding: 12px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .scribe-ai-submit-btn:hover {
          background: #218838;
        }

        .scribe-ai-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9999;
        }

        .scribe-ai-widget.hidden {
          display: none;
        }
      `;

      const style = document.createElement('style');
      style.id = 'scribe-ai-styles';
      style.textContent = css;
      document.head.appendChild(style);
    },

    createWidget: function(formId, apiUrl, theme) {
      // Remove existing widget if any
      const existing = document.getElementById('scribe-ai-widget');
      if (existing) existing.remove();

      // Create toggle button
      const toggle = document.createElement('button');
      toggle.className = 'scribe-ai-toggle';
      toggle.innerHTML = '🤖';
      toggle.onclick = () => this.toggleWidget();
      document.body.appendChild(toggle);

      // Create widget container
      const widget = document.createElement('div');
      widget.id = 'scribe-ai-widget';
      widget.className = 'scribe-ai-widget hidden';
      document.body.appendChild(widget);

      // Initialize widget state
      this.state = {
        messages: [],
        isLoading: false,
        formFields: [],
        currentFieldIndex: 0,
        isFormComplete: false,
        userResponses: {},
        isVisible: false
      };

      // Initialize widget
      this.initWidget(formId, apiUrl);
    },

    initWidget: function(formId, apiUrl) {
      const form = document.getElementById(formId);
      if (!form) {
        console.error('ScribeAI: Form not found with id:', formId);
        return;
      }

      // Find form fields
      const fields = Array.from(form.querySelectorAll('input, textarea, select')).filter(field => {
        const type = field.type.toLowerCase();
        return field.id && !field.disabled && !field.readOnly && 
               type !== 'submit' && type !== 'button' && type !== 'reset' && 
               type !== 'hidden' && type !== 'image' && type !== 'file';
      }).map(field => ({
        id: field.id,
        name: field.name,
        label: field.labels && field.labels.length > 0 ? field.labels[0].innerText : field.id,
        type: field.type,
      }));

      if (fields.length === 0) {
        console.warn('ScribeAI: No fillable fields found in form');
        return;
      }

      this.state.formFields = fields;
      this.renderWidget();
      this.startConversation(apiUrl);
    },

    renderWidget: function() {
      const widget = document.getElementById('scribe-ai-widget');
      if (!widget) return;

      const { messages, isLoading, currentFieldIndex, formFields, isFormComplete } = this.state;

      widget.innerHTML = `
        <div class="scribe-ai-header">
          <div>Scribe AI Assistente</div>
          ${!isFormComplete ? `<div class="scribe-ai-progress">${currentFieldIndex + 1} de ${formFields.length}</div>` : ''}
        </div>
        <div class="scribe-ai-messages">
          ${messages.map(msg => `<div class="scribe-ai-message ${msg.sender}">${msg.text}</div>`).join('')}
          ${isLoading ? '<div class="scribe-ai-message assistant">Digitando...</div>' : ''}
        </div>
        ${!isFormComplete ? `
          <div class="scribe-ai-input">
            <input type="text" placeholder="Digite sua resposta..." ${isLoading ? 'disabled' : ''}>
            <button ${isLoading ? 'disabled' : ''}>
              ${isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        ` : `
          <div class="scribe-ai-complete">
            <div class="scribe-ai-completion-message">✅ Formulário preenchido com sucesso!</div>
            <button class="scribe-ai-submit-btn">📤 Enviar Formulário</button>
          </div>
        `}
      `;

      // Add event listeners
      this.addEventListeners();
    },

    addEventListeners: function() {
      const widget = document.getElementById('scribe-ai-widget');
      if (!widget) return;

      const input = widget.querySelector('input');
      const sendBtn = widget.querySelector('button');
      const submitBtn = widget.querySelector('.scribe-ai-submit-btn');

      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && e.target.value.trim() && !this.state.isLoading) {
            this.sendMessage(e.target.value.trim());
            e.target.value = '';
          }
        });
      }

      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          const input = widget.querySelector('input');
          if (input && input.value.trim() && !this.state.isLoading) {
            this.sendMessage(input.value.trim());
            input.value = '';
          }
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitForm());
      }
    },

    toggleWidget: function() {
      const widget = document.getElementById('scribe-ai-widget');
      if (!widget) return;

      this.state.isVisible = !this.state.isVisible;
      widget.classList.toggle('hidden', !this.state.isVisible);
    },

    startConversation: function(apiUrl) {
      const { formFields } = this.state;
      if (formFields.length === 0) return;

      const firstField = formFields[0];
      const systemPrompt = `Você é o Scribe AI, assistente para preenchimento de formulários.

TAREFA: Ajudar a preencher formulário com ${formFields.length} campos.

CAMPOS: ${formFields.map((field, index) => `${index + 1}. ${field.label}`).join(', ')}

REGRAS:
- Seja direto e amigável
- Uma pergunta por vez
- Se resposta incompleta, peça esclarecimento
- Se último campo completo, parabenize e mencione envio

INÍCIO: Pergunte sobre "${firstField.label}"`;

      this.callAPI(apiUrl, systemPrompt, null, null);
    },

    sendMessage: function(message) {
      if (!message.trim()) return;

      const { formFields, currentFieldIndex } = this.state;
      
      // Add user message
      this.state.messages.push({ sender: 'user', text: message });
      this.state.isLoading = true;
      this.renderWidget();

      const prompt = `Você é o Scribe AI, assistente para preenchimento de formulários.

TAREFA: Ajudar a preencher formulário com ${formFields.length} campos.

CAMPOS: ${formFields.map((field, index) => `${index + 1}. ${field.label}`).join(', ')}

REGRAS:
- Seja direto e amigável
- Uma pergunta por vez
- Se resposta incompleta, peça esclarecimento
- Se último campo completo, parabenize e mencione envio`;

      const context = {
        formFields: formFields,
        currentFieldIndex: currentFieldIndex,
        totalFields: formFields.length
      };

      this.callAPI('/api/chat', prompt, context, message);
    },

    callAPI: function(apiUrl, prompt, context, userMessage) {
      const payload = { prompt };
      if (context) payload.context = context;
      if (userMessage) payload.userMessage = userMessage;

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        this.state.isLoading = false;
        
        if (data.text) {
          this.state.messages.push({ sender: 'assistant', text: data.text });
          
          if (userMessage) {
            // Store response and fill form
            const currentField = this.state.formFields[this.state.currentFieldIndex];
            this.state.userResponses[currentField.id] = userMessage;
            this.fillFormField(currentField.id, userMessage);
            
            // Move to next field
            if (this.state.currentFieldIndex < this.state.formFields.length - 1) {
              this.state.currentFieldIndex++;
            } else {
              this.state.isFormComplete = true;
            }
          }
        } else {
          this.state.messages.push({ 
            sender: 'assistant', 
            text: 'Desculpe, ocorreu um erro ao processar sua resposta.' 
          });
        }
        
        this.renderWidget();
      })
      .catch(error => {
        console.error('ScribeAI API Error:', error);
        this.state.isLoading = false;
        this.state.messages.push({ 
          sender: 'assistant', 
          text: 'Desculpe, ocorreu um erro ao processar sua resposta.' 
        });
        this.renderWidget();
      });
    },

    fillFormField: function(fieldId, value) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },

    submitForm: function() {
      const form = document.getElementById(this.config?.formId);
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        const submitted = form.dispatchEvent(submitEvent);
        
        if (submitted) {
          form.submit();
        }
      }
    }
  };

  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function() {
    const script = document.currentScript || document.querySelector('script[src*="scribe-ai.js"]');
    if (script) {
      const formId = script.getAttribute('data-form-id');
      const apiUrl = script.getAttribute('data-api-url') || '/api/chat';
      
      if (formId) {
        ScribeAI.init({ formId, apiUrl });
      }
    }
  });

})(); 