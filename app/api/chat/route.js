import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: Implement user authentication logic for key selection if needed.

export async function POST(request) {
  try {
    const { prompt, context, userMessage } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured on the server.' }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create a more structured prompt with system instructions and context
    let fullPrompt = prompt;
    
    // If this is a user message (not the initial system prompt), add context
    if (userMessage && context) {
      const currentField = context.formFields[context.currentFieldIndex];
      const isLastField = context.currentFieldIndex === context.totalFields - 1;
      
      fullPrompt = `${prompt}

CONTEXTO: Campo ${context.currentFieldIndex + 1}/${context.totalFields}: ${currentField.label}
RESPOSTA: "${userMessage}"
ÚLTIMO: ${isLastField}

AÇÃO: Analise a resposta. Se válida, ${isLastField ? 'parabenize e mencione envio' : 'pergunte sobre o próximo campo'}. Se incompleta, peça esclarecimento.`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return new Response(JSON.stringify({ error: 'Failed to get response from AI.' }), { status: 500 });
  }
}
