// app/page.js
import ChatWidget from '../components/ChatWidget';
import React from 'react';

export default function Home() {
  return (
    <div className="container">
      <h1>Assistente de Formulários Scribe AI</h1>

      <form id="sampleForm">
        <div>
          <label htmlFor="name">Nome:</label>
          <input type="text" id="name" name="name" />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" />
        </div>

        <div>
          <label htmlFor="message">Mensagem:</label>
          <textarea id="message" name="message"></textarea>
        </div>

        {/* The submit button will be handled by the ChatWidget later */}
        {/* <button type="submit">Enviar Formulário Manualmente</button> */}
      </form>

      {/* Render the ChatWidget component here */}
       <ChatWidget formId="sampleForm" />

    </div>
  );
}
