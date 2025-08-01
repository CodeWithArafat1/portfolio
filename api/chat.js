    // File: api/chat.js

    require('dotenv').config();
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    // CORS Headers to allow requests from any origin
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Gemini Client Setup
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    export default async function handler(req, res) {
      // Handle CORS preflight requests for browsers
      if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders).end();
        return;
      }
      
      // Set CORS headers for the main request
      for (const key in corsHeaders) {
        res.setHeader(key, corsHeaders[key]);
      }

      // Ensure it's a POST request
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      try {
        const userMessage = req.body.message;
        const portfolioContext = req.body.context;

        const systemPrompt = `
            You are "Nill-Bot", a friendly AI assistant for Arafat Nill's portfolio.
            Your primary goal is to answer questions based on the provided portfolio context.
            **You must respond in Bengali (বাংলায় উত্তর দেবে).**
            Use the context below as your only source of truth.

            CONTEXT:
            ${portfolioContext}
        `;

        const chat = model.startChat({
            history: [
              { role: "user", parts: [{ text: systemPrompt }] },
              { role: "model", parts: [{ text: "আচ্ছা, আমি আরাফাত নিলের পোর্টফোলিও সম্পর্কে সাহায্য করার জন্য প্রস্তুত। আমাকে বাংলায় প্রশ্ন করুন।" }] },
            ],
        });
        
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();
        
        res.status(200).json({ reply: text });

      } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ reply: 'দুঃখিত, একটি সমস্যা হয়েছে।' });
      }
    }
    