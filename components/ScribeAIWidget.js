"use client";

import React, { useState, useEffect, useRef } from 'react';

const ScribeAIWidget = ({ formId, apiUrl = '/api/chat', theme = 'default' }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [userResponses, setUserResponses] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize widget when component mounts
  useEffect(() => {
    if (!isInitialized) {
      initializeWidget();
    }
  }, [isInitialized]);

  const initializeWidget = () => {
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

    setFormFields(fields);
    setIsInitialized(true);
    startConversation(fields);
  };

  const startConversation = (fields) => {
    const firstField = fields[0];
    const systemPrompt = `Você é o Scribe AI, assistente para preenchimento de formulários.

TAREFA: Ajudar a preencher formulário com ${fields.length} campos.

CAMPOS: ${fields.map((field, index) => `${index + 1}. ${field.label}`).join(', ')}

REGRAS:
- Seja direto e amigável
- Uma pergunta por vez
- Se resposta incompleta, peça esclarecimento
- Se último campo completo, parabenize e mencione envio

INÍCIO: Pergunte sobre "${firstField.label}"`;

    callAPI(systemPrompt, null, null);
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = { sender: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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

    await callAPI(prompt, context, message);
  };

  const callAPI = async (prompt, context, userMessage) => {
    const payload = { prompt };
    if (context) payload.context = context;
    if (userMessage) payload.userMessage = userMessage;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.text) {
        const assistantMessage = { sender: 'assistant', text: data.text };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (userMessage) {
          // Store response and fill form
          const currentField = formFields[currentFieldIndex];
          setUserResponses(prev => ({
            ...prev,
            [currentField.id]: userMessage
          }));
          
          fillFormField(currentField.id, userMessage);
          
          // Move to next field
          if (currentFieldIndex < formFields.length - 1) {
            setCurrentFieldIndex(prev => prev + 1);
          } else {
            setIsFormComplete(true);
          }
        }
      } else {
        setMessages(prev => [...prev, { 
          sender: 'assistant', 
          text: 'Desculpe, ocorreu um erro ao processar sua resposta.' 
        }]);
      }
    } catch (error) {
      console.error('ScribeAI API Error:', error);
      setMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: 'Desculpe, ocorreu um erro ao processar sua resposta.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fillFormField = (fieldId, value) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value;
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleFormSubmit = () => {
    const form = document.getElementById(formId);
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const submitted = form.dispatchEvent(submitEvent);
      
      if (submitted) {
        form.submit();
      }
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() && !isLoading) {
      sendMessage(e.target.value.trim());
      e.target.value = '';
    }
  };

  const handleSendClick = () => {
    if (inputRef.current && inputRef.current.value.trim() && !isLoading) {
      sendMessage(inputRef.current.value.trim());
      inputRef.current.value = '';
    }
  };

  const toggleWidget = () => {
    setIsVisible(!isVisible);
  };

  if (!isInitialized) {
    return null; // Don't render until initialized
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        className="scribe-ai-toggle"
        onClick={toggleWidget}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
        }}
      >
        🤖
      </button>

      {/* Widget */}
      {isVisible && (
        <div
          className="scribe-ai-widget"
          ref={chatContainerRef}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#007bff',
              color: 'white',
              padding: '15px',
              borderRadius: '10px 10px 0 0',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>Scribe AI Assistente</div>
            {!isFormComplete && (
              <div
                style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                }}
              >
                {currentFieldIndex + 1} de {formFields.length}
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              maxHeight: '350px',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                  background: msg.sender === 'assistant' ? '#f1f1f1' : '#007bff',
                  color: msg.sender === 'assistant' ? 'inherit' : 'white',
                  marginRight: msg.sender === 'assistant' ? 'auto' : '0',
                  marginLeft: msg.sender === 'user' ? 'auto' : '0',
                }}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  background: '#f1f1f1',
                  marginRight: 'auto',
                }}
              >
                Digitando...
              </div>
            )}
          </div>

          {/* Input or Complete */}
          {!isFormComplete ? (
            <div
              style={{
                padding: '15px',
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: '10px',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite sua resposta..."
                onKeyPress={handleInputKeyPress}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  fontSize: '14px',
                  background: isLoading ? '#f5f5f5' : 'white',
                  cursor: isLoading ? 'not-allowed' : 'text',
                }}
              />
              <button
                onClick={handleSendClick}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  background: isLoading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: '15px',
                borderTop: '1px solid #eee',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#28a745',
                  fontWeight: 600,
                  marginBottom: '10px',
                  fontSize: '14px',
                }}
              >
                ✅ Formulário preenchido com sucesso!
              </div>
              <button
                onClick={handleFormSubmit}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'background-color 0.2s',
                }}
              >
                📤 Enviar Formulário
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ScribeAIWidget; 