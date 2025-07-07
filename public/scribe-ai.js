(function() {
  'use strict';

  // Scribe AI Widget - Standalone Version
  // Usage: <script src="https://cdn.jsdelivr.net/gh/PabloBispo/scribe-ai@master/public/scribe-ai.js"></script>
  // Then call: ScribeAI.init({ formId: 'myForm', apiUrl: 'https://your-api.com/api/chat' });

  window.ScribeAI = {
    init: function(config = {}) {
      const { apiUrl = '/api/chat', theme = 'default', targetForm = null } = config;
      
      // Create and inject CSS
      this.injectCSS();
      
      // Find and create widgets for forms
      this.findAndCreateWidgets(apiUrl, theme, targetForm);
    },

    findAndCreateWidgets: function(apiUrl, theme, targetForm) {
      let forms = [];
      
      if (targetForm) {
        // If specific form is provided
        const form = typeof targetForm === 'string' ? document.getElementById(targetForm) : targetForm;
        if (form) forms = [form];
      } else {
        // Auto-detect forms
        forms = this.detectForms();
      }
      
      forms.forEach((form, index) => {
        this.createWidget(form, apiUrl, theme, index);
      });
    },

    detectForms: function() {
      const allForms = Array.from(document.querySelectorAll('form'));
      
      return allForms.filter(form => {
        const fields = this.getFormFields(form);
        return fields.length >= 2; // Only forms with at least 2 fillable fields
      });
    },

    getFormFields: function(form) {
      return Array.from(form.querySelectorAll('input, textarea, select')).filter(field => {
        const type = field.type.toLowerCase();
        return !field.disabled && !field.readOnly && 
               type !== 'submit' && type !== 'button' && type !== 'reset' && 
               type !== 'hidden' && type !== 'image' && type !== 'file';
      }).map(field => ({
        id: field.id || field.name || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: field.name,
        label: this.getFieldLabel(field),
        type: field.type,
        element: field
      }));
    },

    getFieldLabel: function(field) {
      // Try to find label by various methods
      if (field.labels && field.labels.length > 0) {
        return field.labels[0].innerText.trim();
      }
      
      // Look for label with for attribute
      if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) return label.innerText.trim();
      }
      
      // Look for placeholder
      if (field.placeholder) {
        return field.placeholder;
      }
      
      // Look for aria-label
      if (field.getAttribute('aria-label')) {
        return field.getAttribute('aria-label');
      }
      
      // Look for parent label
      const parentLabel = field.closest('label');
      if (parentLabel) {
        return parentLabel.innerText.replace(field.value, '').trim();
      }
      
      // Fallback to field name or id
      return field.name || field.id || 'Campo';
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

    createWidget: function(form, apiUrl, theme, index = 0) {
      const widgetId = `scribe-ai-widget-${index}`;
      const toggleId = `scribe-ai-toggle-${index}`;
      
      // Remove existing widget if any
      const existing = document.getElementById(widgetId);
      if (existing) existing.remove();
      
      const existingToggle = document.getElementById(toggleId);
      if (existingToggle) existingToggle.remove();

      // Create toggle button
      const toggle = document.createElement('button');
      toggle.id = toggleId;
      toggle.className = 'scribe-ai-toggle';
      toggle.innerHTML = '🤖';
      toggle.style.bottom = `${20 + (index * 80)}px`; // Stack multiple toggles
      toggle.onclick = () => this.toggleWidget(widgetId);
      document.body.appendChild(toggle);

      // Create widget container
      const widget = document.createElement('div');
      widget.id = widgetId;
      widget.className = 'scribe-ai-widget hidden';
      widget.style.bottom = `${20 + (index * 80)}px`; // Stack multiple widgets
      document.body.appendChild(widget);

      // Initialize widget state
      const state = {
        messages: [],
        isLoading: false,
        formFields: [],
        currentFieldIndex: 0,
        isFormComplete: false,
        userResponses: {},
        isVisible: false,
        form: form,
        widgetId: widgetId
      };
      
      // Store state in widget element
      widget._scribeState = state;

      // Initialize widget
      this.initWidget(form, apiUrl, widgetId);
    },

    initWidget: function(form, apiUrl, widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;

      // Find form fields
      const fields = this.getFormFields(form);

      if (fields.length === 0) {
        console.warn('ScribeAI: No fillable fields found in form');
        return;
      }

      state.formFields = fields;
      this.renderWidget(widgetId);
      this.startConversation(apiUrl, widgetId);
    },

    renderWidget: function(widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;

      const { messages, isLoading, currentFieldIndex, formFields, isFormComplete } = state;

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
      this.addEventListeners(widgetId);
    },

    addEventListeners: function(widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;

      const input = widget.querySelector('input');
      const sendBtn = widget.querySelector('button');
      const submitBtn = widget.querySelector('.scribe-ai-submit-btn');

      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && e.target.value.trim() && !state.isLoading) {
            this.sendMessage(e.target.value.trim(), widgetId);
            e.target.value = '';
          }
        });
      }

      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          const input = widget.querySelector('input');
          if (input && input.value.trim() && !state.isLoading) {
            this.sendMessage(input.value.trim(), widgetId);
            input.value = '';
          }
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitForm(widgetId));
      }
    },

    toggleWidget: function(widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;

      state.isVisible = !state.isVisible;
      widget.classList.toggle('hidden', !state.isVisible);
    },

    startConversation: function(apiUrl, widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;
      
      const { formFields } = state;
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

      this.callAPI(apiUrl, systemPrompt, null, null, widgetId);
    },

    sendMessage: function(message, widgetId) {
      if (!message.trim()) return;
      
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;

      const { formFields, currentFieldIndex } = state;
      
      // Add user message
      state.messages.push({ sender: 'user', text: message });
      state.isLoading = true;
      this.renderWidget(widgetId);

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

      this.callAPI('/api/chat', prompt, context, message, widgetId);
    },

    callAPI: function(apiUrl, prompt, context, userMessage, widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;
      
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
        state.isLoading = false;
        
        if (data.text) {
          state.messages.push({ sender: 'assistant', text: data.text });
          
          if (userMessage) {
            // Store response and fill form
            const currentField = state.formFields[state.currentFieldIndex];
            state.userResponses[currentField.id] = userMessage;
            this.fillFormField(currentField, userMessage);
            
            // Move to next field
            if (state.currentFieldIndex < state.formFields.length - 1) {
              state.currentFieldIndex++;
            } else {
              state.isFormComplete = true;
            }
          }
        } else {
          state.messages.push({ 
            sender: 'assistant', 
            text: 'Desculpe, ocorreu um erro ao processar sua resposta.' 
          });
        }
        
        this.renderWidget(widgetId);
      })
      .catch(error => {
        console.error('ScribeAI API Error:', error);
        state.isLoading = false;
        state.messages.push({ 
          sender: 'assistant', 
          text: 'Desculpe, ocorreu um erro ao processar sua resposta.' 
        });
        this.renderWidget(widgetId);
      });
    },

    fillFormField: function(fieldData, value) {
      const field = fieldData.element;
      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },

    submitForm: function(widgetId) {
      const widget = document.getElementById(widgetId);
      if (!widget) return;
      
      const state = widget._scribeState;
      if (!state) return;
      
      const form = state.form;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        const submitted = form.dispatchEvent(submitEvent);
        
        if (submitted) {
          form.submit();
        }
      }
    }
  };

  // Auto-initialize
  function initializeScribeAI() {
    const scripts = document.querySelectorAll('script[src*="scribe-ai.js"]');
    
    scripts.forEach(script => {
      const apiUrl = script.getAttribute('data-api-url') || '/api/chat';
      const formId = script.getAttribute('data-form-id'); // Optional specific form
      
      try {
        ScribeAI.init({ 
          apiUrl, 
          targetForm: formId || null // If no form specified, auto-detect all forms
        });
      } catch (error) {
        console.error('ScribeAI initialization error:', error);
      }
    });
  }

  // Try to initialize immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScribeAI);
  } else {
    // DOM is already ready, initialize immediately
    initializeScribeAI();
  }

})(); 