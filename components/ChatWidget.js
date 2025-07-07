"use client";

// components/ChatWidget.js
import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = ({ formId }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isChatActive, setIsChatActive] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [isFormComplete, setIsFormComplete] = useState(false);

  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Find form fields on mount
    const form = document.getElementById(formId);
    if (form) {
      const fields = Array.from(form.querySelectorAll('input, textarea, select')).filter(field => {
        // Basic filtering for prefillable fields
        const type = field.type.toLowerCase();
        return field.id && !field.disabled && !field.readOnly && type !== 'submit' && type !== 'button' && type !== 'reset' && type !== 'hidden' && type !== 'image' && type !== 'file';
      }).map(field => ({
        id: field.id,
        name: field.name,
        label: field.labels && field.labels.length > 0 ? field.labels[0].innerText : field.id, // Use label text if available, otherwise use ID
        type: field.type,
      }));

      if (fields.length > 0) {
        setFormFields(fields);
        setIsChatActive(true);
        console.log('Form fields found:', fields);

        // Initiate conversation with a comprehensive system prompt
        const initiateChat = async () => {
          setIsLoading(true);
          const firstField = fields[0];
          
          // Create a concise system prompt
          const systemPrompt = `Você é o Scribe AI, assistente para preenchimento de formulários.

TAREFA: Ajudar a preencher formulário com ${fields.length} campos.

CAMPOS: ${fields.map((field, index) => `${index + 1}. ${field.label}`).join(', ')}

REGRAS:
- Seja direto e amigável
- Uma pergunta por vez
- Se resposta incompleta, peça esclarecimento
- Se último campo completo, parabenize e mencione envio

INÍCIO: Pergunte sobre "${firstField.label}"`;

          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                prompt: systemPrompt,
                context: {
                  formFields: fields,
                  currentFieldIndex: 0,
                  totalFields: fields.length
                }
              }),
            });

            const data = await response.json();

            if (response.ok) {
              setMessages([{ sender: 'assistant', text: data.text }]);
            } else {
              console.error('Error from API:', data.error);
              setMessages([{ sender: 'assistant', text: 'Desculpe, ocorreu um erro ao iniciar o chat.' }]);
            }
          } catch (error) {
            console.error('Error fetching from API:', error);
            setMessages([{ sender: 'assistant', text: 'Desculpe, ocorreu um erro ao iniciar o chat.' }]);
          } finally {
            setIsLoading(false);
          }
        };

        initiateChat();

      } else {
        setIsChatActive(false);
        setMessages([{ sender: 'assistant', text: 'Não encontrei campos de formulário nesta página para preencher.' }]);
      }
    }
  }, [formId]); // Re-run if formId changes

  // Function to send message and handle conversation flow
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = { sender: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: `Você é o Scribe AI, assistente para preenchimento de formulários.

TAREFA: Ajudar a preencher formulário com ${formFields.length} campos.

CAMPOS: ${formFields.map((field, index) => `${index + 1}. ${field.label}`).join(', ')}

REGRAS:
- Seja direto e amigável
- Uma pergunta por vez
- Se resposta incompleta, peça esclarecimento
- Se último campo completo, parabenize e mencione envio`,
          context: {
            formFields: formFields,
            currentFieldIndex: currentFieldIndex,
            totalFields: formFields.length
          },
          userMessage: message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage = { sender: 'assistant', text: data.text };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Store user response and fill form field
        const currentField = formFields[currentFieldIndex];
        setUserResponses(prev => ({
          ...prev,
          [currentField.id]: message
        }));
        
        // Fill the form field with user's response
        fillFormField(currentField.id, message);
        
        // Move to next field if available
        if (currentFieldIndex < formFields.length - 1) {
          setCurrentFieldIndex(prev => prev + 1);
        } else {
          // All fields have been filled
          setIsFormComplete(true);
        }
      } else {
        console.error('Error from API:', data.error);
        setMessages(prev => [...prev, { sender: 'assistant', text: 'Desculpe, ocorreu um erro ao processar sua resposta.' }]);
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Desculpe, ocorreu um erro ao processar sua resposta.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fill form field with user response
  const fillFormField = (fieldId, value) => {
    const form = document.getElementById(formId);
    if (form) {
      const field = form.querySelector(`#${fieldId}`);
      if (field) {
        field.value = value;
        // Trigger change event to notify any listeners
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  // Function to handle form submission
  const handleFormSubmit = () => {
    const form = document.getElementById(formId);
    if (form) {
      // Create and dispatch submit event
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const submitted = form.dispatchEvent(submitEvent);
      
      if (submitted) {
        // If no preventDefault was called, submit the form
        form.submit();
      }
    }
  };

  // Function to handle user input with Enter key
  const handleUserInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      handleSendMessage(e.target.value.trim());
      e.target.value = '';
    }
  };

  return (
    <div className={`chat-widget ${isChatActive ? 'active' : 'inactive'}`} ref={chatContainerRef}>
      <div className="chat-header">
        <div>Scribe AI Assistente</div>
        {isChatActive && !isFormComplete && (
          <div className="progress-indicator">
            {currentFieldIndex + 1} de {formFields.length}
          </div>
        )}
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            Digitando...
          </div>
        )}
      </div>
      {isChatActive && !isFormComplete && (
        <div className="chat-input">
          <input 
            type="text" 
            placeholder="Digite sua resposta..." 
            onKeyPress={handleUserInput}
            disabled={isLoading}
          />
          <button 
            onClick={() => {
              const input = document.querySelector('.chat-input input');
              if (input && input.value.trim()) {
                handleSendMessage(input.value.trim());
                input.value = '';
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      )}
      
      {isFormComplete && (
        <div className="chat-complete">
          <div className="completion-message">
            ✅ Formulário preenchido com sucesso!
          </div>
          <button 
            className="submit-form-btn"
            onClick={handleFormSubmit}
          >
            📤 Enviar Formulário
          </button>
        </div>
      )}
      
      {!isChatActive && messages.length > 0 && (
        <div className="chat-footer">
          {messages[0].text}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
